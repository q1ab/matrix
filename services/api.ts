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
  onboardingComplete: false, 
  birthDate: undefined 
};

const MOCK_PRODUCTS: Product[] = [
  { id: '3_card_spread', title: 'Расклад 3 карты', price: 199, type: 'consumable', description: ['Прошлое, настоящее, будущее', 'Совет карт'] },
  { id: 'pro_spread', title: 'PRO-расклад 5–7 карт', price: 490, type: 'consumable', description: ['Глубокий анализ', 'Скрытые факторы'] },
  { id: 'matrix_mini', title: 'Матрица MINI', price: 690, type: 'one-time', description: ['Таланты', 'Карма'] },
  { id: 'matrix_pro', title: 'Матрица PRO (PDF)', price: 1290, type: 'one-time', description: ['Полная расшифровка', 'PDF отчет'], tag: 'Hit' },
  { id: 'sub_light', title: 'Daily Light', price: 349, type: 'subscription', description: ['Карта дня', 'Гороскоп'] },
  { id: 'sub_pro', title: 'Daily PRO', price: 699, type: 'subscription', description: ['Все функции', 'Личный оракул'] }
];

// --- Helpers & Mappers ---

const hasValidAuth = () => {
  return tg.initData && typeof tg.initData === 'string' && tg.initData.includes('hash=');
};

const isoToDDMMYYYY = (iso?: string | null): string | undefined => {
  if (!iso) return undefined;
  // iso: "1990-01-01"
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return undefined;
  return `${d}.${m}.${y}`;
};

const ddmmyyyyToISO = (dmy: string): string => {
  // "01.01.1990" -> "1990-01-01"
  const parts = dmy.split('.');
  if (parts.length !== 3) throw new Error('Invalid date format, expected DD.MM.YYYY');
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

// API Types (Backend Contracts)
type ApiMe = {
  id: number;
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  birth_date?: string | null; // ISO
  can_use_daily_card: boolean;
};

type ApiProduct = {
  code: string;
  title: string;
  description: string;
  price_stars: number;
  is_subscription: boolean;
  subscription_period_days?: number | null;
  tag?: string | null;
};

type ApiTarotResponse = { cards: string[]; result_text: string };
type ApiMatrixResponse = { summary: string; data: Record<string, any> };

const mapUserFromApi = (me: ApiMe, local: { onboardingComplete: boolean }): User => ({
  id: me.id,
  username: me.username ?? undefined,
  firstName: me.first_name ?? undefined,
  birthDate: isoToDDMMYYYY(me.birth_date),
  credits: 0,        // Placeholder: Backend doesn't support credits yet
  isPremium: false,  // Placeholder: Backend doesn't support premium status yet
  onboardingComplete: local.onboardingComplete,
});

const mapProductFromApi = (p: ApiProduct): Product => {
  const type: Product['type'] = p.is_subscription ? 'subscription' : 'one-time';
  return {
    id: p.code,
    title: p.title,
    description: p.description ? [p.description] : [], // Backend sends string, UI needs array
    price: p.price_stars,
    tag: p.tag ?? undefined,
    type,
  };
};

const request = async <T>(path: string, method: string = 'GET', body?: any): Promise<T> => {
  if (!hasValidAuth()) {
     throw new Error("No valid Telegram InitData");
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
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return await response.json();
};

export const api = {
  getUser: async (): Promise<User> => {
    const localBirthDate = localStorage.getItem('user_birthdate') || undefined;
    const localOnboarding = localStorage.getItem('onboarding_complete') === 'true';

    if (!hasValidAuth()) {
      return {
        ...MOCK_USER,
        onboardingComplete: localOnboarding,
        birthDate: localBirthDate,
      };
    }

    try {
      const me = await request<ApiMe>('/api/me');
      const user = mapUserFromApi(me, { onboardingComplete: localOnboarding });
      
      // If server doesn't have birthdate but local storage does, use local
      return {
        ...user,
        birthDate: user.birthDate ?? localBirthDate
      };
    } catch (e: any) {
      if (!e.message?.includes('403')) {
          console.warn("getUser failed (network/server), using mock fallback", e);
      }
      return {
        ...MOCK_USER,
        firstName: tg.initDataUnsafe?.user?.first_name || 'User',
        username: tg.initDataUnsafe?.user?.username || 'user',
        onboardingComplete: localOnboarding,
        birthDate: localBirthDate,
      };
    }
  },

  getProducts: async (): Promise<Product[]> => {
    if (!hasValidAuth()) return MOCK_PRODUCTS;

    try {
      const items = await request<ApiProduct[]>('/api/products');
      return items.map(mapProductFromApi);
    } catch {
      console.warn("getProducts failed, using mock fallback");
      return MOCK_PRODUCTS;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    if (data.birthDate) localStorage.setItem('user_birthdate', data.birthDate);
    if (data.onboardingComplete) localStorage.setItem('onboarding_complete', 'true');
    
    // Note: The backend endpoint /api/me is mostly read-only or doesn't accept PATCH in this version.
    // We rely on local persistence and assume the next getUser might eventually sync if implemented.
    return api.getUser();
  },

  calculateMatrix: async (birthDate: string): Promise<MatrixData> => {
    // Fallback logic
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
      const iso = ddmmyyyyToISO(birthDate);
      const res = await request<ApiMatrixResponse>('/api/matrix', 'POST', {
        birth_date: iso,
        full: false,
      });

      const d = res.data;
      if (!d) throw new Error("No data in matrix response");

      // Backend returns 'main_arcana' etc, Frontend expects 'center' etc.
      // We map broadly to ensure UI doesn't crash.
      return {
          center: d.main_arcana || d.center || 1,
          karma: d.karma || 1,
          talent: d.talent || 1,
          destiny: d.destiny || 1, 
          money: d.money || 1      
      };
    } catch (e) {
      console.warn("calculateMatrix API failed, using local calc", e);
      return calculateLocal(birthDate);
    }
  },

  getTarotReading: async (question: string): Promise<{ result: string, cards?: any[] }> => {
     const mockResponse = {
         result: `[OFFLINE/DEMO] Энергии вокруг вашего вопроса "${question}" указывают на необходимость замедлиться.`,
         cards: []
     };

     if (!hasValidAuth()) {
         await new Promise(resolve => setTimeout(resolve, 1500)); 
         return mockResponse;
     }

     try {
         const res = await request<ApiTarotResponse>('/api/tarot', 'POST', { 
             question,
             spread_type: '3cards'
         });
         return { result: res.result_text, cards: res.cards };
     } catch (e) {
         console.warn("getTarotReading failed", e);
         await new Promise(resolve => setTimeout(resolve, 1000));
         return mockResponse;
     }
  },

  createInvoice: async (productId: string): Promise<string> => {
    if (!hasValidAuth()) {
        return "https://t.me/invoice_example_link";
    }
    
    // Fix: Send 'product_code' (backend expectation) instead of 'productId'
    const response = await request<{ invoice_link: string }>('/api/payments/create-invoice', 'POST', { 
        product_code: productId 
    });
    
    // Fix: Read 'invoice_link' from response
    return response.invoice_link;
  }
};
