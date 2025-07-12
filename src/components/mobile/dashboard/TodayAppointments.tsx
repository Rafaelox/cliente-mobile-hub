import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

interface Appointment {
  id: number;
  status: string;
  data_agendamento: string;
  clientes?: { nome: string };
  consultores?: { nome: string };
}

interface TodayAppointmentsProps {
  appointments: Appointment[];
  onConfirmAppointment: (appointmentId: number) => void;
}

const TodayAppointments = ({ appointments, onConfirmAppointment }: TodayAppointmentsProps) => {
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Agendamentos de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.map((appointment) => (
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
                  onClick={() => onConfirmAppointment(appointment.id)}
                  className="h-6 px-2 text-xs"
                >
                  Confirmar
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {appointments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum agendamento para hoje</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;