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
    console.log("AuthProvider inicializado");
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Evento de autenticação:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Evitar loop infinito ao chamar funções Supabase dentro do callback
          setTimeout(async () => {
            await fetchUserRole(currentSession.user.id);
            
            // Se for evento de login, verificar/criar o perfil de tutor se necessário
            if (event === 'SIGNED_IN') {
              const { data: userRole } = await supabase.rpc('get_user_role', { 
                user_id: currentSession.user.id 
              });
              
              // Se for um tutor, verifica se já tem perfil na tabela tutores
              if (userRole === 'tutor') {
                const { data: tutorProfile, error: tutorError } = await supabase
                  .from('tutores')
                  .select('*')
                  .eq('user_id', currentSession.user.id)
                  .maybeSingle();
                
                // Se não tiver perfil, cria um
                if (!tutorProfile && !tutorError) {
                  console.log("Criando perfil de tutor para usuário existente:", currentSession.user.id);
                  
                  const userData = currentSession.user.user_metadata;
                  const userName = userData.name || userData.full_name || 'Usuário';
                  
                  await supabase.from('tutores').insert({
                    user_id: currentSession.user.id,
                    nome: userName,
                    email: currentSession.user.email
                  });
                }
              }
            }
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // Verificar sessão atual ao iniciar
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Sessão atual recuperada:", currentSession ? "Existe" : "Não existe");
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
      console.log("Buscando papel do usuário:", userId);
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id: userId });
      
      if (error) {
        console.error("Erro ao buscar papel:", error);
        throw error;
      }
      
      const userRole = data as UserRole;
      console.log("Papel do usuário encontrado:", userRole);
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
    console.log("Redirecionando com base no papel:", userRole);
    
    // Garantindo que o redirecionamento aconteça após um pequeno delay
    // para evitar problemas de timing com a atualização do estado
    setTimeout(() => {
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
    }, 100);
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Iniciando login para:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro durante login:", error);
        throw error;
      }
      
      console.log("Login bem-sucedido para:", email);
      toast({
        title: "Login realizado",
        description: "Você está conectado com sucesso!"
      });
      
      if (data.user) {
        console.log("Usuário autenticado, buscando papel...");
        const userId = data.user.id;
        await fetchUserRole(userId);
        
        // Garantir que o redirecionamento aconteça após obter o papel
        if (data.user && data.session) {
          const { data: roleData } = await supabase.rpc('get_user_role', { 
            user_id: userId 
          });
          
          if (roleData) {
            console.log("Redirecionando após login com papel:", roleData);
            redirectBasedOnRole(roleData as UserRole);
          }
        }
      }
    } catch (error: any) {
      console.error("Erro capturado durante login:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro durante o login.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, roleType: string) => {
    try {
      setIsLoading(true);
      console.log("Iniciando cadastro para:", email);
      
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

      if (error) {
        console.error("Erro durante cadastro:", error);
        throw error;
      }
      
      console.log("Cadastro bem-sucedido para:", email);
      toast({
        title: "Cadastro realizado",
        description: "Sua conta foi criada com sucesso!"
      });
    } catch (error: any) {
      console.error("Erro capturado durante cadastro:", error);
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
      console.log("Iniciando logout");
      
      await supabase.auth.signOut();
      
      console.log("Logout bem-sucedido");
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    } catch (error: any) {
      console.error("Erro durante logout:", error);
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
      console.log("Definindo papel do usuário para:", newRole);
      
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
      console.error("Erro ao definir perfil:", error);
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
