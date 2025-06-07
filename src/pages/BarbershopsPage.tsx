import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Users,
  Search,
  X,
  MessageCircle,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { barbershopsAPI } from "../api/barbershops";
import { Barbershop } from "../types";

// Константы
const DEFAULT_LOGO = "/images/barbershop-logo.webp";

const BarbershopsPage = ({
  openLoginModal,
}: {
  openLoginModal: () => void;
}) => {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async () => {
    try {
      setLoading(true);
      const response = await barbershopsAPI.getAll({ page: 1, limit: 12 });
      setBarbershops(response.data.results || []);
    } catch (error) {
      console.error("Error fetching barbershops:", error);
      setBarbershops([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarbershops = barbershops.filter(
    (shop) =>
      (shop.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (shop.address?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleClearSearch = () => setSearchQuery("");

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero секция */}
        <div className="bg-gradient-to-r from-[#9A0F34] to-[#7b0c29] text-white py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Барбершопы Бишкека
            </h1>
            <p className="text-sm sm:text-base opacity-90">
              Найдите лучший барбершоп рядом с вами
            </p>
          </div>
        </div>

        {/* Поиск */}
        <div className="container mx-auto px-4 -mt-6 sm:-mt-8">
          <div className="bg-white rounded-lg p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск барбершопов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                aria-label="Поиск барбершопов"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                  aria-label="Очистить поиск"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Список барбершопов */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg p-4">
                    <div className="h-36 sm:h-48 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBarbershops.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Барбершопы не найдены
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Попробуйте изменить параметры поиска
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="border-[#9A0F34] text-[#9A0F34] px-4 py-2 rounded-md text-xs sm:text-sm"
                  onClick={handleClearSearch}
                >
                  Сбросить поиск
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredBarbershops.map((shop) => (
                <Card key={shop.id} className="overflow-hidden">
                  <div className="relative h-36 sm:h-48">
                    <img
                      src={shop.logo || DEFAULT_LOGO}
                      alt={shop.name || "Барбершоп"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {shop.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        ✓ Проверено
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold mb-2 truncate">
                      {shop.name || "Без названия"}
                    </h3>
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium text-xs sm:text-sm">
                        {(shop.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-gray-500 ml-1 text-xs">
                        ({shop.reviewCount || 0} отзывов)
                      </span>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-3.5 w-3.5 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="truncate">
                          {shop.address || "Не указано"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-2" />
                        <span>
                          {shop.workingHours?.from && shop.workingHours?.to
                            ? `${shop.workingHours.from} - ${shop.workingHours.to}`
                            : "Не указано"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-2" />
                        <span>{shop.phone || "Не указано"}</span>
                      </div>
                      {shop.whatsapp && (
                        <div className="flex items-center">
                          <MessageCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                          <a
                            href={`https://wa.me/${shop.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 truncate"
                            aria-label="Связаться через WhatsApp"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-xs sm:text-sm">
                        <Users className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span className="text-gray-600">
                          {shop.barbers?.length || 0} барберов
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/barbershops/${shop.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="border-[#9A0F34] text-[#9A0F34] w-full text-xs sm:text-sm"
                        >
                          Подробнее
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BarbershopsPage;
