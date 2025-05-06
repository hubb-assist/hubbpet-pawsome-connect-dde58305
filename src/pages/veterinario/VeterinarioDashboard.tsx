
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VeterinarioDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bem-vindo, Veterinário!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meus Serviços</CardTitle>
            <CardDescription>Gerencie os serviços que você oferece</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Você ainda não cadastrou nenhum serviço.</p>
            <button className="mt-4 px-4 py-2 bg-[#DD6B20] text-white rounded-md hover:bg-[#DD6B20]/80">
              Adicionar Serviço
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>Suas consultas agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Nenhum agendamento encontrado.</p>
            <button className="mt-4 px-4 py-2 bg-[#2D113F] text-white rounded-md hover:bg-[#2D113F]/80">
              Ver Calendário
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Sua visibilidade para os tutores</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Complete seu perfil para aumentar suas chances de ser encontrado.</p>
            <button className="mt-4 px-4 py-2 bg-[#C52339] text-white rounded-md hover:bg-[#C52339]/80">
              Editar Perfil
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VeterinarioDashboard;
