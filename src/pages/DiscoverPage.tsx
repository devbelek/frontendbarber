import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Star, Users, Search, Filter, Store, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { profileAPI } from '../api/services';
import { barbershopsAPI } from '../api/barbershops';

interface DiscoverPageProps {
  openLoginModal: () => void;
}

const DiscoverPage: React.FC<DiscoverPageProps> = ({ openLoginModal }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'barbers' | 'barbershops'>('barbers');
  const [barbers, setBarbers] = useState([]);
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Загружаем барберов
      const barbersResponse = await profileAPI.getAllBarbers();
      if (barbersResponse?.data) {
        setBarbers(Array.isArray(barbersResponse.data)
          ? barbersResponse.data
          : barbersResponse.data.results || []);
      }

      // Загружаем барбершопы
      const barbershopsResponse = await barbershopsAPI.getAll();
      if (barbershopsResponse?.data) {
        setBarbershops(Array.isArray(barbershopsResponse.data)
          ? barbershopsResponse.data
          : barbershopsResponse.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarbers = barbers.filter(barber => {
    const fullName = `${barber.first_name || ''} ${barber.last_name || ''}`.toLowerCase();
    const address = (barber.profile?.address || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || address.includes(query);
    const matchesRegion = selectedRegion === 'all' ||
      (barber.profile?.address || '').toLowerCase().includes(selectedRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  const filteredBarbershops = barbershops.filter(shop => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = shop.name.toLowerCase().includes(query) ||
      shop.address.toLowerCase().includes(query);
    const matchesRegion = selectedRegion === 'all' ||
      shop.address.toLowerCase().includes(selectedRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  const handleBarberClick = (barberId: string) => {
    navigate(`/barber/${barberId}`);
  };

  const handleBarbershopClick = (barbershopId: string) => {
    navigate(`/barbershop/${barbershopId}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
  };

  // Безопасная функция для получения рабочих часов
  const getWorkingHours = (shop: any) => {
    if (shop.working_hours) {
      return `${shop.working_hours.from || '09:00'} - ${shop.working_hours.to || '21:00'}`;
    } else if (shop.working_hours_from && shop.working_hours_to) {
      return `${shop.working_hours_from} - ${shop.working_hours_to}`;
    }
    return '09:00 - 21:00'; // Значение по умолчанию
  };

  // Безопасная функция для получения рабочих дней
  const getWorkingDays = (shop: any) => {
    if (shop.working_hours?.days && Array.isArray(shop.working_hours.days)) {
      return shop.working_hours.days;
    } else if (shop.working_days && Array.isArray(shop.working_days)) {
      return shop.working_days;
    }
    return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']; // Значение по умолчанию
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Найти барбера или барбершоп</h1>
            <p className="text-lg opacity-90">
              Лучшие мастера и заведения вашего города
            </p>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            {/* Поисковая строка */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Поиск ${activeTab === 'barbers' ? 'барберов' : 'барбершопов'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
              />
            </div>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-2 mb-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
              >
                <option value="all">Все регионы</option>
                <option value="Бишкек">Бишкек</option>
                <option value="Ош">Ош</option>
                <option value="Джалал-Абад">Джалал-Абад</option>
                <option value="Каракол">Каракол</option>
              </select>

              {(searchQuery || selectedRegion !== 'all') && (
                <Button onClick={resetFilters} variant="outline" size="sm">
                  Сбросить фильтры
                </Button>
              )}
            </div>

            {/* Табы */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('barbers')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'barbers'
                    ? 'text-[#9A0F34] border-b-2 border-[#9A0F34]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="h-5 w-5 inline-block mr-2" />
                Барберы ({filteredBarbers.length})
              </button>
              <button
                onClick={() => setActiveTab('barbershops')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'barbershops'
                    ? 'text-[#9A0F34] border-b-2 border-[#9A0F34]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Store className="h-5 w-5 inline-block mr-2" />
                Барбершопы ({filteredBarbershops.length})
              </button>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg p-6">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Барберы */}
              {activeTab === 'barbers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBarbers.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Барберы не найдены
                      </h3>
                      <p className="text-gray-600">
                        Попробуйте изменить параметры поиска
                      </p>
                    </div>
                  ) : (
                    filteredBarbers.map((barber) => (
                      <Card
                        key={barber.id}
                        className="overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        <div className="relative h-48">
                          <ImageWithFallback
                            src={barber.profile?.photo || '/default-avatar.png'}
                            alt={`${barber.first_name} ${barber.last_name}`}
                            className="w-full h-full object-cover"
                          />
                          {barber.profile?.offers_home_service && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                              Выезд на дом
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-1">
                            {barber.first_name} {barber.last_name}
                          </h3>

                          <div className="flex items-center mb-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">{barber.avg_rating || 0}</span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({barber.review_count || 0})
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{barber.profile?.address || 'Локация не указана'}</span>
                          </div>

                          {barber.profile?.working_hours_from && (
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {barber.profile.working_hours_from} - {barber.profile.working_hours_to}
                              </span>
                            </div>
                          )}

                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() => handleBarberClick(barber.id)}
                          >
                            Посмотреть профиль
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Барбершопы */}
              {activeTab === 'barbershops' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBarbershops.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Барбершопы не найдены
                      </h3>
                      <p className="text-gray-600 mb-4">
                        В данный момент в системе нет зарегистрированных барбершопов
                      </p>
                      <p className="text-sm text-gray-500">
                        Вы можете просмотреть индивидуальных барберов во вкладке "Барберы"
                      </p>
                    </div>
                  ) : (
                    filteredBarbershops.map((shop) => (
                      <Card
                        key={shop.id}
                        className="overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        <div className="relative h-48">
                          <img
                            src={shop.logo || '/default-barbershop.jpg'}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                          {shop.is_verified && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                              ✓ Проверено
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="text-xl font-bold mb-2">{shop.name}</h3>

                          <div className="flex items-center mb-3">
                            <Star className="h-5 w-5 text-yellow-400 mr-1" />
                            <span className="font-medium">{shop.rating || 0}</span>
                            <span className="text-gray-500 ml-1">
                              ({shop.review_count || 0} отзывов)
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{shop.address}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{getWorkingHours(shop)}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{shop.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-gray-600">
                                {shop.barbers?.length || 0} барберов
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() => handleBarbershopClick(shop.id)}
                          >
                            Подробнее
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DiscoverPage;