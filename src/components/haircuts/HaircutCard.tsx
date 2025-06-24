import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import Button from "../ui/Button";
import ImageWithFallback from "../ui/ImageWithFallback";
import { Haircut, ServiceImage } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { servicesAPI } from "../../api/services";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface HaircutExtended extends Haircut {
  barberWhatsapp?: string;
  barberTelegram?: string;
}

interface HaircutCardProps {
  haircut: HaircutExtended;
  onBookClick: (haircut: HaircutExtended) => void;
}

const HaircutCard: React.FC<HaircutCardProps> = ({ haircut, onBookClick }) => {
  const { isAuthenticated, toggleFavorite, user } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showConsultModal, setShowConsultModal] = useState(false);

  const haircutId = haircut?.id || "";
  const isFavorite =
    user?.favorites?.includes(haircutId) || haircut?.isFavorite || false;

  const imagesArray: ServiceImage[] = Array.isArray(haircut.images)
    ? haircut.images
    : [];
  const hasMultipleImages = imagesArray.length > 1;

  const handlePrevImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? imagesArray.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === imagesArray.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleFavoriteClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      notification.info(
        "Требуется вход",
        "Чтобы добавить в избранное, необходимо войти"
      );
      return;
    }
    if (!toggleFavorite) {
      notification.error("Ошибка", "Функция избранного недоступна");
      return;
    }
    try {
      await toggleFavorite(haircutId);
      notification.success(
        isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
        `Услуга "${haircut.title}" ${
          isFavorite ? "удалена из" : "добавлена в"
        } избранное`
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      notification.error("Ошибка", "Не удалось изменить статус избранного");
    }
  };

  const handleBookButtonClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      if (haircutId) {
        await servicesAPI.incrementViews(haircutId);
      }
    } catch (error) {
      console.error("Failed to increment views:", error);
    }
    onBookClick(haircut);
  };

  const handleContactClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setShowConsultModal(true);
  };

  const handleBarberClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (haircut.barberId) {
      navigate(`/barber/${haircut.barberId}`);
    } else {
      notification.error("Ошибка", "Информация о барбере недоступна");
    }
  };

  let currentImage =
    imagesArray.length > 0
      ? imagesArray[currentImageIndex].image
      : haircut.primaryImage || "";

  const hasValidWhatsApp =
    typeof haircut.barberWhatsapp === "string" &&
    haircut.barberWhatsapp.length > 5;
  const hasValidTelegram =
    typeof haircut.barberTelegram === "string" &&
    haircut.barberTelegram.length > 3;
  const hasValidContacts = hasValidWhatsApp || hasValidTelegram;

  return (
    <>
      <motion.div
        className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 flex flex-col h-full"
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={currentImage}
                alt={haircut.title || "Изображение стрижки"}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 sm:gap-1">
                {imagesArray.map((img, index) => (
                  <motion.div
                    key={img.id}
                    className={`h-1 sm:h-1.5 rounded-full ${
                      index === currentImageIndex
                        ? "w-3 sm:w-4 bg-rose-500"
                        : "w-1 sm:w-1.5 bg-white/70"
                    }`}
                    animate={{ scale: index === currentImageIndex ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-black/60 text-white px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs flex items-center">
            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />
            {haircut.views || 0}
          </div>

          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-0.5 sm:gap-1">
            <button
              className={`p-1 sm:p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-rose-500/80 transition-all ${
                isFavorite ? "text-red-400" : "text-white"
              }`}
              onClick={handleFavoriteClick}
              aria-label={
                isFavorite ? "Удалить из избранного" : "Добавить в избранное"
              }
            >
              <Heart
                size={14}
                sm:size={16}
                className={isFavorite ? "fill-red-400" : ""}
              />
            </button>
            {hasValidContacts && (
              <button
                className="p-1 sm:p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-rose-500/80 transition-all text-white"
                onClick={handleContactClick}
                aria-label="Связаться с барбером"
              >
                <MessageSquare size={14} sm:size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="p-2 sm:p-3 flex flex-col flex-1">
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-1">
            {haircut.title || "Без названия"}
          </h3>
          {haircut.description && (
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 line-clamp-2 mt-0.5 sm:mt-1">
              {haircut.description}
            </p>
          )}
          <div className="flex justify-between items-center text-[11px] sm:text-xs md:text-sm text-gray-500 mt-1 sm:mt-2">
            <button
              onClick={handleBarberClick}
              className="hover:text-rose-600 font-medium transition-colors"
            >
              {haircut.barber || "не указан"}
            </button>
            <span className="text-rose-600 font-medium">
              {haircut.price ? `${haircut.price} ₽` : "Цена не указана"}
            </span>
          </div>
          <Button
            onClick={handleBookButtonClick}
            className="mt-2 sm:mt-3 w-full bg-gradient-to-r from-[#9a0f34] to-[#6b0824] text-white hover:from-[#7a0c2a] hover:to-[#5a071f] rounded-lg text-[11px] sm:text-xs md:text-sm py-1.5 sm:py-2 shadow-sm hover:shadow-md transition-all"
            size="sm"
            variant="primary"
          >
            Записаться
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showConsultModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConsultModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-4 sm:p-5 max-w-[90vw] sm:max-w-xs w-full shadow-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                Связаться с барбером
              </h2>
              {hasValidWhatsApp && (
                <p className="text-xs sm:text-sm text-gray-700 mb-2 flex items-center gap-1">
                  <span className="font-medium">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${haircut.barberWhatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 hover:text-rose-700 underline"
                  >
                    {haircut.barberWhatsapp}
                  </a>
                </p>
              )}
              {hasValidTelegram && (
                <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 flex items-center gap-1">
                  <span className="font-medium">Telegram:</span>
                  <a
                    href={`https://t.me/${haircut.barberTelegram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 hover:text-rose-700 underline"
                  >
                    @{haircut.barberTelegram}
                  </a>
                </p>
              )}
              <Button
                onClick={() => setShowConsultModal(false)}
                variant="outline"
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-rose-600 text-xs sm:text-sm rounded-lg"
              >
                Закрыть
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HaircutCard;
