import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Heart, LogOut, MessageCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { profileAPI, bookingsAPI } from '../api/services';
import TelegramRegistration from '../components/profile/TelegramRegistration';
import BookingsList from '../components/booking/BookingsList';
import FavoritesList from '../components/favorites/FavoritesList';

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'favorites'>('info');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Проверяем аутентификацию
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      // Загружаем бронирования, если пользователь авторизован
      loadBookings();
    }
  }, [isAuthenticated, navigate]);

  // Загрузка бронирований пользователя
  const loadBookings = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await bookingsAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout openLoginModal={() => {}}>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg">Пожалуйста, войдите в систему, чтобы просмотреть профиль</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout openLoginModal={() => {}}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 border-r border-gray-200">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                  {user.profile?.photo || user.picture ? (
                    <img
                      src={user.profile?.photo || user.picture}
                      alt={user.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-500" />
                  )}
                </div>
                <h2 className="text-xl font-bold">{user.first_name} {user.last_name}</h2>
                <p className="text-gray-600">{user.email}</p>
                {user.profile?.user_type === 'barber' && (
                  <div className="mt-2 px-3 py-1 bg-[#9A0F34]/10 text-[#9A0F34] rounded-full text-sm">
                    Барбер
                  </div>
                )}

                <div className="mt-6 w-full">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center w-full mb-2 p-3 rounded-md text-left ${
                      activeTab === 'info' ? 'bg-gray-100 text-[#9A0F34]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    {t('personalInfo')}
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`flex items-center w-full mb-2 p-3 rounded-md text-left ${
                      activeTab === 'bookings' ? 'bg-gray-100 text-[#9A0F34]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="h-5 w-5 mr-3" />
                    {t('myBookings')}
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`flex items-center w-full mb-2 p-3 rounded-md text-left ${
                      activeTab === 'favorites' ? 'bg-gray-100 text-[#9A0F34]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    {t('favorites')}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="flex items-center w-full mt-4 p-3 rounded-md text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 md:w-2/3">
              {activeTab === 'info' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{t('personalInfo')}</h3>
                  </div>

                  <Card>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-b pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Имя и фамилия
                          </label>
                          <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                        </div>

                        <div className="border-b pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>

                        {user.profile?.user_type === 'barber' && (
                          <TelegramRegistration />
                        )}

                        {user.profile?.telegram && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Telegram для уведомлений
                            </label>
                            <p className="text-gray-900">
                              <a
                                href={`https://t.me/${user.profile.telegram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                @{user.profile.telegram}
                                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">{t('myBookings')}</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Загрузка бронирований...</p>
                    </div>
                  ) : (
                    <BookingsList bookings={bookings} onStatusChange={loadBookings} />
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">{t('favorites')}</h3>
                  <FavoritesList />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;