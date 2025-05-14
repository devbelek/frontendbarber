import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, MapPin, Clock, Check } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, bookingsAPI } from '../api/services';
import { Haircut } from '../types';
import BookingModal from '../components/booking/BookingModal';
import LocationBasedBarbers from '../components/location/LocationBasedBarbers';
interface HomePageProps {
  openLoginModal: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [popularHaircuts, setPopularHaircuts] = useState<Haircut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);

  useEffect(() => {
    const fetchPopularHaircuts = async () => {
      try {
        setIsLoading(true);
        const response = await servicesAPI.getAll({ limit: 6 });

        if (response.data && Array.isArray(response.data)) {
          setPopularHaircuts(response.data.map((service: any) => ({
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
          })));
        } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
          setPopularHaircuts(response.data.results.map((service: any) => ({
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
          })));
        } else {
          setPopularHaircuts([]);
        }
      } catch (error) {
        console.error('Error fetching popular haircuts:', error);
        setPopularHaircuts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularHaircuts();
  }, []);

  const handleBookClick = (haircut: Haircut) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
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
        notes: contactInfo?.notes || ''
      };

      await bookingsAPI.createBooking(bookingData);
      setIsBookingModalOpen(false);

      // Показать сообщение об успешном бронировании
      alert('Бронирование успешно создано!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Не удалось создать бронирование. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('heroTitle')}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/gallery">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  {t('exploreGallery')}
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button
                  variant="primary"
                  onClick={openLoginModal}
                  className="bg-white text-[#9A0F34] hover:bg-gray-100"
                >
                  {t('becomeBarber')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Рекомендации на основе местоположения */}
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <LocationBasedBarbers />
      </div>
    </section>

      {/* Популярные стрижки */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{t('popularHaircuts')}</h2>
            <Link to="/gallery" className="text-[#9A0F34] font-medium hover:underline flex items-center">
              {t('viewAll')}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : popularHaircuts.length > 0 ? (
            <HaircutGrid
              haircuts={popularHaircuts.slice(0, 3)}
              onBookClick={handleBookClick}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Стрижки еще не добавлены
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('howItWorks')}</h2>
            <p className="text-gray-600">{t('howItWorksDescription')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-[#9A0F34]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="h-8 w-8 text-[#9A0F34]" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('chooseHaircut')}</h3>
              <p className="text-gray-600">{t('chooseHaircutDescription')}</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-[#9A0F34]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-[#9A0F34]" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('bookBarber')}</h3>
              <p className="text-gray-600">{t('bookBarberDescription')}</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-[#9A0F34]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-[#9A0F34]" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('saveTime')}</h3>
              <p className="text-gray-600">{t('saveTimeDescription')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('readyToTry')}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">{t('readyToTryDescription')}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/gallery">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                {t('exploreGallery')}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Button
                variant="primary"
                onClick={openLoginModal}
                className="bg-white text-[#9A0F34] hover:bg-gray-100"
              >
                {t('becomeBarber')}
              </Button>
            )}
          </div>
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