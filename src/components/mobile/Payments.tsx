import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Payments = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const paymentStats = [
    { title: "Receita Total", value: "R$ 12.500", icon: DollarSign, color: "text-success" },
    { title: "Pendente", value: "R$ 2.300", icon: Clock, color: "text-warning" },
    { title: "Este Mês", value: "R$ 8.900", icon: TrendingUp, color: "text-primary" },
    { title: "Recebido", value: "R$ 10.200", icon: CheckCircle, color: "text-success" },
  ];

  const payments = [
    {
      id: 1,
      client: "Maria Silva",
      amount: 150.00,
      service: "Consulta Cardiologia",
      date: "2024-01-15",
      status: "paid",
      method: "credit_card"
    },
    {
      id: 2,
      client: "Pedro Santos",
      amount: 200.00,
      service: "Consulta Dermatologia",
      date: "2024-01-14",
      status: "pending",
      method: "pix"
    },
    {
      id: 3,
      client: "Julia Costa",
      amount: 180.00,
      service: "Consulta Ortopedia",
      date: "2024-01-13",
      status: "paid",
      method: "debit_card"
    },
    {
      id: 4,
      client: "Roberto Lima",
      amount: 120.00,
      service: "Consulta Geral",
      date: "2024-01-12",
      status: "overdue",
      method: "bank_slip"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">Pago</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Cartão de Crédito";
      case "debit_card":
        return "Cartão de Débito";
      case "pix":
        return "PIX";
      case "bank_slip":
        return "Boleto";
      default:
        return "Não informado";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-mobile space-y-6">
      {/* Period Filter */}
      <Card className="shadow-mobile-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Stats */}
      <div className="grid grid-cols-2 gap-4">
        {paymentStats.map((stat, index) => (
          <Card key={index} className="shadow-mobile-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-mobile-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="gradient" className="h-12">
              <Plus className="h-4 w-4 mr-2" />
              Nova Cobrança
            </Button>
            <Button variant="outline" className="h-12">
              <Download className="h-4 w-4 mr-2" />
              Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Setup */}
      <Card className="shadow-mobile-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-mobile text-center">
              <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Cartão</p>
              <p className="text-xs text-muted-foreground">Configurado</p>
            </div>
            <div className="p-3 bg-muted rounded-mobile text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-sm font-medium">PIX</p>
              <p className="text-xs text-muted-foreground">Ativo</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Configurar Métodos
          </Button>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="shadow-mobile-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Pagamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="p-3 bg-muted rounded-mobile">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{payment.client}</h4>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{payment.service}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(payment.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span>{getPaymentMethodLabel(payment.method)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    R$ {payment.amount.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {payments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum pagamento registrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Analytics */}
      <Card className="shadow-mobile-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
              <span className="font-medium">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ticket Médio</span>
              <span className="font-medium">R$ 162,50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Crescimento Mensal</span>
              <span className="font-medium text-success">+12%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;