import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  User,
  Filter,
  MoreVertical,
  Calendar,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const clients = [
    { 
      id: 1, 
      name: "Maria Silva", 
      email: "maria@email.com", 
      phone: "(11) 99999-9999",
      status: "active",
      lastConsult: "2024-01-15",
      totalConsults: 5
    },
    { 
      id: 2, 
      name: "Pedro Santos", 
      email: "pedro@email.com", 
      phone: "(11) 88888-8888",
      status: "pending",
      lastConsult: "2024-01-10",
      totalConsults: 2
    },
    { 
      id: 3, 
      name: "Julia Costa", 
      email: "julia@email.com", 
      phone: "(11) 77777-7777",
      status: "active",
      lastConsult: "2024-01-20",
      totalConsults: 8
    },
    { 
      id: 4, 
      name: "Roberto Lima", 
      email: "roberto@email.com", 
      phone: "(11) 66666-6666",
      status: "inactive",
      lastConsult: "2023-12-01",
      totalConsults: 1
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "inactive":
        return <Badge variant="outline">Inativo</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="p-mobile space-y-6">
      {/* Header Actions */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button size="sm" variant="outline">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Add New Client */}
      <Card className="shadow-elegant border-0">
        <CardContent className="p-4">
          <Button variant="gradient" className="w-full h-12">
            <Plus className="h-5 w-5 mr-2" />
            Cadastrar Novo Cliente
          </Button>
        </CardContent>
      </Card>

      {/* Client Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-elegant border-0 bg-gradient-soft">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{clients.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="shadow-elegant border-0 bg-gradient-soft">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-success">
              {clients.filter(c => c.status === "active").length}
            </p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="shadow-elegant border-0 bg-gradient-soft">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-warning">
              {clients.filter(c => c.status === "pending").length}
            </p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="shadow-elegant border-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{client.name}</h3>
                      {getStatusBadge(client.status)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{client.totalConsults} consultas</span>
                        <span>Última: {new Date(client.lastConsult).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="shadow-mobile-md">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientManagement;