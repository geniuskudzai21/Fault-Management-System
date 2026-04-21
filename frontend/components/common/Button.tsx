
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'gradient' | 'neon' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: 'sunset' | 'ocean' | 'forest' | 'cosmic' | 'aurora' | 'galaxy';
  animated?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  leftIcon, 
  rightIcon, 
  gradient,
  animated = false,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseClasses = `inline-flex items-center justify-center ${sizeClasses[size]} font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md`;

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500/50 shadow-primary-500/25',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500/50 border border-gray-300',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500/50 shadow-danger-500/25',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500/50 shadow-success-500/25',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50 focus:ring-primary-500/50 border border-primary-200',
    gradient: `text-white bg-gradient-to-r ${gradient ? `gradient-${gradient}` : 'gradient-ocean'} hover:shadow-lg focus:ring-offset-0`,
    neon: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 focus:ring-primary-500/50 shadow-lg animate-glow',
    glass: 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 focus:ring-white/50 shadow-lg',
  };

  const animationClass = animated ? 'animate-bounce-in' : '';

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`} 
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
