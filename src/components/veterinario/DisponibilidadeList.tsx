
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisponibilidadeVeterinario, DIAS_SEMANA } from '@/types/agenda';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog';

import DisponibilidadeForm from './DisponibilidadeForm';

interface DisponibilidadeListProps {
  veterinarioId: string;
}

const DisponibilidadeList: React.FC<DisponibilidadeListProps> = ({ veterinarioId }) => {
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadeVeterinario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (veterinarioId) {
      console.log('Carregando disponibilidades para veterinário ID:', veterinarioId);
      carregarDisponibilidades();
    }
  }, [veterinarioId]);

  const carregarDisponibilidades = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando busca de disponibilidades...');
      
      const { data, error } = await supabase
        .from('disponibilidade_veterinario')
        .select('*')
        .eq('veterinario_id', veterinarioId)
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) {
        console.error("Erro na consulta:", error);
        throw error;
      }

      console.log('Disponibilidades carregadas:', data);
      setDisponibilidades(data || []);
    } catch (error) {
      console.error("Erro ao carregar disponibilidades:", error);
      toast("Erro ao carregar horários", {
        description: "Não foi possível carregar seus horários disponíveis."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('disponibilidade_veterinario')
        .delete()
        .eq('id', deletingId);

      if (error) throw error;

      toast("Disponibilidade removida", {
        description: "O horário foi removido com sucesso."
      });

      setDisponibilidades(disponibilidades.filter(d => d.id !== deletingId));
    } catch (error) {
      console.error("Erro ao excluir disponibilidade:", error);
      toast("Erro ao excluir", {
        description: "Não foi possível remover este horário."
      });
    } finally {
      setDeletingId(null);
      setIsLoading(false);
    }
  };

  const getNomeDiaSemana = (valor: number) => {
    return DIAS_SEMANA.find(dia => dia.valor === valor)?.nome || "Desconhecido";
  };

  const formatarHora = (hora: string) => {
    return hora.substring(0, 5);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Disponibilidade</CardTitle>
          <Button 
            onClick={() => setShowAddForm(true)}
            variant="outline" 
            className="h-8 border-[#DD6B20] text-[#DD6B20] hover:bg-[#DD6B20]/10"
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D113F]"></div>
            </div>
          ) : disponibilidades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Você ainda não definiu seus horários de atendimento.</p>
              <p className="mt-2">Adicione seus horários disponíveis para começar a receber agendamentos.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {disponibilidades.map(disp => (
                <div 
                  key={disp.id}
                  className="flex justify-between items-center p-3 border rounded-md bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{getNomeDiaSemana(disp.dia_semana)}</p>
                    <p className="text-sm text-gray-600">
                      {formatarHora(disp.hora_inicio)} - {formatarHora(disp.hora_fim)} 
                      <span className="ml-2 text-xs text-gray-500">
                        (consultas de {disp.intervalo_minutos} min)
                      </span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingId(disp.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeletingId(disp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar nova disponibilidade */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Disponibilidade</DialogTitle>
            <DialogDescription>
              Defina os dias e horários em que você está disponível para atendimento
            </DialogDescription>
          </DialogHeader>
          
          <DisponibilidadeForm
            veterinarioId={veterinarioId} 
            onSuccess={() => {
              carregarDisponibilidades();
              setShowAddForm(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar disponibilidade */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Disponibilidade</DialogTitle>
            <DialogDescription>
              Atualize os dias e horários em que você está disponível
            </DialogDescription>
          </DialogHeader>
          
          {editingId && (
            <DisponibilidadeForm
              disponibilidadeId={editingId}
              veterinarioId={veterinarioId} 
              onSuccess={() => {
                carregarDisponibilidades();
                setEditingId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para excluir */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este horário de disponibilidade?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DisponibilidadeList;
