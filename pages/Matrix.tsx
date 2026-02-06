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
    <div className="p-4 min-h-screen pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Матрица Судьбы</h1>

      <div className="flex gap-2 mb-6">
        <input 
          type="date" 
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="flex-1 bg-mystic-purple rounded-lg px-4 py-2 border border-white/10"
        />
      </div>

      <div className="flex gap-3 mb-8">
        <MysticButton 
          className="flex-1" 
          onClick={() => fetchMatrix(false)}
          isLoading={loading}
          disabled={!birthDate}
        >
          Мини (Lite)
        </MysticButton>
        <MysticButton 
          variant="secondary"
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 !text-white"
          onClick={() => fetchMatrix(true)}
          isLoading={loading}
          disabled={!birthDate}
        >
          Полная (Pro)
        </MysticButton>
      </div>

      {matrixData && (
        <div className="animate-fade-in">
          {/* Visual Representation */}
          <div className="relative w-64 h-64 mx-auto mb-6">
             <div className="absolute inset-0 border-2 border-amber-500/50 rotate-45 transform bg-mystic-light/20" />
             <div className="absolute inset-0 flex flex-col items-center justify-between py-2 rotate-0">
                 {/* Top (Month) */}
                 <span className="bg-mystic-dark p-1 rounded-full text-amber-400 font-bold">{matrixData.month}</span>
                 {/* Center */}
                 <span className="bg-amber-500 text-mystic-dark p-2 rounded-full font-bold text-xl">{matrixData.center}</span>
                 {/* Bottom */}
                 <span className="bg-mystic-dark p-1 rounded-full text-red-400 font-bold">{matrixData.bottom}</span>
             </div>
             <div className="absolute inset-0 flex items-center justify-between px-2 rotate-0">
                 {/* Left (Day) */}
                 <span className="bg-mystic-dark p-1 rounded-full text-purple-400 font-bold">{matrixData.day}</span>
                 {/* Right (Year) */}
                 <span className="bg-mystic-dark p-1 rounded-full text-blue-400 font-bold">{matrixData.year}</span>
             </div>
          </div>

          <div className="bg-mystic-light/30 p-4 rounded-xl">
            <h3 className="font-bold text-amber-400 mb-2">Совет Аркана</h3>
            <p className="text-sm text-gray-200">{matrixData.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
};
