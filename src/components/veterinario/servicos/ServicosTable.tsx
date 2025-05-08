
import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ServicosTableProps {
  servicos: any[];
  comissaoGlobal: number;
  onEdit: (servico: any) => void;
  onDelete: (servico: any) => void;
}

const ServicosTable = ({ servicos, comissaoGlobal, onEdit, onDelete }: ServicosTableProps) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const calcularValorComissao = (preco: number) => {
    return (preco * comissaoGlobal) / 100;
  };

  const calcularValorLiquido = (preco: number) => {
    const comissao = calcularValorComissao(preco);
    return preco - comissao;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nome</TableHead>
            <TableHead className="hidden md:table-cell">Procedimentos</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-right hidden md:table-cell">Comissão ({comissaoGlobal}%)</TableHead>
            <TableHead className="text-right hidden lg:table-cell">Valor Líquido</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servicos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                Nenhum serviço cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            servicos.map((servico) => (
              <TableRow key={servico.id}>
                <TableCell className="font-medium">
                  {servico.nome}
                  {servico.descricao && (
                    <p className="text-xs text-gray-500 block md:hidden mt-1">
                      {servico.descricao.substring(0, 50)}{servico.descricao.length > 50 ? '...' : ''}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {servico.procedimentos_servicos?.map((ps: any, index: number) => (
                    <span key={ps.procedimento.id} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                      {ps.procedimento.nome}
                    </span>
                  ))}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(servico.preco)}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell text-red-500">
                  - {formatCurrency(calcularValorComissao(servico.preco))}
                </TableCell>
                <TableCell className="text-right hidden lg:table-cell text-green-600">
                  {formatCurrency(calcularValorLiquido(servico.preco))}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => onEdit(servico)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Editar</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="h-8"
                      onClick={() => onDelete(servico)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Excluir</span>
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

export default ServicosTable;
