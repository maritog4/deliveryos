import api from './api';

export const orderService = {
  create: async (orderData) => {
    const response = await api.post('/orders/create.php', orderData);
    return response.data;
  },

  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/orders/read.php?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/read.php?id=${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/update-status.php?id=${id}`, { status });
    return response.data;
  },

  assignDriver: async (id, driverId) => {
    const response = await api.put(`/orders/assign-driver.php?id=${id}`, { driver_id: driverId });
    return response.data;
  },

  getZones: async () => {
    const response = await api.get('/orders/zones.php');
    return response.data;
  },
};
