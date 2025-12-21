import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validation";
import { AppError } from "@/lib/errors";

/**
 * POST /api/reviews
 * Create product review
 * Auth: Required
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authorization token required",
        401
      );
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return errorResponse("INVALID_TOKEN", "Invalid or expired token", 401);
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true },
    });

    if (!user) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    if (!user.isActive) {
      return errorResponse("ACCOUNT_INACTIVE", "Account is inactive", 403);
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createReviewSchema.safeParse(body);

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

    const { productId, rating, comment } = validation.data;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true, title: true },
    });

    if (!product) {
      return errorResponse("PRODUCT_NOT_FOUND", "Product not found", 404);
    }

    if (!product.isActive) {
      return errorResponse(
        "PRODUCT_INACTIVE",
        "Cannot review inactive product",
        400
      );
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          userId: decoded.userId,
          status: "DELIVERED", // Only allow reviews for delivered orders
        },
      },
    });

    if (!hasPurchased) {
      return errorResponse(
        "PURCHASE_REQUIRED",
        "You can only review products you have purchased",
        403
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: productId,
          userId: decoded.userId,
        },
      },
    });

    if (existingReview) {
      return errorResponse(
        "REVIEW_EXISTS",
        "You have already reviewed this product",
        400
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: decoded.userId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Calculate and update product average rating
    const ratings = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Note: The Product model doesn't have averageRating and reviewCount fields
    // This would require a schema update to store these values
    // For now, we'll just create the review without updating product aggregates

    return successResponse(
      {
        id: review.id,
        productId: review.productId,
        productTitle: review.product.title,
        userId: review.userId,
        userName: `${review.user.firstName} ${review.user.lastName}`,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
      "Review created successfully",
      201
    );
  } catch (error: any) {
    console.error("Error creating review:", error);

    if (error instanceof AppError) {
      return errorResponse("REVIEW_ERROR", error.message, error.statusCode);
    }

    return errorResponse(
      "REVIEW_ERROR",
      "An error occurred while creating the review",
      500
    );
  }
}
