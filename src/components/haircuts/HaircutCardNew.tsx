import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, MessageCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Card, Button } from '../../ui';
import ImageWithFallback from '../ui/ImageWithFallback';
import { Haircut } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface HaircutCardProps {
  haircut: Haircut;
  onBookClick: (haircut: Haircut) => void;
}

const HaircutCardNew: React.FC<HaircutCardProps> = ({ haircut, onBookClick }) => {
  const { isAuthenticated, toggleFavorite, user } = useAuth();
  const notification = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  const currentImage = haircut.images && haircut.images.length > 0
    ? haircut.images[currentImageIndex].image
    : haircut.primaryImage;

  return (
    <Card
      className="h-full transform transition-all duration-300 hover:-translate-y-1 border-0 shadow-soft"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback
          src={currentImage}
          alt={haircut.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
              ? 'bg-brand-600 text-white'
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
          <span className="text-brand-600 font-bold text-lg">
            {haircut.price} сом
          </span>
          <Link to={`/barber/${haircut.barberId}`} className="text-sm text-gray-600 hover:text-brand-600 underline-offset-4 hover:underline">
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
            onClick={() => onBookClick(haircut)}
            className="flex-1"
          >
            Хочу такую же
          </Button>

          <Button
            variant="outline"
            className="px-2 flex-shrink-0"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default HaircutCardNew;