import { TelegramService } from '../services/telegram';
import { ApiError } from '../types';

const BASE_URL = '/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': TelegramService.initData,
      ...options.headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const error: ApiError = data || { detail: `Error ${response.status}` };
        // Attach status to error object for 402/403 handling
        (error as any).status = response.status;
        throw error;
      }

      return data as T;
    } catch (error) {
      // Re-throw to be handled by UI
      throw error;
    }
  }

  // 1. GET /api/me
  getMe() {
    return this.request<import('../types').User>('/me');
  }

  // 2. PATCH /api/me
  updateMe(data: { birth_date?: string; locale?: string }) {
    return this.request<import('../types').User>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 3. GET /api/products
  getProducts() {
    return this.request<import('../types').Product[]>('/products');
  }

  // 4. GET /api/entitlements
  getEntitlements() {
    return this.request<import('../types').EntitlementsResponse>('/entitlements');
  }

  // 5. POST /api/payments/create-invoice
  createInvoice(productCode: string) {
    return this.request<import('../types').InvoiceResponse>('/payments/create-invoice', {
      method: 'POST',
      body: JSON.stringify({ product_code: productCode }),
    });
  }

  // 6. POST /api/tarot
  getTarot(data: { question?: string; spread_type: 'daily' | '3cards' }) {
    return this.request<import('../types').TarotResponse>('/tarot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 7. POST /api/matrix
  getMatrix(data: { birth_date: string; full: boolean }) {
    return this.request<import('../types').MatrixResponse>('/matrix', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
