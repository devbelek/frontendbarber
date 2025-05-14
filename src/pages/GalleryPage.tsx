import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import FilterBar from '../components/filters/FilterBar';
import BookingModal from '../components/booking/BookingModal';
import { servicesAPI, bookingsAPI } from '../api/services'; // ДОБАВЛЕН ИМПОРТ bookingsAPI
import { Haircut } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface GalleryPageProps {
  openLoginModal: () => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const [filteredHaircuts, setFilteredHaircuts] = useState<Haircut[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchHaircuts(filters);
  }, []);

  const fetchHaircuts = async (currentFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching haircuts with filters:', currentFilters);
      const response = await servicesAPI.getAll(currentFilters);
      console.log('API Response:', response);

      if (response && response.data) {
        let results = response.data;

        // Если данные в виде объекта пагинации
        if (response.data.results && Array.isArray(response.data.results)) {
          results = response.data.results;
        }

        if (Array.isArray(results) && results.length > 0) {
          // Преобразуем данные API в формат компонентов
          const haircuts: Haircut[] = results.map((service: any) => ({
            id: service.id,
            image: service.image,
            title: service.title,
            price: service.price,
            barber: service.barber_details?.full_name || 'Unknown',
            barberId: service.barber_details?.id || service.barber,
            type: service.type,
            length: service.length,
            style: service.style,
            location: service.location,
            duration: service.duration,
            isFavorite: service.is_favorite
          }));

          setFilteredHaircuts(haircuts);
        } else {
          setFilteredHaircuts([]);
          setError('Не найдено стрижек по заданным критериям');
        }
      } else {
        setFilteredHaircuts([]);
        setError('Не удалось получить данные о стрижках');
      }
    } catch (err) {
      console.error('Error fetching haircuts:', err);
      setError('Не удалось загрузить стрижки. Пожалуйста, попробуйте позже.');
      setFilteredHaircuts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    fetchHaircuts(newFilters);
  };

  const handleSearch = (query: string) => {
    const searchFilters = { ...filters, search: query };
    setFilters(searchFilters);
    fetchHaircuts(searchFilters);
  };

  const handleBookClick = (haircut: Haircut) => {
    // Открываем модальное окно бронирования без проверки авторизации
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (date: string, time: string, contactInfo: any) => {
    if (!selectedHaircut) return;

    try {
      // Создаем объект данных бронирования
      const bookingData = {
        service: selectedHaircut.id,
        date: date,
        time: time,
        notes: contactInfo?.notes || '',
        // Добавляем контактную информацию для неавторизованных клиентов
        client_name: contactInfo.name,
        client_phone: contactInfo.phone
      };

      // Отправляем запрос на создание бронирования
      await bookingsAPI.createBooking(bookingData);

      // Закрываем модальное окно
      setIsBookingModalOpen(false);

      // Показываем сообщение об успешном бронировании
      alert(`Бронирование успешно создано!

Услуга: ${selectedHaircut.title}
Дата: ${date}
Время: ${time}
Имя: ${contactInfo.name}
Телефон: ${contactInfo.phone}`);
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Не удалось создать бронирование. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('gallery')}</h1>

        <FilterBar
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="h-16 w-16 text-red-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
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
          <HaircutGrid
            haircuts={filteredHaircuts}
            onBookClick={handleBookClick}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="h-16 w-16 text-gray-400 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noResults')}</h3>
            <p className="text-gray-500">
              Попробуйте изменить параметры поиска или сбросить фильтры.
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно бронирования */}
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