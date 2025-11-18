import { prisma } from '../prisma';

export class EntityCountService {
  /**
   * Count entities based on category and tags filter
   */
  static async countEntitiesByFilters(params: {
    categoryId?: number | null;
    tagNames?: string[];
  }): Promise<number> {
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

      const count = await prisma.entity.count({ where });
      return count;
    } catch (error) {
      console.error('Error counting entities:', error);
      return 0;
    }
  }
}
