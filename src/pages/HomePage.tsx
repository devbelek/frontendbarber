import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, Clock, MessageSquare, MapPin } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import BookingModal from '../components/booking/BookingModal';
import { servicesAPI } from '../api/services';
import { bookingsAPI } from '../api/services';
import { Haircut } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

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
      {/* Hero Section - Modern Design */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 opacity-80"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg)',
            filter: 'brightness(0.5)'
          }}
        ></div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
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
                  className="h-6 w-6 text-[#f4a4b8]"
                >
                  <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
                  <path d="M8 6h8" />
                  <path d="M8 10h8" />
                  <path d="M8 14h8" />
                  <path d="M8 18h8" />
                </svg>
                <span className="ml-3 text-2xl font-semibold bg-gradient-to-r from-white to-[#f4a4b8] text-transparent bg-clip-text">TARAK</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
                {t('heroTitle')}
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl mx-auto">
                Находите талантливых барберов по их работам и выбирайте идеальную стрижку для себя
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link to="/gallery">
                <Button variant="primary" size="lg" className="w-full sm:w-auto bg-[#9A0F34] hover:bg-[#7b0c29] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {t('exploreGallery')}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/70 text-white hover:bg-white/10 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
                onClick={openLoginModal}
              >
                Я барбер
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Wave SVG separator */}
        <div className="absolute bottom-0 left-0 right-0 text-white overflow-hidden leading-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-16 w-full">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#ffffff"/>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#ffffff"/>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>

      {/* Platform Benefits Section - replacing statistics */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Как это работает</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">Ваш путь к идеальной стрижке</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              TARAK соединяет клиентов и барберов. Нет необходимости регистрироваться, чтобы найти подходящего мастера.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={itemVariants}
              className="bg-gray-50 p-8 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2"
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
              className="bg-gray-50 p-8 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2"
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
              className="bg-gray-50 p-8 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2"
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

      {/* Barber Value Proposition */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Для барберов</span>
                <h2 className="text-3xl font-bold mt-2 mb-6">Расширьте свою клиентскую базу с TARAK</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
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

                  <div className="flex items-start">
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

                  <div className="flex items-start">
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

              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img
                    src="https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg"
                    alt="Барбер за работой"
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg w-48">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-[#9A0F34] mr-2"
                    >
                      <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
                      <path d="M8 6h8" />
                      <path d="M8 10h8" />
                      <path d="M8 14h8" />
                      <path d="M8 18h8" />
                    </svg>
                    <span className="font-semibold">Свой график</span>
                  </div>
                  <p className="text-sm text-gray-600">Устанавливайте своё рабочее время и принимайте удобные заказы</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Haircuts Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Найди свой стиль</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">{t('popularHaircuts')}</h2>
            </div>
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

      {/* CTA Section - Modern Design */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <circle className="text-white opacity-5" cx="400" cy="400" r="300" fill="none" strokeWidth="40" stroke="currentColor"/>
            <circle className="text-white opacity-5" cx="600" cy="200" r="100" fill="currentColor"/>
            <circle className="text-white opacity-5" cx="200" cy="600" r="100" fill="currentColor"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 mx-auto mb-6 text-white opacity-80"
            >
              <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
              <path d="M8 6h8" />
              <path d="M8 10h8" />
              <path d="M8 14h8" />
              <path d="M8 18h8" />
            </svg>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Присоединяйтесь к TARAK</h2>
            <p className="text-xl text-white opacity-90 mb-8">
              Для барберов — отличная возможность расширить клиентскую базу.
              Для клиентов — простой способ найти идеальную стрижку.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-[#9A0F34] hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={openLoginModal}
              >
                Я барбер
              </Button>
              <Link to="/gallery">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Смотреть стрижки
                </Button>
              </Link>
            </div>
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