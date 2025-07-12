import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";

interface QuickActionsProps {
  onNavigateToClients?: () => void;
  onNavigateToScheduling?: () => void;
}

const QuickActions = ({ onNavigateToClients, onNavigateToScheduling }: QuickActionsProps) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="default" 
            className="h-12"
            onClick={onNavigateToClients}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
          <Button 
            variant="outline" 
            className="h-12"
            onClick={onNavigateToScheduling}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;