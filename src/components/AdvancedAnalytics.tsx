import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, Clock, BarChart3, Activity, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';

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

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real app, this would fetch from backend
      const mockData: AnalyticsData = {
        monthlyStats: [
          { month: 'Jan', swaps: 45, vacations: 12, approvals: 38, rejections: 7 },
          { month: 'Fev', swaps: 52, vacations: 15, approvals: 44, rejections: 8 },
          { month: 'Mar', swaps: 38, vacations: 18, approvals: 35, rejections: 3 },
          { month: 'Abr', swaps: 61, vacations: 10, approvals: 55, rejections: 6 },
          { month: 'Mai', swaps: 48, vacations: 22, approvals: 42, rejections: 6 },
          { month: 'Jun', swaps: 55, vacations: 14, approvals: 48, rejections: 7 },
        ],
        operatorPerformance: [
          { name: 'LUCAS', shifts: 45, swaps: 8, vacations: 2, efficiency: 92 },
          { name: 'CARLOS', shifts: 42, swaps: 6, vacations: 3, efficiency: 88 },
          { name: 'ROSANA', shifts: 48, swaps: 10, vacations: 1, efficiency: 95 },
          { name: 'HENRIQUE', shifts: 44, swaps: 7, vacations: 2, efficiency: 90 },
          { name: 'KELLY', shifts: 46, swaps: 9, vacations: 2, efficiency: 93 },
          { name: 'GUILHERME', shifts: 43, swaps: 5, vacations: 3, efficiency: 87 },
        ],
        workloadDistribution: [
          { range: '0-10 dias', count: 2, percentage: 33 },
          { range: '11-15 dias', count: 3, percentage: 50 },
          { range: '16-20 dias', count: 1, percentage: 17 },
        ],
        trends: [
          { date: '01/01', productivity: 85, satisfaction: 88, workload: 75 },
          { date: '08/01', productivity: 88, satisfaction: 90, workload: 78 },
          { date: '15/01', productivity: 92, satisfaction: 92, workload: 82 },
          { date: '22/01', productivity: 87, satisfaction: 89, workload: 76 },
          { date: '29/01', productivity: 90, satisfaction: 91, workload: 80 },
          { date: '05/02', productivity: 93, satisfaction: 93, workload: 85 },
          { date: '12/02', productivity: 91, satisfaction: 92, workload: 83 },
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
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
