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
          alert('Оплата прошла успешно! ✨');
        } else if (status === 'cancelled') {
           // Do nothing
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
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Магазин Энергии</h1>
      
      {loading ? (
        <div className="text-center mt-10 text-gray-400">Загрузка каталога...</div>
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
