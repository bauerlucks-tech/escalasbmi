import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSwaps: number;
  pendingSwaps: number;
  totalVacations: number;
  pendingVacations: number;
  monthlyWorkDays: number;
  averageWorkload: number;
}

const ReportsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSwaps: 0,
    pendingSwaps: 0,
    totalVacations: 0,
    pendingVacations: 0,
    monthlyWorkDays: 0,
    averageWorkload: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get data from Supabase
        const dashboardStats = await SupabaseAPI.getDashboardStats();
        
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color = 'blue' }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Dashboard de Relatórios</h2>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Total Usuários" value={stats.totalUsers} color="blue" />
        <StatCard icon={Users} title="Usuários Ativos" value={stats.activeUsers} color="green" />
        <StatCard icon={Calendar} title="Dias no Mês" value={stats.monthlyWorkDays} color="purple" />
        <StatCard icon={Clock} title="Carga Média" value={`${stats.averageWorkload} dias`} color="orange" />
      </div>

      {/* Swap Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={TrendingUp} title="Total Trocas" value={stats.totalSwaps} color="blue" />
        <StatCard icon={Clock} title="Trocas Pendentes" value={stats.pendingSwaps} color="yellow" />
      </div>

      {/* Vacation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={Calendar} title="Total Férias" value={stats.totalVacations} color="green" />
        <StatCard icon={Clock} title="Férias Pendentes" value={stats.pendingVacations} color="orange" />
      </div>

      {/* Quick Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Insights Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">Taxa de Aprovação de Trocas</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalSwaps > 0 ? Math.round(((stats.totalSwaps - stats.pendingSwaps) / stats.totalSwaps) * 100) : 0}%
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Taxa de Aprovação de Férias</p>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">
              {stats.totalVacations > 0 ? Math.round(((stats.totalVacations - stats.pendingVacations) / stats.totalVacations) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
