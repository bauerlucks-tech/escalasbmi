import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { GripVertical, X, Plus, Minus, Maximize2, Settings, BarChart3, Users, Calendar, TrendingUp, Activity } from 'lucide-react';

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'table' | 'metric';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data?: any;
  config?: any;
}

interface WidgetLayout {
  widgets: Widget[];
  gridSize: { cols: number; rows: number };
  cellSize: { width: number; height: number };
}

const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'widget-1',
    type: 'stats',
    title: 'Usuários Ativos',
    size: 'small',
    position: { x: 0, y: 0 }
  },
  {
    id: 'widget-2',
    type: 'stats',
    title: 'Trocas Pendentes',
    size: 'small',
    position: { x: 1, y: 0 }
  },
  {
    id: 'widget-3',
    type: 'chart',
    title: 'Tendências',
    size: 'medium',
    position: { x: 0, y: 1 }
  },
  {
    id: 'widget-4',
    type: 'metric',
    title: 'Eficiência',
    size: 'large',
    position: { x: 2, y: 0 }
  }
];

const WidgetDashboard: React.FC = () => {
  const [layout, setLayout] = useState<WidgetLayout>({
    widgets: DEFAULT_WIDGETS,
    gridSize: { cols: 4, rows: 3 },
    cellSize: { width: 300, height: 200 }
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [savedLayouts, setSavedLayouts] = useState<string[]>([]);

  useEffect(() => {
    // Load saved layout from localStorage
    const saved = localStorage.getItem('widget_layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLayout(parsed);
      } catch (error) {
        console.error('Error loading layout:', error);
      }
    }

    // Load saved layouts list
    const layouts = localStorage.getItem('widget_layouts');
    if (layouts) {
      setSavedLayouts(JSON.parse(layouts));
    }
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !isEditMode) return;

    const items = Array.from(layout.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newLayout = { ...layout, widgets: items };
    setLayout(newLayout);
    saveLayout(newLayout);
  };

  const saveLayout = (currentLayout: WidgetLayout) => {
    localStorage.setItem('widget_layout', JSON.stringify(currentLayout));
  };

  const saveLayoutAs = (name: string) => {
    const layouts = [...savedLayouts, name];
    setSavedLayouts(layouts);
    localStorage.setItem('widget_layouts', JSON.stringify(layouts));
    localStorage.setItem(`widget_layout_${name}`, JSON.stringify(layout));
  };

  const loadLayout = (name: string) => {
    const saved = localStorage.getItem(`widget_layout_${name}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setLayout(parsed);
      saveLayout(parsed);
    }
  };

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: `Novo ${type}`,
      size: 'medium',
      position: { x: 0, y: layout.widgets.length }
    };

    const newLayout = {
      ...layout,
      widgets: [...layout.widgets, newWidget]
    };

    setLayout(newLayout);
    saveLayout(newLayout);
  };

  const removeWidget = (widgetId: string) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.filter(w => w.id !== widgetId)
    };

    setLayout(newLayout);
    saveLayout(newLayout);
    setSelectedWidget(null);
  };

  const resizeWidget = (widgetId: string, newSize: Widget['size']) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(w =>
        w.id === widgetId ? { ...w, size: newSize } : w
      )
    };

    setLayout(newLayout);
    saveLayout(newLayout);
  };

  const getWidgetSize = (size: Widget['size']) => {
    switch (size) {
      case 'small': return { cols: 1, rows: 1 };
      case 'medium': return { cols: 2, rows: 1 };
      case 'large': return { cols: 2, rows: 2 };
      default: return { cols: 1, rows: 1 };
    }
  };

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        return <StatsWidget widget={widget} />;
      case 'chart':
        return <ChartWidget widget={widget} />;
      case 'table':
        return <TableWidget widget={widget} />;
      case 'metric':
        return <MetricWidget widget={widget} />;
      default:
        return <div className="p-4 text-center text-gray-500">Widget não encontrado</div>;
    }
  };

  const getWidgetIcon = (type: Widget['type']) => {
    switch (type) {
      case 'stats': return <Users className="w-4 h-4" />;
      case 'chart': return <BarChart3 className="w-4 h-4" />;
      case 'table': return <Calendar className="w-4 h-4" />;
      case 'metric': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Dashboard Personalizável</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Layout Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) loadLayout(e.target.value);
            }}
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <option value="">Layout Padrão</option>
            {savedLayouts.map(layout => (
              <option key={layout} value={layout}>{layout}</option>
            ))}
          </select>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isEditMode
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isEditMode ? 'Salvar' : 'Editar'}
          </button>
        </div>
      </div>

      {/* Add Widget Bar (Edit Mode) */}
      {isEditMode && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Adicionar Widget:</span>
            <div className="flex gap-2">
              {(['stats', 'chart', 'table', 'metric'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => addWidget(type)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {getWidgetIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {layout.widgets.map((widget, index) => {
                const size = getWidgetSize(widget.size);
                const isSelected = selectedWidget === widget.id;

                return (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          relative bg-white dark:bg-gray-800 rounded-lg border 
                          ${isEditMode ? 'border-gray-300 dark:border-gray-600 cursor-move' : 'border-gray-200 dark:border-gray-700'}
                          ${isSelected ? 'ring-2 ring-primary' : ''}
                          ${snapshot.isDragging ? 'shadow-lg opacity-50' : 'shadow'}
                          transition-all duration-200
                        `}
                        style={{
                          ...provided.draggableProps.style,
                          gridColumn: `span ${size.cols}`,
                          gridRow: `span ${size.rows}`
                        }}
                        onClick={() => isEditMode && setSelectedWidget(isSelected ? null : widget.id)}
                      >
                        {/* Widget Header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            {isEditMode && <GripVertical className="w-4 h-4 text-gray-400" />}
                            {getWidgetIcon(widget.type)}
                            <h3 className="font-medium text-sm">{widget.title}</h3>
                          </div>

                          {isEditMode && (
                            <div className="flex items-center gap-1">
                              {/* Resize Controls */}
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resizeWidget(widget.id, 'small');
                                  }}
                                  className={`p-1 rounded ${
                                    widget.size === 'small' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700'
                                  }`}
                                  title="Pequeno"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resizeWidget(widget.id, 'medium');
                                  }}
                                  className={`p-1 rounded ${
                                    widget.size === 'medium' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700'
                                  }`}
                                  title="Médio"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resizeWidget(widget.id, 'large');
                                  }}
                                  className={`p-1 rounded ${
                                    widget.size === 'large' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700'
                                  }`}
                                  title="Grande"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeWidget(widget.id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title="Remover"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Widget Content */}
                        <div className="p-3">
                          {renderWidgetContent(widget)}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Save Layout Dialog */}
      {isEditMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Salvar Layout</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Salve sua configuração atual para usar depois
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do layout"
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg"
                id="layout-name"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('layout-name') as HTMLInputElement;
                  if (input.value) {
                    saveLayoutAs(input.value);
                    input.value = '';
                  }
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Widget Components
const StatsWidget: React.FC<{ widget: Widget }> = ({ widget }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setValue(Math.floor(Math.random() * 100));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
    </div>
  );
};

const ChartWidget: React.FC<{ widget: Widget }> = ({ widget }) => {
  return (
    <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded">
      <div className="text-center text-gray-500">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Gráfico</p>
      </div>
    </div>
  );
};

const TableWidget: React.FC<{ widget: Widget }> = ({ widget }) => {
  return (
    <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded">
      <div className="text-center text-gray-500">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Tabela</p>
      </div>
    </div>
  );
};

const MetricWidget: React.FC<{ widget: Widget }> = ({ widget }) => {
  return (
    <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded">
      <div className="text-center text-gray-500">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Métrica</p>
      </div>
    </div>
  );
};

export default WidgetDashboard;
