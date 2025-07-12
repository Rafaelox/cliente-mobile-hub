import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SchedulingForm from "./SchedulingForm";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedConsultant, setSelectedConsultant] = useState<string>("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments();
    }
  }, [selectedDate, selectedConsultant]);

  const fetchData = async () => {
    try {
      const { data: consultorsData, error: consultorsError } = await supabase
        .from('consultores')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (consultorsError) throw consultorsError;
      setConsultants(consultorsData || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar consultores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!selectedDate) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      let query = supabase
        .from('agenda')
        .select(`
          *,
          clientes:cliente_id (nome),
          consultores:consultor_id (nome),
          servicos:servico_id (nome)
        `)
        .gte('data_agendamento', dateStr)
        .lt('data_agendamento', new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('data_agendamento');

      if (selectedConsultant && selectedConsultant !== "all") {
        query = query.eq('consultor_id', parseInt(selectedConsultant));
      }

      const { data, error } = await query;
      if (error) throw error;

      setAppointments(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "agendado":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "cancelado":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-success text-success-foreground">Confirmado</Badge>;
      case "agendado":
        return <Badge variant="secondary">Agendado</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('agenda')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Agendamento ${newStatus} com sucesso.`,
      });

      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const handleSaveForm = () => {
    fetchAppointments();
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

  return (
    <div className="p-4 space-y-6">
      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <Button 
            variant="default" 
            className="w-full h-12"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Agendamento
          </Button>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
            Selecionar Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Consultant Selection */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtrar por Consultor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os consultores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os consultores</SelectItem>
              {consultants.map((consultant) => (
                <SelectItem key={consultant.id} value={consultant.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">
                      {consultant.nome.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <span>{consultant.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Agendamentos
            {selectedDate && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                - {selectedDate.toLocaleDateString('pt-BR')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-3 bg-muted rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{appointment.clientes?.nome}</h4>
                      {getStatusIcon(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{appointment.consultores?.nome}</p>
                    <p className="text-sm text-muted-foreground mb-1">{appointment.servicos?.nome}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{formatTime(appointment.data_agendamento)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(appointment.status)}
                  {appointment.status === 'agendado' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmado')}
                        className="h-6 px-2 text-xs"
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelado')}
                        className="h-6 px-2 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {appointment.observacoes && (
                <div className="mt-2 p-2 bg-background rounded text-sm">
                  <span className="font-medium">Observações: </span>
                  {appointment.observacoes}
                </div>
              )}
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento para esta data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling Form Modal */}
      {showForm && (
        <SchedulingForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveForm}
        />
      )}
    </div>
  );
};

export default Scheduling;