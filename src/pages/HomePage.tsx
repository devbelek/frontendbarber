import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, Clock, MessageSquare, MapPin } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import BookingModal from '../components/booking/BookingModal';
import { servicesAPI, bookingsAPI } from '../api/services';
import { Haircut } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';

interface HomePageProps {
  openLoginModal: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ openLoginModal }) => {
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
        console.log('Popular haircuts response:', response);

        // Handle both array and pagination object responses
        let results = response.data;

        // If data is a pagination object with results property
        if (response.data.results && Array.isArray(response.data.results)) {
          results = response.data.results;
        } else if (!Array.isArray(results)) {
          console.error('Unexpected response format:', response.data);
          setError('Некорректный формат данных от сервера');
          setPopularHaircuts([]);
          return;
        }

        // Преобразуем данные API в формат Haircut
        const haircuts: Haircut[] = results.map((service: any) => ({
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

  const handleBookingConfirm = async (date: string, time: string, contactInfo: { name: string; phone: string }) => {
    if (!selectedHaircut) return;

    try {
      // Создаем бронирование через API с добавлением контактных данных
      const bookingData = {
        service: selectedHaircut.id,
        date: date,
        time: time,
        notes: `Имя: ${contactInfo.name}, Телефон: ${contactInfo.phone}`
      };

      await bookingsAPI.create(bookingData);
      setIsBookingModalOpen(false);

      // Показать сообщение об успешном бронировании
      alert('Бронирование успешно создано! Барбер свяжется с вами для подтверждения.');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Не удалось создать бронирование. Пожалуйста, попробуйте снова.');
    }
  };

  // Анимация для элементов
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      {/* Современный минималистичный hero-section */}
      <section className="bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] py-16 md:py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="inline-block mb-6">
                <Logo darkMode={true} size="lg" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t('heroTitle')}
              </h1>

              <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
                Находите талантливых барберов по их работам и выбирайте идеальную стрижку для себя
              </p>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/gallery">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-white text-[#9A0F34] hover:bg-gray-100 border-white"
                  >
                    {t('exploreGallery')}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                  onClick={openLoginModal}
                >
                  Я барбер
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Декоративный элемент */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-[50%] transform translate-y-8 z-10 hidden md:block"></div>
      </section>

      {/* Информационные карточки - Как это работает */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Как это работает</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">Ваш путь к идеальной стрижке</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                TARAK соединяет клиентов и барберов. Нет необходимости регистрироваться, чтобы найти подходящего мастера.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-lg text-center transition-transform duration-300 hover:shadow-lg hover:translate-y-[-4px]"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-[#9A0F34]/10 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-[#9A0F34]"
                >
                  <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
                  <path d="M8 6h8" />
                  <path d="M8 10h8" />
                  <path d="M8 14h8" />
                  <path d="M8 18h8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Выбирайте по стрижке</h3>
              <p className="text-gray-600">
                Просматривайте работы барберов и выбирайте стиль, который вам нравится, а не мастера
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 p-8 rounded-lg text-center transition-transform duration-300 hover:shadow-lg hover:translate-y-[-4px]"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-[#9A0F34]/10 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-[#9A0F34]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Свяжитесь напрямую</h3>
              <p className="text-gray-600">
                Пишите барберам напрямую через WhatsApp или Telegram без необходимости регистрации
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 p-8 rounded-lg text-center transition-transform duration-300 hover:shadow-lg hover:translate-y-[-4px]"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-[#9A0F34]/10 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-[#9A0F34]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Выбирайте где стричься</h3>
              <p className="text-gray-600">
                Посетите барбершоп или пригласите мастера к себе домой в зависимости от услуги
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Haircuts Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Найди свой стиль</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">{t('popularHaircuts')}</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/gallery"
                className="text-[#9A0F34] hover:text-[#7b0c29] font-medium flex items-center"
              >
                {t('viewAll')}
                <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            </motion.div>
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
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <HaircutGrid
                haircuts={popularHaircuts}
                onBookClick={handleBookClick}
              />
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Пока нет доступных стрижек</p>
            </div>
          )}
        </div>
      </section>

      {/* Barber Value Proposition - Clean & Minimal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center"
            >
              <div className="md:col-span-3 md:pr-12">
                <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Для барберов</span>
                <h2 className="text-3xl font-bold mt-2 mb-6">Расширьте свою клиентскую базу с TARAK</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 bg-[#9A0F34] rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-lg">Если у вас есть барбершоп</h3>
                      <p className="text-gray-600">Привлекайте больше клиентов, демонстрируя свои лучшие работы</p>
                    </div>
                  </div>

                  <div className="flex items-start bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 bg-[#9A0F34] rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-lg">Работаете на выезде</h3>
                      <p className="text-gray-600">Предлагайте услуги на дому и расширяйте географию своей работы</p>
                    </div>
                  </div>

                  <div className="flex items-start bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 bg-[#9A0F34] rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-lg">Работайте в удобное время</h3>
                      <p className="text-gray-600">Управляйте своим графиком и принимайте только подходящие заказы</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={openLoginModal}
                  className="bg-[#9A0F34] hover:bg-[#7b0c29]"
                >
                  Стать барбером на платформе
                </Button>
              </div>

              <div className="md:col-span-2 relative">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src="https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg"
                    alt="Барбер за работой"
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                  <div className="text-center">
                    <span className="text-sm font-semibold text-[#9A0F34]">Гибкие условия</span>
                    <p className="text-xs mt-1">Работайте на своих условиях</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal Design */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Logo darkMode={true} size="lg" />
            <h2 className="text-3xl font-bold mt-6 mb-4">Присоединяйтесь к TARAK</h2>
            <p className="text-lg text-gray-300 mb-8">
              Для барберов — отличная возможность расширить клиентскую базу.
              Для клиентов — простой способ найти идеальную стрижку.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-[#9A0F34] hover:bg-gray-100"
                onClick={openLoginModal}
              >
                Я барбер
              </Button>
              <Link to="/gallery">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  Смотреть стрижки
                </Button>
              </Link>
            </div>
          </motion.div>
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