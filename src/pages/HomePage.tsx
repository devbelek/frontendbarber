import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/home/Banner";
import {
  Search,
  Scissors,
  MapPin,
  Heart,
  Star,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  Filter,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { servicesAPI, profileAPI, bookingsAPI } from "../api/services";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import BookingModal from "../components/booking/BookingModal";

const HomePage = ({ openLoginModal }) => {
  const [popularHaircuts, setPopularHaircuts] = useState([]);
  const [nearbyBarbers, setNearbyBarbers] = useState([]);
  const [allHaircuts, setAllHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [userLocation, setUserLocation] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    priceRange: [0, null], // [minPrice, maxPrice]
  });
  const [sortBy, setSortBy] = useState("popular");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Modals
  const [selectedHaircut, setSelectedHaircut] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [categories] = useState([
    {
      name: "Классические",
      icon: "classic",
      color: "bg-blue-100 text-blue-800",
    },
    { name: "Фейд", icon: "fade", color: "bg-green-100 text-green-800" },
    {
      name: "Андеркат",
      icon: "undercut",
      color: "bg-purple-800 text-white",
    },
    { name: "Текстурные", icon: "textured", color: "bg-red-600 text-white" },
    { name: "Кроп", icon: "crop", color: "bg-yellow-100 text-yellow-800" },
    {
      name: "Помпады",
      icon: "pompadour",
      color: "bg-indigo-100 text-indigo-800",
    },
  ]);

  const filterCategories = {
    types: [
      "Классическая",
      "Фейд",
      "Андеркат",
      "Кроп",
      "Помпадя",
      "Текстурная",
    ],
    lengths: ["Короткие", "Средние", "Длинные"],
    styles: [
      "Деловой",
      "Повседневный",
      "Трендовый",
      "Винтажный",
      "Современный",
    ],
    priceRanges: [
      { label: "До 500 сом", min: 0, max: 500 },
      { label: "500-1000 сом", min: 500, max: 1000 },
      { label: "1000-2000 сом", min: 1000, max: 2000 },
      { label: "2000+ сом", min: 2000, max: null },
    ],
  };

  const sortOptions = [
    { value: "popular", label: "Популярные" },
    { value: "price", label: "По цене" },
    { value: "recent", label: "Новые" },
  ];

  const searchInputRef = useRef(null);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const notification = useNotification();
  const { user, toggleFavorite, isAuthenticated } = useAuth();

  useEffect(() => {
    getUserLocation();
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchGalleryData(true);
  }, [filters, sortBy, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !galleryLoading) {
          fetchGalleryData(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, galleryLoading]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const haircutsResponse = await servicesAPI.getPopular();
      if (haircutsResponse && haircutsResponse.data) {
        let results = Array.isArray(haircutsResponse.data.results)
          ? haircutsResponse.data.results
          : Array.isArray(haircutsResponse.data)
          ? haircutsResponse.data
          : [];
        setPopularHaircuts(
          results.map((service) => ({
            ...service,
            barber:
              service.barber_details?.full_name ||
              service.barber_details?.username ||
              "Барбер",
            barberId: service.barber_details?.id || service.barber,
            barberWhatsapp: service.barber_details?.whatsapp,
            barberTelegram: service.barber_details?.telegram,
            is_favorite: service.is_favorite || false,
          }))
        );
      }

      const barbersResponse = await profileAPI.getAllBarbers();
      if (barbersResponse && barbersResponse.data) {
        let barbersData = Array.isArray(barbersResponse.data.results)
          ? barbersResponse.data.results
          : Array.isArray(barbersResponse.data)
          ? barbersResponse.data
          : [];
        if (userLocation.latitude && userLocation.longitude) {
          barbersData = barbersData
            .map((barber) => {
              let distance = null;
              if (barber.profile?.latitude && barber.profile?.longitude) {
                distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  barber.profile.latitude,
                  barber.profile.longitude
                );
              }
              return { ...barber, distance };
            })
            .sort(
              (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
            );
        }
        setNearbyBarbers(barbersData.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      notification.error("Ошибка загрузки", "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryData = async (reset = false) => {
    if (galleryLoading) return;

    setGalleryLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        page_size: 12,
        ordering:
          sortBy === "popular"
            ? "-views"
            : sortBy === "price"
            ? "price"
            : "-created_at",
        ...(filters.types?.length && { types: filters.types.join(",") }),
        ...(filters.priceRange[0] !== 0 && {
          min_price: filters.priceRange[0],
        }),
        ...(filters.priceRange[1] && { max_price: filters.priceRange[1] }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await servicesAPI.getAll(params);
      if (response && response.data) {
        const results = Array.isArray(response.data.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
        const haircuts = results.map((service) => ({
          id: service.id,
          images: service.images || [],
          primaryImage: service.primary_image || service.image,
          title: service.title,
          price: service.price,
          barber:
            service.barber_details?.full_name ||
            service.barber_details?.username ||
            "Барбер",
          barberId: service.barber_details?.id || service.barber,
          type: service.type,
          length: service.length,
          style: service.style,
          location: service.location,
          duration: service.duration,
          views: service.views || 0,
          is_favorite: service.is_favorite || false,
          barberWhatsapp: service.barber_details?.whatsapp,
          barberTelegram: service.barber_details?.telegram,
          description: service.description,
        }));

        setAllHaircuts((prev) => (reset ? haircuts : [...prev, ...haircuts]));
        setPage(currentPage + 1);
        setHasMore(results.length === 12);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      notification.error("Ошибка", "Не удалось загрузить стрижки");
    } finally {
      setGalleryLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const address = data.address
              ? [data.address.city || data.address.town, data.address.suburb]
                  .filter(Boolean)
                  .join(", ") || "Неизвестное местоположение"
              : "Неизвестное местоположение";
            setUserLocation({ address, latitude, longitude });
          } catch (error) {
            console.error("Error getting address:", error);
            setUserLocation({
              address: "Не удалось определить адрес",
              latitude,
              longitude,
            });
          }
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const getBarberName = (barber) =>
    barber.first_name || barber.last_name
      ? `${barber.first_name || ""} ${barber.last_name || ""}`.trim()
      : barber.username || "Барбер";

  const handleFavoriteToggle = async (haircutId, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      notification.info(
        "Требуется вход",
        "Чтобы добавить в избранное, необходимо войти"
      );
      return;
    }
    try {
      await toggleFavorite(haircutId);
      setPopularHaircuts((prev) =>
        prev.map((h) =>
          h.id === haircutId ? { ...h, is_favorite: !h.is_favorite } : h
        )
      );
      setAllHaircuts((prev) =>
        prev.map((h) =>
          h.id === haircutId ? { ...h, is_favorite: !h.is_favorite } : h
        )
      );
      notification.success("Успешно", "Статус избранного изменен");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      notification.error("Ошибка", "Не удалось изменить статус избранного");
    }
  };

  const handleContactClick = (haircut, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedHaircut(haircut);
    setShowContactModal(true);
  };

  const handleBookClick = (haircut) => {
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (date, time, contactInfo) => {
    if (!selectedHaircut) return;
    try {
      const bookingData = {
        service: selectedHaircut.id,
        date,
        time,
        notes: contactInfo?.notes || "",
        client_name: contactInfo.name,
        client_phone: contactInfo.phone,
      };
      await bookingsAPI.create(bookingData);
      setIsBookingModalOpen(false);
      notification.success(
        "Бронирование создано",
        `Услуга "${selectedHaircut.title}" успешно забронирована`
      );
      if (isAuthenticated) {
        navigate("/profile", { state: { activeTab: "bookings" } });
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      notification.error(
        "Ошибка бронирования",
        "Не удалось создать бронирование. Пожалуйста, попробуйте снова."
      );
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchGalleryData(true);
    setIsFilterOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryClick = (categoryType) => {
    const categoryNames = {
      classic: "Классическая",
      fade: "Фейд",
      undercut: "Андеркат",
      textured: "Текстурная",
      crop: "Кроп",
      pompadour: "Помпадя",
    };
    const newType = categoryNames[categoryType] || categoryType;
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(newType)
        ? prev.types.filter((t) => t !== newType)
        : [...prev.types, newType],
    }));
    setShowCategoryDropdown(false);
  };

  const handlePriceRangeClick = (min, max) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [min, max],
    }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({ types: [], priceRange: [0, null] });
    setSortBy("popular");
    fetchGalleryData(true);
  };

  const handleBarberClick = (barberId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (barberId) navigate(`/barber/${barberId}`);
  };

  const HaircutCard = ({ haircut }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = haircut.images && haircut.images.length > 1;
    const autoSlideIntervalRef = useRef(null);
    const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);

    useEffect(() => {
      if (hasMultipleImages && autoSlideEnabled) {
        autoSlideIntervalRef.current = setInterval(() => {
          setCurrentImageIndex((prev) =>
            prev === haircut.images.length - 1 ? 0 : prev + 1
          );
        }, 5000);
      }
      return () => clearInterval(autoSlideIntervalRef.current);
    }, [haircut.images, autoSlideEnabled, hasMultipleImages]);

    const handlePrevImage = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false);
      if (hasMultipleImages)
        setCurrentImageIndex((prev) =>
          prev === 0 ? haircut.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false);
      if (hasMultipleImages)
        setCurrentImageIndex((prev) =>
          prev === haircut.images.length - 1 ? 0 : prev + 1
        );
    };

    const currentImage =
      haircut.images && haircut.images.length > 0
        ? haircut.images[currentImageIndex].image
        : haircut.primaryImage || haircut.image;

    return (
      <div className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
        <div className="relative aspect-square">
          <ImageWithFallback
            src={currentImage}
            alt={haircut.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {haircut.images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center backdrop-blur-sm">
            <Eye className="h-3 w-3 mr-1" />
            {haircut.views || 0}
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            <button
              className={`p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-200 ${
                haircut.is_favorite ? "text-red-400" : "text-white"
              }`}
              onClick={(e) => handleFavoriteToggle(haircut.id, e)}
            >
              <Heart
                className={`h-4 w-4 ${
                  haircut.is_favorite ? "fill-red-400" : ""
                }`}
              />
            </button>
            {(haircut.barberWhatsapp || haircut.barberTelegram) && (
              <button
                className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-200 text-white"
                onClick={(e) => handleContactClick(haircut, e)}
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold mb-1 line-clamp-1 text-gray-900">
            {haircut.title}
          </h3>
          {haircut.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {haircut.description}
            </p>
          )}
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#9A0F34] font-bold text-sm">
              {Math.floor(haircut.price || 0)} сом
            </span>
            <button
              onClick={(e) => handleBarberClick(haircut.barberId, e)}
              className="text-xs text-gray-600 hover:text-[#9A0F34] transition-colors duration-200"
            >
              {haircut.barber}
            </button>
          </div>
          <button
            className="w-full bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white text-sm py-2 rounded-lg hover:shadow-lg transition-all duration-300"
            onClick={async () => {
              try {
                await servicesAPI.incrementViews(haircut.id);
              } catch (error) {
                console.error("Failed to increment views:", error);
              }
              handleBookClick(haircut);
            }}
          >
            Хочу такую же
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="pt-8 font-['Inter'] container mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <Banner />

        {/* Nearby Barbers */}
        <div className="py-6 bg-white rounded-2xl  mt-6">
          <div className="flex justify-between items-center mb-4 px-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Барберы рядом
            </h2>
            <button
              onClick={() => navigate("/discover")}
              className="text-sm text-[#9A0F34] hover:text-[#7b0c29] font-medium transition-colors duration-200"
            >
              Смотреть все
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 px-6 pb-4">
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-32 sm:w-36 bg-white rounded-xl p-3 shadow-md animate-pulse"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  ))
              ) : nearbyBarbers.length > 0 ? (
                nearbyBarbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => navigate(`/barber/${barber.id}`)}
                    className="flex-shrink-0 w-44 sm:w-52 bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={
                        barber.avatar ||
                        barber.profile?.photo ||
                        "https://via.placeholder.com/150"
                      }
                      alt={getBarberName(barber)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 object-cover shadow-sm"
                      loading="lazy"
                    />
                    <p className="text-center font-semibold text-sm sm:text-base text-gray-900 mb-2">
                      {getBarberName(barber)}
                    </p>
                    <p className="text-xs text-center text-gray-500 flex items-center justify-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {barber.distance} км
                    </p>
                  </button>
                ))
              ) : (
                <div className="w-full text-center py-4 text-gray-500 text-sm">
                  Барберы не найдены
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Haircuts */}
        <div className="py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Популярные стрижки
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
                  >
                    <div className="w-full aspect-square bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
            ) : popularHaircuts.length > 0 ? (
              popularHaircuts
                .slice(0, 4)
                .map((haircut) => (
                  <HaircutCard key={haircut.id} haircut={haircut} />
                ))
            ) : (
              <div className="col-span-2 sm:col-span-3 lg:col-span-4 text-center py-4 text-gray-500 text-sm">
                Стрижки не найдены
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="py-6">
          <div className="flex overflow-x-auto gap-4 px-2 sm:px-4 pb-4">
            {[
              {
                icon: <Search className="h-8 w-8 text-[#9A0F34]" />,
                title: "Выбери стрижку",
                desc: "Просматривай фото реальных стрижек",
              },
              {
                icon: <Calendar className="h-8 w-8 text-[#9A0F34]" />,
                title: "Забронируй время",
                desc: "Запишись к барберу онлайн",
              },
              {
                icon: <Star className="h-8 w-8 text-[#9A0F34]" />,
                title: "Получи результат",
                desc: "Точно такую же стрижку как на фото",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-72 sm:w-80 md:w-96 p-5 bg-white rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* All Haircuts */}
        <div className="py-6" data-section="gallery">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Все стрижки
            </h2>
            <div className="flex items-center gap-3">
              {/* Show select only on md and larger screens */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="hidden md:block border border-gray-200 p-2 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-[#9A0F34] focus:outline-none transition-all duration-200"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {(searchQuery ||
                filters.types.length > 0 ||
                filters.priceRange[0] !== 0 ||
                filters.priceRange[1] !== null) && (
                <Button
                  variant="outline"
                  className="text-sm px-4 py-2 border-[#9A0F34] text-[#9A0F34] hover:bg-[#9A0F34] hover:text-white transition-all duration-200 rounded-lg"
                  onClick={resetFilters}
                >
                  Сбросить
                </Button>
              )}
            </div>
          </div>

          {/* Sticky Search Panel */}
          <div className="sticky top-[4rem] z-20 mb-6 bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            {/* Desktop Search Panel */}
            <div className="hidden md:flex items-center justify-center gap-4">
              <div className="relative w-full max-w-lg" ref={searchInputRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Найти стрижку..."
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none transition-all duration-200 text-sm bg-gray-50 shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  value={searchQuery}
                />
                {searchQuery && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button
                variant="primary"
                className="px-6 py-3 text-sm bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] hover:shadow-lg transition-all duration-300 rounded-lg"
                onClick={handleSearch}
              >
                Поиск
              </Button>
              <div className="relative">
                <button
                  className={`flex items-center px-4 py-3 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
                    showCategoryDropdown
                      ? "bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white"
                      : "text-gray-700"
                  }`}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <Scissors className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Категории</span>
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50 w-72">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Выберите категорию
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => handleCategoryClick(category.icon)}
                          className={`flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors ${category.color} text-xs`}
                        >
                          <Scissors className="h-4 w-4 mb-1" />
                          <span className="font-medium">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Search Panel */}
            <div className="md:hidden flex gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Найти стрижку..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none text-sm bg-gray-50 shadow-sm"
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white flex items-center justify-center px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {allHaircuts.map((haircut) => (
              <HaircutCard key={haircut.id} haircut={haircut} />
            ))}
          </div>

          {galleryLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9A0F34]"></div>
            </div>
          )}

          <div ref={observerRef} className="h-4"></div>

          {!loading && !galleryLoading && allHaircuts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-sm">Стрижки не найдены</p>
              <Button
                className="text-sm bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] hover:shadow-lg transition-all duration-300 rounded-lg px-6 py-2"
                onClick={resetFilters}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Filter Panel */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden transition-all duration-300">
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Фильтры</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  Сортировка
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        sortBy === option.value
                          ? "bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-all duration-200`}
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  Тип стрижки
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {filterCategories.types.map((type) => (
                    <label
                      key={type}
                      className="flex items-center bg-gray-50 rounded-lg p-2 shadow-sm"
                    >
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34]"
                        checked={filters.types.includes(type)}
                        onChange={() => {
                          setFilters((prev: any) => ({
                            ...prev,
                            types: prev.types.includes(type)
                              ? prev.types.filter((t) => t !== type)
                              : [...prev.types, type],
                          }));
                        }}
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  Цена
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {filterCategories.priceRanges.map((range) => (
                    <button
                      key={range.label}
                      className={`p-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
                        filters.priceRange[0] === range.min &&
                        filters.priceRange[1] === range.max
                          ? "bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white"
                          : "bg-gray-50"
                      }`}
                      onClick={() =>
                        handlePriceRangeClick(range.min, range.max)
                      }
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="w-full py-2 bg-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-300 transition-all duration-200"
                  onClick={resetFilters}
                >
                  Сбросить
                </button>
                <button
                  className="w-full py-2 bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white rounded-lg text-sm hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    setIsFilterOpen(false);
                    handleSearch();
                  }}
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedHaircut && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
            onClick={() => setShowContactModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Связаться с барбером
                </h3>
                <p className="text-sm text-gray-600">
                  Узнайте подойдет ли вам эта стрижка
                </p>
              </div>
              <div className="space-y-3">
                {selectedHaircut.barberWhatsapp && (
                  <a
                    href={`https://wa.me/${selectedHaircut.barberWhatsapp.replace(
                      /\D/g,
                      ""
                    )}?text=Здравствуйте! Меня интересует стрижка "${
                      selectedHaircut.title
                    }"`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
                {selectedHaircut.barberTelegram && (
                  <a
                    href={`https://t.me/${selectedHaircut.barberTelegram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                    </svg>
                    Telegram
                  </a>
                )}
                {!selectedHaircut.barberWhatsapp &&
                  !selectedHaircut.barberTelegram && (
                    <p className="text-center text-gray-500 py-4 text-sm">
                      Контактные данные барбера не указаны
                    </p>
                  )}
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="mt-6 w-full text-gray-600 py-2 hover:text-gray-800 transition-colors duration-200 font-medium text-sm"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          haircut={selectedHaircut}
          onConfirm={handleBookingConfirm}
        />
      </div>
    </Layout>
  );
};

export default HomePage;
