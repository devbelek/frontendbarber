import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, User, Check, X, Eye, Edit, Trash } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { bookingsAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const BarberBookingsList: React.FC = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { user } = useAuth();
  const notification = useNotification();

  const refreshBookings = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // Эффект для обновления списка при монтировании компонента
  useEffect(() => {
    // Немедленно обновляем при монтировании
    refreshBookings();

    // Устанавливаем интервал для периодического обновления данных (каждые 30 секунд)
    const intervalId = setInterval(() => {
      refreshBookings();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await bookingsAPI.getAll();

        if (response.data) {
          setBookings(Array.isArray(response.data) ? response.data : (response.data.results || []));
        } else {
          setBookings([]);
        }
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError('Не удалось загрузить бронирования. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [refreshCounter]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      notification.success(
        'Статус обновлен',
        `Статус бронирования изменен на "${newStatus === 'confirmed' ? 'Подтверждено' :
          newStatus === 'completed' ? 'Завершено' :
          newStatus === 'cancelled' ? 'Отменено' : 'Ожидает подтверждения'}"`
      );
      refreshBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      notification.error('Ошибка', 'Не удалось обновить статус бронирования');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      notification.success('Удалено', 'Бронирование успешно удалено');
      refreshBookings();
    } catch (err) {
      console.error('Error deleting booking:', err);
      notification.error('Ошибка', 'Не удалось удалить бронирование');
    }
  };

  const BookingStatusBadge = ({ status }) => {
    let colorClass = '';
    let label = '';

    switch (status) {
      case 'pending':
        colorClass = 'bg-yellow-100 text-yellow-800';
        label = 'Ожидает подтверждения';
        break;
      case 'confirmed':
        colorClass = 'bg-blue-100 text-blue-800';
        label = 'Подтверждено';
        break;
      case 'completed':
        colorClass = 'bg-green-100 text-green-800';
        label = 'Завершено';
        break;
      case 'cancelled':
        colorClass = 'bg-red-100 text-red-800';
        label = 'Отменено';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
        label = status;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(2)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
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
          <Button onClick={() => refreshBookings()}>
            Повторить загрузку
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            У вас пока нет бронирований
          </p>
        </CardContent>
      </Card>
    );
  }

  // Функция форматирования даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Функция форматирования времени
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // Берем только часы и минуты
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Бронирования на мои услуги</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshBookings}
        >
          Обновить
        </Button>
      </div>

      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-[#9A0F34] mr-2" />
                  <h3 className="font-semibold text-lg">
                    {booking.client_name || "Клиент"}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(booking.date)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatTime(booking.time)}</span>
                  </div>

                  {booking.service_details?.title && (
                    <div className="flex items-center text-sm font-medium">
                      Услуга: {booking.service_details.title}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <BookingStatusBadge status={booking.status} />

                <div className="mt-3 text-xl font-bold">
                  {booking.service_details?.price} сом
                </div>

                {/* Управление статусом бронирования */}
                <div className="mt-2 flex space-x-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Подтвердить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Отменить
                      </Button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Завершено
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Отменить
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(booking.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Примечания:</h4>
                <p className="text-sm text-gray-600">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BarberBookingsList;