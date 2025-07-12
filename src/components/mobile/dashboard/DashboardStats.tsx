import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, CreditCard, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    agendamentosHoje: number;
    clientesAtivos: number;
    receitaMensal: number;
    taxaConversao: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const dashboardStats = [
    { title: "Agendamentos Hoje", value: stats.agendamentosHoje.toString(), icon: Calendar, color: "text-primary" },
    { title: "Clientes Ativos", value: stats.clientesAtivos.toString(), icon: Users, color: "text-green-600" },
    { title: "Receita Mensal", value: formatCurrency(stats.receitaMensal), icon: CreditCard, color: "text-orange-600" },
    { title: "Taxa Conversão", value: `${stats.taxaConversao}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
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
  );
};

export default DashboardStats;