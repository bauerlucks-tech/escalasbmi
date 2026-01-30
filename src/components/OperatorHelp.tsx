import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HelpCircle, 
  Calendar, 
  ArrowLeftRight, 
  Bell, 
  Plane, 
  User, 
  ChevronRight, 
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Sun,
  Sunset,
  Shield,
  Settings,
  Palette,
  Upload,
  Download
} from 'lucide-react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  steps: {
    title: string;
    description: string;
    tips?: string[];
  }[];
}

const OperatorHelp: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('schedule');

  const helpSections: HelpSection[] = [
    {
      id: 'schedule',
      title: 'Ver Minha Escala',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Veja seus dias de trabalho e turnos',
      steps: [
        {
          title: '1. Acesse a aba "Escala SBMIBZ"',
          description: 'Clique no menu superior ou navegue pela primeira aba',
          tips: [
            'Você verá um calendário com todo o mês',
            'Seus turnos aparecem em destaque',
            'Verde = Meio Período (MP), Laranja = Fechamento (FE)'
          ]
        },
        {
          title: '2. Entenda as cores',
          description: 'Cada cor representa um tipo de turno',
          tips: [
            'Azul/Verde: Meio Período (geralmente 07:00-19:00)',
            'Laranja/Vermelho: Fechamento (geralmente 19:00-07:00)',
            'Cinza: Dia de folga'
          ]
        },
        {
          title: '3. Veja detalhes do dia',
          description: 'Clique em qualquer dia para ver mais informações',
          tips: [
            'Mostra o operador escalado',
            'Turno específico (MP ou FE)',
            'Dia da semana'
          ]
        }
      ]
    },
    {
      id: 'swap',
      title: 'Solicitar Troca de Turno',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      description: 'Troque seu turno com outro operador',
      steps: [
        {
          title: '1. Acesse "Solicitar Troca"',
          description: 'Clique na aba "Solicitar Troca" no menu',
          tips: [
            'Verifique se você tem turnos disponíveis para troca',
            'Apenas dias futuros podem ser trocados'
          ]
        },
        {
          title: '2. Escolha seu turno',
          description: 'Selecione o dia e turno que você quer ceder',
          tips: [
            'Clique no calendário o dia desejado',
            'Selecione entre Meio Período ou Fechamento',
            'Verifique se o turno está disponível'
          ]
        },
        {
          title: '3. Escolha o turno desejado',
          description: 'Selecione para qual turno você quer trocar',
          tips: [
            'Escolha o dia que você quer trabalhar',
            'Selecione o operador e turno desejado',
            'Você não pode escolher seu próprio nome'
          ]
        },
        {
          title: '4. Confirme a solicitação',
          description: 'Revise tudo e envie sua solicitação',
          tips: [
            'Verifique todas as informações',
            'O outro operador precisará aceitar',
            'Após aceite, um administrador aprovará'
          ]
        }
      ]
    },
    {
      id: 'requests',
      title: 'Minhas Solicitações',
      icon: <Bell className="w-5 h-5" />,
      description: 'Acompanhe suas solicitações de troca',
      steps: [
        {
          title: '1. Acesse "Solicitações"',
          description: 'Veja o status de todas suas solicitações',
          tips: [
            'Badge vermelho indica novidades',
            'Status atualizados em tempo real'
          ]
        },
        {
          title: '2. Entenda os status',
          description: 'Cada status significa algo diferente',
          tips: [
            '🟡 Pendente: Aguardando colega aceitar',
            '🟠 Aguardando aprovação: Colega aceitou, espera aprovação',
            '🟢 Aprovada: Troca confirmada e aplicada',
            '🔴 Recusada: Troca negada'
          ]
        },
        {
          title: '3. Responda a solicitações',
          description: 'Se alguém pediu para trocar com você',
          tips: [
            'Você receberá uma notificação',
            'Pode aceitar ou recusar',
            'Sua resposta é importante para o colega'
          ]
        }
      ]
    },
    {
      id: 'vacations',
      title: 'Férias',
      icon: <Plane className="w-5 h-5" />,
      description: 'Gerencie suas férias',
      steps: [
        {
          title: '1. Acesse "Férias"',
          description: 'Veja e gerencie suas férias',
          tips: [
            'Calendário mostra suas férias programadas',
            'Período disponível para solicitação'
          ]
        },
        {
          title: '2. Solicite férias',
          description: 'Escolha suas datas de férias',
          tips: [
            'Selecione período desejado',
            'Verifique disponibilidade',
            'Aguarde aprovação administrativa'
          ]
        },
        {
          title: '3. Acompanhe status',
          description: 'Veja se suas férias foram aprovadas',
          tips: [
            'Status atualizado automaticamente',
            'Receba notificações sobre mudanças'
          ]
        }
      ]
    },
    {
      id: 'profile',
      title: 'Meu Perfil',
      icon: <User className="w-5 h-5" />,
      description: 'Gerencie seus dados pessoais',
      steps: [
        {
          title: '1. Acesse seu perfil',
          description: 'Clique na sua foto/nome no canto superior',
          tips: [
            'Menu dropdown com opções',
            'Acesso rápido às configurações'
          ]
        },
        {
          title: '2. Altere sua senha',
          description: 'Mantenha sua senha segura',
          tips: [
            'Clique em "Configurações"',
            'Digite a senha atual e a nova',
            'Use senhas fortes'
          ]
        },
        {
          title: '3. Saia do sistema',
          description: 'Faça logout corretamente',
          tips: [
            'Sempre clique em "Sair"',
            'Não feche o navegador diretamente',
            'Proteja seus dados'
          ]
        },
        {
          title: '4. Temas do Sistema',
          description: 'Personalize a aparência do sistema',
          tips: [
            'Use o botão ☀️/🌙/🖥️ no header',
            'Claro: Tema claro para o dia',
            'Escuro: Tema escuro para conforto visual',
            'Sistema: Segue preferência do seu dispositivo'
          ]
        }
      ]
    },
    {
      id: 'admin',
      title: 'Painel Administrativo',
      icon: <Settings className="w-5 h-5" />,
      description: 'Funções para administradores',
      steps: [
        {
          title: '1. Gerenciar Usuários',
          description: 'Controle de acesso e senhas',
          tips: [
            'Redefinir senhas de usuários',
            'Alterar níveis de acesso',
            'Arquivar usuários inativos',
            'Criar novos usuários'
          ]
        },
        {
          title: '2. Importar Escalas',
          description: 'Atualize as escalas mensais',
          tips: [
            'Use arquivos CSV no formato correto',
            'Baixe o modelo de CSV disponível',
            'Verifique dados antes de importar',
            'Backup automático antes da importação'
          ]
        },
        {
          title: '3. Aprovar Trocas',
          description: 'Gerencie solicitações de troca',
          tips: [
            'Veja trocas aguardando aprovação',
            'Compare turnos originais e propostos',
            'Aprovação final após aceite dos colegas',
            'Histórico completo de alterações'
          ]
        },
        {
          title: '4. Gerenciar Férias',
          description: 'Controle de solicitações de férias',
          tips: [
            'Aprovar ou rejeitar solicitações',
            'Verificar disponibilidade de equipe',
            'Calcular dias disponíveis',
            'Comunicação automática com operadores'
          ]
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gradient">Guia do Operador</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Aprenda a usar o sistema de gestão de escalas de forma simples e rápida. 
          Clique em cada tópico para ver instruções detalhadas.
        </p>
      </div>

      {/* Quick Tips */}
      <Card className="glass-card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Dicas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Sempre confirme suas solicitações</p>
                <p className="text-sm text-muted-foreground">Verifique todas as informações antes de enviar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium">Acompanhe o status</p>
                <p className="text-sm text-muted-foreground">Mantenha-se atualizado sobre suas trocas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Comunique-se</p>
                <p className="text-sm text-muted-foreground">Fale com os colegas antes de solicitar trocas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="font-medium">Mantenha seus dados seguros</p>
                <p className="text-sm text-muted-foreground">Troque sua senha regularmente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Palette className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Personalize sua experiência</p>
                <p className="text-sm text-muted-foreground">Use temas claro/escuro conforme preferência</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Sections */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {helpSections.map((section) => (
            <Card key={section.id} className="glass-card">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              
              {expandedSection === section.id && (
                <CardContent className="space-y-4">
                  {section.steps.map((step, index) => (
                    <div key={index} className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.tips && step.tips.length > 0 && (
                            <div className="space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <div key={tipIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                                  <span>{tip}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Contact Support */}
      <Card className="glass-card-elevated">
        <CardContent className="text-center py-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda adicional?
            </p>
            <p className="text-sm">
              Fale com seu supervisor ou administrador do sistema
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <Badge variant="outline">
                Suporte disponível 24/7
              </Badge>
              <Badge variant="outline">
                Versão 2.0 Completa
              </Badge>
              <Badge variant="outline">
                Sistema de Backup Ativo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorHelp;
