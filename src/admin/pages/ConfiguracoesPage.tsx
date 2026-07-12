import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, CheckCircle, AlertCircle, Clock, Users, Scissors, CalendarCheck, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsService } from '../../services/settings';
import type { ShopSettings, Barber, Service } from '../../types/settings';

const weekdaysName = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

type ConfigTab = 'informacoes' | 'horarios' | 'equipe' | 'servicos' | 'agenda';

const tabConfig: { id: ConfigTab; label: string; icon: any }[] = [
  { id: 'informacoes', label: 'Informações', icon: Info },
  { id: 'horarios', label: 'Horários', icon: Clock },
  { id: 'equipe', label: 'Equipe', icon: Users },
  { id: 'servicos', label: 'Serviços', icon: Scissors },
  { id: 'agenda', label: 'Regras da Agenda', icon: CalendarCheck },
];

export const ConfiguracoesPage: React.FC = () => {
  const { profile } = useAuth();
  const shopId = profile?.shop_id;

  const [activeTab, setActiveTab] = useState<ConfigTab>('informacoes');
  
  // Data States
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError   = (msg: string) => { setErrorMsg(msg);   setTimeout(() => setErrorMsg(''), 4000); };

  const loadData = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    
    const [shopRes, barbersRes, servicesRes] = await Promise.all([
      settingsService.getShopSettings(shopId),
      settingsService.getBarbers(shopId),
      settingsService.getServices(shopId)
    ]);

    if (shopRes.data) {
      // Garantir valores default caso venham nulos do banco na primeira carga
      const s = shopRes.data;
      if (!s.business_hours) {
        s.business_hours = {
          0: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
          1: { isOpen: true,  openTime: "09:00", closeTime: "19:00" },
          2: { isOpen: true,  openTime: "09:00", closeTime: "19:00" },
          3: { isOpen: true,  openTime: "09:00", closeTime: "19:00" },
          4: { isOpen: true,  openTime: "09:00", closeTime: "19:00" },
          5: { isOpen: true,  openTime: "09:00", closeTime: "19:00" },
          6: { isOpen: true,  openTime: "09:00", closeTime: "18:00" }
        };
      }
      if (!s.booking_settings) {
        s.booking_settings = { precision: '30', buffer: 0, advance_notice: 1, cancellation_policy: 'flexible' };
      }
      if (!s.setup_progress) {
        s.setup_progress = { informacoes: false, horarios: false, equipe: false, servicos: false, agenda: false };
      }
      setSettings(s);
    }
    if (barbersRes.data) setBarbers(barbersRes.data);
    if (servicesRes.data) setServices(servicesRes.data);
    
    setLoading(false);
  }, [shopId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Compute Progress
  const progressPercent = useMemo(() => {
    if (!settings?.setup_progress) return 0;
    const values = Object.values(settings.setup_progress);
    const completed = values.filter(v => v).length;
    return Math.round((completed / 5) * 100);
  }, [settings?.setup_progress]);

  // Helper to update progress and save
  const handleSaveSettings = async (updates: Partial<ShopSettings>, completeStep?: keyof ShopSettings['setup_progress']) => {
    if (!shopId || !settings) return;
    setSaving(true);
    
    const newSettings = { ...settings, ...updates };
    
    if (completeStep) {
      newSettings.setup_progress = { ...newSettings.setup_progress, [completeStep]: true };
    }

    const { error } = await settingsService.updateShopSettings(shopId, {
      ...updates,
      setup_progress: newSettings.setup_progress
    });

    if (error) {
      showError(error);
    } else {
      setSettings(newSettings);
      showSuccess('Alterações salvas com sucesso!');
    }
    setSaving(false);
  };

  // UI Helpers
  const inputCls = "w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
  const labelCls = "block text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-1.5";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-screen">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      
      {/* ── SIDEBAR DE PROGRESSO ── */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-[#0E0E0E] border border-white/6 rounded-2xl p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Setup da Barbearia</h3>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Complete as configurações para ter a melhor experiência com a plataforma.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#D4AF37]">{progressPercent}% Concluído</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-[#D4AF37] rounded-full"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            {tabConfig.map(tab => {
              const isCompleted = settings.setup_progress[tab.id as keyof typeof settings.setup_progress];
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    activeTab === tab.id ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'hover:bg-white/5 text-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span className="text-[12px] font-semibold">{tab.label}</span>
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-white/20">⏳</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO DINÂMICO ── */}
      <div className="flex-1 space-y-6">
        
        {/* Toast Messages */}
        {(successMsg || errorMsg) && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[12px] font-semibold ${
              successMsg ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'
            }`}
          >
            {successMsg ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {successMsg || errorMsg}
          </motion.div>
        )}

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0E0E0E] border border-white/6 rounded-2xl p-6 lg:p-8"
        >
          {/* TAB: INFORMAÇÕES */}
          {activeTab === 'informacoes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Informações da Barbearia</h2>
                  <p className="text-[12px] text-white/40 mt-1">Dados públicos que aparecem para seus clientes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Nome Comercial</label>
                  <input className={inputCls} value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
                </div>
                <div>
                  <label className={labelCls}>Slug (URL única)</label>
                  <input className={inputCls} disabled value={settings.slug} />
                </div>
                <div>
                  <label className={labelCls}>Telefone / WhatsApp</label>
                  <input className={inputCls} value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} />
                </div>
                <div>
                  <label className={labelCls}>Link do Instagram</label>
                  <input className={inputCls} value={settings.instagram_url || ''} onChange={e => setSettings({...settings, instagram_url: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Endereço Completo</label>
                  <input className={inputCls} value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Sobre a barbearia (Bio)</label>
                  <textarea rows={3} className={inputCls} value={settings.about_text || ''} onChange={e => setSettings({...settings, about_text: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 border-t border-white/6 flex justify-end">
                <button onClick={() => handleSaveSettings({
                  name: settings.name, phone: settings.phone, instagram_url: settings.instagram_url, address: settings.address, about_text: settings.about_text
                }, 'informacoes')} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
                  {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {/* TAB: HORÁRIOS */}
          {activeTab === 'horarios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Horários de Funcionamento</h2>
                <p className="text-[12px] text-white/40 mt-1">Defina quando a barbearia está aberta.</p>
              </div>

              <div className="space-y-3">
                {Object.keys(settings.business_hours).map(key => {
                  const dayNum = Number(key);
                  const dayConf = settings.business_hours[dayNum];
                  return (
                    <div key={dayNum} className="flex items-center gap-4 p-4 rounded-xl border border-white/6 bg-white/[0.02]">
                      <div className="w-32 flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={dayConf.isOpen}
                          id={`day-${dayNum}`}
                          onChange={e => {
                            const u = { ...settings.business_hours };
                            u[dayNum].isOpen = e.target.checked;
                            setSettings({ ...settings, business_hours: u });
                          }}
                          className="w-4 h-4 accent-[#D4AF37]"
                        />
                        <label htmlFor={`day-${dayNum}`} className={`text-[13px] font-semibold cursor-pointer ${dayConf.isOpen ? 'text-white' : 'text-white/30'}`}>
                          {weekdaysName[dayNum]}
                        </label>
                      </div>
                      
                      {dayConf.isOpen ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={dayConf.openTime} onChange={e => {
                            const u = { ...settings.business_hours }; u[dayNum].openTime = e.target.value; setSettings({ ...settings, business_hours: u });
                          }} className="bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none focus:border-[#D4AF37]/50" />
                          <span className="text-white/20">—</span>
                          <input type="time" value={dayConf.closeTime} onChange={e => {
                            const u = { ...settings.business_hours }; u[dayNum].closeTime = e.target.value; setSettings({ ...settings, business_hours: u });
                          }} className="bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none focus:border-[#D4AF37]/50" />
                        </div>
                      ) : (
                        <div className="flex-1 text-[11px] font-bold text-white/20 uppercase tracking-widest">
                          Fechado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/6 flex justify-end">
                <button onClick={() => handleSaveSettings({ business_hours: settings.business_hours }, 'horarios')} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
                  {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Horários
                </button>
              </div>
            </div>
          )}

          {/* TAB: EQUIPE */}
          {activeTab === 'equipe' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Sua Equipe</h2>
                  <p className="text-[12px] text-white/40 mt-1">Gerencie os profissionais da barbearia.</p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold tracking-widest uppercase rounded-lg border border-white/10 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              <div className="grid gap-3">
                {barbers.length === 0 ? (
                  <p className="text-[12px] text-white/40 italic p-6 text-center border border-dashed border-white/10 rounded-xl">Nenhum profissional cadastrado.</p>
                ) : barbers.map(barber => (
                  <div key={barber.id} className="flex items-center justify-between p-4 rounded-xl border border-white/6 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold">
                        {barber.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white">{barber.name}</p>
                        <p className="text-[11px] text-white/40">{barber.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded-md">Ativo</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/6 flex justify-end">
                <button onClick={() => handleSaveSettings({}, 'equipe')} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
                  Marcar como concluído
                </button>
              </div>
            </div>
          )}

          {/* TAB: SERVIÇOS */}
          {activeTab === 'servicos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Catálogo de Serviços</h2>
                  <p className="text-[12px] text-white/40 mt-1">Configure os serviços, preços e durações.</p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold tracking-widest uppercase rounded-lg border border-white/10 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              <div className="grid gap-3">
                {services.length === 0 ? (
                  <p className="text-[12px] text-white/40 italic p-6 text-center border border-dashed border-white/10 rounded-xl">Nenhum serviço cadastrado.</p>
                ) : services.map(srv => (
                  <div key={srv.id} className="flex items-center justify-between p-4 rounded-xl border border-white/6 bg-white/[0.02]">
                    <div>
                      <p className="text-[13px] font-bold text-white">{srv.name}</p>
                      <p className="text-[11px] text-white/40 capitalize">{srv.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-[#D4AF37]">R$ {srv.price.toFixed(2)}</p>
                      <p className="text-[11px] text-white/40">{srv.duration} minutos</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/6 flex justify-end">
                <button onClick={() => handleSaveSettings({}, 'servicos')} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
                  Marcar como concluído
                </button>
              </div>
            </div>
          )}

          {/* TAB: AGENDA */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Regras de Agendamento</h2>
                <p className="text-[12px] text-white/40 mt-1">Controle como os clientes podem reservar horários.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Precisão da Agenda (minutos)</label>
                  <select 
                    className={inputCls} 
                    value={settings.booking_settings.precision}
                    onChange={e => setSettings({...settings, booking_settings: { ...settings.booking_settings, precision: e.target.value as any }})}
                  >
                    <option value="15">A cada 15 minutos</option>
                    <option value="30">A cada 30 minutos</option>
                    <option value="60">A cada 1 hora</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tempo de Buffer (limpeza)</label>
                  <select 
                    className={inputCls} 
                    value={settings.booking_settings.buffer}
                    onChange={e => setSettings({...settings, booking_settings: { ...settings.booking_settings, buffer: parseInt(e.target.value) }})}
                  >
                    <option value="0">Sem intervalo</option>
                    <option value="5">5 minutos</option>
                    <option value="10">10 minutos</option>
                    <option value="15">15 minutos</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Antecedência Mínima (horas)</label>
                  <select 
                    className={inputCls} 
                    value={settings.booking_settings.advance_notice}
                    onChange={e => setSettings({...settings, booking_settings: { ...settings.booking_settings, advance_notice: parseInt(e.target.value) }})}
                  >
                    <option value="0">Sem limite (Aceitar de última hora)</option>
                    <option value="1">1 hora antes</option>
                    <option value="2">2 horas antes</option>
                    <option value="24">24 horas antes</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Política de Cancelamento</label>
                  <select 
                    className={inputCls} 
                    value={settings.booking_settings.cancellation_policy}
                    onChange={e => setSettings({...settings, booking_settings: { ...settings.booking_settings, cancellation_policy: e.target.value as any }})}
                  >
                    <option value="flexible">Flexível (Permitir sempre)</option>
                    <option value="strict">Rígida (Apenas 24h antes)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/6 flex justify-end">
                <button onClick={() => handleSaveSettings({ booking_settings: settings.booking_settings }, 'agenda')} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
                  {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Regras
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
