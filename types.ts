export enum RoutePath {
  ONBOARDING = '/onboarding',
  HOME = '/app/home',
  TAROT = '/app/tarot',
  MATRIX = '/app/matrix',
  CATALOG = '/app/catalog',
  PROFILE = '/app/profile',
}

export interface User {
  id: number;
  username?: string;
  firstName?: string;
  birthDate?: string; // DD.MM.YYYY
  credits: number;
  isPremium: boolean;
  onboardingComplete: boolean;
}

export interface TarotCard {
  id: number;
  name: string;
  image: string; // URL or placeholder
  desc: string;
}

export interface Product {
  id: string;
  title: string;
  description: string[];
  price: number; // In Telegram Stars
  tag?: string;
  type: 'consumable' | 'subscription' | 'one-time';
}

export interface MatrixData {
  center: number;
  karma: number;
  talent: number;
  destiny: number;
  money: number;
}