import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from './apiClient';

// NOTE: preserved as-is from the original file — this service uses raw axios
// calls + a headers object instead of the shared instance, and (like the
// original) does not redirect on 401. Flagging in case that was unintentional.

export const adminWithdrawalApi = {
  /**
   * Get all withdrawal requests with filtering
   */
  getWithdrawals: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/withdrawals`, {
        ...getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get detailed view of a specific withdrawal request
   */
  getWithdrawal: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/withdrawals/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching withdrawal details:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Approve a withdrawal request
   */
  approveWithdrawal: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/withdrawals/${id}/approve`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Mark withdrawal as disbursed
   */
  disburseWithdrawal: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/withdrawals/${id}/disburse`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error disbursing withdrawal:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Reject a withdrawal request
   */
  rejectWithdrawal: async (id, rejectionReason) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/withdrawals/${id}/reject`,
        { rejection_reason: rejectionReason },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Export withdrawal data to CSV
   */
  exportWithdrawals: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/withdrawals/export`, {
        ...getAuthHeaders(),
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `withdrawals_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      console.error('Error exporting withdrawals:', error);
      throw error.response?.data || error;
    }
  }
};
