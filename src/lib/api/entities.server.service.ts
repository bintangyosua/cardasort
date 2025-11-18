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

  static async getEntitiesByIds(ids: number[]) {
    try {
      const entities = await prisma.entity.findMany({
        where: {
          id: {
            in: ids
          }
        },
        include: {
          category: true,
          tags: true
        }
      });

      return {
        success: true,
        data: entities
      };
    } catch (error) {
      console.error('Error fetching entities by IDs:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch entities',
        data: []
      };
    }
  }

  static async getAdminEntities(filters: {
    page?: number;
    limit?: number;
    scope?: string;
    search?: string;
    category?: string;
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

      // Category filter
      if (filters.category) {
        const categoryIdentifiers = filters.category.split('.');

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
            } else if (id === 'category') {
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

  static async createEntity(data: {
    name: string;
    categoryId: number;
    imageUrl?: string;
    tags?: number[];
  }) {
    try {
      const entity = await prisma.entity.create({
        data: {
          name: data.name,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          tags: data.tags
            ? {
                connect: data.tags.map((id) => ({ id }))
              }
            : undefined
        },
        include: {
          category: true,
          tags: true
        }
      });

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      console.error('Error creating entity:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create entity'
      };
    }
  }

  static async updateEntity(
    id: number,
    data: {
      name?: string;
      categoryId?: number;
      imageUrl?: string;
      tags?: number[];
    }
  ) {
    try {
      // Build update data
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

      if (data.tags !== undefined) {
        updateData.tags = {
          set: data.tags.map((id) => ({ id }))
        };
      }

      const entity = await prisma.entity.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          tags: true
        }
      });

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      console.error('Error updating entity:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update entity'
      };
    }
  }

  static async deleteEntity(id: number) {
    try {
      await prisma.entity.delete({
        where: { id }
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting entity:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete entity'
      };
    }
  }
}
