import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";
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
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    receitaTotal: 0,
    pendente: 0,
    esteMes: 0,
    recebido: 0
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, [selectedPeriod]);

  const fetchPaymentData = async () => {
    try {
      // Buscar todos os pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagamentos')
        .select(`
          *,
          clientes:cliente_id (nome),
          servicos:servico_id (nome),
          formas_pagamento:forma_pagamento_id (nome)
        `)
        .order('data_pagamento', { ascending: false })
        .limit(50);

      if (paymentsError) throw paymentsError;

      // Calcular estatísticas
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const entradas = paymentsData?.filter(p => p.tipo_transacao === 'entrada') || [];
      const receitaTotal = entradas.reduce((sum, p) => sum + (p.valor || 0), 0);
      const esteMes = entradas
        .filter(p => new Date(p.data_pagamento) >= firstDayOfMonth)
        .reduce((sum, p) => sum + (p.valor || 0), 0);

      // Buscar pagamentos pendentes (histórico sem pagamento registrado)
      const { data: historicoSemPagamento, error: historicoError } = await supabase
        .from('historico')
        .select(`
          *,
          pagamentos:pagamentos!atendimento_id (id)
        `)
        .is('pagamentos.id', null);

      if (historicoError) throw historicoError;

      const pendente = historicoSemPagamento?.reduce((sum, h) => sum + (h.valor_final || h.valor_servico || 0), 0) || 0;

      setStats({
        receitaTotal,
        pendente,
        esteMes,
        recebido: receitaTotal
      });

      setPayments(paymentsData || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de pagamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (payment: any) => {
    if (payment.tipo_transacao === 'entrada') {
      return <Badge className="bg-green-100 text-green-800">Recebido</Badge>;
    } else {
      return <Badge variant="destructive">Saída</Badge>;
    }
  };

  const getStatusIcon = (payment: any) => {
    if (payment.tipo_transacao === 'entrada') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSaveForm = () => {
    fetchPaymentData();
    setShowForm(false);
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

  const paymentStats = [
    { title: "Receita Total", value: formatCurrency(stats.receitaTotal), icon: DollarSign, color: "text-green-600" },
    { title: "Pendente", value: formatCurrency(stats.pendente), icon: Clock, color: "text-orange-600" },
    { title: "Este Mês", value: formatCurrency(stats.esteMes), icon: TrendingUp, color: "text-primary" },
    { title: "Recebido", value: formatCurrency(stats.recebido), icon: CheckCircle, color: "text-green-600" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Period Filter */}
      <Card className="shadow-lg border-0">
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
          <Card key={index} className="shadow-lg border-0 bg-secondary">
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
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="default" 
              className="h-12"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
            <Button variant="outline" className="h-12">
              <Download className="h-4 w-4 mr-2" />
              Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Pagamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="p-3 bg-muted rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {getStatusIcon(payment)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{payment.clientes?.nome}</h4>
                      {getStatusBadge(payment)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{payment.servicos?.nome}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(payment.data_pagamento).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span>{payment.formas_pagamento?.nome}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${payment.tipo_transacao === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {payment.tipo_transacao === 'saida' ? '- ' : ''}{formatCurrency(payment.valor)}
                  </p>
                  {payment.numero_parcelas > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {payment.numero_parcelas}x parcelas
                    </p>
                  )}
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
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total de Transações</span>
              <span className="font-medium">{payments.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ticket Médio</span>
              <span className="font-medium">
                {payments.length > 0 ? formatCurrency(stats.receitaTotal / payments.filter(p => p.tipo_transacao === 'entrada').length) : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eficiência de Cobrança</span>
              <span className="font-medium text-green-600">
                {stats.pendente > 0 ? Math.round((stats.recebido / (stats.recebido + stats.pendente)) * 100) : 100}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form Modal */}
      {showForm && (
        <PaymentForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveForm}
        />
      )}
    </div>
  );
};

export default Payments;