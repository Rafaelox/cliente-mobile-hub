import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardStats from "./dashboard/DashboardStats";
import QuickActions from "./dashboard/QuickActions";
import TodayAppointments from "./dashboard/TodayAppointments";
import RecentActivity from "./dashboard/RecentActivity";

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

  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <DashboardStats stats={stats} />

      {/* Quick Actions */}
      <QuickActions 
        onNavigateToClients={onNavigateToClients}
        onNavigateToScheduling={onNavigateToScheduling}
      />

      {/* Today's Appointments */}
      <TodayAppointments 
        appointments={todayAppointments}
        onConfirmAppointment={confirmAppointment}
      />

      {/* Recent Activity */}
      <RecentActivity clientesAtivos={stats.clientesAtivos} />
    </div>
  );
};

export default Dashboard;