// src/components/location/LocationBasedRecommendations.tsx
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { profileAPI } from '../../api/services';
import { Barber } from '../../types';
import ImageWithFallback from '../ui/ImageWithFallback';
import { PageLoader } from '../ui/GlobalLoader';

const LocationBasedBarbers: React.FC = () => {
  const [nearbyBarbers, setNearbyBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    city: string | null;
    district: string | null;
  }>({
    latitude: null,
    longitude: null,
    address: null,
    city: null,
    district: null,
  });
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });
        setLocationPermission(permission.state as 'granted' | 'denied' | 'prompt');

        if (permission.state === 'granted') {
          getUserLocation();
        }
      } else {
        getUserLocation();
      }
    } catch (err) {
      console.error('Ошибка при проверке разрешений геолокации:', err);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setUserLocation(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          let locationDetails = {
            address: null as string | null,
            city: null as string | null,
            district: null as string | null,
          };

          if (data.address) {
            // Определяем город
            locationDetails.city = data.address.city ||
                                  data.address.town ||
                                  data.address.village ||
                                  data.address.municipality ||
                                  'Неизвестный город';

            // Определяем район или микрорайон
            locationDetails.district = data.address.suburb ||
                                      data.address.neighbourhood ||
                                      data.address.district ||
                                      data.address.quarter ||
                                      null;

            // Формируем полный адрес
            const parts = [];

            if (data.address.city || data.address.town) {
              parts.push(data.address.city || data.address.town);
            }

            if (locationDetails.district) {
              parts.push(locationDetails.district);
            }

            if (data.address.road) {
              parts.push(data.address.road);
              if (data.address.house_number) {
                parts.push(data.address.house_number);
              }
            }

            locationDetails.address = parts.join(', ');
          }

          setUserLocation(prev => ({
            ...prev,
            address: locationDetails.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            city: locationDetails.city,
            district: locationDetails.district,
          }));

          getBarbers();
        } catch (err) {
          console.error('Ошибка при получении адреса:', err);
          setUserLocation(prev => ({
            ...prev,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            city: 'Неизвестный город',
            district: null,
          }));

          getBarbers();
        }
      },
      (error) => {
        console.error('Ошибка при получении геолокации:', error);
        setLoading(false);
        setLocationPermission('denied');
        setError('Для получения рекомендаций поблизости разрешите доступ к геолокации');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  };

  const getBarbers = async () => {
    try {
      setLoading(true);

      const response = await profileAPI.getAllBarbers();

      if (response.data) {
        let barbersData = [];

        if (response.data.results && Array.isArray(response.data.results)) {
          barbersData = response.data.results;
        } else if (Array.isArray(response.data)) {
          barbersData = response.data;
        }

        // Преобразуем барберов и добавляем расстояние
        const barbersWithProfile = barbersData.map((user: any) => {
          let distance = null;

          // Рассчитываем расстояние, если есть координаты барбера и пользователя
          if (user.profile?.latitude && user.profile?.longitude &&
              userLocation.latitude && userLocation.longitude) {
            distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              user.profile.latitude,
              user.profile.longitude
            );
          }

          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            avatar: user.profile?.photo || null,
            rating: 0,
            reviewCount: 0,
            specialization: user.profile?.specialization || [],
            location: user.profile?.address || 'Не указано',
            distance: distance,
            workingHours: {
              from: user.profile?.working_hours_from || '09:00',
              to: user.profile?.working_hours_to || '18:00',
              days: user.profile?.working_days || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
            },
            portfolio: [],
            description: user.profile?.bio || 'Информация о барбере',
            whatsapp: user.profile?.whatsapp || '',
            telegram: user.profile?.telegram || '',
            offerHomeService: user.profile?.offers_home_service || false
          };
        });

        // Сортируем по расстоянию, если оно есть
        const sortedBarbers = barbersWithProfile.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

        setNearbyBarbers(sortedBarbers);
      }

      setShowRecommendations(true);
      setLoading(false);
    } catch (e) {
      console.error('Error getting barbers:', e);
      setError('Не удалось загрузить барберов');
      setLoading(false);
    }
  };

  // Расчет расстояния между двумя точками с координатами
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // радиус Земли в км
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Расстояние в км
    return parseFloat(distance.toFixed(1));
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const handleRequestLocation = () => {
    setError(null);
    getUserLocation();
  };

  // Формируем строку местоположения для отображения
  const getLocationDisplay = () => {
    if (!userLocation.latitude) return '';

    if (userLocation.district && userLocation.city) {
      return `${userLocation.city}, ${userLocation.district}`;
    } else if (userLocation.city) {
      return userLocation.city;
    } else if (userLocation.address) {
      return userLocation.address;
    }

    return 'Ваше местоположение';
  };

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

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#9A0F34]" />
            Барберы рядом с вами
            {getLocationDisplay() && (
              <span className="text-base font-normal text-gray-600 ml-2">
                • {getLocationDisplay()}
              </span>
            )}
          </h2>
          <Button variant="text" size="sm" onClick={handleRequestLocation}>
            <Navigation className="w-4 h-4 mr-1" />
            Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PageLoader />
        ) : nearbyBarbers.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              К сожалению, рядом с вами не найдено барберов. Попробуйте расширить область поиска.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyBarbers.map((barber) => (
              <Link
                key={barber.id}
                to={`/barber/${barber.id}`}
                className="block h-full"
              >
                <div className="border rounded-md overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {barber.avatar ? (
                      <ImageWithFallback
                        src={barber.avatar}
                        alt={barber.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{barber.name}</h3>
                    <p className="text-gray-600">{barber.location}</p>
                    {barber.distance !== null && (
                      <div className="mt-2 text-sm text-[#9A0F34]">
                        {barber.distance} км от вас
                      </div>
                    )}
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

export default LocationBasedBarbers;