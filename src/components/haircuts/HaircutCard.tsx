import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
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

// Расширяем Haircut для новых полей контактов барбера
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

  // Проверяем избранное по user.favorites и haircut.isFavorite
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

  // Безопасное получение текущего изображения
  let currentImage = "";
  if (imagesArray.length > 0) {
    currentImage = imagesArray[currentImageIndex].image;
  }

  if (!currentImage) {
    currentImage = haircut.primaryImage || "";
  }

  const hasValidWhatsApp =
    typeof haircut.barberWhatsapp === "string" &&
    haircut.barberWhatsapp.length > 5;
  const hasValidTelegram =
    typeof haircut.barberTelegram === "string" &&
    haircut.barberTelegram.length > 3;
  const hasValidContacts = hasValidWhatsApp || hasValidTelegram;

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm transform transition-all duration-200 h-full border border-gray-100">
        <div className="relative aspect-square overflow-hidden">
          <ImageWithFallback
            src={currentImage}
            alt={haircut.title || "Изображение стрижки"}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

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

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {imagesArray.map((img, index) => (
                  <div
                    key={img.id}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "w-4 bg-white"
                        : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {haircut.views || 0}
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
            <button
              className={`p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors ${
                isFavorite ? "text-red-400" : "text-white"
              }`}
              onClick={handleFavoriteClick}
              aria-label={
                isFavorite ? "Удалить из избранного" : "Добавить в избранное"
              }
            >
              <Heart size={18} className={isFavorite ? "fill-red-400" : ""} />
            </button>

            {hasValidContacts && (
              <button
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors text-white"
                onClick={handleContactClick}
                aria-label="Связаться с барбером"
              >
                <MessageCircle size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-sm font-semibold mb-1 line-clamp-1">
            {haircut.title || "Без названия"}
          </h3>

          {haircut.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {haircut.description}
            </p>
          )}

          <div className="flex justify-between items-center text-xs text-gray-500">
            <button
              onClick={handleBarberClick}
              className="hover:text-blue-600 font-medium"
            >
              Барбер: {haircut.barber || "не указан"}
            </button>
            <span>
              {haircut.price ? `${haircut.price} ₽` : "Цена не указана"}
            </span>
          </div>

          <Button
            onClick={handleBookButtonClick}
            className="mt-3 w-full"
            size="sm"
            variant="primary"
          >
            Записаться
          </Button>
        </div>
      </div>

      {/* Модальное окно консультации */}
      <AnimatePresence>
        {showConsultModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConsultModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">
                Связаться с барбером
              </h2>
              <p className="mb-2">
                {hasValidWhatsApp && (
                  <>
                    <strong>WhatsApp:</strong>{" "}
                    <a
                      href={`https://wa.me/${haircut.barberWhatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {haircut.barberWhatsapp}
                    </a>
                  </>
                )}
              </p>
              <p className="mb-4">
                {hasValidTelegram && (
                  <>
                    <strong>Telegram:</strong>{" "}
                    <a
                      href={`https://t.me/${haircut.barberTelegram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      @{haircut.barberTelegram}
                    </a>
                  </>
                )}
              </p>
              <Button
                onClick={() => setShowConsultModal(false)}
                variant="secondary"
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
