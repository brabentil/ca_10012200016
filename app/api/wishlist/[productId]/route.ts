import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * DELETE /api/wishlist/[productId]
 * Remove product from wishlist
 * Auth: Required
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

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

    // Validate productId format
    if (!productId || productId.length < 20) {
      return errorResponse(
        "INVALID_PRODUCT_ID",
        "Invalid product ID format",
        400
      );
    }

    // Check if wishlist item exists
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: decoded.userId,
          productId: productId,
        },
      },
      select: {
        id: true,
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!wishlistItem) {
      return errorResponse(
        "WISHLIST_ITEM_NOT_FOUND",
        "Product not found in your wishlist",
        404
      );
    }

    // Delete wishlist item
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: decoded.userId,
          productId: productId,
        },
      },
    });

    return successResponse(
      {
        productId: wishlistItem.product.id,
        productTitle: wishlistItem.product.title,
      },
      "Product removed from wishlist successfully"
    );
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);

    if (error instanceof AppError) {
      return errorResponse(
        "WISHLIST_ERROR",
        error.message,
        error.statusCode
      );
    }

    return errorResponse(
      "WISHLIST_ERROR",
      "An error occurred while removing from wishlist",
      500
    );
  }
}
