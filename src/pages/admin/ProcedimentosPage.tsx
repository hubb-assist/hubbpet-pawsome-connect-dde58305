
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Pencil, Trash2, ArrowUpDown, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProcedimentoFormDialog from '@/components/admin/ProcedimentoFormDialog';
import DeleteConfirmationDialog from '@/components/tutor/DeleteConfirmationDialog';
import { Procedimento } from '@/shared/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProcedimentosPage = () => {
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

  useEffect(() => {
    loadProcedimentos();
  }, []);

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

  const sortedProcedimentos = React.useMemo(() => {
    let sortableProcedimentos = [...procedimentos];
    if (sortConfig.key) {
      sortableProcedimentos.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProcedimentos;
  }, [procedimentos, sortConfig]);

  const filteredProcedimentos = sortedProcedimentos.filter(procedimento =>
    procedimento.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Procedimentos</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreateProcedimento}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Procedimento
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-hubbpet-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('nome')} className="cursor-pointer">
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead onClick={() => requestSort('created_at')} className="cursor-pointer">
                  Cadastrado em
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcedimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    {searchTerm ? 'Nenhum procedimento encontrado para esta busca.' : 'Nenhum procedimento cadastrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProcedimentos.map((procedimento) => (
                  <TableRow key={procedimento.id}>
                    <TableCell className="font-medium">{procedimento.nome}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {procedimento.descricao || 'Sem descrição'}
                    </TableCell>
                    <TableCell>{formatDate(procedimento.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleEditProcedimento(procedimento)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="h-8"
                          onClick={() => handleDeleteClick(procedimento)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProcedimentoFormDialog
        open={isFormOpen}
        procedimento={procedimentoToEdit}
        onOpenChange={setIsFormOpen}
        onSuccess={loadProcedimentos}
      />
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Remover Procedimento"
        description="Tem certeza que deseja remover este procedimento? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default ProcedimentosPage;
