
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Save, Percent } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ConfiguracaoGeral = {
  id: string;
  comissao_padrao: number;
  created_at: string;
  updated_at: string;
};

type ComissaoServico = {
  id: string;
  servico_id: string;
  percentual: number;
  fixa: boolean;
  valor_fixo: number | null;
  created_at: string;
  updated_at: string;
  servico?: {
    nome: string;
    descricao: string;
    preco_base: number;
  };
};

type Servico = {
  id: string;
  nome: string;
  descricao: string;
  preco_base: number;
  ativo: boolean;
  created_at: string;
  veterinario_id: string | null;
};

const ConfiguracoesComissaoPage = () => {
  const { toast } = useToast();
  const [configuracaoGeral, setConfiguracaoGeral] = useState<ConfiguracaoGeral | null>(null);
  const [comissaoGeral, setComissaoGeral] = useState<string>('');
  const [comissaoServico, setComissaoServico] = useState({
    servicoId: '',
    percentual: '',
    fixa: false,
    valorFixo: '',
  });
  const [modoEdicao, setModoEdicao] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  // Consultas para buscar dados
  const { data: configGeral, refetch: refetchConfigGeral } = useQuery({
    queryKey: ['configGeral'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_configuracoes')
        .select('*')
        .single();
        
      if (error) throw error;
      return data as ConfiguracaoGeral;
    }
  });
  
  const { 
    data: comissoesServicos = [], 
    refetch: refetchComissoes 
  } = useQuery({
    queryKey: ['comissoesServicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comissoes_servicos')
        .select(`
          *,
          servico:servico_id (
            nome, descricao, preco_base
          )
        `)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data as ComissaoServico[];
    }
  });
  
  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });
        
      if (error) throw error;
      
      // Remova serviços que já têm comissões configuradas
      const servicosComComissao = comissoesServicos.map(c => c.servico_id);
      return data.filter(serv => !servicosComComissao.includes(serv.id)) as Servico[];
    },
    enabled: comissoesServicos.length > 0,
  });
  
  // Efeito para carregar configuração geral inicial
  useEffect(() => {
    if (configGeral) {
      setConfiguracaoGeral(configGeral);
      setComissaoGeral(configGeral.comissao_padrao.toString());
    }
  }, [configGeral]);
  
  // Atualizar comissão geral
  const salvarComissaoGeral = async () => {
    if (!configuracaoGeral) return;
    
    try {
      setCarregando(true);
      
      const valor = parseFloat(comissaoGeral);
      if (isNaN(valor) || valor < 0 || valor > 100) {
        toast({
          title: "Valor inválido",
          description: "A comissão geral deve ser um valor entre 0 e 100%",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('admin_configuracoes')
        .update({ 
          comissao_padrao: valor,
          updated_at: new Date().toISOString()
        })
        .eq('id', configuracaoGeral.id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Comissão geral atualizada com sucesso!"
      });
      
      refetchConfigGeral();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a comissão geral",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };
  
  // Salvar comissão de serviço
  const salvarComissaoServico = async () => {
    try {
      setCarregando(true);
      
      if (!comissaoServico.servicoId) {
        toast({
          title: "Erro",
          description: "Selecione um serviço para continuar",
          variant: "destructive"
        });
        return;
      }
      
      let valor;
      if (comissaoServico.fixa) {
        valor = parseFloat(comissaoServico.valorFixo);
        if (isNaN(valor) || valor < 0) {
          toast({
            title: "Valor inválido",
            description: "O valor fixo deve ser maior ou igual a zero",
            variant: "destructive"
          });
          return;
        }
      } else {
        valor = parseFloat(comissaoServico.percentual);
        if (isNaN(valor) || valor < 0 || valor > 100) {
          toast({
            title: "Valor inválido",
            description: "O percentual deve ser entre 0 e 100",
            variant: "destructive"
          });
          return;
        }
      }
      
      const dadosParaSalvar = {
        servico_id: comissaoServico.servicoId,
        percentual: comissaoServico.fixa ? 0 : valor,
        fixa: comissaoServico.fixa,
        valor_fixo: comissaoServico.fixa ? valor : null,
      };
      
      let resultado;
      
      if (modoEdicao) {
        resultado = await supabase
          .from('comissoes_servicos')
          .update({
            ...dadosParaSalvar,
            updated_at: new Date().toISOString()
          })
          .eq('id', modoEdicao);
      } else {
        resultado = await supabase
          .from('comissoes_servicos')
          .insert(dadosParaSalvar);
      }
      
      if (resultado.error) throw resultado.error;
      
      toast({
        title: "Sucesso",
        description: modoEdicao 
          ? "Comissão atualizada com sucesso" 
          : "Comissão cadastrada com sucesso"
      });
      
      // Limpar formulário e fechar modal
      setComissaoServico({
        servicoId: '',
        percentual: '',
        fixa: false,
        valorFixo: '',
      });
      setModoEdicao(null);
      setModalOpen(false);
      
      // Recarregar dados
      refetchComissoes();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a comissão",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };
  
  // Excluir comissão de serviço
  const excluirComissao = async (id: string) => {
    try {
      setCarregando(true);
      
      const { error } = await supabase
        .from('comissoes_servicos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Comissão excluída com sucesso"
      });
      
      refetchComissoes();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a comissão",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };
  
  // Iniciar edição de comissão
  const editarComissao = (comissao: ComissaoServico) => {
    setComissaoServico({
      servicoId: comissao.servico_id,
      percentual: comissao.fixa ? '' : comissao.percentual.toString(),
      fixa: comissao.fixa,
      valorFixo: comissao.fixa ? (comissao.valor_fixo?.toString() || '') : '',
    });
    setModoEdicao(comissao.id);
    setModalOpen(true);
  };
  
  // Iniciar novo cadastro
  const novaComissao = () => {
    setComissaoServico({
      servicoId: '',
      percentual: '',
      fixa: false,
      valorFixo: '',
    });
    setModoEdicao(null);
    setModalOpen(true);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configurações de Comissão</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Comissão Padrão</CardTitle>
            <CardDescription>
              Define a porcentagem padrão de comissão aplicada a todos os serviços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="comissao_padrao">Valor (%)</Label>
                  <div className="flex items-center">
                    <Input
                      id="comissao_padrao"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={comissaoGeral}
                      onChange={e => setComissaoGeral(e.target.value)}
                      className="pr-8"
                    />
                    <span className="relative right-7">%</span>
                  </div>
                </div>
                
                <Button 
                  onClick={salvarComissaoGeral} 
                  disabled={carregando || comissaoGeral === configuracaoGeral?.comissao_padrao.toString()}
                  className="flex gap-2 items-center"
                >
                  <Save size={16} />
                  Salvar
                </Button>
              </div>
              
              {configuracaoGeral && (
                <p className="text-sm text-gray-500">
                  Última atualização: {new Date(configuracaoGeral.updated_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Comissões por Serviço</CardTitle>
              <CardDescription>
                Configure comissões específicas para cada tipo de serviço
              </CardDescription>
            </div>
            <Button onClick={novaComissao} className="flex items-center gap-1">
              <Plus size={16} />
              Nova Comissão
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Serviço</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoesServicos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhuma comissão específica configurada
                      </TableCell>
                    </TableRow>
                  ) : (
                    comissoesServicos.map((comissao) => (
                      <TableRow key={comissao.id}>
                        <TableCell className="font-medium">
                          {comissao.servico?.nome || 'Serviço não encontrado'}
                        </TableCell>
                        <TableCell>
                          {comissao.fixa ? 'Valor Fixo' : 'Percentual'}
                        </TableCell>
                        <TableCell>
                          {comissao.fixa 
                            ? `R$ ${comissao.valor_fixo?.toFixed(2)}` 
                            : `${comissao.percentual}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editarComissao(comissao)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => excluirComissao(comissao.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modoEdicao ? 'Editar Comissão' : 'Nova Comissão de Serviço'}
            </DialogTitle>
            <DialogDescription>
              {modoEdicao 
                ? 'Altere os valores da comissão para este serviço' 
                : 'Configure uma comissão específica para um serviço'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="servico">Serviço</Label>
              <select
                id="servico"
                value={comissaoServico.servicoId}
                onChange={(e) => setComissaoServico({...comissaoServico, servicoId: e.target.value})}
                className="w-full border border-input rounded-md p-2"
                disabled={!!modoEdicao}
              >
                <option value="">Selecione um serviço</option>
                {servicos.map(servico => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} - R$ {servico.preco_base.toFixed(2)}
                  </option>
                ))}
                {modoEdicao && comissaoServico.servicoId && (
                  <option value={comissaoServico.servicoId}>
                    {comissoesServicos.find(c => c.id === modoEdicao)?.servico?.nome || 'Serviço selecionado'}
                  </option>
                )}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Comissão</Label>
              <RadioGroup
                value={comissaoServico.fixa ? "fixa" : "percentual"}
                onValueChange={(value) => setComissaoServico({
                  ...comissaoServico, 
                  fixa: value === "fixa",
                  percentual: value === "fixa" ? '' : comissaoServico.percentual,
                  valorFixo: value === "percentual" ? '' : comissaoServico.valorFixo
                })}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentual" id="percentual" />
                  <Label htmlFor="percentual">Percentual sobre o valor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixa" id="fixa" />
                  <Label htmlFor="fixa">Valor fixo</Label>
                </div>
              </RadioGroup>
            </div>
            
            {comissaoServico.fixa ? (
              <div className="space-y-2">
                <Label htmlFor="valor_fixo">Valor Fixo (R$)</Label>
                <Input
                  id="valor_fixo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={comissaoServico.valorFixo}
                  onChange={(e) => setComissaoServico({...comissaoServico, valorFixo: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="percentual">Percentual (%)</Label>
                <div className="flex items-center">
                  <Input
                    id="percentual"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={comissaoServico.percentual}
                    onChange={(e) => setComissaoServico({...comissaoServico, percentual: e.target.value})}
                    placeholder="0.00"
                    className="pr-8"
                  />
                  <span className="relative right-7">%</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={salvarComissaoServico}
              disabled={carregando}
              className="flex items-center gap-2"
            >
              <Percent size={16} />
              {modoEdicao ? 'Atualizar Comissão' : 'Cadastrar Comissão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfiguracoesComissaoPage;
