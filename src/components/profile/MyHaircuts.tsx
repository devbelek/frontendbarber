import React, { useEffect, useState } from 'react';
import { Pencil, Trash, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../../api/services';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { useNotification } from '../../context/NotificationContext';
import ImageWithFallback from '../ui/ImageWithFallback';
import { useAuth } from '../../context/AuthContext'; // Добавляем импорт для получения ID пользователя

const MyHaircuts = () => {
  const [haircuts, setHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notification = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth(); // Получаем информацию о пользователе

  useEffect(() => {
    fetchMyHaircuts();
  }, []);

  const fetchMyHaircuts = async () => {
    try {
      setLoading(true);

      // Используем ID барбера вместо 'me'
      const barberId = user?.id;
      if (!barberId) {
        throw new Error('Не удалось определить ID барбера');
      }

      const response = await servicesAPI.getAll({ barber: barberId });

      if (response.data) {
        let results = response.data;

        if (response.data.results && Array.isArray(response.data.results)) {
          results = response.data.results;
        }

        setHaircuts(Array.isArray(results) ? results : []);
      } else {
        setHaircuts([]);
      }
    } catch (err) {
      console.error('Failed to load haircuts:', err);
      setError('Не удалось загрузить стрижки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    // Перенаправляем на страницу редактирования
    navigate(`/edit-service/${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту стрижку?')) return;

    try {
      await servicesAPI.delete(id);
      notification.success('Стрижка удалена', 'Услуга успешно удалена');
      // Обновляем список после удаления
      fetchMyHaircuts();
    } catch (err) {
      console.error('Failed to delete haircut:', err);
      notification.error('Ошибка', 'Не удалось удалить стрижку');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map(i => (
          <Card key={`loading-${i}`}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="h-24 bg-gray-200 rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchMyHaircuts}>
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Мои стрижки</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/add-service')}
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить стрижку
        </Button>
      </div>

      {haircuts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">У вас пока нет добавленных стрижек</p>
            <Button
              variant="primary"
              onClick={() => navigate('/add-service')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Добавить первую стрижку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {haircuts.map(haircut => (
            <Card key={haircut.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4">
                      <ImageWithFallback
                        src={haircut.primary_image || haircut.image}
                        alt={haircut.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{haircut.title}</h3>
                      <p className="text-[#9A0F34] font-bold">{haircut.price} сом</p>
                      <p className="text-sm text-gray-500">Просмотры: {haircut.views || 0}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(haircut.id)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(haircut.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyHaircuts;