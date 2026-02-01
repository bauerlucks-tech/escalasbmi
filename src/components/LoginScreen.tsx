import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelicopterDetailedIcon } from '@/components/icons/OffshoreIcons';
import { AlertCircle, Lock, User } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !password) {
      setError('Preencha todos os campos');
      return;
    }

    const success = login(name, password);
    if (!success) {
      setError('Nome ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="glass-card-elevated w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <HelicopterDetailedIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-2">Operações Aéreas Offshore</h1>
          <p className="text-muted-foreground text-sm">
            Sistema de Gestão de Escalas - Área Branca SBMI
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              Nome do Operador
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-muted-foreground">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 glow-primary transition-all"
          >
            Acessar Sistema
          </Button>
        </form>

        {/* User hints */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Senha padrão: <span className="font-mono text-primary">1234</span>
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-4 space-y-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Criado por: <span className="text-primary font-medium">Lucas Pott</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Versão: <span className="text-primary font-mono">1.3.132103</span> <span className="text-muted-foreground">(3a6ea99)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
