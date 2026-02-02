import api from './api';

export const addressService = {
  // Obtener direcciones del usuario
  getAddresses: async () => {
    try {
      // Añadir timestamp único para evitar caché
      const timestamp = Date.now();
      const response = await api.get(`/addresses/read.php?v=${timestamp}`);
      return response.data;
    } catch (error) {
      // SIEMPRE devolver success, nunca lanzar error
      return { success: true, data: [] };
    }
  },

  // Crear nueva dirección
  create: async (addressData) => {
    const response = await api.post('/addresses/create.php', addressData);
    return response.data;
  },

  // Eliminar dirección
  delete: async (addressId) => {
    const response = await api.delete(`/addresses/delete.php?id=${addressId}`);
    return response.data;
  },

  // Marcar como dirección principal
  setDefault: async (addressId) => {
    const response = await api.post('/addresses/set-default.php', { id: addressId });
    return response.data;
  }
};
