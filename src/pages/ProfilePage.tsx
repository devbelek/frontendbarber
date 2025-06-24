import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Clock,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Scissors,
  X,
  Navigation,
  UserPlus,
  BarChart,
  Menu,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Card, { CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import BookingsList from "../components/booking/BookingsList";
import FavoritesList from "../components/favorites/FavoritesList";
import TelegramRegistration from "../components/profile/TelegramRegistration";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNotification } from "../context/NotificationContext";
import { profileAPI } from "../api/services";
import apiClient from "../api/client";
import ImageCropper from "../components/ui/ImageCropper";
import BarberBookingsList from "../components/booking/BarberBookingsList";
import MyHaircuts from "../components/profile/MyHaircuts";
import BarberAnalytics from "../components/analytics/BarberAnalytics";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated, refreshUserData } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | "bookings"
    | "favorites"
    | "barberBookings"
    | "myHaircuts"
    | "analytics"
    | "info"
  >("info");
  const [isEditing, setIsEditing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showBecomeBaberModal, setShowBecomeBaberModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp: "",
    telegram: "",
    address: "",
    offers_home_service: false,
    latitude: null as number | null,
    longitude: null as number | null,
    bio: "",
    working_hours_from: "09:00",
    working_hours_to: "18:00",
    working_days: ["Пн", "Вт", "Ср", "Чт", "Пт"] as string[],
    user_type: "client",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const bookingsRef = useRef<HTMLDivElement>(null);
  const favoritesRef = useRef<HTMLDivElement>(null);
  const barberBookingsRef = useRef<HTMLDivElement>(null);
  const myHaircutsRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedRef.current = true;

    const loadUserData = async () => {
      if (
        mountedRef.current &&
        isAuthenticated &&
        refreshUserData &&
        !hasLoadedRef.current
      ) {
        try {
          hasLoadedRef.current = true;
          await refreshUserData();
        } catch (error) {
          notification.error(
            "Ошибка",
            "Не удалось загрузить данные пользователя"
          );
        }
      }
    };

    const timeoutId = setTimeout(loadUserData, 300);

    return () => {
      clearTimeout(timeoutId);
      mountedRef.current = false;
    };
  }, [isAuthenticated, refreshUserData, notification]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        whatsapp: user.profile?.whatsapp || "",
        telegram: user.profile?.telegram || "",
        address: user.profile?.address || "",
        offers_home_service: user.profile?.offers_home_service || false,
        latitude: user.profile?.latitude || null,
        longitude: user.profile?.longitude || null,
        bio: user.profile?.bio || "",
        working_hours_from: user.profile?.working_hours_from || "09:00",
        working_hours_to: user.profile?.working_hours_to || "18:00",
        working_days: user.profile?.working_days || [
          "Пн",
          "Вт",
          "Ср",
          "Чт",
          "Пт",
        ],
        user_type: user.profile?.user_type || "client",
      });

      if (user.profile?.photo) {
        setPreviewUrl(user.profile.photo);
      } else if (user.picture) {
        setPreviewUrl(user.picture);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated && mountedRef.current) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        notification.error("Ошибка", "Пожалуйста, загрузите изображение");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        notification.error("Ошибка", "Размер файла не должен превышать 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setTempImageUrl(reader.result as string);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: File) => {
    setProfileImage(croppedImage);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(croppedImage);
    setShowImageCropper(false);
    setTempImageUrl(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Геолокация не поддерживается вашим браузером");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          let address = "";
          if (data.address) {
            const parts = [];
            if (data.address.city || data.address.town) {
              parts.push(data.address.city || data.address.town);
            }
            if (data.address.road) parts.push(data.address.road);
            if (data.address.house_number)
              parts.push(data.address.house_number);
            address = parts.join(", ");
          }

          setFormData((prev) => ({
            ...prev,
            address:
              address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
          }));

          setLocationLoading(false);
        } catch (err) {
          setLocationError("Не удалось получить адрес");
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationError("Не удалось определить местоположение");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleUserTypeChange = async (newType: "client" | "barber") => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      const profileFormData = new FormData();
      profileFormData.append("user_type", newType);

      if (newType === "barber" && !formData.telegram) {
        setShowBecomeBaberModal(true);
        setIsSubmitting(false);
        return;
      }

      if (newType === "barber" && formData.telegram) {
        profileFormData.append("telegram", formData.telegram);
      }

      await profileAPI.updateProfile(profileFormData);

      if (refreshUserData) {
        await refreshUserData();
      }

      setFormData((prev) => ({
        ...prev,
        user_type: newType,
      }));

      notification.success(
        "Успешно!",
        newType === "barber"
          ? "Вы стали барбером! Теперь вы можете добавлять свои услуги."
          : "Вы переключились на аккаунт клиента."
      );
    } catch (err) {
      notification.error("Ошибка!", "Не удалось изменить тип пользователя.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBecomeBarberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.telegram) {
      notification.error("Ошибка", "Необходимо указать Telegram для барбера");
      return;
    }

    setShowBecomeBaberModal(false);
    await handleUserTypeChange("barber");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!user || !isAuthenticated) {
        notification.error(
          "Ошибка",
          "Необходимо войти в систему для обновления профиля"
        );
        setIsSubmitting(false);
        return;
      }

      const userInfoToUpdate = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };

      const profileFormData = new FormData();

      if (
        userInfoToUpdate.first_name !== user.first_name ||
        userInfoToUpdate.last_name !== user.last_name
      ) {
        await profileAPI.updateUserInfo(userInfoToUpdate);
      }

      if (profileImage) {
        profileFormData.append("photo", profileImage);
      }

      if (formData.offers_home_service !== user.profile?.offers_home_service) {
        profileFormData.append(
          "offers_home_service",
          formData.offers_home_service.toString()
        );
      }

      if (formData.latitude !== user.profile?.latitude) {
        profileFormData.append("latitude", formData.latitude?.toString() || "");
      }

      if (formData.longitude !== user.profile?.longitude) {
        profileFormData.append(
          "longitude",
          formData.longitude?.toString() || ""
        );
      }

      if (
        JSON.stringify(formData.working_days) !==
        JSON.stringify(user.profile?.working_days)
      ) {
        profileFormData.append(
          "working_days",
          JSON.stringify(formData.working_days)
        );
      }

      if (profileFormData.entries().next().done !== true) {
        await profileAPI.updateProfile(profileFormData);
      }

      if (refreshUserData) {
        setTimeout(async () => {
          if (mountedRef.current) {
            await refreshUserData();
          }
        }, 1000);
      }

      notification.success("Успешно!", "Данные профиля успешно обновлены");
      setIsEditing(false);
      setProfileImage(null);
    } catch (err: any) {
      let errorMessage = "Произошла ошибка при обновлении профиля";

      if (err.response?.data) {
        if (typeof err.response.data === "object") {
          const errors = Object.entries(err.response.data)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("\n");
          if (errors) errorMessage = errors;
        } else {
          errorMessage = err.response.data.detail || err.response.data;
        }
      }

      notification.error("Ошибка!", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        whatsapp: user.profile?.whatsapp || "",
        telegram: user.profile?.telegram || "",
        address: user.profile?.address || "",
        offers_home_service: user.profile?.offers_home_service || false,
        latitude: user.profile?.latitude || null,
        longitude: user.profile?.longitude || null,
        bio: user.profile?.bio || "",
        working_hours_from: user.profile?.working_hours_from || "09:00",
        working_hours_to: user.profile?.working_hours_to || "18:00",
        working_days: user.profile?.working_days || [
          "Пн",
          "Вт",
          "Ср",
          "Чт",
          "Пт",
        ],
        user_type: user.profile?.user_type || "client",
      });

      setProfileImage(null);
      if (user.profile?.photo) {
        setPreviewUrl(user.profile.photo);
      } else if (user.picture) {
        setPreviewUrl(user.picture);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо."
      )
    ) {
      return;
    }

    if (
      !window.confirm("Это действительно удалит ВСЕ ваши данные. Вы уверены?")
    ) {
      return;
    }

    try {
      await apiClient.delete("/users/delete-account/");
      logout();
      navigate("/");
      notification.success("Аккаунт удален", "Ваш аккаунт был успешно удален.");
    } catch (error) {
      notification.error(
        "Ошибка",
        "Не удалось удалить аккаунт. Пожалуйста, попробуйте позже."
      );
    }
  };

  if (!user) {
    return (
      <Layout openLoginModal={() => {}}>
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-8 text-center">
          <p className="text-sm sm:text-base lg:text-lg text-gray-700">
            Пожалуйста, войдите в систему, чтобы просмотреть профиль
          </p>
        </div>
      </Layout>
    );
  }

  const photoUrl = previewUrl || user.profile?.photo || user.picture;

  return (
    <Layout openLoginModal={() => {}}>
      <div className="container mx-auto px-2 sm:px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 transition-all duration-300">
          <div className="flex flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 sm:hidden border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <Zoom>
                      <img
                        src={photoUrl}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    </Zoom>
                  ) : (
                    <Zoom>
                      <User className="h-6 w-6 text-gray-500" />
                    </Zoom>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800 truncate">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Открыть меню"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row">
              {/* Sidebar: z-50 only when open on mobile */}
              <div
                ref={sidebarRef}
                className={`fixed sm:static inset-y-0 left-0 w-64 sm:w-1/3 bg-gray-50 border-r border-gray-200 transform ${
                  isSidebarOpen ? "translate-x-0 z-50" : "-translate-x-full"
                } sm:translate-x-0 sm:z-auto transition-transform duration-300 ease-in-out sm:p-4`}
              >
                <div className="flex flex-col items-center p-4 sm:p-6">
                  <div className="hidden sm:flex w-20 h-20 bg-gray-200 rounded-full mb-3 overflow-hidden shadow-sm">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={user.username}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <User className="h-10 w-10 text-gray-500" />
                    )}
                  </div>
                  <h2 className="hidden sm:block text-lg font-bold text-gray-800 truncate max-w-full">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="hidden sm:block text-sm text-gray-600 truncate max-w-full">
                    {user.email}
                  </p>
                  <div
                    className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      user.profile?.user_type === "barber"
                        ? "bg-[#9A0F34]/10 text-[#9A0F34]"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.profile?.user_type === "barber" ? "Барбер" : "Клиент"}
                  </div>

                  <div className="mt-4 w-full space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab("info");
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center w-full p-2 rounded-md text-left text-sm transition-all duration-300 hover:bg-gray-100 ${
                        activeTab === "info"
                          ? "bg-gray-200 text-[#9A0F34] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t("personalInfo")}
                    </button>

                    {user.profile?.user_type !== "barber" && (
                      <button
                        onClick={() => {
                          setActiveTab("bookings");
                          setIsSidebarOpen(false);
                        }}
                        className={`flex items-center w-full p-2 rounded-md text-left text-sm transition-all duration-300 hover:bg-gray-100 ${
                          activeTab === "bookings"
                            ? "bg-gray-200 text-[#9A0F34] font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {t("myBookings")}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab("favorites");
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center w-full p-2 rounded-md text-left text-sm transition-all duration-300 hover:bg-gray-100 ${
                        activeTab === "favorites"
                          ? "bg-gray-200 text-[#9A0F34] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {t("favorites")}
                    </button>

                    {user.profile?.user_type === "barber" && (
                      <button
                        onClick={() => {
                          setActiveTab("barberBookings");
                          setIsSidebarOpen(false);
                        }}
                        className={`flex items-center w-full p-2 rounded-md text-left text-sm transition-all duration-300 hover:bg-gray-100 ${
                          activeTab === "barberBookings"
                            ? "bg-gray-200 text-[#9A0F34] font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {t("Мои записи")}
                      </button>
                    )}

                    {user.profile?.user_type === "barber" && (
                      <button
                        onClick={() => {
                          setActiveTab("myHaircuts");
                          setIsSidebarOpen(false);
                        }}
                        className={`flex items-center w-full p-2 rounded-md text-left text-sm transition-all duration-300 hover:bg-gray-100 ${
                          activeTab === "myHaircuts"
                            ? "bg-gray-200 text-[#9A0F34] font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <Scissors className="h-4 w-4 mr-2" />
                        Мои стрижки
                      </button>
                    )}

                    {user.profile?.user_type === "barber" && (
                      <button
                        onClick={() => {
                          setActiveTab("analytics");
                          setIsSidebarOpen(false);
                        }}
                        className={`flex items-center w-full p-2 rounded-md text-left text-sm transition-all duration-300 hover:bg-gray-100 ${
                          activeTab === "analytics"
                            ? "bg-gray-200 text-[#9A0F34] font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <BarChart className="h-4 w-4 mr-2" />
                        Аналитика
                      </button>
                    )}

                    {user.profile?.user_type === "client" ? (
                      <button
                        onClick={() => {
                          handleUserTypeChange("barber");
                          setIsSidebarOpen(false);
                        }}
                        className="flex items-center w-full mt-2 p-2 rounded-md text-left text-[#9A0F34] hover:bg-[#9A0F34]/10 transition-all duration-300 text-sm"
                      >
                        <Scissors className="h-4 w-4 mr-2" />Я барбер
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleUserTypeChange("client");
                          setIsSidebarOpen(false);
                        }}
                        className="flex items-center w-full mt-2 p-2 rounded-md text-left text-gray-700 hover:bg-gray-100 transition-all duration-300 text-sm"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Переключиться на клиента
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        setIsSidebarOpen(false);
                      }}
                      className="flex items-center w-full mt-2 p-2 rounded-md text-left text-red-600 hover:bg-red-50 transition-all duration-300 text-sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("logout")}
                    </button>

                    <button
                      onClick={() => {
                        handleDeleteAccount();
                        setIsSidebarOpen(false);
                      }}
                      className="flex items-center w-full mt-2 p-2 rounded-md text-left text-red-700 hover:bg-red-100 transition-all duration-300 text-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Удалить аккаунт
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-4 sm:p-6 sm:w-2/3">
                {activeTab === "info" && (
                  <div className="animate-fade-in scroll-mt-16" ref={infoRef}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                        {t("personalInfo")}
                      </h3>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="text-xs sm:text-sm border-[#9A0F34] text-[#9A0F34] hover:bg-[#9A0F34]/10"
                        >
                          {t("editProfile")}
                        </Button>
                      )}
                    </div>

                    <Card className="shadow-sm rounded-lg">
                      <CardContent className="p-4 sm:p-6">
                        {isEditing ? (
                          <form
                            onSubmit={handleSubmit}
                            className="space-y-4 sm:space-y-6"
                          >
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Фото профиля
                              </label>
                              <div className="mt-1 flex items-center space-x-3">
                                {previewUrl ? (
                                  <div className="relative inline-block">
                                    <img
                                      src={previewUrl}
                                      alt="Preview"
                                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover shadow-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProfileImage(null);
                                        setPreviewUrl(null);
                                      }}
                                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-sm"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                                  </div>
                                )}
                                <label
                                  htmlFor="photo-upload"
                                  className="cursor-pointer"
                                >
                                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium hover:bg-gray-50">
                                    Загрузить фото
                                  </span>
                                  <input
                                    id="photo-upload"
                                    name="photo"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                  Имя
                                </label>
                                <div className="relative">
                                  <User className="absolute top-2 sm:top-3 left-2 sm:left-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                  <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                  Фамилия
                                </label>
                                <div className="relative">
                                  <User className="absolute top-2 sm:top-3 left-2 sm:left-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                  <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed text-gray-600 text-sm sm:text-base"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Email нельзя изменить
                              </p>
                            </div>

                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Telegram профиль
                              </label>
                              <div className="relative">
                                <MessageCircle className="absolute top-2 sm:top-3 left-2 sm:left-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                <input
                                  type="text"
                                  name="telegram"
                                  value={formData.telegram}
                                  onChange={handleChange}
                                  placeholder="Username (без @)"
                                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                WhatsApp номер
                              </label>
                              <div className="relative">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="absolute top-2 sm:top-3 left-2 sm:left-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                                  />
                                </svg>
                                <input
                                  type="text"
                                  name="whatsapp"
                                  value={formData.whatsapp}
                                  onChange={handleChange}
                                  placeholder="+996 XXX XXX XXX"
                                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Адрес барбершопа
                              </label>
                              <div className="relative">
                                <MapPin className="absolute top-2 sm:top-3 left-2 sm:left-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <input
                                  type="text"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleChange}
                                  placeholder="Например: Бишкек, ул. Киевская 95"
                                  className="w-full pl-8 sm:pl-10 pr-20 sm:pr-24 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                />
                                <button
                                  type="button"
                                  onClick={handleGetLocation}
                                  disabled={locationLoading}
                                  className="absolute right-1 top-1 bottom-1 px-2 sm:px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-xs sm:text-sm"
                                >
                                  <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="ml-1 hidden sm:inline">
                                    {locationLoading
                                      ? "Определение..."
                                      : "Определить"}
                                  </span>
                                </button>
                              </div>
                              {formData.latitude && formData.longitude && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Координаты: {formData.latitude.toFixed(6)},{" "}
                                  {formData.longitude.toFixed(6)}
                                </p>
                              )}
                              {locationError && (
                                <p className="text-xs text-red-500 mt-1">
                                  {locationError}
                                </p>
                              )}
                            </div>

                            {user.profile?.user_type === "barber" && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="offers_home_service"
                                  name="offers_home_service"
                                  checked={formData.offers_home_service}
                                  onChange={handleCheckboxChange}
                                  className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                                />
                                <label
                                  htmlFor="offers_home_service"
                                  className="text-xs sm:text-sm text-gray-900"
                                >
                                  Предлагаю услуги на выезде
                                </label>
                              </div>
                            )}

                            {user.profile?.user_type === "barber" && (
                              <>
                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                    О себе
                                  </label>
                                  <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Расскажите о себе, своем опыте и услугах"
                                    rows={3}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                      Время работы с
                                    </label>
                                    <input
                                      type="time"
                                      name="working_hours_from"
                                      value={formData.working_hours_from}
                                      onChange={handleChange}
                                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                      Время работы до
                                    </label>
                                    <input
                                      type="time"
                                      name="working_hours_to"
                                      value={formData.working_hours_to}
                                      onChange={handleChange}
                                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                    Рабочие дни
                                  </label>
                                  <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {[
                                      "Пн",
                                      "Вт",
                                      "Ср",
                                      "Чт",
                                      "Пт",
                                      "Сб",
                                      "Вс",
                                    ].map((day) => (
                                      <label
                                        key={day}
                                        className="flex items-center space-x-1 sm:space-x-2"
                                      >
                                        <input
                                          type="checkbox"
                                          value={day}
                                          checked={formData.working_days.includes(
                                            day
                                          )}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setFormData((prev) => ({
                                                ...prev,
                                                working_days: [
                                                  ...prev.working_days,
                                                  day,
                                                ],
                                              }));
                                            } else {
                                              setFormData((prev) => ({
                                                ...prev,
                                                working_days:
                                                  prev.working_days.filter(
                                                    (d) => d !== day
                                                  ),
                                              }));
                                            }
                                          }}
                                          className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                                        />
                                        <span className="text-xs sm:text-sm text-gray-700">
                                          {day}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="flex space-x-3 pt-3 sm:pt-4">
                              <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                className="flex-1 bg-[#9A0F34] text-white hover:bg-[#C70039] text-xs sm:text-sm"
                              >
                                {isSubmitting ? "Сохранение..." : "Сохранить"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm"
                              >
                                Отмена
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="border-b pb-3 sm:pb-4">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Имя и фамилия
                              </label>
                              <p className="text-gray-900 text-sm sm:text-lg">
                                {user.first_name || "Не указано"}{" "}
                                {user.last_name || ""}
                              </p>
                            </div>

                            <div className="border-b pb-3 sm:pb-4">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Email
                              </label>
                              <p className="text-gray-900 text-sm sm:text-lg">
                                {user.email}
                              </p>
                            </div>

                            <div className="border-b pb-3 sm:pb-4">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-blue-500" />
                                Telegram
                              </label>
                              <p className="text-gray-900 text-sm sm:text-lg">
                                {user.profile?.telegram ? (
                                  <a
                                    href={`https://t.me/${user.profile.telegram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center text-sm sm:text-base"
                                  >
                                    @{user.profile.telegram}
                                    <svg
                                      className="h-3 w-3 sm:h-4 sm:w-4 ml-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                ) : (
                                  "Не указан"
                                )}
                              </p>
                            </div>

                            <div className="border-b pb-3 sm:pb-4">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-green-500"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                                  />
                                </svg>
                                WhatsApp
                              </label>
                              <p className="text-gray-900 text-sm sm:text-lg">
                                {user.profile?.whatsapp ? (
                                  <a
                                    href={`https://wa.me/${user.profile.whatsapp.replace(
                                      /\s+/g,
                                      ""
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:underline flex items-center text-sm sm:text-base"
                                  >
                                    {user.profile.whatsapp}
                                    <svg
                                      className="h-3 w-3 sm:h-4 sm:w-4 ml-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                ) : (
                                  "Не указан"
                                )}
                              </p>
                            </div>

                            <div className="border-b pb-3 sm:pb-4">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-gray-500" />
                                Адрес барбершопа
                              </label>
                              <p className="text-gray-900 text-sm sm:text-lg">
                                {user.profile?.address || "Не указан"}
                              </p>
                              {user.profile?.latitude &&
                                user.profile?.longitude && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Координаты:{" "}
                                    {user.profile.latitude.toFixed(6)},{" "}
                                    {user.profile.longitude.toFixed(6)}
                                  </p>
                                )}
                              {user.profile?.user_type === "barber" &&
                                user.profile?.offers_home_service && (
                                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Выезд на дом
                                  </div>
                                )}
                            </div>

                            {user.profile?.user_type === "barber" && (
                              <>
                                <div className="border-b pb-3 sm:pb-4">
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                    О себе
                                  </label>
                                  <p className="text-gray-900 text-sm sm:text-lg">
                                    {user.profile?.bio || "Не указано"}
                                  </p>
                                </div>

                                <div className="border-b pb-3 sm:pb-4">
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                    Часы работы
                                  </label>
                                  <p className="text-gray-900 text-sm sm:text-lg">
                                    {user.profile?.working_hours_from ||
                                      "09:00"}{" "}
                                    -{" "}
                                    {user.profile?.working_hours_to || "18:00"}
                                  </p>
                                </div>

                                <div className="border-b pb-3 sm:pb-4">
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                    Рабочие дни
                                  </label>
                                  <p className="text-gray-900 text-sm sm:text-lg">
                                    {user.profile?.working_days?.join(", ") ||
                                      "Пн, Вт, Ср, Чт, Пт"}
                                  </p>
                                </div>
                              </>
                            )}

                            {user.profile?.user_type === "barber" && (
                              <div className="mt-4 sm:mt-6">
                                <TelegramRegistration />
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {user.profile?.user_type === "barber" && !isEditing && (
                      <div className="mt-4 sm:mt-6">
                        <Button
                          variant="primary"
                          onClick={() => navigate("/add-service")}
                          className="flex items-center bg-[#9A0F34] text-white hover:bg-[#C70039] text-xs sm:text-sm"
                        >
                          <Scissors className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Добавить услугу
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "bookings" && (
                  <div
                    className="animate-fade-in scroll-mt-16"
                    ref={bookingsRef}
                  >
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                      {t("myBookings")}
                    </h3>
                    <BookingsList />
                  </div>
                )}

                {activeTab === "favorites" && (
                  <div
                    className="animate-fade-in scroll-mt-16"
                    ref={favoritesRef}
                  >
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                      {t("favorites")}
                    </h3>
                    <FavoritesList />
                  </div>
                )}

                {activeTab === "barberBookings" && (
                  <div
                    className="animate-fade-in scroll-mt-16"
                    ref={barberBookingsRef}
                  >
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                      {t("Мои записи")}
                    </h3>
                    <BarberBookingsList />
                  </div>
                )}

                {activeTab === "myHaircuts" && (
                  <div
                    className="animate-fade-in scroll-mt-16"
                    ref={myHaircutsRef}
                  >
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                      Мои стрижки
                    </h3>
                    <MyHaircuts />
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div
                    className="animate-fade-in scroll-mt-16"
                    ref={analyticsRef}
                  >
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                      Аналитика
                    </h3>
                    <BarberAnalytics />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showBecomeBaberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                Стать барбером
              </h2>
              <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                Для регистрации как барбер необходимо указать ваш Telegram. Это
                позволит вам получать уведомления о бронированиях.
              </p>

              <form
                onSubmit={handleBecomeBarberSubmit}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Telegram username
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-2 sm:left-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    <input
                      type="text"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleChange}
                      placeholder="Username (без @)"
                      className="w-full pl-8 sm:pl-10 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#9A0F34] text-white hover:bg-[#C70039] text-xs sm:text-sm"
                  >
                    {isSubmitting ? "Сохранение..." : "Стать барбером"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBecomeBaberModal(false)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showImageCropper && tempImageUrl && (
          <ImageCropper
            imageSrc={tempImageUrl}
            onCropComplete={handleCropComplete}
            onCancel={() => {
              setShowImageCropper(false);
              setTempImageUrl(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
