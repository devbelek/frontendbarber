import React from 'react';
import { motion } from 'framer-motion';

export const GlobalLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Центральный логотип */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9A0F34"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          >
            <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
            <path d="M8 6h8" />
            <path d="M8 10h8" />
            <path d="M8 14h8" />
            <path d="M8 18h8" />
          </svg>
        </motion.div>

        {/* Анимированные круги */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0 }}
          animate={{ scale: 2.5 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        >
          <div className="w-16 h-16 border-2 border-[#9A0F34] rounded-full opacity-20"></div>
        </motion.div>

        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0 }}
          animate={{ scale: 2.5 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.4
          }}
        >
          <div className="w-16 h-16 border-2 border-[#9A0F34] rounded-full opacity-20"></div>
        </motion.div>

        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0 }}
          animate={{ scale: 2.5 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.8
          }}
        >
          <div className="w-16 h-16 border-2 border-[#9A0F34] rounded-full opacity-20"></div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-1/3 text-center"
      >
        <h2 className="text-xl font-bold text-[#9A0F34] mb-2">TARAK</h2>
        <p className="text-gray-600 text-sm">Загрузка...</p>
      </motion.div>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* Прыгающие точки */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-[#9A0F34] rounded-full"
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <p className="text-gray-600 text-sm font-medium">Загружаем стрижки...</p>
      </div>
    </div>
  );
};