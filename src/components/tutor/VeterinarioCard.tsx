
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, Star } from "lucide-react";

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

interface VeterinarioCardProps {
  veterinario: Veterinario;
}

const VeterinarioCard = ({ veterinario }: VeterinarioCardProps) => {
  const navigate = useNavigate();

  const verPerfil = () => {
    navigate(`/tutor/veterinario/${veterinario.id}`);
  };

  return (
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
          onClick={verPerfil}
        >
          Ver Perfil e Serviços
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VeterinarioCard;
