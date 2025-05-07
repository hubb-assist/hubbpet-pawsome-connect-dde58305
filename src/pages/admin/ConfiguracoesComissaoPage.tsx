
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  RefreshCw 
} from 'lucide-react';

// Tipos para evitar erros de TypeScript
interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco_base: number;
  ativo: boolean;
}

interface ComissaoServico {
  id: string;
  servico_id: string;
  percentual: number;
  valor_fixo: number;
  fixa: boolean;
  servico: {
    nome: string;
    descricao: string;
    preco_base: number;
  };
}

const ConfiguracoesComissaoPage: React.FC = () => {
  const [comissoes, setComissoes] = useState<ComissaoServico[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para nova comissão
  const [novaComissao, setNovaComissao] = useState({
    servicoId: '',
    percentual: 10,
    valorFixo: 20,
    fixa: false
  });
  
  // Estado para serviço que está sendo editado
  const [editando, setEditando] = useState<string | null>(null);
  
  // Serviço temporário para edição
  const [servicoTemp, setServicoTemp] = useState<Servico | null>(null);
  
  // Estado para controle de modal/form
  const [showNovaComissaoForm, setShowNovaComissaoForm] = useState(false);
  const [showNovoServicoForm, setShowNovoServicoForm] = useState(false);
  
  const { toast } = useToast();

  // Carregar dados
  useEffect(() => {
    const fetchDados = async () => {
      setIsLoading(true);
      try {
        // Carregar comissões
        const { data: comissoesData, error: comissoesError } = await supabase
          .from('comissoes')
          .select(`
            *,
            servico:servico_id (
              nome,
              descricao,
              preco_base
            )
          `)
          .order('created_at', { ascending: false });
          
        if (comissoesError) throw comissoesError;
        
        // Conversão explícita para satisfazer o TypeScript
        setComissoes(comissoesData as unknown as ComissaoServico[]);
        
        // Carregar serviços
        const { data: servicosData, error: servicosError } = await supabase
          .from('servicos')
          .select('*')
          .order('nome', { ascending: true });
          
        if (servicosError) throw servicosError;
        
        // Conversão explícita para satisfazer o TypeScript
        setServicos(servicosData as unknown as Servico[]);
        
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDados();
  }, [toast]);

  // Salvar nova comissão
  const handleSalvarNovaComissao = async () => {
    if (!novaComissao.servicoId) {
      toast({
        title: "Erro",
        description: "Selecione um serviço.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const valorAtual = novaComissao.fixa ? novaComissao.valorFixo : novaComissao.percentual;
      
      const { data, error } = await supabase
        .from('comissoes')
        .insert({
          servico_id: novaComissao.servicoId,
          percentual: novaComissao.fixa ? 0 : novaComissao.percentual,
          valor_fixo: novaComissao.fixa ? novaComissao.valorFixo : 0,
          fixa: novaComissao.fixa
        })
        .select(`
          *,
          servico:servico_id (
            nome,
            descricao,
            preco_base
          )
        `)
        .single();
        
      if (error) throw error;
      
      // Adicionar nova comissão à lista
      setComissoes([data as unknown as ComissaoServico, ...comissoes]);
      
      // Reset form
      setNovaComissao({
        servicoId: '',
        percentual: 10,
        valorFixo: 20,
        fixa: false
      });
      setShowNovaComissaoForm(false);
      
      toast({
        title: "Comissão adicionada",
        description: `Comissão para o serviço foi adicionada com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao adicionar comissão:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a comissão.",
        variant: "destructive"
      });
    }
  };

  // Atualizar comissão
  const handleAtualizarComissao = async (comissaoId: string, campo: string, valor: any) => {
    try {
      const { error } = await supabase
        .from('comissoes')
        .update({ [campo]: valor })
        .eq('id', comissaoId);
        
      if (error) throw error;
      
      // Atualizar estado local
      setComissoes(comissoes.map(c => {
        if (c.id === comissaoId) {
          return { ...c, [campo]: valor };
        }
        return c;
      }));
      
      toast({
        title: "Comissão atualizada",
        description: "A comissão foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar comissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a comissão.",
        variant: "destructive"
      });
    }
  };

  // Remover comissão
  const handleRemoverComissao = async (comissaoId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta comissão?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('comissoes')
        .delete()
        .eq('id', comissaoId);
        
      if (error) throw error;
      
      // Atualizar estado local
      setComissoes(comissoes.filter(c => c.id !== comissaoId));
      
      toast({
        title: "Comissão removida",
        description: "A comissão foi removida com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover comissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a comissão.",
        variant: "destructive"
      });
    }
  };

  // Adicionar novo serviço
  const handleAdicionarServico = async () => {
    if (!servicoTemp?.nome || !servicoTemp.preco_base) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert({
          nome: servicoTemp.nome,
          descricao: servicoTemp.descricao || '',
          preco_base: servicoTemp.preco_base,
          ativo: true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Adicionar novo serviço à lista
      setServicos([...servicos, data as Servico]);
      
      // Reset form
      setServicoTemp(null);
      setShowNovoServicoForm(false);
      
      toast({
        title: "Serviço adicionado",
        description: `O serviço "${data.nome}" foi adicionado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao adicionar serviço:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o serviço.",
        variant: "destructive"
      });
    }
  };

  // Iniciar edição de serviço
  const handleIniciarEdicaoServico = (servico: Servico) => {
    setServicoTemp({ ...servico });
    setEditando(servico.id);
  };

  // Salvar serviço editado
  const handleSalvarServicoEditado = async () => {
    if (!servicoTemp || !editando) return;
    
    try {
      const { error } = await supabase
        .from('servicos')
        .update({
          nome: servicoTemp.nome,
          descricao: servicoTemp.descricao,
          preco_base: servicoTemp.preco_base,
          ativo: servicoTemp.ativo
        })
        .eq('id', editando);
        
      if (error) throw error;
      
      // Atualizar estado local
      setServicos(servicos.map(s => {
        if (s.id === editando) {
          return servicoTemp;
        }
        return s;
      }));
      
      // Reset edit mode
      setEditando(null);
      setServicoTemp(null);
      
      toast({
        title: "Serviço atualizado",
        description: `O serviço "${servicoTemp.nome}" foi atualizado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o serviço.",
        variant: "destructive"
      });
    }
  };

  // Cancelar edição
  const handleCancelarEdicao = () => {
    setEditando(null);
    setServicoTemp(null);
  };

  // Formatação de moeda
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configurações de Comissões</h1>

      <Tabs defaultValue="comissoes">
        <TabsList className="mb-4">
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comissoes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Comissões por Serviço</CardTitle>
                <CardDescription>
                  Gerencie as comissões da plataforma para cada tipo de serviço
                </CardDescription>
              </div>
              <Button onClick={() => setShowNovaComissaoForm(!showNovaComissaoForm)}>
                {showNovaComissaoForm ? <X className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                {showNovaComissaoForm ? 'Cancelar' : 'Nova Comissão'}
              </Button>
            </CardHeader>
            <CardContent>
              {showNovaComissaoForm && (
                <Card className="mb-6 bg-gray-50">
                  <CardHeader>
                    <CardTitle>Nova Comissão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="servicoId">Serviço</Label>
                        <select 
                          id="servicoId"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={novaComissao.servicoId}
                          onChange={(e) => setNovaComissao({...novaComissao, servicoId: e.target.value})}
                        >
                          <option value="">Selecione um serviço</option>
                          {servicos.map(servico => (
                            <option key={servico.id} value={servico.id}>
                              {servico.nome} - {formatarMoeda(servico.preco_base)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Switch 
                            id="tipoComissao" 
                            checked={novaComissao.fixa}
                            onCheckedChange={(checked) => setNovaComissao({...novaComissao, fixa: checked})}
                          />
                          <Label htmlFor="tipoComissao">
                            {novaComissao.fixa ? 'Valor Fixo' : 'Percentual'}
                          </Label>
                        </div>
                        
                        {novaComissao.fixa ? (
                          <div>
                            <Label htmlFor="valorFixo">Valor Fixo (R$)</Label>
                            <Input 
                              id="valorFixo"
                              type="number" 
                              min="0"
                              step="0.01"
                              value={novaComissao.valorFixo}
                              onChange={(e) => setNovaComissao({
                                ...novaComissao, 
                                valorFixo: parseFloat(e.target.value) || 0
                              })}
                            />
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="percentual">Percentual (%)</Label>
                            <Input 
                              id="percentual"
                              type="number" 
                              min="0"
                              max="100"
                              value={novaComissao.percentual}
                              onChange={(e) => setNovaComissao({
                                ...novaComissao, 
                                percentual: parseFloat(e.target.value) || 0
                              })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => setShowNovaComissaoForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSalvarNovaComissao}>
                      Salvar Comissão
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes.length > 0 ? (
                    comissoes.map(comissao => (
                      <TableRow key={comissao.id}>
                        <TableCell className="font-medium">
                          {comissao.servico?.nome || 'Serviço não encontrado'}
                          <div className="text-xs text-gray-500">
                            Preço base: {formatarMoeda(comissao.servico?.preco_base || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={comissao.fixa ? 'outline' : 'default'}>
                            {comissao.fixa ? 'Valor Fixo' : 'Percentual'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {comissao.fixa 
                            ? formatarMoeda(comissao.valor_fixo) 
                            : `${comissao.percentual}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoverComissao(comissao.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        Nenhuma comissão cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Lista
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="servicos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Serviços Disponíveis</CardTitle>
                <CardDescription>
                  Gerencie os tipos de serviços disponíveis na plataforma
                </CardDescription>
              </div>
              <Button onClick={() => {
                setServicoTemp({ id: '', nome: '', descricao: '', preco_base: 0, ativo: true });
                setShowNovoServicoForm(!showNovoServicoForm);
              }}>
                {showNovoServicoForm ? <X className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                {showNovoServicoForm ? 'Cancelar' : 'Novo Serviço'}
              </Button>
            </CardHeader>
            <CardContent>
              {showNovoServicoForm && (
                <Card className="mb-6 bg-gray-50">
                  <CardHeader>
                    <CardTitle>Novo Serviço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome do Serviço</Label>
                        <Input 
                          id="nome"
                          value={servicoTemp?.nome || ''}
                          onChange={(e) => servicoTemp && setServicoTemp({...servicoTemp, nome: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input 
                          id="descricao"
                          value={servicoTemp?.descricao || ''}
                          onChange={(e) => servicoTemp && setServicoTemp({...servicoTemp, descricao: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="preco">Preço Base (R$)</Label>
                        <Input 
                          id="preco"
                          type="number"
                          min="0"
                          step="0.01"
                          value={servicoTemp?.preco_base || 0}
                          onChange={(e) => servicoTemp && setServicoTemp({
                            ...servicoTemp, 
                            preco_base: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => {
                        setServicoTemp(null);
                        setShowNovoServicoForm(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAdicionarServico}>
                      Salvar Serviço
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Preço Base</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicos.length > 0 ? (
                    servicos.map(servico => (
                      <TableRow key={servico.id}>
                        {editando === servico.id ? (
                          <>
                            <TableCell>
                              <Input 
                                value={servicoTemp?.nome || ''}
                                onChange={(e) => servicoTemp && setServicoTemp({...servicoTemp, nome: e.target.value})}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={servicoTemp?.descricao || ''}
                                onChange={(e) => servicoTemp && setServicoTemp({...servicoTemp, descricao: e.target.value})}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={servicoTemp?.preco_base || 0}
                                onChange={(e) => servicoTemp && setServicoTemp({
                                  ...servicoTemp, 
                                  preco_base: parseFloat(e.target.value) || 0
                                })}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={servicoTemp?.ativo || false}
                                  onCheckedChange={(checked) => servicoTemp && setServicoTemp({...servicoTemp, ativo: checked})}
                                />
                                <Label>{servicoTemp?.ativo ? 'Ativo' : 'Inativo'}</Label>
                              </div>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={handleSalvarServicoEditado}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={handleCancelarEdicao}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium">{servico.nome}</TableCell>
                            <TableCell>{servico.descricao || '-'}</TableCell>
                            <TableCell>{formatarMoeda(servico.preco_base)}</TableCell>
                            <TableCell>
                              <Badge variant={servico.ativo ? 'default' : 'secondary'}>
                                {servico.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleIniciarEdicaoServico(servico)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        Nenhum serviço cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesComissaoPage;
