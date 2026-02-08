import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { MysticButton } from '../components/MysticButton';
import { TelegramService } from '../services/telegram';
import { MatrixResponse } from '../types';
import { Lock, Sparkles, ChevronDown, FileText } from 'lucide-react';

// --- SVG Components ---

const MatrixNode = ({ x, y, value, color, delay, label }: { x: number; y: number; value: number; color: string; delay: number; label?: string }) => (
  <motion.g
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
  >
    {/* Glow underlay */}
    <circle cx={x} cy={y} r="25" fill={color} opacity="0.2" />
    
    {/* Main Circle */}
    <circle cx={x} cy={y} r="18" fill="rgba(15, 5, 24, 0.9)" stroke={color} strokeWidth="2" />
    
    {/* Inner decorative ring */}
    <circle cx={x} cy={y} r="14" stroke={color} strokeWidth="0.5" opacity="0.5" strokeDasharray="2 2" />

    {/* Text Value */}
    <text x={x} y={y} dy="0.35em" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="monospace">
      {value}
    </text>

    {/* Label (Day/Month/etc) */}
    {label && (
      <motion.text 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: delay + 0.5 }}
        x={x} 
        y={y + 35} 
        textAnchor="middle" 
        fill={color} 
        fontSize="10" 
        fontWeight="bold" 
        letterSpacing="1px"
        className="uppercase"
      >
        {label}
      </motion.text>
    )}
  </motion.g>
);

const ConnectionLine = ({ x1, y1, x2, y2, color, delay }: { x1: number; y1: number; x2: number; y2: number; color: string; delay: number }) => (
  <motion.line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.6 }}
    transition={{ delay, duration: 1.5, ease: "easeInOut" }}
  />
);

const MatrixVisualizer = ({ data }: { data: MatrixResponse }) => {
  // SVG Coordinate System (400x400)
  const cx = 200, cy = 200; // Center
  const r = 140; // Radius to corners
  
  const top = { x: cx, y: cy - r };
  const right = { x: cx + r, y: cy };
  const bottom = { x: cx, y: cy + r };
  const left = { x: cx - r, y: cy };

  return (
    <div className="w-full aspect-square max-w-[340px] mx-auto relative my-8">
      {/* Background Rotating Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-amber-500/10 rounded-full opacity-50 blur-3xl" />

      <svg viewBox="0 0 400 440" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="gradientMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <radialGradient id="gradientGold">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>

        {/* Diamond Shape */}
        <motion.path
          d={`M ${top.x} ${top.y} L ${right.x} ${right.y} L ${bottom.x} ${bottom.y} L ${left.x} ${left.y} Z`}
          fill="rgba(255, 255, 255, 0.03)"
          stroke="url(#gradientMain)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Cross Lines */}
        <ConnectionLine x1={left.x} y1={left.y} x2={right.x} y2={right.y} color="#fbbf24" delay={0.5} />
        <ConnectionLine x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} color="#fbbf24" delay={0.5} />
        
        {/* Nodes */}
        <MatrixNode x={left.x} y={left.y} value={data.day} color="#60a5fa" delay={0.8} label="День" />
        <MatrixNode x={top.x} y={top.y} value={data.month} color="#c084fc" delay={1.0} label="Месяц" />
        <MatrixNode x={right.x} y={right.y} value={data.year} color="#4ade80" delay={1.2} label="Год" />
        <MatrixNode x={bottom.x} y={bottom.y} value={data.bottom} color="#f43f5e" delay={1.4} label="Карма" />
        
        {/* Center Node (Bigger) */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.6, type: 'spring' }}
        >
          <circle cx={cx} cy={cy} r="35" fill="url(#gradientGold)" opacity="0.9" />
          <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fill="#1a0b2e" fontSize="20" fontWeight="bold">
            {data.center}
          </text>
           <text x={cx} y={cy + 50} textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold" letterSpacing="2px">
            СУТЬ
          </text>
        </motion.g>
      </svg>
    </div>
  );
};

// --- Typewriter Text Component ---
const TypewriterText = ({ text, delay }: { text: string; delay: number }) => {
  const words = text.split(" ");
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 5, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeOut" } 
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-sm text-gray-100 leading-relaxed font-light"
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span variants={child} className="inline-block">
            {word}
          </motion.span>
          {/* Add space unless it's the last word */}
          {index < words.length - 1 && " "} 
        </React.Fragment>
      ))}
    </motion.div>
  );
};


// --- Main Page Component ---

