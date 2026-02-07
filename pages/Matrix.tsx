import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { MysticButton } from '../components/MysticButton';
import { TelegramService } from '../services/telegram';
import { MatrixResponse, Product } from '../types';
import { Lock, Sparkles, Star, ChevronRight, X } from 'lucide-react';

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
      {/* Background Rotating Gradient - Simplified for FPS */}
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

// --- Paywall Component ---

const PaywallOverlay = ({ onBuy, onClose }: { onBuy: (code: string) => void; onClose: () => void }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Attempt to load real prices
    api.getProducts().then(setProducts).catch(() => {});

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const getPrice = (code: string, defaultPrice: number) => {
    const p = products.find(i => i.code === code);
    return p ? p.price_stars : defaultPrice;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] pb-[calc(1rem+env(safe-area-inset-bottom))]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-panel w-full max-w-sm rounded-3xl p-6 relative border border-amber-500/20 shadow-2xl max-h-[80vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] pointer-events-none" />
        
        <div className="text-center mb-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto flex items-center justify-center shadow-gold mb-4 rotate-3">
             <Lock className="text-mystic-dark" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Энергия закрыта</h2>
          <p className="text-gray-300 text-sm">
            Чтобы построить матрицу, необходим энергетический обмен. Выберите уровень доступа:
          </p>
        </div>

        <div className="space-y-3 mb-6 relative z-10">
          <button 
            onClick={() => onBuy('MATRIX_MINI')}
            className="w-full glass-panel p-4 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white/5 border border-white/10"
          >
             <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                 <Sparkles size={18} />
               </div>
               <div className="text-left">
                 <div className="font-bold text-white text-sm">MINI Доступ</div>
                 <div className="text-[10px] text-gray-400">Базовая матрица</div>
               </div>
             </div>
             <div className="text-white font-bold text-sm bg-white/10 px-3 py-1 rounded-lg">
                {getPrice('MATRIX_MINI', 690)} ⭐
             </div>
          </button>

          <button 
            onClick={() => onBuy('MATRIX_PRO')}
            className="w-full p-4 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-all relative overflow-hidden border border-amber-500/50"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 group-hover:opacity-100 transition-opacity" />
             
             <div className="flex items-center gap-3 relative z-10">
               <div className="p-2 bg-amber-500 rounded-lg text-mystic-dark shadow-gold">
                 <Star size={18} fill="currentColor" />
               </div>
               <div className="text-left">
                 <div className="font-bold text-white text-sm">PRO Full</div>
                 <div className="text-[10px] text-amber-200">Полная расшифровка + PDF</div>
               </div>
             </div>
             <div className="text-amber-400 font-bold text-sm bg-mystic-dark/50 px-3 py-1 rounded-lg border border-amber-500/30 relative z-10">
                {getPrice('MATRIX_PRO', 1290)} ⭐
             </div>
          </button>
        </div>

        <button onClick={onClose} className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors py-2 relative z-10">
          Вернуться назад
        </button>
      </motion.div>
    </motion.div>
  );
};


// --- Main Page Component ---

export const Matrix = () => {
  const { user, refreshUser } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingFull, setPendingFull] = useState(false);

  // Auto-save birthdate if changed
  const saveBirthDate = async () => {
    if (birthDate && birthDate !== user?.birth_date) {
      await api.updateMe({ birth_date: birthDate });
      await refreshUser();
    }
  };

  const fetchMatrix = async (full: boolean) => {
    if (!birthDate) return;
    setLoading(true);
    setPendingFull(full);
    
    try {
      await saveBirthDate();
      const data = await api.getMatrix({ birth_date: birthDate, full });
      setMatrixData(data);
      setShowPaywall(false);
      TelegramService.haptic.notification('success');
    } catch (e: any) {
      if (e.status === 402) {
        TelegramService.haptic.notification('warning');
        setShowPaywall(true);
      } else {
        TelegramService.haptic.notification('error');
        TelegramService.showConfirm('Ошибка: ' + e.detail, () => {});
      }
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
          setShowPaywall(false);
          // Retry original request (Mini or Pro depends on what they bought, 
          // but usually we retry the one they clicked. For simplicity retry what was pending)
          fetchMatrix(code === 'MATRIX_PRO'); 
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
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <h1 className="text-2xl font-bold mb-8 text-center text-white drop-shadow-md">Матрица Судьбы</h1>

      <AnimatePresence>
        {!matrixData ? (
          <motion.div 
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

            <div className="grid grid-cols-1 gap-4">
              <MysticButton 
                variant="secondary"
                className="w-full" 
                onClick={() => fetchMatrix(false)}
                isLoading={loading && !pendingFull}
                disabled={!birthDate}
              >
                Рассчитать Lite (Базовая)
              </MysticButton>
              
              <MysticButton 
                className="w-full shadow-neon"
                onClick={() => fetchMatrix(true)}
                isLoading={loading && pendingFull}
                disabled={!birthDate}
              >
                <div className="flex items-center justify-center gap-2">
                   <span>Рассчитать PRO (Полная)</span>
                   <Lock size={14} className="opacity-70" />
                </div>
              </MysticButton>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md mx-auto"
          >
            {/* The SVG Visualization */}
            <MatrixVisualizer data={matrixData} />

            {/* Advice Card */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.5, type: 'spring' }}
              className="glass-panel rounded-2xl p-6 border-l-4 border-l-amber-500 relative mt-6"
            >
              <div className="flex items-center gap-2 mb-3">
                 <Sparkles className="text-amber-400" size={16} />
                 <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Совет Аркана</h3>
              </div>
              <p className="text-sm text-gray-100 leading-relaxed font-light">
                {matrixData.advice}
              </p>
            </motion.div>

            <div className="mt-8 flex justify-center">
               <button 
                 onClick={() => setMatrixData(null)}
                 className="text-gray-500 text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
               >
                 <ChevronRight className="rotate-180" size={14} /> Рассчитать заново
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paywall Overlay */}
      <AnimatePresence>
        {showPaywall && (
          <PaywallOverlay 
            onBuy={handleBuy} 
            onClose={() => setShowPaywall(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
