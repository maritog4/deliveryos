import api from './api';

export const couponService = {
  // Validar cupón
  validate: async (code, orderAmount) => {
    try {
      const response = await api.post('/coupons/validate.php', {
        code,
        order_amount: orderAmount
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }
};
