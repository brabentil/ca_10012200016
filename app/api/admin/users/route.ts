import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * GET /api/admin/users
 * List all users with filters and pagination
 * Auth: Required (role: ADMIN)
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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const roleFilter = searchParams.get("role");
    const verificationStatusFilter = searchParams.get("verificationStatus");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return errorResponse(
        "INVALID_PAGINATION",
        "Invalid pagination parameters. Page must be >= 1, limit must be 1-100",
        400
      );
    }

    // Validate role filter
    if (roleFilter && !["STUDENT", "ADMIN", "RIDER"].includes(roleFilter)) {
      return errorResponse(
        "INVALID_ROLE_FILTER",
        "role must be one of: STUDENT, ADMIN, RIDER",
        400
      );
    }

    // Validate verification status filter
    if (
      verificationStatusFilter &&
      !["PENDING", "VERIFIED", "REJECTED"].includes(verificationStatusFilter)
    ) {
      return errorResponse(
        "INVALID_VERIFICATION_STATUS",
        "verificationStatus must be one of: PENDING, VERIFIED, REJECTED",
        400
      );
    }

    // Build where clause for filters
    const whereClause: any = {};

    if (roleFilter) {
      whereClause.role = roleFilter;
    }

    if (verificationStatusFilter) {
      whereClause.studentVerification = {
        status: verificationStatusFilter,
      };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count with filters
    const total = await prisma.user.count({
      where: whereClause,
    });

    // Fetch users with filters and pagination
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        studentVerification: {
          select: {
            eduEmail: true,
            studentId: true,
            campus: true,
            status: true,
            verifiedAt: true,
          },
        },
        campusRider: {
          select: {
            id: true,
            isAvailable: true,
            totalDeliveries: true,
            rating: true,
            zone: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format users for response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      verification: user.studentVerification
        ? {
            eduEmail: user.studentVerification.eduEmail,
            studentId: user.studentVerification.studentId,
            campus: user.studentVerification.campus,
            status: user.studentVerification.status,
            verifiedAt: user.studentVerification.verifiedAt,
          }
        : null,
      riderInfo: user.campusRider
        ? {
            id: user.campusRider.id,
            isAvailable: user.campusRider.isAvailable,
            totalDeliveries: user.campusRider.totalDeliveries,
            rating: user.campusRider.rating,
            zone: {
              code: user.campusRider.zone.code,
              name: user.campusRider.zone.name,
            },
          }
        : null,
      stats: {
        totalOrders: user._count.orders,
        totalReviews: user._count.reviews,
        wishlistItems: user._count.wishlist,
      },
    }));

    // Calculate pagination metadata
    const pages = Math.ceil(total / limit);

    return paginatedResponse(formattedUsers, {
      total,
      page,
      limit,
      pages,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);

    if (error instanceof AppError) {
      return errorResponse("USERS_ERROR", error.message, error.statusCode);
    }

    return errorResponse(
      "USERS_ERROR",
      "An error occurred while fetching users",
      500
    );
  }
}
