import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5 text-blue-500" />;
    } else if (resolvedTheme === 'dark') {
      return <Moon className="w-5 h-5 text-blue-400" />;
    } else {
      return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  const getLabel = () => {
    if (theme === 'light') return 'Claro';
    if (theme === 'dark') return 'Escuro';
    return 'Sistema';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative group hover:bg-muted transition-colors rounded-full p-2"
      title={`Tema atual: ${getLabel()}`}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="hidden sm:inline text-xs">
          {getLabel()}
        </span>
      </div>
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Alternar tema
      </span>
    </Button>
  );
};

export default ThemeToggle;
