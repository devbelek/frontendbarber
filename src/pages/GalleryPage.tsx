import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import FilterBar from '../components/filters/FilterBar';
import BookingModal from '../components/booking/BookingModal';
import { servicesAPI, bookingsAPI } from '../api/services';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';

interface Haircut {
  id: number;
  images: any[];
  primaryImage: string;
  title: string;
  price: number;
  barber: string;
  barberId: number;
  type?: string;
  length?: string;
  style?: string;
  location?: string;
  duration?: string;
  views: number;
  isFavorite?: boolean;
}

interface GalleryPageProps {
  openLoginModal: () => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const notification = useNotification();
  const [filteredHaircuts, setFilteredHaircuts] = useState<Haircut[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'recent'>('popular');

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

      const response = await servicesAPI.getAll(params);

      if (response && response.data) {
        let results = response.data;

        if (response.data.results && Array.isArray(response.data.results)) {
          results = response.data.results;
        }

        if (Array.isArray(results) && results.length > 0) {
          const haircuts: Haircut[] = results.map((service: any) => ({
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
            isFavorite: service.is_favorite
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
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (date: string, time: string, contactInfo: any) => {
    if (!selectedHaircut) return;

    try {
      const bookingData = {
        service: selectedHaircut.id,
        date: date,
        time: time,
        notes: contactInfo?.notes || '',
        client_name: contactInfo.name,
        client_phone: contactInfo.phone
      };

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

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('gallery')}</h1>

          {/* Сортировка */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Сортировать:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
            >
              <option value="popular">По популярности</option>
              <option value="price">По цене</option>
              <option value="recent">Новые</option>
            </select>
          </div>
        </div>

        <FilterBar onFilterChange={handleFilterChange} onSearch={handleSearch} />

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
          <HaircutGrid haircuts={filteredHaircuts} onBookClick={handleBookClick} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noResults')}</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска или сбросить фильтры.</p>
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