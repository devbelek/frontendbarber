import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, User } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { profileAPI } from '../api/services';

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

        // Запрос данных с API
        const response = await profileAPI.getAllBarbers();
        console.log('Barbers response:', response);

        // Используем демо-данные, если API возвращает пустой массив
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          // Демо-данные барберов
          setBarbers([
            {
              id: '1',
              username: 'alexander_p',
              first_name: 'Александр',
              last_name: 'Петров',
              profile: {
                photo: 'https://images.pexels.com/photos/1081188/pexels-photo-1081188.jpeg',
                user_type: 'barber',
                address: 'Бишкек, Центр'
              },
              avg_rating: 4.8,
              review_count: 124
            },
            {
              id: '2',
              username: 'maxim_k',
              first_name: 'Максим',
              last_name: 'Кузнецов',
              profile: {
                photo: 'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg',
                user_type: 'barber',
                address: 'Бишкек, Восток'
              },
              avg_rating: 4.9,
              review_count: 98
            },
            {
              id: '3',
              username: 'ruslan_d',
              first_name: 'Руслан',
              last_name: 'Доскеев',
              profile: {
                photo: 'https://images.pexels.com/photos/1853958/pexels-photo-1853958.jpeg',
                user_type: 'barber',
                address: 'Бишкек, Запад'
              },
              avg_rating: 4.7,
              review_count: 75
            }
          ]);
          return;
        }

        // Обработка ответа API
        let barbersData: Barber[] = [];

        if (Array.isArray(response.data)) {
          barbersData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          barbersData = response.data.results;
        }

        // Фильтрация по региону, если необходимо
        if (currentRegion && currentRegion.id !== 'all') {
          barbersData = barbersData.filter((barber) =>
            barber.profile?.address?.includes(currentRegion.name)
          );
        }

        setBarbers(barbersData);
      } catch (err) {
        console.error('Error fetching barbers:', err);
        setError('Не удалось загрузить список барберов. Пожалуйста, попробуйте позже.');

        // Используем демо-данные как резервный вариант
        setBarbers([
          {
            id: '1',
            username: 'alexander_p',
            first_name: 'Александр',
            last_name: 'Петров',
            profile: {
              photo: 'https://images.pexels.com/photos/1081188/pexels-photo-1081188.jpeg',
              user_type: 'barber',
              address: 'Бишкек, Центр'
            },
            avg_rating: 4.8,
            review_count: 124
          },
          {
            id: '2',
            username: 'maxim_k',
            first_name: 'Максим',
            last_name: 'Кузнецов',
            profile: {
              photo: 'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg',
              user_type: 'barber',
              address: 'Бишкек, Восток'
            },
            avg_rating: 4.9,
            review_count: 98
          },
          {
            id: '3',
            username: 'ruslan_d',
            first_name: 'Руслан',
            last_name: 'Доскеев',
            profile: {
              photo: 'https://images.pexels.com/photos/1853958/pexels-photo-1853958.jpeg',
              user_type: 'barber',
              address: 'Бишкек, Запад'
            },
            avg_rating: 4.7,
            review_count: 75
          }
        ]);
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
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {barber.profile?.photo ? (
                      <ImageWithFallback
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