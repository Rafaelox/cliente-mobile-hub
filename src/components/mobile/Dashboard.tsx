import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const Dashboard = () => {
  const todayAppointments = [
    { id: 1, client: "Maria Silva", time: "09:00", consultant: "Dr. João", status: "confirmed" },
    { id: 2, client: "Pedro Santos", time: "11:00", consultant: "Dra. Ana", status: "pending" },
    { id: 3, client: "Julia Costa", time: "14:30", consultant: "Dr. João", status: "confirmed" },
  ];

  const stats = [
    { title: "Agendamentos Hoje", value: "8", icon: Calendar, color: "text-primary" },
    { title: "Clientes Ativos", value: "142", icon: Users, color: "text-success" },
    { title: "Receita Mensal", value: "R$ 12.5k", icon: CreditCard, color: "text-warning" },
    { title: "Taxa Conversão", value: "85%", icon: TrendingUp, color: "text-primary" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-success text-success-foreground">Confirmado</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Cancelado</Badge>;
    }
  };

  return (
    <div className="p-mobile space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-elegant border-0 bg-gradient-soft">
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
      <Card className="shadow-elegant border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="elegant" className="h-12">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
            <Button variant="soft" className="h-12">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card className="shadow-elegant border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted rounded-mobile">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{appointment.client}</p>
                  {getStatusBadge(appointment.status)}
                </div>
                <p className="text-sm text-muted-foreground">{appointment.consultant}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary">{appointment.time}</p>
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
      <Card className="shadow-elegant border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div className="flex-1">
                <p className="text-sm">Consulta finalizada com Maria Silva</p>
                <p className="text-xs text-muted-foreground">Há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="text-sm">Pagamento pendente - Pedro Santos</p>
                <p className="text-xs text-muted-foreground">Há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm">Novo cliente cadastrado</p>
                <p className="text-xs text-muted-foreground">Ontem</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;