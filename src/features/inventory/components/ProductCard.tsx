import React, { useRef, useState } from 'react';
import type { ProductItem } from '@/types';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { Camera, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { compressImage } from '@/lib/imageUtils';
import { useProductsStore } from '@/store/useProductsStore';

interface Props {
  product: ProductItem;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const removeProduct = useProductsStore((s) => s.removeProduct);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editPrice, setEditPrice] = useState(product.price);
  const [editStock, setEditStock] = useState(product.stock);
  const [editCost, setEditCost] = useState(product.cost || 0);

  const getStockBadge = () => {
    if (product.stock === 0) return { color: 'text-rose-700 bg-rose-100', dot: 'bg-rose-500', label: 'Agotado' };
    if (product.stock <= LOW_STOCK_THRESHOLD) return { color: 'text-amber-700 bg-amber-100', dot: 'bg-amber-500', label: 'Poco' };
    return { color: 'text-emerald-700 bg-emerald-100', dot: 'bg-emerald-500', label: 'OK' };
  };

  const badge = getStockBadge();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 500, 500, 0.75);
      updateProduct(product.id, { image: compressed });
    } catch {
      alert('Error al cambiar foto');
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
      removeProduct(product.id);
    }
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    updateProduct(product.id, {
      name: editName,
      price: editPrice,
      stock: editStock,
      cost: editCost,
    });
    setShowEdit(false);
  };

  return (
    <>
      <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group relative">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />

        {/* Botón menú (3 puntos) */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-xl shadow-md backdrop-blur-sm"
        >
          <MoreVertical className="w-3.5 h-3.5 text-slate-700" />
        </button>

        {/* Menú desplegable */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
            <div className="absolute top-10 right-2 z-30 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[140px]">
              <button
                onClick={() => { setShowEdit(true); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Camera className="w-3.5 h-3.5" /> Cambiar foto
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          </>
        )}

        {/* Foto */}
        <div className="w-full h-32 bg-slate-100 rounded-2xl overflow-hidden relative mb-2">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
            {product.origin}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-900 leading-tight truncate">{product.name}</h3>
          <p className="text-xs font-black text-blue-600">
            {product.currency === 'CUP' ? `$${product.price.toLocaleString('es-CU')} CUP` : `$${product.price} USD`}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400">Stock {product.stock}</span>
          <span className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${badge.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} /> {badge.label}
          </span>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">Editar producto</h2>
              <button onClick={() => setShowEdit(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Precio venta</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Stock actual</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Costo unitario</label>
                <input
                  type="number"
                  value={editCost}
                  onChange={(e) => setEditCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowEdit(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};