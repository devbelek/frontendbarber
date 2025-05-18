import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Scissors, MapPin, Heart, Clock, Star, Menu, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { servicesAPI, profileAPI } from '../api/services';
import { useNotification } from '../context/NotificationContext';

// Исправленная главная страница с Layout и реальными данными
const HomePage = ({ openLoginModal }) => {
  const [popularHaircuts, setPopularHaircuts] = useState([]);
  const [nearbyBarbers, setNearbyBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState([
    { name: 'Классические', icon: 'classic', color: 'bg-blue-100 text-blue-700' },
    { name: 'Фейды', icon: 'fade', color: 'bg-green-100 text-green-700' },
    { name: 'Андеркаты', icon: 'undercut', color: 'bg-purple-100 text-purple-700' },
    { name: 'Текстурные', icon: 'textured', color: 'bg-red-100 text-red-700' },
    { name: 'Кроп', icon: 'crop', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Помпадур', icon: 'pompadour', color: 'bg-indigo-100 text-indigo-700' },
  ]);

  const navigate = useNavigate();
  const notification = useNotification();

  useEffect(() => {
    // Загрузка популярных стрижек из API
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

          setNearbyBarbers(barbersData.slice(0, 3)); // Берем только первых 3 барбера
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        notification.error('Ошибка загрузки', 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                onClick={() => goTo(`/gallery?type=${category.icon}`)}
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
            <h2 className="text-lg font-semibold">Барберы рядом</h2>
            <button onClick={() => goTo('/barbers')} className="text-sm text-[#9A0F34]">
              Смотреть все
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex space-x-3 pb-2">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
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
                    <div className="flex items-center justify-center text-xs">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span>{barber.avg_rating || '4.5'}</span>
                    </div>
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

        {/* Популярные стрижки (в 2 колонки на мобильных устройствах) */}
        <div className="py-4 px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Популярные стрижки</h2>
            <button onClick={() => goTo('/gallery')} className="text-sm text-[#9A0F34]">
              Смотреть все
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-32 bg-gray-200"></div>
                  <div className="p-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : popularHaircuts.length > 0 ? (
              popularHaircuts.slice(0, 4).map((haircut) => (
                <button
                  key={haircut.id}
                  onClick={() => goTo(`/gallery?service=${haircut.id}`)}
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="relative">
                    <img
                      src={haircut.primary_image || haircut.image}
                      alt={haircut.title}
                      className="w-full h-32 object-cover"
                    />
                    <Heart className="absolute top-2 right-2 h-5 w-5 text-white" />
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">{haircut.title}</h3>
                    <p className="text-[#9A0F34] font-bold text-sm">{haircut.price} сом</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center py-4 text-gray-500">
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
    </Layout>
  );
};

export default HomePage;