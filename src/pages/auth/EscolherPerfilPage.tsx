
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';

const EscolherPerfilPage: React.FC = () => {
  const { setRole, isLoading } = useAuth();

  const handleSelectRole = (selectedRole: UserRole) => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-center p-4">
        <a href="/">
          <div className="icon-container">
            <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_icon.png" alt="HubbPet" />
          </div>
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Card className="border-[#2D113F]/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-6">
                <div className="logo-container">
                  <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png" alt="HubbPet" />
                </div>
              </div>
              <CardTitle className="text-2xl text-[#2D113F]">Escolha seu perfil</CardTitle>
              <CardDescription>
                Para continuar, selecione como você deseja usar o HubbPet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-[#2D113F]/10 hover:border-[#2D113F]/30 cursor-pointer transition-all" 
                  onClick={() => handleSelectRole('tutor')}>
                  <CardHeader>
                    <CardTitle className="text-[#2D113F]">Tutor de Pet</CardTitle>
                    <CardDescription>
                      Encontre os melhores veterinários para seu pet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <img src="https://sq360.com.br/logo-hubb-novo/tutor_icon.png" 
                        alt="Tutor" className="h-32 w-32 object-contain" />
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>✓ Agende consultas com veterinários</li>
                      <li>✓ Gerencie seu(s) pet(s)</li>
                      <li>✓ Acompanhe históricos médicos</li>
                      <li>✓ Encontre profissionais por localização</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-[#2D113F] hover:bg-[#2D113F]/80" 
                      onClick={() => handleSelectRole('tutor')}
                      disabled={isLoading}>
                      {isLoading ? "Processando..." : "Selecionar como Tutor"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-[#C52339]/10 hover:border-[#C52339]/30 cursor-pointer transition-all"
                  onClick={() => handleSelectRole('veterinario')}>
                  <CardHeader>
                    <CardTitle className="text-[#C52339]">Veterinário</CardTitle>
                    <CardDescription>
                      Ofereça seus serviços e seja encontrado por tutores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <img src="https://sq360.com.br/logo-hubb-novo/vet_icon.png" 
                        alt="Veterinário" className="h-32 w-32 object-contain" />
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>✓ Gerencie sua agenda de atendimentos</li>
                      <li>✓ Defina horários e valores de consultas</li>
                      <li>✓ Seja encontrado por tutores próximos</li>
                      <li>✓ Gerenciamento completo de pacientes</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-[#C52339] hover:bg-[#C52339]/80" 
                      onClick={() => handleSelectRole('veterinario')}
                      disabled={isLoading}>
                      {isLoading ? "Processando..." : "Selecionar como Veterinário"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EscolherPerfilPage;
