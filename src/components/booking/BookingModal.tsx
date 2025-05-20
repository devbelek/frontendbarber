import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, Phone } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import ImageWithFallback from '../ui/ImageWithFallback';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { profileAPI } from '../../api/services';
import { bookingsAPI } from '../../api/services';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircut: Haircut | null;
  onConfirm: (date: string, time: string, contactInfo: { name: string; phone: string; notes?: string }) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  haircut,
  onConfirm
}) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const notification = useNotification();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<{name?: string; phone?: string}>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const autoSlideIntervalRef = useRef<number | null>(null);
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate some available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  // Generate some available time slots
  const availableTimes = [
    '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Устанавливаем автосмену слайдов
  useEffect(() => {
    if (haircut && haircut.images && haircut.images.length > 1 && autoSlideEnabled && !isZoomed) {
      autoSlideIntervalRef.current = window.setInterval(() => {
        setCurrentImageIndex(prev =>
          prev === haircut.images.length - 1 ? 0 : prev + 1
        );
      }, 5000); // Смена каждые 5 секунд
    }

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
        autoSlideIntervalRef.current = null;
      }
    };
  }, [haircut, autoSlideEnabled, isZoomed]);

  // Сбрасываем состояние при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(availableDates[0]);
      setSelectedTime('');
      setNeedsProfileUpdate(false);
      setIsSubmitting(false);

      // Если пользователь авторизован, заполняем поля его данными
      if (isAuthenticated && user) {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        setCustomerName(fullName || user.username);

        // Проверяем наличие телефона в профиле
        if (user.profile?.phone) {
          setCustomerPhone(user.profile.phone);
        } else if (user.profile?.whatsapp) {
          setCustomerPhone(user.profile.whatsapp);
          setNeedsProfileUpdate(true);
        } else {
          setCustomerPhone('');
          setNeedsProfileUpdate(true);
        }
      } else {
        // Иначе очищаем поля для неавторизованных пользователей
        setCustomerName('');
        setCustomerPhone('');
      }

      setStep(1);
      setErrors({});
      setIsZoomed(false);
      setCurrentImageIndex(0);
      setCustomerNotes('');
    }
  }, [isOpen, isAuthenticated, user]);

  const handleNextStep = () => {
    if (selectedDate && selectedTime) {
      setStep(2);
    }
  };

  const validateForm = () => {
    const newErrors: {name?: string; phone?: string} = {};
    let isValid = true;

    if (!customerName.trim()) {
      newErrors.name = 'Пожалуйста, введите ваше имя';
      isValid = false;
    }

    if (!customerPhone.trim()) {
      newErrors.phone = 'Пожалуйста, введите номер телефона';
      isValid = false;
    } else if (!/^\+?[0-9]{10,12}$/.test(customerPhone.replace(/\s/g, ''))) {
      newErrors.phone = 'Неверный формат номера телефона';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Обновление профиля пользователя, если номер телефона был введен
  const updateUserProfile = async () => {
    if (isAuthenticated && user && needsProfileUpdate && customerPhone) {
      try {
        const profileFormData = new FormData();
        profileFormData.append('phone', customerPhone);
        await profileAPI.updateProfile(profileFormData);
        console.log("Профиль пользователя обновлен с новым телефоном");
      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
      }
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    if (validateForm()) {
      try {
        setIsSubmitting(true);

        // Сначала обновляем профиль пользователя, если необходимо
        if (needsProfileUpdate) {
          await updateUserProfile();
        }

        // Подготовка данных для бронирования
        let bookingData;

        if (isAuthenticated && user && haircut) {
          bookingData = {
            service: haircut.id,
            date: selectedDate,
            time: selectedTime,
            notes: customerNotes || '',
            client_name: customerName,
            client_phone: customerPhone
          };
        } else if (haircut) {
          bookingData = {
            service: haircut.id,
            date: selectedDate,
            time: selectedTime,
            notes: customerNotes || '',
            client_name: customerName,
            client_phone: customerPhone
          };
        } else {
          throw new Error('Недостаточно данных для бронирования');
        }

        // Отправляем запрос на создание бронирования напрямую
        const response = await bookingsAPI.create(bookingData);

        // Закрываем модальное окно
        onClose();

        // Показываем уведомление об успехе
        notification.success(
          'Бронирование создано',
          `Услуга "${haircut?.title}" успешно забронирована`
        );

      } catch (error) {
        console.error('Ошибка при создании бронирования:', error);
        notification.error(
          'Ошибка бронирования',
          'Не удалось создать бронирование. Пожалуйста, попробуйте ещё раз.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);

    // Останавливаем автосмену при увеличении
    if (!isZoomed) {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
        autoSlideIntervalRef.current = null;
      }
    } else if (autoSlideEnabled) {
      // Восстанавливаем автосмену при уменьшении
      autoSlideIntervalRef.current = window.setInterval(() => {
        if (haircut && haircut.images) {
          setCurrentImageIndex(prev =>
            prev === haircut.images.length - 1 ? 0 : prev + 1
          );
        }
      }, 5000);
    }
  };

  const handlePrevImage = () => {
    if (haircut && haircut.images) {
      setCurrentImageIndex(prev =>
        prev === 0 ? haircut.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (haircut && haircut.images) {
      setCurrentImageIndex(prev =>
        prev === haircut.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const toggleAutoSlide = () => {
    setAutoSlideEnabled(prev => !prev);
  };

  if (!isOpen || !haircut) return null;

  // Получаем текущее изображение
  const currentImage = haircut.images && haircut.images.length > 0
    ? haircut.images[currentImageIndex].image
    : haircut.primaryImage || haircut.image;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden ${isZoomed ? 'max-w-4xl' : ''}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold mb-2">{t('bookAppointment')}</h2>
          <p className="text-gray-200">{haircut.title}</p>
        </div>

        {/* Booking summary with improved image display */}
        <div className="p-6 border-b">
          <div className="flex items-start mb-4">
            <div className={`relative ${isZoomed ? 'w-full h-96' : 'w-24 h-24'} cursor-pointer transition-all duration-300`} onClick={handleImageClick}>
              <ImageWithFallback
                ref={imageRef}
                src={currentImage}
                alt={haircut.title}
                className={`rounded-md object-cover ${isZoomed ? 'w-full h-full' : 'w-24 h-24'}`}
              />
              {haircut.images && haircut.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {haircut.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {!isZoomed && (
              <div className="ml-4">
                <h3 className="font-semibold">{haircut.title}</h3>
                <p className="text-sm text-gray-600">{haircut.barber}</p>
                <p className="text-[#9A0F34] font-bold mt-1">{haircut.price} {t('som')}</p>
                {haircut.description && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="line-clamp-3">{haircut.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image navigation when zoomed */}
          {isZoomed && haircut.images && haircut.images.length > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePrevImage}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                &lt;
              </button>

              <div className="flex space-x-2 items-center">
                <button
                  onClick={toggleAutoSlide}
                  className={`px-3 py-1 text-sm rounded ${
                    autoSlideEnabled ? 'bg-[#9A0F34] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {autoSlideEnabled ? 'Авто: Вкл' : 'Авто: Выкл'}
                </button>
                <span className="text-sm text-gray-500">
                  {currentImageIndex + 1} / {haircut.images.length}
                </span>
              </div>

              <button
                onClick={handleNextImage}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* Steps content */}
        {!isZoomed && (
          <>
            {step === 1 ? (
              /* Step 1: Date & Time selection */
              <div className="p-6 border-b">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <h3 className="font-medium">{t('selectDate')}</h3>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  {availableDates.map((date) => {
                    const d = new Date(date);
                    const day = d.getDate();
                    const month = d.toLocaleString('ru', { month: 'short' });

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-md border text-center transition-colors
                          ${selectedDate === date
                            ? 'bg-[#9A0F34] text-white border-[#9A0F34]'
                            : 'hover:border-[#9A0F34] hover:text-[#9A0F34]'
                          }`}
                      >
                        <div className="text-sm">{month}</div>
                        <div className="font-bold">{day}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <h3 className="font-medium">{t('selectTime')}</h3>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-md border text-center transition-colors
                        ${selectedTime === time
                          ? 'bg-[#9A0F34] text-white border-[#9A0F34]'
                          : 'hover:border-[#9A0F34] hover:text-[#9A0F34]'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Step 2: Contact Information */
              <div className="p-6 border-b">
                <div className="mb-4">
                  <div className="p-3 bg-gray-50 rounded-md mb-4">
                    <p className="text-sm text-gray-600">Выбранная дата и время:</p>
                    <p className="font-medium">{formatDate(selectedDate)} в {selectedTime}</p>
                  </div>

                  {/* Если пользователь авторизован - показываем информацию из профиля */}
                  {isAuthenticated ? (
                    <div className="p-3 bg-blue-50 rounded-md mb-4">
                      <p className="text-sm text-blue-600">Контактная информация:</p>
                      <p className="font-medium">{customerName}</p>

                      {/* Если у пользователя есть телефон в профиле - показываем его */}
                      {customerPhone ? (
                        <p className="text-sm text-gray-600">{customerPhone}</p>
                      ) : (
                        /* Если телефона нет - показываем поле для его ввода */
                        <div className="mt-2">
                          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                            <Phone className="h-4 w-4 inline mr-1" /> Пожалуйста, укажите ваш номер телефона
                          </label>
                          <input
                            type="tel"
                            id="customerPhone"
                            className="w-full px-3 py-2 border rounded-md focus:ring-[#9A0F34] focus:border-[#9A0F34]"
                            placeholder="+996 XXX XXX XXX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            Номер телефона будет сохранен в вашем профиле для будущих бронирований
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">Данные взяты из вашего профиля</p>
                    </div>
                  ) : (
                    /* Для неавторизованных пользователей показываем полную форму */
                    <>
                      <div className="mb-4">
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                          <User className="h-4 w-4 inline mr-1" /> Ваше имя
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-[#9A0F34] focus:border-[#9A0F34] ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Введите ваше имя"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                          <Phone className="h-4 w-4 inline mr-1" /> Номер телефона
                        </label>
                        <input
                          type="tel"
                          id="customerPhone"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-[#9A0F34] focus:border-[#9A0F34] ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+996 XXX XXX XXX"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                      </div>
                    </>
                  )}

                  {/* Добавляем поле для примечаний */}
                  <div className="mt-4">
                    <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-700 mb-1">
                      Примечания (опционально)
                    </label>
                    <textarea
                      id="customerNotes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#9A0F34] focus:border-[#9A0F34]"
                      placeholder="Напишите дополнительные пожелания к стрижке"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                  <p>Ваши контактные данные будут отправлены барберу для связи с вами.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 flex space-x-3">
              {step === 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNextStep}
                    className="flex-1"
                    disabled={!selectedDate || !selectedTime}
                  >
                    Далее
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Отправка...' : t('confirm')}
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Кнопка закрытия увеличенного изображения */}
        {isZoomed && (
          <div className="p-4 flex justify-center">
            <Button
              variant="outline"
              onClick={handleImageClick}
            >
              Закрыть просмотр
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;