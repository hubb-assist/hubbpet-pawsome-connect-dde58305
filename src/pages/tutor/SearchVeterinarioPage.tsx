
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  Filter,
  User,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Veterinario = {
  id: string;
  nome_completo: string;
  especialidades: string[];
  cidade: string;
  estado: string;
  bio: string | null;
  tipo_atendimento: 'clinica' | 'domicilio' | 'ambos';
  foto_perfil: string | null;
};

const SearchVeterinarioPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>('');
  
  // Busca veterinários aprovados do Supabase
  const { data: veterinarios, isLoading, error } = useQuery({
    queryKey: ['veterinarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veterinarios')
        .select('*')
        .eq('status_aprovacao', 'aprovado');
      
      if (error) throw error;
      return data as Veterinario[];
    }
  });

  // Filtragem de veterinários baseada na busca e filtros
  const filteredVeterinarios = veterinarios?.filter(vet => {
    // Filtro por termo de busca (nome ou cidade)
    const matchesSearch = 
      searchTerm === '' || 
      vet.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por especialidade
    const matchesEspecialidade = 
      especialidadeFilter === '' || 
      vet.especialidades?.includes(especialidadeFilter);
    
    return matchesSearch && matchesEspecialidade;
  });

  // Lista de todas as especialidades disponíveis
  const especialidades = Array.from(
    new Set(
      veterinarios?.flatMap(v => v.especialidades || []).filter(e => e)
    )
  ).sort();

  // Componente de card para veterinário
  const VeterinarioCard = ({ veterinario }: { veterinario: Veterinario }) => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{veterinario.nome_completo}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin size={14} className="mr-1 text-gray-500" />
              <span>{veterinario.cidade}, {veterinario.estado}</span>
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {veterinario.foto_perfil ? (
              <img 
                src={veterinario.foto_perfil} 
                alt={veterinario.nome_completo} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={24} className="text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 space-y-2">
          {veterinario.especialidades && veterinario.especialidades.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {veterinario.especialidades.slice(0, 3).map((esp, index) => (
                <span 
                  key={index} 
                  className="text-xs px-2 py-0.5 bg-[#2D113F] text-white rounded-full"
                >
                  {esp}
                </span>
              ))}
              {veterinario.especialidades.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                  +{veterinario.especialidades.length - 3}
                </span>
              )}
            </div>
          )}
          <p className="text-sm text-gray-600 line-clamp-2">
            {veterinario.bio || "Sem descrição disponível"}
          </p>
          <div className="flex items-center text-sm">
            <span className="flex items-center text-amber-500">
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-none stroke-current" />
            </span>
            <span className="ml-1 text-gray-600">(4.0)</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 pb-3">
        <Button 
          className="w-full bg-[#DD6B20] hover:bg-[#C05621]"
          onClick={() => console.log(`Ver perfil do veterinário ${veterinario.id}`)}
        >
          Ver Perfil e Serviços
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container max-w-screen-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Encontre Veterinários</h1>
        <p className="text-gray-600">
          Busque por profissionais qualificados para cuidar do seu pet
        </p>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar por nome ou cidade"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={especialidadeFilter} onValueChange={setEspecialidadeFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter size={18} className="mr-2 text-gray-500" />
                <SelectValue placeholder="Especialidade" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todas especialidades</SelectItem>
                {especialidades.map((esp) => (
                  <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="pt-1 pb-3">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
          <p>Ocorreu um erro ao carregar os veterinários.</p>
        </div>
      ) : filteredVeterinarios && filteredVeterinarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVeterinarios.map((veterinario) => (
            <VeterinarioCard key={veterinario.id} veterinario={veterinario} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500 mb-2">Nenhum veterinário encontrado</p>
          <p className="text-sm text-gray-400">Tente outros filtros ou busque novamente mais tarde</p>
        </div>
      )}
    </div>
  );
};

export default SearchVeterinarioPage;
