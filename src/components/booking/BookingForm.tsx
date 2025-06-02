// src/components/booking/BookingForm.tsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock, MessageSquare } from "lucide-react";
import Button from "../ui/Button";
import { bookingsAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Service } from "../../types";
import { useNotification } from "../../context/NotificationContext";

interface BookingFormProps {
  service: Service;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

type LoadingState = "idle" | "loading" | "success" | "error";

const BookingForm: React.FC<BookingFormProps> = ({ service }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();

  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  useEffect(() => {
    const tomorrow = getTomorrowDate();
    setSelectedDate(tomorrow);
    loadAvailableSlots(tomorrow);
  }, [service.id]);

  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 21;
    const interval = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
          available: true,
        });
      }
    }

    return slots;
  };

  const loadAvailableSlots = async (date: string) => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      // Проверим ID сервиса
      const serviceId = service.id;
      if (!serviceId) {
        throw new Error("ID сервиса не определен");
      }

      // Попытаемся загрузить слоты с сервера
      let availableSlots: TimeSlot[] = [];

      try {
        const response = await bookingsAPI.getAvailableSlots(serviceId, date);
        if (response && response.data && Array.isArray(response.data)) {
          availableSlots = response.data;
        } else {
          console.warn(
            "Invalid response format from getAvailableSlots, using generated slots"
          );
          availableSlots = generateTimeSlots(date);
        }
      } catch (err) {
        console.error(
          "Failed to load available slots from API, using generated slots:",
          err
        );
        availableSlots = generateTimeSlots(date);
      }

      setTimeSlots(availableSlots);
      setSelectedTime("");
      setLoadingState("idle");
    } catch (error) {
      console.error("Ошибка при загрузке доступных слотов:", error);
      setLoadingState("error");
      setErrorMessage(
        "Не удалось загрузить доступные слоты. Пожалуйста, попробуйте позже."
      );
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    loadAvailableSlots(newDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loadingState === "loading") {
      return; // Предотвращаем двойную отправку
    }

    if (!isAuthenticated) {
      notification.warning(
        "Требуется вход",
        "Для бронирования необходимо войти в систему."
      );
      return;
    }

    if (!selectedTime) {
      notification.warning(
        "Выберите время",
        "Пожалуйста, выберите время для бронирования."
      );
      return;
    }

    try {
      setLoadingState("loading");
      setErrorMessage("");

      // Проверим ID сервиса
      const serviceId = service.id;
      if (!serviceId) {
        throw new Error("ID сервиса не определен");
      }

      const bookingData = {
        service: serviceId,
        date: selectedDate,
        time: selectedTime,
        notes: notes,
        client_name: user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            user.username
          : "Гость",
        client_phone: user?.profile?.phone || "",
      };

      // Искусственная задержка для предотвращения двойных нажатий
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await bookingsAPI.create(bookingData);
      console.log("Booking created:", response);

      setLoadingState("success");
      notification.success(
        "Бронирование создано",
        "Вы получите уведомление о подтверждении бронирования."
      );

      // Перенаправляем на страницу профиля с выбранной вкладкой
      navigate("/profile", { state: { activeTab: "bookings" } });
    } catch (error: any) {
      console.error("Ошибка при создании бронирования:", error);
      setLoadingState("error");
      setErrorMessage(
        error.response?.data?.detail ||
          "Не удалось создать бронирование. Пожалуйста, попробуйте позже."
      );
      notification.error("Ошибка бронирования", errorMessage);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Выберите дату
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="date"
            id="date"
            name="date"
            min={minDate}
            max={maxDateStr}
            value={selectedDate}
            onChange={handleDateChange}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Выберите время
        </label>
        {loadingState === "loading" ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>
        ) : timeSlots.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`
                  py-2 px-3 text-sm font-medium rounded-md text-center
                  ${
                    selectedTime === slot.time
                      ? "bg-[#9A0F34] text-white"
                      : slot.available
                      ? "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                <Clock className="h-4 w-4 inline-block mr-1" />
                {slot.time.substring(0, 5)}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border border-gray-200 rounded-md bg-gray-50">
            <p className="text-gray-500">
              Нет доступных слотов на выбранную дату
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Примечания к заказу (опционально)
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Например: предпочтения по стрижке или особые пожелания"
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] resize-none"
          ></textarea>
        </div>
      </div>

      {loadingState === "error" && (
        <div className="bg-red-50 p-3 rounded-md">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={loadingState === "loading"}
        fullWidth
      >
        {loadingState === "loading" ? "Обработка..." : "Забронировать"}
      </Button>
    </form>
  );
};

export default BookingForm;
