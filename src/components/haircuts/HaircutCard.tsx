import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, MessageCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import { Haircut } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface HaircutCardProps {
  haircut: Haircut;
  onBookClick: (haircut: Haircut) => void;
}

const HaircutCard: React.FC<HaircutCardProps> = ({ haircut, onBookClick }) => {
  const { t } = useLanguage();
  const { user, toggleFavorite, isAuthenticated } = useAuth();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);

  const isFavorite = user?.favorites?.includes(haircut.id) || false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Если пользователь не авторизован, просто показываем подсказку
    if (!isAuthenticated) {
      alert('Чтобы добавить в избранное, необходимо войти как барбер');
      return;
    }

    toggleFavorite(haircut.id);
  };

  const handleConsultClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConsultModal(true);
  };

  // Прямой переход к бронированию без проверки авторизации
  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookClick(haircut);
  };

  return (
    <Card className="h-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <span className="sr-only">{t('loading')}</span>
          </div>
        )}

        <ImageWithFallback
          src={haircut.image}
          alt={haircut.title}
          className={`w-full h-64 object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* Показываем кнопку избранного только авторизованным пользователям */}
        {isAuthenticated && (
          <button
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isFavorite
                ? 'bg-[#9A0F34] text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } transition-colors shadow-md`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? t('removeFavorite') : t('favorite')}
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
            onClick={handleBookClick}
            className="flex-1"
          >
            {t('iWantThis')}
          </Button>

          <Button
            variant="outline"
            onClick={handleConsultClick}
            className="px-4"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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


              <a  href={`https://t.me/barber123`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-[#0088cc] text-white py-3 rounded-lg hover:bg-opacity-90"
              >
                Telegram
              </a>
            </div>
            <button
              onClick={() => setShowConsultModal(false)}
              className="mt-4 w-full text-gray-600 py-2"
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