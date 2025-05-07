
import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProcedimentoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedimento: {
    id: string;
    nome: string;
    descricao: string | null;
  } | null;
  onSuccess: () => void;
}

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
});

const ProcedimentoFormDialog = ({
  open,
  onOpenChange,
  procedimento,
  onSuccess,
}: ProcedimentoFormDialogProps) => {
  const isEditing = !!procedimento;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
    },
  });

  useEffect(() => {
    if (procedimento) {
      form.reset({
        nome: procedimento.nome,
        descricao: procedimento.descricao || "",
      });
    } else {
      form.reset({
        nome: "",
        descricao: "",
      });
    }
  }, [procedimento, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing) {
        // Atualizando procedimento existente
        const { error } = await supabase
          .from("procedimentos")
          .update({
            nome: values.nome,
            descricao: values.descricao || null,
          })
          .eq("id", procedimento!.id);

        if (error) throw error;
        toast.success("Procedimento atualizado com sucesso!");
      } else {
        // Criando novo procedimento
        const { error } = await supabase
          .from("procedimentos")
          .insert({
            nome: values.nome,
            descricao: values.descricao || null,
          });

        if (error) throw error;
        toast.success("Procedimento criado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Procedimento" : "Adicionar Procedimento"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Procedimento</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o procedimento"
                      className="resize-none min-h-[100px]" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProcedimentoFormDialog;
