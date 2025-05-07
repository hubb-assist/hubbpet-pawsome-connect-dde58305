
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
  DialogDescription,
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
import { Loader2 } from "lucide-react";

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

type FormValues = z.infer<typeof formSchema>;

const ProcedimentoFormDialog = ({
  open,
  onOpenChange,
  procedimento,
  onSuccess,
}: ProcedimentoFormDialogProps) => {
  const isEditing = !!procedimento;
  
  const form = useForm<FormValues>({
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

  const onSubmit = async (values: FormValues) => {
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

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Procedimento" : "Adicionar Procedimento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edite os dados do procedimento existente." 
              : "Preencha os campos abaixo para cadastrar um novo procedimento."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Procedimento*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome" 
                      {...field} 
                      disabled={isSubmitting} 
                    />
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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Atualizando..." : "Salvando..."}
                  </>
                ) : (
                  isEditing ? "Atualizar" : "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProcedimentoFormDialog;
