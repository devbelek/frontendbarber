import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import BookingModal from '../components/booking/BookingModal';
import { servicesAPI, bookingsAPI } from '../api/services';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext'; // Добавлен импорт
import { Search, Filter, ChevronDown, X, Grid3X3, Grid2X2, ChevronUp } from 'lucide-react';
import Button from '../components/ui/Button';

const GalleryPage = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const notification = useNotification();
  const { isAuthenticated, user } = useAuth(); // Добавлено получение данных аутентификации
  const [filteredHaircuts, setFilteredHaircuts] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('popular');
  const [layout, setLayout] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Категории для фильтров
  const filterCategories = {
    types: ['Классическая', 'Фейд', 'Андеркат', 'Кроп', 'Помпадур', 'Текстурная'],
    lengths: ['Короткие', 'Средние', 'Длинные'],
    styles: ['Деловой', 'Повседневный', 'Трендовый', 'Винтажный', 'Современный'],
  };

  // Слушатель изменения размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setLayout('grid'); // На мобильных всегда сетка
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Вызываем при монтировании

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchHaircuts(filters);
  }, [sortBy]);

  const fetchHaircuts = async (currentFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // Добавляем сортировку к фильтрам
      const params = {
        ...currentFilters,
        ordering: sortBy === 'popular' ? '-views' : sortBy === 'price' ? 'price' : '-created_at'
      };

      // Добавляем поисковый запрос, если он есть
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await servicesAPI.getAll(params);

      if (response && response.data) {
        let results = response.data;

        if (response.data.results && Array.isArray(response.data.results)) {
          results = response.data.results;
        }

        if (Array.isArray(results) && results.length > 0) {
          const haircuts = results.map((service) => ({
            id: service.id,
            images: service.images || [],
            primaryImage: service.primary_image || service.image,
            title: service.title,
            price: service.price,
            barber: service.barber_details?.full_name || 'Unknown',
            barberId: service.barber_details?.id || service.barber,
            type: service.type,
            length: service.length,
            style: service.style,
            location: service.location,
            duration: service.duration,
            views: service.views || 0,
            isFavorite: service.is_favorite,
            barberWhatsapp: service.barber_details?.whatsapp,
            barberTelegram: service.barber_details?.telegram
          }));

          setFilteredHaircuts(haircuts);
        } else {
          setFilteredHaircuts([]);
          setError('Не найдено стрижек по заданным критериям');
        }
      }
    } catch (err) {
      console.error('Error fetching haircuts:', err);
      setError('Не удалось загрузить стрижки. Пожалуйста, попробуйте позже.');
      setFilteredHaircuts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchHaircuts(newFilters);
  };

  const handleSearch = () => {
    const searchFilters = { ...filters, search: searchQuery };
    setFilters(searchFilters);
    fetchHaircuts(searchFilters);
    // Закрываем панель фильтров после применения на мобильных
    setIsFilterOpen(false);
  };

  const handleBookClick = (haircut) => {
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };

