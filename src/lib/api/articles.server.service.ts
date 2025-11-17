import { prisma } from '../prisma';

export class EntitiesServerService {
  static async getById(id: number) {
    try {
      const entity = await prisma.entity.findUnique({
        where: { id },
        include: {
          category: true,
          tags: true
        }
      });

      if (!entity) {
        return {
          success: false,
          error: 'Entity not found'
        };
      }

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      console.error('Error fetching entity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch entity'
      };
    }
  }

  static async getAdminEntities(filters: {
    page?: number;
    limit?: number;
    scope?: string;
    search?: string;
    categories?: string;
    sort?: string;
  }) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Search filter
      if (filters.search) {
        where.name = {
          contains: filters.search,
          mode: 'insensitive'
        };
      }

      // Categories filter
      if (filters.categories) {
        const categoryIdentifiers = filters.categories.split('.');

        // Check if identifiers are numbers (IDs) or strings (names)
        const isNumeric = categoryIdentifiers.every((id) => !isNaN(Number(id)));

        if (isNumeric) {
          // Filter by category IDs
          where.categoryId = {
            in: categoryIdentifiers.map(Number)
          };
        } else {
          // Filter by category names
          where.category = {
            name: {
              in: categoryIdentifiers
            }
          };
        }
      }

      // Build orderBy clause
      let orderBy: any = { createdAt: 'desc' };
      if (filters.sort) {
        try {
          const sortParams = JSON.parse(filters.sort);
          if (Array.isArray(sortParams) && sortParams.length > 0) {
            const { id, desc } = sortParams[0];
            // Map column id to database field
            if (id === 'name') {
              orderBy = { name: desc ? 'desc' : 'asc' };
            } else if (id === 'category' || id === 'categories') {
              orderBy = { category: { name: desc ? 'desc' : 'asc' } };
            } else if (id === 'createdAt' || id === 'created_at') {
              orderBy = { createdAt: desc ? 'desc' : 'asc' };
            }
          }
        } catch (e) {
          // Invalid sort, use default
        }
      }

      // Execute queries
      const [entities, totalEntities] = await Promise.all([
        prisma.entity.findMany({
          where,
          include: {
            category: true,
            tags: true
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.entity.count({ where })
      ]);

      return {
        success: true,
        data: {
          entities,
          total_entities: totalEntities
        }
      };
    } catch (error: any) {
      console.error('Failed to fetch entities:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch entities',
        data: {
          entities: [],
          total_entities: 0
        }
      };
    }
  }
}
