import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Scissors, MapPin, Heart, Clock, Star, MessageCircle, Eye } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { servicesAPI, profileAPI } from '../api/services';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';

const HomePage = ({ openLoginModal }) => {
  const [popularHaircuts, setPopularHaircuts] = useState([]);
  const [nearbyBarbers, setNearbyBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    address: '',
    latitude: null,
    longitude: null
  });
  const [categories] = useState([
    { name: 'Классические', icon: 'classic', color: 'bg-blue-100 text-blue-700' },
    { name: 'Фейды', icon: 'fade', color: 'bg-green-100 text-green-700' },
    { name: 'Андеркаты', icon: 'undercut', color: 'bg-purple-100 text-purple-700' },
    { name: 'Текстурные', icon: 'textured', color: 'bg-red-100 text-red-700' },
    { name: 'Кроп', icon: 'crop', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Помпадур', icon: 'pompadour', color: 'bg-indigo-100 text-indigo-700' },
  ]);
  const [showBarberContactModal, setShowBarberContactModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);

  const navigate = useNavigate();
  const notification = useNotification();
  const { user, toggleFavorite } = useAuth();

  useEffect(() => {
    // Определяем местоположение пользователя
    getUserLocation();

    // Загрузка популярных стрижек и барберов
    const fetchData = async () => {
      setLoading(true);
      try {
        // Загружаем популярные стрижки
        const haircutsResponse = await servicesAPI.getPopular();

        if (haircutsResponse && haircutsResponse.data) {
          let results = haircutsResponse.data;

          if (haircutsResponse.data.results && Array.isArray(haircutsResponse.data.results)) {
            results = haircutsResponse.data.results;
          }

          if (Array.isArray(results)) {
            setPopularHaircuts(results);
          }
        }

        // Загружаем барберов
        const barbersResponse = await profileAPI.getAllBarbers();

        if (barbersResponse && barbersResponse.data) {
          let barbersData = [];

          if (barbersResponse.data.results && Array.isArray(barbersResponse.data.results)) {
            barbersData = barbersResponse.data.results;
          } else if (Array.isArray(barbersResponse.data)) {
            barbersData = barbersResponse.data;
          }

          // Добавляем расстояние до барберов, если есть координаты
          if (userLocation.latitude && userLocation.longitude) {
            barbersData = barbersData.map(barber => {
              let distance = null;
              if (barber.profile?.latitude && barber.profile?.longitude) {
                distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  barber.profile.latitude,
                  barber.profile.longitude
                );
              }
              return { ...barber, distance };
            }).sort((a, b) => {
              if (a.distance === null) return 1;
              if (b.distance === null) return -1;
              return a.distance - b.distance;
            });
          }

          setNearbyBarbers(barbersData.slice(0, 4)); // Берем только первых 4 барбера
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        notification.error('Ошибка загрузки', 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation.latitude, userLocation.longitude]);

  // Функция для определения местоположения пользователя
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Получаем адрес из координат
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            // Формируем адрес
            let address = '';
            if (data.address) {
              const parts = [];
              if (data.address.city || data.address.town) {
                parts.push(data.address.city || data.address.town);
              }
              if (data.address.suburb) {
                parts.push(data.address.suburb);
              }
              if (data.address.road) {
                parts.push(data.address.road);
                if (data.address.house_number) {
                  parts.push(data.address.house_number);
                }
              }
              address = parts.join(', ');
            }

            setUserLocation({
              address: address || 'Неизвестное местоположение',
              latitude,
              longitude
            });
          } catch (error) {
            console.error('Error getting address:', error);
            setUserLocation({
              address: 'Не удалось определить адрес',
              latitude,
              longitude
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Расчет расстояния между координатами
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

  // Функция для навигации
  const goTo = (path) => {
    navigate(path);
  };

  // Форматирование полного имени барбера
  const getBarberName = (barber) => {
    if (barber.first_name || barber.last_name) {
      return `${barber.first_name || ''} ${barber.last_name || ''}`.trim();
    }
    return barber.username || 'Барбер';
  };

  // Обработчик избранного
  const handleFavoriteToggle = async (haircutId) => {
    try {
      await toggleFavorite(haircutId);
      // Обновляем состояние в списке
      setPopularHaircuts(prev => prev.map(h => {
        if (h.id === haircutId) {
          return { ...h, is_favorite: !h.is_favorite };
        }
        return h;
      }));
      notification.success('Успешно', 'Статус избранного изменен');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      notification.error('Ошибка', 'Не удалось изменить статус избранного');
    }
  };

  // Показать контакты барбера
  const showBarberContacts = (barberId) => {
    const barber = nearbyBarbers.find(b => b.id === barberId);
    if (barber) {
      setSelectedBarber(barber);
      setShowBarberContactModal(true);
    }
  };

  // Обработчик клика на категорию
  const handleCategoryClick = (categoryType) => {
    navigate(`/gallery`, {
      state: { appliedFilters: { types: [categoryType] } }
    });
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="pb-16 mb-3 md:pb-0">
        {/* Поисковая панель */}
        <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Найти стрижку..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && goTo('/gallery')}
            />
          </div>
        </div>

        {/* Категории стрижек */}
        <div className="py-4 px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Категории</h2>
            <button onClick={() => goTo('/gallery')} className="text-sm text-[#9A0F34]">
              Все категории
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.icon)}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50"
              >
                <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-2`}>
                  <Scissors className="h-6 w-6" />
                </div>
                <span className="text-xs text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ближайшие барберы */}
        <div className="py-4 px-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">
              Барберы рядом
              {userLocation.address && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  • {userLocation.address}
                </span>
              )}
            </h2>
            <button onClick={() => goTo('/barbers')} className="text-sm text-[#9A0F34]">
              Смотреть все
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex space-x-3 pb-2">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 bg-white rounded-lg p-3 shadow-sm animate-pulse">
                    <div className="w-14 h-14 bg-gray-200 rounded-full mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                ))
              ) : nearbyBarbers.length > 0 ? (
                nearbyBarbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => goTo(`/barber/${barber.id}`)}
                    className="flex-shrink-0 w-36 bg-white rounded-lg p-3 shadow-sm"
                  >
                    <img
                      src={barber.profile?.photo || 'https://via.placeholder.com/100'}
                      alt={getBarberName(barber)}
                      className="w-14 h-14 rounded-full mx-auto mb-2 object-cover"
                    />
                    <p className="text-center font-medium">{getBarberName(barber)}</p>
                    {barber.distance !== null && (
                      <p className="text-xs text-center text-gray-500">{barber.distance} км от вас</p>
                    )}
                  </button>
                ))
              ) : (
                <div className="w-full text-center py-4 text-gray-500">
                  Барберы не найдены
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Популярные стрижки */}
        <div className="py-4 px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Популярные стрижки</h2>
            <button onClick={() => goTo('/gallery')} className="text-sm text-[#9A0F34]">
              Смотреть все
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-36 bg-gray-200"></div>
                  <div className="p-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : popularHaircuts.length > 0 ? (
              popularHaircuts.slice(0, 4).map((haircut) => (
                <div key={haircut.id} className="bg-white rounded-lg overflow-hidden shadow-sm relative">
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      className="bg-white rounded-full p-1.5 shadow-md"
                      onClick={() => handleFavoriteToggle(haircut.id)}
                    >
                      <Heart className={`h-4 w-4 ${haircut.is_favorite ? "fill-[#9A0F34] text-[#9A0F34]" : "text-gray-500"}`} />
                    </button>
                    {(haircut.barber_details?.telegram || haircut.barber_details?.whatsapp) && (
                      <button
                        className="bg-white rounded-full p-1.5 shadow-md"
                        onClick={() => showBarberContacts(haircut.barber_details?.id)}
                      >
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>

                  <div className="relative" onClick={() => goTo(`/gallery?service=${haircut.id}`)}>
                    <ImageWithFallback
                      src={haircut.primary_image || haircut.image}
                      alt={haircut.title}
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {haircut.views || 0}
                    </div>
                  </div>

                  <div className="p-2">
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">{haircut.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-[#9A0F34] font-bold text-sm">{Math.floor(haircut.price)} сом</p>
                      <button
                        className="text-xs bg-[#9A0F34]/10 text-[#9A0F34] px-2 py-1 rounded"
                        onClick={() => {
                          servicesAPI.incrementViews(haircut.id);
                          goTo(`/gallery?service=${haircut.id}`);
                        }}
                      >
                        Хочу также
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-4 text-gray-500">
                Стрижки не найдены
              </div>
            )}
          </div>
        </div>

        {/* Как это работает */}
        <div className="py-4 px-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Как это работает</h2>
          <div className="flex overflow-x-auto -mx-4 px-4 space-x-3 pb-2">
            <div className="flex-shrink-0 w-44 p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-medium mb-1">Выбери стрижку</h3>
              <p className="text-xs text-gray-600">Просматривай фото реальных стрижек</p>
            </div>
            <div className="flex-shrink-0 w-44 p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-medium mb-1">Забронируй время</h3>
              <p className="text-xs text-gray-600">Запишись к барберу онлайн</p>
            </div>
            <div className="flex-shrink-0 w-44 p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-medium mb-1">Получи результат</h3>
              <p className="text-xs text-gray-600">Точно такую же стрижку как на фото</p>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно контактов барбера */}
      {showBarberContactModal && selectedBarber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             onClick={() => setShowBarberContactModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md"
               onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Контакты барбера</h3>
            <div className="flex items-center mb-4">
              <img
                src={selectedBarber.profile?.photo || 'https://via.placeholder.com/100'}
                alt={getBarberName(selectedBarber)}
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
              <div>
                <p className="font-medium">{getBarberName(selectedBarber)}</p>
                <p className="text-sm text-gray-600">{selectedBarber.profile?.address || 'Адрес не указан'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedBarber.profile?.whatsapp && (
                <a href={`https://wa.me/${selectedBarber.profile.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#25D366] text-white py-3 rounded-lg hover:bg-opacity-90"
                >
                  WhatsApp
                </a>
              )}

              {selectedBarber.profile?.telegram && (
                <a href={`https://t.me/${selectedBarber.profile.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#0088cc] text-white py-3 rounded-lg hover:bg-opacity-90"
                >
                  Telegram
                </a>
              )}

              {!selectedBarber.profile?.whatsapp && !selectedBarber.profile?.telegram && (
                <div className="text-center text-gray-600 py-4">
                  <p>Барбер не указал контактные данные.</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowBarberContactModal(false)}
              className="mt-4 w-full text-gray-600 py-2 hover:text-gray-800"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;