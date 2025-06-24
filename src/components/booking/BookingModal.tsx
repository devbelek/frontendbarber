import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Clock, User, Phone } from "lucide-react";
import Button from "../ui/Button";
import { useLanguage } from "../../context/LanguageContext";
import ImageWithFallback from "../ui/ImageWithFallback";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { profileAPI } from "../../api/services";
import { bookingsAPI } from "../../api/services";
import { Haircut } from "../../types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircut: Haircut | null;
  onConfirm: (
    date: string,
    time: string,
    contactInfo: { name: string; phone: string; notes?: string }
  ) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  haircut,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const notification = useNotification();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const autoSlideIntervalRef = useRef<number | null>(null);
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split("T")[0];
  });

  const availableTimes = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (
      haircut &&
      haircut.images &&
      haircut.images.length > 1 &&
      autoSlideEnabled &&
      !isZoomed
    ) {
      autoSlideIntervalRef.current = window.setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === haircut.images.length - 1 ? 0 : prev + 1
        );
      }, 5000);
    }
    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
        autoSlideIntervalRef.current = null;
      }
    };
  }, [haircut, autoSlideEnabled, isZoomed]);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(availableDates[0]);
      setSelectedTime("");
      setNeedsProfileUpdate(false);
      setIsSubmitting(false);
      if (isAuthenticated && user) {
        const fullName = `${user.first_name || ""} ${
          user.last_name || ""
        }`.trim();
        setCustomerName(fullName || user.username);
        if (user.profile?.phone) {
          setCustomerPhone(user.profile.phone);
        } else if (user.profile?.whatsapp) {
          setCustomerPhone(user.profile.whatsapp);
          setNeedsProfileUpdate(true);
        } else {
          setCustomerPhone("");
          setNeedsProfileUpdate(true);
        }
      } else {
        setCustomerName("");
        setCustomerPhone("");
      }
      setStep(1);
      setErrors({});
      setIsZoomed(false);
      setCurrentImageIndex(0);
      setCustomerNotes("");
    }
  }, [isOpen, isAuthenticated, user]);

  const handleNextStep = () => {
    if (selectedDate && selectedTime) {
      setStep(2);
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};
    let isValid = true;
    if (!customerName.trim()) {
      newErrors.name = t("pleaseEnterName");
      isValid = false;
    }
    if (!customerPhone.trim()) {
      newErrors.phone = t("pleaseEnterPhone");
      isValid = false;
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(customerPhone.replace(/\s/g, ""))) {
      newErrors.phone = t("invalidPhoneFormat");
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const updateUserProfile = async () => {
    if (isAuthenticated && user && needsProfileUpdate && customerPhone) {
      try {
        const profileFormData = new FormData();
        profileFormData.append("phone", customerPhone);
        await profileAPI.updateProfile(profileFormData);
        console.log("Profile updated with new phone number");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        if (needsProfileUpdate) {
          await updateUserProfile();
        }
        let bookingData;
        if (isAuthenticated && user && haircut) {
          bookingData = {
            service: haircut.id,
            date: selectedDate,
            time: selectedTime,
            notes: customerNotes || "",
            client_name: customerName,
            client_phone: customerPhone,
          };
        } else if (haircut) {
          bookingData = {
            service: haircut.id,
            date: selectedDate,
            time: selectedTime,
            notes: customerNotes || "",
            client_name: customerName,
            client_phone: customerPhone,
          };
        } else {
          throw new Error("Insufficient data for booking");
        }
        await bookingsAPI.create(bookingData);
        onConfirm(selectedDate, selectedTime, {
          name: customerName,
          phone: customerPhone,
          notes: customerNotes,
        });
        onClose();
        notification.success(
          t("bookingCreated"),
          `${t("service")} "${haircut?.title}" ${t("successfullyBooked")}`
        );
      } catch (error) {
        console.error("Error creating booking:", error);
        notification.error(t("bookingError"), t("bookingErrorMessage"));
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
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed && autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current);
      autoSlideIntervalRef.current = null;
    } else if (autoSlideEnabled && haircut?.images) {
      autoSlideIntervalRef.current = window.setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === haircut.images.length - 1 ? 0 : prev + 1
        );
      }, 5000);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (haircut && haircut.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? haircut.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (haircut && haircut.images) {
      setCurrentImageIndex((prev) =>
        prev === haircut.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const toggleAutoSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAutoSlideEnabled((prev) => !prev);
  };

  if (!isOpen || !haircut) return null;

  const currentImage =
    haircut.images && haircut.images.length > 0
      ? haircut.images[currentImageIndex].image
      : haircut.primaryImage || haircut.images;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto flex flex-col ${
          isZoomed ? "h-[92vh]" : "max-h-[85vh] sm:max-h-[90vh]"
        } overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isZoomed && (
          <div className="relative bg-gradient-to-r from-[#a01a3f] to-[#7a0c2a] text-white p-4 sm:p-6 rounded-t-xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-100 hover:text-white"
              aria-label={t("closeModal")}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
              {t("bookAppointment")}
            </h2>
            <p className="text-gray-200 text-xs sm:text-sm mt-1">
              {haircut.title}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className={`${isZoomed ? "p-2 sm:p-4" : "p-4 sm:p-6"}`}>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div
                className={`relative flex items-center justify-center bg-gray-100 ${
                  isZoomed
                    ? "w-full h-[60vh] sm:h-[70vh] max-h-[500px]"
                    : "w-full sm:w-24 md:w-32 h-24 sm:h-24 md:h-32 aspect-square flex-shrink-0"
                } cursor-pointer rounded-lg overflow-hidden`}
                onClick={handleImageClick}
              >
                <ImageWithFallback
                  ref={imageRef}
                  src={currentImage}
                  alt={haircut.title}
                  className={`rounded-lg w-full ${
                    isZoomed ? "h-full object-contain" : "h-full object-cover"
                  }`}
                />
                {haircut.images && haircut.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {haircut.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex
                            ? "bg-[#a01a3f]"
                            : "bg-gray-400"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {!isZoomed && (
                <div className="flex-1 w-full">
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl text-gray-900">
                    {haircut.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {haircut.barber}
                  </p>
                  <p className="text-[#a01a3f] font-medium text-sm sm:text-base mt-1 sm:mt-2">
                    {haircut.price} {t("som")}
                  </p>
                  {haircut.description && (
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">
                      {haircut.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isZoomed && haircut.images && haircut.images.length > 1 && (
              <div className="flex justify-between items-center mt-2 sm:mt-4 px-2 sm:px-4">
                <button
                  onClick={handlePrevImage}
                  className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-[#a01a3f] text-sm sm:text-base"
                  aria-label={t("previousImage")}
                >
                  &lt;
                </button>
                <div className="flex gap-2 sm:gap-4 items-center">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {currentImageIndex + 1} / {haircut.images.length}
                  </span>
                </div>
                <button
                  onClick={handleNextImage}
                  className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-[#a01a3f] text-sm sm:text-base"
                  aria-label={t("nextImage")}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>

          {!isZoomed && (
            <>
              {step === 1 ? (
                <div className="p-4 sm:p-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#a01a3f]" />
                    <h3 className="font-medium text-base sm:text-lg text-gray-900">
                      {t("selectDate")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {availableDates.map((date) => {
                      const d = new Date(date);
                      const day = d.getDate();
                      const month = d.toLocaleString("ru", { month: "short" });
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`p-2 sm:p-3 rounded-lg border text-center text-xs sm:text-sm ${
                            selectedDate === date
                              ? "bg-[#a01a3f] text-white border-[#a01a3f]"
                              : "border-gray-200 hover:border-[#a01a3f] hover:text-[#a01a3f]"
                          }`}
                        >
                          <div className="text-[10px] sm:text-xs capitalize">
                            {month}
                          </div>
                          <div className="font-medium text-sm sm:text-base">
                            {day}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#a01a3f]" />
                    <h3 className="font-medium text-base sm:text-lg text-gray-900">
                      {t("selectTime")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border text-center text-xs sm:text-sm ${
                          selectedTime === time
                            ? "bg-[#a01a3f] text-white border-[#a01a3f]"
                            : "border-gray-200 hover:border-[#a01a3f] hover:text-[#a01a3f]"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-6 border-t border-gray-100">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">
                        {t("selectedDateTime")}
                      </p>
                      <p className="font-medium text-sm sm:text-base text-gray-900">
                        {formatDate(selectedDate)} в {selectedTime}
                      </p>
                    </div>

                    {isAuthenticated ? (
                      <div className="p-3 sm:p-4 bg-rose-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-[#a01a3f] font-medium">
                          {t("contactInfo")}
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {customerName}
                        </p>
                        {customerPhone ? (
                          <p className="text-xs sm:text-sm text-gray-600">
                            {customerPhone}
                          </p>
                        ) : (
                          <div className="mt-2 sm:mt-3">
                            <label
                              htmlFor="customerPhone"
                              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                            >
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-[#a01a3f]" />
                              {t("phoneNumber")}
                            </label>
                            <input
                              type="tel"
                              id="customerPhone"
                              className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-[#a01a3f] focus:border-[#a01a3f] ${
                                errors.phone
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                              placeholder="+996 XXX XXX XXX"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                            {errors.phone && (
                              <p className="mt-1 text-xs text-red-500">
                                {errors.phone}
                              </p>
                            )}
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                              {t("phoneSaveNote")}
                            </p>
                          </div>
                        )}
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">
                          {t("dataFromProfile")}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label
                            htmlFor="customerName"
                            className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                          >
                            <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-[#a01a3f]" />
                            {t("Имя")}
                          </label>
                          <input
                            type="text"
                            id="customerName"
                            className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-[#a01a3f] focus:border-[#a01a3f] ${
                              errors.name ? "border-red-500" : "border-gray-200"
                            }`}
                            placeholder={t("Имя")}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="customerPhone"
                            className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                          >
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-[#a01a3f]" />
                            {t("Телефон")}
                          </label>
                          <input
                            type="tel"
                            id="customerPhone"
                            className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-[#a01a3f] focus:border-[#a01a3f] ${
                              errors.phone
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                            placeholder="+996 XXX XXX XXX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    <div>
                      <label
                        htmlFor="customerNotes"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                      >
                        {t("Описание")}
                      </label>
                      <textarea
                        id="customerNotes"
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-[#a01a3f] focus:border-[#a01a3f]"
                        placeholder={t("Описание...")}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 bg-rose-50 p-3 sm:p-4 rounded-lg">
                      <p>{t("Контактная информация Примечание")}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!isZoomed && (
          <div className="p-4 sm:p-6 flex gap-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
            {step === 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#a01a3f] text-xs sm:text-sm"
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  className="flex-1 bg-[#a01a3f] hover:bg-[#7a0c2a] text-white rounded-lg text-xs sm:text-sm disabled:opacity-50"
                  disabled={!selectedDate || !selectedTime || isSubmitting}
                >
                  {t("Далее")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#a01a3f] text-xs sm:text-sm"
                  disabled={isSubmitting}
                >
                  {t("Назад")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  className="flex-1 bg-[#a01a3f] hover:bg-[#7a0c2a] text-white rounded-lg text-xs sm:text-sm disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("submitting") : t("confirm")}
                </Button>
              </>
            )}
          </div>
        )}

        {isZoomed && (
          <div className="p-4 sm:p-6 flex justify-center bg-gray-50 rounded-b-xl border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleImageClick}
              className="rounded-lg border-gray-200 text-[#a01a3f] text-xs sm:text-sm"
            >
              {t("Закрыть")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
