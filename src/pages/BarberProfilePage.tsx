import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star, ChevronRight, Phone, Mail } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import BookingModal from '../components/booking/BookingModal';
import { barbers, haircuts } from '../data/mockData';
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

  useEffect(() => {
    // Find the barber by ID
    const foundBarber = barbers.find(b => b.id === id);
    setBarber(foundBarber || null);
    
    // Find haircuts by this barber
    const foundHaircuts = haircuts.filter(h => h.barberId === id);
    setBarberHaircuts(foundHaircuts);
  }, [id]);

  const handleBookClick = (haircut: Haircut) => {
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };
  
  const handleBookingConfirm = (date: string, time: string) => {
    // In a real app, this would send the booking to an API
    console.log('Booking confirmed:', { haircut: selectedHaircut, date, time });
    setIsBookingModalOpen(false);
    // You might show a success message or redirect the user
  };

  if (!barber) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34] mx-auto mb-4"></div>
          <p>{t('loading')}</p>
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
              
              <Button variant="primary" onClick={() => setIsBookingModalOpen(true)}>
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
              
              {/* Sample reviews - in a real app, these would come from an API */}
              <div className="space-y-4">
                <Card>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Александр К.</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= 5 ? 'text-yellow-500' : 'text-gray-300'}`} 
                            fill={star <= 5 ? 'currentColor' : 'none'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">1 июня 2025</p>
                    <p className="text-gray-700">
                      Отличная стрижка! Мастер точно воспроизвел желаемую стрижку по фото. Рекомендую!
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Михаил С.</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= 4 ? 'text-yellow-500' : 'text-gray-300'}`} 
                            fill={star <= 4 ? 'currentColor' : 'none'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">28 мая 2025</p>
                    <p className="text-gray-700">
                      Хороший барбер, стрижка получилась очень близко к фото. Единственный минус - немного задержался по времени.
                    </p>
                  </CardContent>
                </Card>
                
                <Link 
                  to="#" 
                  className="flex items-center justify-center text-[#9A0F34] hover:text-[#7b0c29] font-medium p-3"
                >
                  Показать больше отзывов
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
              </div>
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
                  
                  {/* Map placeholder - in a real app, this would be an embedded map */}
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