
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ConfiguracoesComissaoPage = () => {
  const [comissao, setComissao] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configuração de comissão global
  const { data: configComissao, isLoading } = useQuery({
    queryKey: ['config-comissao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_configuracoes')
        .select('comissao_padrao')
        .single();

      if (error) throw error;
      return data;
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Erro ao carregar configurações",
          description: error.message || "Não foi possível carregar a configuração de comissão.",
          variant: "destructive"
        });
      }
    }
  });

  // Atualizar o estado da comissão quando os dados forem carregados
  useEffect(() => {
    if (configComissao) {
      setComissao(configComissao.comissao_padrao.toString());
    }
  }, [configComissao]);

  const handleSalvar = async () => {
    if (!comissao) return;

    try {
      setIsSubmitting(true);
      
      // Converter para número antes de enviar
      const comissaoNumerica = parseFloat(comissao);
      
      const { error } = await supabase
        .from('admin_configuracoes')
        .update({
          comissao_padrao: comissaoNumerica,
          atualizado_em: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Comissão global atualizada",
        description: "A configuração de comissão global foi salva com sucesso."
      });

      // Recarregar dados
      queryClient.invalidateQueries({ queryKey: ['config-comissao'] });
      
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
      <h1 className="text-2xl font-bold mb-6">Configurações de Comissão</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-4">
          Configure o percentual de comissão global que será aplicado a todos os serviços realizados na plataforma.
        </p>

        <div className="max-w-md">
          <div className="mb-6">
            <Label htmlFor="comissao" className="text-base">Comissão Global (%)</Label>
            <Input
              type="number"
              id="comissao"
              placeholder="Digite a porcentagem"
              value={comissao}
              onChange={(e) => setComissao(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Este valor será aplicado como comissão para todos os serviços da plataforma.
            </p>
          </div>

          <Button 
            onClick={handleSalvar} 
            disabled={isSubmitting || isLoading}
            className="w-full md:w-auto"
          >
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
    </div>
  );
};

export default ConfiguracoesComissaoPage;
