
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash, Save, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface Servico {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
}

interface ComissaoServico {
  id: string;
  servico_id: string;
  percentual: number;
  servico?: Servico;
}

const formSchema = z.object({
  servico_id: z.string().nonempty("Por favor selecione um serviço"),
  percentual: z.coerce.number().min(0).max(100),
});

const ConfiguracoesComissaoPage = () => {
  const { toast } = useToast();
  const [comissaoGlobal, setComissaoGlobal] = useState<number>(10);
  const [comissoesServicos, setComissoesServicos] = useState<ComissaoServico[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComissaoGlobal, setIsLoadingComissaoGlobal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      servico_id: "",
      percentual: 10,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar comissão global
        const { data: configData, error: configError } = await supabase
          .from('admin_configuracoes')
          .select('comissao_padrao')
          .single();

        if (configError) {
          console.error("Erro ao buscar configurações:", configError);
        } else if (configData) {
          setComissaoGlobal(configData.comissao_padrao);
        }

        // Buscar comissões específicas por serviço
        const { data: comissoesData, error: comissoesError } = await supabase
          .from('comissoes_servicos')
          .select(`
            id,
            servico_id,
            percentual,
            servicos (
              id,
              nome,
              preco,
              descricao
            )
          `);

        if (comissoesError) {
          console.error("Erro ao buscar comissões:", comissoesError);
        } else if (comissoesData) {
          // Mapear os dados para o formato esperado
          const comissoes = comissoesData.map(item => ({
            id: item.id,
            servico_id: item.servico_id,
            percentual: item.percentual,
            servico: item.servicos as Servico
          }));
          setComissoesServicos(comissoes);
        }

        // Buscar todos os serviços
        const { data: servicosData, error: servicosError } = await supabase
          .from('servicos')
          .select('*');

        if (servicosError) {
          console.error("Erro ao buscar serviços:", servicosError);
        } else if (servicosData) {
          setServicos(servicosData as Servico[]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao carregar as configurações de comissão."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleUpdateComissaoGlobal = async () => {
    setIsLoadingComissaoGlobal(true);
    try {
      const { error } = await supabase
        .from('admin_configuracoes')
        .update({ comissao_padrao: comissaoGlobal })
        .eq('id', 1); // Assumindo que há um registro com ID 1

      if (error) {
        throw error;
      }

      toast({
        title: "Comissão global atualizada",
        description: `A comissão global foi definida para ${comissaoGlobal}%.`
      });
    } catch (error) {
      console.error("Erro ao atualizar comissão global:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar comissão global."
      });
    } finally {
      setIsLoadingComissaoGlobal(false);
    }
  };

  const handleDeleteComissao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comissoes_servicos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setComissoesServicos(prevComissoes => prevComissoes.filter(comissao => comissao.id !== id));
      toast({
        title: "Comissão removida",
        description: "A comissão por serviço foi removida com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir comissão:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao remover comissão por serviço."
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Verificar se já existe uma comissão para este serviço
      const comissaoExistente = comissoesServicos.find(c => c.servico_id === values.servico_id);
      
      if (comissaoExistente) {
        // Atualizar comissão existente
        const { error } = await supabase
          .from('comissoes_servicos')
          .update({ percentual: values.percentual })
          .eq('id', comissaoExistente.id);
          
        if (error) throw error;
        
        // Atualizar a lista local
        setComissoesServicos(prev => prev.map(c => {
          if (c.id === comissaoExistente.id) {
            return { ...c, percentual: values.percentual };
          }
          return c;
        }));
        
        toast({
          title: "Comissão atualizada",
          description: "A comissão do serviço foi atualizada com sucesso."
        });
      } else {
        // Criar nova comissão
        const { data, error } = await supabase
          .from('comissoes_servicos')
          .insert({
            servico_id: values.servico_id,
            percentual: values.percentual
          })
          .select(`
            id,
            servico_id,
            percentual
          `)
          .single();
          
        if (error) throw error;
        
        // Buscar dados do serviço para exibição
        const servico = servicos.find(s => s.id === values.servico_id);
        
        if (data && servico) {
          const novaComissao = {
            ...data,
            servico
          };
          
          setComissoesServicos(prev => [...prev, novaComissao]);
          toast({
            title: "Comissão criada",
            description: "Nova comissão por serviço adicionada com sucesso."
          });
        }
      }
      
      setOpenDialog(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar comissão:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar comissão por serviço."
      });
    }
  };

  // Filtra os serviços que não têm comissões específicas
  const servicosDisponiveis = servicos.filter(servico => 
    !comissoesServicos.some(comissao => comissao.servico_id === servico.id)
  );

  const getServicoById = (id: string) => {
    return servicos.find(servico => servico.id === id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configurações de Comissão</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comissão Global</CardTitle>
              <CardDescription>
                Define a porcentagem padrão de comissão para todos os serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="w-full max-w-xs">
                  <label htmlFor="comissaoGlobal" className="block text-sm font-medium mb-1">
                    Percentual (%)
                  </label>
                  <Input
                    id="comissaoGlobal"
                    type="number"
                    min="0"
                    max="100"
                    value={comissaoGlobal}
                    onChange={(e) => setComissaoGlobal(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={handleUpdateComissaoGlobal}
                  disabled={isLoadingComissaoGlobal}
                >
                  {isLoadingComissaoGlobal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Comissões por Serviço</CardTitle>
                <CardDescription>
                  Define comissões específicas para determinados serviços
                </CardDescription>
              </div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Comissão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Comissão por Serviço</DialogTitle>
                    <DialogDescription>
                      Defina uma comissão específica para um serviço.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="servico_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serviço</FormLabel>
                            <FormControl>
                              <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...field}
                              >
                                <option value="">Selecione um serviço</option>
                                {servicos.map((servico) => (
                                  <option key={servico.id} value={servico.id}>
                                    {servico.nome} - R$ {servico.preco.toFixed(2)}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="percentual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Percentual (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Percentual da comissão entre 0 e 100%.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {comissoesServicos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Comissão (%)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comissoesServicos.map((comissao) => (
                      <TableRow key={comissao.id}>
                        <TableCell className="font-medium">
                          {comissao.servico?.nome ?? "Serviço não encontrado"}
                        </TableCell>
                        <TableCell>
                          {comissao.servico ? `R$ ${comissao.servico.preco.toFixed(2)}` : "N/A"}
                        </TableCell>
                        <TableCell>{comissao.percentual}%</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteComissao(comissao.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma comissão específica configurada. A comissão global será aplicada a todos os serviços.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesComissaoPage;
