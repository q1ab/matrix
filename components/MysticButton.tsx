import React from 'react';
import { TelegramService } from '../services/telegram';

interface MysticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'disabled-filled';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const MysticButton: React.FC<MysticButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  isLoading = false,
  className = '',
  onClick,
  disabled,
  ...props 
}) => {
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      TelegramService.haptic.impact('light');
      if (onClick) onClick(e);
    }
  };

  // Base styles
  const baseStyles = "relative rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed";
  
  const variants = {
    // Bright Gold Gradient
    primary: "bg-gradient-to-r from-amber-500 to-amber-600 text-mystic-dark shadow-lg shadow-amber-500/20 disabled:opacity-50",
    
    // Glass/Light
    secondary: "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50",
    
    // Outline
    outline: "border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 disabled:opacity-50",
    
    // Special variant for "Already Received" - looks disabled but filled with brown/gold-dim
    'disabled-filled': "bg-mystic-goldDim/30 text-amber-500/60 border border-amber-500/10 shadow-none pointer-events-none"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && (
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </div>
    </button>
  );
};