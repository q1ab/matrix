import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MatrixData } from '../types';
import MysticButton from '../components/UI/MysticButton';
import { motion } from 'framer-motion';

const Matrix: React.FC = () => {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-calculate if birthdate exists
    const loadData = async () => {
      const user = await api.getUser();
      if (user.birthDate) {
        setLoading(true);
        const matrix = await api.calculateMatrix(user.birthDate);
        setData(matrix);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const ArcanCircle = ({ num, label, color }: { num: number, label: string, color: string }) => (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full border-2 ${color} flex items-center justify-center bg-mystic-900 z-10 font-bold text-white mb-1`}>
        {num}
      </div>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-2 text-center">Матрица Судьбы</h1>
      
      {loading ? (
        <div className="flex justify-center mt-20"><div className="animate-spin text-4xl">✡️</div></div>
      ) : data ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-8">
          
          {/* Visual Representation of Matrix (Simplified Diamond) */}
          <div className="relative h-64 w-64 mx-auto">
            <div className="absolute inset-0 border-2 border-gold-500/20 rotate-45 transform bg-mystic-800/30 rounded-3xl" />
            
            {/* Top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
               <ArcanCircle num={data.talent} label="Талант" color="border-purple-400" />
            </div>
            {/* Right */}
            <div className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2">
               <ArcanCircle num={data.destiny} label="Путь" color="border-blue-400" />
            </div>
            {/* Bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4">
               <ArcanCircle num={data.karma} label="Карма" color="border-red-400" />
            </div>
            {/* Center */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <ArcanCircle num={data.center} label="Суть" color="border-gold-400" />
            </div>
          </div>

          <div className="bg-mystic-800 p-4 rounded-xl space-y-4">
            <h3 className="font-bold text-white">Краткая расшифровка</h3>
            <div className="text-sm text-gray-300">
              <p><strong className="text-gold-400">Характер ({data.center}):</strong> Ваша основная энергия. Лидер, творец.</p>
              <div className="h-px bg-white/10 my-2" />
              <p><strong className="text-red-400">Кармический хвост ({data.karma}):</strong> То, что нужно проработать из прошлой жизни.</p>
            </div>
            
            <div className="relative">
              <div className="blur-sm select-none text-gray-500">
                <p>Финансовый канал: Очень важная информация скрыта. Ваши деньги зависят от...</p>
                <p>Отношения: Идеальный партнер встретится вам в месте...</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <MysticButton onClick={() => alert("Redirect to payment")}>
                   Открыть полную матрицу (1290 ⭐)
                </MysticButton>
              </div>
            </div>
          </div>

        </motion.div>
      ) : (
        <div className="text-center mt-10">
          <p className="text-gray-400">Сначала заполните профиль</p>
        </div>
      )}
    </div>
  );
};

export default Matrix;