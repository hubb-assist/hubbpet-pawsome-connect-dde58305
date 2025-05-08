
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  Filter,
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
import VeterinarioCard from '@/components/tutor/VeterinarioCard';

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
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>('todas');
  
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
      especialidadeFilter === 'todas' || 
      vet.especialidades?.includes(especialidadeFilter);
    
    return matchesSearch && matchesEspecialidade;
  });

  // Lista de todas as especialidades disponíveis
  const especialidades = Array.from(
    new Set(
      veterinarios?.flatMap(v => v.especialidades || []).filter(e => e)
    )
  ).sort();

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
                <SelectItem value="todas">Todas especialidades</SelectItem>
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
