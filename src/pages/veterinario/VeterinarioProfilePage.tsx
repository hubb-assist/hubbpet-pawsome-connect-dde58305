
import React from 'react';
import { VeterinarioProfileForm } from '@/components/veterinario/VeterinarioProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VeterinarioPerfilPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dados Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <VeterinarioProfileForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default VeterinarioPerfilPage;
