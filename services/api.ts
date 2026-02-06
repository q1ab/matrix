import { User, MatrixData, Product } from '../types';
import { tg } from './telegram';
import { API_BASE_URL } from '../constants';

// Mock Data Constants
const MOCK_USER: User = {
  id: 12345,
  username: 'DevUser',
  firstName: 'Developer',
  credits: 100,
  isPremium: false,
  onboardingComplete: false, // Will be overridden by local storage
  birthDate: undefined // Will be overridden
};

const MOCK_PRODUCTS: Product[] = [
  { id: '3_card_spread', title: 'Расклад 3 карты', price: 199, type: 'consumable', description: ['Прошлое, настоящее, будущее', 'Совет карт'] },
  { id: 'pro_spread', title: 'PRO-расклад 5–7 карт', price: 490, type: 'consumable', description: ['Глубокий анализ', 'Скрытые факторы'] },
  { id: 'matrix_mini', title: 'Матрица MINI', price: 690, type: 'one-time', description: ['Таланты', 'Карма'] },
  { id: 'matrix_pro', title: 'Матрица PRO (PDF)', price: 1290, type: 'one-time', description: ['Полная расшифровка', 'PDF отчет'], tag: 'Hit' },
  { id: 'sub_light', title: 'Daily Light', price: 349, type: 'subscription', description: ['Карта дня', 'Гороскоп'] },
  { id: 'sub_pro', title: 'Daily PRO', price: 699, type: 'subscription', description: ['Все функции', 'Личный оракул'] }
];

// Helper to validate if we have a valid Telegram auth string
const hasValidAuth = () => {
  return tg.initData && typeof tg.initData === 'string' && tg.initData.includes('hash=');
};

const request = async <T>(path: string, method: string = 'GET', body?: any): Promise<T> => {
  if (!hasValidAuth()) {
     throw new Error("No valid Telegram InitData (missing hash or empty)");
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': tg.initData, 
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Throw error to be caught by specific API methods
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return await response.json();
};

export const api = {
  getUser: async (): Promise<User> => {
    const localBirthDate = localStorage.getItem('user_birthdate');
    const localOnboarding = localStorage.getItem('onboarding_complete') === 'true';

    // Strictly check for valid auth to avoid 403 from backend
    if (!hasValidAuth()) {
        console.log("[Dev/Offline] Returning mock User");
        return {
             ...MOCK_USER,
             onboardingComplete: localOnboarding,
             birthDate: localBirthDate || '01.01.1990'
        };
    }

    try {
        const userData = await request<User>('/api/me');
        return {
          ...userData,
          onboardingComplete: localOnboarding,
          birthDate: userData.birthDate || localBirthDate || undefined
        };
    } catch (e: any) {
        // Suppress expected 403 errors in console
        if (!e.message?.includes('403')) {
            console.warn("getUser failed, using mock fallback", e);
        }
        return {
             ...MOCK_USER,
             firstName: tg.initDataUnsafe?.user?.first_name || 'User',
             username: tg.initDataUnsafe?.user?.username || 'user',
             onboardingComplete: localOnboarding,
             birthDate: localBirthDate || undefined
        };
    }
  },

  getProducts: async (): Promise<Product[]> => {
    if (!hasValidAuth()) return MOCK_PRODUCTS;

    try {
        return await request<Product[]>('/api/products');
    } catch (e) {
        console.warn("getProducts failed, using mock fallback");
        return MOCK_PRODUCTS;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    if (data.birthDate) localStorage.setItem('user_birthdate', data.birthDate);
    if (data.onboardingComplete) localStorage.setItem('onboarding_complete', 'true');
    
    // We try to sync with server, but don't block if it fails
    if (hasValidAuth()) {
        try {
            // await request('/api/me', 'PATCH', data);
        } catch (e) {
            console.warn("Sync profile failed (non-critical)");
        }
    }
    
    return api.getUser();
  },

  calculateMatrix: async (birthDate: string): Promise<MatrixData> => {
    // Local calculation logic (Fallback)
    const calculateLocal = (date: string) => {
        const sum = date.replace(/\D/g, '').split('').reduce((a, b) => a + parseInt(b), 0);
        return { 
            center: (sum % 22) + 1, 
            karma: ((sum + 5) % 22) + 1, 
            talent: ((sum + 10) % 22) + 1, 
            destiny: ((sum + 15) % 22) + 1, 
            money: ((sum + 20) % 22) + 1 
        };
    };

    if (!hasValidAuth()) return calculateLocal(birthDate);

    try {
        return await request<MatrixData>('/api/matrix', 'POST', { birthDate });
    } catch (e) {
        console.warn("calculateMatrix API failed, using local calc");
        return calculateLocal(birthDate);
    }
  },

  getTarotReading: async (question: string): Promise<{ result: string, cards?: any[] }> => {
     const mockResponse = {
         result: `[OFFLINE/DEMO] Энергии вокруг вашего вопроса "${question}" указывают на необходимость замедлиться. Карты подсказывают, что ответы находятся внутри вас. (Автоматический ответ: сервер недоступен или нет авторизации)`,
         cards: []
     };

     if (!hasValidAuth()) {
         await new Promise(resolve => setTimeout(resolve, 1500)); 
         return mockResponse;
     }

     try {
         return await request<{ result: string, cards?: any[] }>('/api/tarot', 'POST', { question });
     } catch (e: any) {
         if (!e.message?.includes('403')) {
            console.warn("getTarotReading API failed, using mock");
         }
         await new Promise(resolve => setTimeout(resolve, 1000));
         return mockResponse;
     }
  },

  createInvoice: async (productId: string): Promise<string> => {
    if (!hasValidAuth()) {
        return "https://t.me/invoice_example_link";
    }
    try {
        const response = await request<{ invoiceLink: string }>('/api/payments/create-invoice', 'POST', { productId });
        return response.invoiceLink;
    } catch (e) {
        console.error("createInvoice failed", e);
        throw e;
    }
  }
};
