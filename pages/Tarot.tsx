import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { MysticButton } from '../components/MysticButton';
import { TelegramService } from '../services/telegram';
import { TarotResponse } from '../types';

export const Tarot = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TarotResponse | null>(null);
  const navigate = useNavigate();

  const handleReading = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.getTarot({ 
        question: question || undefined, 
        spread_type: '3cards' 
      });
      setResult(res);
      TelegramService.haptic.notification('success');
    } catch (e: any) {
      if (e.status === 402) {
        TelegramService.haptic.notification('error');
        TelegramService.showConfirm('Недостаточно энергии. Приобрести расклад?', (ok) => {
          if (ok) navigate('/catalog');
        });
      } else {
        alert(e.detail || 'Ошибка соединения');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-[60px] pointer-events-none" />

      <h1 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-lg">Спроси у Карт</h1>
      
      {!result ? (
        <div className="space-y-8">
          <div className="glass-panel rounded-2xl p-1">
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="На чем мне сфокусироваться сегодня?..."
              className="w-full bg-mystic-dark/40 rounded-xl p-4 text-white placeholder-gray-500 outline-none resize-none h-40 text-lg border border-transparent focus:border-amber-500/30 transition-colors"
            />
          </div>
          
          <MysticButton fullWidth size="lg" onClick={handleReading} isLoading={loading} className="shadow-neon">
            {loading ? 'Тасуем колоду...' : 'Получить ответ'}
          </MysticButton>

          {/* Placeholders */}
          <div className="grid grid-cols-3 gap-3 opacity-60">
             {[1,2,3].map(i => (
               <div key={i} className="aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5">
                 <span className="text-2xl opacity-20">?</span>
               </div>
             ))}
          </div>

          <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-8">
             Развлекательный контент
          </p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-3 gap-3">
            {result.cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.6, type: 'spring' }}
                className="aspect-[2/3] bg-gradient-to-br from-purple-900 to-black border border-amber-500/40 rounded-xl flex items-center justify-center p-2 shadow-lg text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold text-amber-100 leading-tight relative z-10">{card}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="glass-panel rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-6 bg-mystic-dark px-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              Толкование
            </div>
            <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-line">
              {result.result_text}
            </p>
          </div>

          <MysticButton variant="outline" fullWidth onClick={() => setResult(null)}>
            Новый вопрос
          </MysticButton>
        </motion.div>
      )}
    </div>
  );
};
