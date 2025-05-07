
import { Database } from "@/integrations/supabase/types";

export type DisponibilidadeVeterinario = Database['public']['Tables']['disponibilidade_veterinario']['Row'];

export type NovaDisponibilidade = Omit<DisponibilidadeVeterinario, 'id' | 'created_at' | 'updated_at'>;

export const DIAS_SEMANA = [
  { valor: 0, nome: "Domingo" },
  { valor: 1, nome: "Segunda-feira" },
  { valor: 2, nome: "Terça-feira" },
  { valor: 3, nome: "Quarta-feira" },
  { valor: 4, nome: "Quinta-feira" },
  { valor: 5, nome: "Sexta-feira" },
  { valor: 6, nome: "Sábado" }
];

export const formatarHora = (hora: string): string => {
  return hora.substring(0, 5);
};

export const intervaloParaMinutos = (intervalo: string): number => {
  const [horas, minutos] = intervalo.split(':').map(Number);
  return horas * 60 + minutos;
};

export const minutosParaIntervalo = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};
