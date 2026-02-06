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
    <div className="p-4 min-h-screen pb-24">
      <h1 className="text-2xl font-bold mb-4 text-center">Спроси у Карт</h1>
      
      {!result ? (
        <div className="space-y-6">
          <div className="bg-mystic-light/30 rounded-xl p-4">
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="На чем мне сфокусироваться сегодня?..."
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none resize-none h-32 text-lg"
            />
          </div>
          
          <MysticButton fullWidth onClick={handleReading} isLoading={loading}>
            {loading ? 'Тасуем колоду...' : 'Получить ответ'}
          </MysticButton>

          <div className="grid grid-cols-3 gap-2 opacity-50">
             {[1,2,3].map(i => (
               <div key={i} className="aspect-[2/3] bg-mystic-purple rounded border border-white/10" />
             ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
             Для развлечения. Совпадения случайны.
          </p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-3 gap-3">
            {result.cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                className="aspect-[2/3] bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center p-2 shadow-lg text-center"
              >
                <span className="text-xs font-bold text-white leading-tight">{card}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-mystic-light/30 rounded-xl p-5 border border-amber-500/20">
            <h3 className="font-bold text-amber-400 mb-2">Толкование</h3>
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
