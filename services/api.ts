import { User, MatrixData } from '../types';
import { API_BASE_URL } from '../constants';
import { tg } from './telegram';

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (tg.initData) {
    headers.set('X-Telegram-Init-Data', tg.initData);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API request failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<T>;
};

export const api = {
  getUser: async (): Promise<User> => {
    return request<User>('/user');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return request<User>('/user', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  calculateMatrix: async (birthDate: string): Promise<MatrixData> => {
    return request<MatrixData>('/matrix/calculate', {
      method: 'POST',
      body: JSON.stringify({ birthDate })
    });
  },

  createInvoice: async (productId: string): Promise<string> => {
    const result = await request<{ invoiceUrl: string }>('/payments/create-invoice', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    return result.invoiceUrl;
  }
};
