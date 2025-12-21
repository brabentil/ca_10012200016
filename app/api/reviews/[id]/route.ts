import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * DELETE /api/reviews/[id]
 * Delete review
 * Auth: Required (review owner or ADMIN)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      select: { id: true, role: true, isActive: true },
    });

    if (!user) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    if (!user.isActive) {
      return errorResponse("ACCOUNT_INACTIVE", "Account is inactive", 403);
    }

    // Validate review ID format
    if (!id || id.length < 20) {
      return errorResponse("INVALID_REVIEW_ID", "Invalid review ID format", 400);
    }

    // Fetch review to check ownership
    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        productId: true,
        rating: true,
      },
    });

    if (!review) {
      return errorResponse("REVIEW_NOT_FOUND", "Review not found", 404);
    }

    // Check authorization: User must be review owner or ADMIN
    if (review.userId !== decoded.userId && user.role !== "ADMIN") {
      return errorResponse(
        "FORBIDDEN",
        "You can only delete your own reviews",
        403
      );
    }

    // Delete the review
    await prisma.review.delete({
      where: { id },
    });

    // Recalculate product average rating after deletion
    const remainingReviews = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Note: The Product model doesn't have averageRating and reviewCount fields
    // This would require a schema update to store these values
    // The aggregated data is calculated but not persisted

    return successResponse(
      {
        message: "Review deleted successfully",
        productId: review.productId,
        remainingReviewsCount: remainingReviews._count.rating,
        newAverageRating: remainingReviews._avg.rating || 0,
      },
      "Review deleted successfully"
    );
  } catch (error: any) {
    console.error("Error deleting review:", error);

    if (error instanceof AppError) {
      return errorResponse("DELETE_REVIEW_ERROR", error.message, error.statusCode);
    }

    return errorResponse(
      "DELETE_REVIEW_ERROR",
      "An error occurred while deleting the review",
      500
    );
  }
}
