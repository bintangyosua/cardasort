import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/entities/check-name?name=xxx&excludeId=123
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const excludeId = searchParams.get('excludeId');

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const where: any = {
      name: {
        equals: name,
        mode: 'insensitive'
      }
    };

    // Exclude current entity when editing
    if (excludeId) {
      where.id = {
        not: parseInt(excludeId)
      };
    }

    const existingEntity = await prisma.entity.findFirst({
      where
    });

    return NextResponse.json({
      success: true,
      available: !existingEntity,
      exists: !!existingEntity
    });
  } catch (error) {
    console.error('Error checking entity name:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check name availability' },
      { status: 500 }
    );
  }
}
