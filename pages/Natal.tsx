import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { MysticButton } from '../components/MysticButton';
import { TelegramService } from '../services/telegram';
import { NatalResponse } from '../types';
import { Moon, Sun, Star, MapPin, Clock, Lock, FileText, Sparkles, ChevronDown } from 'lucide-react';

export const Natal = () => {
  const { user, refreshUser } = useApp();
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');
  const [birthTime, setBirthTime] = useState('');
  const [city, setCity] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  
  // Result State
  const [data, setData] = useState<NatalResponse | null>(null);

  const handleCalculate = async (full: boolean = false) => {
    if (!birthDate || !city) return;
    setLoading(true);
    
    try {
      const res = await api.getNatal({
        birth_date: birthDate,
        birth_time: unknownTime ? undefined : birthTime,
        city,
        full
      });
      setData(res);
      setStep('result');
      TelegramService.haptic.notification('success');
    } catch (e: any) {
       TelegramService.haptic.notification('error');
       alert(e.detail || 'Ошибка расчета');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (code: string) => {
    try {
      const { invoice_link } = await api.createInvoice(code);
      TelegramService.openInvoice(invoice_link, async (status) => {
        if (status === 'paid') {
          TelegramService.haptic.notification('success');
          // Refresh data with full=true
          handleCalculate(true);
        } else {
          TelegramService.haptic.notification('error');
        }
      });
    } catch (e) {
      alert('Ошибка оплаты');
    }
  };

  return (
    <div className="min-h-[100dvh] pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-purple-900/20 rounded-full blur-[80px] pointer-events-none" />

      <h1 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-lg flex items-center justify-center gap-2">
        <Moon className="text-amber-200 fill-amber-200/20" size={24} />
        <span>Натальная Карта</span>
      </h1>

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-sm mx-auto"
          >
            <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />
               
               {/* Date Input */}
               <div className="space-y-1">
                 <label className="text-xs text-amber-400 font-bold uppercase tracking-widest ml-1">Дата рождения</label>
                 <div className="bg-mystic-dark/60 rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3">
                    <Sun size={18} className="text-gray-500" />
                    <input 
                      type="date" 
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="bg-transparent w-full text-white outline-none placeholder-gray-600 font-mono"
                    />
                 </div>
               </div>

               {/* Time Input */}
               <div className="space-y-1">
                 <div className="flex justify-between items-center px-1">
                   <label className="text-xs text-amber-400 font-bold uppercase tracking-widest">Время</label>
                   <button 
                     onClick={() => {
                        setUnknownTime(!unknownTime);
                        if(!unknownTime) setBirthTime('');
                     }} 
                     className="text-[10px] text-gray-400 flex items-center gap-1 hover:text-white transition-colors"
                   >
                     <div className={`w-3 h-3 rounded-full border border-gray-500 ${unknownTime ? 'bg-amber-500 border-amber-500' : ''}`} />
                     Не знаю
                   </button>
                 </div>
                 
                 <div className={`bg-mystic-dark/60 rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3 transition-opacity ${unknownTime ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Clock size={18} className="text-gray-500" />
                    <input 
                      type="time" 
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      disabled={unknownTime}
                      className="bg-transparent w-full text-white outline-none placeholder-gray-600 font-mono"
                    />
                 </div>
                 {unknownTime && <p className="text-[10px] text-gray-500 px-1">*Точность расчета Асцендента и Домов будет ниже</p>}
               </div>

               {/* City Input */}
               <div className="space-y-1">
                 <label className="text-xs text-amber-400 font-bold uppercase tracking-widest ml-1">Город рождения</label>
                 <div className="bg-mystic-dark/60 rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3">
                    <MapPin size={18} className="text-gray-500" />
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Москва, Россия"
                      className="bg-transparent w-full text-white outline-none placeholder-gray-600"
                    />
                 </div>
               </div>
            </div>

            <MysticButton 
              fullWidth 
              size="lg" 
              onClick={() => handleCalculate(false)} 
              isLoading={loading}
              disabled={!birthDate || !city}
              className="shadow-neon"
            >
              Рассчитать Карту
            </MysticButton>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-sm mx-auto"
          >
            {data && (
              <>
                {/* 1. Planetary Overview */}
                <div className="grid grid-cols-3 gap-3">
                   {/* Sun */}
                   <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-amber-500/20">
                      <Sun className="text-amber-400" size={24} />
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase">Солнце</div>
                        <div className="text-sm font-bold text-white">{data.sun_sign}</div>
                      </div>
                   </div>
                   {/* Moon */}
                   <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-purple-400/20">
                      <Moon className="text-purple-300" size={24} />
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase">Луна</div>
                        <div className="text-sm font-bold text-white">{data.moon_sign}</div>
                      </div>
                   </div>
                   {/* Ascendant */}
                   <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-white/10">
                      <Star className={data.asc_sign ? "text-blue-300" : "text-gray-600"} size={24} />
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase">Асцендент</div>
                        {data.asc_sign ? (
                          <div className="text-sm font-bold text-white">{data.asc_sign}</div>
                        ) : (
                          <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                             <Lock size={8} /> Нет времени
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                {/* 2. Daily Key */}
                <div className="bg-gradient-to-r from-amber-900/40 to-purple-900/40 border border-white/10 rounded-xl p-4 flex items-start gap-3 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 opacity-10">
                     <Sparkles size={40} className="text-white" />
                   </div>
                   <div className="min-w-[4px] h-full bg-amber-500 rounded-full" />
                   <div>
                     <h3 className="text-xs text-amber-300 font-bold uppercase tracking-widest mb-1">Ключ вашего дня</h3>
                     <p className="text-sm text-gray-200 italic">"{data.daily_key}"</p>
                   </div>
                </div>

                {/* 3. Analysis Blocks */}
                <div className="space-y-4">
                  {data.blocks.map((block, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`glass-panel rounded-xl p-5 relative overflow-hidden border ${block.is_locked ? 'border-white/5' : 'border-amber-500/30'}`}
                    >
                      <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        {block.is_locked && <Lock size={12} className="text-amber-500" />}
                        {block.title}
                      </h3>
                      
                      <div className="relative">
                         <p className={`text-sm text-gray-300 leading-relaxed ${block.is_locked ? 'blur-sm select-none opacity-50' : ''}`}>
                           {block.content}
                           {block.is_locked && " lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                         </p>
                         
                         {block.is_locked && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              {/* Overlay for locked content is handled by the buttons below to avoid repetition */}
                           </div>
                         )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 4. Actions / Paywall */}
                {data.locked && (
                  <div className="sticky bottom-20 bg-mystic-dark/90 backdrop-blur-lg border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xl">
                     <div className="text-center mb-1">
                        <p className="text-xs text-gray-400">Раскройте потенциал своей натальной карты</p>
                     </div>
                     
                     <MysticButton 
                       fullWidth 
                       onClick={() => handleBuy(data.unlock_product_code)}
                       className="shadow-gold border border-amber-500/50"
                     >
                       <div className="flex flex-col items-center leading-tight">
                         <span className="text-sm font-bold">Разблокировать разбор</span>
                         <span className="text-[10px] opacity-80">490 ⭐</span>
                       </div>
                     </MysticButton>
                     
                     <button 
                       onClick={() => handleBuy('NATAL_PRO')}
                       className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-between px-4 transition-colors group"
                     >
                        <div className="flex items-center gap-3 text-left">
                           <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                             <FileText size={18} />
                           </div>
                           <div>
                             <div className="text-xs font-bold text-white">PRO Отчет (PDF)</div>
                             <div className="text-[9px] text-gray-400">Полный разбор + прогноз</div>
                           </div>
                        </div>
                        <div className="text-amber-400 font-bold text-sm bg-black/20 px-2 py-1 rounded">
                           1290 ⭐
                        </div>
                     </button>
                  </div>
                )}
                
                <div className="flex justify-center pb-6">
                  <button 
                    onClick={() => setStep('form')}
                    className="text-xs text-gray-500 flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <ChevronDown className="rotate-90" size={12} /> Изменить данные
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};