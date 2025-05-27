import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Star, Users, Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { barbershopsAPI } from '../api/barbershops';

const BarbershopsPage = ({ openLoginModal }) => {
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async () => {
    try {
      setLoading(true);
      const response = await barbershopsAPI.getAll();
      setBarbershops(response.data || []);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarbershops = barbershops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero секция */}
        <div className="bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Барбершопы Бишкека</h1>
            <p className="text-xl opacity-90">
              Найдите лучший барбершоп рядом с вами
            </p>
          </div>
        </div>

        {/* Поиск */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск барбершопов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
              />
            </div>
          </div>
        </div>

        {/* Список барбершопов */}
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
          ) : filteredBarbershops.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Барбершопы не найдены
              </h3>
              <p className="text-gray-600">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBarbershops.map((shop) => (
                <Card key={shop.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={shop.logo || '/default-barbershop.jpg'}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                    {shop.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        ✓ Проверено
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{shop.name}</h3>

                    <div className="flex items-center mb-3">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="font-medium">{shop.rating || 0}</span>
                      <span className="text-gray-500 ml-1">
                        ({shop.reviewCount || 0} отзывов)
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{shop.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {shop.workingHours.from} - {shop.workingHours.to}
                        </span>
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

                    <Link to={`/barbershop/${shop.id}`}>
                      <Button variant="primary" fullWidth>
                        Подробнее
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BarbershopsPage;