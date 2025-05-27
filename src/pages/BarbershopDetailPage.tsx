import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Instagram, MessageCircle, Star, Users, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import { barbershopsAPI } from '../api/barbershops';
import { servicesAPI } from '../api/services';
const BarbershopDetailPage = ({ openLoginModal }) => {
  const { id } = useParams();
  const [barbershop, setBarbershop] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    fetchBarbershopData();
  }, [id]);

  const fetchBarbershopData = async () => {
    try {
      setLoading(true);

      // Получаем данные барбершопа
      const shopResponse = await barbershopsAPI.getById(id);
      setBarbershop(shopResponse.data);

      // Получаем барберов
      const barbersResponse = await barbershopsAPI.getBarbers(id);
      setBarbers(barbersResponse.data || []);

      // Получаем услуги всех барберов
      const servicesResponse = await barbershopsAPI.getServices(id);
      setServices(servicesResponse.data || []);
    } catch (error) {
      console.error('Error fetching barbershop data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout openLoginModal={openLoginModal}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!barbershop) {
    return (
      <Layout openLoginModal={openLoginModal}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Барбершоп не найден</h2>
          <Link to="/barbershops">
            <Button variant="primary">К списку барбершопов</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="min-h-screen bg-gray-50">
        {/* Шапка барбершопа */}
        <div className="relative h-64 md:h-80">
          <img
            src={barbershop.photos?.[0] || '/default-barbershop-bg.jpg'}
            alt={barbershop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <div className="flex items-end gap-6">
                <img
                  src={barbershop.logo || '/default-barbershop.jpg'}
                  alt={barbershop.name}
                  className="w-24 h-24 rounded-lg border-4 border-white shadow-lg"
                />
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">{barbershop.name}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="font-medium">{barbershop.rating || 0}</span>
                      <span className="opacity-75 ml-1">({barbershop.reviewCount || 0})</span>
                    </div>
                    {barbershop.isVerified && (
                      <div className="bg-green-500 px-3 py-1 rounded-full text-sm">
                        ✓ Проверено
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Левая колонка - информация */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-semibold mb-4">Информация</h3>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Адрес</p>
                      <p className="font-medium">{barbershop.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Часы работы</p>
                      <p className="font-medium">
                        {barbershop.workingHours.from} - {barbershop.workingHours.to}
                      </p>
                      <p className="text-sm text-gray-500">
                        {barbershop.workingHours.days.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Телефон</p>
                      <a href={`tel:${barbershop.phone}`} className="font-medium text-[#9A0F34]">
                        {barbershop.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-3">Социальные сети</p>
                  <div className="flex gap-2">
                    {barbershop.whatsapp && (

                       <a href={`https://wa.me/${barbershop.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    )}
                    {barbershop.instagram && (

                       <a  href={`https://instagram.com/${barbershop.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Барберы */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Наши барберы ({barbers.length})
                </h3>

                <div className="space-y-3">
                  {barbers.map((barber) => (
                    <Link
                      key={barber.id}
                      to={`/barber/${barber.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={barber.profile?.photo || '/default-avatar.png'}
                        alt={barber.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {barber.first_name} {barber.last_name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{barber.avg_rating || 0}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая колонка - услуги */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-6">Наши работы</h3>

                {services.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Пока нет добавленных работ</p>
                  </div>
                ) : (
                  <HaircutGrid
                    haircuts={services}
                    onBookClick={(haircut) => {
                      // Обработка бронирования
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BarbershopDetailPage;