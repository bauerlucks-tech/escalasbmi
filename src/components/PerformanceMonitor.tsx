import React, { useState, useEffect } from 'react';
import { Zap, Clock, Database, Cloud, Smartphone, Monitor, Activity, TrendingUp } from 'lucide-react';

interface PerformanceMetrics {
  pageLoad: number;
  apiResponse: number;
  cacheHitRate: number;
  bundleSize: string;
  memoryUsage: number;
  renderTime: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoad: 0,
    apiResponse: 0,
    cacheHitRate: 0,
    bundleSize: '0 KB',
    memoryUsage: 0,
    renderTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    measurePerformance();
    setupPerformanceObserver();
  }, []);

  const measurePerformance = () => {
    // Measure page load time
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;

    // Measure API response time (simulated)
    const apiResponseTime = Math.random() * 500 + 100;

    // Calculate cache hit rate (simulated)
    const cacheHitRate = Math.random() * 30 + 70;

    // Get bundle size (simulated)
    const bundleSize = (Math.random() * 500 + 200).toFixed(0) + ' KB';

    // Measure memory usage
    const memoryUsage = (performance as any).memory ? 
      ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2) : 
      'N/A';

    // Measure render time
    const renderTime = performance.now();

    setMetrics({
      pageLoad: Math.round(pageLoadTime),
      apiResponse: Math.round(apiResponseTime),
      cacheHitRate: Math.round(cacheHitRate),
      bundleSize,
      memoryUsage: typeof memoryUsage === 'string' ? parseFloat(memoryUsage) : memoryUsage,
      renderTime: Math.round(renderTime)
    });

    setLoading(false);
  };

  const setupPerformanceObserver = () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  };

  const optimizePerformance = () => {
    setIsOptimized(true);
    
    // Simulate optimization
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        pageLoad: Math.round(prev.pageLoad * 0.7),
        apiResponse: Math.round(prev.apiResponse * 0.6),
        cacheHitRate: Math.min(95, prev.cacheHitRate + 15),
        renderTime: Math.round(prev.renderTime * 0.5)
      }));
      setIsOptimized(false);
    }, 2000);
  };

  const getPerformanceGrade = (value: number, type: string) => {
    const thresholds = {
      pageLoad: { excellent: 1000, good: 2000, poor: 3000 },
      apiResponse: { excellent: 200, good: 500, poor: 1000 },
      cacheHitRate: { excellent: 90, good: 70, poor: 50 },
      renderTime: { excellent: 100, good: 300, poor: 500 }
    };

    const threshold = thresholds[type as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (type === 'cacheHitRate') {
      if (value >= threshold.excellent) return 'excellent';
      if (value >= threshold.good) return 'good';
      return 'poor';
    } else {
      if (value <= threshold.excellent) return 'excellent';
      if (value <= threshold.good) return 'good';
      return 'poor';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'good': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'excellent': return <TrendingUp className="w-4 h-4" />;
      case 'good': return <Activity className="w-4 h-4" />;
      case 'poor': return <Clock className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Monitor de Performance</h2>
        </div>

        <button
          onClick={optimizePerformance}
          disabled={isOptimized}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isOptimized ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Otimizando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Otimizar Agora
            </>
          )}
        </button>
      </div>

      {/* Performance Score */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Score de Performance</h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {Math.round(
                  (getPerformanceGrade(metrics.pageLoad, 'pageLoad') === 'excellent' ? 25 : 0) +
                  (getPerformanceGrade(metrics.apiResponse, 'apiResponse') === 'excellent' ? 25 : 0) +
                  (getPerformanceGrade(metrics.cacheHitRate, 'cacheHitRate') === 'excellent' ? 25 : 0) +
                  (getPerformanceGrade(metrics.renderTime, 'renderTime') === 'excellent' ? 25 : 0)
                )}
              </div>
              <div className="text-sm opacity-90">
                <div>Excelente: 90-100</div>
                <div>Bom: 70-89</div>
                <div>Precisa melhorar: &lt;70</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Última verificação</div>
            <div className="text-lg">{new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Page Load Time */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Tempo de Carregamento</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(metrics.pageLoad, 'pageLoad'))}`}>
              {getPerformanceGrade(metrics.pageLoad, 'pageLoad') === 'excellent' ? 'Excelente' : 
               getPerformanceGrade(metrics.pageLoad, 'pageLoad') === 'good' ? 'Bom' : 'Precisa melhorar'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics.pageLoad}ms
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {metrics.pageLoad <= 1000 ? 'Excelente' : metrics.pageLoad <= 2000 ? 'Bom' : 'Precisa otimizar'}
          </div>
        </div>

        {/* API Response Time */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-green-600" />
              <span className="font-medium">Tempo de Resposta API</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(metrics.apiResponse, 'apiResponse'))}`}>
              {getPerformanceGrade(metrics.apiResponse, 'apiResponse') === 'excellent' ? 'Excelente' : 
               getPerformanceGrade(metrics.apiResponse, 'apiResponse') === 'good' ? 'Bom' : 'Precisa melhorar'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics.apiResponse}ms
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Média das requisições
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Taxa de Cache</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(metrics.cacheHitRate, 'cacheHitRate'))}`}>
              {getPerformanceGrade(metrics.cacheHitRate, 'cacheHitRate') === 'excellent' ? 'Excelente' : 
               getPerformanceGrade(metrics.cacheHitRate, 'cacheHitRate') === 'good' ? 'Bom' : 'Precisa melhorar'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics.cacheHitRate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Hits / Total requests
          </div>
        </div>

        {/* Bundle Size */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Tamanho do Bundle</span>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              Bom
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics.bundleSize}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            JavaScript total
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-red-600" />
              <span className="font-medium">Uso de Memória</span>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Normal
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics.memoryUsage} MB
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Heap usado
          </div>
        </div>

        {/* Render Time */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Tempo de Render</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getPerformanceGrade(metrics.renderTime, 'renderTime'))}`}>
              {getPerformanceGrade(metrics.renderTime, 'renderTime') === 'excellent' ? 'Excelente' : 
               getPerformanceGrade(metrics.renderTime, 'renderTime') === 'good' ? 'Bom' : 'Precisa melhorar'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics.renderTime}ms
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Primeiro paint
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Sugestões de Otimização</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Lazy Loading</span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Carregue componentes apenas quando necessários para reduzir o bundle inicial.
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900 dark:text-green-100">Cache Inteligente</span>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200">
              Implemente cache Redis para dados frequentemente acessados.
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900 dark:text-purple-100">API Optimization</span>
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Use batching e compressão para reduzir o tempo de resposta.
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-900 dark:text-orange-100">Bundle Splitting</span>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Divida o bundle em chunks menores para carregamento paralelo.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Monitor */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Monitor em Tempo Real</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm font-medium">Status do Sistema</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs">
              Operacional
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm font-medium">Servidor</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs">
              Online
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm font-medium">Última Otimização</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
