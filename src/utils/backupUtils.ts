import { 
  ScheduleStorage, 
  VacationStorage, 
  SwapRequest, 
  VacationRequest, 
  User, 
  MonthSchedule 
} from '@/data/scheduleData';
import { useSwap } from '@/contexts/SwapContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CompleteBackup {
  version: string;
  timestamp: string;
  data: {
    schedules: {
      current: MonthSchedule[];
      archived: any[];
    };
    vacations: VacationStorage;
    swapRequests: SwapRequest[];
    users: User[];
  };
}

export const createCompleteBackup = (): CompleteBackup => {
  const { scheduleData, currentSchedules, swapRequests } = useSwap();
  const { users } = useAuth();
  
  // Get all data from localStorage
  const storedSchedules = localStorage.getItem('schedules');
  const storedVacations = localStorage.getItem('vacations');
  const storedSwapRequests = localStorage.getItem('swapRequests');
  const storedUsers = localStorage.getItem('users');
  
  const schedules: ScheduleStorage = storedSchedules 
    ? JSON.parse(storedSchedules) 
    : { current: [], archived: [] };
    
  const vacations: VacationStorage = storedVacations 
    ? JSON.parse(storedVacations) 
    : { requests: [] };
    
  const swapRequestsData: SwapRequest[] = storedSwapRequests 
    ? JSON.parse(storedSwapRequests) 
    : [];
    
  const usersData: User[] = storedUsers 
    ? JSON.parse(storedUsers) 
    : [];

  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    data: {
      schedules: schedules,
      vacations: vacations,
      swapRequests: swapRequestsData,
      users: usersData
    }
  };
};

export const downloadCompleteBackup = () => {
  try {
    const backup = createCompleteBackup();
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup_completo_${timestamp}.json`;
    
    // Create and download file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Backup completo baixado com sucesso!');
  } catch (error) {
    console.error('Error creating backup:', error);
    toast.error('Erro ao criar backup completo');
  }
};

export const restoreCompleteBackup = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const backup: CompleteBackup = JSON.parse(e.target?.result as string);
        
        // Validate backup structure
        if (!backup.data || !backup.data.schedules || !backup.data.vacations || !backup.data.swapRequests || !backup.data.users) {
          throw new Error('Estrutura de backup inválida');
        }
        
        // Restore data to localStorage
        localStorage.setItem('schedules', JSON.stringify(backup.data.schedules));
        localStorage.setItem('vacations', JSON.stringify(backup.data.vacations));
        localStorage.setItem('swapRequests', JSON.stringify(backup.data.swapRequests));
        localStorage.setItem('users', JSON.stringify(backup.data.users));
        
        toast.success('Backup restaurado com sucesso! Recarregue a página para ver as alterações.');
        resolve(backup);
      } catch (error) {
        console.error('Error restoring backup:', error);
        toast.error('Erro ao restaurar backup: ' + (error as Error).message);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      toast.error('Erro ao ler arquivo de backup');
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
