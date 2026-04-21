
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat' | 'gradient' | 'glass' | 'neon';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  gradient?: 'sunset' | 'ocean' | 'forest' | 'cosmic' | 'aurora' | 'galaxy' | 'sunset-soft' | 'ocean-soft';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  hover = false,
  gradient
}) => {
  const paddingClasses = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const variantClasses = {
    default: 'bg-white rounded-lg shadow-sm border border-gray-100',
    elevated: 'bg-white rounded-xl shadow-lg border border-gray-100',
    outlined: 'bg-white rounded-lg border-2 border-gray-200',
    flat: 'bg-gray-50 rounded-lg border border-gray-200',
    gradient: `rounded-xl shadow-xl border border-white/20 bg-gradient-to-br ${gradient ? `gradient-${gradient}` : 'gradient-ocean'}`,
    glass: 'bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20',
    neon: 'bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-lg border border-primary/20',
  };

  const hoverClass = hover ? 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className} animate-fade-in`}>
      {children}
    </div>
  );
};

export default Card;
