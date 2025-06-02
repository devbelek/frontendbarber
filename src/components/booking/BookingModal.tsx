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

  // Блокировка прокрутки фона при открытии модала
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

  // Generate available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split("T")[0];
  });

  // Generate available time slots
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

  // Handle click outside modal to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Auto-slide for images
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

  // Reset state when modal opens/closes
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

        // Create booking
        await bookingsAPI.create(bookingData);

        // Call onConfirm prop
        onConfirm(selectedDate, selectedTime, {
          name: customerName,
          phone: customerPhone,
          notes: customerNotes,
        });

        // Close modal
        onClose();

        // Show success notification
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
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto flex flex-col ${
          isZoomed ? "h-full" : "max-h-[95vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - скрыт в увеличенном режиме */}
        {!isZoomed && (
          <div className="relative bg-gradient-to-r from-[#D81F5A] to-[#B0184A] text-white p-6 shadow-md">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              aria-label={t("closeModal")}
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2">{t("bookAppointment")}</h2>
            <p className="text-gray-100 text-sm">{haircut.title}</p>
          </div>
        )}

        {/* Main content area with scrolling */}
        <div className="flex-1 overflow-auto">
          {/* Booking summary */}
          <div
            className={`${isZoomed ? "p-4" : "p-6"} ${
              !isZoomed ? "border-b border-gray-200" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row items-start mb-6">
              <div
                className={`relative ${
                  isZoomed
                    ? "w-full h-[70vh] max-h-[600px]"
                    : "w-full md:w-28 h-28 flex-shrink-0"
                } cursor-pointer transition-all duration-300 mb-4 md:mb-0`}
                onClick={handleImageClick}
              >
                <ImageWithFallback
                  ref={imageRef}
                  src={currentImage}
                  alt={haircut.title}
                  className={`rounded-lg object-cover ${
                    isZoomed ? "w-full h-full" : "w-full h-full md:w-28 md:h-28"
                  }`}
                />
                {haircut.images && haircut.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {haircut.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex
                            ? "bg-[#D81F5A]"
                            : "bg-gray-300"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {!isZoomed && (
                <div className="md:ml-5 flex-1 w-full">
                  <h3 className="font-bold text-lg">{haircut.title}</h3>
                  <p className="text-sm text-gray-500">{haircut.barber}</p>
                  <p className="text-[#D81F5A] font-semibold mt-1">
                    {haircut.price} {t("som")}
                  </p>
                  {haircut.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                      {haircut.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isZoomed && haircut.images && haircut.images.length > 1 && (
              <div className="flex justify-between items-center mt-4 px-4">
                <button
                  onClick={handlePrevImage}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
                  aria-label={t("previousImage")}
                >
                  &lt;
                </button>
                <div className="flex space-x-3 items-center">
                  <button
                    onClick={toggleAutoSlide}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      autoSlideEnabled
                        ? "bg-[#D81F5A] text-white"
                        : "bg-gray-200 text-gray-700"
                    } transition-colors`}
                  >
                    {autoSlideEnabled ? t("autoSlideOn") : t("autoSlideOff")}
                  </button>
                  <span className="text-sm text-gray-500">
                    {currentImageIndex + 1} / {haircut.images.length}
                  </span>
                </div>
                <button
                  onClick={handleNextImage}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
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
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className="font-semibold text-lg">{t("selectDate")}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {availableDates.map((date) => {
                      const d = new Date(date);
                      const day = d.getDate();
                      const month = d.toLocaleString("ru", { month: "short" });
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                            selectedDate === date
                              ? "bg-[#D81F5A] text-white border-[#D81F5A]"
                              : "border-gray-300 hover:border-[#D81F5A] hover:text-[#D81F5A]"
                          }`}
                        >
                          <div className="text-sm">{month}</div>
                          <div className="font-semibold">{day}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className="font-semibold text-lg">{t("selectTime")}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg border text-center transition-all duration-200 ${
                          selectedTime === time
                            ? "bg-[#D81F5A] text-white border-[#D81F5A]"
                            : "border-gray-300 hover:border-[#D81F5A] hover:text-[#D81F5A]"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 border-b border-gray-200">
                  <div className="mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">
                        {t("selectedDateTime")}
                      </p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(selectedDate)} в {selectedTime}
                      </p>
                    </div>

                    {isAuthenticated ? (
                      <div className="p-4 bg-blue-50 rounded-lg mb-4">
                        <p className="text-sm text-blue-600">
                          {t("contactInfo")}
                        </p>
                        <p className="font-semibold text-gray-800">
                          {customerName}
                        </p>
                        {customerPhone ? (
                          <p className="text-sm text-gray-600">
                            {customerPhone}
                          </p>
                        ) : (
                          <div className="mt-3">
                            <label
                              htmlFor="customerPhone"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              <Phone className="h-4 w-4 inline mr-1" />{" "}
                              {t("phoneNumber")}
                            </label>
                            <input
                              type="tel"
                              id="customerPhone"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-[#D81F5A] focus:border-[#D81F5A] ${
                                errors.phone
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } transition-all`}
                              placeholder="+996 XXX XXX XXX"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.phone}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {t("phoneSaveNote")}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {t("dataFromProfile")}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label
                            htmlFor="customerName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            <User className="h-4 w-4 inline mr-1" /> {t("Имя")}
                          </label>
                          <input
                            type="text"
                            id="customerName"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-[#D81F5A] focus:border-[#D81F5A] ${
                              errors.name ? "border-red-500" : "border-gray-300"
                            } transition-all`}
                            placeholder={t("Имя")}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="customerPhone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            <Phone className="h-4 w-4 inline mr-1" />{" "}
                            {t("Телефон")}
                          </label>
                          <input
                            type="tel"
                            id="customerPhone"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-[#D81F5A] focus:border-[#D81F5A] ${
                              errors.phone
                                ? "border-red-500"
                                : "border-gray-300"
                            } transition-all`}
                            placeholder="+996 XXX XXX XXX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    <div className="mt-4">
                      <label
                        htmlFor="customerNotes"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {t("Описание")}
                      </label>
                      <textarea
                        id="customerNotes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#D81F5A] focus:border-[#D81F5A] transition-all"
                        placeholder={t("Описание...")}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                    <p>{t("Контактная информация Примечание")}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer buttons - скрыты в увеличенном режиме */}
        {!isZoomed && (
          <div className="p-6 flex space-x-4">
            {step === 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-lg border-gray-300 hover:border-[#D81F5A] text-gray-700 hover:text-[#D81F5A] transition-all"
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  className="flex-1 bg-[#D81F5A] hover:bg-[#B0184A] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedDate || !selectedTime || isSubmitting}
                >
                  {t("next")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 rounded-lg border-gray-300 hover:border-[#D81F5A] text-gray-700 hover:text-[#D81F5A] transition-all"
                  disabled={isSubmitting}
                >
                  {t("back")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  className="flex-1 bg-[#D81F5A] hover:bg-[#B0184A] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("submitting") : t("confirm")}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Close image button - показан только в увеличенном режиме */}
        {isZoomed && (
          <div className="p-6 flex justify-center">
            <Button
              variant="outline"
              onClick={handleImageClick}
              className="rounded-lg border-gray-300 hover:border-[#D81F5A] hover:text-[#D81F5A] transition-all"
            >
              {t("closeImage")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