const handleBookingConfirm = async (date, time, contactInfo) => {
  if (!selectedHaircut) return;

  try {
    let bookingData;

    if (isAuthenticated && user) {
      bookingData = {
        service: selectedHaircut.id,
        date: date,
        time: time,
        notes: contactInfo?.notes || '',
        // Добавляем эти строки для передачи данных клиента
        client_name: user.first_name && user.last_name ?
          `${user.first_name} ${user.last_name}`.trim() :
          user.username || contactInfo.name,
        client_phone: user.profile?.phone || contactInfo.phone
      };
    } else {
      // Для неавторизованных пользователей (оставляем как есть)
      bookingData = {
        service: selectedHaircut.id,
        date: date,
        time: time,
        notes: contactInfo?.notes || '',
        client_name: contactInfo.name,
        client_phone: contactInfo.phone
      };
    }

    // Проверяем, что номер телефона не пустой для неавторизованных пользователей
    if (!isAuthenticated && !bookingData.client_phone) {
      notification.error(
        'Ошибка бронирования',
        'Пожалуйста, укажите номер телефона для связи'
      );
      return;
    }

    await bookingsAPI.create(bookingData);
    setIsBookingModalOpen(false);

    notification.success(
      'Бронирование создано',
      `Услуга "${selectedHaircut.title}" успешно забронирована`
    );
  } catch (err) {
    console.error('Error creating booking:', err);
    notification.error(
      'Ошибка бронирования',
      'Не удалось создать бронирование. Пожалуйста, попробуйте снова.'
    );
  }
};

  // Сброс фильтров
  const resetFilters = () => {
    setSearchQuery('');
    setFilters({});
    setSortBy('popular');
    fetchHaircuts({});
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      {/* Фиксированный поисковый бар и фильтры для мобильной версии */}
      <div className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 md:hidden">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => {
                  setSearchQuery('');
                  resetFilters();
                }}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-gray-100 text-gray-700 flex items-center justify-center px-3 rounded-lg"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Выдвижная панель фильтров для мобильных */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Фильтры</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500"
              >
                Закрыть
              </button>
            </div>

            {/* Тип сортировки */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Сортировка</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'popular' ? 'bg-[#9A0F34] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSortBy('popular')}
                >
                  Популярные
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'price' ? 'bg-[#9A0F34] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSortBy('price')}
                >
                  По цене
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'recent' ? 'bg-[#9A0F34] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSortBy('recent')}
                >
                  Новые
                </button>
              </div>
            </div>

            {/* Тип стрижки */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Тип стрижки</h4>
              <div className="grid grid-cols-2 gap-2">
                {filterCategories.types.map((type) => (
                  <label key={type} className="flex items-center bg-gray-100 rounded-lg p-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.types?.includes(type) || false}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...(filters.types || []), type]
                          : (filters.types || []).filter(t => t !== type);

                        handleFilterChange({
                          ...filters,
                          types: newTypes
                        });
                      }}
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Длина волос */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Длина волос</h4>
              <div className="grid grid-cols-3 gap-2">
                {filterCategories.lengths.map((length) => (
                  <label key={length} className="flex items-center bg-gray-100 rounded-lg p-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.lengths?.includes(length) || false}
                      onChange={(e) => {
                        const newLengths = e.target.checked
                          ? [...(filters.lengths || []), length]
                          : (filters.lengths || []).filter(l => l !== length);

                        handleFilterChange({
                          ...filters,
                          lengths: newLengths
                        });
                      }}
                    />
                    <span className="text-sm">{length}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Кнопки управления */}
            <div className="flex gap-2 mt-6">
              <button
                className="w-full py-2 bg-gray-200 rounded-lg"
                onClick={resetFilters}
              >
                Сбросить
              </button>
              <button
                className="w-full py-2 bg-[#9A0F34] text-white rounded-lg"
                onClick={handleSearch}
              >
                Показать результаты
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Панель управления отображением для десктопа */}
      <div className="hidden md:flex justify-between items-center bg-white p-4 container mx-auto">
        <h1 className="text-xl font-bold">{t('gallery')}</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="relative mr-4">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => {
                    setSearchQuery('');
                    resetFilters();
                  }}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            <Button onClick={handleSearch}>
              {t('search')}
            </Button>
          </div>

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 ${layout === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 ${layout === 'list' ? 'bg-gray-100' : 'bg-white'}`}
            >
              <Grid2X2 className="h-5 w-5" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="popular">По популярности</option>
            <option value="price">По цене</option>
            <option value="recent">Новые</option>
          </select>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 pb-16 md:pb-6">
        {/* Фильтры для десктопа */}
        <div className="hidden md:block mb-6 mt-4">
          <details className="bg-white p-4 rounded-lg shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer">
              <span className="font-medium">Фильтры</span>
              <ChevronDown className="h-5 w-5" />
            </summary>

            <div className="mt-4 grid grid-cols-3 gap-6">
              {/* Тип стрижки */}
              <div>
                <h4 className="font-medium mb-2">Тип стрижки</h4>
                <div className="space-y-2">
                  {filterCategories.types.map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filters.types?.includes(type) || false}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...(filters.types || []), type]
                            : (filters.types || []).filter(t => t !== type);

                          handleFilterChange({
                            ...filters,
                            types: newTypes
                          });
                        }}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Длина волос */}
              <div>
                <h4 className="font-medium mb-2">Длина волос</h4>
                <div className="space-y-2">
                  {filterCategories.lengths.map((length) => (
                    <label key={length} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filters.lengths?.includes(length) || false}
                        onChange={(e) => {
                          const newLengths = e.target.checked
                            ? [...(filters.lengths || []), length]
                            : (filters.lengths || []).filter(l => l !== length);

                          handleFilterChange({
                            ...filters,
                            lengths: newLengths
                          });
                        }}
                      />
                      <span>{length}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Стиль */}
              <div>
                <h4 className="font-medium mb-2">Стиль</h4>
                <div className="space-y-2">
                  {filterCategories.styles.map((style) => (
                    <label key={style} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filters.styles?.includes(style) || false}
                        onChange={(e) => {
                          const newStyles = e.target.checked
                            ? [...(filters.styles || []), style]
                            : (filters.styles || []).filter(s => s !== style);

                          handleFilterChange({
                            ...filters,
                            styles: newStyles
                          });
                        }}
                      />
                      <span>{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="mr-2"
              >
                Сбросить
              </Button>
              <Button
                variant="primary"
                onClick={handleSearch}
              >
                Применить фильтры
              </Button>
            </div>
          </details>
        </div>

        {/* Результаты и список стрижек */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('error')}</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => fetchHaircuts(filters)}
              className="px-4 py-2 bg-[#9A0F34] text-white rounded-md hover:bg-[#7b0c29] transition-colors"
            >
              {t('tryAgain')}
            </button>
          </div>
        ) : filteredHaircuts.length > 0 ? (
          <div className="mt-6">
            <HaircutGrid haircuts={filteredHaircuts} onBookClick={handleBookClick} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noResults')}</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска или сбросить фильтры.</p>
            <Button
              variant="primary"
              onClick={resetFilters}
              className="mt-4"
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        haircut={selectedHaircut}
        onConfirm={handleBookingConfirm}
      />
    </Layout>
  );
};

export default GalleryPage;