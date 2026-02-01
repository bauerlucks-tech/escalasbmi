// INTEGRAR SISTEMA DE BACKUP NO APLICATIVO
// Adicionar ao componente principal para sincronização automática

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BackupInfo, RepositorySyncData } from '@/types/repository-sync';


interface RepositorySyncProps {
  onSyncComplete?: (success: boolean) => void;
}

const RepositorySync: React.FC<RepositorySyncProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const { toast } = useToast();

  // Carregar script de sincronização
  useEffect(() => {
    const loadSyncScript = async () => {
      try {
        // Carregar o script de sincronização
        const script = document.createElement('script');
        script.src = '/repository-sync.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          console.log('✅ Script de sincronização carregado');
          loadBackupInfo();
        };

        script.onerror = () => {
          console.error('❌ Erro ao carregar script de sincronização');
        };
      } catch (error) {
        console.error('❌ Erro ao inicializar sincronização:', error);
      }
    };

    loadSyncScript();
  }, []);

  // Carregar informações de backup
  const loadBackupInfo = () => {
    try {
      const storedBackups = localStorage.getItem('repository_backups');
      if (storedBackups) {
        const backupList = JSON.parse(storedBackups);
        setBackups(backupList);
        
        if (backupList.length > 0) {
          const latest = backupList[backupList.length - 1];
          setLastSync(latest.timestamp);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar informações de backup:', error);
    }
  };

  // Sincronizar dados
  const syncNow = async () => {
    if (!window.repositorySync) {
      toast({
        title: "Erro",
        description: "Sistema de sincronização não disponível",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      const success = window.repositorySync.syncNow();
      
      if (success) {
        toast({
          title: "✅ Sincronização Concluída",
          description: "Dados backupados com sucesso",
        });
        loadBackupInfo();
        onSyncComplete?.(true);
      } else {
        toast({
          title: "❌ Erro na Sincronização",
          description: "Falha ao backupar dados",
          variant: "destructive"
        });
        onSyncComplete?.(false);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "❌ Erro",
        description: "Falha na sincronização",
        variant: "destructive"
      });
      onSyncComplete?.(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Iniciar sincronização automática
  const startAutoSync = () => {
    if (!window.repositorySync) {
      toast({
        title: "Erro",
        description: "Sistema de sincronização não disponível",
        variant: "destructive"
      });
      return;
    }

    window.repositorySync.startAutoSync();
    
    toast({
      title: "🔄 Auto-Sync Iniciado",
      description: "Sincronização automática a cada 24 horas",
    });
  };

  // Coletar dados para visualização
  const collectData = () => {
    if (!window.repositorySync) {
      toast({
        title: "Erro",
        description: "Sistema de sincronização não disponível",
        variant: "destructive"
      });
      return;
    }

    const data = window.repositorySync.collectData();
    console.log('📊 Dados coletados:', data);
    
    toast({
      title: "📊 Dados Coletados",
      description: "Verifique o console para detalhes",
    });
  };

  // Formatar data
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  // Formatar tamanho
  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔄 Sincronização com Repositório
          {lastSync && (
            <Badge variant="secondary" className="text-xs">
              Último: {formatDate(lastSync)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={syncNow} 
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                💾 Sincronizar Agora
              </>
            )}
          </Button>
          
          <Button 
            onClick={startAutoSync}
            variant="outline"
            className="flex items-center gap-2"
          >
            🔄 Auto-Sync (24h)
          </Button>
          
          <Button 
            onClick={collectData}
            variant="outline"
            className="flex items-center gap-2"
          >
            📊 Coletar Dados
          </Button>
        </div>

        {/* Informações de Backup */}
        {backups.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">📋 Backups Locais:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {backups.slice().reverse().map((backup, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      v{backup.version}
                    </Badge>
                    <span className="font-mono text-xs">
                      {backup.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatSize(backup.size)}</span>
                    <span>{formatDate(backup.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações do Sistema */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>📁 <strong>Local:</strong> Downloads do navegador</p>
          <p>⏰ <strong>Frequência:</strong> Manual ou automática (24h)</p>
          <p>💾 <strong>Armazenamento:</strong> Arquivos JSON com todos os dados</p>
          <p>🔒 <strong>Segurança:</strong> Dados criptografados localmente</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Sistema pronto para sincronização
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepositorySync;
