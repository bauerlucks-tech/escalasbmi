import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, Clock, BarChart3, Activity, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { SupabaseAPI } from '@/lib/supabase';

interface AnalyticsData {
  monthlyStats: Array<{
    month: string;
    swaps: number;
    vacations: number;
    approvals: number;
    rejections: number;
  }>;
  operatorPerformance: Array<{
    name: string;
    shifts: number;
    swaps: number;
    vacations: number;
    efficiency: number;
  }>;
  workloadDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    productivity: number;
    satisfaction: number;
    workload: number;
  }>;
}

const AdvancedAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'swaps' | 'vacations' | 'performance'>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedMetric]);

  const getStartDateByRange = () => {
    const now = new Date();
    const start = new Date(now);

    if (dateRange === '7d') start.setDate(now.getDate() - 7);
    if (dateRange === '30d') start.setDate(now.getDate() - 30);
    if (dateRange === '90d') start.setDate(now.getDate() - 90);
    if (dateRange === '1y') start.setFullYear(now.getFullYear() - 1);

    return start;
  };

  const normalizeEntryDate = (value: string): Date | null => {
    if (!value) return null;

    if (value.includes('/')) {
      const [day, month, year] = value.split('/').map(Number);
      const parsed = new Date(year, month - 1, day);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [monthSchedules, swapRequests, vacationRequests] = await Promise.all([
        SupabaseAPI.getMonthSchedules(),
        SupabaseAPI.getSwapRequests(),
        SupabaseAPI.getVacationRequests(),
      ]);

      const startDate = getStartDateByRange();
      const monthLabel = (date: Date) =>
        date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').replace(/^./, (c) => c.toUpperCase());

      const monthlyMap = new Map<string, { month: string; swaps: number; vacations: number; approvals: number; rejections: number }>();

      const ensureMonth = (date: Date) => {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, {
            month: monthLabel(date),
            swaps: 0,
            vacations: 0,
            approvals: 0,
            rejections: 0,
          });
        }
        return monthlyMap.get(key)!;
      };

      const filteredSwaps = swapRequests.filter((item) => {
        const d = new Date(item.created_at);
        return !isNaN(d.getTime()) && d >= startDate;
      });

      filteredSwaps.forEach((swap) => {
        const d = new Date(swap.created_at);
        const month = ensureMonth(d);
        month.swaps += 1;
        if (swap.status === 'accepted' || swap.status === 'approved') month.approvals += 1;
        if (swap.status === 'rejected') month.rejections += 1;
      });

      const filteredVacations = vacationRequests.filter((item) => {
        const d = new Date(item.requested_at);
        return !isNaN(d.getTime()) && d >= startDate;
      });

      filteredVacations.forEach((vacation) => {
        const d = new Date(vacation.requested_at);
        const month = ensureMonth(d);
        month.vacations += 1;
        if (vacation.status === 'approved') month.approvals += 1;
        if (vacation.status === 'rejected') month.rejections += 1;
      });

      const operatorStats = new Map<string, { name: string; shifts: number; swaps: number; vacations: number; efficiency: number }>();

      const addOperator = (name: string) => {
        if (!operatorStats.has(name)) {
          operatorStats.set(name, { name, shifts: 0, swaps: 0, vacations: 0, efficiency: 0 });
        }
        return operatorStats.get(name)!;
      };

      monthSchedules.forEach((schedule) => {
        (schedule.entries || []).forEach((entry) => {
          const d = normalizeEntryDate(entry.date);
          if (!d || d < startDate) return;

          if (entry.meioPeriodo) addOperator(entry.meioPeriodo).shifts += 1;
          if (entry.fechamento) addOperator(entry.fechamento).shifts += 1;
        });
      });

      filteredSwaps.forEach((swap) => {
        addOperator(swap.requester_name || 'N/A').swaps += 1;
        addOperator(swap.target_name || 'N/A').swaps += 1;
      });

      filteredVacations.forEach((vacation) => {
        addOperator(vacation.operator_name || 'N/A').vacations += 1;
      });

      const operatorPerformance = Array.from(operatorStats.values())
        .filter((operator) => operator.name !== 'N/A')
        .map((operator) => {
          const penalty = operator.swaps * 1.5 + operator.vacations * 2;
          const baseline = operator.shifts > 0 ? 100 - penalty / Math.max(operator.shifts, 1) * 10 : 0;
          return {
            ...operator,
            efficiency: Math.max(0, Math.min(100, Math.round(baseline))),
          };
        })
        .sort((a, b) => b.shifts - a.shifts)
        .slice(0, 12);

      const shiftTotals = operatorPerformance.map((op) => op.shifts);
      const buckets = [
        { range: '0-10 dias', min: 0, max: 10 },
        { range: '11-20 dias', min: 11, max: 20 },
        { range: '21-30 dias', min: 21, max: 30 },
        { range: '31+ dias', min: 31, max: Number.MAX_SAFE_INTEGER },
      ];

      const workloadDistribution = buckets
        .map((bucket) => {
          const count = shiftTotals.filter((value) => value >= bucket.min && value <= bucket.max).length;
          const percentage = shiftTotals.length > 0 ? Math.round((count / shiftTotals.length) * 100) : 0;
          return { range: bucket.range, count, percentage };
        })
        .filter((item) => item.count > 0);

      const trends = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, month]) => {
          const demand = month.swaps + month.vacations;
          const approvalRate = demand > 0 ? (month.approvals / demand) * 100 : 100;
          return {
            date: month.month,
            productivity: Math.round(Math.max(0, Math.min(100, approvalRate))),
            satisfaction: Math.round(Math.max(0, Math.min(100, approvalRate - month.rejections * 2))),
            workload: Math.round(Math.max(0, Math.min(100, demand * 5))),
          };
        });

      let monthlyStats = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, month]) => month);

      if (selectedMetric !== 'all') {
        monthlyStats = monthlyStats.map((item) => ({
          ...item,
          swaps: selectedMetric === 'swaps' ? item.swaps : 0,
          vacations: selectedMetric === 'vacations' ? item.vacations : 0,
        }));
      }

      setData({
        monthlyStats,
        operatorPerformance,
        workloadDistribution,
        trends,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setData({
        monthlyStats: [],
        operatorPerformance: [],
        workloadDistribution: [],
        trends: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!data) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      selectedMetric,
      data
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Não foi possível carregar os dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Analytics Avançado</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {(['7d', '30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '90d' ? '90 dias' : '1 ano'}
              </button>
            ))}
          </div>

          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <option value="all">Todas Métricas</option>
            <option value="swaps">Trocas</option>
            <option value="vacations">Férias</option>
            <option value="performance">Performance</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Trocas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.monthlyStats.reduce((sum, m) => sum + m.swaps, 0)}
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                +12% vs período anterior
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Aprovação</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((data.monthlyStats.reduce((sum, m) => sum + m.approvals, 0) / 
                  data.monthlyStats.reduce((sum, m) => sum + m.swaps, 0)) * 100)}%
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                +5% vs período anterior
              </div>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Eficiência Média</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(data.operatorPerformance.reduce((sum, op) => sum + op.efficiency, 0) / data.operatorPerformance.length)}%
              </p>
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <TrendingDown className="w-3 h-3" />
                -2% vs período anterior
              </div>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dias de Férias</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.monthlyStats.reduce((sum, m) => sum + m.vacations, 0)}
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                +8% vs período anterior
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Tendências Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="swaps" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Trocas" />
              <Area type="monotone" dataKey="vacations" stackId="1" stroke="#10b981" fill="#10b981" name="Férias" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Operator Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Performance por Operador</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.operatorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="efficiency" fill="#8b5cf6" name="Eficiência %" />
              <Bar dataKey="swaps" fill="#f59e0b" name="Trocas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Workload Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Carga</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.workloadDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percentage }) => `${range}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.workloadDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Tendências de Produtividade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="productivity" stroke="#3b82f6" name="Produtividade" strokeWidth={2} />
              <Line type="monotone" dataKey="satisfaction" stroke="#10b981" name="Satisfação" strokeWidth={2} />
              <Line type="monotone" dataKey="workload" stroke="#f59e0b" name="Carga" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Performance Detalhada</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2">Operador</th>
                <th className="text-right p-2">Turnos</th>
                <th className="text-right p-2">Trocas</th>
                <th className="text-right p-2">Férias</th>
                <th className="text-right p-2">Eficiência</th>
                <th className="text-right p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.operatorPerformance.map((operator, index) => (
                <tr key={operator.name} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2 font-medium">{operator.name}</td>
                  <td className="text-right p-2">{operator.shifts}</td>
                  <td className="text-right p-2">{operator.swaps}</td>
                  <td className="text-right p-2">{operator.vacations}</td>
                  <td className="text-right p-2">{operator.efficiency}%</td>
                  <td className="text-right p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      operator.efficiency >= 90 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : operator.efficiency >= 80
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {operator.efficiency >= 90 ? 'Excelente' : operator.efficiency >= 80 ? 'Bom' : 'Regular'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
