
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { DIAS_SEMANA, NovaDisponibilidade, DisponibilidadeVeterinario } from '@/types/agenda';

const formSchema = z.object({
  dia_semana: z.number().min(0).max(6),
  hora_inicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato inválido. Use HH:MM" }),
  hora_fim: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato inválido. Use HH:MM" }),
  intervalo_minutos: z.number().min(10).max(120)
}).refine(data => {
  const inicio = data.hora_inicio.split(':').map(Number);
  const fim = data.hora_fim.split(':').map(Number);
  const inicioMinutos = inicio[0] * 60 + inicio[1];
  const fimMinutos = fim[0] * 60 + fim[1];
  return fimMinutos > inicioMinutos;
}, {
  message: "Hora final deve ser maior que a hora inicial",
  path: ["hora_fim"]
});

interface DisponibilidadeFormProps {
  disponibilidadeId?: string;
  veterinarioId: string;
  onSuccess?: () => void;
}

const DisponibilidadeForm: React.FC<DisponibilidadeFormProps> = ({
  disponibilidadeId,
  veterinarioId,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeVeterinario | null>(null);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dia_semana: 1, // Segunda-feira
      hora_inicio: "08:00",
      hora_fim: "17:00",
      intervalo_minutos: 30
    }
  });

  useEffect(() => {
    if (disponibilidadeId) {
      carregarDisponibilidade(disponibilidadeId);
    }
  }, [disponibilidadeId]);

  const carregarDisponibilidade = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('disponibilidade_veterinario')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setDisponibilidade(data);
        form.reset({
          dia_semana: data.dia_semana,
          hora_inicio: data.hora_inicio.substring(0, 5),
          hora_fim: data.hora_fim.substring(0, 5),
          intervalo_minutos: data.intervalo_minutos || 30
        });
      }
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
      toast("Erro ao carregar horário", {
        description: "Não foi possível carregar os dados deste horário"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      if (!veterinarioId) {
        throw new Error("ID do veterinário não encontrado");
      }

      const novaDisponibilidade: NovaDisponibilidade = {
        veterinario_id: veterinarioId,
        dia_semana: values.dia_semana,
        hora_inicio: values.hora_inicio,
        hora_fim: values.hora_fim,
        intervalo_minutos: values.intervalo_minutos
      };

      let error;

      if (disponibilidadeId) {
        ({ error } = await supabase
          .from('disponibilidade_veterinario')
          .update(novaDisponibilidade)
          .eq('id', disponibilidadeId));
      } else {
        ({ error } = await supabase
          .from('disponibilidade_veterinario')
          .insert([novaDisponibilidade]));
      }

      if (error) throw error;

      toast("Horário salvo", {
        description: "Sua disponibilidade foi registrada com sucesso!"
      });

      if (onSuccess) onSuccess();

      if (!disponibilidadeId) {
        form.reset(); // Limpa o formulário apenas para novos registros
      }
    } catch (error: any) {
      console.error("Erro ao salvar disponibilidade:", error);
      toast("Erro ao salvar", {
        description: error.message || "Não foi possível salvar este horário"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {disponibilidadeId ? "Editar Disponibilidade" : "Nova Disponibilidade"}
        </CardTitle>
        <CardDescription>
          Defina os dias e horários em que você está disponível para atendimento
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dia_semana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia da Semana</FormLabel>
                  <Select 
                    value={field.value.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Selecione o dia da semana" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIAS_SEMANA.map((dia) => (
                        <SelectItem key={dia.valor} value={dia.valor.toString()}>
                          {dia.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hora_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <Input {...field} placeholder="08:00" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Término</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <Input {...field} placeholder="18:00" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="intervalo_minutos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração da Consulta (minutos)</FormLabel>
                  <Select 
                    value={field.value.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Duração da consulta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="20">20 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-end pt-4 px-0">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#DD6B20] hover:bg-[#DD6B20]/80"
              >
                {isLoading ? "Salvando..." : "Salvar Disponibilidade"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DisponibilidadeForm;
