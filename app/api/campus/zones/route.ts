import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, internalServerErrorResponse } from '@/lib/response';

/**
 * GET /api/campus/zones
 * Get campus zones by campus name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusName = searchParams.get('campus');

    if (!campusName) {
      return successResponse([]);
    }

    // Find campus by name
    const campus = await prisma.campus.findFirst({
      where: {
        name: {
          equals: campusName,
          mode: 'insensitive',
        },
      },
      include: {
        zones: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            deliveryFee: true,
          },
        },
      },
    });

    if (!campus) {
      return successResponse([]);
    }

    // Format zones for frontend
    const zones = campus.zones.map((zone) => ({
      id: zone.id,
      code: zone.code,
      name: zone.name,
      description: zone.description || undefined,
      deliveryFee: Number(zone.deliveryFee),
    }));

    return successResponse(zones);
  } catch (error) {
    console.error('Get campus zones error:', error);
    return internalServerErrorResponse('Failed to fetch campus zones');
  }
}
