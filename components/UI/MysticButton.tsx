import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface Props extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const MysticButton: React.FC<Props> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  isLoading,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden rounded-xl px-6 py-3 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-gold-600 to-gold-400 text-mystic-900 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
    secondary: "bg-mystic-700 text-white hover:bg-mystic-600",
    outline: "border border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-mystic-900 border-t-transparent rounded-full animate-spin" />
          <span>Загрузка...</span>
        </div>
      ) : children}
    </motion.button>
  );
};

export default MysticButton;