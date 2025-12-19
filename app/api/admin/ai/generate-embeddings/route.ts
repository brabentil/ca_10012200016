import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import {
  generateImageEmbedding,
  serializeEmbedding,
} from "@/lib/ai/clip";

/**
 * POST /api/admin/ai/generate-embeddings
 * Generate CLIP embeddings for all products (Admin only)
 * Auth: Required (role: ADMIN)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authorization token required",
        401
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return errorResponse("INVALID_TOKEN", "Invalid or expired token", 401);
    }

    // Verify user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    if (user.role !== "ADMIN") {
      return errorResponse(
        "FORBIDDEN",
        "Access denied. Admin role required",
        403
      );
    }

    if (!user.isActive) {
      return errorResponse("ACCOUNT_INACTIVE", "Account is inactive", 403);
    }

    // Fetch all active products with their primary images
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    // Fetch embeddings separately
    const productIds = products.map((p) => p.id);
    const embeddings = await prisma.productEmbedding.findMany({
      where: { productId: { in: productIds } },
    });
    const embeddingMap = new Map(embeddings.map((e) => [e.productId, e]));

    if (products.length === 0) {
      return successResponse(
        {
          total: 0,
          processed: 0,
          created: 0,
          updated: 0,
          failed: 0,
          errors: [],
        },
        "No products to process"
      );
    }

    let processed = 0;
    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ productId: string; title: string; error: string }> = [];

    // Process each product
    for (const product of products) {
      try {
        // Skip if no primary image
        if (product.images.length === 0 || !product.images[0]?.imageUrl) {
          console.log(
            `Skipping product ${product.id} - no primary image`
          );
          failed++;
          errors.push({
            productId: product.id,
            title: product.title,
            error: "No primary image found",
          });
          continue;
        }

        const imageUrl = product.images[0].imageUrl;

        // Generate embedding
        console.log(
          `Generating embedding for product: ${product.id} - ${product.title}`
        );
        const embedding = await generateImageEmbedding(imageUrl);
        const embeddingString = serializeEmbedding(embedding);

        // Check if embedding already exists
        const existingEmbedding = embeddingMap.get(product.id);
        if (existingEmbedding) {
          // Update existing embedding
          await prisma.productEmbedding.update({
            where: { id: existingEmbedding.id },
            data: {
              embedding: embeddingString,
            },
          });
          updated++;
          console.log(`Updated embedding for product: ${product.id}`);
        } else {
          // Create new embedding
          await prisma.productEmbedding.create({
            data: {
              productId: product.id,
              embedding: embeddingString,
            },
          });
          created++;
          console.log(`Created embedding for product: ${product.id}`);
        }

        processed++;
      } catch (error: any) {
        console.error(
          `Error processing product ${product.id}:`,
          error.message
        );
        failed++;
        errors.push({
          productId: product.id,
          title: product.title,
          error: error.message || "Unknown error",
        });
      }
    }

    return successResponse(
      {
        total: products.length,
        processed,
        created,
        updated,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      },
      `Successfully processed ${processed} out of ${products.length} products`
    );
  } catch (error: any) {
    console.error("Error generating embeddings:", error);

    if (error instanceof AppError) {
      return errorResponse("GENERATION_ERROR", error.message, error.statusCode);
    }

    return errorResponse(
      "GENERATION_ERROR",
      "An error occurred while generating embeddings",
      500
    );
  }
}
