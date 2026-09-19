import React, { useRef } from 'react';
import { Camera, Trash2, RefreshCw } from 'lucide-react';
import { compressImage } from '@/lib/imageUtils';

interface Props {
  value: string;
  onChange: (base64: string) => void;
}

export const ImagePicker: React.FC<Props> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 500, 500, 0.75);
      onChange(compressed);
    } catch (err) {
      console.error('Error al procesar la imagen:', err);
      alert('Error al cargar la imagen. Intenta con otra foto.');
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 bg-rose-500/90 hover:bg-rose-600 text-white rounded-xl shadow-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-24 h-24 bg-slate-100 hover:bg-slate-200/70 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400"
        >
          <Camera className="w-6 h-6 mb-1 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-600">Subir Foto</span>
        </button>
      )}

      <div className="flex-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
        >
          {value ? 'Cambiar imagen' : 'Tomar foto o elegir de Galería'}
        </button>
        <p className="text-[10px] text-slate-400 font-medium mt-1">
          JPG, PNG o WEBP (se optimiza sola)
        </p>
      </div>
    </div>
  );
};