import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Minus, X, Check, AlertCircle, Info, Zap, Sparkles } from 'lucide-react';

interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
}

interface MicroInteraction {
  type: 'hover' | 'click' | 'focus' | 'load';
  element: string;
  animation: AnimationConfig;
}

const AnimationEngine: React.FC = () => {
  const [animations, setAnimations] = useState<MicroInteraction[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<MicroInteraction | null>(null);
  const [customAnimation, setCustomAnimation] = useState<AnimationConfig>({
    duration: 0.3,
    easing: 'ease-in-out',
    delay: 0
  });

  useEffect(() => {
    // Load default animations
    const defaultAnimations: MicroInteraction[] = [
      {
        type: 'hover',
        element: '.btn-primary',
        animation: { duration: 0.2, easing: 'ease-out', delay: 0 }
      },
      {
        type: 'click',
        element: '.card',
        animation: { duration: 0.15, easing: 'ease-in-out', delay: 0 }
      },
      {
        type: 'focus',
        element: '.input-field',
        animation: { duration: 0.3, easing: 'ease-out', delay: 0 }
      },
      {
        type: 'load',
        element: '.fade-in',
        animation: { duration: 0.5, easing: 'ease-out', delay: 0.1 }
      }
    ];

    setAnimations(defaultAnimations);
  }, []);

  const addAnimation = (type: MicroInteraction['type']) => {
    const newAnimation: MicroInteraction = {
      type,
      element: `.element-${animations.length + 1}`,
      animation: { ...customAnimation }
    };

    setAnimations([...animations, newAnimation]);
  };

  const removeAnimation = (index: number) => {
    setAnimations(animations.filter((_, i) => i !== index));
  };

  const updateAnimation = (index: number, updates: Partial<MicroInteraction>) => {
    const newAnimations = [...animations];
    newAnimations[index] = { ...newAnimations[index], ...updates };
    setAnimations(newAnimations);
  };

  const playAnimation = (animation: MicroInteraction) => {
    setSelectedAnimation(animation);
    setIsPlaying(true);

    // Apply animation styles
    const elements = document.querySelectorAll(animation.element);
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.transition = `all ${animation.animation.duration}s ${animation.animation.easing}`;
      htmlElement.style.transitionDelay = `${animation.animation.delay}s`;
      
      // Apply different animations based on type
      switch (animation.type) {
        case 'hover':
          htmlElement.style.transform = 'scale(1.05)';
          htmlElement.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
          break;
        case 'click':
          htmlElement.style.transform = 'scale(0.95)';
          setTimeout(() => {
            htmlElement.style.transform = 'scale(1)';
          }, animation.animation.duration * 500);
          break;
        case 'focus':
          htmlElement.style.borderColor = '#3b82f6';
          htmlElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          break;
        case 'load':
          htmlElement.style.opacity = '0';
          htmlElement.style.transform = 'translateY(20px)';
          setTimeout(() => {
            htmlElement.style.opacity = '1';
            htmlElement.style.transform = 'translateY(0)';
          }, 50);
          break;
      }
    });

    // Reset after animation
    setTimeout(() => {
      elements.forEach(element => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.transform = '';
        htmlElement.style.boxShadow = '';
        htmlElement.style.borderColor = '';
        htmlElement.style.opacity = '';
      });
      setIsPlaying(false);
    }, (animation.animation.duration + animation.animation.delay) * 1000);
  };

  const generateCSS = () => {
    let css = '/* Generated Animations */\n\n';

    animations.forEach((animation, index) => {
      const className = `.animation-${index}`;
      const duration = animation.animation.duration;
      const easing = animation.animation.easing;
      const delay = animation.animation.delay;

      switch (animation.type) {
        case 'hover':
          css += `${className}:hover {\n`;
          css += `  transform: scale(1.05);\n`;
          css += `  box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n`;
          css += `  transition: all ${duration}s ${easing};\n`;
          css += `  transition-delay: ${delay}s;\n`;
          css += `}\n\n`;
          break;
        case 'click':
          css += `${className}:active {\n`;
          css += `  transform: scale(0.95);\n`;
          css += `  transition: all ${duration}s ${easing};\n`;
          css += `}\n\n`;
          break;
        case 'focus':
          css += `${className}:focus {\n`;
          css += `  border-color: #3b82f6;\n`;
          css += `  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n`;
          css += `  transition: all ${duration}s ${easing};\n`;
          css += `  transition-delay: ${delay}s;\n`;
          css += `}\n\n`;
          break;
        case 'load':
          css += `@keyframes fadeIn-${index} {\n`;
          css += `  from {\n`;
          css += `    opacity: 0;\n`;
          css += `    transform: translateY(20px);\n`;
          css += `  }\n`;
          css += `  to {\n`;
          css += `    opacity: 1;\n`;
          css += `    transform: translateY(0);\n`;
          css += `  }\n`;
          css += `}\n\n`;
          css += `${className} {\n`;
          css += `  animation: fadeIn-${index} ${duration}s ${easing};\n`;
          css += `  animation-delay: ${delay}s;\n`;
          css += `  animation-fill-mode: both;\n`;
          css += `}\n\n`;
          break;
      }
    });

    return css;
  };

  const exportAnimations = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'animations.css';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Motor de Animações</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportAnimations}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Exportar CSS
          </button>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Controles de Animação</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Duração (s)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="2"
              value={customAnimation.duration}
              onChange={(e) => setCustomAnimation({ ...customAnimation, duration: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Easing</label>
            <select
              value={customAnimation.easing}
              onChange={(e) => setCustomAnimation({ ...customAnimation, easing: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            >
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
              <option value="linear">Linear</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Delay (s)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={customAnimation.delay}
              onChange={(e) => setCustomAnimation({ ...customAnimation, delay: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {(['hover', 'click', 'focus', 'load'] as const).map(type => (
            <button
              key={type}
              onClick={() => addAnimation(type)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Animation List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Animações Configuradas</h3>
        
        {animations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma animação configurada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {animations.map((animation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {animation.type === 'hover' && <ChevronUp className="w-5 h-5 text-primary" />}
                    {animation.type === 'click' && <Check className="w-5 h-5 text-primary" />}
                    {animation.type === 'focus' && <AlertCircle className="w-5 h-5 text-primary" />}
                    {animation.type === 'load' && <Zap className="w-5 h-5 text-primary" />}
                  </div>
                  
                  <div>
                    <div className="font-medium capitalize">{animation.type}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {animation.element} • {animation.animation.duration}s • {animation.animation.easing}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playAnimation(animation)}
                    disabled={isPlaying}
                    className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3 h-3" />
                    Testar
                  </button>
                  
                  <button
                    onClick={() => removeAnimation(index)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Área de Preview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {animations.map((animation, index) => (
            <div
              key={index}
              className={`animation-${index} p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              onClick={() => playAnimation(animation)}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                {animation.type === 'hover' && <ChevronUp className="w-6 h-6 text-primary" />}
                {animation.type === 'click' && <Check className="w-6 h-6 text-primary" />}
                {animation.type === 'focus' && <AlertCircle className="w-6 h-6 text-primary" />}
                {animation.type === 'load' && <Zap className="w-6 h-6 text-primary" />}
              </div>
              <div className="text-sm font-medium capitalize">{animation.type}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Clique para testar
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated CSS */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">CSS Gerado</h3>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{generateCSS()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AnimationEngine;
