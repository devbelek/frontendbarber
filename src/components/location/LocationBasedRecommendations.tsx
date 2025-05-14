import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { profileAPI } from '../../api/services';
import { Barber } from '../../types';
import ImageWithFallback from '../ui/ImageWithFallback';

const LocationBasedBarbers: React.FC = () => {
  const [nearbyBarbers, setNearbyBarbers] = useState<Barber[]>([]);
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

        setUserLocation({
          latitude,
          longitude,
          locationName: null,
        });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

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

          getBarbers();
        } catch (err) {
          console.error('Ошибка при получении названия местоположения:', err);
          setUserLocation(prev => ({
            ...prev,
            locationName: 'Ваше местоположение',
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

        const barbersWithProfile = barbersData.map((user: any) => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          avatar: user.profile?.photo || null,
          rating: user.avg_rating || 0,
          reviewCount: user.review_count || 0,
          specialization: user.profile?.specialization || [],
          location: user.profile?.address || 'Не указано',
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
        }));

        setNearbyBarbers(barbersWithProfile);
      }

      setShowRecommendations(true);
      setLoading(false);
    } catch (e) {
      console.error('Error getting barbers:', e);
      setError('Не удалось загрузить барберов');
      setLoading(false);
    }
  };

  const handleRequestLocation = () => {
    setError(null);
    getUserLocation();
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

  if (error && nearbyBarbers.length === 0) {
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

  if (nearbyBarbers.length === 0 && userLocation.latitude) {
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
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[#9A0F34] font-bold">
                        ⭐ {barber.rating || '0'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {barber.reviewCount || 0} отзывов
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

export default LocationBasedBarbers;