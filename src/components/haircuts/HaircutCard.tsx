// src/components/haircuts/HaircutCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, MessageCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import { Haircut } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { servicesAPI } from '../../api/services';

interface HaircutCardProps {
  haircut: Haircut;
  onBookClick: (haircut: Haircut) => void;
}

const HaircutCard: React.FC<HaircutCardProps> = ({ haircut, onBookClick }) => {
  const { isAuthenticated, toggleFavorite, user } = useAuth();
  const notification = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);

  const isFavorite = user?.favorites?.includes(haircut.id) || false;
  const hasMultipleImages = haircut.images && haircut.images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? haircut.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === haircut.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      notification.info('Требуется вход', 'Чтобы добавить в избранное, необходимо войти');
      return;
    }

    try {
      await toggleFavorite(haircut.id);
      notification.success(
        isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
        `Услуга "${haircut.title}" ${isFavorite ? 'удалена из' : 'добавлена в'} избранное`
      );
    } catch (error) {
      notification.error('Ошибка', 'Не удалось изменить статус избранного');
    }
  };

  const handleBookButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Инкрементируем просмотры при нажатии на "Хочу также"
    try {
      if (haircut.id) {
        const serviceId = String(haircut.id);
        await servicesAPI.incrementViews(serviceId);
      }
    } catch (error) {
      console.error('Failed to increment views:', error);
    }

    // Вызываем оригинальный обработчик бронирования
    onBookClick(haircut);
  };

  const currentImage = haircut.images && haircut.images.length > 0
    ? haircut.images[currentImageIndex].image
    : haircut.primaryImage;

  // Проверка наличия контактных данных барбера
  const hasValidWhatsApp = haircut.barberWhatsapp && haircut.barberWhatsapp.length > 5;
  const hasValidTelegram = haircut.barberTelegram && haircut.barberTelegram.length > 3;
  const hasValidContacts = hasValidWhatsApp || hasValidTelegram;

  return (
    <Card
      className="h-full transform transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback
          src={currentImage}
          alt={haircut.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Навигация по изображениям */}
        {hasMultipleImages && isHovered && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Индикаторы изображений */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {haircut.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Счетчик просмотров */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Eye className="h-3 w-3 mr-1" />
          {haircut.views || 0}
        </div>

        {/* Кнопка избранного */}
        <button
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isFavorite
              ? 'bg-[#9A0F34] text-white'
              : 'bg-white text-gray-800 hover:bg-gray-100'
          } transition-colors shadow-md`}
          onClick={handleFavoriteClick}
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-current' : ''}
          />
        </button>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1">{haircut.title}</h3>

        <div className="flex justify-between items-center mb-3">
          <span className="text-[#9A0F34] font-bold text-lg">
            {haircut.price} сом
          </span>
          <Link to={`/barber/${haircut.barberId}`} className="text-sm text-gray-600 hover:text-[#9A0F34] underline-offset-4 hover:underline">
            {haircut.barber}
          </Link>
        </div>

        {haircut.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {haircut.description}
          </p>
        )}

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>{haircut.duration || '30'} мин</span>
          <span className="mx-2">•</span>
          <span>{haircut.location}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            fullWidth
            onClick={handleBookButtonClick}
            className="flex-1"
          >
            Хочу такую же
          </Button>

          <Button
            variant="outline"
            className="px-2 flex-shrink-0"
            onClick={() => setShowConsultModal(true)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Модальное окно консультации */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             onClick={() => setShowConsultModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md"
               onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Консультация с барбером</h3>
            <p className="text-gray-600 mb-6">
              Свяжитесь с барбером, чтобы узнать, подойдет ли вам эта стрижка
            </p>
            <div className="space-y-4">
              {hasValidWhatsApp && (
                <a href={`https://wa.me/${haircut.barberWhatsapp.replace(/\D/g, '')}?text=Здравствуйте! Интересует стрижка "${haircut.title}"`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#25D366] text-white py-3 rounded-lg hover:bg-opacity-90"
                >
                  WhatsApp
                </a>
              )}

              {hasValidTelegram && (
                <a href={`https://t.me/${haircut.barberTelegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#0088cc] text-white py-3 rounded-lg hover:bg-opacity-90"
                >
                  Telegram
                </a>
              )}

              {!hasValidContacts && (
                <div className="text-center text-gray-600 py-4">
                  <p>Барбер не указал контактные данные.</p>
                  <p className="mt-2">Попробуйте сделать бронирование через кнопку "Хочу также".</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowConsultModal(false)}
              className="mt-4 w-full text-gray-600 py-2 hover:text-gray-800"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default HaircutCard;