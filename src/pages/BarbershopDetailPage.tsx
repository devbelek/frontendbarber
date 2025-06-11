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
  Store,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import HaircutGrid from "../components/haircuts/HaircutGrid";
import { barbershopsAPI } from "../api/barbershops";
import { Barbershop, Barber, Haircut } from "../types";

// Default images
const DEFAULT_BG_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeeneNQ0sdbVjdj0SLSv7P6qngkx1YMdFfJA&s";
const DEFAULT_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/340px-Default_pfp.svg.png";
const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/340px-Default_pfp.svg.png";

interface BarbershopDetailPageProps {
  openLoginModal: () => void;
}

const BarbershopDetailPage: React.FC<BarbershopDetailPageProps> = ({
  openLoginModal,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Haircut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"barbers" | "services">("barbers");

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

      // Normalize barbershop data
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
              ? shopResponse.data.logo.startsWith("http")
                ? shopResponse.data.logo
                : `http://127.0.0.1:8000${shopResponse.data.logo}`
              : DEFAULT_LOGO,
            photos: shopResponse.data.photos?.map((photo: string) =>
              photo.startsWith("http") ? photo : `http://127.0.0.1:8000${photo}`
            ) || [DEFAULT_BG_IMAGE],
            description:
              shopResponse.data.description || "Описание отсутствует",
            latitude: Number(shopResponse.data.latitude) || null,
            longitude: Number(shopResponse.data.longitude) || null,
            telegram: shopResponse.data.telegram || null,
            working_hours_from:
              shopResponse.data.working_hours_from || "09:00:00",
            working_hours_to: shopResponse.data.working_hours_to || "21:00:00",
            working_days: shopResponse.data.working_days || [],
            created_at: shopResponse.data.created_at || null,
            updated_at: shopResponse.data.updated_at || null,
            staff: shopResponse.data.staff || [],
          }
        : null;

      // Normalize barbers data with additional logging
      const normalizedBarbers = Array.isArray(barbersResponse.data)
        ? barbersResponse.data.map((barber: any) => {
            const avatar = barber.user_details?.profile?.photo
              ? barber.user_details.profile.photo.startsWith("http")
                ? barber.user_details.profile.photo
                : `http://127.0.0.1:8000${barber.user_details.profile.photo}`
              : DEFAULT_AVATAR;
            console.log(`Barber ${barber.id} avatar URL:`, avatar); // Debug log
            return {
              ...barber,
              id: String(barber.id || ""),
              rating: Number(barber.rating) || 0,
              name: barber.user_details
                ? `${barber.user_details.first_name || ""} ${
                    barber.user_details.last_name || ""
                  }`.trim()
                : barber.name || "Без имени",
              avatar,
            };
          })
        : [];
      console.log("Normalized barbers:", normalizedBarbers); // Debug log

      // Normalize services data
      const normalizedServices = Array.isArray(servicesResponse.data)
        ? servicesResponse.data.map((service: any) => ({
            ...service,
            id: String(service.id || ""),
            image: service.image
              ? service.image.startsWith("http")
                ? service.image
                : `http://127.0.0.1:8000${service.image}`
              : DEFAULT_BG_IMAGE,
          }))
        : [];

      setBarbershop(normalizedBarbershop);
      setBarbers(normalizedBarbers);
      setServices(normalizedServices);
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
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-48 sm:h-64 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !barbershop) {
    return (
      <Layout openLoginModal={openLoginModal}>
        <div className="container mx-auto px-4 py-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {error || "Барбершоп не найден"}
          </h2>
          <Link to="/discover">
            <Button
              variant="primary"
              className="bg-[#9A0F34] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#7b0c29] transition-colors"
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Header Section */}
        <div className="relative h-48 sm:h-64 md:h-80">
          <img
            src={barbershop.photos?.[0] || DEFAULT_BG_IMAGE}
            alt={barbershop.name || "Барбершоп"}
            className="w-full h-full object-cover rounded-b-4xl"
            loading="lazy"
            onError={(e) => {
              console.warn("Failed to load barbershop image, using fallback");
              e.currentTarget.src = DEFAULT_BG_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <img
                    src={barbershop.logo || DEFAULT_LOGO}
                    alt={barbershop.name || "Логотип барбершопа"}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-white shadow-lg"
                    loading="lazy"
                    onError={(e) => {
                      console.warn("Failed to load logo, using fallback");
                      e.currentTarget.src = DEFAULT_LOGO;
                    }}
                  />
                  <div className="text-white">
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
                      {barbershop.name || "Без названия"}
                    </h1>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Star
                          className="h-5 w-5 text-yellow-400 mr-1"
                          fill="currentColor"
                        />
                        <span className="font-semibold text-sm">
                          {(barbershop.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs opacity-75 ml-2">
                          ({barbershop.review_count || 0} отзывов)
                        </span>
                      </div>
                      {barbershop.is_verified && (
                        <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <svg
                            className="h-4 w-4"
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
                  className="bg-[#9A0F34] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#7b0c29] transition-colors"
                  onClick={() => navigate(`/booking?barbershop=${id}`)}
                  aria-label={`Записаться в ${barbershop.name || "барбершоп"}`}
                >
                  Записаться
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Barbershop Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#9A0F34]" />О барбершопе
                </h3>
                <div className="space-y-4 text-sm text-gray-600">
                  {/* Description */}
                  <div>
                    <p className="font-semibold text-gray-900">Описание</p>
                    <p className="text-gray-700 leading-relaxed">
                      {barbershop.description || "Описание отсутствует"}
                    </p>
                  </div>
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-[#9A0F34] mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Адрес</p>
                      <p>{barbershop.address || "Не указано"}</p>
                    </div>
                  </div>
                  {/* Working Hours */}
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-[#9A0F34] mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Часы работы</p>
                      <p>
                        {barbershop.working_hours?.from &&
                        barbershop.working_hours?.to
                          ? `${barbershop.working_hours.from} - ${barbershop.working_hours.to}`
                          : "Не указано"}
                      </p>
                      <p className="text-gray-500">
                        {barbershop.working_hours?.days?.join(", ") ||
                          "Не указано"}
                      </p>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-[#9A0F34] mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Телефон</p>
                      <a
                        href={
                          barbershop.phone
                            ? `https://wa.me/${barbershop.phone.replace(
                                /\D/g,
                                ""
                              )}`
                            : ""
                        }
                        className="text-[#9A0F34] hover:underline"
                        aria-disabled={!barbershop.phone}
                      >
                        {barbershop.phone || "Не указано"}
                      </a>
                    </div>
                  </div>
                  {/* Social Media */}
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">
                      Социальные сети
                    </p>
                    <div className="flex gap-3">
                      {barbershop.whatsapp && (
                        <a
                          href={`https://wa.me/${barbershop.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                          aria-label="Связаться через WhatsApp"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </a>
                      )}
                      {barbershop.instagram && (
                        <a
                          href={
                            barbershop.instagram.startsWith("http")
                              ? barbershop.instagram
                              : `https://instagram.com/${barbershop.instagram.replace(
                                  "@",
                                  ""
                                )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-colors"
                          aria-label="Посмотреть Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {barbershop.telegram && (
                        <a
                          href={
                            barbershop.telegram.startsWith("http")
                              ? barbershop.telegram
                              : `https://t.me/${barbershop.telegram.replace(
                                  "@",
                                  ""
                                )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                          aria-label="Связаться через Telegram"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.07-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.02-.09.01-.19-.04-.27-.06-.08-.17-.12-.26-.08-.12.06-1.72 1.08-4.86 3.17-.56.37-1.08.55-1.54.54-.51-.01-1.49-.30-2.21-.54-.86-.29-1.54-.44-1.48-.94.02-.17.22-.33.58-.56 2.22-1.47 3.71-2.47 4.45-2.96 2.54-1.67 3.07-1.98 3.42-1.98.08 0 .16.02.24.06.07.04.13.09.14.16z" />
                          </svg>
                        </a>
                      )}
                      {!barbershop.whatsapp &&
                        !barbershop.instagram &&
                        !barbershop.telegram && (
                          <p className="text-sm text-gray-500 italic">
                            Социальные сети не указаны
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tabs and Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`px-4 py-2 text-sm font-semibold ${
                      activeTab === "barbers"
                        ? "text-[#9A0F34] border-b-2 border-[#9A0F34]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("barbers")}
                    aria-selected={activeTab === "barbers"}
                  >
                    Наши барберы ({barbers.length})
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-semibold ${
                      activeTab === "services"
                        ? "text-[#9A0F34] border-b-2 border-[#9A0F34]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("services")}
                    aria-selected={activeTab === "services"}
                  >
                    Наши работы ({services.length})
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "barbers" && (
                  <div className="space-y-3">
                    {barbers.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center">
                        Барберы не найдены
                      </p>
                    ) : (
                      barbers.map((barber) => (
                        <Link
                          key={barber.id}
                          to={`/barber/${barber.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          aria-label={`Перейти к профилю ${
                            barber.name || "барбера"
                          }`}
                        >
                          <img
                            src={barber.avatar || DEFAULT_AVATAR}
                            alt={barber.name || "Барбер"}
                            className="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              console.warn(
                                `Failed to load avatar for barber ${barber.id}, using fallback`
                              );
                              e.currentTarget.src = DEFAULT_AVATAR;
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">
                              {barber.name || "Без имени"}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Star
                                className="h-4 w-4 text-yellow-400 mr-1"
                                fill="currentColor"
                              />
                              <span>{(barber.rating || 0).toFixed(1)}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "services" && (
                  <div>
                    {services.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <p className="text-sm sm:text-base text-gray-500 mb-4">
                          Пока нет добавленных работ
                        </p>
                        <Link to="/discover">
                          <Button
                            variant="primary"
                            className="bg-[#9A0F34] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#7b0c29] transition-colors"
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
