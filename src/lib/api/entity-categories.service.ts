import api from '../axios';
import { toast } from 'sonner';

export const EntityCategoriesService = {
  getAll: async (filters?: { [key: string]: any }) => {
    try {
      const response = await api.get('/entity-categories', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      toast.error('Failed to fetch categories.');
      throw error;
    }
  },

  create: async (data: { name: string; label?: string }) => {
    try {
      const response = await api.post('/entity-categories', data);
      toast.success('Entity Category created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create entity category.');
      throw new Error('Failed to create entity category.');
    }
  },

  getEntityCategoryById: async (id: number) => {
    try {
      const response = await api.get(`/entity-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch entity category.');
      throw new Error('Failed to fetch entity category.');
    }
  },

  delete: async (id: number) => {
    try {
      await api.delete(`/entity-categories/${id}`);
      toast.success('Entity Category deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete entity category.');
      throw new Error('Failed to delete entity category.');
    }
  },

  update: async (id: number, data: { name: string; label?: string }) => {
    try {
      const response = await api.patch(`/entity-categories/${id}`, data);
      toast.success('Entity Category updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update entity category.');
      throw new Error('Failed to update entity category.');
    }
  }
};
