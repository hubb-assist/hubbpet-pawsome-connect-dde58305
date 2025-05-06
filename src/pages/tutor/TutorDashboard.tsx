
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const TutorDashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro durante o logout.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bem-vindo, Tutor!</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meus Pets</CardTitle>
            <CardDescription>Gerencie seus animais de estimação</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Você ainda não cadastrou nenhum pet.</p>
            <button className="mt-4 px-4 py-2 bg-[#DD6B20] text-white rounded-md hover:bg-[#DD6B20]/80">
              Adicionar Pet
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>Suas consultas veterinárias</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Nenhum agendamento encontrado.</p>
            <button className="mt-4 px-4 py-2 bg-[#2D113F] text-white rounded-md hover:bg-[#2D113F]/80">
              Buscar Veterinários
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Veterinários Próximos</CardTitle>
            <CardDescription>Encontre profissionais por perto</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Encontre veterinários por localização, especialidade ou tipo de atendimento.</p>
            <button className="mt-4 px-4 py-2 bg-[#C52339] text-white rounded-md hover:bg-[#C52339]/80">
              Pesquisar
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorDashboard;
