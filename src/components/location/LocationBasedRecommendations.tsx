// src/components/location/LocationBasedRecommendations.tsx (полный код)
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { locationAPI } from '../../api/services';
import { Haircut } from '../../types';
import axios from 'axios';

const LocationBasedRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Haircut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    locationName: string | null;
  }>({
    latitude: null,
    longitude: null,
    locationName: null,
  });
const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Получаем местоположение пользователя при загрузке компонента
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Проверяем разрешение на определение местоположения
  const checkLocationPermission = async () => {
    try {
      // Проверяем, есть ли у нас доступ к геолокации
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });
        setLocationPermission(permission.state as 'granted' | 'denied' | 'prompt');

        // Если разрешение предоставлено, получаем местоположение
        if (permission.state === 'granted') {
          getUserLocation();
        }
      } else {
        // Если API разрешений не поддерживается, пробуем получить местоположение напрямую
        getUserLocation();
      }
    } catch (err) {
      console.error('Ошибка при проверке разрешений геолокации:', err);
    }
  };

  // Получаем местоположение пользователя
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Сохраняем координаты
        setUserLocation({
          latitude,
          longitude,
          locationName: null,
        });

        // Получаем название местоположения через Nominatim (OpenStreetMap)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          // Извлекаем название местоположения
          let locationName = '';
          if (data.address) {
            if (data.address.city) {
              locationName = data.address.city;
            } else if (data.address.town) {
              locationName = data.address.town;
            } else if (data.address.village) {
              locationName = data.address.village;
            } else if (data.address.suburb) {
              locationName = data.address.suburb;
            }
          }

          setUserLocation(prev => ({
            ...prev,
            locationName: locationName || 'Ваше местоположение',
          }));

          // Загружаем рекомендации на основе местоположения
          getRecommendations(latitude, longitude);
        } catch (err) {
          console.error('Ошибка при получении названия местоположения:', err);
          setUserLocation(prev => ({
            ...prev,
            locationName: 'Ваше местоположение',
          }));

          // Даже если не удалось получить название, загружаем рекомендации
          getRecommendations(latitude, longitude);
        }
      },
      (error) => {
        console.error('Ошибка при получении геолокации:', error);
        setLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermission('denied');
            setError('Для получения рекомендаций поблизости разрешите доступ к геолокации');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Информация о местоположении недоступна');
            break;
          case error.TIMEOUT:
            setError('Превышено время ожидания при получении местоположения');
            break;
          default:
            setError('Произошла ошибка при определении местоположения');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 минут
      }
    );
  };

  // Получаем рекомендации на основе местоположения
  const getRecommendations = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);

      // В реальном приложении вызываем API
      try {
        const response = await axios.get(`/api/services/recommendations/?latitude=${latitude}&longitude=${longitude}`);
        if (response.data && Array.isArray(response.data)) {
          setRecommendations(response.data);
        } else {
          // Если API не вернуло данные, используем демо-данные
          setRecommendations(getDemoRecommendations());
        }
      } catch (error) {
        console.error('Error fetching recommendations from API:', error);
        // В случае ошибки используем демо-данные
        setRecommendations(getDemoRecommendations());
      }

      setShowRecommendations(true);
      setLoading(false);
    } catch (e) {
      console.error('Error getting recommendations:', e);
      setError('Не удалось загрузить рекомендации');
      setLoading(false);
    }
  };

  // Демо-данные для примера
  const getDemoRecommendations = (): Haircut[] => {
    return [
      {
        id: '101',
        image: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
        title: 'Стильный кроп',
        price: 600,
        barber: 'Максим К.',
        barberId: '2',
        type: 'crop',
        length: 'short',
        style: 'modern',
        location: 'Бишкек, рядом с вами',
        duration: 45
      },
      {
        id: '102',
        image: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg',
        title: 'Классический фейд',
        price: 500,
        barber: 'Александр П.',
        barberId: '1',
        type: 'fade',
        length: 'short',
        style: 'business',
        location: 'Бишкек, 2.5 км от вас',
        duration: 30
      },
      {
        id: '103',
        image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
        title: 'Текстурный андеркат',
        price: 700,
        barber: 'Руслан Д.',
        barberId: '3',
        type: 'undercut',
        length: 'medium',
        style: 'trendy',
        location: 'Бишкек, 3 км от вас',
        duration: 60
      }
    ];
  };

  // Кнопка для повторного запроса разрешения на геолокацию
  const handleRequestLocation = () => {
    setError(null);
    getUserLocation();
  };

  // Если рекомендации не показываются, отображаем кнопку "Показать барберов рядом"
  if (!showRecommendations) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <h2 className="text-xl font-bold flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#9A0F34]" />
            Барберы рядом с вами
          </h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto w-1/3"></div>
              </div>
            ) : error ? (
              <div className="text-center">
                <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{error}</p>
                <Button variant="primary" onClick={handleRequestLocation}>
                  Разрешить определение местоположения
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Разрешите доступ к вашему местоположению, чтобы увидеть барберов поблизости
                </p>
                <Button variant="primary" onClick={handleRequestLocation}>
                  Показать барберов рядом
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Если ошибка и рекомендации показываются, но их нет
  if (error && recommendations.length === 0) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <h2 className="text-xl font-bold flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#9A0F34]" />
            Барберы рядом с вами
          </h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{error}</p>
            <Button variant="primary" onClick={handleRequestLocation}>
              Повторить поиск
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Если нет рекомендаций, но местоположение определено
  if (recommendations.length === 0 && userLocation.latitude) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <h2 className="text-xl font-bold flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#9A0F34]" />
            Барберы рядом с {userLocation.locationName || 'вами'}
          </h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              К сожалению, рядом с вами не найдено барберов. Попробуйте расширить область поиска.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Отображаем рекомендации
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#9A0F34]" />
            Барберы рядом с {userLocation.locationName || 'вами'}
          </h2>
          <Button variant="text" size="sm" onClick={handleRequestLocation}>
            <Navigation className="w-4 h-4 mr-1" />
            Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="block h-full"
              >
                <div className="border rounded-md overflow-hidden h-full hover:shadow-md transition-shadow">
                  {service.image ? (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <Scissors className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{service.title}</h3>
                    <p className="text-gray-600">{service.barber}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[#9A0F34] font-bold">
                        {service.price} ₽
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {service.location}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationBasedRecommendations;