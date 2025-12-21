import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * GET /api/admin/analytics/overview
 * Dashboard overview with aggregate statistics
 * Auth: Required (role: ADMIN)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication from cookie
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

    // Get total orders count (only confirmed and completed orders)
    const totalOrders = await prisma.order.count({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
    });

    // Get total revenue (sum of all completed orders)
    const revenueData = await prisma.order.aggregate({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get total active products count
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true,
      },
    });

    // Get orders by status breakdown
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Get recent orders (last 7 days, confirmed and completed only)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
    });

    // Get new users (last 7 days)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get pending deliveries
    const pendingDeliveries = await prisma.delivery.count({
      where: {
        status: {
          in: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"],
        },
      },
    });

    // Get total reviews
    const totalReviews = await prisma.review.count();

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    return successResponse(
      {
        overview: {
          totalOrders,
          totalRevenue: revenueData._sum.totalAmount || 0,
          totalUsers,
          totalProducts,
          totalReviews,
        },
        recentActivity: {
          ordersLast7Days: recentOrders,
          newUsersLast7Days: newUsers,
        },
        ordersByStatus: ordersByStatus.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        usersByRole: usersByRole.map((item) => ({
          role: item.role,
          count: item._count.role,
        })),
        deliveries: {
          pending: pendingDeliveries,
        },
      },
      "Analytics overview retrieved successfully"
    );
  } catch (error: any) {
    console.error("Error fetching analytics overview:", error);

    if (error instanceof AppError) {
      return errorResponse(
        "ANALYTICS_ERROR",
        error.message,
        error.statusCode
      );
    }

    return errorResponse(
      "ANALYTICS_ERROR",
      "An error occurred while fetching analytics",
      500
    );
  }
}
