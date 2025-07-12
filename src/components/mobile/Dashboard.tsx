import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

interface DashboardProps {
  onNavigateToClients?: () => void;
  onNavigateToScheduling?: () => void;
}

const Dashboard = ({ onNavigateToClients, onNavigateToScheduling }: DashboardProps) => {
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    clientesAtivos: 0,
    receitaMensal: 0,
    taxaConversao: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar agendamentos de hoje
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agenda')
        .select(`
          *,
          clientes:cliente_id (nome),
          consultores:consultor_id (nome)
        `)
        .gte('data_agendamento', today)
        .lt('data_agendamento', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .order('data_agendamento');

      if (agendamentosError) throw agendamentosError;

      // Buscar total de clientes ativos
      const { count: clientesCount, error: clientesError } = await supabase
        .from('clientes')
        .select('id', { count: 'exact' })
        .eq('ativo', true);

      if (clientesError) throw clientesError;

      // Buscar receita do mês atual
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('valor')
        .gte('data_pagamento', firstDayOfMonth)
        .eq('tipo_transacao', 'entrada');

      if (pagamentosError) throw pagamentosError;

      const receitaMensal = pagamentos?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;

      setStats({
        agendamentosHoje: agendamentos?.length || 0,
        clientesAtivos: clientesCount || 0,
        receitaMensal,
        taxaConversao: 85 // Valor fixo por enquanto
      });

      setTodayAppointments(agendamentos || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case "agendado":
        return <Badge variant="secondary">Agendado</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confirmAppointment = async (appointmentId: number) => {
    try {
      const { error } = await supabase
        .from('agenda')
        .update({ status: 'confirmado' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Agendamento confirmado",
        description: "O agendamento foi confirmado e está disponível para pagamento",
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar agendamento",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { title: "Agendamentos Hoje", value: stats.agendamentosHoje.toString(), icon: Calendar, color: "text-primary" },
    { title: "Clientes Ativos", value: stats.clientesAtivos.toString(), icon: Users, color: "text-green-600" },
    { title: "Receita Mensal", value: formatCurrency(stats.receitaMensal), icon: CreditCard, color: "text-orange-600" },
    { title: "Taxa Conversão", value: `${stats.taxaConversao}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="shadow-lg border-0 bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="default" 
              className="h-12"
              onClick={onNavigateToClients}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={onNavigateToScheduling}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 bg-secondary rounded-md shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{appointment.clientes?.nome}</p>
                  {getStatusBadge(appointment.status)}
                </div>
                <p className="text-sm text-muted-foreground">{appointment.consultores?.nome}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-medium text-primary">{formatTime(appointment.data_agendamento)}</p>
                </div>
                {appointment.status === 'agendado' && (
                  <Button 
                    size="sm" 
                    onClick={() => confirmAppointment(appointment.id)}
                    className="h-6 px-2 text-xs"
                  >
                    Confirmar
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {todayAppointments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm">Sistema funcionando normalmente</p>
                <p className="text-xs text-muted-foreground">Agora</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm">{stats.clientesAtivos} clientes ativos</p>
                <p className="text-xs text-muted-foreground">Última atualização</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;