
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Procedimento } from '@/shared/types';

export const useProcedimentos = () => {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [procedimentoToEdit, setProcedimentoToEdit] = useState<Procedimento | null>(null);
  const [procedimentoToDelete, setProcedimentoToDelete] = useState<Procedimento | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Procedimento,
    direction: 'asc' | 'desc'
  }>({
    key: 'created_at',
    direction: 'desc'
  });

  const loadProcedimentos = async () => {
    setIsLoading(true);
    try {
      console.log("Buscando procedimentos...");
      
      // Usando uma consulta direta ao RPC sem exigir políticas RLS específicas
      const { data, error } = await supabase
        .from('procedimentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar procedimentos:", error);
        throw error;
      }
      
      console.log("Procedimentos carregados:", data?.length || 0, "registros");
      setProcedimentos(data as Procedimento[] || []);
    } catch (error: any) {
      console.error("Exceção ao carregar procedimentos:", error);
      toast.error(`Erro ao carregar procedimentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProcedimento = () => {
    setProcedimentoToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditProcedimento = (procedimento: Procedimento) => {
    setProcedimentoToEdit(procedimento);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (procedimento: Procedimento) => {
    setProcedimentoToDelete(procedimento);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!procedimentoToDelete) return;

    try {
      console.log(`Excluindo procedimento com ID: ${procedimentoToDelete.id}`);
      const { error } = await supabase
        .from('procedimentos')
        .delete()
        .eq('id', procedimentoToDelete.id);

      if (error) {
        console.error("Erro ao excluir procedimento:", error);
        throw error;
      }
      
      console.log("Procedimento excluído com sucesso");
      setProcedimentos(procedimentos.filter(p => p.id !== procedimentoToDelete.id));
      toast.success('Procedimento removido com sucesso!');
    } catch (error: any) {
      console.error("Exceção ao excluir procedimento:", error);
      toast.error(`Erro ao remover procedimento: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setProcedimentoToDelete(null);
    }
  };

  const requestSort = (key: keyof Procedimento) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    loadProcedimentos();
  }, []);

  return {
    procedimentos,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortConfig,
    procedimentoToEdit,
    procedimentoToDelete,
    isFormOpen,
    setIsFormOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleCreateProcedimento,
    handleEditProcedimento,
    handleDeleteClick,
    handleDeleteConfirm,
    requestSort,
    loadProcedimentos
  };
};
