import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plane, 
  MapPin, 
  Warehouse, 
  Container, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  User, 
  Lock,
  Wind,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  name: string;
  role: string;
  status: string;
}

interface ModernLoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export function ModernLoginScreen({ onLoginSuccess }: ModernLoginScreenProps) {
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Usuários fixos do nosso sistema
  const users = [
    { name: 'ADMIN', role: 'super_admin' },
    { name: 'CARLOS', role: 'operador' },
    { name: 'GUILHERME', role: 'operador' },
    { name: 'HENRIQUE', role: 'operador' },
    { name: 'KELLY', role: 'operador' },
    { name: 'LUCAS', role: 'operador' },
    { name: 'RICARDO', role: 'administrador' },
    { name: 'ROSANA', role: 'operador' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Por favor, insira a senha');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://lsxmwwwmgfjwnowlsmzf.supabase.co/rest/v1/users?select=*&name=eq.ADMIN&password=eq.${password}&status=eq.ativo`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8',
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const user = data[0];
        toast.success(`Bem-vindo, ${user.name}!`);
        onLoginSuccess(user);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#1A1A1B' }}>
      {/* Background Aviation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Abstract flight paths */}
        <svg className="absolute top-10 left-10 w-32 h-32 opacity-10" viewBox="0 0 100 100">
          <path d="M10,50 Q30,20 50,50 T90,50" stroke="#6F1D1B" strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="3" fill="#6F1D1B" />
        </svg>
        <svg className="absolute top-20 right-20 w-24 h-24 opacity-10" viewBox="0 0 100 100">
          <path d="M10,50 Q30,20 50,50 T90,50" stroke="#A1A1A1" strokeWidth="1.5" fill="none" />
        </svg>
        <svg className="absolute bottom-20 left-20 w-40 h-40 opacity-5" viewBox="0 0 100 100">
          <path d="M10,50 Q30,20 50,50 T90,50" stroke="#6F1D1B" strokeWidth="2" fill="none" />
        </svg>
        
        {/* Grid pattern representing logistics */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(to right, #6F1D1B 1px, transparent 1px), linear-gradient(to bottom, #6F1D1B 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="border-0 shadow-2xl" style={{ 
          background: '#2D2D2E',
          boxShadow: '0 25px 50px -12px rgba(111, 29, 27, 0.25), 0 0 0 1px rgba(111, 29, 27, 0.1)'
        }}>
          <CardHeader className="text-center space-y-2 pb-6">
            {/* Aviation-themed icon container */}
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ 
              background: 'linear-gradient(135deg, rgba(111, 29, 27, 0.3) 0%, rgba(111, 29, 27, 0.1) 100%)',
              border: '1px solid rgba(111, 29, 27, 0.3)'
            }}>
              <div className="relative">
                <Plane className="w-10 h-10" style={{ color: '#6F1D1B' }} />
                <Wind className="w-4 h-4 absolute -right-2 top-1" style={{ color: '#A1A1A1' }} />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              Operações Aéreas Offshore
            </CardTitle>
            <CardDescription style={{ color: '#A1A1A1' }}>
              Sistema de Gestão de Escalas — Área Branca SBMI
            </CardDescription>
            
            {/* Aviation badges */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ 
                background: 'rgba(111, 29, 27, 0.2)', 
                color: '#6F1D1B',
                border: '1px solid rgba(111, 29, 27, 0.3)'
              }}>
                <Navigation className="w-3 h-3" />
                <span>SBMI</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ 
                background: 'rgba(161, 161, 161, 0.2)', 
                color: '#A1A1A1',
                border: '1px solid rgba(161, 161, 161, 0.3)'
              }}>
                <Container className="w-3 h-3" />
                <span>Offshore</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ 
                background: 'rgba(111, 29, 27, 0.2)', 
                color: '#6F1D1B',
                border: '1px solid rgba(111, 29, 27, 0.3)'
              }}>
                <Warehouse className="w-3 h-3" />
                <span>Logística</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* User Select */}
              <div className="space-y-2">
                <Label htmlFor="username" className="font-medium text-sm" style={{ color: '#A1A1A1' }}>
                  Operador
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#6F1D1B' }} />
                  <select
                    id="username"
                    defaultValue="ADMIN"
                    className="w-full pl-12 pr-4 py-3.5 rounded-lg text-white transition-all duration-200 appearance-none cursor-pointer outline-none"
                    style={{ 
                      background: 'rgba(26, 26, 27, 0.8)',
                      border: '1px solid rgba(111, 29, 27, 0.3)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6F1D1B'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(111, 29, 27, 0.3)'}
                  >
                    {users.map((user) => (
                      <option key={user.name} value={user.name} style={{ background: '#2D2D2E', color: '#FFFFFF' }}>
                        {user.name} — {user.role}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#A1A1A1' }} />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-sm" style={{ color: '#A1A1A1' }}>
                  Senha de Acesso
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#6F1D1B' }} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 py-3.5 rounded-lg text-white transition-all duration-200 outline-none"
                    style={{ 
                      background: 'rgba(26, 26, 27, 0.8)',
                      border: '1px solid rgba(111, 29, 27, 0.3)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6F1D1B'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(111, 29, 27, 0.3)'}
                    required
                  />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="rounded-lg" style={{ 
                  background: 'rgba(111, 29, 27, 0.15)', 
                  border: '1px solid rgba(111, 29, 27, 0.3)',
                  color: '#FFFFFF'
                }}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#6F1D1B' }} />
                  <AlertDescription style={{ color: '#FFFFFF' }}>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full font-semibold py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #6F1D1B 0%, #8B2635 100%)',
                  color: '#FFFFFF'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Sistema</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer Info */}
            <div className="pt-4 border-t" style={{ borderColor: 'rgba(111, 29, 27, 0.2)' }}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5" style={{ color: '#A1A1A1' }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#6F1D1B' }} />
                  <span>Conexão Segura</span>
                </div>
                <span className="font-mono px-2 py-1 rounded" style={{ 
                  background: 'rgba(111, 29, 27, 0.2)', 
                  color: '#6F1D1B'
                }}>
                  v2.0
                </span>
              </div>
              <p className="text-center mt-3 text-xs" style={{ color: '#A1A1A1' }}>
                Credenciais: <span className="font-mono" style={{ color: '#6F1D1B' }}>ADMIN / admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
