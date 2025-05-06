
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'veterinario' | 'tutor' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Evitar loop infinito ao chamar funções Supabase dentro do callback
          setTimeout(async () => {
            await fetchUserRole(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Verificar sessão atual ao iniciar
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Recuperar o papel do usuário do Supabase
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id: userId });
      
      if (error) throw error;
      
      const userRole = data as UserRole;
      setUserRole(userRole);
      
      // Redirecionar com base no papel, exceto se já estiver em uma rota apropriada
      if (userRole && !isValidRouteForRole(location.pathname, userRole)) {
        redirectBasedOnRole(userRole);
      }
    } catch (error) {
      console.error('Erro ao buscar papel do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível determinar seu tipo de usuário."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidRouteForRole = (path: string, userRole: UserRole): boolean => {
    if (path === '/auth' || path === '/escolher-perfil') return true;
    
    switch (userRole) {
      case 'admin': return path.startsWith('/admin');
      case 'veterinario': return path.startsWith('/vet');
      case 'tutor': return path.startsWith('/tutor');
      default: return false;
    }
  };

  const redirectBasedOnRole = (userRole: UserRole) => {
    switch (userRole) {
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
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Login realizado",
        description: "Você está conectado com sucesso!"
      });
      
      if (data.user && !role) {
        await fetchUserRole(data.user.id);
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro durante o login.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, roleType: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: roleType,
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Cadastro realizado",
        description: "Sua conta foi criada com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro durante o cadastro.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message || "Ocorreu um erro durante o logout.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setRole = async (newRole: UserRole) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");
      
      // Ao escolher um perfil, salvamos como metadata no usuário
      const { error } = await supabase.auth.updateUser({
        data: { role: newRole }
      });

      if (error) throw error;
      
      setUserRole(newRole);
      toast({
        title: "Perfil definido",
        description: `Seu perfil foi definido como ${newRole === 'tutor' ? 'Tutor' : 'Veterinário'}.`
      });
      
      redirectBasedOnRole(newRole);
    } catch (error: any) {
      toast({
        title: "Erro ao definir perfil",
        description: error.message || "Não foi possível definir seu perfil.",
        variant: "destructive"
      });
    }
  };

  const value = {
    session,
    user,
    role,
    isLoading,
    signIn,
    signUp,
    signOut,
    setRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
