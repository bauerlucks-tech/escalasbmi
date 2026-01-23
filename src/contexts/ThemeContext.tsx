import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('escala_theme');
    return (saved as Theme) || 'dark'; // MUDADO: 'system' para 'dark'
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    localStorage.setItem('escala_theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      
      setResolvedTheme(resolved);
      
      // Apply to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

{/* Shift Selection */}
{selectedOperator && (
  <Select 
    value={selectedTargetShift || ''} 
    onValueChange={(v) => setSelectedTargetShift(v as ShiftType)}
  >
    <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
      <SelectValue placeholder="Selecione o turno">
        {selectedTargetShift && (
          <div className="flex items-center gap-2 text-left">
            {selectedTargetShift === 'meioPeriodo' 
              ? <Sun className="w-4 h-4 text-secondary" />
              : selectedTargetShift === 'fechamento'
                ? <Sunset className="w-4 h-4 text-warning" />
                : <div className="flex gap-1"><Sun className="w-4 h-4 text-secondary" /><Sunset className="w-4 h-4 text-warning" /></div>
            }
            <span className="font-medium">
              {selectedTargetShift === 'meioPeriodo' 
                ? 'Meio Período' 
                : selectedTargetShift === 'fechamento'
                  ? 'Fechamento'
                  : 'Ambos os turnos'}
            </span>
          </div>
        )}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {getOperatorShiftsForDay(selectedTargetEntry, selectedOperator).map(shift => (
        <SelectItem key={shift} value={shift} className="py-3">
          <div className="flex items-center gap-2">
            {shift === 'meioPeriodo' 
              ? <Sun className="w-4 h-4 text-secondary" />
              : <Sunset className="w-4 h-4 text-warning" />
            }
            <span>{getShiftLabel(shift)}</span>
          </div>
        </SelectItem>
      ))}
      {getOperatorShiftsForDay(selectedTargetEntry, selectedOperator).length === 2 && (
        <SelectItem value="ambos" className="py-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-secondary" />
            <Sunset className="w-4 h-4 text-warning" />
            <span>Ambos os turnos</span>
          </div>
        </SelectItem>
      )}
    </SelectContent>
  </Select>
)}
