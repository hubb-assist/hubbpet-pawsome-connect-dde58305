
import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Procedimento } from '@/shared/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProcedimentoTableProps {
  procedimentos: Procedimento[];
  sortConfig: {
    key: keyof Procedimento;
    direction: 'asc' | 'desc';
  };
  searchTerm: string;
  onRequestSort: (key: keyof Procedimento) => void;
  onEdit: (procedimento: Procedimento) => void;
  onDelete: (procedimento: Procedimento) => void;
}

const ProcedimentoTable = ({
  procedimentos,
  sortConfig,
  searchTerm,
  onRequestSort,
  onEdit,
  onDelete
}: ProcedimentoTableProps) => {

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const sortedProcedimentos = useMemo(() => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => onRequestSort('nome')} className="cursor-pointer">
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead onClick={() => onRequestSort('created_at')} className="cursor-pointer">
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
                      onClick={() => onEdit(procedimento)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="h-8"
                      onClick={() => onDelete(procedimento)}
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
  );
};

export default ProcedimentoTable;