export const Matrix = () => {
  const { user, refreshUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');

  const saveBirthDate = async () => {
    if (birthDate && birthDate !== user?.birth_date) {
      await api.updateMe({ birth_date: birthDate });
      await refreshUser();
    }
  };

  const fetchMatrix = async (full: boolean = false) => {
    if (!birthDate) return;
    setLoading(true);
    
    try {
      await saveBirthDate();
      const data = await api.getMatrix({ birth_date: birthDate, full });
      setMatrixData(data);
      TelegramService.haptic.notification('success');
    } catch (e: any) {
        TelegramService.haptic.notification('error');
        TelegramService.showConfirm('Ошибка: ' + e.detail, () => {});
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
          await refreshUser();
          // Re-fetch with full=true to show unlocked content
          fetchMatrix(true);
        } else {
          TelegramService.haptic.notification('error');
        }
      });
    } catch (e) {
      alert('Ошибка оплаты');
    }
  };

  const isLocked = matrixData?.blocks?.some(b => b.is_locked);

  return (
    <div className="min-h-[100dvh] pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] px-4 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <h1 className="text-2xl font-bold mb-8 text-center text-white drop-shadow-md flex items-center justify-center gap-2">
        <Grid size={24} className="text-amber-200" />
        <span>Матрица Судьбы</span>
      </h1>

      <AnimatePresence mode="wait">
        {!matrixData ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm mx-auto space-y-8"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-20">
                 <Sparkles className="text-amber-400" size={48} />
               </div>
               
               <label className="text-xs text-amber-400 block mb-3 uppercase tracking-widest font-bold">Дата рождения</label>
               <input 
                 type="date" 
                 value={birthDate}
                 onChange={(e) => setBirthDate(e.target.value)}
                 className="w-full bg-mystic-dark/60 rounded-xl px-4 py-4 border border-white/10 text-white text-xl text-center font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-gray-600"
               />
               <p className="text-[10px] text-gray-500 mt-4 text-center">
                 Дата необходима для расчета ваших арканов
               </p>
            </div>

            <MysticButton 
              className="w-full shadow-neon" 
              size="lg"
              onClick={() => fetchMatrix(false)}
              isLoading={loading}
              disabled={!birthDate}
            >
              Рассчитать Матрицу
            </MysticButton>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md mx-auto"
          >
            {/* The SVG Visualization */}
            <MatrixVisualizer data={matrixData} />

            {/* Advice Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="glass-panel rounded-2xl p-5 border-l-4 border-l-amber-500 relative mt-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                 <Sparkles className="text-amber-400" size={16} />
                 <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Главный Аркан</h3>
              </div>
              <TypewriterText text={matrixData.advice} delay={2.7} />
            </motion.div>

            {/* Analysis Blocks */}
            <div className="space-y-4 mb-24">
              {matrixData.blocks?.map((block, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2.8 + idx * 0.1 }}
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
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Locked CTA - Sticky Bottom */}
            {isLocked && (
              <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-gradient-to-t from-mystic-dark via-mystic-dark/95 to-transparent z-40">
                 <div className="max-w-md mx-auto space-y-3">
                   <MysticButton 
                     fullWidth 
                     onClick={() => handleBuy('MATRIX_MINI')}
                     className="shadow-gold border border-amber-500/50"
                   >
                     <div className="flex flex-col items-center leading-tight">
                       <span className="text-sm font-bold">Разблокировать разбор</span>
                       <span className="text-[10px] opacity-80">690 ⭐</span>
                     </div>
                   </MysticButton>

                   <button 
                     onClick={() => handleBuy('MATRIX_PRO')}
                     className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-between px-4 transition-colors group backdrop-blur-md"
                   >
                      <div className="flex items-center gap-3 text-left">
                         <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                           <FileText size={18} />
                         </div>
                         <div>
                           <div className="text-xs font-bold text-white">PRO Отчет (PDF)</div>
                           <div className="text-[9px] text-gray-400">Полный файл + прогноз</div>
                         </div>
                      </div>
                      <div className="text-amber-400 font-bold text-sm bg-black/20 px-2 py-1 rounded">
                         1290 ⭐
                      </div>
                   </button>
                 </div>
              </div>
            )}

            {!isLocked && (
               <div className="text-center text-amber-400 text-sm font-bold py-4">
                  ✨ Полный доступ активирован
               </div>
            )}

            <div className="flex justify-center pb-8 mt-4">
               <button 
                 onClick={() => setMatrixData(null)}
                 className="text-gray-500 text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
               >
                 <ChevronDown className="rotate-90" size={12} /> Изменить дату
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
import { Grid } from 'lucide-react';