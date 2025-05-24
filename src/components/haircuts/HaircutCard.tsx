// src/components/haircuts/HaircutCard.tsx
import React, { useState } from 'react';
import { Heart, Clock, MessageCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import { Haircut } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { servicesAPI } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HaircutCardProps {
  haircut: Haircut;
  onBookClick: (haircut: Haircut) => void;
}

const HaircutCard: React.FC<HaircutCardProps> = ({ haircut, onBookClick }) => {
  const { isAuthenticated, toggleFavorite, user } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showConsultModal, setShowConsultModal] = useState(false);

  // Добавляем проверки для свойств
  const haircutId = haircut?.id || '';
  const isFavorite = user?.favorites?.includes(haircutId) || haircut?.isFavorite || false;
  const hasMultipleImages = haircut?.images && Array.isArray(haircut.images) && haircut.images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? haircut.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === haircut.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      notification.info('Требуется вход', 'Чтобы добавить в избранное, необходимо войти');
      return;
    }

    try {
      await toggleFavorite(haircutId);
      notification.success(
        isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
        `Услуга "${haircut.title}" ${isFavorite ? 'удалена из' : 'добавлена в'} избранное`
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      notification.error('Ошибка', 'Не удалось изменить статус избранного');
    }
  };

  const handleBookButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Инкрементируем просмотры при нажатии на "Хочу также"
    try {
      if (haircutId) {
        await servicesAPI.incrementViews(haircutId);
      }
    } catch (error) {
      console.error('Failed to increment views:', error);
    }

    // Вызываем оригинальный обработчик бронирования
    onBookClick(haircut);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowConsultModal(true);
  };

  const handleBarberClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (haircut.barberId) {
      navigate(`/barber/${haircut.barberId}`);
    } else {
      notification.error('Ошибка', 'Информация о барбере недоступна');
    }
  };

  // Безопасное получение текущего изображения
  let currentImage = '';
  if (haircut.images && Array.isArray(haircut.images) && haircut.images.length > 0) {
    const img = haircut.images[currentImageIndex];
    currentImage = img && typeof img === 'object' && 'image' in img ? img.image : '';
  }

  // Если не нашли изображение в массиве, используем primaryImage или image
  if (!currentImage) {
    currentImage = haircut.primaryImage || haircut.image || '';
  }

  // Проверка наличия контактных данных барбера
  const hasValidWhatsApp = haircut.barberWhatsapp && haircut.barberWhatsapp.length > 5;
  const hasValidTelegram = haircut.barberTelegram && haircut.barberTelegram.length > 3;
  const hasValidContacts = hasValidWhatsApp || hasValidTelegram;

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm transform transition-all duration-200 h-full border border-gray-100">
        <div className="relative aspect-square overflow-hidden">
          <ImageWithFallback
            src={currentImage}
            alt={haircut.title || 'Изображение стрижки'}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Кнопки навигации по изображениям */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Индикаторы для изображений */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {haircut.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Счетчик просмотров */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {haircut.views || 0}
          </div>

          {/* Кнопки действий - перемещены в верхние углы с полупрозрачным фоном */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              className={`p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors ${
                isFavorite ? 'text-red-400' : 'text-white'
              }`}
              onClick={handleFavoriteClick}
            >
              <Heart size={18} className={isFavorite ? 'fill-red-400' : ''} />
            </button>

            {hasValidContacts && (
              <button
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors text-white"
                onClick={handleContactClick}
              >
                <MessageCircle size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-sm font-semibold mb-1 line-clamp-1">{haircut.title || 'Без названия'}</h3>

          {haircut.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{haircut.description}</p>
          )}

          <div className="flex justify-between items-center mb-2">
            <span className="text-[#9A0F34] font-bold text-sm">
              {Math.floor(haircut.price || 0)} сом
            </span>
            <button
              onClick={handleBarberClick}
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              {haircut.barber || 'Барбер'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleBookButtonClick}
            >
              Хочу такую же
            </Button>
          </div>
        </div>
      </div>

      {/* Модальное окно консультации с анимациями */}
      <AnimatePresence>
        {showConsultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConsultModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Связаться с барбером</h3>
                <p className="text-gray-600">Узнайте подойдет ли вам эта стрижка</p>
              </div>

              <div className="space-y-3">
                {hasValidWhatsApp && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`https://wa.me/${haircut.barberWhatsapp?.replace(/\D/g, '')}?text=Здравствуйте! Меня интересует стрижка "${haircut.title}"`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    WhatsApp
                  </motion.a>
                )}

                {hasValidTelegram && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`https://t.me/${haircut.barberTelegram?.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                    </svg>
                    Telegram
                  </motion.a>
                )}

                {!hasValidContacts && (
                  <div className="text-center text-gray-600 py-6">
                    <p className="mb-2">Контакты не указаны</p>
                    <p className="text-sm">Забронируйте через кнопку "Хочу также"</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowConsultModal(false)}
                className="mt-6 w-full text-gray-500 py-3 hover:text-gray-700 transition-colors font-medium"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HaircutCard;