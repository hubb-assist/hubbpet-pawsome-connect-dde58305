
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bem-vindo, Administrador!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Veterinários</CardTitle>
            <CardDescription>Gerencie os veterinários da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Veterinários pendentes de aprovação: 0</p>
            <button className="mt-4 px-4 py-2 bg-[#2D113F] text-white rounded-md hover:bg-[#2D113F]/80">
              Gerenciar Veterinários
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tutores</CardTitle>
            <CardDescription>Gerencie os tutores da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Total de tutores cadastrados: 0</p>
            <button className="mt-4 px-4 py-2 bg-[#2D113F] text-white rounded-md hover:bg-[#2D113F]/80">
              Ver Tutores
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>Visão geral dos agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Total de agendamentos: 0</p>
            <button className="mt-4 px-4 py-2 bg-[#2D113F] text-white rounded-md hover:bg-[#2D113F]/80">
              Ver Agendamentos
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
