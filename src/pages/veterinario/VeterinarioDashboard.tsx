
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VeterinarioProfileForm from '@/components/veterinario/VeterinarioProfileForm';

const VeterinarioDashboard: React.FC = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchVeterinarioProfile();
    }
  }, [user]);
  
  const fetchVeterinarioProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('veterinarios')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
      }
      
      setPerfil(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showProfileForm) {
    return <VeterinarioProfileForm />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bem-vindo, Veterinário!</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
        </div>
      ) : !perfil ? (
        <Card className="mb-6 bg-gradient-to-r from-[#2D113F] to-[#532972] text-white">
          <CardHeader>
            <CardTitle>Complete seu Perfil Profissional</CardTitle>
            <CardDescription className="text-gray-200">
              Para começar a oferecer seus serviços no HubbPet, você precisa completar seu cadastro profissional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowProfileForm(true)}
              className="bg-[#DD6B20] text-white hover:bg-[#DD6B20]/80"
            >
              Completar Perfil
            </Button>
          </CardContent>
        </Card>
      ) : perfil.status_aprovacao === 'pendente' ? (
        <Card className="mb-6 bg-gradient-to-r from-[#F9C876] to-[#F8E3B5] text-gray-800">
          <CardHeader>
            <CardTitle>Perfil em Análise</CardTitle>
            <CardDescription className="text-gray-600">
              Seu perfil foi enviado e está sendo analisado pela nossa equipe. Em breve você receberá um e-mail com a confirmação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowProfileForm(true)}
              variant="outline"
              className="border-[#DD6B20] text-[#DD6B20] hover:bg-[#DD6B20]/10"
            >
              Editar Perfil
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-gradient-to-r from-[#C5E8B7] to-[#E1F5D6] text-gray-800">
          <CardHeader>
            <CardTitle>Perfil Aprovado</CardTitle>
            <CardDescription className="text-gray-600">
              Seu perfil foi aprovado e está visível para os tutores. Você já pode começar a oferecer seus serviços!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowProfileForm(true)}
              variant="outline"
              className="border-[#2D113F] text-[#2D113F] hover:bg-[#2D113F]/10"
            >
              Editar Perfil
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meus Serviços</CardTitle>
            <CardDescription>Gerencie os serviços que você oferece</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Você ainda não cadastrou nenhum serviço.</p>
            <Link to="/vet/services">
              <Button className="mt-4 bg-[#DD6B20] text-white hover:bg-[#DD6B20]/80">
                Adicionar Serviço
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>Suas consultas agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Nenhum agendamento encontrado.</p>
            <Link to="/vet/agenda">
              <Button className="mt-4 bg-[#2D113F] text-white hover:bg-[#2D113F]/80">
                Ver Calendário
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Sua visibilidade para os tutores</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{perfil ? 'Gerencie seu perfil profissional' : 'Complete seu perfil para aumentar suas chances de ser encontrado.'}</p>
            <Button 
              onClick={() => setShowProfileForm(true)} 
              className="mt-4 bg-[#C52339] text-white hover:bg-[#C52339]/80"
            >
              {perfil ? 'Gerenciar Perfil' : 'Criar Perfil'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VeterinarioDashboard;
