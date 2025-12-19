import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { addToWishlistSchema } from "@/lib/validation";
import { AppError } from "@/lib/errors";

/**
 * POST /api/wishlist
 * Add product to wishlist
 * Auth: Required
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
    const validation = addToWishlistSchema.safeParse(body);

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

    const { productId } = validation.data;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        isActive: true, 
        title: true,
        price: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true }
        }
      },
    });

    if (!product) {
      return errorResponse("PRODUCT_NOT_FOUND", "Product not found", 404);
    }

    if (!product.isActive) {
      return errorResponse(
        "PRODUCT_INACTIVE",
        "Cannot add inactive product to wishlist",
        400
      );
    }

    // Check if product is already in wishlist
    const existingWishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: decoded.userId,
          productId: productId,
        },
      },
    });

    if (existingWishlistItem) {
      return errorResponse(
        "ALREADY_IN_WISHLIST",
        "Product is already in your wishlist",
        400
      );
    }

    // Create wishlist item
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: decoded.userId,
        productId: productId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
            condition: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { imageUrl: true }
            }
          }
        }
      }
    });

    return successResponse(
      {
        id: wishlistItem.id,
        productId: wishlistItem.product.id,
        productTitle: wishlistItem.product.title,
        productPrice: wishlistItem.product.price,
        productCategory: wishlistItem.product.category,
        productCondition: wishlistItem.product.condition,
        productImage: wishlistItem.product.images[0]?.imageUrl || null,
        createdAt: wishlistItem.createdAt,
      },
      "Product added to wishlist successfully",
      201
    );
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);

    if (error instanceof AppError) {
      return errorResponse("WISHLIST_ERROR", error.message, error.statusCode);
    }

    return errorResponse(
      "WISHLIST_ERROR",
      "An error occurred while adding to wishlist",
      500
    );
  }
}

/**
 * GET /api/wishlist
 * Get user's wishlist
 * Auth: Required
 */
export async function GET(req: NextRequest) {
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

    // Fetch user's wishlist with product details
    const wishlist = await prisma.wishlist.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
            size: true,
            color: true,
            brand: true,
            condition: true,
            stock: true,
            isActive: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format wishlist items for response
    const formattedWishlist = wishlist.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productTitle: item.product.title,
      productDescription: item.product.description,
      productPrice: item.product.price,
      productCategory: item.product.category,
      productSize: item.product.size,
      productColor: item.product.color,
      productBrand: item.product.brand,
      productCondition: item.product.condition,
      productStock: item.product.stock,
      productIsActive: item.product.isActive,
      productImage: item.product.images[0]?.imageUrl || null,
      addedAt: item.createdAt,
    }));

    return successResponse(
      {
        items: formattedWishlist,
        total: formattedWishlist.length,
      },
      "Wishlist retrieved successfully"
    );
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);

    if (error instanceof AppError) {
      return errorResponse("WISHLIST_ERROR", error.message, error.statusCode);
    }

    return errorResponse(
      "WISHLIST_ERROR",
      "An error occurred while fetching wishlist",
      500
    );
  }
}
