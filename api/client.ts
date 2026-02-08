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

    // --- DEV MODE MOCKING ---
    // If no Telegram Init Data is present, assume we are in dev mode (browser)
    if (!TelegramService.initData) {
      console.warn(`[DEV] Mocking request: ${endpoint}`, options);
      await new Promise(r => setTimeout(r, 800)); // Simulate network latency
      return this.getMockData(endpoint, options) as any;
    }
    // ------------------------

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

  // Mock Data Generator for Dev Mode
  private getMockData(endpoint: string, options: RequestInit) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};

    if (endpoint === '/me') {
      if (method === 'PATCH') {
        return {
          id: 1, 
          telegram_id: 123456, 
          username: 'dev_wizard', 
          first_name: 'Developer', 
          birth_date: body.birth_date || '1995-05-25', 
          locale: 'ru', 
          can_use_daily_card: true
        };
      }
      return { 
        id: 1, 
        telegram_id: 123456, 
        username: 'dev_wizard', 
        first_name: 'Developer', 
        birth_date: '1995-05-25', // Set to null to test Onboarding
        locale: 'ru', 
        can_use_daily_card: true 
      };
    }

    if (endpoint === '/products') {
      return [
        { code: 'TAROT_3', title: 'Расклад Таро', description: 'Глубокий анализ 3 карт', price_stars: 199, is_subscription: false, subscription_period_days: null, tag: 'Популярно' },
        { code: 'MATRIX_MINI', title: 'Матрица Lite', description: 'Базовый расчет энергий', price_stars: 690, is_subscription: false, subscription_period_days: null },
        { code: 'MATRIX_PRO', title: 'Матрица PRO', description: 'Полная расшифровка + PDF', price_stars: 1290, is_subscription: false, subscription_period_days: null, tag: 'Хит' },
        { code: 'NATAL_LITE', title: 'Разбор Натальной Карты', description: 'Отношения, Деньги, Тени', price_stars: 490, is_subscription: false, subscription_period_days: null, tag: 'New' },
        { code: 'NATAL_PRO', title: 'Натальная Карта PRO', description: 'PDF отчет + Прогноз на год', price_stars: 1290, is_subscription: false, subscription_period_days: null },
        { code: 'SUB_PRO', title: 'Подписка PRO', description: '30 дней безлимита', price_stars: 699, is_subscription: true, subscription_period_days: 30 },
      ];
    }

    if (endpoint === '/entitlements') {
      return { items: [] }; // Return empty items to test 'Buy' flows
    }

    if (endpoint === '/tarot') {
       if (body.spread_type === 'daily') {
         return { cards: ['Колесо Фортуны'], result_text: 'Сегодня удача на вашей стороне. Все изменения будут к лучшему.' };
       }
       return { 
         cards: ['Маг', 'Верховная Жрица', 'Императрица'], 
         result_text: 'Мок-ответ: \n1. Маг: У вас есть все ресурсы.\n2. Жрица: Слушайте интуицию.\n3. Императрица: Ждите плодов своих трудов.' 
       };
    }

    if (endpoint === '/matrix') {
       // Allow basic calculation (full=false) for free to show the teaser
       // If full=true, require entitlement (handled by backend usually, but here we simulate unlocked content)
       
       const isLocked = !body.full;
       
       return { 
         day: 7, month: 5, year: 22, center: 9, bottom: 18, 
         advice: 'Ваша энергия требует уединения и глубокого анализа. Не спешите делиться планами, пока они не созреют.',
         blocks: [
            {
                title: "Личный Квадрат",
                content: isLocked ? "Скрыто. Ваши личные качества и таланты." : "Вы обладаете даром целительства и глубокой эмпатии. Люди тянутся к вам за утешением.",
                is_locked: isLocked
            },
            {
                title: "Линия Благополучия",
                content: isLocked ? "Скрыто. Что блокирует ваши финансы." : "Деньги приходят через передачу знаний. Страх публичности блокирует поток.",
                is_locked: isLocked
            },
            {
                title: "Кармический Хвост",
                content: isLocked ? "Скрыто. Задачи из прошлых воплощений." : "В прошлом вы злоупотребляли властью. Сейчас важно учиться служению.",
                is_locked: isLocked
            }
         ]
       };
    }

    if (endpoint === '/natal') {
      const isLocked = !body.full;
      const noTime = body.birth_time === null || body.birth_time === "";
      
      return {
        sun_sign: "Близнецы",
        moon_sign: "Скорпион",
        asc_sign: noTime ? null : "Лев",
        daily_key: "Сегодня важно следить за словами, они материальны.",
        locked: isLocked,
        unlock_product_code: "NATAL_LITE",
        blocks: [
          {
            title: "Отношения (Венера/Марс)",
            content: isLocked ? "Скрытый контент. Эта энергия отвечает за ваш стиль любви и притяжения партнеров." : "Венера в Тельце дает вам потребность в стабильности и тактильности. Вы цените верность и комфорт.",
            is_locked: isLocked
          },
          {
            title: "Деньги и Карьера",
            content: isLocked ? "Скрытый контент. Узнайте, где лежат ваши деньги и какие сферы принесут успех." : "Сатурн во 2 доме требует дисциплины в финансах. Успех приходит через планомерный труд в архитектуре или управлении.",
            is_locked: isLocked
          },
          {
            title: "Сильные стороны и Тени",
            content: isLocked ? "Скрытый контент. Ваши скрытые таланты и подсознательные блоки." : "Ваша сила в коммуникации, но тень - поверхностность. Учитесь углубляться в суть вещей.",
            is_locked: isLocked
          }
        ]
      };
    }

    if (endpoint === '/payments/create-invoice') {
       return { invoice_link: 'https://t.me/test_invoice' };
    }

    return {};
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

  // 8. POST /api/natal
  getNatal(data: { birth_date: string; birth_time?: string; city: string; full: boolean }) {
    return this.request<import('../types').NatalResponse>('/natal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();