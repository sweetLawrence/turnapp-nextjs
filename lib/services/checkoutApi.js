"use client"

import axios from 'axios';
import { API_BASE_URL, createApiClient } from './apiClient';

const isBrowser = () => typeof window !== 'undefined';

// Checkout intentionally has NO auth-token attachment and NO 401 redirect
// (checkout can happen while logged out), scoped to /checkout baseURL.
const api = createApiClient({
  baseURL: `${API_BASE_URL}/checkout`,
  withAuth: false,
  handle401: false,
});

// Generate a clean alphanumeric order reference, e.g. TN-K8F2M9P3
const generateOrderRef = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let ref = 'TN-';
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
};

const getCartToken = () => {
  if (!isBrowser()) return null;
  let token = localStorage.getItem('cart_token');
  if (!token) {
    token = generateOrderRef();
    localStorage.setItem('cart_token', token);
  }
  return token;
};

export const checkoutApi = {
  async createCart() {
    try {
      const token = getCartToken();
      const response = await api.post('/cart', { cart_token: token });
      return response.data;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  },

  async getCart() {
    try {
      const token = getCartToken();
      const response = await api.get(`/cart/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  },

  async addItem(eventPriceId, quantity) {
    try {
      const token = getCartToken();
      const response = await api.post('/cart/items', {
        cart_token: token,
        event_price_id: eventPriceId,
        quantity: quantity,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  async removeItem(eventPriceId) {
    try {
      const token = getCartToken();
      const response = await api.delete(`/cart/items/${eventPriceId}`, {
        data: { cart_token: token }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  },

  async validateCart() {
    try {
      const token = getCartToken();
      const response = await api.post('/cart/validate', {
        cart_token: token
      });
      return response.data;
    } catch (error) {
      console.error('Error validating cart:', error);
      throw error;
    }
  },

  async applyPromoCode(promoCode, eventId) {
    try {
      const token = getCartToken();
      const response = await api.post('/promo-code/apply', {
        cart_token: token,
        promo_code: promoCode,
        event_id: eventId,
      });
      return response.data;
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw error;
    }
  },

  async removePromoCode() {
    try {
      const token = getCartToken();
      const response = await api.delete(`/promo-code/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error removing promo code:', error);
      throw error;
    }
  },

  async initializeCheckout(customerData, ticketDetails = []) {
    try {
      const token = getCartToken();
      const response = await api.post('/initialize', {
        cart_token: token,
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        ticket_details: ticketDetails,
      });
      return response.data;
    } catch (error) {
      console.error('Error initializing checkout:', error);
      throw error;
    }
  },

  async processPayment(paymentData) {
    try {
      const token = getCartToken();
      const response = await api.post('/payment', {
        cart_token: token,
        event_id: paymentData.eventId,
        customer_name: paymentData.customerName,
        customer_email: paymentData.customerEmail,
        customer_phone: paymentData.customerPhone,
        payment_method: paymentData.paymentMethod,
        phone_number: paymentData.phoneNumber,
        ticket_details: paymentData.ticketDetails || [],
        promo_code_id: paymentData.promoCodeId,
        accept_promotions: paymentData.acceptPromotions || false,
        affiliate_ref: paymentData.affiliate_ref || null,
      });
      console.log('processPayment success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      console.error('Error response data:', error.response?.data);

      if (error.response?.data) {
        return error.response.data;
      }

      throw error;
    }
  },

  async completeOrder(orderData) {
    try {
      const response = await api.post('/complete', {
        sale_id: orderData.saleId,
        transaction_id: orderData.transactionId,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        ticket_details: orderData.ticketDetails || [],
        promo_code_id: orderData.promoCodeId,
      });
      return response.data;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  },

  async verifyPayment(transactionId) {
    try {
      const response = await api.get(`/payment/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  async getOrder(saleId) {
    try {
      const response = await api.get(`/order/${saleId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  async checkManualPaymentStatus(reference) {
    try {
      const response = await axios.post(`${API_BASE_URL}/mpesa/check-c2b-payment-status`, {
        reference: reference
      });
      return response.data;
    } catch (error) {
      console.error('Error checking manual payment status:', error);
      throw error;
    }
  },

  clearCart() {
    if (isBrowser()) {
      localStorage.removeItem('cart_token');
    }
  },

  async clearCartItems() {
    try {
      const token = getCartToken();
      const response = await api.delete(`/cart/${token}/clear`);
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  getCartToken,

  async downloadTicket(ticketId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading ticket:', error);
      throw error;
    }
  },

  async downloadAllTickets(saleId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales/${saleId}/tickets/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading all tickets:', error);
      throw error;
    }
  },
};

export default checkoutApi;