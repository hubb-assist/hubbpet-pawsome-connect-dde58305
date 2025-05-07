import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Servico {
  id: number;
  nome: string;
}

const ConfiguracoesComissaoPage = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<number | null>(null);
  const [comissao, setComissao] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar serviços do banco de dados
  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const { data, error } = await supabase
          .from('servicos')
          .select('id, nome');

        if (error) throw error;

        if (data) {
          setServicos(data);
        }
      } catch (error: any) {
        toast({
          title: "Erro ao carregar serviços",
          description: error.message || "Não foi possível carregar a lista de serviços.",
          variant: "destructive"
        });
      }
    };

    fetchServicos();
  }, [toast]);

  // Buscar comissões existentes
  const { data: comissoes, isLoading: isComissoesLoading } = useQuery({
    queryKey: ['comissoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comissoes_servicos')
        .select('servico_id, percentual');

      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao carregar comissões",
        description: error.message || "Não foi possível carregar as configurações de comissão.",
        variant: "destructive"
      });
    }
  });

  // Atualizar o valor da comissão quando o serviço é selecionado
  useEffect(() => {
    if (servicoSelecionado && comissoes) {
      const comissaoDoServico = comissoes.find(c => c.servico_id === servicoSelecionado);
      if (comissaoDoServico) {
        setComissao(comissaoDoServico.percentual ? comissaoDoServico.percentual.toString() : '');
      } else {
        setComissao('');
      }
    }
  }, [servicoSelecionado, comissoes]);

  const handleSalvar = async () => {
    if (!comissao) return;

    try {
      setIsSubmitting(true);

      // Converter para número antes de enviar
      const comissaoNumerica = parseFloat(comissao.toString());
      
      const { error } = await supabase
        .from('comissoes_servicos')
        .upsert({
          servico_id: servicoSelecionado,
          percentual: comissaoNumerica,
          atualizado_em: new Date().toISOString()
        }, { onConflict: 'servico_id' });

      if (error) throw error;

      toast({
        title: "Comissão atualizada",
        description: "A configuração de comissão foi salva com sucesso."
      });

      // Recarregar dados
      queryClient.invalidateQueries({ queryKey: ['comissoes'] });
      
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Configurações de Comissão</h1>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="servico">Serviço</Label>
          <Select onValueChange={(value) => setServicoSelecionado(parseInt(value))} value={servicoSelecionado ? servicoSelecionado.toString() : ''}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {servicos.map((servico) => (
                <SelectItem key={servico.id} value={servico.id.toString()}>
                  {servico.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="comissao">Comissão (%)</Label>
          <Input
            type="number"
            id="comissao"
            placeholder="Digite a porcentagem"
            value={comissao || ''}
            onChange={(e) => setComissao(e.target.value)}
          />
        </div>

        <Button onClick={handleSalvar} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configuração"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfiguracoesComissaoPage;
