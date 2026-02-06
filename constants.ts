import { Product, TarotCard } from './types';

export const API_BASE_URL = 'https://api.omgcloud.ru';

export const DISCLAIMER_TEXT = "⚠️ Сервис носит исключительно развлекательный характер. Результаты являются генерацией алгоритмов и не являются руководством к действию.";

// Simplified Major Arcana for demo/fallback
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