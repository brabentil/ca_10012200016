import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * POST /api/deliveries/assign
 * Assign delivery to rider using zone-based algorithm
 * Auth: Internal (API key)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.INTERNAL_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return errorResponse('Order ID is required', 'MISSING_ORDER_ID', 400);
    }

    // Fetch order with campusZone
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    if (!order) {
      return errorResponse('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    // Check if delivery already exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { orderId: order.id },
    });

    if (existingDelivery) {
      return errorResponse('Delivery already assigned', 'DELIVERY_EXISTS', 400);
    }

    // Find the zone by code
    const zone = await prisma.campusZone.findFirst({
      where: { code: (order as any).campusZone },
      include: {
        campus: true,
      },
    });

    if (!zone) {
      return errorResponse(
        `Campus zone not found: ${(order as any).campusZone}`,
        'ZONE_NOT_FOUND',
        404
      );
    }

    // Step 1: Find available riders in the same zone
    let availableRiders = await prisma.campusRider.findMany({
      where: {
        zoneId: zone.id,
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        zone: true,
      },
      orderBy: {
        totalDeliveries: 'asc', // Sort by lowest workload first
      },
    });

    // Step 2: If no riders in same zone, find riders in adjacent zones
    if (availableRiders.length === 0) {
      const adjacentZones = await prisma.zoneAdjacency.findMany({
        where: {
          OR: [{ zoneId: zone.id }, { adjacentZoneId: zone.id }],
        },
        select: {
          zoneId: true,
          adjacentZoneId: true,
        },
      });

      const adjacentZoneIds = adjacentZones.flatMap((adj) =>
        adj.zoneId === zone.id ? [adj.adjacentZoneId] : [adj.zoneId]
      );

      if (adjacentZoneIds.length > 0) {
        availableRiders = await prisma.campusRider.findMany({
          where: {
            zoneId: { in: adjacentZoneIds },
            isAvailable: true,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            zone: true,
          },
          orderBy: {
            totalDeliveries: 'asc',
          },
        });
      }
    }

    if (availableRiders.length === 0) {
      return errorResponse(
        'No available riders found in zone or adjacent zones',
        'NO_RIDERS_AVAILABLE',
        404
      );
    }

    // Step 3: Assign to first rider (lowest totalDeliveries)
    const selectedRider = availableRiders[0];

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        riderId: selectedRider.id,
        zoneId: zone.id,
        status: 'ASSIGNED',
        deliveryAddress: (order as any).deliveryAddress,
        assignedAt: new Date(),
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
        rider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            zone: true,
          },
        },
      },
    });

    // Step 4: Increment rider's totalDeliveries
    await prisma.campusRider.update({
      where: { id: selectedRider.id },
      data: {
        totalDeliveries: { increment: 1 },
      },
    });

    // TODO: Send notification to rider (email/SMS/push)
    console.log(
      `Delivery assigned to rider ${selectedRider.user.firstName} ${selectedRider.user.lastName} for order ${order.orderNumber}`
    );

    return successResponse(
      {
        id: delivery.id,
        orderId: delivery.orderId,
        orderNumber: delivery.order.orderNumber,
        status: delivery.status,
        deliveryAddress: delivery.deliveryAddress,
        rider: delivery.rider ? {
          id: delivery.rider.id,
          name: `${delivery.rider.user.firstName} ${delivery.rider.user.lastName}`,
          email: delivery.rider.user.email,
          phone: delivery.rider.user.phone,
          zone: {
            id: delivery.rider.zone.id,
            code: delivery.rider.zone.code,
            name: delivery.rider.zone.name,
          },
        } : null,
        assignedAt: delivery.createdAt,
      },
      'Delivery assigned successfully'
    );
  } catch (error) {
    console.error('Assign delivery error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to assign delivery',
      'DELIVERY_ASSIGNMENT_ERROR',
      500
    );
  }
}
