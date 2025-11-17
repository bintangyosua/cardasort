import { toast } from 'sonner';
import api from '../axios';

export const articlesService = {
  getArticles: async ({
    page = 1,
    limit = 10,
    search,
    category,
    sort
  }: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
  }) => {
    const response = await api.get('/entities', {
      params: {
        page,
        limit,
        search,
        category,
        sort
      }
    });
    return response.data;
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`/entities/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch entity');
      throw error;
    }
  },

  create: async (data: {
    name: string;
    categoryId: number;
    imageUrl: string;
    tags: number[];
  }) => {
    try {
      const response = await api.post('/entities', data);
      toast.success('Entity created successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to create entity');
      throw error;
    }
  },

  update: async (
    id: number,
    data: {
      name?: string;
      categoryId?: number;
      imageUrl?: string;
      tags?: number[];
    }
  ) => {
    try {
      const response = await api.patch(`/entities/${id}`, data);
      toast.success('Entity updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update entity');
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      await api.delete(`/entities/${id}`);
      toast.success('Entity deleted successfully');
    } catch (error) {
      toast.error('Failed to delete entity');
      throw error;
    }
  }
};
