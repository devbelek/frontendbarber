import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ChevronRight, Phone, Mail, MessageSquare, ExternalLink } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'portfolio' | 'info'>('portfolio');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          rating: 0, // We're removing ratings
          reviewCount: 0,
          specialization: barberData.profile.specialization || [],
          location: barberData.profile.address || 'Бишкек',
          workingHours: {
            from: barberData.profile.working_hours_from || '09:00',
            to: barberData.profile.working_hours_to || '18:00',
            days: barberData.profile.working_days || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
          },
          portfolio: barberData.portfolio || [],
          description: barberData.profile.bio || 'Информация о барбере',
          whatsapp: barberData.profile.whatsapp || '',
          telegram: barberData.profile.telegram || '',
          offerHomeService: barberData.profile.offers_home_service || false
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

      } catch (err) {
        console.error('Failed to fetch barber data:', err);
        setError('Не удалось загрузить данные о барбере');
      } finally {
        setLoading(false);
      }
    };

    fetchBarberData();
  }, [id]);

  const handleContactClick = (type: 'whatsapp' | 'telegram', contact: string) => {
    let url = '';
    if (type === 'whatsapp') {
      url = `https://wa.me/${contact}`;
    } else if (type === 'telegram') {
      url = `https://t.me/${contact}`;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <Layout openLoginModal={() => {}}>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34] mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !barber) {
    return (
      <Layout openLoginModal={() => {}}>
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

  // Custom Comb Icon for Profile
  const CombIcon = ({ className = "" }) => (
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
      className={className}
    >
      <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
    </svg>
  );

  return (
    <Layout openLoginModal={() => {}}>
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
              <h1 className="text-2xl font-bold mb-4">{barber.name}</h1>

              <p className="text-gray-700 mb-4">{barber.description}</p>

              <div className="flex flex-wrap mb-4">
                <div className="w-full md:w-1/2 flex items-start mb-3">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t('location')}</p>
                    <p className="font-medium">{barber.location || 'Не указано'}</p>
                    {barber.offerHomeService && (
                      <p className="text-sm text-[#9A0F34] mt-1">Выезд на дом</p>
                    )}
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

              <div className="flex flex-wrap gap-3">
                {barber.whatsapp && (
                  <Button
                    variant="outline"
                    onClick={() => handleContactClick('whatsapp', barber.whatsapp || '')}
                    className="flex items-center"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-green-500">
                      <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </Button>
                )}

                {barber.telegram && (
                  <Button
                    variant="outline"
                    onClick={() => handleContactClick('telegram', barber.telegram || '')}
                    className="flex items-center"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-blue-500">
                      <path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                    </svg>
                    Telegram
                  </Button>
                )}

                {(!barber.whatsapp && !barber.telegram) && (
                  <p className="text-gray-500 italic">Контактные данные не указаны</p>
                )}
              </div>
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
                  onBookClick={() => {}}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <CombIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Этот барбер еще не добавил стрижки в свое портфолио.
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
                      <p className="font-medium">{barber.location || 'Не указано'}</p>
                      {barber.offerHomeService && (
                        <div className="mt-2 text-[#9A0F34] bg-[#9A0F34]/5 p-2 rounded-md inline-flex items-center">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          <span>Возможен выезд на дом</span>
                        </div>
                      )}
                    </div>
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
                    {barber.whatsapp && (
                      <div
                        className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleContactClick('whatsapp', barber.whatsapp || '')}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-green-500">
                          <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span>WhatsApp: {barber.whatsapp}</span>
                      </div>
                    )}

                    {barber.telegram && (
                      <div
                        className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleContactClick('telegram', barber.telegram || '')}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-blue-500">
                          <path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                        </svg>
                        <span>Telegram: {barber.telegram}</span>
                      </div>
                    )}

                    {(!barber.whatsapp && !barber.telegram) && (
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="text-gray-500 italic">Контактные данные не указаны</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BarberProfilePage;