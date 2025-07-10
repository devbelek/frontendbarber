import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, User, Clock, Search, X, Filter } from "lucide-react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import { useLanguage } from "../context/LanguageContext";
import { useLocation } from "../context/LocationContext";
import { profileAPI } from "../api/services";

interface BarberListPageProps {
  openLoginModal: () => void;
}

const BarberListPage: React.FC<BarberListPageProps> = ({ openLoginModal }) => {
  const { t } = useLanguage();
  const { currentRegion } = useLocation();
  const [allBarbers, setAllBarbers] = useState([]);
  const [filteredBarbers, setFilteredBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState("all");

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    filterBarbers();
  }, [allBarbers, searchQuery, regionFilter, currentRegion]);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(t("fetchingBarbers")); // Placeholder for logging translation
      const response = await profileAPI.getAllBarbers();
      console.log(t("barbersApiResponse"), response); // Placeholder for logging translation

      if (response && response.data) {
        let barbersData = [];

        if (response.data.results && Array.isArray(response.data.results)) {
          barbersData = response.data.results;
        } else if (Array.isArray(response.data)) {
          barbersData = response.data;
        }

        console.log(t("processedBarbersData"), barbersData); // Placeholder for logging translation

        if (barbersData.length > 0) {
          setAllBarbers(barbersData);
        } else {
          setError(t("noRegisteredBarbers"));
        }
      } else {
        setAllBarbers([]);
        setError(t("failedToFetchBarbers"));
      }
    } catch (err) {
      console.error(t("barbersLoadingError"), err);
      setError(t("barbersLoadingError"));
      setAllBarbers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBarbers = () => {
    let filtered = [...allBarbers];

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((barber) => {
        const fullName = getFullName(barber).toLowerCase();
        const address = (barber.profile?.address || "").toLowerCase();
        const bio = (barber.profile?.bio || "").toLowerCase();

        return (
          fullName.includes(query) ||
          address.includes(query) ||
          bio.includes(query)
        );
      });
    }

    // Фильтрация по региону
    if (regionFilter === "current") {
      const regionName = currentRegion.name.toLowerCase();
      filtered = filtered.filter((barber) => {
        const barberAddress = (barber.profile?.address || "").toLowerCase();
        return barberAddress.includes(regionName);
      });
    }

    setFilteredBarbers(filtered);
  };

  const getFullName = (barber) => {
    if (barber.first_name || barber.last_name) {
      return `${barber.first_name || ""} ${barber.last_name || ""}`.trim();
    }
    return barber.username;
  };

  const handleSearch = () => {
    filterBarbers();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRegionFilter("all");
  };

  return (
    <Layout openLoginModal={openLoginModal}>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок и поиск */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{t("barbers")}</h1>

          {/* Десктопный поиск */}
          <div className="hidden md:flex items-center gap-4 mb-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchBarbersPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-2.5"
                  onClick={handleClearSearch}
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} variant="primary">
              {t("search")}
            </Button>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
            >
              <option value="all">{t("allRegions")}</option>
              <option value="current">
                {t("myRegion")} ({currentRegion.name})
              </option>
            </select>
            {(searchQuery || regionFilter !== "all") && (
              <Button onClick={resetFilters} variant="outline">
                {t("clearFilters")}
              </Button>
            )}
          </div>

          {/* Мобильный поиск */}
          <div className="md:hidden">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("searchBarbersPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A0F34] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-2.5"
                    onClick={handleClearSearch}
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

          {/* Информация о результатах */}
          <div className="text-sm text-gray-600 mb-4">
            {regionFilter === "current" ? (
              <p>
                {t("regionLabel")}
                <span className="font-medium">{currentRegion.name}</span>
                {filteredBarbers.length === 0 && allBarbers.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({t("noBarbersInRegion")})
                  </span>
                )}
              </p>
            ) : (
              <p>{t("allBarbersShown")}</p>
            )}
            {searchQuery && (
              <p className="mt-1">
                {t("searchResultsFor")}
                <span className="font-medium">"{searchQuery}"</span>
              </p>
            )}
            <p className="mt-1 font-medium">
              {t("foundLabel")} {filteredBarbers.length}{" "}
              {filteredBarbers.length === 1
                ? t("barberSingular")
                : t("barberPlural")}
            </p>
          </div>
        </div>

        {/* Список барберов */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-lg shadow h-80"
              >
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {t("tryAgain")}
            </Button>
          </div>
        ) : filteredBarbers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBarbers.map((barber) => (
              <Card
                key={barber.id}
                className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {barber.profile?.photo ? (
                      <ImageWithFallback
                        src={barber.profile.photo}
                        alt={getFullName(barber)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">
                    {getFullName(barber)}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span>
                      {barber.profile?.address || t("locationNotSpecified")}
                    </span>
                  </div>

                  {barber.profile?.working_hours_from &&
                    barber.profile?.working_hours_to && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {barber.profile.working_hours_from} -{" "}
                          {barber.profile.working_hours_to}
                        </span>
                      </div>
                    )}

                  {barber.profile?.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {barber.profile.bio}
                    </p>
                  )}

                  <Link to={`/barber/${barber.id}`}>
                    <Button variant="outline" fullWidth>
                      {t("viewProfile")}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("barbersNotFound")}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? (
                <>{t("noResultsForQuery", { searchQuery })} </>
              ) : regionFilter === "current" ? (
                <>
                  {t("noBarbersInRegionSpecific", {
                    currentRegion: currentRegion.name,
                  })}{" "}
                </>
              ) : (
                t("barbersNotFound")
              )}
              {t("tryChangingFilters")}
            </p>
            <Button onClick={resetFilters} variant="primary">
              {t("clearFilters")}
            </Button>
          </div>
        )}

        {/* Мобильная панель фильтров */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t("filters")}</h3>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">{t("regionLabel")}</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="region"
                      value="all"
                      checked={regionFilter === "all"}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="mr-2"
                    />
                    <span>{t("allRegions")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="region"
                      value="current"
                      checked={regionFilter === "current"}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="mr-2"
                    />
                    <span>
                      {t("myRegion")} ({currentRegion.name})
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  className="w-full py-2 bg-gray-200 rounded-lg"
                  onClick={resetFilters}
                >
                  {t("clearFilters")}
                </button>
                <button
                  className="w-full py-2 bg-[#9A0F34] text-white rounded-lg"
                  onClick={() => {
                    setIsFilterOpen(false);
                    handleSearch();
                  }}
                >
                  {t("apply")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BarberListPage;
