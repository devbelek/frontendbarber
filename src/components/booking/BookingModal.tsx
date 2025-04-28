import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { Haircut } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircut: Haircut | null;
  onConfirm: (date: string, time: string) => void;
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

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
    }
  };

  if (!isOpen || !haircut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative bg-gray-900 text-white p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold mb-2">{t('bookAppointment')}</h2>
          <p className="text-gray-300">{haircut.title}</p>
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
        
        {/* Date selection */}
        <div className="p-6 border-b">
          <div className="flex items-center mb-3">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <h3 className="font-medium">{t('selectDate')}</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-6">
            {availableDates.map((date) => {
              const d = new Date(date);
              const day = d.getDate();
              const month = d.toLocaleString('default', { month: 'short' });
              
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
          
          {/* Time selection */}
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
        
        {/* Actions */}
        <div className="p-6 flex space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            className="flex-1"
            disabled={!selectedDate || !selectedTime}
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;