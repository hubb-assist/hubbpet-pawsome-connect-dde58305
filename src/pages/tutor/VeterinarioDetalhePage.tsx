
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  MapPin, 
  User, 
  Phone, 
  Star, 
  Clock, 
  Calendar 
} from 'lucide-react';
import { formatarHora, DIAS_SEMANA } from '@/types/agenda';

// Tipos
type Veterinario = {
  id: string;
  nome_completo: string;
  especialidades: string[];
  cidade: string;
  estado: string;
  bio: string | null;
  tipo_atendimento: 'clinica' | 'domicilio' | 'ambos';
  foto_perfil: string | null;
  telefone: string | null;
  rua: string | null;
  bairro: string | null;
  cep: string | null;
};

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
};

type Disponibilidade = {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_minutos: number;
};

const VeterinarioDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("informacoes");

  // Busca os dados do veterinário
  const { data: veterinario, isLoading: isLoadingVet, error: errorVet } = useQuery({
    queryKey: ['veterinario', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veterinarios')
        .select('*')
        .eq('id', id)
        .eq('status_aprovacao', 'aprovado')
        .single();
      
      if (error) throw error;
      return data as Veterinario;
    },
    enabled: !!id
  });

  // Busca os serviços do veterinário
  const { data: servicos, isLoading: isLoadingServicos } = useQuery({
    queryKey: ['servicos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('veterinario_id', id);
      
      if (error) throw error;
      return data as Servico[];
    },
    enabled: !!id
  });

  // Busca a disponibilidade do veterinário
  const { data: disponibilidade, isLoading: isLoadingDisponibilidade } = useQuery({
    queryKey: ['disponibilidade', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disponibilidade_veterinario')
        .select('*')
        .eq('veterinario_id', id);
      
      if (error) throw error;
      return data as Disponibilidade[];
    },
    enabled: !!id
  });

  // Iniciar processo de agendamento
  const iniciarAgendamento = (servicoId: string) => {
    if (!veterinario) return;
    
    toast.info("Funcionalidade de agendamento será implementada em breve!");
    console.log(`Iniciando agendamento para serviço ${servicoId} com veterinário ${veterinario.nome_completo}`);
  };

  if (isLoadingVet) {
    return (
      <div className="container max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          <div className="md:w-2/3">
            <Skeleton className="h-10 w-60 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (errorVet || !veterinario) {
    return (
      <div className="container max-w-screen-xl mx-auto p-6">
        <Card className="bg-red-50 border-red-200 p-6">
          <CardTitle className="text-red-700">Veterinário não encontrado</CardTitle>
          <CardDescription className="text-red-600 mt-2">
            Não foi possível encontrar dados para este profissional ou ele não está mais disponível.
          </CardDescription>
        </Card>
      </div>
    );
  }

  // Organizar disponibilidade por dia da semana
  const disponibilidadePorDia = disponibilidade?.reduce((acc, item) => {
    if (!acc[item.dia_semana]) {
      acc[item.dia_semana] = [];
    }
    acc[item.dia_semana].push(item);
    return acc;
  }, {} as Record<number, Disponibilidade[]>) || {};

  return (
    <div className="container max-w-screen-xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Coluna com informações do veterinário */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-1">{veterinario.nome_completo}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin size={14} className="mr-1 text-gray-500" />
                    <span>{veterinario.cidade}, {veterinario.estado}</span>
                  </CardDescription>
                </div>
                <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {veterinario.foto_perfil ? (
                    <img 
                      src={veterinario.foto_perfil} 
                      alt={veterinario.nome_completo} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {veterinario.especialidades && veterinario.especialidades.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {veterinario.especialidades.map((esp, index) => (
                    <span 
                      key={index} 
                      className="text-xs px-2 py-0.5 bg-[#2D113F] text-white rounded-full"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
              )}

              {veterinario.bio && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Sobre</h4>
                  <p className="text-sm text-gray-600">{veterinario.bio}</p>
                </div>
              )}

              <div className="space-y-2">
                {veterinario.telefone && (
                  <div className="flex items-center text-sm">
                    <Phone size={14} className="mr-2 text-gray-500" />
                    <span>{veterinario.telefone}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <Star size={14} className="mr-2 text-amber-500" />
                  <span>4.8 (32 avaliações)</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock size={14} className="mr-2 text-gray-500" />
                  <span>
                    {veterinario.tipo_atendimento === 'clinica' ? 'Atendimento em clínica' : 
                     veterinario.tipo_atendimento === 'domicilio' ? 'Atendimento a domicílio' : 
                     'Atendimento em clínica e a domicílio'}
                  </span>
                </div>
              </div>

              {(veterinario.rua || veterinario.bairro) && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-1">Endereço</h4>
                  <p className="text-sm text-gray-600">
                    {veterinario.rua && `${veterinario.rua}, `}
                    {veterinario.bairro && `${veterinario.bairro}, `}
                    {veterinario.cidade}, {veterinario.estado}
                    {veterinario.cep && ` - CEP: ${veterinario.cep}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna com serviços e disponibilidade */}
        <div className="md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="servicos">Serviços</TabsTrigger>
              <TabsTrigger value="disponibilidade">Disponibilidade</TabsTrigger>
            </TabsList>
            
            {/* Informações Gerais */}
            <TabsContent value="informacoes" className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sobre {veterinario.nome_completo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      {veterinario.bio || `${veterinario.nome_completo} é um profissional veterinário 
                      registrado com especialidade em ${veterinario.especialidades?.join(', ') || 'medicina veterinária geral'}.`}
                    </p>
                    
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-2">Especialidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {veterinario.especialidades?.map((esp, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-[#2D113F]/10 text-[#2D113F] rounded-full"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Serviços */}
            <TabsContent value="servicos">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Serviços oferecidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingServicos ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between border-b pb-4 mb-4">
                          <div>
                            <Skeleton className="h-5 w-40 mb-2" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                          <Skeleton className="h-10 w-28" />
                        </div>
                      ))}
                    </div>
                  ) : servicos && servicos.length > 0 ? (
                    <div className="space-y-4">
                      {servicos.map((servico) => (
                        <div key={servico.id} className="flex flex-col sm:flex-row sm:justify-between border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
                          <div className="mb-3 sm:mb-0">
                            <h3 className="text-md font-medium">{servico.nome}</h3>
                            <p className="text-sm text-gray-600">{servico.descricao || 'Sem descrição adicional.'}</p>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Clock size={14} className="mr-1" />
                              <span>{servico.duracao_minutos} minutos</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold mb-2 text-right">
                              R$ {servico.preco.toFixed(2).replace('.', ',')}
                            </span>
                            <Button
                              className="bg-[#DD6B20] hover:bg-[#C05621]"
                              onClick={() => iniciarAgendamento(servico.id)}
                            >
                              Agendar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Este veterinário ainda não cadastrou serviços.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Disponibilidade */}
            <TabsContent value="disponibilidade">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Horários de atendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDisponibilidade ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b pb-3">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      ))}
                    </div>
                  ) : disponibilidade && disponibilidade.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dia</TableHead>
                          <TableHead>Horário</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {DIAS_SEMANA.map((dia) => {
                          const horariosDia = disponibilidadePorDia[dia.valor] || [];
                          
                          if (horariosDia.length === 0) {
                            return (
                              <TableRow key={dia.valor}>
                                <TableCell className="font-medium">{dia.nome}</TableCell>
                                <TableCell className="text-gray-500">Indisponível</TableCell>
                              </TableRow>
                            );
                          }
                          
                          return (
                            <TableRow key={dia.valor}>
                              <TableCell className="font-medium">{dia.nome}</TableCell>
                              <TableCell>
                                {horariosDia.map((h, idx) => (
                                  <div key={idx} className="mb-1 last:mb-0">
                                    <HoverCard>
                                      <HoverCardTrigger asChild>
                                        <span className="text-sm cursor-help border-b border-dotted border-gray-400">
                                          {formatarHora(h.hora_inicio)} - {formatarHora(h.hora_fim)}
                                        </span>
                                      </HoverCardTrigger>
                                      <HoverCardContent className="w-80">
                                        <div className="flex justify-between space-x-4">
                                          <div className="space-y-1">
                                            <h4 className="text-sm font-semibold">Detalhes do horário</h4>
                                            <p className="text-sm">
                                              Consultas com duração de {h.intervalo_minutos} minutos
                                            </p>
                                            <div className="flex items-center pt-2">
                                              <Calendar className="h-4 w-4 opacity-70 mr-2" />
                                              <span className="text-xs text-muted-foreground">
                                                Disponível para agendamento
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  </div>
                                ))}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Este veterinário ainda não definiu sua disponibilidade.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VeterinarioDetalhePage;
