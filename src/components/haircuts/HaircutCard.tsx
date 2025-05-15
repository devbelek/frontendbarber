import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, MessageCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import { Haircut } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { servicesAPI } from '../../api/services';

interface HaircutCardProps {
  haircut: Haircut;
  onBookClick: (haircut: Haircut) => void;
}

const HaircutCard: React.FC<HaircutCardProps> = ({ haircut, onBookClick }) => {
  const { t } = useLanguage();
  const { user, toggleFavorite, isAuthenticated } = useAuth();
  const notification = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showConsultModal, setShowConsultModal] = useState(false);

  const isFavorite = user?.favorites?.includes(haircut.id) || false;
  const hasMultipleImages = haircut.images && haircut.images.length > 1;

  // Отправляем запрос на увеличение просмотров
  React.useEffect(() => {
    const incrementViews = async () => {
      try {
        await servicesAPI.incrementViews(haircut.id);
      } catch (error) {
        console.error('Failed to increment views:', error);
      }
    };

    incrementViews();
  }, [haircut.id]);

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

  const currentImage = haircut.images && haircut.images.length > 0
    ? haircut.images[currentImageIndex].image
    : haircut.primaryImage;

  return (
    <Card className="h-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative group">
        <ImageWithFallback
          src={currentImage}
          alt={haircut.title}
          className="w-full h-64 object-cover"
        />

        {/* Навигация по изображениям */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Индикаторы изображений */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {haircut.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Счетчик просмотров */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Eye className="h-3 w-3 mr-1" />
          {haircut.views}
        </div>

        {isAuthenticated && (
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
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{haircut.title}</h3>

        <div className="flex justify-between items-center mb-3">
          <span className="text-[#9A0F34] font-bold">
            {haircut.price} {t('som')}
          </span>
          <Link to={`/barber/${haircut.barberId}`} className="text-sm text-gray-600 hover:text-[#9A0F34]">
            {haircut.barber}
          </Link>
        </div>

        {haircut.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {haircut.description}
          </p>
        )}

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Clock className="h-4 w-4 mr-1" />
          <span>{haircut.duration || '30'} мин</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-2">{haircut.type}</span>
          <span className="mx-2">•</span>
          <span>{haircut.location}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            fullWidth
            onClick={(e) => {
              e.preventDefault();
              onBookClick(haircut);
            }}
            className="flex-1"
          >
            {t('iWantThis')}
          </Button>

          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              setShowConsultModal(true);
            }}
            className="px-4"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Модальное окно консультации */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             onClick={(e) => {
               if (e.target === e.currentTarget) {
                 setShowConsultModal(false);
               }
             }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md"
               onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Консультация с барбером</h3>
            <p className="text-gray-600 mb-6">
              Свяжитесь с барбером, чтобы узнать, подойдет ли вам эта стрижка
            </p>
            <div className="space-y-4">
              <a href={`https://wa.me/+996700123456?text=Здравствуйте! Интересует стрижка "${haircut.title}"`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-[#25D366] text-white py-3 rounded-lg hover:bg-opacity-90"
              >
                WhatsApp
              </a>

              <a href={`https://t.me/barber123`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-[#0088cc] text-white py-3 rounded-lg hover:bg-opacity-90"
              >
                Telegram
              </a>
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