
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { LogOut, PawPrint, Calendar, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TutorDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [petCount, setPetCount] = useState<number>(0);
  const [appointmentCount, setAppointmentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTutorId();
    }
  }, [user]);

  useEffect(() => {
    if (tutorId) {
      fetchPetCount();
      fetchAppointmentCount();
    }
  }, [tutorId]);

  const fetchTutorId = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tutores')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setTutorId(data.id);
    } catch (error: any) {
      console.error('Erro ao buscar tutor_id:', error.message);
    }
  };

  const fetchPetCount = async () => {
    if (!tutorId) return;
    
    try {
      const { count, error } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', tutorId);
      
      if (error) throw error;
      
      setPetCount(count || 0);
    } catch (error: any) {
      console.error('Erro ao buscar quantidade de pets:', error.message);
    }
  };

  const fetchAppointmentCount = async () => {
    if (!tutorId) return;
    
    try {
      const { count, error } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', tutorId)
        .in('status', ['pendente', 'confirmado']);
      
      if (error) throw error;
      
      setAppointmentCount(count || 0);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Erro ao buscar agendamentos:', error.message);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast("Logout realizado", {
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    } catch (error: any) {
      toast("Erro ao fazer logout", {
        description: error.message || "Ocorreu um erro durante o logout."
      });
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard do Tutor</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigateTo('/tutor/pets')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-hubbpet-primary bg-opacity-10 rounded-full">
              <PawPrint className="h-6 w-6 text-hubbpet-primary" />
            </div>
            <h2 className="text-lg font-semibold">Meus Pets</h2>
          </div>
          {isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : (
            <p className="text-gray-500">
              {petCount === 0 ? 'Nenhum pet cadastrado ainda.' : 
               petCount === 1 ? '1 pet cadastrado.' : 
               `${petCount} pets cadastrados.`}
            </p>
          )}
        </div>
        
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigateTo('/tutor/appointments')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-hubbpet-primary bg-opacity-10 rounded-full">
              <Calendar className="h-6 w-6 text-hubbpet-primary" />
            </div>
            <h2 className="text-lg font-semibold">Próximas Consultas</h2>
          </div>
          {isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : (
            <p className="text-gray-500">
              {appointmentCount === 0 ? 'Nenhuma consulta agendada.' : 
               appointmentCount === 1 ? '1 consulta agendada.' : 
               `${appointmentCount} consultas agendadas.`}
            </p>
          )}
        </div>
        
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigateTo('/tutor/search')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-hubbpet-primary bg-opacity-10 rounded-full">
              <Search className="h-6 w-6 text-hubbpet-primary" />
            </div>
            <h2 className="text-lg font-semibold">Veterinários Próximos</h2>
          </div>
          <p className="text-gray-500">Encontre veterinários perto de você.</p>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
