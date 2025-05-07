
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ProcedimentoFormDialog from '@/components/admin/ProcedimentoFormDialog';
import DeleteConfirmationDialog from '@/components/tutor/DeleteConfirmationDialog';
import { Procedimento } from '@/shared/types';

const ProcedimentosPage = () => {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [procedimentoToEdit, setProcedimentoToEdit] = useState<Procedimento | null>(null);
  const [procedimentoToDelete, setProcedimentoToDelete] = useState<Procedimento | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadProcedimentos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('procedimentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProcedimentos(data as Procedimento[] || []);
    } catch (error: any) {
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
      const { error } = await supabase
        .from('procedimentos')
        .delete()
        .eq('id', procedimentoToDelete.id);

      if (error) throw error;
      
      setProcedimentos(procedimentos.filter(p => p.id !== procedimentoToDelete.id));
      toast.success('Procedimento removido com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao remover procedimento: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setProcedimentoToDelete(null);
    }
  };

  const filteredProcedimentos = procedimentos.filter(procedimento =>
    procedimento.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Procedimentos</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            placeholder="Buscar procedimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={handleCreateProcedimento}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Procedimento
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hubbpet-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcedimentos.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-8">
              {searchTerm ? 'Nenhum procedimento encontrado para esta busca.' : 'Nenhum procedimento cadastrado.'}
            </p>
          ) : (
            filteredProcedimentos.map((procedimento) => (
              <Card key={procedimento.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">{procedimento.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {procedimento.descricao || 'Sem descrição'}
                  </p>
                  <div className="flex justify-end gap-2 mt-2">
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
                </CardContent>
              </Card>
            ))
          )}
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
