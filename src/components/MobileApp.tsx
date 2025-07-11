import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  Users, 
  Calendar, 
  CreditCard, 
  Bell
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Dashboard from "./mobile/Dashboard";
import ClientManagement from "./mobile/ClientManagement";
import Scheduling from "./mobile/Scheduling";
import Payments from "./mobile/Payments";

const MobileApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-elegant text-primary-foreground p-mobile border-b shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ConsultApp</h1>
            <p className="text-sm text-primary-foreground/80">Agendamentos Profissionais</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Bell className="h-5 w-5" />
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="dashboard" className="mt-0">
            <Dashboard />
          </TabsContent>
          <TabsContent value="clients" className="mt-0">
            <ClientManagement />
          </TabsContent>
          <TabsContent value="schedule" className="mt-0">
            <Scheduling />
          </TabsContent>
          <TabsContent value="payments" className="mt-0">
            <Payments />
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t shadow-elegant">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-16">
            <TabsTrigger 
              value="dashboard" 
              className="flex flex-col gap-1 rounded-mobile data-[state=active]:bg-gradient-soft data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Início</span>
            </TabsTrigger>
            <TabsTrigger 
              value="clients"
              className="flex flex-col gap-1 rounded-mobile data-[state=active]:bg-gradient-soft data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Clientes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule"
              className="flex flex-col gap-1 rounded-mobile data-[state=active]:bg-gradient-soft data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Agenda</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className="flex flex-col gap-1 rounded-mobile data-[state=active]:bg-gradient-soft data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Pagamentos</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileApp;