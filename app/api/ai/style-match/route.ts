import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import {
  generateImageEmbedding,
  cosineSimilarity,
  parseEmbedding,
} from "@/lib/ai/clip";
import { uploadToS3, deleteFromS3 } from "@/lib/aws/s3";
import { styleMatchSchema } from "@/lib/validation";

/**
 * POST /api/ai/style-match
 * Visual product search using CLIP embeddings
 * Auth: Optional
 */
export async function POST(req: NextRequest) {
  try {
    let imageUrl: string | null = null;
    let tempS3Key: string | null = null;

    // Check if request is multipart/form-data (file upload)
    const contentType = req.headers.get("content-type");
    
    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const imageFile = formData.get("image") as File | null;

      if (!imageFile) {
        return errorResponse("MISSING_IMAGE", "Image file is required", 400);
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(imageFile.type)) {
        return errorResponse(
          "INVALID_FILE_TYPE",
          "Invalid file type. Only JPG and PNG are allowed",
          400
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (imageFile.size > maxSize) {
        return errorResponse(
          "FILE_TOO_LARGE",
          "File size exceeds 10MB limit",
          400
        );
      }

      // Upload to temporary S3 location
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `temp-search-${Date.now()}.${imageFile.type.split("/")[1]}`;
      
      try {
        imageUrl = await uploadToS3(buffer, fileName, imageFile.type);
        tempS3Key = fileName;
      } catch (error) {
        console.error("Error uploading to S3:", error);
        return errorResponse(
          "UPLOAD_ERROR",
          "Failed to upload image",
          500
        );
      }
    } else {
      // Handle JSON body with imageUrl
      const body = await req.json();
      const validation = styleMatchSchema.safeParse(body);

      if (!validation.success) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Validation failed",
          400,
          validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }))
        );
      }

      imageUrl = validation.data.imageUrl || null;

      if (!imageUrl) {
        return errorResponse(
          "MISSING_IMAGE",
          "Either upload an image or provide imageUrl",
          400
        );
      }
    }

    if (!imageUrl) {
      return errorResponse("MISSING_IMAGE", "Image URL is required", 400);
    }

    // Generate embedding for the input image
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateImageEmbedding(imageUrl);
    } catch (error) {
      // Clean up temp file if it exists
      if (tempS3Key) {
        await deleteFromS3(tempS3Key).catch(console.error);
      }
      throw error;
    }

    // Fetch all product embeddings
    const productEmbeddings = await prisma.productEmbedding.findMany({
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    // Calculate similarity scores for each product
    const scoredProducts = productEmbeddings
      .filter((pe: any) => pe.product.isActive) // Only active products
      .map((pe: any) => {
        const productEmbedding = parseEmbedding(pe.embedding);
        const similarity = cosineSimilarity(queryEmbedding, productEmbedding);

        return {
          id: pe.product.id,
          title: pe.product.title,
          description: pe.product.description,
          category: pe.product.category,
          size: pe.product.size,
          color: pe.product.color,
          brand: pe.product.brand,
          condition: pe.product.condition,
          price: pe.product.price,
          stock: pe.product.stock,
          primaryImage:
            pe.product.images[0]?.imageUrl || null,
          similarityScore: similarity,
        };
      })
      .sort((a: any, b: any) => b.similarityScore - a.similarityScore) // Sort by similarity DESC
      .slice(0, 20); // Top 20 results

    // Delete temporary uploaded image
    if (tempS3Key && imageUrl) {
      await deleteFromS3(imageUrl).catch((error) => {
        console.error("Error deleting temp file:", error);
      });
    }

    return successResponse(
      {
        matches: scoredProducts,
        total: scoredProducts.length,
      },
      "Style matches found successfully"
    );
  } catch (error: any) {
    console.error("Error in style match:", error);
    
    if (error instanceof AppError) {
      return errorResponse("STYLE_MATCH_ERROR", error.message, error.statusCode);
    }

    return errorResponse(
      "STYLE_MATCH_ERROR",
      "An error occurred during style matching",
      500
    );
  }
}
