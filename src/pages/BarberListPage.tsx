import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User, Clock } from 'lucide-react';
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

const BarberListPage: React.FC<BarberListPageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const { currentRegion } = useLocation();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredBarbers, setFilteredBarbers] = useState([]);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Запрос списка барберов...');
        const response = await profileAPI.getAllBarbers();
        console.log('Ответ API барберов:', response);

        if (response && response.data) {
          let barbersData = [];

          if (response.data.results && Array.isArray(response.data.results)) {
            barbersData = response.data.results;
          } else if (Array.isArray(response.data)) {
            barbersData = response.data;
          }

          console.log('Обработанные данные барберов:', barbersData);

          if (barbersData.length > 0) {
            setBarbers(barbersData);
          } else {
            setError('В системе пока нет зарегистрированных барберов');
          }
        } else {
          setBarbers([]);
          setError('Не удалось получить данные о барберах');
        }
      } catch (err) {
        console.error('Ошибка при загрузке барберов:', err);
        setError('Не удалось загрузить барберов. Пожалуйста, попробуйте позже.');
        setBarbers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  useEffect(() => {
    if (barbers.length > 0) {
      const filtered = barbers.filter(barber => {
        const barberAddress = barber.profile?.address || '';
        const regionName = currentRegion.name.toLowerCase();
        return barberAddress.toLowerCase().includes(regionName);
      });

      setFilteredBarbers(filtered);
    }
  }, [barbers, currentRegion]);

  const getFullName = (barber) => {
    if (barber.first_name || barber.last_name) {
      return `${barber.first_name || ''} ${barber.last_name || ''}`.trim();
    }
    return barber.username;
  };

  const barbersToDisplay = filteredBarbers.length > 0 ? filteredBarbers : barbers;

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('barbers')}</h1>

        <div className="mb-6">
          <p className="text-gray-600">
            Выбранный регион: <span className="font-medium">{currentRegion.name}</span>
          </p>
          {filteredBarbers.length === 0 && barbers.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Показаны все барберы, так как в выбранном регионе барберов не найдено
            </p>
          )}
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
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        ) : barbersToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {barbersToDisplay.map((barber) => (
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

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{barber.profile?.address || 'Локация не указана'}</span>
                  </div>

                  {barber.profile?.working_hours_from && barber.profile?.working_hours_to && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{barber.profile.working_hours_from} - {barber.profile.working_hours_to}</span>
                    </div>
                  )}

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
            <p className="text-gray-600 mb-4">
              {filteredBarbers.length === 0 && barbers.length > 0
                ? `В регионе "${currentRegion.name}" барберы не найдены.`
                : 'Барберы не найдены.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BarberListPage;