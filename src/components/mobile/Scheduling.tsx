import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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

  const consultants = [
    { id: "1", name: "Dr. João Silva", specialty: "Cardiologia", avatar: "JS" },
    { id: "2", name: "Dra. Ana Costa", specialty: "Dermatologia", avatar: "AC" },
    { id: "3", name: "Dr. Pedro Santos", specialty: "Ortopedia", avatar: "PS" },
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30"
  ];

  const appointments = [
    { 
      id: 1, 
      client: "Maria Silva", 
      time: "09:00", 
      consultant: "Dr. João Silva", 
      status: "confirmed",
      date: "2024-01-15"
    },
    { 
      id: 2, 
      client: "Pedro Santos", 
      time: "10:30", 
      consultant: "Dra. Ana Costa", 
      status: "pending",
      date: "2024-01-15"
    },
    { 
      id: 3, 
      client: "Julia Costa", 
      time: "14:00", 
      consultant: "Dr. João Silva", 
      status: "confirmed",
      date: "2024-01-15"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success text-success-foreground">Confirmado</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  return (
    <div className="p-mobile space-y-6">
      {/* Quick Actions */}
      <Card className="shadow-elegant border-0">
        <CardContent className="p-4">
          <Button variant="elegant" className="w-full h-12">
            <Plus className="h-5 w-5 mr-2" />
            Novo Agendamento
          </Button>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="shadow-elegant border-0">
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
      <Card className="shadow-elegant border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Selecionar Consultor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um consultor" />
            </SelectTrigger>
            <SelectContent>
              {consultants.map((consultant) => (
                <SelectItem key={consultant.id} value={consultant.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">
                      {consultant.avatar}
                    </div>
                    <span>{consultant.name} - {consultant.specialty}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Consultant Cards */}
          <div className="space-y-2">
            {consultants.map((consultant) => (
              <div
                key={consultant.id}
                className={`p-3 rounded-mobile border cursor-pointer transition-colors ${
                  selectedConsultant === consultant.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-muted'
                }`}
                onClick={() => setSelectedConsultant(consultant.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{consultant.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium">{consultant.name}</p>
                    <p className="text-sm text-muted-foreground">{consultant.specialty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Time Slots */}
      {selectedDate && selectedConsultant && (
        <Card className="shadow-elegant border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Horários Disponíveis</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  className="h-10"
                >
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Appointments */}
      <Card className="shadow-elegant border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-3 bg-muted rounded-mobile">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{appointment.client}</h4>
                      {getStatusIcon(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{appointment.consultant}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{appointment.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scheduling;