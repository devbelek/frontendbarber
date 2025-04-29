import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star, ChevronRight, Phone, Mail } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import BookingModal from '../components/booking/BookingModal';
import { servicesAPI, bookingsAPI } from '../api/services';
import axios from 'axios';
import { Barber, Haircut } from '../types';
import { useLanguage } from '../context/LanguageContext';

const BarberProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [barberHaircuts, setBarberHaircuts] = useState<Haircut[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'info'>('portfolio');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchBarberData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Получаем данные о барбере с API
        const barberResponse = await axios.get(`/api/profiles/barbers/${id}/`);
        const barberData = barberResponse.data;
        console.log('Barber data response:', barberData);

        // Преобразуем данные в формат Barber
        const barberInfo: Barber = {
          id: barberData.id,
          name: `${barberData.first_name} ${barberData.last_name}`,
          avatar: barberData.profile.photo || 'https://images.pexels.com/photos/1081188/pexels-photo-1081188.jpeg',
          rating: barberData.avg_rating || 0,
          reviewCount: barberData.review_count || 0,
          specialization: barberData.profile.specialization || [],
          location: barberData.profile.address || 'Бишкек',
          workingHours: {
            from: barberData.profile.working_hours_from || '09:00',
            to: barberData.profile.working_hours_to || '18:00',
            days: barberData.profile.working_days || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
          },
          portfolio: barberData.portfolio || [],
          description: barberData.profile.bio || 'Информация о барбере'
        };

        setBarber(barberInfo);

        // Получаем стрижки барбера
        const haircutsResponse = await servicesAPI.getAll({ barber: id });
        console.log('Barber haircuts response:', haircutsResponse);

        // Handle both array and pagination object responses
        let haircuts_data = haircutsResponse.data;

        // If data is a pagination object with results property
        if (haircutsResponse.data.results && Array.isArray(haircutsResponse.data.results)) {
          haircuts_data = haircutsResponse.data.results;
        } else if (!Array.isArray(haircuts_data)) {
          console.error('Unexpected response format:', haircutsResponse.data);
          setBarberHaircuts([]);
          return;
        }

        // Преобразуем данные API в формат Haircut
        const haircuts: Haircut[] = haircuts_data.map((service: any) => ({
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

        setBarberHaircuts(haircuts);

        // Получаем отзывы о барбере
        const reviewsResponse = await axios.get(`/api/profiles/reviews/?barber=${id}`);
        console.log('Reviews response:', reviewsResponse);

        let reviewsData = reviewsResponse.data;
        if (reviewsResponse.data.results && Array.isArray(reviewsResponse.data.results)) {
          reviewsData = reviewsResponse.data.results;
        }

        setReviews(reviewsData);

      } catch (err) {
        console.error('Failed to fetch barber data:', err);
        setError('Не удалось загрузить данные о барбере');
      } finally {
        setLoading(false);
      }
    };

    fetchBarberData();
  }, [id]);

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

      // Показываем уведомление об успешном бронировании
      alert('Бронирование успешно создано!');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Не удалось создать бронирование. Пожалуйста, попробуйте снова.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34] mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !barber) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-700">{error || 'Барбер не найден'}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Попробовать снова
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={barber.avatar}
                alt={barber.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <h1 className="text-2xl font-bold mb-2">{barber.name}</h1>

              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-medium mr-1">{barber.rating}</span>
                <span className="text-gray-500">({barber.reviewCount} {t('reviews')})</span>
              </div>

              <p className="text-gray-700 mb-4">{barber.description}</p>

              <div className="flex flex-wrap mb-4">
                <div className="w-full md:w-1/2 flex items-start mb-3">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t('location')}</p>
                    <p className="font-medium">{barber.location}</p>
                  </div>
                </div>

                <div className="w-full md:w-1/2 flex items-start mb-3">
                  <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t('workingHours')}</p>
                    <p className="font-medium">
                      {barber.workingHours.from} - {barber.workingHours.to}
                    </p>
                    <p className="text-sm">
                      {barber.workingHours.days.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {barber.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <Button variant="primary" onClick={() => {
                if (barberHaircuts.length > 0) {
                  setSelectedHaircut(barberHaircuts[0]);
                  setIsBookingModalOpen(true);
                } else {
                  alert('У этого барбера пока нет доступных услуг для бронирования');
                }
              }}>
                {t('bookAppointment')}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-[#9A0F34] text-[#9A0F34]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('portfolio')}
            >
              {t('portfolio')}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-[#9A0F34] text-[#9A0F34]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              {t('reviews')}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-[#9A0F34] text-[#9A0F34]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('info')}
            >
              {t('information')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'portfolio' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('portfolio')}</h2>

              {barberHaircuts.length > 0 ? (
                <HaircutGrid
                  haircuts={barberHaircuts}
                  onBookClick={handleBookClick}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">
                      Этот барбер еще не добавил стрижки в свое портфолио.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('reviews')}</h2>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent>
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium">{review.author_details.first_name || review.author_details.username}</h3>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                fill={star <= review.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">
                      У этого барбера пока нет отзывов.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('information')}</h2>

              <Card className="mb-6">
                <CardContent>
                  <h3 className="font-medium mb-3">{t('location')}</h3>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{barber.location}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        10 минут от метро, вход со двора
                      </p>
                    </div>
                  </div>

                  {/* Map placeholder - в реальном приложении здесь будет встроенная карта */}
                  <div className="mt-4 h-48 bg-gray-200 rounded-md flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Карта местоположения</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent>
                  <h3 className="font-medium mb-3">{t('workingHours')}</h3>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {barber.workingHours.days.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {barber.workingHours.from} - {barber.workingHours.to}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <h3 className="font-medium mb-3">Контакты</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <p>+996 700 123 456</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <p>barber@barberhub.kg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        haircut={selectedHaircut || (barberHaircuts.length > 0 ? barberHaircuts[0] : null)}
        onConfirm={handleBookingConfirm}
      />
    </Layout>
  );
};

export default BarberProfilePage;