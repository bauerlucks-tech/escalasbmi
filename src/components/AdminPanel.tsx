import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Key, User, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AdminPanel: React.FC = () => {
  const { currentUser, users, resetPassword } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  if (!currentUser?.isAdmin) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
        <p className="text-sm text-muted-foreground">
          Apenas administradores podem acessar este painel.
        </p>
      </div>
    );
  }

  const handleResetPassword = (userId: string) => {
    if (!newPassword || newPassword.length < 4) {
      toast.error('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    resetPassword(userId, newPassword);
    toast.success('Senha alterada com sucesso!');
    setSelectedUser(null);
    setNewPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Header */}
      <div className="glass-card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Painel Administrativo</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie usuários e senhas do sistema
            </p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Gerenciar Senhas
          </h3>
        </div>

        <div className="divide-y divide-border/30">
          {users.map(user => (
            <div key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${user.isAdmin ? 'bg-primary/20' : 'bg-muted/50'}
                  `}>
                    {user.isAdmin ? (
                      <Shield className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.isAdmin ? 'Administrador' : 'Colaborador'}
                    </div>
                  </div>
                </div>

                {selectedUser === user.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="password"
                      placeholder="Nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-32 h-9 text-sm bg-muted/50"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleResetPassword(user.id)}
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedUser(null);
                        setNewPassword('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user.id)}
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <Key className="w-4 h-4 mr-1" />
                    Resetar Senha
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total de usuários:</span>
          <span className="font-mono font-bold text-primary">{users.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
