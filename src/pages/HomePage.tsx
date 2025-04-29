import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Scissors, Calendar, Clock, Star } from 'lucide-react';
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
                <Scissors className="h-6 w-6 text-[#f4a4b8]" />
                <span className="ml-3 text-2xl font-semibold bg-gradient-to-r from-white to-[#f4a4b8] text-transparent bg-clip-text">TARAK</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
                {t('heroTitle')}
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl mx-auto">
                {t('heroSubtitle')}
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
                {t('becomeBarber')}
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

      {/* Statistics Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-[#9A0F34] mb-2">50+</div>
              <p className="text-gray-600">Профессиональных барберов</p>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-[#9A0F34] mb-2">500+</div>
              <p className="text-gray-600">Стрижек в каталоге</p>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-[#9A0F34] mb-2">1000+</div>
              <p className="text-gray-600">Довольных клиентов</p>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-[#9A0F34] mb-2">4.8</div>
              <p className="text-gray-600">Средняя оценка</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Haircuts Section */}
      <section className="py-12 md:py-20 bg-gray-50">
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

      {/* Features Section - Modern Design */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Преимущества</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">{t('howItWorks')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('howItWorksDescription')}
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Feature 1 */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-8 shadow-lg border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-full flex items-center justify-center">
                <Scissors className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">{t('chooseHaircut')}</h3>
              <p className="text-gray-600 text-center">
                {t('chooseHaircutDescription')}
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-8 shadow-lg border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">{t('bookBarber')}</h3>
              <p className="text-gray-600 text-center">
                {t('bookBarberDescription')}
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-8 shadow-lg border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">{t('saveTime')}</h3>
              <p className="text-gray-600 text-center">
                {t('saveTimeDescription')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#9A0F34] font-semibold text-sm uppercase tracking-wider">Отзывы</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Что говорят наши клиенты</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Узнайте, что думают клиенты о нашем сервисе и барберах
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Отличный сервис! Нашел именно ту стрижку, которую хотел, и барбер сделал все идеально. Теперь всегда буду пользоваться TARAK."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Александр К.</h4>
                  <p className="text-gray-500 text-sm">Бишкек</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Впервые воспользовался сервисом по рекомендации друга. Удобно выбирать стрижку по фото, а не объяснять словами. Результат превзошел ожидания!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Максим Д.</h4>
                  <p className="text-gray-500 text-sm">Бишкек</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                  <Star className="h-5 w-5 text-gray-300" />
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Очень удобно бронировать услуги через сайт. Уже дважды стригся у разных барберов, и оба раза остался доволен. Рекомендую всем!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Руслан Т.</h4>
                  <p className="text-gray-500 text-sm">Бишкек</p>
                </div>
              </div>
            </div>
          </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('readyToTry')}</h2>
            <p className="text-xl text-white opacity-90 mb-8">
              {t('readyToTryDescription')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-[#9A0F34] hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={openLoginModal}
              >
                {t('becomeBarber')}
              </Button>
              <Link to="/gallery">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {t('browseHaircuts')}
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