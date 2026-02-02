import api from './api';

export const favoriteService = {
  // Obtener favoritos del usuario
  getAll: async () => {
    const response = await api.get('/favorites/index.php');
    return response.data;
  },

  // Agregar a favoritos
  add: async (productId) => {
    const response = await api.post('/favorites/index.php', {
      product_id: productId
    });
    return response.data;
  },

  // Eliminar de favoritos
  remove: async (productId) => {
    const response = await api.delete(`/favorites/index.php?product_id=${productId}`);
    return response.data;
  },

  // Verificar si un producto está en favoritos
  isFavorite: async (productId, favorites) => {
    return favorites.some(fav => fav.product_id == productId);
  }
};
