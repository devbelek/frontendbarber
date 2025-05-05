import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Heart, LogOut, MapPin, Phone, MessageCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { profileAPI } from '../api/services';

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'favorites'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    telegram: '',
    offers_home_service: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Инициализация данных формы из данных пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        telegram: user.profile?.telegram || '',
        offers_home_service: user.profile?.offers_home_service || false
      });
    }
  }, [user]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
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
      // Данные для обновления пользовательской информации
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      // Данные для обновления профиля
      const profileData = {
        phone: formData.phone,
        address: formData.address,
        telegram: formData.telegram,
        offers_home_service: formData.offers_home_service
      };

      // Обновляем данные пользователя
      await profileAPI.updateUserInfo(userData);

      // Обновляем данные профиля
      await profileAPI.updateProfile(profileData);

      setSuccess('Данные профиля успешно обновлены');
      setIsEditing(false);

      // Обновляем страницу для получения обновленных данных
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.detail || 'Произошла ошибка при обновлении профиля');
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

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Телефон
                            </label>
                            <div className="relative">
                              <Phone className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+996 XXX XXX XXX"
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                              />
                            </div>
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
                                placeholder="Например: username без @"
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              На этот профиль будут отправляться уведомления о заказах
                            </p>
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

                          <div className="border-b pb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              Телефон
                            </label>
                            <p className="text-gray-900">{user.profile?.phone || 'Не указан'}</p>
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

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Telegram для уведомлений
                            </label>
                            <p className="text-gray-900">
                              {user.profile?.telegram ? (
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
                              ) : (
                                'Не указан'
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">{t('myBookings')}</h3>
                  <Card>
                    <CardContent className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        У вас пока нет бронирований
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">{t('favorites')}</h3>
                  <Card>
                    <CardContent className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        У вас пока нет избранных стрижек
                      </p>
                    </CardContent>
                  </Card>
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