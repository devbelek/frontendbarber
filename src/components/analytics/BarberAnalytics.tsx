import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Calendar, DollarSign, Users, Star } from 'lucide-react';
import Card from '../ui/Card';
import { bookingsAPI, servicesAPI } from '../../api/services';

const BarberAnalytics = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalViews: 0,
    popularServices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Получаем статистику бронирований
      const bookingsStats = await bookingsAPI.statistics();

      // Получаем статистику по услугам
      const servicesResponse = await servicesAPI.getAll({ barber: 'me' });

      const totalViews = servicesResponse.data.reduce((sum, service) => sum + service.views, 0);

      setStats({
        totalBookings: bookingsStats.data.total,
        completedBookings: bookingsStats.data.completed,
        totalRevenue: bookingsStats.data.totalRevenue || 0,
        avgRating: bookingsStats.data.avgRating || 0,
        totalViews: totalViews,
        popularServices: bookingsStats.data.by_service || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, trend, color }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-green-500 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{trend}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-gray-600">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Аналитика</h2>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          title="Всего бронирований"
          value={stats.totalBookings}
          color="bg-blue-500"
        />
        <StatCard
          icon={DollarSign}
          title="Общий доход"
          value={`${stats.totalRevenue} сом`}
          color="bg-green-500"
        />
        <StatCard
          icon={Eye}
          title="Просмотры услуг"
          value={stats.totalViews}
          color="bg-purple-500"
        />
        <StatCard
          icon={Star}
          title="Средний рейтинг"
          value={stats.avgRating.toFixed(1)}
          color="bg-yellow-500"
        />
      </div>

      {/* Популярные услуги */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Популярные услуги</h3>
        <div className="space-y-3">
          {stats.popularServices.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{service.service__title}</p>
                <p className="text-sm text-gray-500">{service.count} бронирований</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#9A0F34]">
                  {((service.count / stats.totalBookings) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* График доходов */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Доходы за последние 30 дней</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>График в разработке</p>
        </div>
      </Card>
    </div>
  );
};

export default BarberAnalytics;