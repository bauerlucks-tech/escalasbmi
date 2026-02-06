import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Loader2, Shield, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UserType {
  name: string;
  role: string;
  status: string;
}

interface StitchLoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export function StitchLoginScreen({ onLoginSuccess }: StitchLoginScreenProps) {
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('ADMIN');
  const { login, users } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Por favor, insira a senha');
      return;
    }

    setLoading(true);

    try {
      const success = login(selectedUser, password);
      
      if (success) {
        const user = users.find(u => u.name === selectedUser);
        if (user) {
          toast.success(`Bem-vindo, ${user.name}!`);
          onLoginSuccess(user);
        }
      } else {
        setError('Senha inválida');
        toast.error('Senha inválida');
      }
    } catch (err: any) {
      setError('Erro ao conectar com o servidor');
      toast.error('Erro ao conectar com o servidor');
      console.error('Error during login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'linear-gradient(135deg, #221013 0%, #3d1519 50%, #710917 100%)' }}>
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl"
              style={{ 
                background: 'rgba(113, 9, 23, 0.25)', 
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px'
              }}>
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                   boxShadow: '0 10px 25px -5px rgba(113, 9, 23, 0.4)'
                 }}>
              <span className="text-4xl">🚁</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white tracking-tight"
                       style={{ 
                         background: 'linear-gradient(135deg, #fff 0%, #ffcccc 100%)',
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent'
                       }}>
              Área Branca Maricá-RJ
            </CardTitle>
            <p className="text-gray-300 text-sm">
              SBMI - Campo de Búzios
            </p>
            <p className="text-gray-400 text-xs">
              Sistema de Gestão de Escalas
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200 font-medium">
                  Nome do Operador
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    id="username"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 rounded-xl text-white cursor-pointer appearance-none transition-all duration-300"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      outline: 'none'
                    }}
                  >
                    {users.map((user) => (
                      <option key={user.name} value={user.name} style={{ background: '#2d1316', color: '#fff' }}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-400 transition-all duration-300"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10 text-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                style={{ 
                  background: 'linear-gradient(135deg, #710917 0%, #a01525 50%, #710917 100%)',
                  boxShadow: '0 10px 30px -5px rgba(113, 9, 23, 0.5)'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Acessar Sistema
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-gray-400 text-xs pt-4 border-t border-white/10">
              <p>Credenciais de teste: <span className="font-mono bg-white/10 px-2 py-1 rounded text-white">ADMIN / admin123</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
