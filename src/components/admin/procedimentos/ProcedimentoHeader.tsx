
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

interface ProcedimentoHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onCreateProcedimento: () => void;
}

const ProcedimentoHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  onCreateProcedimento 
}: ProcedimentoHeaderProps) => {
  return (
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
        <Button onClick={onCreateProcedimento}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Procedimento
        </Button>
      </div>
    </div>
  );
};

export default ProcedimentoHeader;
