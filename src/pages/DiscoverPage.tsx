import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Users,
  Search,
  Store,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import { profileAPI } from "../api/services";
import { barbershopsAPI } from "../api/barbershops";
import { Barbershop, Barber, UserProfile } from "../types";

interface DiscoverPageProps {
  openLoginModal: () => void;
}

const DiscoverPage: React.FC<DiscoverPageProps> = ({ openLoginModal }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"barbers" | "barbershops">(
    "barbers"
  );
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchData();
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const barbersResponse = await profileAPI.getAllBarbers();
      setBarbers(
        Array.isArray(barbersResponse?.data)
          ? barbersResponse.data
          : barbersResponse?.data?.results || []
      );

      const barbershopsResponse = await barbershopsAPI.getAll();
      setBarbershops(
        Array.isArray(barbershopsResponse?.data)
          ? barbershopsResponse.data
          : barbershopsResponse?.data?.results || []
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarbers = barbers.filter((barber) => {
    const fullName = `${barber.first_name || ""} ${
      barber.last_name || ""
    }`.toLowerCase();
    const address = (barber.profile?.address || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || address.includes(query);
    const matchesRegion =
      selectedRegion === "all" ||
      (barber.profile?.address || "")
        .toLowerCase()
        .includes(selectedRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  const filteredBarbershops = barbershops.filter((shop) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      shop.name.toLowerCase().includes(query) ||
      shop.address.toLowerCase().includes(query);
    const matchesRegion =
      selectedRegion === "all" ||
      shop.address.toLowerCase().includes(selectedRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  const handleBarberClick = (barberId: string) => {
    navigate(`/barber/${barberId}`);
  };

  const handleBarbershopClick = (barbershopId: string) => {
    if (barbershopId) {
      navigate(`/barbershop/${barbershopId}`); // Updated to singular "barbershop"
    } else {
      console.error("Invalid barbershop ID:", barbershopId);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("all");
  };

  const getWorkingHours = (entity: Barbershop | UserProfile) => {
    if ("workingHours" in entity && entity.workingHours) {
      return `${entity.workingHours.from || "09:00"} - ${
        entity.workingHours.to || "21:00"
      }`;
    } else if (entity.working_hours_from && entity.working_hours_to) {
      return `${entity.working_hours_from} - ${entity.working_hours_to}`;
    }
    return "09:00 - 21:00";
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Header */}
        <div
          className={`text-white overflow-hidden transition-all duration-300 ${
            isScrolled
              ? "min-h-[100px] py-4 px-4 sm:px-6 pb-2"
              : "min-h-[350px] py-20 px-4 sm:px-6"
          }`}
          style={{
            backgroundImage: `linear-gradient(to right, rgb(154, 15, 52) 0%, rgba(154, 15, 52, 0.31) 50%, rgba(154, 15, 52, 0) 100%), url('https://www.vmcdn.ca/f/files/sudbury/spotlight-images/sudbury-barber-studio/adobestock_231110781.jpeg;w=960')`,
            backgroundPosition: "right",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="container mx-auto px-4 z-10 flex flex-col justify-center h-full">
            <h1
              className={`font-extrabold mb-5 tracking-tight animate-fade-in-down transition-all duration-300 ${
                isScrolled ? "text-2xl md:text-3xl" : "text-4xl md:text-4xl"
              }`}
            >
              Ваш идеальный барбер в Бишкеке
            </h1>
            <p
              className={`opacity-90 max-w-xl animate-fade-in-up delay-200 transition-all duration-300 ${
                isScrolled ? "text-sm md:text-base" : "text-lg md:text-xl"
              }`}
            >
              Найдите лучших мастеров и топовые барбершопы для стильной стрижки
              рядом с вами
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 py-4">
          <div className="bg-white sm:bg-gradient-to-b sm:from-white sm:to-gray-50/50 sm:rounded-xl sm:shadow-md p-4 sm:p-6 transition-all duration-300">
            {/* Location */}
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-[#9A0F34] transition-colors duration-200" />
              <span className="text-base sm:text-xl font-bold text-gray-900">
                г. Бишкек
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative mb-5 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-focus-within:text-[#9A0F34] transition-colors duration-200" />
              <input
                type="text"
                placeholder={`Поиск ${
                  activeTab === "barbers" ? "барберов" : "барбершопов"
                }...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 sm:pl-12 sm:pr-4 sm:py-4 border border-gray-200 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/80 focus:bg-white transition-all duration-300 placeholder-gray-400 text-sm sm:text-base text-gray-900"
                aria-label={`Поиск ${
                  activeTab === "barbers" ? "барберов" : "барбершопов"
                }`}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {searchQuery && (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="flex items-center gap-1.5 border-[#9A0F34] text-[#9A0F34] hover:bg-[#9A0F34] hover:text-white rounded-md px-3 py-2 sm:px-5 sm:py-2.5 transition-all duration-200 font-semibold text-xs sm:text-sm"
                  aria-label="Сбросить поиск"
                >
                  <svg
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Сбросить
                </Button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex sm:rounded-3xl sm:bg-gray-100/50 sm:p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("barbers")}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-xs sm:text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === "barbers"
                    ? "bg-[#9A0F34] text-white sm:shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#9A0F34] sm:hover:bg-gray-200/50"
                }`}
                aria-label={`Показать барберов (${filteredBarbers.length})`}
                aria-current={activeTab === "barbers" ? "true" : undefined}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Барберы ({filteredBarbers.length})
              </button>
              <button
                onClick={() => setActiveTab("barbershops")}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-xs sm:text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === "barbershops"
                    ? "bg-[#9A0F34] text-white sm:shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#9A0F34] sm:hover:bg-gray-200/50"
                }`}
                aria-label={`Показать барбершопы (${filteredBarbershops.length})`}
                aria-current={activeTab === "barbershops" ? "true" : undefined}
              >
                <Store className="h-4 w-4 sm:h-5 sm:w-5" />
                Барбершопы ({filteredBarbershops.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-56 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Barbers */}
              {activeTab === "barbers" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBarbers.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        Барберы не найдены
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Попробуйте изменить параметры поиска или посмотреть
                        барбершопы
                      </p>
                    </div>
                  ) : (
                    filteredBarbers.map((barber) => (
                      <div
                        key={barber.id}
                        className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                      >
                        <div className="relative h-64 overflow-hidden">
                          <ImageWithFallback
                            src={barber.profile?.photo || "/default-avatar.png"}
                            alt={`${barber.first_name} ${barber.last_name}`}
                            className="w-full h-full object-cover transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          {barber.profile?.offers_home_service && (
                            <div className="absolute bg-[#5dbd60] top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Выезд на дом
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-lg font-bold text-white truncate">
                              {barber.first_name} {barber.last_name}
                            </h3>
                            <div className="flex items-center mt-1">
                              <Star
                                className="h-5 w-5 text-yellow-400 mr-1"
                                fill="currentColor"
                              />
                              <span className="text-sm font-semibold text-white">
                                {barber.rating?.toFixed(1) || "0.0"}
                              </span>
                              <span className="text-xs text-white/80 ml-2">
                                ({barber.reviewCount || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-[#9A0F34]" />
                              <span className="line-clamp-1">
                                {barber.profile?.address ||
                                  "Локация не указана"}
                              </span>
                            </div>
                            {barber.profile?.working_hours_from && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-[#9A0F34]" />
                                <span>{getWorkingHours(barber.profile)}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="primary"
                            className="w-full mt-4 bg-[#9A0F34] hover:bg-[#7b0c29] text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
                            onClick={() => handleBarberClick(barber.id)}
                          >
                            Записаться
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Barbershops */}
              {activeTab === "barbershops" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBarbershops.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        Барбершопы не найдены
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-4">
                        Попробуйте изменить параметры поиска или посмотреть
                        барберов
                      </p>
                      <Button
                        variant="outline"
                        className="border-[#9A0F34] text-[#9A0F34] hover:bg-[#9A0F34] hover:text-white"
                        onClick={() => setActiveTab("barbers")}
                      >
                        Смотреть барберов
                      </Button>
                    </div>
                  ) : (
                    filteredBarbershops.map((shop) => (
                      <div
                        key={shop.id}
                        className="bg-white rounded-lg overflow-hidden"
                      >
                        <div className="relative h-36 sm:h-48">
                          <ImageWithFallback
                            src={shop.logo || "/images/barbershop-logo.webp"}
                            alt={shop.name || "Барбершоп"}
                            className="w-full h-full object-cover"
                          />
                          {shop.isVerified && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Проверено
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">
                            {shop.name || "Без названия"}
                          </h3>
                          <div className="flex items-center mb-2">
                            <Star
                              className="h-4 w-4 text-yellow-400 mr-1"
                              fill="currentColor"
                            />
                            <span className="font-semibold text-xs sm:text-sm">
                              {(shop.rating || 0).toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({shop.review_count || 0} отзывов)
                            </span>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                            <div className="flex items-start">
                              <MapPin className="h-3.5 w-3.5 mr-2 mt-0.5 flex-shrink-0 text-[#9A0F34]" />
                              <span className="truncate">
                                {shop.address || "Не указано"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-[#9A0F34]" />
                              <span>{getWorkingHours(shop)}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-[#9A0F34]" />
                              <span>{shop.phone || "Не указано"}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <Users className="h-3.5 w-3.5 mr-1 text-[#9A0F34]" />
                              <span>{shop.barbers?.length || 0} барберов</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1 border-[#9A0F34] text-[#9A0F34] px-3 py-2 rounded-md text-xs sm:text-sm"
                              onClick={() => handleBarbershopClick(shop.id)}
                              aria-label={`View details of ${
                                shop.name || "barbershop"
                              }`}
                            >
                              Подробнее
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DiscoverPage;
