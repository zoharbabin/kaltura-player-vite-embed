import axios from 'axios';
import { KsResponse, ApiError } from '../types';
import { config } from '../utils/config';

/**
 * API client for interacting with the backend services
 */
const api = {
  /**
   * Fetches a Kaltura Session (KS) token from the backend
   * @param entryId Optional entry ID to request specific permissions
   * @returns Promise with the KS token
   */
  async getKs(entryId?: string): Promise<string> {
    try {
      const payload = entryId ? { entryId } : {};
      const response = await axios.post<KsResponse>(config.api.ksEndpoint, payload);
      return response.data.ks;
    } catch (error) {
      console.error('Failed to fetch KS token:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to fetch KS token');
      }
      throw new Error('Failed to fetch KS token');
    }
  }
};

export default api;