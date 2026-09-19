import React from 'react';
import type { ProductItem } from '@/types';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';

interface Props {
  product: ProductItem;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const getStockBadge = () => {
    if (product.stock === 0) {
      return { color: 'text-rose-700 bg-rose-100', dot: 'bg-rose-500', label: 'Agotado' };
    }
    if (product.stock <= LOW_STOCK_THRESHOLD) {
      return { color: 'text-amber-700 bg-amber-100', dot: 'bg-amber-500', label: 'Poco' };
    }
    return { color: 'text-emerald-700 bg-emerald-100', dot: 'bg-emerald-500', label: 'OK' };
  };

  const badge = getStockBadge();

  return (
    <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
      {/* Foto */}
      <div className="w-full h-32 bg-slate-100 rounded-2xl overflow-hidden relative mb-2">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
        />
        <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
          {product.origin}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-xs font-black text-slate-900 leading-tight truncate">{product.name}</h3>
        <p className="text-xs font-black text-blue-600">
          {product.currency === 'CUP' 
            ? `$${product.price.toLocaleString('es-CU')} CUP` 
            : `$${product.price} USD`}
        </p>
      </div>

      {/* Badge Stock */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-400">Stock {product.stock}</span>
        <span className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${badge.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} /> {badge.label}
        </span>
      </div>
    </div>
  );
};