import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', darkMode = false }) => {
  // Размеры логотипа на основе размера
  const dimensions = {
    sm: { width: 24, height: 24, strokeWidth: 2 },
    md: { width: 32, height: 32, strokeWidth: 2 },
    lg: { width: 48, height: 48, strokeWidth: 2.5 },
  };

  // Цвета на основе темного/светлого режима
  const colors = darkMode
    ? { primary: '#ffffff', secondary: '#f4a4b8' }
    : { primary: '#9A0F34', secondary: '#7b0c29' };

  return (
    <div className="flex items-center">
      <motion.div
        whileHover={{ rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          width={dimensions[size].width}
          height={dimensions[size].height}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.primary}
          strokeWidth={dimensions[size].strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Исправленный путь SVG для гребня */}
          <path d="M5 3v18c0 .5 .5 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
          <path d="M8 6h8" />
          <path d="M8 10h8" />
          <path d="M8 14h8" />
          <path d="M8 18h8" />
        </svg>
      </motion.div>
      <div className="ml-2">
        <span className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
          <span className={darkMode ? "text-white" : "text-[#9A0F34]"}>TARAK</span>
        </span>
        <span className={`block -mt-1 text-xs ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          платформа барберов
        </span>
      </div>
    </div>
  );
};

export default Logo;