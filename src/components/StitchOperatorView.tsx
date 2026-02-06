import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeftRight, 
  Bell, 
  Umbrella, 
  Settings,
  Database,
  FileText,
  Calendar,
  Clock,
  User
} from 'lucide-react';

interface OperatorViewProps {
  user: {
    name: string;
    role: string;
  };
  onRequestSwap: () => void;
  onViewRequests: () => void;
  onRequestVacation: () => void;
  onAdmin: () => void;
  onBackup: () => void;
  onAudit: () => void;
}

export function StitchOperatorView({ 
  user, 
  onRequestSwap, 
  onViewRequests, 
  onRequestVacation, 
  onAdmin, 
  onBackup, 
  onAudit 
}: OperatorViewProps) {
  const menuItems = [
    { icon: ArrowLeftRight, label: 'Solicitar Troca', onClick: onRequestSwap, color: '#ff6b6b' },
    { icon: Bell, label: 'Solicitações', count: 0, onClick: onViewRequests, color: '#4ecdc4' },
    { icon: Umbrella, label: 'Férias', onClick: onRequestVacation, color: '#45b7d1' },
    { icon: Settings, label: 'Administração', onClick: onAdmin, color: '#96ceb4', adminOnly: true },
    { icon: Database, label: 'Backup', onClick: onBackup, color: '#feca57' },
    { icon: FileText, label: 'Auditoria', onClick: onAudit, color: '#ff9ff3' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8"
         style={{ background: 'linear-gradient(135deg, #221013 0%, #3d1519 100%)' }}>
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(113, 9, 23, 0.5) 0%, rgba(113, 9, 23, 0.2) 100%)',
                   border: '1px solid rgba(255, 255, 255, 0.2)'
                 }}>
              🚁
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Duty Roster</h1>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{user.name}</span>
                <Badge 
                  variant="secondary"
                  style={{ 
                    background: 'rgba(113, 9, 23, 0.5)',
                    color: '#ffcccc',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Grid */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            (!item.adminOnly || user.role === 'administrador' || user.role === 'super_admin') && (
              <Card 
                key={index}
                className="cursor-pointer transition-all duration-300 hover:scale-[1.02] border-0"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px'
                }}
                onClick={item.onClick}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color}40 0%, ${item.color}20 100%)`,
                      boxShadow: `0 4px 15px -3px ${item.color}40`
                    }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge 
                        className="bg-red-500 text-white"
                        style={{ 
                          background: item.color,
                          boxShadow: `0 0 10px ${item.color}60`
                        }}
                      >
                        {item.count}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="border-0"
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px'
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Último dia trabalhado</span>
              </div>
              <p className="text-white text-xl font-semibold">-</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0"
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px'
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Próximo trabalho</span>
              </div>
              <p className="text-white text-lg font-semibold">7 sexta-feira</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0"
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px'
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Umbrella className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Próxima folga</span>
              </div>
              <p className="text-white text-lg font-semibold">61 dias seguidos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
