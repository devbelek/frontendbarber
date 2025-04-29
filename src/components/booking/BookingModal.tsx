import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone } from 'lucide-react';
import Button from '../ui/Button';
import { Haircut } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircut: Haircut | null;
  onConfirm: (date: string, time: string, contactInfo: { name: string; phone: string }) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  haircut,
  onConfirm
}) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<{name?: string; phone?: string}>({});

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

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(selectedDate, selectedTime, {
        name: customerName,
        phone: customerPhone
      });
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!isOpen || !haircut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
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

        {/* Booking summary */}
        <div className="p-6 border-b">
          <div className="flex items-start mb-4">
            <img
              src={haircut.image}
              alt={haircut.title}
              className="w-24 h-24 object-cover rounded-md mr-4"
            />
            <div>
              <h3 className="font-semibold">{haircut.title}</h3>
              <p className="text-sm text-gray-600">{haircut.barber}</p>
              <p className="text-[#9A0F34] font-bold mt-1">{haircut.price} {t('som')}</p>
            </div>
          </div>
        </div>

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
              >
                Назад
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                className="flex-1"
              >
                {t('confirm')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;