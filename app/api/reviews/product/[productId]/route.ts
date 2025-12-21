import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";

/**
 * GET /api/reviews/product/[productId]
 * Get product reviews with pagination
 * Auth: Optional
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    // Validate productId format
    if (!productId || typeof productId !== 'string') {
      return errorResponse(
        "INVALID_PRODUCT_ID",
        "Invalid product ID format",
        400
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true },
    });

    if (!product) {
      return errorResponse("PRODUCT_NOT_FOUND", "Product not found", 404);
    }

    // Get pagination parameters from query string
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return errorResponse(
        "INVALID_PAGINATION",
        "Invalid pagination parameters",
        400
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of reviews for this product
    const total = await prisma.review.count({
      where: { productId },
    });

    // Fetch reviews with user information
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Calculate average rating and rating distribution
    const ratingStats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    // Format reviews for response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        name: `${review.user.firstName} ${review.user.lastName}`,
      },
    }));

    // Calculate pagination metadata
    const pages = Math.ceil(total / limit);

    return paginatedResponse(formattedReviews, {
      total,
      page,
      limit,
      pages,
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);

    return errorResponse(
      "FETCH_REVIEWS_ERROR",
      "An error occurred while fetching reviews",
      500
    );
  }
}
