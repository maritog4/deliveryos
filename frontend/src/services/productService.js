import api from './api';

export const productService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/products/read.php?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/read.php?id=${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products/create.php', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/update.php?id=${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/delete.php?id=${id}`);
    return response.data;
  },

  toggleAvailability: async (id, available) => {
    const response = await api.put(`/products/toggle.php?id=${id}`, { available });
    return response.data;
  },
};

export const categoryService = {
  getAll: async (status = null) => {
    const url = status ? `/categories/read.php?status=${status}` : '/categories/read.php';
    const response = await api.get(url);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/categories/create.php', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/categories/update.php?id=${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/delete.php?id=${id}`);
    return response.data;
  },
};
