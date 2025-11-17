import api from '../axios';
import { toast } from 'sonner';

export const TagsService = {
  getAll: async (filters?: { [key: string]: any }) => {
    try {
      const response = await api.get('/tags', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      toast.error('Failed to fetch tags.');
      throw error;
    }
  },

  create: async (data: { name: string }) => {
    try {
      const response = await api.post('/tags', data);
      toast.success('Tag created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create tag.');
      throw new Error('Failed to create tag.');
    }
  },

  getTagById: async (id: number) => {
    try {
      const response = await api.get(`/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch tag.');
      throw new Error('Failed to fetch tag.');
    }
  },

  delete: async (id: number) => {
    try {
      await api.delete(`/tags/${id}`);
      toast.success('Tag deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete tag.');
      throw new Error('Failed to delete tag.');
    }
  },

  update: async (id: number, data: { name: string }) => {
    try {
      const response = await api.patch(`/tags/${id}`, data);
      toast.success('Tag updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update tag.');
      throw new Error('Failed to update tag.');
    }
  }
};
