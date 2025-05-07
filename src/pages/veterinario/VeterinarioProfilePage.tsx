
import React from 'react';
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
          <p className="text-gray-600">Formulário de perfil do veterinário em desenvolvimento.</p>
          {/* Será implementado o VeterinarioProfileForm quando estiver disponível */}
        </CardContent>
      </Card>
    </div>
  );
};

export default VeterinarioPerfilPage;
