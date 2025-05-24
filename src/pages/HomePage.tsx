import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Navigation,
  ChevronDown,
  X
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { servicesAPI, profileAPI } from '../api/services';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = ({ openLoginModal }) => {
  const [popularHaircuts, setPopularHaircuts] = useState([]);
  const [nearbyBarbers, setNearbyBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    address: '',
    latitude: null,
    longitude: null
  });
  const [categories] = useState([
    { name: 'Классические', icon: 'classic', color: 'bg-blue-100 text-blue-700' },
    { name: 'Фейды', icon: 'fade', color: 'bg-green-100 text-green-700' },
    { name: 'Андеркаты', icon: 'undercut', color: 'bg-purple-100 text-purple-700' },
    { name: 'Текстурные', icon: 'textured', color: 'bg-red-100 text-red-700' },
    { name: 'Кроп', icon: 'crop', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Помпадур', icon: 'pompadour', color: 'bg-indigo-100 text-indigo-700' },
  ]);
  const [showBarberContactModal, setShowBarberContactModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedHaircut, setSelectedHaircut] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Новые состояния для улучшений
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const searchInputRef = useRef(null);

  const navigate = useNavigate();
  const notification = useNotification();
  const { user, toggleFavorite } = useAuth();

  useEffect(() => {
    getUserLocation();

    const fetchData = async () => {
      setLoading(true);
      try {
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
        console.error('Error fetching data:', error);
        notification.error('Ошибка загрузки', 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Клик вне зоны поиска закрывает активный поиск
    const handleClickOutside = (event) => {
      if (isSearchActive && searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userLocation.latitude, userLocation.longitude]);

  // Когда поиск активирован, добавить обработчик Escape для закрытия
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsSearchActive(false);
        setShowCategoryDropdown(false);
      }
    };

    if (isSearchActive) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSearchActive]);

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
              if (data.address.city || data.address.town) {
                parts.push(data.address.city || data.address.town);
              }
              if (data.address.suburb) {
                parts.push(data.address.suburb);
              }
              address = parts.join(', ');
            }

            setUserLocation({
              address: address || 'Неизвестное местоположение',
              latitude,
              longitude
            });
          } catch (error) {
            console.error('Error getting address:', error);
            setUserLocation({
              address: 'Не удалось определить адрес',
              latitude,
              longitude
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return parseFloat(distance.toFixed(1));
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const goTo = (path) => {
    navigate(path);
  };

  const getBarberName = (barber) => {
    if (barber.first_name || barber.last_name) {
      return `${barber.first_name || ''} ${barber.last_name || ''}`.trim();
    }
    return barber.username || 'Барбер';
  };

  const handleFavoriteToggle = async (haircutId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await toggleFavorite(haircutId);
      setPopularHaircuts(prev => prev.map(h => {
        if (h.id === haircutId) {
          return { ...h, is_favorite: !h.is_favorite };
        }
        return h;
      }));
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

  const showBarberContacts = (barberId) => {
    const barber = nearbyBarbers.find(b => b.id === barberId);
    if (barber) {
      setSelectedBarber(barber);
      setShowBarberContactModal(true);
    }
  };

  const handleCategoryClick = (categoryType) => {
    navigate(`/gallery`, {
      state: { appliedFilters: { types: [categoryType] } }
    });
    setShowCategoryDropdown(false);
  };

  const handleSearchFocus = () => {
    setIsSearchActive(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const HaircutCard = ({ haircut }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = haircut.images && haircut.images.length > 1;
    const autoSlideIntervalRef = useRef(null);
    const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);

    // Автоматическая смена изображений
    useEffect(() => {
      if (hasMultipleImages && autoSlideEnabled) {
        autoSlideIntervalRef.current = setInterval(() => {
          setCurrentImageIndex(prev =>
            prev === haircut.images.length - 1 ? 0 : prev + 1
          );
        }, 5000); // Смена каждые 5 секунд
      }

      return () => {
        if (autoSlideIntervalRef.current) {
          clearInterval(autoSlideIntervalRef.current);
        }
      };
    }, [haircut.images, autoSlideEnabled, hasMultipleImages]);

    const handlePrevImage = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false); // Остановка автоматической смены при ручном управлении
      if (hasMultipleImages) {
        setCurrentImageIndex(prev =>
          prev === 0 ? haircut.images.length - 1 : prev - 1
        );
      }
    };

    const handleNextImage = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setAutoSlideEnabled(false);
      if (hasMultipleImages) {
        setCurrentImageIndex(prev =>
          prev === haircut.images.length - 1 ? 0 : prev + 1
        );
      }
    };

    const currentImage = haircut.images && haircut.images.length > 0
      ? haircut.images[currentImageIndex].image
      : haircut.primary_image || haircut.image;

    return (
      <motion.div
        className="bg-white rounded-lg overflow-hidden shadow-md transform transition-all duration-200 h-full border border-gray-100 hover:shadow-xl"
        whileHover={{ scale: 1.03 }}
      >
        <div className="relative aspect-square overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={currentImage}
                alt={haircut.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>

          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {haircut.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center backdrop-blur-sm">
            <Eye className="h-3 w-3 mr-1" />
            {haircut.views || 0}
          </div>

          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button
              className={`p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors ${
                haircut.is_favorite ? 'text-red-400' : 'text-white'
              }`}
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
            <span className="text-[#9A0F34] font-bold text-sm">
              {Math.floor(haircut.price || 0)} сом
            </span>
            <span className="text-xs text-gray-600">
              {haircut.barber_details?.full_name || 'Барбер'}
            </span>
          </div>

          <button
            className="w-full bg-[#9A0F34] text-white text-sm py-2 rounded-lg hover:bg-[#7b0c29] transition-colors"
            onClick={() => {
              servicesAPI.incrementViews(haircut.id);
              goTo(`/gallery?service=${haircut.id}`);
            }}
          >
            Хочу такую же
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      {/* Затемняющий оверлей при активном поиске */}
      {isSearchActive && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
          onClick={() => setIsSearchActive(false)}
        />
      )}

      <div className="pb-20 md:pb-0 font-['Inter']">
        {/* Улучшенная секция локации и поиска */}
        <motion.div
          className={`fixed top-0 pt-16 left-0 right-0 z-30 bg-white shadow-lg transition-all duration-300 ${
            isSearchActive ? 'pb-6' : 'pb-3'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {userLocation.address && (
            <div className="flex items-center justify-center mb-2 text-sm text-gray-600">
              <Navigation className="h-5 w-5 mr-1 text-[#9A0F34]" />
              <span>{userLocation.address}</span>
            </div>
          )}

          <div className="flex px-4 gap-2 relative">
            <div
              className={`relative flex-grow transition-all ${
                isSearchActive ? 'ring-2 ring-[#9A0F34]' : ''
              }`}
              ref={searchInputRef}
            >
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                  isSearchActive ? 'text-[#9A0F34]' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                placeholder="Найти стрижку..."
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none transition-shadow text-base"
                onClick={handleSearchFocus}
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

            <div className="flex-shrink-0 relative">
              <button
                className={`flex items-center h-full px-4 border border-gray-300 rounded-lg ${
                  showCategoryDropdown ? 'bg-gray-100 text-[#9A0F34]' : 'bg-white text-gray-700'
                }`}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Scissors className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Категории</span>
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Выпадающее меню категорий */}
              {showCategoryDropdown && (
                <motion.div
                  className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 p-3 z-40 w-64"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Выберите категорию</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.icon)}
                        className={`flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors ${category.color}`}
                      >
                        <Scissors className="h-6 w-6 mb-1" />
                        <span className="text-xs font-medium">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {isSearchActive && (
            <motion.div
              className="mt-4 px-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Button
                variant="primary"
                fullWidth
                onClick={handleSearch}
                className="py-3"
              >
                <Search className="h-5 w-5 mr-2" />
                Искать
              </Button>

              <div className="mt-3 flex flex-wrap gap-2">
                <p className="text-sm text-gray-500 mr-2">Популярные запросы:</p>
                {['Фейд', 'Андеркат', 'Классика', 'Помпадур'].map((term) => (
                  <button
                    key={term}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200"
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch();
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Дополнительный отступ для основного контента, когда поиск активен */}
        <div className={`pt-28 ${isSearchActive ? 'pt-44' : ''}`}></div>

        {/* Ближайшие барберы */}
        <div className="py-4 px-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Барберы рядом</h2>
            <button onClick={() => goTo('/barbers')} className="text-sm text-[#9A0F34] hover:underline">
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
                  <motion.button
                    key={barber.id}
                    onClick={() => goTo(`/barber/${barber.id}`)}
                    className="flex-shrink-0 w-36 bg-white rounded-lg p-3 shadow-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={barber.profile?.photo || 'https://via.placeholder.com/100'}
                      alt={getBarberName(barber)}
                      className="w-14 h-14 rounded-full mx-auto mb-2 object-cover"
                      loading="lazy"
                    />
                    <p className="text-center font-medium text-sm">{getBarberName(barber)}</p>
                    {barber.distance !== null && (
                      <p className="text-xs text-center text-gray-500">{barber.distance} км от вас</p>
                    )}
                  </motion.button>
                ))
              ) : (
                <div className="w-full text-center py-4 text-gray-500">
                  Барберы не найдены
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Популярные стрижки */}
        <div className="py-4 px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Популярные стрижки</h2>
            <button onClick={() => goTo('/gallery')} className="text-sm text-[#9A0F34] hover:underline">
              Смотреть все
            </button>
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
              <div className="col-span-2 md:col-span-4 text-center py-4 text-gray-500">
                Стрижки не найдены
              </div>
            )}
          </div>
        </div>

        {/* Как это работает */}
        <div className="py-4 px-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Как это работает</h2>
          <div className="flex overflow-x-auto -mx-4 px-4 space-x-3 pb-2">
            {[
              { emoji: '🔍', title: 'Выбери стрижку', desc: 'Просматривай фото реальных стрижек' },
              { emoji: '📅', title: 'Забронируй время', desc: 'Запишись к барберу онлайн' },
              { emoji: '✨', title: 'Получи результат', desc: 'Точно такую же стрижку как на фото' },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-44 p-3 bg-white rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-3xl mb-2">{step.emoji}</div>
                <h3 className="font-medium mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно контактов стрижки */}
      <AnimatePresence>
        {showContactModal && selectedHaircut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
                {selectedHaircut.barber_details?.whatsapp && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`https://wa.me/${selectedHaircut.barber_details.whatsapp.replace(/\D/g, '')}?text=Здравствуйте! Меня интересует стрижка "${selectedHaircut.title}"`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium text-base"
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    WhatsApp
                  </motion.a>
                )}

                {selectedHaircut.barber_details?.telegram && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`https://t.me/${selectedHaircut.barber_details.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium text-base"
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                    </svg>
                    Telegram
                  </motion.a>
                )}
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="mt-6 w-full text-gray-500 py-3 hover:text-gray-700 transition-colors font-medium text-base"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно контактов барбера */}
      <AnimatePresence>
        {showBarberContactModal && selectedBarber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBarberContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-semibold mb-4">Контакты барбера</h3>
              <div className="flex items-center mb-4">
                <img
                  src={selectedBarber.profile?.photo || 'https://via.placeholder.com/100'}
                  alt={getBarberName(selectedBarber)}
                  className="w-16 h-16 rounded-full mr-4 object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-medium text-lg">{getBarberName(selectedBarber)}</p>
                  <p className="text-sm text-gray-600">{selectedBarber.profile?.address || 'Адрес не указан'}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedBarber.profile?.whatsapp && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`https://wa.me/${selectedBarber.profile.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-[#25D366] text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium text-base"
                  >
                    WhatsApp
                  </motion.a>
                )}

                {selectedBarber.profile?.telegram && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`https://t.me/${selectedBarber.profile.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-[#0088cc] text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium text-base"
                  >
                    Telegram
                  </motion.a>
                )}

                {!selectedBarber.profile?.whatsapp && !selectedBarber.profile?.telegram && (
                  <div className="text-center text-gray-600 py-4">
                    <p>Барбер не указал контактные данные.</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowBarberContactModal(false)}
                className="mt-6 w-full text-gray-500 py-3 hover:text-gray-700 transition-colors font-medium text-base"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default HomePage;