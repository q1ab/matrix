import { User, MatrixData, Product } from '../types';
import { tg } from './telegram';
import { API_BASE_URL } from '../constants';

const request = async <T>(path: string, method: string = 'GET', body?: any): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': tg.initData || '', // Pass Telegram InitData for authentication
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};

export const api = {
  getUser: async (): Promise<User> => {
    // If running locally without telegram context, return mock or throw
    if (!tg.initData) {
        console.warn("No initData found, returning mock user for development.");
        return {
             id: 12345,
             username: 'DevUser',
             firstName: 'Developer',
             credits: 10,
             isPremium: true,
             onboardingComplete: localStorage.getItem('onboarding_complete') === 'true',
             birthDate: localStorage.getItem('user_birthdate') || undefined
        };
    }

    const userData = await request<User>('/api/me');
    
    // Merge server data with local onboarding state
    return {
      ...userData,
      onboardingComplete: localStorage.getItem('onboarding_complete') === 'true',
      birthDate: userData.birthDate || localStorage.getItem('user_birthdate') || undefined
    };
  },

  getProducts: async (): Promise<Product[]> => {
    try {
        return await request<Product[]>('/api/products');
    } catch (e) {
        console.error("Failed to fetch products", e);
        return [];
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    // Since the API docs don't show a specific PATCH /me endpoint yet,
    // we persist critical client-side state to localStorage and return the current user.
    // In a full implementation, this might call POST /api/user/update
    
    if (data.birthDate) localStorage.setItem('user_birthdate', data.birthDate);
    if (data.onboardingComplete) localStorage.setItem('onboarding_complete', 'true');
    
    return api.getUser();
  },

  calculateMatrix: async (birthDate: string): Promise<MatrixData> => {
    return await request<MatrixData>('/api/matrix', 'POST', { birthDate });
  },

  getTarotReading: async (question: string): Promise<{ result: string, cards?: any[] }> => {
     return await request<{ result: string, cards?: any[] }>('/api/tarot', 'POST', { question });
  },

  createInvoice: async (productId: string): Promise<string> => {
    const response = await request<{ invoiceLink: string }>('/api/payments/create-invoice', 'POST', { productId });
    return response.invoiceLink;
  }
};
