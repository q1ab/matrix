import { Product, TarotCard } from './types';

export const API_BASE_URL = 'https://api.omgcloud.ru';

export const PRODUCTS: Product[] = [
  {
    id: 'tarot_3_cards',
    title: 'Расклад 3 карты',
    description: ['Прошлое, настоящее, будущее', 'Совет от карт', 'AI интерпретация'],
    price: 199,
    type: 'consumable',
    tag: 'Популярно'
  },
  {
    id: 'matrix_full',
    title: 'Матрица PRO (PDF)',
    description: ['Полный разбор (20+ стр.)', 'Кармический хвост', 'Денежный канал', 'PDF формат'],
    price: 1290,
    type: 'one-time'
  },
  {
    id: 'sub_daily_light',
    title: 'Daily Light',
    description: ['Карта дня ежедневно', 'Лунный календарь', 'Отмена в любой момент'],
    price: 349,
    type: 'subscription'
  }
];

export const DISCLAIMER_TEXT = "⚠️ Сервис носит исключительно развлекательный характер. Результаты являются генерацией алгоритмов и не являются руководством к действию.";

// Simplified Major Arcana for demo
export const MAJOR_ARCANA: TarotCard[] = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  name: [
    "Шут", "Маг", "Жрица", "Императрица", "Император", "Жрец", "Влюбленные", 
    "Колесница", "Сила", "Отшельник", "Колесо Фортуны", "Справедливость", 
    "Повешенный", "Смерть", "Умеренность", "Дьявол", "Башня", "Звезда", 
    "Луна", "Солнце", "Суд", "Мир"
  ][i],
  image: `https://picsum.photos/seed/tarot${i}/300/450`,
  desc: "Мистическое значение карты..."
}));
