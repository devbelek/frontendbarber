import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Heart, Settings, LogOut } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'favorites'>('info');

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                  {user.profile?.photo ? (
                    <img
                      src={user.profile.photo}
                      alt={user.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-500" />
                  )}
                </div>
                <h2 className="text-xl font-bold">{user.first_name} {user.last_name}</h2>
                <p className="text-gray-600">{user.email}</p>

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
                    className="flex items-center w-full mb-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    {t('settings')}
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
                  <h3 className="text-xl font-bold mb-4">{t('personalInfo')}</h3>
                  <Card>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
                          <p className="mt-1">{user.first_name} {user.last_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                          <p className="mt-1">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">{t('phone')}</label>
                          <p className="mt-1">{user.profile?.phone || '-'}</p>
                        </div>
                        <Button variant="outline">{t('editProfile')}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">{t('myBookings')}</h3>
                  <Card>
                    <CardContent className="text-center py-12">
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