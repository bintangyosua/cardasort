import { prisma } from '../prisma';

export class EntityFilterService {
  /**
   * Get entities for sorting based on filters
   */
  static async getEntitiesForSorting(params: {
    categoryId?: number | null;
    tagNames?: string[];
  }) {
    try {
      const where: any = {};

      // Filter by category if selected
      if (params.categoryId) {
        where.categoryId = params.categoryId;
      }

      // Filter by tags if any are selected
      if (params.tagNames && params.tagNames.length > 0) {
        where.tags = {
          some: {
            name: {
              in: params.tagNames
            }
          }
        };
      }

      const entities = await prisma.entity.findMany({
        where,
        select: {
          id: true,
          name: true,
          imageUrl: true,
          tags: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return {
        success: true,
        data: entities
      };
    } catch (error) {
      console.error('Error fetching entities for sorting:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch entities',
        data: []
      };
    }
  }
}
