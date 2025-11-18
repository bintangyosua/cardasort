import { EntityCountService } from '@/lib/api/entity-count.service';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/entities/count - Count entities based on filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const tagNames = searchParams.get('tagNames');

    const count = await EntityCountService.countEntitiesByFilters({
      categoryId: categoryId ? parseInt(categoryId) : null,
      tagNames: tagNames ? tagNames.split(',').filter(Boolean) : []
    });

    return NextResponse.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error counting entities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to count entities', count: 0 },
      { status: 500 }
    );
  }
}
