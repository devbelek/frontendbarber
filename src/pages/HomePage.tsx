import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import BookingModal from '../components/booking/BookingModal';
import { servicesAPI } from '../api/services';
import { bookingsAPI } from '../api/services';
import { Haircut } from '../types';
import { useLanguage } from '../context/LanguageContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);
  const [popularHaircuts, setPopularHaircuts] = useState<Haircut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularHaircuts = async () => {
      try {
        setIsLoading(true);
        // Получаем 4 популярных стрижки (можно добавить параметр для сортировки)
        const response = await servicesAPI.getAll({ limit: 4 });

        // Преобразуем данные API в формат Haircut
        const haircuts: Haircut[] = response.data.map((service: any) => ({
          id: service.id,
          image: service.image,
          title: service.title,
          price: service.price,
          barber: service.barber_details.full_name,
          barberId: service.barber,
          type: service.type,
          length: service.length,
          style: service.style,
          location: service.location,
          duration: service.duration,
          isFavorite: service.is_favorite
        }));

        setPopularHaircuts(haircuts);
      } catch (err) {
        console.error('Failed to fetch popular haircuts:', err);
        setError('Не удалось загрузить популярные стрижки');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularHaircuts();
  }, []);

  const handleBookClick = (haircut: Haircut) => {
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (date: string, time: string) => {
    if (!selectedHaircut) return;

    try {
      // Создаем бронирование через API
      const bookingData = {
        service: selectedHaircut.id,
        date: date,
        time: time,
        notes: ''
      };

      await bookingsAPI.create(bookingData);
      setIsBookingModalOpen(false);

      // Показать сообщение об успешном бронировании
      alert('Бронирование успешно создано!');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Не удалось создать бронирование. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg)',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        ></div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center mb-6">
              <Scissors className="h-8 w-8 mr-2 text-[#9A0F34]" />
              <span className="text-xl font-bold">BarberHub</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {t('heroTitle')}
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-8">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/gallery">
                <Button variant="primary" size="lg">
                  {t('exploreGallery')}
                </Button>
              </Link>
              <Link to="/barbers">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:bg-opacity-10">
                  {t('barbers')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Haircuts Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t('popularHaircuts')}</h2>
            <Link
              to="/gallery"
              className="text-[#9A0F34] hover:text-[#7b0c29] font-medium flex items-center"
            >
              {t('viewAll')}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                Попробовать снова
              </Button>
            </div>
          ) : popularHaircuts.length > 0 ? (
            <HaircutGrid
              haircuts={popularHaircuts}
              onBookClick={handleBookClick}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Пока нет доступных стрижек</p>
            </div>
          )}

        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#9A0F34] bg-opacity-10 rounded-full flex items-center justify-center">
                <Scissors className="h-8 w-8 text-[#9A0F34]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Выбирайте стрижку</h3>
              <p className="text-gray-600">
                Просматривайте реальные работы барберов и выбирайте стрижку, которая вам нравится.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#9A0F34] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-[#9A0F34]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Бронируйте мастера</h3>
              <p className="text-gray-600">
                Запишитесь к барберу, который сделал понравившуюся вам стрижку, в удобное время.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#9A0F34] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-[#9A0F34]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Экономьте время</h3>
              <p className="text-gray-600">
                Получите именно то, что хотите, без длительных объяснений мастеру. Просто покажите фото.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Готовы попробовать?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к BarberHub сегодня и найдите идеальную стрижку. Для барберов — расширьте свою клиентскую базу.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Зарегистрироваться
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:bg-opacity-10">
                Войти
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        haircut={selectedHaircut}
        onConfirm={handleBookingConfirm}
      />
    </Layout>
  );
};

export default HomePage;