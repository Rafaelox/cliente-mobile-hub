import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  FileText,
  History as HistoryIcon 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientHistoryProps {
  clientId?: string;
}

const ClientHistory = ({ clientId }: ClientHistoryProps) => {
  const [selectedClient, setSelectedClient] = useState<string>(clientId || "");
  const [clients, setClients] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchHistorico();
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorico = async () => {
    if (!selectedClient) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('historico')
        .select(`
          *,
          consultores:consultor_id (nome),
          servicos:servico_id (nome),
          formas_pagamento:forma_pagamento (nome)
        `)
        .eq('cliente_id', parseInt(selectedClient))
        .order('data_atendimento', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalSpent = () => {
    return historico.reduce((total, item) => total + (item.valor_final || item.valor_servico || 0), 0);
  };

  const getTotalVisits = () => {
    return historico.length;
  };

  return (
    <div className="p-mobile space-y-6">
      {/* Client Selector */}
      <Card className="shadow-elegant border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Histórico do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-elegant border-0 bg-gradient-soft">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{getTotalVisits()}</p>
                <p className="text-sm text-muted-foreground">Total de Consultas</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant border-0 bg-gradient-soft">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-success">
                  R$ {getTotalSpent().toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
              </CardContent>
            </Card>
          </div>

          {/* History List */}
          <Card className="shadow-elegant border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Consultas Realizadas</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando histórico...</p>
                </div>
              ) : historico.length === 0 ? (
                <div className="text-center py-8">
                  <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhuma consulta encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historico.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{item.servicos?.nome}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(item.data_atendimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-success border-success">
                          Concluído
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{item.consultores?.nome}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>R$ {(item.valor_final || item.valor_servico)?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {item.forma_pagamento && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-xs">Pagamento:</span>
                              <span>{item.formas_pagamento?.nome}</span>
                            </div>
                          )}
                          {item.comissao_consultor && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-xs">Comissão:</span>
                              <span>R$ {item.comissao_consultor?.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Observations */}
                      {item.observacoes_atendimento && (
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                              <p className="text-muted-foreground">{item.observacoes_atendimento}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Procedures */}
                      {item.procedimentos_realizados && (
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Procedimentos:</p>
                              <p className="text-muted-foreground">{item.procedimentos_realizados}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Photos */}
                      {item.fotos_urls && item.fotos_urls.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">
                            Fotos: {item.fotos_urls.length} anexo(s)
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ClientHistory;