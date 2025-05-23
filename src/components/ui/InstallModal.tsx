import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, onInstall }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Установите наше приложение!</h2>
        <p className="text-gray-600 mb-6 text-center">
          Получите быстрый доступ к лучшим стрижкам и барберам прямо с вашего телефона.
        </p>
        <button
          onClick={onInstall}
          className="bg-[#9A0F34] text-white px-4 py-2 rounded hover:bg-[#7b0c29] w-full"
        >
          Установить
        </button>
      </motion.div>
    </motion.div>
  );
};

export default InstallModal;