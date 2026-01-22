import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelicopterDetailedIcon, HelipadIcon, PlatformIcon } from '@/components/icons/OffshoreIcons';
import { PartnerLogos, AviationBadge } from '@/components/logos/CompanyLogos';
import { AlertCircle, Lock, User } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login, users } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Flying helicopter animation */}
        <div className="absolute top-1/4 animate-fly">
          <HelicopterDetailedIcon className="w-24 h-24 text-primary opacity-20" />
        </div>
        
        {/* Helipad decoration top left */}
        <div className="absolute top-16 left-16 opacity-10">
          <HelipadIcon className="w-32 h-32 text-primary" />
        </div>
        
        {/* Platform decoration bottom right */}
        <div className="absolute bottom-16 right-16 opacity-10">
          <PlatformIcon className="w-48 h-48 text-secondary" />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="glass-card-elevated w-full max-w-md p-8 animate-slide-up relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 glow-primary relative">
            <HelicopterDetailedIcon className="w-12 h-12 text-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-2">Operações Aéreas Offshore</h1>
          <p className="text-muted-foreground text-sm mb-3">
            Sistema de Gestão de Escalas - Tripulações
          </p>
          <AviationBadge />
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
          <p className="text-xs text-muted-foreground text-center mb-3">
            Operadores cadastrados:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {users.map(user => (
              <span 
                key={user.id}
                className="px-2 py-1 text-xs bg-muted/50 rounded-md text-muted-foreground"
              >
                {user.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Senha padrão: <span className="font-mono text-primary">1234</span>
          </p>
        </div>

        {/* Partner logos footer */}
        <div className="mt-6 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-wider">
            Empresas Parceiras
          </p>
          <PartnerLogos compact />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
