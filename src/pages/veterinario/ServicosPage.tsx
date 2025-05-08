
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ServicosTable from '@/components/veterinario/servicos/ServicosTable';
import ServicoFormDialog from '@/components/veterinario/servicos/ServicoFormDialog';
import { useAuth } from '@/contexts/AuthContext';

const ServicosPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [servicoToEdit, setServicoToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  console.log('ServicosPage renderizado - User ID:', user?.id);
  
  // Buscar taxa de comissão global
  const { data: configComissao } = useQuery({
    queryKey: ['config-comissao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_configuracoes')
        .select('comissao_padrao')
        .single();

      if (error) throw error;
      return data;
    },
    meta: {
      onError: (error: any) => {
        console.error('Erro ao buscar comissão padrão:', error);
        toast({
          title: "Erro ao buscar comissão padrão",
          description: error.message || "Não foi possível carregar configurações.",
          variant: "destructive"
        });
      }
    }
  });
  
  // Buscar dados do veterinário pelo user_id
  const { data: veterinario, isLoading: isLoadingVeterinario, error: veterinarioError } = useQuery({
    queryKey: ['veterinario-info'],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      try {
        console.log('Buscando dados do veterinário para user_id:', user.id);
        const { data, error } = await supabase
          .from('veterinarios')
          .select('id, nome_completo')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar dados do veterinário:', error);
          
          // Verificar se é erro de autenticação
          if (error.message?.includes('JWT') || error.message?.includes('token')) {
            console.error("Erro de autenticação detectado. Tentando renovar sessão...");
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Falha ao renovar sessão:", refreshError);
              await supabase.auth.signOut();
              window.location.href = '/auth';
              throw new Error("Sessão expirada. Redirecionando para login.");
            } else {
              console.log("Sessão renovada com sucesso. Retentando busca...");
              // Executar a consulta novamente após renovação bem-sucedida
              const { data: newData, error: newError } = await supabase
                .from('veterinarios')
                .select('id, nome_completo')
                .eq('user_id', user.id)
                .single();
              
              if (newError) throw newError;
              return newData;
            }
          } else {
            throw error;
          }
        }
        
        console.log('Dados do veterinário encontrados:', data);
        return data;
      } catch (error: any) {
        console.error('Erro completo ao buscar dados do veterinário:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    meta: {
      onError: (error: any) => {
        console.error('Erro ao buscar dados do veterinário:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seu perfil de veterinário.",
          variant: "destructive"
        });
      }
    }
  });
  
  // Buscar serviços do veterinário
  const { data: servicos, isLoading: isLoadingServicos, error: servicosError } = useQuery({
    queryKey: ['servicos-veterinario', veterinario?.id],
    queryFn: async () => {
      if (!veterinario?.id) {
        console.log('ID do veterinário não disponível para buscar serviços');
        return [];
      }
      
      try {
        console.log('Buscando serviços para veterinário ID:', veterinario.id);
        
        const { data, error } = await supabase
          .from('servicos')
          .select(`
            *,
            procedimentos_servicos (
              procedimento:procedimentos (*)
            )
          `)
          .eq('veterinario_id', veterinario.id)
          .order('nome');

        if (error) {
          console.error('Erro ao buscar serviços:', error);
          
          // Verificar se é erro de autenticação
          if (error.message?.includes('JWT') || error.message?.includes('token')) {
            console.error("Erro de autenticação detectado. Tentando renovar sessão...");
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Falha ao renovar sessão:", refreshError);
              await supabase.auth.signOut();
              window.location.href = '/auth';
              throw new Error("Sessão expirada. Redirecionando para login.");
            } else {
              console.log("Sessão renovada com sucesso. Retentando busca...");
              // Executar a consulta novamente após renovação bem-sucedida
              const { data: newData, error: newError } = await supabase
                .from('servicos')
                .select(`
                  *,
                  procedimentos_servicos (
                    procedimento:procedimentos (*)
                  )
                `)
                .eq('veterinario_id', veterinario.id)
                .order('nome');
              
              if (newError) throw newError;
              return newData || [];
            }
          } else {
            throw error;
          }
        }
        
        console.log('Serviços encontrados:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error('Erro completo ao buscar serviços:', error);
        throw error;
      }
    },
    enabled: !!veterinario?.id,
    meta: {
      onError: (error: any) => {
        console.error('Erro ao carregar serviços:', error);
        toast({
          title: "Erro ao carregar serviços",
          description: error.message || "Não foi possível carregar seus serviços.",
          variant: "destructive"
        });
      }
    }
  });

  // Loga erros para debug
  useEffect(() => {
    if (veterinarioError || servicosError) {
      console.error('Erros ao carregar dados:', {
        veterinarioError,
        servicosError
      });
    }
  }, [veterinarioError, servicosError]);

  const handleEditServico = (servico: any) => {
    setServicoToEdit(servico);
    setIsFormOpen(true);
  };

  const handleDeleteServico = async (servico: any) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        // Primeiro excluir as relações na tabela procedimentos_servicos
        const { error: relError } = await supabase
          .from('procedimentos_servicos')
          .delete()
          .eq('servico_id', servico.id);

        if (relError) throw relError;

        // Depois excluir o serviço
        const { error } = await supabase
          .from('servicos')
          .delete()
          .eq('id', servico.id);

        if (error) throw error;

        toast({
          title: "Serviço excluído",
          description: "O serviço foi removido com sucesso."
        });

        queryClient.invalidateQueries({ queryKey: ['servicos-veterinario'] });

      } catch (error: any) {
        // Verificar se é erro de autenticação
        if (error.message?.includes('JWT') || error.message?.includes('token')) {
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Você será redirecionado para o login.",
            variant: "destructive"
          });
          
          try {
            // Tenta atualizar a sessão
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              await supabase.auth.signOut();
              window.location.href = '/auth';
            } else {
              toast({
                title: "Sessão renovada",
                description: "Por favor, tente novamente.",
              });
            }
          } catch (e) {
            await supabase.auth.signOut();
            window.location.href = '/auth';
          }
        } else {
          toast({
            title: "Erro ao excluir serviço",
            description: error.message || "Não foi possível excluir o serviço.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleCloseDialog = (shouldRefresh: boolean = false) => {
    setIsFormOpen(false);
    setServicoToEdit(null);
    
    if (shouldRefresh) {
      queryClient.invalidateQueries({ queryKey: ['servicos-veterinario', veterinario?.id] });
    }
  };

  const getServicosFiltrados = () => {
    if (!servicos) return [];
    if (!searchTerm.trim()) return servicos;
    
    return servicos.filter(servico => 
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Verifica se existe uma sessão válida
  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      console.error("Erro ao verificar sessão:", error);
      toast({
        title: "Sessão não encontrada",
        description: "Redirecionando para a página de login...",
        variant: "destructive"
      });
      
      await supabase.auth.signOut();
      window.location.href = '/auth';
      return false;
    }
    return true;
  };

  // Verificar sessão ao montar o componente
  useEffect(() => {
    checkSession();
  }, []);

  // Se não houver dados do veterinário ainda, mostrar carregando
  if (!veterinario && !veterinarioError) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Meus Serviços</h1>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#DD6B20]" />
          <span className="ml-2">Carregando perfil de veterinário...</span>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingVeterinario || isLoadingServicos;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Meus Serviços</h1>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-[#DD6B20] text-white hover:bg-[#DD6B20]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Serviço
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#DD6B20]" />
        </div>
      ) : servicosError ? (
        <div className="text-center py-10 text-gray-500">
          <p className="mb-4 text-red-500 font-medium">Não foi possível carregar os serviços</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['servicos-veterinario', veterinario?.id] })}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <ServicosTable 
          servicos={getServicosFiltrados()}
          comissaoGlobal={configComissao?.comissao_padrao || 10}
          onEdit={handleEditServico}
          onDelete={handleDeleteServico}
        />
      )}

      {isFormOpen && (
        <ServicoFormDialog 
          isOpen={isFormOpen} 
          onClose={handleCloseDialog} 
          servicoToEdit={servicoToEdit}
          comissaoGlobal={configComissao?.comissao_padrao || 10}
          veterinarioId={veterinario?.id}
        />
      )}
    </div>
  );
};

export default ServicosPage;
