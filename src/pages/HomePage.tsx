import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Banner from '../components/home/Banner';
import {
  Search,
  Scissors,
  MapPin,
  Heart,
  Clock,
  Star,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  Filter,
  Grid3X3,
  Grid2X2
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { servicesAPI, profileAPI, bookingsAPI } from '../api/services';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import BookingModal from '../components/booking/BookingModal';
import HaircutGrid from '../components/haircuts/HaircutGrid';

const HomePage = ({ openLoginModal }) => {
  const [popularHaircuts, setPopularHaircuts] = useState([]);
  const [nearbyBarbers, setNearbyBarbers] = useState([]);
  const [allHaircuts, setAllHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [userLocation, setUserLocation] = useState({
    address: '',
    latitude: null,
    longitude: null
  });

  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('popular');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Модальные окна
  const [showBarberContactModal, setShowBarberContactModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedHaircut, setSelectedHaircut] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [categories] = useState([
    { name: 'Классические', icon: 'classic', color: 'bg-blue-100 text-blue-700' },
    { name: 'Фейды', icon: 'fade', color: 'bg-green-100 text-green-700' },
    { name: 'Андеркаты', icon: 'undercut', color: 'bg-purple-100 text-purple-700' },
    { name: 'Текстурные', icon: 'textured', color: 'bg-red-100 text-red-700' },
    { name: 'Кроп', icon: 'crop', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Помпадур', icon: 'pompadour', color: 'bg-indigo-100 text-indigo-700' },
  ]);

  const filterCategories = {
    types: ['Классическая', 'Фейд', 'Андеркат', 'Кроп', 'Помпадур', 'Текстурная'],
    lengths: ['Короткие', 'Средние', 'Длинные'],
    styles: ['Деловой', 'Повседневный', 'Трендовый', 'Винтажный', 'Современный'],
  };

  const searchInputRef = useRef(null);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const notification = useNotification();
  const { user, toggleFavorite, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Получение начальных данных (популярные стрижки, барберы)
  useEffect(() => {
    getUserLocation();
    fetchInitialData();
  }, []);

  // Получение галереи при изменении фильтров
  useEffect(() => {
    fetchGalleryData(true);
  }, [filters, sortBy, searchQuery]);

  // Настройка Intersection Observer для бесконечного скролла
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
      // Популярные стрижки
      const haircutsResponse = await servicesAPI.getPopular();
      if (haircutsResponse && haircutsResponse.data) {
        let results = haircutsResponse.data;
        if (haircutsResponse.data.results && Array.isArray(haircutsResponse.data.results)) {
          results = haircutsResponse.data.results;
        }
        if (Array.isArray(results)) {
          setPopularHaircuts(results);
        }
      }

      // Барберы рядом
      const barbersResponse = await profileAPI.getAllBarbers();
      if (barbersResponse && barbersResponse.data) {
        let barbersData = [];
        if (barbersResponse.data.results && Array.isArray(barbersResponse.data.results)) {
          barbersData = barbersResponse.data.results;
        } else if (Array.isArray(barbersResponse.data)) {
          barbersData = barbersResponse.data;
        }
        if (userLocation.latitude && userLocation.longitude) {
          barbersData = barbersData.map(barber => {
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
          }).sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }
        setNearbyBarbers(barbersData.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      notification.error('Ошибка загрузки', 'Не удалось загрузить данные');
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
        ordering: sortBy === 'popular' ? '-views' : sortBy === 'price' ? 'price' : '-created_at',
        ...filters
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await servicesAPI.getAll(params);

      if (response && response.data) {
        let results = response.data.results || response.data;

        if (Array.isArray(results)) {
          const haircuts = results.map((service) => ({
            id: service.id,
            images: service.images || [],
            primaryImage: service.primary_image || service.image,
            title: service.title,
            price: service.price,
            barber: service.barber_details?.full_name || 'Unknown',
            barberId: service.barber_details?.id || service.barber,
            type: service.type,
            length: service.length,
            style: service.style,
            location: service.location,
            duration: service.duration,
            views: service.views || 0,
            isFavorite: service.is_favorite,
            barberWhatsapp: service.barber_details?.whatsapp,
            barberTelegram: service.barber_details?.telegram,
            description: service.description
          }));

          if (reset) {
            setAllHaircuts(haircuts);
            setPage(2);
          } else {
            setAllHaircuts(prev => [...prev, ...haircuts]);
            setPage(prev => prev + 1);
          }

          // Проверяем, есть ли еще данные
          setHasMore(results.length === 12);
        }
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      notification.error('Ошибка', 'Не удалось загрузить стрижки');
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
            let address = '';
            if (data.address) {
              const parts = [];
              if (data.address.city || data.address.town) parts.push(data.address.city || data.address.town);
              if (data.address.suburb) parts.push(data.address.suburb);
              address = parts.join(', ');
            }
            setUserLocation({ address: address || 'Неизвестное местоположение', latitude, longitude });
          } catch (error) {
            console.error('Error getting address:', error);
            setUserLocation({ address: 'Не удалось определить адрес', latitude, longitude });
          }
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const getBarberName = (barber) => {
    if (barber.first_name || barber.last_name) return `${barber.first_name || ''} ${barber.last_name || ''}`.trim();
    return barber.username || 'Барбер';
  };

  const handleFavoriteToggle = async (haircutId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await toggleFavorite(haircutId);
      // Обновляем в обоих массивах
      setPopularHaircuts(prev => prev.map(h => h.id === haircutId ? { ...h, is_favorite: !h.is_favorite } : h));
      setAllHaircuts(prev => prev.map(h => h.id === haircutId ? { ...h, is_favorite: !h.is_favorite } : h));
      notification.success('Успешно', 'Статус избранного изменен');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      notification.error('Ошибка', 'Не удалось изменить статус избранного');
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
        date: date,
        time: time,
        notes: contactInfo?.notes || '',
        client_name: contactInfo.name,
        client_phone: contactInfo.phone,
      };

      await bookingsAPI.create(bookingData);
      setIsBookingModalOpen(false);

      notification.success(
        'Бронирование создано',
        `Услуга "${selectedHaircut.title}" успешно забронирована`
      );

      if (isAuthenticated) {
        navigate('/profile', { state: { activeTab: 'bookings' } });
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      notification.error(
        'Ошибка бронирования',
        'Не удалось создать бронирование. Пожалуйста, попробуйте снова.'
      );
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setPage(1);
      fetchGalleryData(true);
    } else {
      setSearchQuery('');
      setFilters({});
      fetchGalleryData(true);
    }
    setIsFilterOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryClick = (categoryType) => {
    const categoryNames = {
      'classic': 'Классическая', 'fade': 'Фейд', 'undercut': 'Андеркат',
      'textured': 'Текстурная', 'crop': 'Кроп', 'pompadour': 'Помпадур'
    };
    setFilters({ types: [categoryNames[categoryType] || categoryType] });
    setShowCategoryDropdown(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({});
    setSortBy('popular');
    fetchGalleryData(true);
  };

  const HaircutCard = ({ haircut }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = haircut.images && haircut.images.length > 1;
    const autoSlideIntervalRef = useRef(null);
    const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);

    useEffect(() => {
      if (hasMultipleImages && autoSlideEnabled) {
        autoSlideIntervalRef.current = setInterval(() => {
          setCurrentImageIndex(prev => prev === haircut.images.length - 1 ? 0 : prev + 1);
        }, 5000);
      }
      return () => {
        if (autoSlideIntervalRef.current) clearInterval(autoSlideIntervalRef.current);
      };
    }, [haircut.images, autoSlideEnabled, hasMultipleImages]);

    const handlePrevImage = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false);
      if (hasMultipleImages) setCurrentImageIndex(prev => prev === 0 ? haircut.images.length - 1 : prev - 1);
    };

    const handleNextImage = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false);
      if (hasMultipleImages) setCurrentImageIndex(prev => prev === haircut.images.length - 1 ? 0 : prev + 1);
    };

    const currentImage = haircut.images && haircut.images.length > 0
      ? haircut.images[currentImageIndex].image
      : haircut.primary_image || haircut.image;

    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md h-full border border-gray-100 hover:shadow-xl">
        <div className="relative aspect-square overflow-hidden">
          <ImageWithFallback
            src={currentImage}
            alt={haircut.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {haircut.images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center backdrop-blur-sm">
            <Eye className="h-3 w-3 mr-1" />
            {haircut.views || 0}
          </div>
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button
              className={`p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors ${haircut.is_favorite ? 'text-red-400' : 'text-white'}`}
              onClick={(e) => handleFavoriteToggle(haircut.id, e)}
            >
              <Heart size={18} className={haircut.is_favorite ? 'fill-red-400' : ''} />
            </button>
            {(haircut.barber_details?.telegram || haircut.barber_details?.whatsapp) && (
              <button
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors text-white"
                onClick={(e) => handleContactClick(haircut, e)}
              >
                <MessageCircle size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold mb-1 line-clamp-1">{haircut.title}</h3>
          {haircut.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{haircut.description}</p>
          )}
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#9A0F34] font-bold text-sm">{Math.floor(haircut.price || 0)} сом</span>
            <span className="text-xs text-gray-600">{haircut.barber_details?.full_name || 'Барбер'}</span>
          </div>
          <button
            className="w-full bg-[#9A0F34] text-white text-sm py-2 rounded-lg hover:bg-[#7b0c29] transition-colors"
            onClick={() => {
              servicesAPI.incrementViews(haircut.id);
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
      <div className="pt-16 font-['Inter']">
        <Banner />

        {/* Поисковая панель */}
        <div className="sticky top-16 z-20 bg-white shadow-md py-4">
          {userLocation.address && (
            <div className="flex items-center justify-center mb-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1 text-[#9A0F34]" />
              <span>{userLocation.address}</span>
            </div>
          )}

          {/* Десктопная поисковая панель */}
          <div className="hidden md:flex items-center justify-center gap-4 px-4">
            <div className="relative w-72" ref={searchInputRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Найти стрижку..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none transition-shadow text-base"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <Button variant="primary" onClick={handleSearch}>
              Поиск
            </Button>
            <div className="relative">
              <button
                className={`flex items-center h-full px-3 border border-gray-300 rounded-lg ${showCategoryDropdown ? 'bg-gray-100 text-[#9A0F34]' : 'bg-white text-gray-700'}`}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Scissors className="h-5 w-5 mr-1" />
                <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 p-3 z-40 w-64">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Выберите категорию</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.icon)}
                        className={`flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors ${category.color}`}
                      >
                        <Scissors className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Мобильная поисковая панель */}
          <div className="md:hidden px-4">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Найти стрижку..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-2.5"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-gray-100 text-gray-700 flex items-center justify-center px-3 rounded-lg"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Барберы рядом */}
        <div className="py-4 px-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Барберы рядом</h2>
            <button onClick={() => navigate('/barbers')} className="text-sm text-[#9A0F34] hover:underline">
              Смотреть все
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex space-x-3 pb-2">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 bg-white rounded-lg p-3 shadow-sm animate-pulse">
                    <div className="w-14 h-14 bg-gray-200 rounded-full mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                ))
              ) : nearbyBarbers.length > 0 ? (
                nearbyBarbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => navigate(`/barber/${barber.id}`)}
                    className="flex-shrink-0 w-36 bg-white rounded-lg p-3 shadow-md hover:shadow-xl"
                  >
                    <img
                      src={barber.profile?.photo || 'https://via.placeholder.com/100'}
                      alt={getBarberName(barber)}
                      className="w-14 h-14 rounded-full mx-auto mb-2 object-cover"
                      loading="lazy"
                    />
                    <p className="text-center font-medium text-sm">{getBarberName(barber)}</p>
                    {barber.distance !== null && (
                      <p className="text-xs text-center text-gray-500 flex items-center justify-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {barber.distance} км от вас
                      </p>
                    )}
                  </button>
                ))
              ) : (
                <div className="w-full text-center py-4 text-gray-500">Барберы не найдены</div>
              )}
            </div>
          </div>
        </div>

        {/* Популярные стрижки */}
        <div className="py-4 px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Популярные стрижки</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-36 bg-gray-200"></div>
                  <div className="p-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : popularHaircuts.length > 0 ? (
              popularHaircuts.slice(0, 4).map((haircut) => (
                <HaircutCard key={haircut.id} haircut={haircut} />
              ))
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-4 text-gray-500">Стрижки не найдены</div>
            )}
          </div>
        </div>

        {/* Как это работает */}
        <div className="py-4 px-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Как это работает</h2>
          <div className="flex overflow-x-auto -mx-4 px-4 space-x-3 pb-2">
            {[
              { icon: <Search className="h-8 w-8 text-[#9A0F34]" />, title: 'Выбери стрижку', desc: 'Просматривай фото реальных стрижек' },
              { icon: <Calendar className="h-8 w-8 text-[#9A0F34]" />, title: 'Забронируй время', desc: 'Запишись к барберу онлайн' },
              { icon: <Star className="h-8 w-8 text-[#9A0F34]" />, title: 'Получи результат', desc: 'Точно такую же стрижку как на фото' },
            ].map((step, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-44 p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="mb-2">{step.icon}</div>
                <h3 className="font-medium mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Все стрижки */}
        <div className="py-6 px-4" data-section="gallery">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Все стрижки</h2>
            <div className="hidden md:flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border p-2 rounded-lg"
              >
                <option value="popular">По популярности</option>
                <option value="price">По цене</option>
                <option value="recent">Новые</option>
              </select>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button variant="outline" onClick={resetFilters}>
                  Сбросить фильтры
                </Button>
              )}
            </div>
          </div>

          {/* Галерея стрижек */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allHaircuts.map((haircut) => (
              <HaircutCard key={haircut.id} haircut={haircut} />
            ))}
          </div>

          {/* Индикатор загрузки */}
          {galleryLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9A0F34]"></div>
            </div>
          )}

          {/* Элемент для Intersection Observer */}
          <div ref={observerRef} className="h-4"></div>

          {/* Сообщение если нет данных */}
          {!loading && !galleryLoading && allHaircuts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Стрижки не найдены</p>
              <Button onClick={resetFilters}>Сбросить фильтры</Button>
            </div>
          )}
        </div>
      </div>

      {/* Мобильная панель фильтров */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Фильтры</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Сортировка</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'popular' ? 'bg-[#9A0F34] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSortBy('popular')}
                >
                  Популярные
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'price' ? 'bg-[#9A0F34] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSortBy('price')}
                >
                  По цене
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'recent' ? 'bg-[#9A0F34] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSortBy('recent')}
                >
                  Новые
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Тип стрижки</h4>
              <div className="grid grid-cols-2 gap-2">
                {filterCategories.types.map((type) => (
                  <label key={type} className="flex items-center bg-gray-100 rounded-lg p-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.types?.includes(type) || false}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...(filters.types || []), type]
                          : (filters.types || []).filter((t) => t !== type);
                        setFilters({ ...filters, types: newTypes });
                      }}
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button className="w-full py-2 bg-gray-200 rounded-lg" onClick={resetFilters}>
                Сбросить
              </button>
              <button
                className="w-full py-2 bg-[#9A0F34] text-white rounded-lg"
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

      {/* Модальные окна */}
      {showContactModal && selectedHaircut && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Связаться с барбером</h3>
              <p className="text-gray-600">Узнайте подойдет ли вам эта стрижка</p>
            </div>
            <div className="space-y-3">
              {selectedHaircut.barberWhatsapp && (
                <a
                  href={`https://wa.me/${selectedHaircut.barberWhatsapp.replace(/\D/g, '')}?text=Здравствуйте! Меня интересует стрижка "${selectedHaircut.title}"`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium text-base"
                >
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  WhatsApp
                </a>
              )}
              {selectedHaircut.barberTelegram && (
                <a
                  href={`https://t.me/${selectedHaircut.barberTelegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium text-base"
                >
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                  </svg>
                  Telegram
                </a>
              )}
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full text-gray-500 py-3 hover:text-gray-700 transition-colors font-medium text-base"
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
    </Layout>
  );
};

export default HomePage;