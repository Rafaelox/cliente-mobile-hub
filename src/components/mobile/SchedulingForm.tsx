import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Save, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulingFormProps {
  onClose: () => void;
  onSave: () => void;
}

export default function SchedulingForm({ onClose, onSave }: SchedulingFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [consultors, setConsultors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    cliente_id: "",
    consultor_id: "",
    servico_id: "",
    data_agendamento: "",
    observacoes: "",
  });

  const { toast } = useToast();

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, consultorsRes, servicesRes] = await Promise.all([
        supabase.from('clientes').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('consultores').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('servicos').select('id, nome, preco').eq('ativo', true).order('nome')
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (consultorsRes.error) throw consultorsRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setClients(clientsRes.data || []);
      setConsultors(consultorsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.data_agendamento) {
      toast({
        title: "Erro",
        description: "Selecione a data e horário",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const [year, month, day] = selectedDate.toISOString().split('T')[0].split('-');
      const [hours, minutes] = formData.data_agendamento.split(':');
      const scheduledDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      ).toISOString();

      const selectedService = services.find(s => s.id === parseInt(formData.servico_id));
      const selectedConsultor = consultors.find(c => c.id === parseInt(formData.consultor_id));

      const agendamento = {
        cliente_id: parseInt(formData.cliente_id),
        consultor_id: parseInt(formData.consultor_id),
        servico_id: parseInt(formData.servico_id),
        data_agendamento: scheduledDateTime,
        valor_servico: selectedService?.preco || 0,
        comissao_consultor: selectedConsultor?.percentual_comissao || 0,
        observacoes: formData.observacoes,
        status: 'agendado'
      };

      const { error } = await supabase
        .from('agenda')
        .insert([agendamento]);

      if (error) throw error;

      toast({
        title: "Agendamento criado!",
        description: "O agendamento foi criado com sucesso.",
      });

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar agendamento",
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
          <CardTitle className="text-xl">Novo Agendamento</CardTitle>
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
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultor_id">Consultor *</Label>
              <Select
                value={formData.consultor_id}
                onValueChange={(value) => setFormData({ ...formData, consultor_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultors.map((consultor) => (
                    <SelectItem key={consultor.id} value={consultor.id.toString()}>
                      {consultor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servico_id">Serviço *</Label>
              <Select
                value={formData.servico_id}
                onValueChange={(value) => setFormData({ ...formData, servico_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.nome} - R$ {service.preco?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário *</Label>
              <Select
                value={formData.data_agendamento}
                onValueChange={(value) => setFormData({ ...formData, data_agendamento: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações do agendamento..."
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
                    Agendar
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