import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import HaircutGrid from "../components/haircuts/HaircutGrid";
import BookingModal from "../components/booking/BookingModal";
import ReviewsList from "../components/reviews/ReviewsList";
import { servicesAPI, profileAPI } from "../api/services";
import { Barber, Haircut } from "../types";
import { useLanguage } from "../context/LanguageContext";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import { useNotification } from "../context/NotificationContext";
import HaircutSelectionModal from "../components/haircuts/HaircutSelectionModal";

interface BarberProfilePageProps {
  openLoginModal: () => void;
}

const BarberProfilePage: React.FC<BarberProfilePageProps> = ({
  openLoginModal,
}) => {
  const { t } = useLanguage();
  const notification = useNotification();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [barberHaircuts, setBarberHaircuts] = useState<Haircut[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isHaircutSelectionModalOpen, setIsHaircutSelectionModalOpen] =
    useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "info" | "reviews">(
    "portfolio"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarberData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        let barberResponse;
        try {
          barberResponse = await profileAPI.getBarberProfile(id);
        } catch (e: any) {
          console.error("Error fetching barber profile:", e);
          if (e.response?.status === 500) {
            notification.error(
              "Ошибка сервера",
              "Произошла ошибка при загрузке данных барбера. Попробуйте позже или обратитесь в поддержку."
            );
            setError("Ошибка сервера при загрузке данных барбера");
            setLoading(false);
            return;
          }
          throw e;
        }

        const barberData = barberResponse.data;
        if (!barberData) {
          throw new Error("Барбер не найден");
        }

        const barberInfo: Barber = {
          id: barberData.id,
          name:
            `${barberData.first_name || ""} ${
              barberData.last_name || ""
            }`.trim() || barberData.username,
          avatar: barberData.profile?.photo || "/default-avatar.png",
          rating: barberData.avg_rating || 0,
          reviewCount: barberData.review_count || 0,
          specialization: barberData.profile?.specialization || [],
          location: barberData.profile?.address || "Бишкек",
          workingHours: {
            from: barberData.profile?.working_hours_from || "09:00",
            to: barberData.profile?.working_hours_to || "18:00",
            days: barberData.profile?.working_days || [
              "Пн",
              "Вт",
              "Ср",
              "Чт",
              "Пт",
            ],
          },
          portfolio: barberData.portfolio || [],
          description: barberData.profile?.bio || "Информация о барбере",
          whatsapp: barberData.profile?.whatsapp || "",
          telegram: barberData.profile?.telegram || "",
          offerHomeService: barberData.profile?.offers_home_service || false,
        };

        setBarber(barberInfo);

        try {
          const haircutsResponse = await servicesAPI.getAll({ barber: id });
          if (haircutsResponse.data) {
            let haircuts: Haircut[] = [];
            let haircutsData = haircutsResponse.data;

            if (
              haircutsResponse.data.results &&
              Array.isArray(haircutsResponse.data.results)
            ) {
              haircutsData = haircutsResponse.data.results;
            }

            if (Array.isArray(haircutsData)) {
              haircutsData.forEach((service: any) => {
                haircuts.push({
                  id: service.id,
                  image: service.image,
                  primaryImage: service.primary_image,
                  images: service.images || [],
                  title: service.title,
                  price: service.price,
                  barber: service.barber_details?.full_name || "Unknown",
                  barberId: service.barber,
                  type: service.type,
                  length: service.length,
                  style: service.style,
                  location: service.location,
                  duration: service.duration,
                  description: service.description,
                  isFavorite: service.is_favorite,
                  views: service.views || 0,
                  barberWhatsapp: barberInfo.whatsapp,
                  barberTelegram: barberInfo.telegram,
                });
              });
            }

            setBarberHaircuts(haircuts);
          }
        } catch (e) {
          console.error("Failed to fetch barber haircuts:", e);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch barber data:", err);
        setError(
          "Не удалось загрузить данные о барбере. Проверьте соединение или попробуйте позже."
        );
        setLoading(false);
      }
    };

    fetchBarberData();
  }, [id, notification]);

  const handleContactClick = (
    type: "whatsapp" | "telegram",
    contact: string
  ) => {
    let url = "";
    if (type === "whatsapp") {
      url = `https://wa.me/${contact.replace(/\D/g, "")}`;
    } else if (type === "telegram") {
      url = `https://t.me/${contact.replace("@", "")}`;
    }
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleSelectHaircut = (haircut: Haircut) => {
    setSelectedHaircut(haircut);
    setIsHaircutSelectionModalOpen(false);
    setIsBookingModalOpen(true);
  };

  const CombIcon = ({ className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
    </svg>
  );

  if (loading) {
    return (
      <Layout openLoginModal={openLoginModal}>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34] mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </Layout>
    );
  }

  if (error || !barber) {
    return (
      <Layout openLoginModal={openLoginModal}>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 p-6 rounded-xl shadow-sm mb-6">
            <p className="text-red-700 text-lg font-medium">
              {error || "Барбер не найден"}
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-[#9A0F34] text-[#9A0F34] hover:bg-[#9A0F34] hover:text-white transition-colors"
          >
            Попробовать снова
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Back Arrow Button */}
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-[#9A0F34] hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl overflow-hidden p-6 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Avatar and Name */}
            <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
              <ImageWithFallback
                src={barber.avatar}
                alt={barber.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-gray-200 shadow-md mb-4"
              />
              <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {barber.name}
                </h1>
                <p className="text-gray-600 mt-3 text-sm sm:text-base leading-relaxed max-w-md">
                  {barber.description}
                </p>
                <div className="mt-3 flex items-center justify-center md:justify-start">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="ml-2 text-gray-600 text-sm">
                    {barber.rating.toFixed(1)} ({barber.reviewCount}{" "}
                    {t("reviews")})
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Information */}
            <div className="flex-1 w-full md:w-2/3 space-y-6">
              {/* Location and Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {t("location")}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {barber.location || "Не указано"}
                    </p>
                    {barber.offerHomeService && (
                      <p className="text-sm text-rose-600 font-semibold mt-2">
                        {t("Выезд на дом")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {t("workingHours")}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {barber.workingHours.from} – {barber.workingHours.to}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {barber.workingHours.days.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specializations and Book Now Button */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(barber.specialization?.length
                    ? barber.specialization
                    : ["Мужские стрижки"]
                  ).map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm font-medium shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                <Button
                  onClick={() => setIsHaircutSelectionModalOpen(true)}
                  className="bg-[#9A0F34] text-white hover:bg-[#7A0C2A] rounded-full px-3 py-1 text-sm sm:text-base shadow-md"
                >
                  {t("bookNow")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {["portfolio", "info", "reviews"].map((tab) => (
              <button
                key={tab}
                className={`px-4 sm:px-6 py-3 font-medium text-sm sm:text-base transition-all duration-200 ${
                  activeTab === tab
                    ? "border-b-2 border-[#9A0F34] text-[#9A0F34]"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#9A0F34] focus:ring-opacity-50`}
                onClick={() =>
                  setActiveTab(tab as "portfolio" | "info" | "reviews")
                }
              >
                {tab === "portfolio" && t("portfolio")}
                {tab === "info" && t("information")}
                {tab === "reviews" && (
                  <>
                    {t("reviews")} ({barber.reviewCount || 0})
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "portfolio" && (
            <div className="mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                {t("portfolio")}
              </h2>
              {barberHaircuts.length > 0 ? (
                <HaircutGrid
                  haircuts={barberHaircuts}
                  onBookClick={(haircut) => {
                    setSelectedHaircut(haircut);
                    setIsBookingModalOpen(true);
                  }}
                />
              ) : (
                <Card className="rounded-2xl shadow-sm bg-white border border-gray-100">
                  <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
                    <CombIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base lg:text-lg max-w-md mx-auto">
                      Этот барбер еще не добавил стрижки в свое портфолио.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "info" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                {t("information")}
              </h2>
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    {t("location")}
                  </h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {barber.location || "Не указано"}
                      </p>
                      {barber.offerHomeService && (
                        <div className="mt-3 text-rose-600 bg-rose-50 p-2 rounded-md inline-flex items-center text-sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          <span>{t("homeServiceAvailable")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    {t("workingHours")}
                  </h3>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {barber.workingHours.days.join(", ")}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {barber.workingHours.from} - {barber.workingHours.to}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    {t("contacts")}
                  </h3>
                  <div className="space-y-3">
                    {barber.whatsapp && (
                      <div
                        className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() =>
                          handleContactClick("whatsapp", barber.whatsapp || "")
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5 mr-2 text-green-500"
                        >
                          <path
                            fill="currentColor"
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                          />
                        </svg>
                        <span className="text-gray-800">
                          WhatsApp: {barber.whatsapp}
                        </span>
                      </div>
                    )}
                    {barber.telegram && (
                      <div
                        className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() =>
                          handleContactClick("telegram", barber.telegram || "")
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5 mr-2 text-blue-500"
                        >
                          <path
                            fill="currentColor"
                            d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
                          />
                        </svg>
                        <span className="text-gray-800">
                          Telegram: {barber.telegram}
                        </span>
                      </div>
                    )}
                    {!barber.whatsapp && !barber.telegram && (
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="text-gray-500 italic text-sm">
                          Контактные данные не указаны
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                {t("reviews")}
              </h2>
              <ReviewsList barberId={id || ""} canAddReview={true} />
            </div>
          )}
        </div>

        {/* Haircut Selection Modal */}
        <HaircutSelectionModal
          isOpen={isHaircutSelectionModalOpen}
          onClose={() => setIsHaircutSelectionModalOpen(false)}
          haircuts={barberHaircuts}
          onSelectHaircut={handleSelectHaircut}
        />

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          haircut={selectedHaircut}
          onConfirm={() => {}}
        />
      </div>
    </Layout>
  );
};

export default BarberProfilePage;
