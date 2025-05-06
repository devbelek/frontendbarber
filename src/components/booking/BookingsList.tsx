import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Scissors } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { bookingsAPI } from '../../api/services';
import { Booking } from '../../types';

const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
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

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshBookings = () => {
    setRefreshCounter(prev => prev + 1);
  };

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

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      refreshBookings();
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert('Не удалось отменить бронирование. Пожалуйста, попробуйте позже.');
    }
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
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <Scissors className="h-5 w-5 text-[#9A0F34] mr-2" />
                  <h3 className="font-semibold text-lg">
                    {booking.service_details?.title || 'Услуга'}
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

                  {booking.service_details?.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{booking.service_details.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <BookingStatusBadge status={booking.status} />

                <div className="mt-3 text-xl font-bold">
                  {booking.service_details?.price} сом
                </div>

                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <Button
                    variant="outline"
                    className="mt-2 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Отменить
                  </Button>
                )}
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

export default BookingsList;