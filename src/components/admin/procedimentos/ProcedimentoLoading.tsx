
import React from 'react';
import { Loader2 } from "lucide-react";

const ProcedimentoLoading = () => {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-hubbpet-primary" />
    </div>
  );
};

export default ProcedimentoLoading;
