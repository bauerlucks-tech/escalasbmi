import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { LogIn, AlertCircle, Loader2, Shield, User } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Operações Aéreas Offshore
            </CardTitle>
            <CardDescription className="text-gray-300">
              Sistema de Gestão de Escalas - Área Branca SBMI
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200 font-medium">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    id="username"
                    defaultValue="ADMIN"
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all appearance-none cursor-pointer"
                  >
                    {users.map((user) => (
                      <option key={user.name} value={user.name} className="bg-slate-800 text-white">
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <LogIn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Acessar Sistema
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-gray-400 text-sm">
              <p>Credenciais de teste: <span className="font-mono bg-blue-500/20 px-2 py-1 rounded text-blue-300">ADMIN / admin123</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
