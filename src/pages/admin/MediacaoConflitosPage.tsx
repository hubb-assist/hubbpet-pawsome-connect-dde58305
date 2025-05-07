
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  MessageCircle, 
  Users, 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCcw,
  Send,
  ClipboardCheck
} from 'lucide-react';

type Conflito = {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  resolvido: boolean;
  estorno_solicitado: boolean;
  estorno_aprovado: boolean | null;
  valor_estorno: number | null;
  created_at: string;
  updated_at: string;
  tutor: {
    nome_completo: string;
    email: string;
  };
  veterinario: {
    nome_completo: string;
    email: string;
  };
  agendamento: {
    data_hora: string;
    valor_total: number;
    status: string;
  };
};

type Mensagem = {
  id: string;
  conflito_id: string;
  user_id: string;
  tipo_usuario: string;
  mensagem: string;
  created_at: string;
  user?: {
    email: string;
  };
};

const MediacaoConflitosPage = () => {
  const { toast } = useToast();
  const [selectedConflito, setSelectedConflito] = useState<Conflito | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [tabAtual, setTabAtual] = useState('abertos');
  const [modalConflito, setModalConflito] = useState<boolean>(false);
  
  // Função para buscar conflitos
  const fetchConflitos = async (status: string): Promise<Conflito[]> => {
    const { data, error } = await supabase
      .from('conflitos')
      .select(`
        *,
        tutor:tutor_id(nome_completo, email),
        veterinario:veterinario_id(nome_completo, email),
        agendamento:agendamento_id(data_hora, valor_total, status)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar conflitos:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  };
  
  // Função para buscar mensagens de um conflito
  const fetchMensagens = async (conflitoId: string): Promise<Mensagem[]> => {
    const { data, error } = await supabase
      .from('mensagens_conflitos')
      .select(`*, user:user_id(email)`)
      .eq('conflito_id', conflitoId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  };
  
  // Query para conflitos abertos
  const { 
    data: conflitosAbertos = [], 
    refetch: refetchAbertos 
  } = useQuery({
    queryKey: ['conflitos', 'abertos'],
    queryFn: () => fetchConflitos('aberto'),
    enabled: tabAtual === 'abertos'
  });
  
  // Query para conflitos em mediação
  const { 
    data: conflitosEmMediacao = [], 
    refetch: refetchEmMediacao 
  } = useQuery({
    queryKey: ['conflitos', 'mediacao'],
    queryFn: () => fetchConflitos('mediacao'),
    enabled: tabAtual === 'mediacao'
  });
  
  // Query para conflitos resolvidos
  const { 
    data: conflitosResolvidos = [], 
    refetch: refetchResolvidos 
  } = useQuery({
    queryKey: ['conflitos', 'resolvidos'],
    queryFn: () => fetchConflitos('resolvido'),
    enabled: tabAtual === 'resolvidos'
  });
  
  // Função para enviar mensagem
  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !selectedConflito) return;
    
    try {
      const { data: userdata } = await supabase.auth.getUser();
      if (!userdata.user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para enviar mensagens.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.from('mensagens_conflitos').insert({
        conflito_id: selectedConflito.id,
        user_id: userdata.user.id,
        tipo_usuario: 'admin',
        mensagem: novaMensagem
      });
      
      if (error) throw error;
      
      // Atualizar status do conflito para mediação se estiver aberto
      if (selectedConflito.status === 'aberto') {
        await supabase
          .from('conflitos')
          .update({ status: 'mediacao' })
          .eq('id', selectedConflito.id);
        
        setSelectedConflito({
          ...selectedConflito,
          status: 'mediacao'
        });
      }
      
      // Limpar campo e atualizar mensagens
      setNovaMensagem('');
      const novasMensagens = await fetchMensagens(selectedConflito.id);
      setMensagens(novasMensagens);
      
      // Atualizar listas de conflitos
      refetchAbertos();
      refetchEmMediacao();
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso."
      });
      
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar sua mensagem.",
        variant: "destructive"
      });
    }
  };
  
  // Função para marcar conflito como resolvido
  const resolverConflito = async (conflito: Conflito) => {
    try {
      const { error } = await supabase
        .from('conflitos')
        .update({ 
          status: 'resolvido', 
          resolvido: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', conflito.id);
      
      if (error) throw error;
      
      toast({
        title: "Conflito resolvido",
        description: "O conflito foi marcado como resolvido com sucesso."
      });
      
      // Atualizar listas de conflitos
      refetchAbertos();
      refetchEmMediacao();
      refetchResolvidos();
      
      // Fechar modal se estiver aberto
      setModalConflito(false);
      setSelectedConflito(null);
      
    } catch (error: any) {
      console.error('Erro ao resolver conflito:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível resolver o conflito.",
        variant: "destructive"
      });
    }
  };
  
  // Função para aprovar estorno
  const aprovarEstorno = async (conflito: Conflito, valor: number) => {
    try {
      const { error } = await supabase
        .from('conflitos')
        .update({ 
          estorno_aprovado: true,
          valor_estorno: valor,
          status: 'resolvido',
          resolvido: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', conflito.id);
      
      if (error) throw error;
      
      // Aqui deveria ocorrer a integração com gateway de pagamento para realizar estorno
      // Implementação dependerá do gateway utilizado
      
      toast({
        title: "Estorno aprovado",
        description: `Estorno de R$ ${valor.toFixed(2)} aprovado com sucesso.`
      });
      
      // Atualizar listas de conflitos
      refetchAbertos();
      refetchEmMediacao();
      refetchResolvidos();
      
      // Fechar modal se estiver aberto
      setModalConflito(false);
      setSelectedConflito(null);
      
    } catch (error: any) {
      console.error('Erro ao aprovar estorno:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível aprovar o estorno.",
        variant: "destructive"
      });
    }
  };
  
  // Função para rejeitar estorno
  const rejeitarEstorno = async (conflito: Conflito) => {
    try {
      const { error } = await supabase
        .from('conflitos')
        .update({ 
          estorno_aprovado: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', conflito.id);
      
      if (error) throw error;
      
      toast({
        title: "Estorno rejeitado",
        description: "O pedido de estorno foi rejeitado."
      });
      
      // Fechar modal se estiver aberto
      setModalConflito(false);
      setSelectedConflito(null);
      
    } catch (error: any) {
      console.error('Erro ao rejeitar estorno:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível rejeitar o estorno.",
        variant: "destructive"
      });
    }
  };
  
  // Quando um conflito é selecionado, carregamos suas mensagens
  useEffect(() => {
    if (selectedConflito) {
      const carregarMensagens = async () => {
        try {
          const mensagensDados = await fetchMensagens(selectedConflito.id);
          setMensagens(mensagensDados);
        } catch (error) {
          console.error('Erro ao carregar mensagens:', error);
        }
      };
      carregarMensagens();
    } else {
      setMensagens([]);
    }
  }, [selectedConflito]);
  
  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };
  
  // Renderizar card de conflito
  const renderCardConflito = (conflito: Conflito) => {
    return (
      <Card key={conflito.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
        setSelectedConflito(conflito);
        setModalConflito(true);
      }}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{conflito.titulo}</CardTitle>
            <Badge variant={
              conflito.status === 'aberto' ? 'destructive' : 
              conflito.status === 'mediacao' ? 'default' : 'outline'
            }>
              {conflito.status === 'aberto' ? 'Novo' : 
               conflito.status === 'mediacao' ? 'Em Mediação' : 'Resolvido'}
            </Badge>
          </div>
          <CardDescription>
            Aberto em {formatarData(conflito.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-semibold">Tutor:</p>
              <p>{conflito.tutor.nome_completo}</p>
            </div>
            <div>
              <p className="font-semibold">Veterinário:</p>
              <p>{conflito.veterinario.nome_completo}</p>
            </div>
            {conflito.estorno_solicitado && (
              <div className="col-span-2 mt-2">
                <p className="text-yellow-600 flex items-center gap-1">
                  <AlertTriangle size={16} />
                  Solicitação de estorno pendente
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mediação de Conflitos</h1>
      
      <Tabs defaultValue="abertos" onValueChange={setTabAtual}>
        <TabsList className="mb-4">
          <TabsTrigger value="abertos" className="flex items-center gap-2">
            <AlertTriangle size={16} />
            Abertos <Badge variant="destructive" className="ml-1">{conflitosAbertos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="mediacao" className="flex items-center gap-2">
            <MessageCircle size={16} />
            Em Mediação <Badge variant="default" className="ml-1">{conflitosEmMediacao.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolvidos" className="flex items-center gap-2">
            <Check size={16} />
            Resolvidos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="abertos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {conflitosAbertos.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-500">Não há conflitos abertos no momento.</p>
              </div>
            ) : (
              conflitosAbertos.map(renderCardConflito)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="mediacao">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {conflitosEmMediacao.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-500">Não há conflitos em mediação no momento.</p>
              </div>
            ) : (
              conflitosEmMediacao.map(renderCardConflito)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="resolvidos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {conflitosResolvidos.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-500">Não há conflitos resolvidos para exibir.</p>
              </div>
            ) : (
              conflitosResolvidos.map(renderCardConflito)
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Modal de detalhes do conflito */}
      <Dialog open={modalConflito} onOpenChange={setModalConflito}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedConflito && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{selectedConflito.titulo}</DialogTitle>
                  <Badge variant={
                    selectedConflito.status === 'aberto' ? 'destructive' : 
                    selectedConflito.status === 'mediacao' ? 'default' : 'outline'
                  }>
                    {selectedConflito.status === 'aberto' ? 'Novo' : 
                    selectedConflito.status === 'mediacao' ? 'Em Mediação' : 'Resolvido'}
                  </Badge>
                </div>
                <DialogDescription>
                  Aberto em {formatarData(selectedConflito.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Detalhes da Consulta</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <p className="font-semibold">Data e Hora:</p>
                      <p>{formatarData(selectedConflito.agendamento.data_hora)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Valor:</p>
                      <p>R$ {selectedConflito.agendamento.valor_total?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status:</p>
                      <p>{selectedConflito.agendamento.status}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Partes Envolvidas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div className="flex items-start gap-2">
                      <Users size={16} className="mt-1" />
                      <div>
                        <p className="font-semibold">Tutor:</p>
                        <p>{selectedConflito.tutor.nome_completo}</p>
                        <p className="text-xs text-gray-500">{selectedConflito.tutor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={16} className="mt-1" />
                      <div>
                        <p className="font-semibold">Veterinário:</p>
                        <p>{selectedConflito.veterinario.nome_completo}</p>
                        <p className="text-xs text-gray-500">{selectedConflito.veterinario.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Descrição do Problema</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{selectedConflito.descricao}</p>
                </CardContent>
              </Card>
              
              {selectedConflito.estorno_solicitado && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold flex items-center gap-2 text-yellow-700">
                    <AlertTriangle size={18} />
                    Solicitação de Estorno
                  </h4>
                  <p className="text-sm mt-2">
                    O tutor solicitou estorno do valor de R$ {selectedConflito.agendamento.valor_total?.toFixed(2)}
                  </p>
                  
                  {selectedConflito.estorno_aprovado === null && (
                    <div className="mt-4 flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default" className="bg-green-600 hover:bg-green-700">
                            Aprovar Estorno
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Aprovar Estorno</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja aprovar o estorno no valor de R$ {selectedConflito.agendamento.valor_total?.toFixed(2)}?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => aprovarEstorno(selectedConflito, selectedConflito.agendamento.valor_total)}>
                              Confirmar Estorno
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Rejeitar Estorno
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rejeitar Estorno</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja rejeitar essa solicitação de estorno?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => rejeitarEstorno(selectedConflito)}>
                              Confirmar Rejeição
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  
                  {selectedConflito.estorno_aprovado === true && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <Check size={18} />
                      <p>Estorno aprovado no valor de R$ {selectedConflito.valor_estorno?.toFixed(2)}</p>
                    </div>
                  )}
                  
                  {selectedConflito.estorno_aprovado === false && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <X size={18} />
                      <p>Solicitação de estorno rejeitada</p>
                    </div>
                  )}
                </div>
              )}
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">Mensagens</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchMensagens(selectedConflito.id).then(setMensagens)}
                      className="h-8"
                    >
                      <RefreshCcw size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4 max-h-60 overflow-y-auto p-1">
                    {mensagens.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Ainda não há mensagens neste conflito.
                      </p>
                    ) : (
                      mensagens.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-3 rounded-lg ${
                            msg.tipo_usuario === 'admin' 
                              ? 'bg-blue-50 border-blue-100 ml-8' 
                              : msg.tipo_usuario === 'tutor'
                                ? 'bg-green-50 border-green-100 mr-8'
                                : 'bg-purple-50 border-purple-100 mr-8'
                          }`}
                        >
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>
                              {msg.tipo_usuario === 'admin' ? 'Administrador' : 
                               msg.tipo_usuario === 'tutor' ? 'Tutor' : 'Veterinário'}
                              {msg.user?.email ? ` (${msg.user.email})` : ''}
                            </span>
                            <span>{formatarData(msg.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.mensagem}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {!selectedConflito.resolvido && (
                    <div className="flex gap-2 mt-4">
                      <Textarea 
                        placeholder="Digite sua mensagem aqui..." 
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                      />
                      <Button 
                        onClick={enviarMensagem}
                        disabled={!novaMensagem.trim()}
                        className="flex-shrink-0"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setModalConflito(false)}
                >
                  Fechar
                </Button>
                
                {!selectedConflito.resolvido && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                        <ClipboardCheck size={16} />
                        Marcar como Resolvido
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Resolver Conflito</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja marcar este conflito como resolvido?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => resolverConflito(selectedConflito)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default MediacaoConflitosPage;
