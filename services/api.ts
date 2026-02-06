import { User, MatrixData } from '../types';
import { tg } from './telegram';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getUser: async (): Promise<User> => {
    await delay(500);
    // In real app, fetch from backend using tg.initData
    const tgUser = tg.initDataUnsafe?.user;
    return {
      id: tgUser?.id || 12345,
      username: tgUser?.username || 'Guest',
      firstName: tgUser?.first_name || 'Seeker',
      credits: 1, // 1 Free daily reading
      isPremium: false,
      onboardingComplete: localStorage.getItem('onboarding_complete') === 'true',
      birthDate: localStorage.getItem('user_birthdate') || undefined
    };
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await delay(300);
    if (data.birthDate) localStorage.setItem('user_birthdate', data.birthDate);
    if (data.onboardingComplete) localStorage.setItem('onboarding_complete', 'true');
    return await api.getUser();
  },

  calculateMatrix: async (birthDate: string): Promise<MatrixData> => {
    await delay(800);
    // Simple mock logic: sum of numbers
    const parts = birthDate.split('.').map(Number);
    const day = parts[0] > 22 ? parts[0] - 22 : parts[0];
    const month = parts[1];
    const yearSum = parts[2].toString().split('').reduce((a, b) => Number(a) + Number(b), 0);
    const year = yearSum > 22 ? yearSum - 22 : yearSum;

    return {
      center: (day + month + year) % 22 || 22,
      karma: day,
      talent: month,
      destiny: year,
      money: (day + year) % 22 || 5
    };
  },

  createInvoice: async (productId: string): Promise<string> => {
    await delay(1000);
    // In production: POST /api/payments/create-invoice -> returns invoice link
    // Here we return a dummy link. In a real bot, this link opens the Stars payment sheet.
    console.log(`Creating invoice for ${productId}`);
    return "https://t.me/$..."; 
  }
};