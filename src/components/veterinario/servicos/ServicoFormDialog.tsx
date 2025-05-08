
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";

interface ServicoFormDialogProps {
  isOpen: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  servicoToEdit: any | null;
  comissaoGlobal: number;
  veterinarioId?: string; // Adicionando como opcional para compatibilidade
}

const ServicoFormDialog = ({ 
  isOpen, 
  onClose, 
  servicoToEdit, 
  comissaoGlobal,
  veterinarioId: propVeterinarioId 
}: ServicoFormDialogProps) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [duracaoMinutos, setDuracaoMinutos] = useState('30');
  const [selectedProcedimentos, setSelectedProcedimentos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [veterinarioId, setVeterinarioId] = useState<string | null>(propVeterinarioId || null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar o ID do registro do veterinário baseado no ID do usuário autenticado
  // apenas se não recebermos o veterinarioId como prop
  const { data: veterinario, isLoading: isLoadingVeterinario } = useQuery({
    queryKey: ['veterinario-perfil', propVeterinarioId],
    queryFn: async () => {
      // Se já temos o ID do veterinário como prop, não precisamos buscar
      if (propVeterinarioId) {
        console.log("Usando veterinarioId da prop:", propVeterinarioId);
        return { id: propVeterinarioId };
      }
      
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Erro ao obter usuário:", userError);
          
          // Verifica se o erro é de refresh token
          if (userError.message?.includes('Invalid Refresh Token')) {
            setAuthError('Sua sessão expirou. Por favor, faça login novamente.');
            try {
              // Tenta atualizar a sessão
              const { error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError) {
                throw refreshError;
              }
            } catch (refreshError) {
              console.error("Não foi possível renovar a sessão:", refreshError);
              // Se falhar na renovação, faz logout
              await supabase.auth.signOut();
              window.location.href = '/auth';
              throw new Error("Sessão expirada. Redirecionando para login...");
            }
          }
          
          throw userError;
        }
        
        if (!userData.user) {
          throw new Error("Usuário não autenticado");
        }
        
        console.log("Buscando perfil do veterinário para user_id:", userData.user.id);
        const { data, error } = await supabase
          .from('veterinarios')
          .select('id')
          .eq('user_id', userData.user.id)
          .single();
          
        if (error) {
          console.error("Erro ao obter perfil do veterinário:", error);
          throw error;
        }
        
        if (!data) {
          throw new Error("Perfil de veterinário não encontrado");
        }
        
        return data;
      } catch (error: any) {
        console.error("Erro completo ao buscar veterinário:", error);
        throw error;
      }
    },
    enabled: !propVeterinarioId,
    meta: {
      onSuccess: (data) => {
        console.log("ID do veterinário obtido com sucesso:", data.id);
        setVeterinarioId(data.id);
      },
      onError: (error: any) => {
        console.error("Erro ao buscar perfil do veterinário:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seu perfil de veterinário.",
          variant: "destructive"
        });
      }
    }
  });

  // Buscar todos os procedimentos disponíveis
  const { data: procedimentos, isLoading: isLoadingProcedimentos } = useQuery({
    queryKey: ['procedimentos-cadastrados'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('procedimentos')
          .select('*')
          .order('nome');

        if (error) {
          console.error("Erro ao buscar procedimentos:", error);
          throw error;
        }
        return data || [];
      } catch (error: any) {
        console.error("Erro completo ao carregar procedimentos:", error);
        throw error;
      }
    },
    meta: {
      onError: (error: any) => {
        console.error("Erro completo ao carregar procedimentos:", error);
        toast({
          title: "Erro ao carregar procedimentos",
          description: error.message || "Não foi possível carregar a lista de procedimentos.",
          variant: "destructive"
        });
      }
    }
  });

  // Preencher dados se estivermos editando
  useEffect(() => {
    if (servicoToEdit) {
      setNome(servicoToEdit.nome);
      setDescricao(servicoToEdit.descricao || '');
      setPreco(servicoToEdit.preco.toString());
      setDuracaoMinutos(servicoToEdit.duracao_minutos.toString());
      
      // Extrair IDs dos procedimentos já associados
      const procedimentosIds = servicoToEdit.procedimentos_servicos
        ?.map((ps: any) => ps.procedimento.id) || [];
      
      setSelectedProcedimentos(procedimentosIds);
    }
  }, [servicoToEdit]);

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setPreco(value);
  };

  const toggleProcedimento = (id: string) => {
    if (selectedProcedimentos.includes(id)) {
      setSelectedProcedimentos(selectedProcedimentos.filter(procId => procId !== id));
    } else {
      setSelectedProcedimentos([...selectedProcedimentos, id]);
    }
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para o serviço.",
        variant: "destructive"
      });
      return;
    }

    if (!preco || isNaN(parseFloat(preco)) || parseFloat(preco) <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, informe um preço válido para o serviço.",
        variant: "destructive"
      });
      return;
    }

    if (selectedProcedimentos.length === 0) {
      toast({
        title: "Selecione ao menos um procedimento",
        description: "Por favor, selecione ao menos um procedimento para este serviço.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se temos o ID do veterinário
    const finalVeterinarioId = veterinarioId || propVeterinarioId;
    
    if (!finalVeterinarioId) {
      toast({
        title: "Perfil não encontrado",
        description: "Não foi possível identificar seu perfil de veterinário.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthError(null);

      const precoNumerico = parseFloat(preco);
      const duracaoNumerica = parseInt(duracaoMinutos);
      
      console.log("ID do veterinário para inserção de serviço:", finalVeterinarioId);
      
      let servicoId;

      if (servicoToEdit) {
        // Atualizar serviço existente
        console.log("Atualizando serviço existente:", servicoToEdit.id);
        const { data, error } = await supabase
          .from('servicos')
          .update({
            nome,
            descricao: descricao || null,
            preco: precoNumerico,
            duracao_minutos: duracaoNumerica,
            updated_at: new Date().toISOString()
          })
          .eq('id', servicoToEdit.id)
          .select('id')
          .single();

        if (error) {
          // Verificar se é erro de autenticação
          if (error.message?.includes('JWT')) {
            setAuthError('Sua sessão expirou. Por favor, faça login novamente.');
            try {
              // Tenta atualizar a sessão
              const { error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError) {
                toast({
                  title: "Sessão renovada",
                  description: "Sua sessão foi renovada. Tente novamente.",
                });
                return;
              }
            } catch (e) {
              await supabase.auth.signOut();
              window.location.href = '/auth';
            }
          }
          
          console.error("Erro ao atualizar serviço:", error);
          throw error;
        }
        
        servicoId = servicoToEdit.id;

        // Excluir todas as associações anteriores de procedimentos
        const { error: deleteError } = await supabase
          .from('procedimentos_servicos')
          .delete()
          .eq('servico_id', servicoId);

        if (deleteError) {
          console.error("Erro ao excluir procedimentos associados:", deleteError);
          throw deleteError;
        }

      } else {
        // Criar novo serviço
        console.log("Criando novo serviço para veterinário:", finalVeterinarioId);
        const { data, error } = await supabase
          .from('servicos')
          .insert({
            nome,
            descricao: descricao || null,
            preco: precoNumerico,
            duracao_minutos: duracaoNumerica,
            veterinario_id: finalVeterinarioId
          })
          .select('id')
          .single();

        if (error) {
          // Verificar se é erro de autenticação
          if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('auth')) {
            setAuthError('Sua sessão expirou. Por favor, faça login novamente.');
            try {
              // Tenta atualizar a sessão
              const { error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError) {
                toast({
                  title: "Sessão renovada",
                  description: "Sua sessão foi renovada. Tente novamente.",
                });
                return;
              }
            } catch (e) {
              await supabase.auth.signOut();
              window.location.href = '/auth';
            }
          }
          
          console.error("Erro na inserção do serviço:", error);
          throw error;
        }
        
        if (!data) {
          throw new Error("Não foi possível obter o ID do serviço criado");
        }
        
        servicoId = data.id;
        console.log("Serviço criado com ID:", servicoId);
      }

      // Inserir novas associações de procedimentos
      if (selectedProcedimentos.length > 0) {
        const procedimentosInsert = selectedProcedimentos.map(procId => ({
          servico_id: servicoId,
          procedimento_id: procId
        }));

        console.log("Inserindo procedimentos:", procedimentosInsert);
        const { error: insertError } = await supabase
          .from('procedimentos_servicos')
          .insert(procedimentosInsert);

        if (insertError) {
          console.error("Erro ao inserir procedimentos associados:", insertError);
          throw insertError;
        }
      }

      toast({
        title: servicoToEdit ? "Serviço atualizado" : "Serviço cadastrado",
        description: servicoToEdit 
          ? "O serviço foi atualizado com sucesso." 
          : "O serviço foi cadastrado com sucesso."
      });

      onClose(true);

    } catch (error: any) {
      console.error("Erro completo ao salvar serviço:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o serviço.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calcularValorComissao = () => {
    if (!preco || isNaN(parseFloat(preco))) return 0;
    const precoNumerico = parseFloat(preco);
    return (precoNumerico * comissaoGlobal) / 100;
  };

  const calcularValorLiquido = () => {
    if (!preco || isNaN(parseFloat(preco))) return 0;
    const precoNumerico = parseFloat(preco);
    const valorComissao = calcularValorComissao();
    return precoNumerico - valorComissao;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const isLoading = isLoadingVeterinario || isLoadingProcedimentos;
  const isFormValid = nome.trim() && preco && !isNaN(parseFloat(preco)) && parseFloat(preco) > 0 && selectedProcedimentos.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={() => onClose()}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{servicoToEdit ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</SheetTitle>
          <SheetDescription>
            {servicoToEdit 
              ? 'Atualize as informações do seu serviço.' 
              : 'Preencha as informações para cadastrar um novo serviço.'}
          </SheetDescription>
        </SheetHeader>

        {authError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            <p className="font-medium">{authError}</p>
            <p className="text-sm mt-1">Clique em Cancelar e faça login novamente.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#DD6B20]" />
            <span className="ml-2 text-gray-600">Carregando informações...</span>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Serviço</Label>
              <Input
                id="nome"
                placeholder="Ex: Consulta de Rotina"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o serviço..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="text"
                  placeholder="0,00"
                  value={preco}
                  onChange={handlePrecoChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Select 
                  value={duracaoMinutos} 
                  onValueChange={setDuracaoMinutos}
                >
                  <SelectTrigger id="duracao">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {preco && !isNaN(parseFloat(preco)) && parseFloat(preco) > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm font-medium mb-2">Simulação financeira</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor bruto:</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(preco) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comissão ({comissaoGlobal}%):</span>
                    <span className="text-red-500">- {formatCurrency(calcularValorComissao())}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span>Valor líquido:</span>
                    <span className="font-bold text-green-600">{formatCurrency(calcularValorLiquido())}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Procedimentos Incluídos</Label>
              {isLoadingProcedimentos ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              ) : procedimentos && procedimentos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {procedimentos.map((procedimento) => (
                    <div 
                      key={procedimento.id} 
                      className={`
                        relative flex items-center border rounded-md p-3 cursor-pointer transition-colors
                        ${selectedProcedimentos.includes(procedimento.id) 
                          ? 'bg-[#DD6B20]/10 border-[#DD6B20]' 
                          : 'hover:bg-gray-50 border-gray-200'}
                      `}
                      onClick={() => toggleProcedimento(procedimento.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{procedimento.nome}</div>
                        {procedimento.descricao && (
                          <div className="text-xs text-gray-500">{procedimento.descricao}</div>
                        )}
                      </div>
                      <div className="ml-2">
                        {selectedProcedimentos.includes(procedimento.id) && (
                          <div className="h-5 w-5 rounded-full bg-[#DD6B20] flex items-center justify-center text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Nenhum procedimento cadastrado.
                </div>
              )}
            </div>
          </div>
        )}

        <SheetFooter className="mt-6 flex gap-2 flex-row sm:justify-end">
          <Button 
            variant="outline" 
            onClick={() => onClose()}
            disabled={isSubmitting || isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || !isFormValid || !veterinarioId}
            className="bg-[#DD6B20] hover:bg-[#DD6B20]/90"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {servicoToEdit ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ServicoFormDialog;
