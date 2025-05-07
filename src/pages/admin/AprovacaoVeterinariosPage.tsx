
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Eye, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Veterinario {
  id: string;
  nome_completo: string;
  crm: string;
  estado_crm: string;
  email: string;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
  crmv_document_url: string | null;
  especialidades: string[] | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
}

const AprovacaoVeterinariosPage = () => {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVeterinario, setSelectedVeterinario] = useState<Veterinario | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pendentes');
  const [motivo, setMotivo] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchVeterinarios();
  }, [activeTab]);

  const fetchVeterinarios = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('veterinarios')
        .select('*');
      
      if (activeTab === 'pendentes') {
        query = query.eq('status_aprovacao', 'pendente');
      } else if (activeTab === 'aprovados') {
        query = query.eq('status_aprovacao', 'aprovado');
      } else if (activeTab === 'rejeitados') {
        query = query.eq('status_aprovacao', 'rejeitado');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setVeterinarios(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Erro ao buscar veterinários: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (veterinario: Veterinario) => {
    setSelectedVeterinario(veterinario);
    setViewDialogOpen(true);
  };

  const handleApproveClick = (veterinario: Veterinario) => {
    setSelectedVeterinario(veterinario);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (veterinario: Veterinario) => {
    setSelectedVeterinario(veterinario);
    setRejectDialogOpen(true);
  };

  const approveVeterinario = async () => {
    if (!selectedVeterinario) return;
    
    try {
      const { error } = await supabase
        .from('veterinarios')
        .update({ status_aprovacao: 'aprovado' })
        .eq('id', selectedVeterinario.id);
      
      if (error) throw error;
      
      // Atualizar a lista localmente
      setVeterinarios(prev => 
        prev.map(v => 
          v.id === selectedVeterinario.id 
            ? { ...v, status_aprovacao: 'aprovado' } 
            : v
        )
      );
      
      toast({
        description: `Veterinário ${selectedVeterinario.nome_completo} aprovado com sucesso!`
      });
      
      setApproveDialogOpen(false);
      
      if (activeTab === 'pendentes') {
        // Se estamos na aba de pendentes, removemos o item da lista
        setVeterinarios(prev => prev.filter(v => v.id !== selectedVeterinario.id));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Erro ao aprovar veterinário: ${error.message}`
      });
    }
  };

  const rejectVeterinario = async () => {
    if (!selectedVeterinario) return;
    
    try {
      const { error } = await supabase
        .from('veterinarios')
        .update({ 
          status_aprovacao: 'rejeitado',
        })
        .eq('id', selectedVeterinario.id);
      
      if (error) throw error;
      
      // Atualizar a lista localmente
      setVeterinarios(prev => 
        prev.map(v => 
          v.id === selectedVeterinario.id 
            ? { ...v, status_aprovacao: 'rejeitado' } 
            : v
        )
      );
      
      toast({
        description: `Veterinário ${selectedVeterinario.nome_completo} rejeitado.`
      });
      
      setRejectDialogOpen(false);
      setMotivo('');
      
      if (activeTab === 'pendentes') {
        // Se estamos na aba de pendentes, removemos o item da lista
        setVeterinarios(prev => prev.filter(v => v.id !== selectedVeterinario.id));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Erro ao rejeitar veterinário: ${error.message}`
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Aprovação de Veterinários</h1>
      
      <Tabs defaultValue="pendentes" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          <TabsTrigger value="rejeitados">Rejeitados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Veterinários Pendentes</CardTitle>
              <CardDescription>
                Veterinários aguardando aprovação para começar a atender.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hubbpet-primary"></div>
                </div>
              ) : veterinarios.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Não há veterinários pendentes de aprovação.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CRMV</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {veterinarios.map((vet) => (
                      <TableRow key={vet.id}>
                        <TableCell className="font-medium">{vet.nome_completo}</TableCell>
                        <TableCell>{vet.crm}/{vet.estado_crm}</TableCell>
                        <TableCell>{vet.email}</TableCell>
                        <TableCell>{new Date(vet.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleView(vet)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-green-600 hover:text-green-700" 
                              onClick={() => handleApproveClick(vet)}
                              title="Aprovar"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-600 hover:text-red-700" 
                              onClick={() => handleRejectClick(vet)}
                              title="Rejeitar"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aprovados">
          <Card>
            <CardHeader>
              <CardTitle>Veterinários Aprovados</CardTitle>
              <CardDescription>
                Veterinários ativos na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hubbpet-primary"></div>
                </div>
              ) : veterinarios.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Não há veterinários aprovados.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CRMV</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {veterinarios.map((vet) => (
                      <TableRow key={vet.id}>
                        <TableCell className="font-medium">{vet.nome_completo}</TableCell>
                        <TableCell>{vet.crm}/{vet.estado_crm}</TableCell>
                        <TableCell>{vet.email}</TableCell>
                        <TableCell>{getStatusBadge(vet.status_aprovacao)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleView(vet)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejeitados">
          <Card>
            <CardHeader>
              <CardTitle>Veterinários Rejeitados</CardTitle>
              <CardDescription>
                Veterinários que não foram aprovados para atender na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hubbpet-primary"></div>
                </div>
              ) : veterinarios.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Não há veterinários rejeitados.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CRMV</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {veterinarios.map((vet) => (
                      <TableRow key={vet.id}>
                        <TableCell className="font-medium">{vet.nome_completo}</TableCell>
                        <TableCell>{vet.crm}/{vet.estado_crm}</TableCell>
                        <TableCell>{vet.email}</TableCell>
                        <TableCell>{getStatusBadge(vet.status_aprovacao)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleView(vet)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-green-600 hover:text-green-700" 
                              onClick={() => handleApproveClick(vet)}
                              title="Aprovar"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal de visualização de detalhes */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Veterinário</DialogTitle>
          </DialogHeader>
          
          {selectedVeterinario && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nome:</span> {selectedVeterinario.nome_completo}</p>
                  <p><span className="font-medium">Email:</span> {selectedVeterinario.email}</p>
                  <p><span className="font-medium">Telefone:</span> {selectedVeterinario.telefone || 'Não informado'}</p>
                  <p><span className="font-medium">CRMV:</span> {selectedVeterinario.crm}/{selectedVeterinario.estado_crm}</p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {getStatusBadge(selectedVeterinario.status_aprovacao)}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Localização</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Cidade:</span> {selectedVeterinario.cidade || 'Não informado'}</p>
                  <p><span className="font-medium">Estado:</span> {selectedVeterinario.estado || 'Não informado'}</p>
                </div>
                
                <h3 className="font-semibold mt-4 mb-2">Especialidades</h3>
                {selectedVeterinario.especialidades && selectedVeterinario.especialidades.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedVeterinario.especialidades.map((esp, index) => (
                      <Badge key={index} variant="secondary">{esp}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma especialidade informada</p>
                )}
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <h3 className="font-semibold mb-2">Documento CRMV</h3>
                {selectedVeterinario.crmv_document_url ? (
                  <div className="mt-2">
                    <a 
                      href={selectedVeterinario.crmv_document_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver documento
                    </a>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum documento anexado</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de aprovação */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Veterinário</DialogTitle>
            <DialogDescription>
              Você está prestes a aprovar {selectedVeterinario?.nome_completo} para atender na plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <p>O veterinário receberá um email informando sua aprovação.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={approveVeterinario}
            >
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de rejeição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Veterinário</DialogTitle>
            <DialogDescription>
              Você está prestes a rejeitar {selectedVeterinario?.nome_completo}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>O veterinário será notificado sobre a rejeição.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={rejectVeterinario}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AprovacaoVeterinariosPage;
