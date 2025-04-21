import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', variant = 'full' }) => {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-12',
  };

  return (
    <div className={`flex items-center justify-center ${variant === 'icon' ? '' : 'space-x-2'}`}>
      <img 
        src="https://cooc.london/wp-content/uploads/2024/11/COOC-Logo-White.png" 
        alt="COOC" 
        className={`${sizeClasses[size]} w-auto`}
      />
    </div>
  );
};

export default Logo;