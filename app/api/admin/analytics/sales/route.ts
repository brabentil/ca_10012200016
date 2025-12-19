import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

/**
 * GET /api/admin/analytics/sales
 * Sales analytics with date range and grouping
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
    const dateFromStr = searchParams.get("dateFrom");
    const dateToStr = searchParams.get("dateTo");
    const groupBy = searchParams.get("groupBy") || "daily"; // daily, weekly, monthly

    // Validate groupBy parameter
    if (!["daily", "weekly", "monthly"].includes(groupBy)) {
      return errorResponse(
        "INVALID_GROUP_BY",
        "groupBy must be one of: daily, weekly, monthly",
        400
      );
    }

    // Set default date range (last 30 days)
    const dateTo = dateToStr ? new Date(dateToStr) : new Date();
    const dateFrom = dateFromStr
      ? new Date(dateFromStr)
      : new Date(new Date().setDate(dateTo.getDate() - 30));

    // Validate date range
    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      return errorResponse(
        "INVALID_DATE_RANGE",
        "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        400
      );
    }

    if (dateFrom > dateTo) {
      return errorResponse(
        "INVALID_DATE_RANGE",
        "dateFrom must be before dateTo",
        400
      );
    }

    // Fetch orders within date range (only completed orders)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay(dateFrom),
          lte: endOfDay(dateTo),
        },
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group sales data based on groupBy parameter
    const salesData: Record<string, { date: string; totalSales: number; orderCount: number }> = {};

    orders.forEach((order) => {
      let key: string;

      if (groupBy === "daily") {
        key = format(order.createdAt, "yyyy-MM-dd");
      } else if (groupBy === "weekly") {
        const weekStart = startOfWeek(order.createdAt, { weekStartsOn: 1 }); // Monday as first day
        key = format(weekStart, "yyyy-MM-dd");
      } else {
        // monthly
        key = format(order.createdAt, "yyyy-MM");
      }

      if (!salesData[key]) {
        salesData[key] = {
          date: key,
          totalSales: 0,
          orderCount: 0,
        };
      }

      salesData[key].totalSales += Number(order.totalAmount);
      salesData[key].orderCount += 1;
    });

    // Convert to array and sort by date
    const salesArray = Object.values(salesData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Calculate summary statistics
    const totalSales = salesArray.reduce((sum, item) => sum + item.totalSales, 0);
    const totalOrderCount = salesArray.reduce((sum, item) => sum + item.orderCount, 0);
    const averageSales = totalOrderCount > 0 ? totalSales / totalOrderCount : 0;

    // Get top selling products in date range
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: {
            gte: startOfDay(dateFrom),
            lte: endOfDay(dateTo),
          },
          status: {
            in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
      },
      _sum: {
        quantity: true,
        priceAtPurchase: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    // Fetch product details for top products
    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
      },
    });

    const topProductsWithDetails = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productTitle: product?.title || "Unknown",
        productCategory: product?.category || "Unknown",
        quantitySold: item._sum.quantity || 0,
        totalRevenue: item._sum.priceAtPurchase || 0,
      };
    });

    return successResponse(
      {
        dateRange: {
          from: format(dateFrom, "yyyy-MM-dd"),
          to: format(dateTo, "yyyy-MM-dd"),
          groupBy,
        },
        summary: {
          totalSales,
          totalOrders: totalOrderCount,
          averageOrderValue: averageSales,
        },
        salesData: salesArray,
        topProducts: topProductsWithDetails,
      },
      "Sales analytics retrieved successfully"
    );
  } catch (error: any) {
    console.error("Error fetching sales analytics:", error);

    if (error instanceof AppError) {
      return errorResponse(
        "ANALYTICS_ERROR",
        error.message,
        error.statusCode
      );
    }

    return errorResponse(
      "ANALYTICS_ERROR",
      "An error occurred while fetching sales analytics",
      500
    );
  }
}
