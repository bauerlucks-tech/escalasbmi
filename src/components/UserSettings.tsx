import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Settings, Sun, Moon, Monitor, Camera, Trash2, Lock, Eye, EyeOff, Check, Palette
} from 'lucide-react';
import { toast } from 'sonner';

interface UserSettingsProps {
  trigger?: React.ReactNode;
}

const UserSettings: React.FC<UserSettingsProps> = ({ trigger }) => {
  const { currentUser, updateUserPassword, updateUserProfile } = useAuth();
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 4) {
      toast.error('A nova senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    const success = updateUserPassword(currentUser.id, currentPassword, newPassword);
    
    if (success) {
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('Senha atual incorreta');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast.error('A imagem deve ter no máximo 500KB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser uma imagem');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateUserProfile(currentUser.id, base64);
      toast.success('Foto de perfil atualizada!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateUserProfile(currentUser.id, '');
    toast.success('Foto de perfil removida');
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-4">
            {/* Theme Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Tema</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as any)}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Scheme Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Esquema de Cores</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
                  { value: 'green', label: 'Verde', color: 'bg-green-500' },
                  { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
                  { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
                  { value: 'teal', label: 'Verde-água', color: 'bg-teal-500' },
                  { value: 'rose', label: 'Rosa', color: 'bg-rose-500' },
                  { value: 'slate', label: 'Cinza', color: 'bg-slate-500' },
                  { value: 'zinc', label: 'Zinco', color: 'bg-zinc-500' },
                ].map((option) => {
                  const isSelected = colorScheme === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setColorScheme(option.value as any)}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className={`w-8 h-8 rounded-full ${option.color} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                {currentUser.profileImage ? (
                  <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
                ) : null}
                <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar foto
                </Button>
                {currentUser.profileImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <Label className="text-sm font-medium">Alterar Senha</Label>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="current" className="text-xs text-muted-foreground">Senha atual</Label>
                  <div className="relative">
                    <Input
                      id="current"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new" className="text-xs text-muted-foreground">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="new"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm" className="text-xs text-muted-foreground">Confirmar nova senha</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <Button 
                  onClick={handlePasswordChange} 
                  className="w-full mt-2"
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  Alterar Senha
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettings;
