import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { TelegramService } from '../services/telegram';
import { ShoppingBag, Sparkles, Grid, Moon, CreditCard, Layers } from 'lucide-react';

type CategoryId = 'all' | 'tarot' | 'matrix' | 'natal' | 'sub';

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'Все', icon: Layers },
  { id: 'tarot', label: 'Таро', icon: Sparkles },
  { id: 'matrix', label: 'Матрица', icon: Grid },
  { id: 'natal', label: 'Натальная', icon: Moon },
  { id: 'sub', label: 'Подписки', icon: CreditCard },
];

export const Catalog = () => {
  const { refreshUser } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingCode, setBuyingCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (product: Product) => {
    setBuyingCode(product.code);
    try {
      const { invoice_link } = await api.createInvoice(product.code);
      TelegramService.openInvoice(invoice_link, async (status) => {
        if (status === 'paid') {
          TelegramService.haptic.notification('success');
          await refreshUser();
          TelegramService.showConfirm("Оплата успешна! Активировать сейчас?", (ok) => {
             // Logic to redirect or refresh could go here
          });
        } else {
           TelegramService.haptic.notification('error');
        }
        setBuyingCode(null);
      });
    } catch (e: any) {
      alert('Ошибка при создании счета');
      setBuyingCode(null);
    }
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'sub') return p.is_subscription || p.code.startsWith('PACK') || p.code.startsWith('SUB');
    if (selectedCategory === 'tarot') return p.code.startsWith('TAROT') && !p.is_subscription;
    if (selectedCategory === 'matrix') return p.code.startsWith('MATRIX') && !p.is_subscription;
    if (selectedCategory === 'natal') return p.code.startsWith('NATAL') && !p.is_subscription;
    return true;
  });

  return (
    <div className="min-h-[100dvh] pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-40 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 justify-center mb-1">
          <ShoppingBag className="text-amber-400" size={24} />
          <h1 className="text-2xl font-bold text-white">Магазин Энергии</h1>
        </div>
        <p className="text-center text-xs text-gray-400">Инструменты для самопознания</p>
      </div>

      {/* Category Filter */}
      <div className="pl-4 mb-6 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2 pr-4 min-w-min">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  TelegramService.haptic.selection();
                  setSelectedCategory(cat.id);
                }}
                className={`relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 outline-none ${
                  isActive ? 'text-mystic-dark' : 'text-gray-400 hover:text-white bg-white/5 border border-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap text-sm font-medium">
                  <cat.icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="px-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-4">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Загружаем артефакты...</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4">
            <AnimatePresence mode='popLayout'>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <motion.div
                    key={p.code}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard 
                      product={p} 
                      onBuy={handleBuy}
                      isLoading={buyingCode === p.code}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-center py-10 text-gray-500 text-sm"
                >
                  В этой категории пока пусто...
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};