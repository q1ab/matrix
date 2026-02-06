import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import MysticButton from '../components/UI/MysticButton';
import { api } from '../services/api';
import { tg, haptic } from '../services/telegram';

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
        const items = await api.getProducts();
        setProducts(items);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };
  
  const handleBuy = async (productId: string) => {
    haptic.selection();
    try {
      const invoiceLink = await api.createInvoice(productId);
      
      // Dev mode handling
      if (!tg.initData) {
          alert(`[DEV] Invoice created for ${productId}.\nLink: ${invoiceLink}\n\nSimulating successful payment...`);
          haptic.success();
          alert('Оплата успешна! (DEV)');
          return;
      }

      tg.openInvoice(invoiceLink, (status) => {
        if (status === 'paid') {
          haptic.success();
          tg.HapticFeedback.notificationOccurred('success');
          alert('Оплата успешна! Кредиты начислены.');
          // Optionally refresh user profile here
        } else if (status === 'cancelled' || status === 'failed') {
          haptic.error();
        }
      });
    } catch (e) {
      console.error("Payment error", e);
      alert("Ошибка создания заказа. Попробуйте позже.");
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center pb-24">
            <div className="animate-spin text-4xl">💎</div>
        </div>
    );
  }

  return (
    <div className="p-4 pb-24 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Магазин Услуг</h1>

      <div className="space-y-4">
        {products.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Нет доступных товаров</div>
        ) : (
            products.map((product) => (
            <div key={product.id} className="bg-mystic-800 rounded-xl p-5 border border-mystic-600 relative overflow-hidden">
                {product.tag && (
                <div className="absolute top-0 right-0 bg-gold-600 text-mystic-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
                    {product.tag}
                </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                
                {product.description && (
                  <ul className="space-y-1 mb-4">
                    {Array.isArray(product.description) ? (
                      product.description.map((line, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-center">
                          <span className="text-gold-500 mr-2">•</span> {line}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-400 flex items-center">
                        <span className="text-gold-500 mr-2">•</span> {String(product.description)}
                      </li>
                    )}
                  </ul>
                )}
                
                <div className="flex items-center justify-between mt-4">
                <span className="text-gold-400 font-bold text-lg">{product.price} ⭐</span>
                <MysticButton 
                    variant={product.type === 'subscription' ? 'outline' : 'primary'}
                    className="px-6 py-2 text-sm"
                    onClick={() => handleBuy(product.id)}
                >
                    {product.type === 'subscription' ? 'Подписаться' : 'Купить'}
                </MysticButton>
                </div>
            </div>
            ))
        )}
      </div>
      
      <p className="text-center text-xs text-gray-600 mt-8">
        Оплата производится через Telegram Stars. <br/>
        Отменить подписку можно в настройках Telegram.
      </p>
    </div>
  );
};

export default Catalog;