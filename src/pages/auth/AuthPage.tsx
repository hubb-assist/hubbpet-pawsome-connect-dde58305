
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

const AuthPage = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Se o usuário já estiver autenticado e tiver um papel, redirecionar para a dashboard apropriada
    if (user && role) {
      console.log("Usuário já autenticado na página de login, redirecionando...");
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
          navigate('/escolher-perfil');
      }
    }
  }, [user, role, navigate]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (user && role) {
    return null; // Não renderizar nada enquanto estamos redirecionando
  }
  
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
        <AuthForm />
      </div>
      <div className="p-4 text-center text-sm text-gray-500">
        © 2025 HubbPet. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default AuthPage;
