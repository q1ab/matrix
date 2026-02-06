import React from 'react';
import { PRODUCTS } from '../constants';
import MysticButton from '../components/UI/MysticButton';
import { api } from '../services/api';
import { tg, haptic } from '../services/telegram';

const Catalog: React.FC = () => {
  
  const handleBuy = async (productId: string) => {
    haptic.selection();
    try {
      // 1. Get Invoice Link from backend
      const invoiceLink = await api.createInvoice(productId);
      
      // 2. Open Telegram Invoice
      tg.openInvoice(invoiceLink, (status) => {
        if (status === 'paid') {
          haptic.success();
          tg.HapticFeedback.notificationOccurred('success');
          // Refresh user data here
          alert('Оплата успешна! Спасибо.');
        } else if (status === 'cancelled' || status === 'failed') {
          haptic.error();
        }
      });
    } catch (e) {
      console.error("Payment error", e);
      alert("Ошибка создания заказа. Попробуйте позже.");
    }
  };

  return (
    <div className="p-4 pb-24 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Магазин Услуг</h1>

      <div className="space-y-4">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="bg-mystic-800 rounded-xl p-5 border border-mystic-600 relative overflow-hidden">
            {product.tag && (
              <div className="absolute top-0 right-0 bg-gold-600 text-mystic-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
                {product.tag}
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
            <ul className="space-y-1 mb-4">
              {product.description.map((line, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-center">
                  <span className="text-gold-500 mr-2">•</span> {line}
                </li>
              ))}
            </ul>
            
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
        ))}
      </div>
      
      <p className="text-center text-xs text-gray-600 mt-8">
        Оплата производится через Telegram Stars. <br/>
        Отменить подписку можно в настройках Telegram.
      </p>
    </div>
  );
};

export default Catalog;