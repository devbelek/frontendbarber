import React, { useState, useEffect } from "react";
import { Clock, Calendar, User, Check, X, Trash, Phone } from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { bookingsAPI } from "../../api/services";
import { useNotification } from "../../context/NotificationContext";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Booking } from "../../types";

const BarberBookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const notification = useNotification();

  const refreshBookings = () => setRefreshCounter((prev) => prev + 1);

  useEffect(() => {
    refreshBookings();
    const intervalId = setInterval(refreshBookings, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await bookingsAPI.getAll();
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];
        setBookings(list);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить бронирования. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [refreshCounter]);

  const handleUpdateStatus = async (id: string, status: Booking["status"]) => {
    try {
      await bookingsAPI.updateStatus(id, status);
      notification.success("Статус обновлен", `Статус изменён на "${status}"`);
      refreshBookings();
    } catch (err) {
      console.error(err);
      notification.error("Ошибка", "Не удалось обновить статус");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    try {
      await bookingsAPI.delete(bookingToDelete);
      notification.success("Удалено", "Бронирование удалено");
      setDeleteConfirmOpen(false);
      setBookingToDelete(null);
      refreshBookings();
    } catch (err) {
      console.error(err);
      notification.error("Ошибка", "Не удалось удалить");
    }
  };

  const formatDate = (str: string) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(str));

  const formatTime = (str: string) => str.slice(0, 5);

  const getClientName = (booking: Booking): string => {
    if (booking.client_name_contact) return booking.client_name_contact;
    const { client } = booking;
    if (client?.first_name || client?.last_name)
      return `${client?.first_name ?? ""} ${client?.last_name ?? ""}`.trim();
    return client?.username || "Клиент";
  };

  const BookingStatusBadge: React.FC<{ status: Booking["status"] }> = ({
    status,
  }) => {
    const statusMap: Record<Booking["status"], [string, string]> = {
      pending: ["bg-yellow-100 text-yellow-800", "Ожидает подтверждения"],
      confirmed: ["bg-blue-100 text-blue-800", "Подтверждено"],
      completed: ["bg-green-100 text-green-800", "Завершено"],
      cancelled: ["bg-red-100 text-red-800", "Отменено"],
    };

    const [color, label] = statusMap[status] || [
      "bg-gray-100 text-gray-800",
      status,
    ];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
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
          <Button onClick={refreshBookings}>Повторить загрузку</Button>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">У вас пока нет бронирований</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Бронирования на мои услуги</h3>
        <Button variant="outline" size="sm" onClick={refreshBookings}>
          Обновить
        </Button>
      </div>

      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-[#9A0F34] mr-2" />
                  <h3 className="font-semibold text-lg">
                    {getClientName(booking)}
                  </h3>
                </div>
                {booking.client_phone_contact && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${booking.service_details}`}>
                      {booking.client}
                    </a>
                  </div>
                )}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(booking.date)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(booking.time)}
                  </div>
                  {booking.service_details?.title && (
                    <div className="font-medium">
                      Услуга: {booking.service_details.title}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <BookingStatusBadge status={booking.status} />
                <div className="mt-2 text-xl font-bold">
                  {booking.service_details?.price} сом
                </div>
                <div className="mt-2 flex space-x-2">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() =>
                          handleUpdateStatus(booking.id, "confirmed")
                        }
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Подтвердить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleUpdateStatus(booking.id, "cancelled")
                        }
                      >
                        <X className="h-4 w-4 mr-1" />
                        Отменить
                      </Button>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() =>
                          handleUpdateStatus(booking.id, "completed")
                        }
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Завершено
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleUpdateStatus(booking.id, "cancelled")
                        }
                      >
                        <X className="h-4 w-4 mr-1" />
                        Отменить
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setBookingToDelete(booking.id);
                      setDeleteConfirmOpen(true);
                    }}
                    title="Удалить бронирование"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4 border-t pt-4 text-sm text-gray-600">
                <h4 className="font-medium text-gray-700 mb-1">Примечания:</h4>
                <p>{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Удаление бронирования"
        message="Вы уверены, что хотите удалить это бронирование? Это действие невозможно отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setBookingToDelete(null);
        }}
        confirmVariant="danger"
      />
    </div>
  );
};

export default BarberBookingsList;
