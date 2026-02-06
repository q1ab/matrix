import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { MysticButton } from '../components/MysticButton';
import { TelegramService } from '../services/telegram';
import { MatrixResponse } from '../types';

export const Matrix = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');

  const fetchMatrix = async (full: boolean) => {
    if (!birthDate) return;
    setLoading(true);
    try {
      const data = await api.getMatrix({ birth_date: birthDate, full });
      setMatrixData(data);
    } catch (e: any) {
      if (e.status === 402) {
        TelegramService.haptic.notification('error');
        TelegramService.showConfirm(
          full ? 'Нужна PRO подписка для полной версии. Перейти в каталог?' : 'Приобретите доступ в каталоге.',
          (ok) => { if (ok) navigate('/catalog'); }
        );
      } else {
        alert(e.detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      <h1 className="text-2xl font-bold mb-8 text-center text-white">Матрица Судьбы</h1>

      <div className="glass-panel rounded-2xl p-4 mb-6">
        <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wide">Дата рождения</label>
        <input 
          type="date" 
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full bg-mystic-dark/50 rounded-xl px-4 py-3 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="flex gap-3 mb-10">
        <MysticButton 
          variant="outline"
          className="flex-1" 
          onClick={() => fetchMatrix(false)}
          isLoading={loading}
          disabled={!birthDate}
        >
          Lite (Беспл.)
        </MysticButton>
        <MysticButton 
          className="flex-1 shadow-neon"
          onClick={() => fetchMatrix(true)}
          isLoading={loading}
          disabled={!birthDate}
        >
          Pro (Полная)
        </MysticButton>
      </div>

      {matrixData && (
        <div className="animate-fade-in space-y-8">
          {/* Visual Representation */}
          <div className="relative w-72 h-72 mx-auto">
             {/* Diamond Background */}
             <div className="absolute inset-4 border border-white/10 bg-white/5 rotate-45 rounded-3xl backdrop-blur-sm" />
             <div className="absolute inset-12 border border-amber-500/20 rotate-45 rounded-xl" />
             
             {/* Numbers */}
             <div className="absolute inset-0 flex flex-col items-center justify-between py-4 rotate-0 z-10 pointer-events-none">
                 {/* Top (Month) */}
                 <div className="bg-mystic-dark/90 px-3 py-1 rounded-full border border-purple-500/50 shadow-neon">
                    <span className="text-purple-300 font-bold">{matrixData.month}</span>
                 </div>
                 {/* Center */}
                 <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-mystic-dark w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-gold">
                    {matrixData.center}
                 </div>
                 {/* Bottom */}
                 <div className="bg-mystic-dark/90 px-3 py-1 rounded-full border border-red-500/50">
                    <span className="text-red-400 font-bold">{matrixData.bottom}</span>
                 </div>
             </div>
             <div className="absolute inset-0 flex items-center justify-between px-4 rotate-0 z-10 pointer-events-none">
                 {/* Left (Day) */}
                 <div className="bg-mystic-dark/90 px-3 py-1 rounded-full border border-blue-500/50">
                    <span className="text-blue-300 font-bold">{matrixData.day}</span>
                 </div>
                 {/* Right (Year) */}
                 <div className="bg-mystic-dark/90 px-3 py-1 rounded-full border border-green-500/50">
                    <span className="text-green-300 font-bold">{matrixData.year}</span>
                 </div>
             </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-amber-500">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-3">Совет Аркана</h3>
            <p className="text-sm text-gray-200 leading-relaxed">{matrixData.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
};
