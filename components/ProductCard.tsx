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
    <div className="bg-mystic-purple/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
      {product.tag && (
        <div className="absolute top-0 right-0 bg-amber-500 text-mystic-dark text-xs font-bold px-3 py-1 rounded-bl-xl">
          {product.tag}
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{product.title}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{product.description}</p>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between">
        <div className="text-amber-400 font-bold text-lg">
          {product.price_stars} ⭐
        </div>
        <MysticButton 
          variant="outline" 
          size="sm" 
          className="!py-2 !px-4 text-sm"
          onClick={() => onBuy(product)}
          isLoading={isLoading}
        >
          Купить
        </MysticButton>
      </div>
    </div>
  );
};
