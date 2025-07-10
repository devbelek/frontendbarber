import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import Button from "../ui/Button";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { profileAPI, bookingsAPI } from "../../api/services";
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
  theme?: "light" | "dark";
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  haircut,
  onConfirm,
  theme = "light",
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

  const themeStyles =
    theme === "dark"
      ? {
          modalBg: "bg-gray-900 text-white",
          headerBg: "bg-gradient-to-r from-gray-800 to-gray-700",
          sectionBg: "bg-gray-800/50",
          buttonBg: "bg-gray-700 hover:bg-gray-600",
          inputBg: "bg-gray-800 border-gray-600 focus:border-blue-500",
          textColor: "text-gray-200",
          accentColor: "text-blue-400",
        }
      : {
          modalBg: "bg-white text-gray-900",
          headerBg: "bg-gradient-to-r from-[#a01a3f] to-[#7a0c2a]",
          sectionBg: "bg-gray-50",
          buttonBg:
            "bg-gradient-to-r from-[#a01a3f] to-[#7a0c2a] hover:from-[#8a1538] hover:to-[#6a0b24]",
          inputBg: "bg-white border-gray-200 focus:border-[#a01a3f]",
          textColor: "text-gray-700",
          accentColor: "text-[#a01a3f]",
        };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto flex flex-col transition-all duration-300 ${
          themeStyles.modalBg
        } ${isZoomed ? "h-[95vh]" : "max-h-[90vh]"} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!isZoomed && (
          <div
            className={`relative ${themeStyles.headerBg} text-white px-4 sm:px-6 py-6 sm:py-8 rounded-t-2xl`}
          >
            <div className="absolute inset-0 bg-black/10 rounded-t-2xl"></div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative">
              <h2
                id="modal-title"
                className="text-xl sm:text-2xl font-bold mb-2 tracking-tight"
              >
                {t("bookAppointment")}
              </h2>
              <p className="text-white/90 text-sm font-medium">
                {haircut.title}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isZoomed ? "p-2 sm:p-4" : "p-4 sm:p-6"}`}>
            {/* Service Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div
                className={`relative flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${
                  isZoomed
                    ? "w-full h-[60vh] sm:h-[70vh] max-h-[600px]"
                    : "w-full sm:w-32 h-32 sm:h-40 aspect-square sm:aspect-auto flex-shrink-0"
                } cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}
                onClick={handleImageClick}
                role="button"
                aria-label={t("zoomImage")}
              >
                <img
                  ref={imageRef}
                  src={currentImage}
                  alt={haircut.title}
                  className={`rounded-xl w-full ${
                    isZoomed ? "h-full object-contain" : "h-full object-cover"
                  }`}
                />
                {haircut.images && haircut.images.length > 1 && (
                  <>
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                      {haircut.images.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 ${
                            index === currentImageIndex
                              ? "bg-[#a01a3f] scale-125"
                              : "bg-white/60 hover:bg-white/80"
                          }`}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                    {isZoomed && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full text-white transition-all duration-200"
                          aria-label={t("previousImage")}
                        >
                          <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full text-white transition-all duration-200"
                          aria-label={t("nextImage")}
                        >
                          <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5" />
                        </button>
                        <button
                          onClick={toggleAutoSlide}
                          className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 sm:p-3 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full text-white transition-all duration-200"
                          aria-label={
                            autoSlideEnabled
                              ? t("pauseSlideshow")
                              : t("playSlideshow")
                          }
                        >
                          {autoSlideEnabled ? (
                            <Pause className="h-3 sm:h-4 w-3 sm:w-4" />
                          ) : (
                            <Play className="h-3 sm:h-4 w-3 sm:w-4" />
                          )}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {!isZoomed && (
                <div className="flex-1 w-full">
                  <div
                    className={`${themeStyles.sectionBg} rounded-xl p-4 sm:p-5`}
                  >
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1">
                      {haircut.title}
                    </h3>
                    <p
                      className={`${themeStyles.textColor} text-sm mb-2 sm:mb-3 font-medium`}
                    >
                      {haircut.barber}
                    </p>
                    <div
                      className={`${themeStyles.buttonBg} text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-block font-semibold text-base sm:text-lg shadow-lg`}
                    >
                      {haircut.price} {t("som")}
                    </div>
                    {haircut.description && (
                      <p
                        className={`${themeStyles.textColor} mt-3 sm:mt-4 text-sm leading-relaxed line-clamp-3`}
                      >
                        {haircut.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Steps */}
          {!isZoomed && (
            <>
              {step === 1 ? (
                <div className="px-4 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="pt-4 sm:pt-6">
                    {/* Date Selection */}
                    <div className="mb-6 sm:mb-8">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                        <div className="p-1.5 sm:p-2 bg-[#a01a3f]/10 rounded-lg">
                          <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-[#a01a3f]" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                          {t("selectDate")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                        {availableDates.map((date) => {
                          const d = new Date(date);
                          const day = d.getDate();
                          const month = d.toLocaleString("ru", {
                            month: "short",
                          });
                          const dayName = d.toLocaleString("ru", {
                            weekday: "short",
                          });
                          return (
                            <button
                              key={date}
                              onClick={() => setSelectedDate(date)}
                              className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 ${
                                selectedDate === date
                                  ? "bg-[#a01a3f] text-white border-[#a01a3f] shadow-lg shadow-[#a01a3f]/25"
                                  : "border-gray-200 hover:border-[#a01a3f]/50 hover:bg-gray-50"
                              }`}
                              aria-label={`${t("selectDate")} ${formatDate(
                                date
                              )}`}
                            >
                              <div className="text-xs font-medium opacity-75 mb-1">
                                {dayName}
                              </div>
                              <div className="font-bold text-base sm:text-lg">
                                {day}
                              </div>
                              <div className="text-xs font-medium opacity-75 capitalize">
                                {month}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                        <div className="p-1.5 sm:p-2 bg-[#a01a3f]/10 rounded-lg">
                          <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-[#a01a3f]" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                          {t("selectTime")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {availableTimes.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl border-2 text-center font-medium transition-all duration-200 hover:scale-105 ${
                              selectedTime === time
                                ? "bg-[#a01a3f] text-white border-[#a01a3f] shadow-lg shadow-[#a01a3f]/25"
                                : "border-gray-200 hover:border-[#a01a3f]/50 hover:bg-gray-50"
                            }`}
                            aria-label={`${t("selectTime")} ${time}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
                    {/* Booking Summary */}
                    <div
                      className={`${themeStyles.sectionBg} border border-[#a01a3f]/20 rounded-xl p-4 sm:p-5`}
                    >
                      <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#a01a3f]" />
                        {t("selectedDateTime")}
                      </h4>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div>
                          <p className="font-bold text-base sm:text-lg text-gray-900">
                            {formatDate(selectedDate)}
                          </p>
                          <p className="text-[#a01a3f] font-semibold text-sm sm:text-base">
                            {selectedTime}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            {t("service")}
                          </p>
                          <p className="font-semibold text-[#a01a3f] text-base sm:text-lg">
                            {haircut.price} {t("som")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    {isAuthenticated ? (
                      <div
                        className={`${themeStyles.sectionBg} rounded-xl p-4 sm:p-5 border border-gray-200`}
                      >
                        <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                          <User className="h-4 w-4 text-[#a01a3f]" />
                          {t("contactInfo")}
                        </h4>
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {customerName}
                          </p>
                          {customerPhone ? (
                            <p
                              className={`${themeStyles.textColor} flex items-center gap-2 text-sm sm:text-base`}
                            >
                              <Phone className="h-4 w-4" />
                              {customerPhone}
                            </p>
                          ) : (
                            <div className="mt-2 sm:mt-3">
                              <label
                                htmlFor="customerPhone"
                                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                              >
                                <Phone className="h-4 w-4 inline mr-1 sm:mr-2 text-[#a01a3f]" />
                                {t("phoneNumber")}
                              </label>
                              <input
                                type="tel"
                                id="customerPhone"
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-2 focus:ring-[#a01a3f]/20 transition-all duration-200 ${
                                  themeStyles.inputBg
                                } ${
                                  errors.phone ? "border-red-500 bg-red-50" : ""
                                }`}
                                placeholder="+996 XXX XXX XXX"
                                value={customerPhone}
                                onChange={(e) =>
                                  setCustomerPhone(e.target.value)
                                }
                                aria-describedby={
                                  errors.phone ? "phone-error" : undefined
                                }
                              />
                              {errors.phone && (
                                <p
                                  id="phone-error"
                                  className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 font-medium"
                                >
                                  {errors.phone}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                                {t("phoneSaveNote")}
                              </p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 sm:mt-3 bg-white/50 p-1 sm:p-2 rounded-lg">
                          {t("dataFromProfile")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label
                            htmlFor="customerName"
                            className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                          >
                            <User className="h-4 w-4 inline mr-1 sm:mr-2 text-[#a01a3f]" />
                            {t("Имя")}
                          </label>
                          <input
                            type="text"
                            id="customerName"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-2 focus:ring-[#a01a3f]/20 transition-all duration-200 ${
                              themeStyles.inputBg
                            } ${errors.name ? "border-red-500 bg-red-50" : ""}`}
                            placeholder={t("Имя")}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            aria-describedby={
                              errors.name ? "name-error" : undefined
                            }
                          />
                          {errors.name && (
                            <p
                              id="name-error"
                              className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 font-medium"
                            >
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="customerPhone"
                            className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                          >
                            <Phone className="h-4 w-4 inline mr-1 sm:mr-2 text-[#a01a3f]" />
                            {t("Телефон")}
                          </label>
                          <input
                            type="tel"
                            id="customerPhone"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-2 focus:ring-[#a01a3f]/20 transition-all duration-200 ${
                              themeStyles.inputBg
                            } ${
                              errors.phone ? "border-red-500 bg-red-50" : ""
                            }`}
                            placeholder="+996 XXX XXX XXX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            aria-describedby={
                              errors.phone ? "phone-error" : undefined
                            }
                          />
                          {errors.phone && (
                            <p
                              id="phone-error"
                              className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 font-medium"
                            >
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label
                        htmlFor="customerNotes"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        {t("Описание")}
                      </label>
                      <textarea
                        id="customerNotes"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-2 focus:ring-[#a01a3f]/20 transition-all duration-200 resize-none ${themeStyles.inputBg}`}
                        placeholder={t("Описание...")}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        rows={3}
                        aria-label={t("Описание")}
                      />
                    </div>

                    {/* Info Notice */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-amber-800 font-medium">
                        {t("Контактная информация Примечание")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isZoomed && (
          <div
            className={`${themeStyles.sectionBg} px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 rounded-b-2xl`}
          >
            <div className="flex gap-2 sm:gap-3">
              {step === 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 py-2 sm:py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 font-medium transition-all duration-200 text-xs sm:text-sm"
                    disabled={isSubmitting}
                    aria-label={t("cancel")}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNextStep}
                    className={`flex-1 py-2 sm:py-3 ${themeStyles.buttonBg} text-white rounded-xl font-semibold shadow-lg shadow-[#a01a3f]/25 disabled:opacity-50 disabled:shadow-none transition-all duration-200 text-xs sm:text-sm`}
                    disabled={!selectedDate || !selectedTime || isSubmitting}
                    aria-label={t("Далее")}
                  >
                    {t("Далее")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 py-2 sm:py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 font-medium transition-all duration-200 text-xs sm:text-sm"
                    disabled={isSubmitting}
                    aria-label={t("Назад")}
                  >
                    {t("Назад")}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className={`flex-1 py-2 sm:py-3 ${themeStyles.buttonBg} text-white rounded-xl font-semibold shadow-lg shadow-[#a01a3f]/25 disabled:opacity-50 disabled:shadow-none transition-all duration-200 text-xs sm:text-sm`}
                    disabled={isSubmitting}
                    aria-label={isSubmitting ? t("submitting") : t("confirm")}
                  >
                    {isSubmitting ? t("submitting") : t("confirm")}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {isZoomed && (
          <div
            className={`${themeStyles.sectionBg} p-3 sm:p-4 flex justify-center rounded-b-xl border-t border-gray-100`}
          >
            <Button
              variant="outline"
              onClick={handleImageClick}
              className="rounded-lg border-gray-200 text-[#a01a3f] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              aria-label={t("Закрыть")}
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
