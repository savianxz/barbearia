import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../../services/supabase/client';
import type { Barber, CreateBarberInput, UpdateBarberInput } from '../../types/scheduling';

const PRESET_COLORS = [
  '#D4AF37', '#E07B54', '#5B8DD9', '#7DCE82', '#C46BB0',
  '#E8C547', '#6B9BC4', '#D97B6C', '#72B8A0', '#B07DC4',
];

const inputCls = 'w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors';
const labelCls = 'block text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-1.5';

export interface BarberFormProps {
  initial: Partial<Barber>;
  shopId: string;
  onSave: (d: CreateBarberInput | UpdateBarberInput) => void;
  loading: boolean;
}

export const BarberForm: React.FC<BarberFormProps> = ({ initial, shopId, onSave, loading }) => {
  const [name, setName]   = useState(initial.name ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [email, setEmail] = useState(initial.email ?? '');
  const [color, setColor] = useState(initial.color ?? '#D4AF37');
  const [displayOrder, setDisplayOrder] = useState(initial.display_order ?? 0);
  
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens (JPG, PNG, WEBP) são permitidas.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setFileToUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUploading(true);
    let finalAvatarUrl = initial.avatar_url ?? null;

    if (fileToUpload) {
      try {
        const options = {
          maxSizeMB: 0.15,
          maxWidthOrHeight: 600,
          useWebWorker: true,
          fileType: 'image/webp' as const
        };
        const compressedFile = await imageCompression(fileToUpload, options);
        
        const ext = compressedFile.name.split('.').pop() || 'jpg';
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `${shopId}/${fileName}`;

        const { error } = await supabase.storage
          .from('barber-avatars')
          .upload(filePath, compressedFile, { upsert: false });

      if (error) {
        alert('Erro ao fazer upload da imagem: ' + error.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from('barber-avatars')
        .getPublicUrl(filePath);

      finalAvatarUrl = data.publicUrl;
      } catch (err) {
        alert('Erro ao comprimir ou enviar imagem.');
        setUploading(false);
        return;
      }
    }

    onSave({
      name: name.trim(),
      phone: phone || null,
      email: email || null,
      color,
      shop_id: shopId,
      profile_id: null,
      avatar_url: finalAvatarUrl,
      is_active: initial.is_active ?? true,
      display_order: displayOrder,
      is_featured: initial.is_featured ?? false
    });
  };

  const isProcessing = loading || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative group flex-shrink-0">
          <div 
            className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center font-bold text-2xl text-black border border-white/10"
            style={{ backgroundColor: previewUrl ? 'transparent' : color }}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase() || 'B'
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
            <Upload className="w-5 h-5 text-white" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
        <div className="flex-1">
          <label className={labelCls}>Nome *</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Nome do profissional" autoFocus />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Telefone</label>
          <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="barbeiro@email.com" />
        </div>
        <div>
          <label className={labelCls}>Ordem de Exibição (Home)</label>
          <input type="number" className={inputCls} value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} placeholder="0" min="0" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Cor na Agenda</label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)} style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full transition-all cursor-pointer ${color === c ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#111] scale-110' : 'hover:scale-105'}`}
            />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-2 border-white/20 overflow-hidden" />
        </div>
      </div>
      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={isProcessing || !name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
          {isProcessing && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
          {uploading ? 'Enviando foto...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};
