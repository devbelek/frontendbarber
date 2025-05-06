// src/pages/BarberListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import axios from 'axios';

interface BarberListPageProps {
  openLoginModal: () => void;
}

interface Barber {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile: {
    photo: string | null;
    user_type: string;
    address: string | null;
  };
  avg_rating?: number;
  review_count?: number;
}

const BarberListPage: React.FC<BarberListPageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const { currentRegion } = useLocation();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchBarbers = async () => {
        try {
          setLoading(true);
          setError(null);

          // Здесь используем общедоступный API для получения списка барберов
          const response = await axios.get('/api/profiles/barbers/');

          if (response.data) {
            // Проверяем, является ли response.data массивом
            const barbersData = Array.isArray(response.data) ? response.data :
                               (response.data.results ? response.data.results : []);

            // Фильтруем барберов по региону, если выбран
            let filteredBarbers = barbersData;
            if (currentRegion && currentRegion.id !== 'all') {
              filteredBarbers = barbersData.filter((barber) =>
                barber.profile?.address?.includes(currentRegion.name)
              );
            }

            setBarbers(filteredBarbers);
          }
        } catch (err) {
          console.error('Error fetching barbers:', err);
          setError('Не удалось загрузить список барберов. Пожалуйста, попробуйте позже.');
        } finally {
          setLoading(false);
        }
      };

      fetchBarbers();
    }, [currentRegion]);

  const getFullName = (barber: Barber) => {
    if (barber.first_name || barber.last_name) {
      return `${barber.first_name || ''} ${barber.last_name || ''}`.trim();
    }
    return barber.username;
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('barbers')}</h1>

        <div className="mb-6">
          <p className="text-gray-600">
            Выбранный регион: <span className="font-medium">{currentRegion.name}</span>
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow h-80">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
          </div>
        ) : barbers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {barbers.map((barber) => (
              <Card key={barber.id} className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    {barber.profile?.photo ? (
                      <img
                        src={barber.profile.photo}
                        alt={getFullName(barber)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{getFullName(barber)}</h3>

                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{barber.avg_rating || '5.0'}</span>
                    <span className="text-sm text-gray-500 ml-1">({barber.review_count || '0'})</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{barber.profile?.address || 'Локация не указана'}</span>
                  </div>

                  <Link to={`/barber/${barber.id}`}>
                    <Button variant="outline" fullWidth>
                      {t('viewAll')}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600 mb-4">Барберы не найдены. Попробуйте изменить регион поиска.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BarberListPage;