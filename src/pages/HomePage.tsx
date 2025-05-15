import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Star, MapPin, Navigation, Award, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import LocationBasedBarbers from '../components/location/LocationBasedRecommendations';
import BookingModal from '../components/booking/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useNotification } from '../context/NotificationContext';
import { servicesAPI, bookingsAPI } from '../api/services';
import { Haircut } from '../types';

interface HomePageProps {
  openLoginModal: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { currentRegion } = useLocation();
  const notification = useNotification();
  const [popularHaircuts, setPopularHaircuts] = useState<Haircut[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);

  useEffect(() => {
    const fetchPopularHaircuts = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getAll({ limit: 6 });

        if (response && response.data) {
          let results = response.data;

          if (response.data.results && Array.isArray(response.data.results)) {
            results = response.data.results;
          }

          if (Array.isArray(results)) {
            const haircuts: Haircut[] = results.slice(0, 6).map((service: any) => ({
              id: service.id,
              image: service.image,
              title: service.title,
              price: service.price,
              barber: service.barber_details?.full_name || 'Unknown',
              barberId: service.barber,
              type: service.type,
              length: service.length,
              style: service.style,
              location: service.location,
              duration: service.duration,
              isFavorite: service.is_favorite || false
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
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      setSelectedHaircut(haircut);
      setIsBookingModalOpen(true);
    }
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

  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const AnimatedScissors = () => (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ rotate: -45, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 1, type: "spring" }}
      className="text-[#9A0F34]"
    >
      <path
        d="M6.13 1L6 16a2 2 0 002 2h8a2 2 0 002-2L17.87 1M6 8h12M8 12L16 20M16 12L8 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );

  return (
    <Layout openLoginModal={openLoginModal}>
      {/* Hero Section с видео на фоне */}
      <motion.section
        className="relative h-screen overflow-hidden"
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://cdn.pixabay.com/video/2022/10/10/134866-759217154_large.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="relative z-20 flex items-center h-full">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center text-white">
              <div className="mb-6 flex justify-center">
                <AnimatedScissors />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
                {t('heroSubtitle')}
              </p>
              <Link to="/gallery">
                <Button variant="primary" size="lg" className="bg-white text-[#9A0F34] hover:bg-gray-100">
                  {t('exploreGallery')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="py-20 bg-white"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('howItWorks')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('howItWorksDescription')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="h-12 w-12" />,
                title: t('chooseHaircut'),
                description: t('chooseHaircutDescription'),
                step: 1
              },
              {
                icon: <Star className="h-12 w-12" />,
                title: t('bookBarber'),
                description: t('bookBarberDescription'),
                step: 2
              },
              {
                icon: <Award className="h-12 w-12" />,
                title: t('saveTime'),
                description: t('saveTimeDescription'),
                step: 3
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-[#9A0F34]/10 rounded-full flex items-center justify-center text-[#9A0F34] relative">
                    {feature.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 bg-[#9A0F34] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {feature.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Popular Haircuts Section */}
      <motion.section
        className="py-20 bg-gray-50"
        initial="initial"
        whileInView="animate"
        variants={staggerContainer}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">{t('popularHaircuts')}</h2>
            <Link to="/gallery">
              <Button variant="outline">
                {t('viewAll')}
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm h-80"></div>
              ))}
            </div>
          ) : (
            <motion.div variants={staggerContainer}>
              <HaircutGrid
                haircuts={popularHaircuts}
                onBookClick={handleBookClick}
              />
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Location Based Recommendations */}
      <motion.section
        className="py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <LocationBasedBarbers />
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('readyToTry')}
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-100">
              {t('readyToTryDescription')}
            </p>
            {!isAuthenticated && (
              <Button
                variant="secondary"
                size="lg"
                onClick={openLoginModal}
                className="bg-white text-[#9A0F34] hover:bg-gray-100"
              >
                {t('becomeBarber')}
              </Button>
            )}
          </motion.div>
        </div>
      </motion.section>

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