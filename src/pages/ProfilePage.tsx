import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Heart, LogOut, MapPin, MessageCircle, Scissors } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import BookingsList from '../components/booking/BookingsList';
import FavoritesList from '../components/favorites/FavoritesList';
import TelegramRegistration from '../components/profile/TelegramRegistration';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { profileAPI } from '../api/services';

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated, setUser, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'favorites'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    whatsapp: '',
    telegram: '',
    address: '',
    offers_home_service: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Эффект для обновления данных при загрузке компонента
  useEffect(() => {
    if (isAuthenticated && refreshUserData) {
      refreshUserData();
    }
  }, [isAuthenticated, refreshUserData]);

  // Инициализация данных формы из данных пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        whatsapp: user.profile?.whatsapp || '',
        telegram: user.profile?.telegram || '',
        address: user.profile?.address || '',
        offers_home_service: user.profile?.offers_home_service || false
      });
    }
  }, [user]);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Проверяем, авторизован ли пользователь
      if (!user || !isAuthenticated) {
        setError('Необходимо войти в систему для обновления профиля');
        setIsSubmitting(false);
        return;
      }

      // Данные для обновления пользовательской информации
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      // Данные для обновления профиля
      const profileData = {
        whatsapp: formData.whatsapp,
        telegram: formData.telegram,
        address: formData.address,
        offers_home_service: formData.offers_home_service
      };

      // Проверка наличия токена перед запросом
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Учетные данные не были предоставлены. Пожалуйста, войдите в систему заново.');
        setIsSubmitting(false);
        return;
      }

      // Обновляем данные пользователя
      await profileAPI.updateUserInfo(userData);

      // Обновляем данные профиля
      await profileAPI.updateProfile(profileData);

      // Обновляем данные пользователя
      if (refreshUserData) {
        await refreshUserData();
      }

      setSuccess('Данные профиля успешно обновлены');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      let errorMessage = 'Произошла ошибка при обновлении профиля';

      if (err.response?.status === 401) {
        errorMessage = 'Учетные данные не были предоставлены. Пожалуйста, войдите в систему заново.';
        // Если 401, перенаправляем на страницу входа
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data) {
        const errorsArray = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');
        errorMessage = errorsArray || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
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
                    {!isEditing && (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        {t('editProfile')}
                      </Button>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 p-4 rounded-md mb-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 p-4 rounded-md mb-4">
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  )}

                  <Card>
                    <CardContent>
                      {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Имя
                              </label>
                              <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Фамилия
                              </label>
                              <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              disabled
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Email нельзя изменить
                            </p>
                          </div>

                          {/* Замена поля телефона на Telegram и WhatsApp */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Telegram профиль
                            </label>
                            <div className="relative">
                              <MessageCircle className="absolute top-2.5 left-3 h-5 w-5 text-blue-400" />
                              <input
                                type="text"
                                name="telegram"
                                value={formData.telegram}
                                onChange={handleChange}
                                placeholder="Username (без @)"
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              На этот профиль будут отправляться уведомления о бронированиях
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              WhatsApp номер
                            </label>
                            <div className="relative">
                              <svg viewBox="0 0 24 24" className="absolute top-2.5 left-3 h-5 w-5 text-green-500">
                                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              </svg>
                              <input
                                type="text"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="+996 XXX XXX XXX"
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              WhatsApp номер для связи с клиентами
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Адрес барбершопа
                            </label>
                            <div className="relative">
                              <MapPin className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Например: Бишкек, ул. Киевская 95"
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="offers_home_service"
                              name="offers_home_service"
                              checked={formData.offers_home_service}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                            />
                            <label htmlFor="offers_home_service" className="ml-2 block text-sm text-gray-900">
                              Предлагаю услуги на выезде
                            </label>
                          </div>

                          <div className="flex space-x-3 pt-4">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isSubmitting}
                              className="relative"
                            >
                              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              disabled={isSubmitting}
                            >
                              Отмена
                            </Button>
                          </div>
                        </form>
                      ) : (
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

                          {/* Отображение Telegram */}
                          <div className="border-b pb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                              Telegram
                            </label>
                            <p className="text-gray-900">
                              {user.profile?.telegram ? (

                                  href={`https://t.me/${user.profile.telegram}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center"
                                >
                                  @{user.profile.telegram}
                                  <svg
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ) : (
                                'Не указан'
                              )}
                            </p>
                          </div>

                          {/* Отображение WhatsApp */}
                          <div className="border-b pb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1 text-green-500">
                                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              </svg>
                              WhatsApp
                            </label>
                            <p className="text-gray-900">
                              {user.profile?.whatsapp ? (

                                  href={`https://wa.me/${user.profile.whatsapp.replace(/\s+/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline flex items-center"
                                >
                                  {user.profile.whatsapp}
                                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              ) : (
                                'Не указан'
                              )}
                            </p>
                          </div>

                          <div className="border-b pb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              Адрес барбершопа
                            </label>
                            <p className="text-gray-900">{user.profile?.address || 'Не указан'}</p>
                            {user.profile?.offers_home_service && (
                              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Выезд на дом
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Добавляем кнопку для барберов, чтобы добавить услугу */}
                  {user.profile?.user_type === 'barber' && (
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={() => navigate('/add-service')}
                        className="flex items-center"
                      >
                        <Scissors className="h-4 w-4 mr-2" />
                        Добавить услугу
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">{t('myBookings')}</h3>
                  <BookingsList />
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