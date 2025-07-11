import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Save, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface PaymentFormProps {
  onClose: () => void;
  onSave: () => void;
}

export default function PaymentForm({ onClose, onSave }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    atendimento_id: "",
    forma_pagamento_id: "",
    valor: "",
    numero_parcelas: "1",
    observacoes: "",
    tipo_transacao: "entrada",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar histórico de atendimentos sem pagamento
      const { data: historicoData, error: historicoError } = await supabase
        .from('historico')
        .select(`
          *,
          clientes:cliente_id (nome),
          servicos:servico_id (nome),
          consultores:consultor_id (nome)
        `)
        .order('data_atendimento', { ascending: false });

      if (historicoError) throw historicoError;

      // Buscar formas de pagamento
      const { data: formasData, error: formasError } = await supabase
        .from('formas_pagamento')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (formasError) throw formasError;

      setHistorico(historicoData || []);
      setFormasPagamento(formasData || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    }
  };

  const handleAtendimentoChange = (atendimentoId: string) => {
    const atendimento = historico.find(h => h.id === parseInt(atendimentoId));
    setFormData({
      ...formData,
      atendimento_id: atendimentoId,
      valor: atendimento ? (atendimento.valor_final || atendimento.valor_servico || 0).toString() : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const atendimento = historico.find(h => h.id === parseInt(formData.atendimento_id));
      if (!atendimento) {
        throw new Error("Atendimento não encontrado");
      }

      const pagamento = {
        atendimento_id: parseInt(formData.atendimento_id),
        cliente_id: atendimento.cliente_id,
        consultor_id: atendimento.consultor_id,
        servico_id: atendimento.servico_id,
        forma_pagamento_id: parseInt(formData.forma_pagamento_id),
        valor: parseFloat(formData.valor),
        valor_original: atendimento.valor_final || atendimento.valor_servico,
        numero_parcelas: parseInt(formData.numero_parcelas),
        tipo_transacao: formData.tipo_transacao,
        observacoes: formData.observacoes,
        data_pagamento: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('pagamentos')
        .insert([pagamento]);

      if (error) throw error;

      toast({
        title: "Pagamento registrado!",
        description: "O pagamento foi registrado com sucesso.",
      });

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Registrar Pagamento</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="atendimento_id">Atendimento *</Label>
              <Select
                value={formData.atendimento_id}
                onValueChange={handleAtendimentoChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o atendimento" />
                </SelectTrigger>
                <SelectContent>
                  {historico.map((atendimento) => (
                    <SelectItem key={atendimento.id} value={atendimento.id.toString()}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {atendimento.clientes?.nome} - {atendimento.servicos?.nome}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(atendimento.data_atendimento), "dd/MM/yyyy")} - 
                          R$ {(atendimento.valor_final || atendimento.valor_servico)?.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento_id">Forma de Pagamento *</Label>
              <Select
                value={formData.forma_pagamento_id}
                onValueChange={(value) => setFormData({ ...formData, forma_pagamento_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma.id} value={forma.id.toString()}>
                      {forma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <div className="relative">
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_parcelas">Número de Parcelas</Label>
              <Select
                value={formData.numero_parcelas}
                onValueChange={(value) => setFormData({ ...formData, numero_parcelas: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_transacao">Tipo</Label>
              <Select
                value={formData.tipo_transacao}
                onValueChange={(value) => setFormData({ ...formData, tipo_transacao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações do pagamento..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Registrar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}