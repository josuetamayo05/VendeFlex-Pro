import React, { useRef } from 'react';
import type { ProductItem } from '@/types';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { Camera } from 'lucide-react';
import { compressImage } from '@/lib/imageUtils';
import { useProductsStore } from '@/store/useProductsStore';

interface Props {
  product: ProductItem;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 500, 500, 0.75);
      updateProduct(product.id, { image: compressed });
    } catch (err) {
      console.error(err);
      alert('Error al cambiar foto');
    }
  };

  return (
    <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Foto del Producto */}
      <div className="w-full h-32 bg-slate-100 rounded-2xl overflow-hidden relative mb-2 group/img">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
        />

        {/* Botón flotante para cambiar foto con 1 click */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white rounded-xl shadow-md transition-all opacity-80 group-hover/img:opacity-100 active:scale-95"
          title="Cambiar foto del producto"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
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