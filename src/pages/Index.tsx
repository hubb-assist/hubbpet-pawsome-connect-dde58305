
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LandingPage from './landing/LandingPage';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar se o usuário já está autenticado ao carregar a página inicial
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Buscar o papel do usuário para redirecionamento
        const { data: role } = await supabase.rpc('get_user_role', { 
          user_id: session.user.id 
        });
        
        if (role) {
          switch (role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'veterinario':
              navigate('/vet');
              break;
            case 'tutor':
              navigate('/tutor');
              break;
            default:
              // Não redireciona para escolher perfil se já autenticado
              // mas sem perfil definido
              console.log('Usuário autenticado mas sem perfil definido');
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  return <LandingPage />;
};

export default Index;
