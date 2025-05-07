
import React from 'react';
import { useProcedimentos } from '@/hooks/admin/useProcedimentos';
import ProcedimentoHeader from '@/components/admin/procedimentos/ProcedimentoHeader';
import ProcedimentoTable from '@/components/admin/procedimentos/ProcedimentoTable';
import ProcedimentoLoading from '@/components/admin/procedimentos/ProcedimentoLoading';
import ProcedimentoFormDialog from '@/components/admin/ProcedimentoFormDialog';
import DeleteConfirmationDialog from '@/components/tutor/DeleteConfirmationDialog';

const ProcedimentosPage = () => {
  const {
    procedimentos,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortConfig,
    procedimentoToEdit,
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
  } = useProcedimentos();

  return (
    <div className="container mx-auto py-6">
      <ProcedimentoHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCreateProcedimento={handleCreateProcedimento}
      />

      {isLoading ? (
        <ProcedimentoLoading />
      ) : (
        <ProcedimentoTable
          procedimentos={procedimentos}
          sortConfig={sortConfig}
          searchTerm={searchTerm}
          onRequestSort={requestSort}
          onEdit={handleEditProcedimento}
          onDelete={handleDeleteClick}
        />
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
