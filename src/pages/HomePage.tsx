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
  Sparkles,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { servicesAPI, profileAPI, bookingsAPI } from "../api/services";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import BookingModal from "../components/booking/BookingModal";
import {
  Haircut,
  Barber,
  PaginatedResponse,
  BookingRequest,
  ServiceImage,
} from "../types";
import { useLanguage } from "../context/LanguageContext";

interface ExtendedHaircut extends Haircut {
  barberWhatsapp?: string;
  barberTelegram?: string;
}

interface HomePageProps {
  openLoginModal: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const [popularHaircuts, setPopularHaircuts] = useState<ExtendedHaircut[]>([]);
  const [nearbyBarbers, setNearbyBarbers] = useState<Barber[]>([]);
  const [allHaircuts, setAllHaircuts] = useState<ExtendedHaircut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<{
    address: string;
    latitude: number | null;
    longitude: number | null;
  }>({
    address: "",
    latitude: null,
    longitude: null,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    types: string[];
    priceRange: [number, number | null];
  }>({
    types: [],
    priceRange: [0, null],
  });
  const [sortBy, setSortBy] = useState<"popular" | "price" | "recent">(
    "popular"
  );
  const [showCategoryDropdown, setShowCategoryDropdown] =
    useState<boolean>(false);

  const [selectedHaircut, setSelectedHaircut] =
    useState<ExtendedHaircut | null>(null);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  const categories = [
    { name: t("classic"), icon: "classic", color: "bg-blue-100 text-blue-800" },
    { name: t("fade"), icon: "fade", color: "bg-green-100 text-green-800" },
    {
      name: t("undercut"),
      icon: "undercut",
      color: "bg-purple-100 text-purple-800",
    },
    { name: t("textured"), icon: "textured", color: "bg-red-100 text-red-800" },
    { name: t("crop"), icon: "crop", color: "bg-yellow-100 text-yellow-800" },
    {
      name: t("pompadour"),
      icon: "pompadour",
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  const filterCategories = {
    types: [
      t("classic"),
      t("fade"),
      t("undercut"),
      t("crop"),
      t("pompadour"),
      t("textured"),
    ],
    lengths: [t("short"), t("medium"), t("long")],
    styles: [
      t("business"),
      t("casual"),
      t("trendy"),
      t("vintage"),
      t("modern"),
    ],
    priceRanges: [
      { label: t("upTo500"), min: 0, max: 500 },
      { label: t("500to1000"), min: 500, max: 1000 },
      { label: t("1000to2000"), min: 1000, max: 2000 },
      { label: t("over2000"), min: 2000, max: null },
    ],
  };

  const sortOptions = [
    { value: "popular", label: t("popular") },
    { value: "price", label: t("price") },
    { value: "recent", label: t("recent") },
  ];

  const searchInputRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const notification = useNotification();
  const { toggleFavorite, isAuthenticated } = useAuth();

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
      const haircutsData: PaginatedResponse<Haircut> = haircutsResponse.data;
      const results = Array.isArray(haircutsData.results)
        ? haircutsData.results
        : Array.isArray(haircutsData)
        ? haircutsData
        : [];
      setPopularHaircuts(
        results.map((service) => ({
          ...service,
          barber:
            service.barber_details?.full_name ||
            service.barber_details?.username ||
            t("default"),
          barberId: service.barber_details?.id.toString() || service.barber,
          barberWhatsapp: service.barber_details?.whatsapp,
          barberTelegram: service.barber_details?.telegram,
          isFavorite: service.is_favorite || false,
        }))
      );

      const barbersResponse = await profileAPI.getAllBarbers();
      const barbersData: PaginatedResponse<Barber> = barbersResponse.data;
      let barbers = Array.isArray(barbersData.results)
        ? barbersData.results
        : Array.isArray(barbersData)
        ? barbersData
        : [];
      if (userLocation.latitude && userLocation.longitude) {
        barbers = barbers
          .map((barber) => {
            let distance: number | null = null;
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
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }
      setNearbyBarbers(barbers.slice(0, 4));
    } catch (error) {
      console.error(t("loadingError"), error);
      notification.error(t("loadingError"), t("loadingErrorDescription"));
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryData = async (reset: boolean = false) => {
    if (galleryLoading) return;

    setGalleryLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params: Record<string, string | number> = {
        page: currentPage,
        page_size: 12,
        ordering:
          sortBy === "popular"
            ? "-views"
            : sortBy === "price"
            ? "price"
            : "-created_at",
      };
      if (filters.types.length) params.types = filters.types.join(",");
      if (filters.priceRange[0] !== 0) params.min_price = filters.priceRange[0];
      if (filters.priceRange[1]) params.max_price = filters.priceRange[1];
      if (searchQuery) params.search = searchQuery;

      const response = await servicesAPI.getAll(params);
      const responseData: PaginatedResponse<Haircut> = response.data;
      const results = Array.isArray(responseData.results)
        ? responseData.results
        : Array.isArray(responseData)
        ? responseData
        : [];
      const haircuts: ExtendedHaircut[] = results.map((service) => ({
        id: service.id.toString(),
        images: service.images || [],
        primaryImage: service.primary_image || service.image,
        title: service.title,
        price: parseFloat(service.price),
        barber:
          service.barber_details?.full_name ||
          service.barber_details?.username ||
          t("default"),
        barberId: service.barber_details?.id.toString() || service.barber,
        type: service.type,
        length: service.length,
        style: service.style,
        location: service.location,
        duration: service.duration,
        views: service.views || 0,
        isFavorite: service.is_favorite || false,
        barberWhatsapp: service.barber_details?.whatsapp,
        barberTelegram: service.barber_details?.telegram,
        description: service.description,
      }));

      setAllHaircuts((prev) => (reset ? haircuts : [...prev, ...haircuts]));
      setPage(currentPage + 1);
      setHasMore(results.length === 12);
    } catch (error) {
      console.error(t("error"), error);
      notification.error(t("error"), t("noResults"));
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
            const address: string = data.address
              ? [data.address.city || data.address.town, data.address.suburb]
                  .filter(Boolean)
                  .join(", ") || t("unknown")
              : t("unknown");
            setUserLocation({ address, latitude, longitude });
          } catch (error) {
            console.error(t("error"), error);
            setUserLocation({
              address: t("error"),
              latitude,
              longitude,
            });
          }
        },
        (error) => console.error(t("error"), error)
      );
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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

  const deg2rad = (deg: number): number => deg * (Math.PI / 180);

  const getBarberName = (barber: any) =>
    barber.first_name || barber.last_name
      ? `${barber.first_name || ""} ${barber.last_name || ""}`.trim()
      : barber.username || t("default");

  const handleFavoriteToggle = async (
    haircutId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      notification.info(t("loginRequired"), t("loginToFavorite"));
      return;
    }
    try {
      await toggleFavorite(haircutId);
      setPopularHaircuts((prev) =>
        prev.map((h) =>
          h.id === haircutId ? { ...h, isFavorite: !h.isFavorite } : h
        )
      );
      setAllHaircuts((prev) =>
        prev.map((h) =>
          h.id === haircutId ? { ...h, isFavorite: !h.isFavorite } : h
        )
      );
      notification.success(t("success"), t("favoriteStatusChanged"));
    } catch (error) {
      console.error(t("failedToChangeFavoriteStatus"), error);
      notification.error(t("error"), t("failedToChangeFavoriteStatus"));
    }
  };

  const handleContactClick = (
    haircut: ExtendedHaircut,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedHaircut(haircut);
    setShowContactModal(true);
  };

  const handleBookClick = (haircut: ExtendedHaircut) => {
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (
    date: string,
    time: string,
    contactInfo: { name?: string; phone?: string; notes?: string }
  ) => {
    if (!selectedHaircut) return;
    try {
      const bookingData: BookingRequest = {
        service: selectedHaircut.id,
        date,
        time,
        notes: contactInfo.notes,
        client_name: contactInfo.name,
        client_phone: contactInfo.phone,
      };
      await bookingsAPI.create(bookingData);
      setIsBookingModalOpen(false);
      notification.success(
        t("bookingCreated"),
        t("bookingCreatedSuccess", { title: selectedHaircut.title })
      );
      if (isAuthenticated) {
        navigate("/profile", { state: { activeTab: "bookings" } });
      }
    } catch (err) {
      console.error(t("bookingError"), err);
      notification.error(t("bookingError"), t("bookingErrorDescription"));
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchGalleryData(true);
    setIsFilterOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryClick = (categoryType: string) => {
    const categoryNames: Record<string, string> = {
      classic: t("classic"),
      fade: t("fade"),
      undercut: t("undercut"),
      textured: t("textured"),
      crop: t("crop"),
      pompadour: t("pompadour"),
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

  const handlePriceRangeClick = (min: number, max: number | null) => {
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

  const handleBarberClick = (
    barberId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (barberId) navigate(`/barber/${barberId}`);
  };

  const HaircutCard: React.FC<{ haircut: ExtendedHaircut }> = ({ haircut }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const hasMultipleImages = haircut.images && haircut.images.length > 1;
    const autoSlideIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [autoSlideEnabled, setAutoSlideEnabled] = useState<boolean>(true);

    useEffect(() => {
      if (hasMultipleImages && autoSlideEnabled) {
        autoSlideIntervalRef.current = setInterval(() => {
          setCurrentImageIndex((prev) =>
            prev === haircut.images.length - 1 ? 0 : prev + 1
          );
        }, 5000);
      }
      return () => {
        if (autoSlideIntervalRef.current) {
          clearInterval(autoSlideIntervalRef.current);
        }
      };
    }, [haircut.images, autoSlideEnabled, hasMultipleImages]);

    const handlePrevImage = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false);
      if (hasMultipleImages)
        setCurrentImageIndex((prev) =>
          prev === 0 ? haircut.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false);
      if (hasMultipleImages)
        setCurrentImageIndex((prev) =>
          prev === haircut.images.length - 1 ? 0 : prev + 1
        );
    };

    const currentImage: string =
      haircut.images && haircut.images.length > 0
        ? haircut.images[currentImageIndex].image
        : haircut.primaryImage || "";

    return (
      <div className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
        <div className="relative aspect-square">
          <ImageWithFallback
            src={currentImage}
            alt={haircut.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/50"
                aria-label={t("previousImage")}
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/50"
                aria-label={t("nextImage")}
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5">
                {haircut.images.map((_: ServiceImage, index: number) => (
                  <div
                    key={index}
                    className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/60 text-white px-1.5 sm:px-2 py-1 rounded-full text-[10px] sm:text-xs flex items-center backdrop-blur-sm">
            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            {haircut.views || 0}
          </div>
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-1.5 z-10">
            <button
              className={`p-1 sm:p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-200 ${
                haircut.isFavorite ? "text-red-400" : "text-white"
              }`}
              onClick={(e) => handleFavoriteToggle(haircut.id, e)}
              aria-label={
                haircut.isFavorite ? t("removeFavorite") : t("favorite")
              }
            >
              <Heart
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                  haircut.isFavorite ? "fill-red-400" : ""
                }`}
              />
            </button>
            {(haircut.barberWhatsapp || haircut.barberTelegram) && (
              <button
                className="p-1 sm:p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-200 text-white"
                onClick={(e) => handleContactClick(haircut, e)}
                aria-label={t("contactBarber")}
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="text-[11px] sm:text-sm font-semibold mb-1 line-clamp-1 text-gray-900">
            {haircut.title}
          </h3>
          {haircut.description && (
            <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2 mb-1 sm:mb-2">
              {haircut.description}
            </p>
          )}
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-[#9A0F34] font-bold text-[11px] sm:text-sm">
              {t("from")} {Math.floor(haircut.price || 0)} {t("som")}
            </span>
            <button
              onClick={(e) => handleBarberClick(haircut.barberId, e)}
              className="text-[10px] sm:text-xs text-gray-600 hover:text-[#9A0F34] transition-colors duration-200"
              aria-label={t("viewProfile")}
            >
              {haircut.barber}
            </button>
          </div>
          <button
            className="w-full bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white text-[11px] sm:text-sm py-1.5 sm:py-2 rounded-lg hover:shadow-lg transition-all duration-300"
            onClick={async () => {
              try {
                await servicesAPI.incrementViews(haircut.id);
              } catch (error) {
                console.error(t("error"), error);
              }
              handleBookClick(haircut);
            }}
            aria-label={t("iWantThis")}
          >
            {t("iWantThis")}
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
        <div className="py-6 bg-white rounded-2xl mt-6">
          <div className="flex justify-between items-center mb-4 px-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t("nearbyBarbers")}
            </h2>
            <button
              onClick={() => navigate("/discover")}
              className="text-sm text-[#9A0F34] hover:text-[#7b0c29] font-medium transition-colors duration-200"
              aria-label={t("viewAll")} // Added
            >
              {t("viewAll")}
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
                    aria-label={t("viewProfile")} // Added
                  >
                    <img
                      src={barber.profile?.photo || "/default-avatar.png"}
                      alt={getBarberName(barber)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 object-cover shadow-sm"
                      loading="lazy"
                    />
                    <p className="text-center font-semibold text-sm sm:text-base text-gray-900 mb-2">
                      {getBarberName(barber)}
                    </p>
                    <p className="text-[#9A0F34] text-xs text-center flex items-center justify-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {barber.profile?.address || t("unknown")}
                    </p>
                  </button>
                ))
              ) : (
                <div className="w-full text-center py-4 text-gray-500 text-sm">
                  {t("nearbyBarbersNotFound")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Haircuts */}
        <div className="py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t("popularHaircuts")}
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
                {t("haircutsNotFound")}
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="py-10 bg-white rounded-2xl">
          <div className="text-center mb-6 px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {t("howItWorks")}
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {t("howItWorksSubtitle")}
            </p>
          </div>

          <div className="overflow-x-auto px-1 sm:px-4 p-6 scroll-smooth scrollbar-none snap-x snap-mandatory">
            <div className="flex gap-4 w-max justify-between">
              {[
                {
                  icon: <Search className="h-7 w-7 text-white" />,
                  title: t("chooseHaircutStep"),
                  desc: t("chooseHaircutStepDescription"),
                },
                {
                  icon: <Calendar className="h-7 w-7 text-white" />,
                  title: t("bookTime"),
                  desc: t("bookTimeDescription"),
                },
                {
                  icon: <Star className="h-7 w-7 text-white" />,
                  title: t("getResult"),
                  desc: t("getResultDescription"),
                },
                {
                  icon: <Sparkles className="h-7 w-7 text-white" />,
                  title: t("haircutCare"),
                  desc: t("haircutCareDescription"),
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 snap-center w-64 sm:w-72 md:w-80 p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition duration-200 hover:-translate-y-0.5"
                >
                  <div className="mb-3 bg-[#9A0F34] p-2 rounded-lg w-fit">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Haircuts */}
        <div className="py-6" data-section="gallery">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3 px-4 py-3 bg-white shadow-sm rounded-b-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("allHaircuts")}
            </h2>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "popular" | "price" | "recent")
                }
                className="hidden md:block border border-gray-300 px-3 py-2 rounded-md text-sm bg-white shadow-sm focus:ring-2 focus:ring-[#9A0F34] focus:outline-none transition-all duration-200"
                aria-label={t("sort")} // Added
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
                  className="text-sm px-4 py-2 border border-[#9A0F34] text-[#9A0F34] hover:bg-[#9A0F34] hover:text-white transition-all duration-200 rounded-md"
                  onClick={resetFilters}
                  aria-label={t("clearFilters")} // Added
                >
                  {t("clearFilters")}
                </Button>
              )}
            </div>
          </div>
          {/* Sticky Search Panel */}
          <div className="sticky top-[4rem] z-20 mb-6 bg-white rounded-b-2xl rounded-t-none shadow-lg p-5 border border-t-0 border-gray-100">
            {/* Desktop Search Panel */}
            <div className="hidden md:flex items-center justify-center gap-4 max-w-4xl mx-auto">
              <div className="relative flex-grow max-w-lg" ref={searchInputRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("searchHaircutPlaceholder")}
                  className="w-full pl-12 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none transition-all duration-200 text-sm bg-gray-50 shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  value={searchQuery}
                  aria-label={t("searchHaircutPlaceholder")} // Added
                />
                {searchQuery && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setSearchQuery("")}
                    aria-label={t("clearFilters")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                variant="primary"
                className="px-6 py-4 text-sm bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] hover:shadow-lg transition-all duration-300 rounded-lg"
                onClick={handleSearch}
                aria-label={t("search")} // Added
              >
                {t("search")}
              </Button>

              <div className="relative">
                <button
                  className={`flex items-center px-3 py-3 border border-gray-200 rounded-lg bg-white shadow-sm transition-all duration-200 ${
                    showCategoryDropdown
                      ? "bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white"
                      : "text-gray-700"
                  }`}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  aria-haspopup="true"
                  aria-expanded={showCategoryDropdown}
                  aria-label={t("categories")} // Added
                >
                  <Scissors className="h-5 w-5 mr-2" />
                  <span className="text-sm font-semibold">
                    {t("categories")}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50 w-72">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      {t("selectCategory")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => handleCategoryClick(category.icon)}
                          className={`flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors ${category.color} text-xs`}
                          aria-label={t("selectCategory") + " " + category.name} // Updated
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
            <div className="md:hidden flex gap-3 items-center px-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("searchHaircutPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none text-sm bg-gray-50 shadow-sm"
                  aria-label={t("searchHaircutPlaceholder")} // Added
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setSearchQuery("")}
                    aria-label={t("clearFilters")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white flex items-center justify-center px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                aria-label={t("filters")} // Added
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
          {!loading && !galleryLoading && allHaircuts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-sm">
                {t("haircutsNotFound")}
              </p>
              <Button
                className="text-sm bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white font-semibold transition-all duration-300 rounded-lg px-6 py-2"
                onClick={resetFilters}
                aria-label={t("clearFilters")} // Added
              >
                {t("clearFilters")}
              </Button>
            </div>
          )}
          <div ref={observerRef} className="h-4"></div>{" "}
          {/* Added for infinite scroll */}
        </div>

        {/* Mobile Filter Panel */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 bg-white transition-all duration-300">
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {t("filters")}
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  aria-label={t("close")} // Added
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  {t("sort")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                        sortBy === opt.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-all duration-200 `}
                      onClick={() => setSortBy(opt.value)}
                      aria-label={opt.label} // Added
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  {t("filterByType")}
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
                          setFilters((prev) => ({
                            ...prev,
                            types: prev.types.includes(type)
                              ? prev.types.filter((t) => t !== type)
                              : [...prev.types, type],
                          }));
                        }}
                        aria-label={type} // Added
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  {t("filterByPrice")}
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
                      aria-label={range.label} // Added
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
                  aria-label={t("clearFilters")} // Added
                >
                  {t("clearFilters")}
                </button>
                <button
                  className="w-full py-2 bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white rounded-lg text-sm hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    setIsFilterOpen(false);
                    handleSearch();
                  }}
                  aria-label={t("confirm")} // Added
                >
                  {t("confirm")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedHaircut && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowContactModal(false)}
          >
            <div
              className="relative bg-white rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeScale"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              aria-describedby="contact-modal-desc"
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label={t("close")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600 hover:text-gray-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <h3
                  id="contact-modal-title"
                  className="text-2xl font-extrabold text-gray-900 mb-2"
                >
                  {t("contactBarber")}
                </h3>
                <p
                  id="contact-modal-desc"
                  className="text-gray-600 text-sm max-w-xs mx-auto"
                >
                  {t("contactBarberDescription")}
                </p>
              </div>

              <div className="space-y-4">
                {selectedHaircut.barberWhatsapp && (
                  <a
                    href={`https://wa.me/${selectedHaircut.barberWhatsapp.replace(
                      /\D/g,
                      ""
                    )}?text=${t("whatsappMessage", {
                      title: selectedHaircut.title,
                    })}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3 rounded-2xl shadow-md transition-all duration-300 font-semibold text-base gap-3"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    {t("whatsapp")}
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
                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-2xl shadow-md transition-all duration-300 font-semibold text-base gap-3"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                    </svg>
                    {t("telegram")}
                  </a>
                )}
                {!selectedHaircut.barberWhatsapp &&
                  !selectedHaircut.barberTelegram && (
                    <p className="text-center text-gray-500 py-6 text-sm">
                      {t("noBarberContactInfo")}
                    </p>
                  )}
              </div>
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
