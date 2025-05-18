// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import BookingModal from '../components/booking/BookingModal';
import LocationBasedBarbers from '../components/location/LocationBasedRecommendations';
import { useNotification } from '../context/NotificationContext';
import { servicesAPI, bookingsAPI } from '../api/services';
import { Haircut } from '../types';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface HomePageProps {
  openLoginModal: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ openLoginModal }) => {
  const notification = useNotification();
  const [popularHaircuts, setPopularHaircuts] = useState<Haircut[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);

  useEffect(() => {
    const fetchPopularHaircuts = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getPopular();

        if (response && response.data) {
          let results = response.data;

          if (response.data.results && Array.isArray(response.data.results)) {
            results = response.data.results;
          }

          if (Array.isArray(results)) {
            const haircuts: Haircut[] = results.slice(0, 6).map((service: any) => ({
              id: service.id,
              image: service.image,
              images: service.images || [],
              primaryImage: service.primary_image || service.image,
              title: service.title,
              price: service.price,
              barber: service.barber_details?.full_name || 'Unknown',
              barberId: service.barber,
              type: service.type,
              length: service.length,
              style: service.style,
              location: service.location,
              duration: service.duration,
              isFavorite: service.is_favorite || false,
              views: service.views || 0,
              barberWhatsapp: service.barber_details?.whatsapp,
              barberTelegram: service.barber_details?.telegram
            }));

            setPopularHaircuts(haircuts);
          }
        }
      } catch (error) {
        console.error('Error fetching popular haircuts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularHaircuts();
  }, []);

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
        `Услуга "${selectedHaircut.title}" успешно забронирована на ${date} в ${time}`
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
      {/* Секция-герой */}
      <HeroSection />

      {/* Популярные стрижки */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Популярные стрижки</h2>
            <a href="/gallery" className="text-[#9A0F34] font-medium hover:underline">
              Смотреть все
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm h-80"></div>
              ))}
            </div>
          ) : (
            <HaircutGrid
              haircuts={popularHaircuts}
              onBookClick={handleBookClick}
            />
          )}
        </div>
      </section>

      {/* Секция "Как это работает" */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Как это работает</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Простой способ найти идеальную стрижку и барбера
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Выбери стрижку',
                description: 'Просматривай реальные работы барберов и выбирай стрижку, которая тебе нравится'
              },
              {
                icon: '📅',
                title: 'Забронируй время',
                description: 'Запишись к барберу, который сделал стрижку, на удобное для тебя время'
              },
              {
                icon: '✨',
                title: 'Получи результат',
                description: 'Получи именно ту стрижку, которую ты выбрал, без лишних объяснений'
              }
            ].map((step, index) => (
              <Card key={index} className="text-center p-8 border-0 shadow-soft hover:translate-y-[-5px] transition-all">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Барберы рядом */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <LocationBasedBarbers />
        </div>
      </section>

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

export default HomePage;