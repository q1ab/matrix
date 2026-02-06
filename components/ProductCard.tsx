import React from 'react';
import { Product } from '../types';
import { MysticButton } from './MysticButton';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, isLoading }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden transition-transform active:scale-[0.99]">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-[40px]" />
      
      {product.tag && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500 to-amber-600 text-mystic-dark text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-lg z-10">
          {product.tag}
        </div>
      )}
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white mb-1.5">{product.title}</h3>
        <p className="text-xs text-gray-300 leading-relaxed opacity-90">{product.description}</p>
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between relative z-10">
        <div className="flex flex-col">
           <span className="text-[10px] text-gray-400 uppercase tracking-wider">Стоимость</span>
           <div className="text-amber-400 font-bold text-xl drop-shadow-sm flex items-center gap-1">
             {product.price_stars} <span className="text-sm">⭐</span>
           </div>
        </div>
        <MysticButton 
          variant="outline" 
          size="sm" 
          className="!py-2.5 !px-5 text-xs font-bold border-amber-500/30 hover:bg-amber-500/10"
          onClick={() => onBuy(product)}
          isLoading={isLoading}
        >
          КУПИТЬ
        </MysticButton>
      </div>
    </div>
  );
};
