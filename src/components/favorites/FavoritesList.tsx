import React, { useState, useEffect } from "react";
import { Heart, User, Scissors } from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { Link } from "react-router-dom";
import { favoritesAPI } from "../../api/services";
import { Favorite } from "../../types";
import { useAuth } from "../../context/AuthContext";
import ImageWithFallback from "../ui/ImageWithFallback";
import { useNotification } from "../../context/NotificationContext";

const FavoritesList: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite } = useAuth();
  const notification = useNotification();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await favoritesAPI.getAll();

      if (response.data) {
        setFavorites(
          Array.isArray(response.data)
            ? response.data
            : response.data.results || []
        );
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error("Ошибка при загрузке избранного:", err);
      setError("Не удалось загрузить избранное. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // Вспомогательная функция для определения ID услуги
  const getServiceId = (favorite: any): string | undefined => {
    if (favorite.service) return favorite.service;
    if (favorite.service_details?.id) return favorite.service_details.id;
    return undefined;
  };

  const handleRemoveFromFavorites = async (
    favoriteId: string,
    serviceId: string | undefined
  ) => {
    if (!serviceId) {
      console.error(
        "serviceId is undefined in handleRemoveFromFavorites",
        favoriteId
      );
      notification.error("Ошибка", "Не удалось определить ID услуги");
      return;
    }

    try {
      console.log("Removing favorite with serviceId:", serviceId);
      await toggleFavorite(serviceId);
      // Обновляем список избранного
      setFavorites((prevFavorites) =>
        prevFavorites.filter((fav) => fav.id !== favoriteId)
      );
      notification.success("Успешно", "Услуга удалена из избранного");
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
      notification.error("Ошибка", "Не удалось удалить из избранного");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="animate-pulse p-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => loadFavorites()}>Повторить загрузку</Button>
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">У вас пока нет избранных услуг</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.map((favorite) => (
        <Card key={favorite.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link to={`/gallery`} className="block">
                  <h3 className="font-medium text-lg mb-1 hover:text-[#9A0F34] transition-colors flex items-center">
                    <Scissors className="h-4 w-4 mr-2" />
                    {favorite.service_details?.title}
                  </h3>
                </Link>

                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <User className="h-4 w-4 mr-2" />
                  <span>{favorite.service_details?.barber}</span>
                </div>

                <div className="text-lg font-bold text-[#9A0F34]">
                  {favorite.service_details?.price} сом
                </div>

                <button
                  onClick={() => {
                    const serviceId = getServiceId(favorite);
                    if (serviceId) {
                      handleRemoveFromFavorites(favorite.id, serviceId);
                    } else {
                      console.error(
                        "Cannot determine service ID for favorite:",
                        favorite
                      );
                      notification.error(
                        "Ошибка",
                        "Не удалось определить ID услуги"
                      );
                    }
                  }}
                  className="mt-3 inline-flex items-center text-sm text-gray-500 hover:text-red-600"
                >
                  <Heart className="h-4 w-4 mr-1 fill-current" />
                  Удалить из избранного
                </button>
              </div>

              {favorite.service_details?.images && (
                <Link to={`/gallery`} className="block">
                  <div className="w-20 h-20 rounded-md overflow-hidden">
                    {favorite.service_details.images.map((item, index) => (
                      <ImageWithFallback
                        key={index}
                        src={item.image}
                        alt="image"
                        className="w-full h-full object-cover"
                      />
                    ))}
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FavoritesList;
