import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MysticButton from '../components/UI/MysticButton';
import { haptic } from '../services/telegram';

const Tarot: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<'input' | 'shuffling' | 'result'>('input');
  const [result, setResult] = useState<string>('');

  const startReading = async () => {
    if (!question.trim()) return;
    
    haptic.impact('medium');
    setState('shuffling');
    
    // Simulate API call to OpenAI via backend
    setTimeout(() => {
      setResult("Карты говорят, что сейчас отличное время для начинаний. Ваши усилия (Туз Жезлов) будут вознаграждены, если вы проявите терпение (Умеренность).");
      haptic.success();
      setState('result');
    }, 3000);
  };

  return (
    <div className="p-4 min-h-screen pb-24">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Спроси у Таро</h1>

      {state === 'input' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-mystic-800 p-4 rounded-xl border border-mystic-600">
            <textarea
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none min-h-[100px]"
              placeholder="Напишите ваш вопрос (например: Что меня ждет в карьере?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <MysticButton fullWidth onClick={startReading} disabled={!question.trim()}>
            Сделать расклад (199 ⭐)
          </MysticButton>
          <p className="text-center text-xs text-gray-500">Первый расклад бесплатно</p>
        </motion.div>
      )}

      {state === 'shuffling' && (
        <div className="flex flex-col items-center justify-center h-64 space-y-8">
          <div className="relative w-32 h-48">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 bg-gradient-to-br from-gold-600 to-mystic-900 rounded-xl border border-white/20"
                animate={{
                  rotate: [0, 10, -10, 0],
                  x: [0, 20, -20, 0],
                  y: [0, -10, 5, 0]
                }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-gold-400 animate-pulse">Энергия карт настраивается...</p>
        </div>
      )}

      {state === 'result' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-center space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-20 h-32 bg-slate-800 rounded border border-gold-500/50 bg-[url('https://picsum.photos/seed/tarot/200/300')] bg-cover"></div>
             ))}
          </div>
          
          <div className="bg-mystic-800/80 p-6 rounded-xl border border-gold-500/30">
            <h3 className="text-gold-400 font-bold mb-2">Ответ Вселенной:</h3>
            <p className="text-white leading-relaxed text-sm">{result}</p>
          </div>

          <MysticButton fullWidth onClick={() => { setQuestion(''); setState('input'); }}>
            Новый вопрос
          </MysticButton>
        </motion.div>
      )}
    </div>
  );
};

export default Tarot;