import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Phone,
  Instagram,
  MessageCircle,
  Star,
  Users,
  ChevronRight,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import HaircutGrid from "../components/haircuts/HaircutGrid";
import { barbershopsAPI } from "../api/barbershops";
import { Barbershop, Barber, Haircut } from "../types";

// Константы для дефолтных значений (пути относительно public)
const DEFAULT_BG_IMAGE = "/images/barbershop-bg.webp";
const DEFAULT_LOGO = "/images/barbershop-logo.webp";
const DEFAULT_AVATAR = "/images/avatar.webp";

interface BarberProfilePageProps {
  openLoginModal: () => void;
}

const BarbershopDetailPage: React.FC<BarberProfilePageProps> = ({
  openLoginModal,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Haircut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBarbershopData();
    } else {
      console.error("No barbershop ID provided");
      setError("ID барбершопа не указан");
      setLoading(false);
    }
  }, [id]);

  const fetchBarbershopData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [shopResponse, barbersResponse, servicesResponse] =
        await Promise.all([
          barbershopsAPI.getById(id!).catch((e) => {
            console.error("Error fetching barbershop:", e);
            throw new Error("Не удалось загрузить данные барбершопа");
          }),
          barbershopsAPI.getBarbers(id!).catch((e) => {
            console.error("Error fetching barbers:", e);
            return { data: [] };
          }),
          barbershopsAPI.getServices(id!).catch((e) => {
            console.error("Error fetching services:", e);
            return { data: [] };
          }),
        ]);

      // Нормализация данных
      const normalizedBarbershop = shopResponse.data
        ? {
            ...shopResponse.data,
            id: String(shopResponse.data.id || ""),
            rating: Number(shopResponse.data.rating) || 0,
            reviewCount: Number(shopResponse.data.review_count) || 0,
            barbers: shopResponse.data.barbers
              ? String(shopResponse.data.barbers).split(",")
              : [],
            logo: shopResponse.data.logo
              ? `http://127.0.0.1:8000${shopResponse.data.logo}`
              : DEFAULT_LOGO,
            photos: shopResponse.data.photos?.map(
              (photo: string) => `http://127.0.0.1:8000${photo}`
            ) || [DEFAULT_BG_IMAGE],
          }
        : null;

      const normalizedBarbers = Array.isArray(barbersResponse.data)
        ? barbersResponse.data.map((barber: any) => ({
            ...barber,
            id: String(barber.id || ""),
            rating: Number(barber.rating) || 0,
            name: barber.user_details
              ? `${barber.user_details.first_name || ""} ${
                  barber.user_details.last_name || ""
                }`.trim()
              : barber.name || "Без имени",
            avatar: barber.user_details?.profile?.photo
              ? `http://127.0.0.1:8000${barber.user_details.profile.photo}`
              : DEFAULT_AVATAR,
          }))
        : [];

      const normalizedServices = Array.isArray(servicesResponse.data)
        ? servicesResponse.data.map((service: any) => ({
            ...service,
            id: String(service.id || ""),
            image: service.image
              ? `http://127.0.0.1:8000${service.image}`
              : DEFAULT_BG_IMAGE,
          }))
        : [];

      setBarbershop(normalizedBarbershop);
      setBarbers(normalizedBarbers);
      setServices(normalizedServices);
      console.log("Fetched barbershop:", normalizedBarbershop);
      console.log("Fetched barbers:", normalizedBarbers);
      console.log("Fetched services:", normalizedServices);
    } catch (error: any) {
      console.error("Error fetching barbershop data:", error);
      setError(error.message || "Ошибка загрузки данных");
      setBarbershop(null);
      setBarbers([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout openLoginModal={openLoginModal}>
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="animate-pulse">
            <div className="h-32 sm:h-48 bg-gray-200 rounded-lg mb-4 sm:mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !barbershop) {
    return (
      <Layout openLoginModal={openLoginModal}>
        <div className="container mx-auto px-4 py-4 sm:py-6 text-center">
          <h2 className="text-base sm:text-lg font-bold mb-4">
            {error || "Барбершоп не найден"}
          </h2>
          <Link to="/discover">
            <Button
              variant="primary"
              className="bg-[#9A0F34] text-white px-4 py-2 rounded-md text-xs sm:text-sm"
              aria-label="Вернуться к списку барбершопов"
            >
              К списку барбершопов
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="min-h-screen bg-gray-50">
        {/* Шапка барбершопа */}
        <div className="relative h-32 sm:h-48 md:h-64">
          <img
            src={barbershop.photos?.[0] || DEFAULT_BG_IMAGE}
            alt={barbershop.name || "Барбершоп"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_BG_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-4">
                <div className="flex items-end gap-2 sm:gap-4">
                  <img
                    src={barbershop.logo || DEFAULT_LOGO}
                    alt={barbershop.name || "Логотип барбершопа"}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-white"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_LOGO;
                    }}
                  />
                  <div className="text-white">
                    <h1 className="text-base sm:text-lg font-bold mb-1 truncate">
                      {barbershop.name || "Без названия"}
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star
                          className="h-3.5 w-3.5 text-yellow-400 mr-1"
                          fill="currentColor"
                        />
                        <span
                          className="font-medium text-xs"
                          aria-describedby={`rating-${barbershop.id}`}
                        >
                          {(barbershop.rating || 0).toFixed(1)}
                        </span>
                        <span className="opacity-75 ml-1 text-xs">
                          ({barbershop.reviewCount || 0})
                        </span>
                      </div>
                      {barbershop.isVerified && (
                        <div className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
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
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="bg-[#9A0F34] text-white px-3 py-1.5 rounded-md text-xs sm:text-sm"
                  onClick={() => navigate(`/booking?barbershop=${id}`)}
                  aria-label={`Записаться в ${barbershop.name || "барбершоп"}`}
                >
                  Записаться
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Левая колонка - информация */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 sm:p-5 mb-4 sm:mb-6">
                <h3 className="font-semibold text-sm sm:text-base mb-3">
                  Информация
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Адрес</p>
                      <p className="text-xs font-medium truncate">
                        {barbershop.address || "Не указано"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-3.5 w-3.5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Часы работы</p>
                      <p className="text-xs font-medium">
                        {barbershop.workingHours?.from &&
                        barbershop.workingHours?.to
                          ? `${barbershop.workingHours.from} - ${barbershop.workingHours.to}`
                          : "Не указано"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {barbershop.workingHours?.days?.join(", ") ||
                          "Не указано"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-3.5 w-3.5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Телефон</p>
                      <a
                        href={
                          barbershop.phone ? `tel:${barbershop.phone}` : "#"
                        }
                        className="text-xs font-semibold text-[#9A0F34] truncate"
                        aria-disabled={!barbershop.phone}
                      >
                        {barbershop.phone || "Не указано"}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Социальные сети</p>
                  <div className="flex gap-2">
                    {barbershop.whatsapp && (
                      <a
                        href={`https://wa.me/${barbershop.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-green-500 text-white rounded-md flex items-center justify-center"
                        aria-label="Связаться через WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {barbershop.instagram && (
                      <a
                        href={`https://instagram.com/${barbershop.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-md flex items-center justify-center"
                        aria-label="Посмотреть Instagram"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {!barbershop.whatsapp && !barbershop.instagram && (
                      <p className="text-xs text-gray-500 italic">
                        Социальные сети не указаны
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 sm:p-5">
                <h3 className="font-semibold text-sm sm:text-base mb-3 flex items-center">
                  <Users className="h-3.5 w-3.5 mr-2" />
                  Наши барберы ({barbers.length})
                </h3>
                <div className="space-y-2">
                  {barbers.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center">
                      Барберы не найдены
                    </p>
                  ) : (
                    barbers.map((barber) => (
                      <Link
                        key={barber.id}
                        to={`/barber/${barber.id}`}
                        className="flex items-center gap-2 p-2 rounded-md"
                        aria-label={`Перейти к профилю ${
                          barber.name || "барбера"
                        }`}
                      >
                        <img
                          src={barber.avatar || DEFAULT_AVATAR}
                          alt={barber.name || "Барбер"}
                          className="w-7 h-7 rounded-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-xs truncate">
                            {barber.name || "Без имени"}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star
                              className="h-3 w-3 text-yellow-400 mr-1"
                              fill="currentColor"
                            />
                            <span>{(barber.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Правая колонка - услуги */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold mb-4">
                  Наши работы
                </h3>
                {services.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">
                      Пока нет добавленных работ
                    </p>
                    <Link to="/discover">
                      <Button
                        variant="primary"
                        className="bg-[#9A0F34] text-white px-4 py-2 rounded-md text-xs sm:text-sm"
                        aria-label="Вернуться к списку барбершопов"
                      >
                        К списку барбершопов
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <HaircutGrid
                    haircuts={services}
                    onBookClick={(haircut) =>
                      navigate(
                        `/booking?haircut=${haircut.id}&barbershop=${id}`
                      )
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BarbershopDetailPage;
