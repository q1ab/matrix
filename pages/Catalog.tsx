import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { TelegramService } from '../services/telegram';

export const Catalog = () => {
  const { refreshUser } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingCode, setBuyingCode] = useState<string | null>(null);

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
          // Use standard alert for now, or custom toast if available
          TelegramService.showConfirm("Оплата успешна! Активировать сейчас?", (ok) => {
             // Logic to redirect or refresh
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

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-40 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-8 justify-center">
        <span className="text-2xl">🛍️</span>
        <h1 className="text-2xl font-bold text-white">Магазин Энергии</h1>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20 space-y-4">
           <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
           <p className="text-gray-400 text-sm">Загружаем артефакты...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(p => (
            <ProductCard 
              key={p.code} 
              product={p} 
              onBuy={handleBuy}
              isLoading={buyingCode === p.code}
            />
          ))}
        </div>
      )}
    </div>
  );
};
