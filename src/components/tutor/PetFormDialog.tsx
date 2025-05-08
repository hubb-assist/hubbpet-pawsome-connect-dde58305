
import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Pet } from '@/domain/models/User';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface PetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet?: Pet;
  onSaved: () => void;
}

// Schema para validação dos dados do pet
const petSchema = z.object({
  name: z.string().min(1, { message: "Nome do pet é obrigatório" }),
  type: z.enum(["dog", "cat", "bird", "reptile", "other"], {
    required_error: "Selecione o tipo do pet",
  }),
  breed: z.string().optional(),
  birthdate: z.string().optional(),
  sexo: z.enum(["macho", "femea", "outro"]).optional(),
  peso: z.coerce.number().optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

const PetFormDialog = ({ open, onOpenChange, pet, onSaved }: PetFormDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const isEditing = !!pet;
  
  const form = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: pet ? {
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      birthdate: pet.birthdate ? new Date(pet.birthdate).toISOString().split('T')[0] : undefined,
      sexo: pet.sexo || undefined,
      peso: pet.peso || undefined,
    } : {
      name: '',
      type: 'dog',
      breed: '',
      birthdate: undefined,
      sexo: undefined,
      peso: undefined,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      if (pet) {
        form.reset({
          name: pet.name,
          type: pet.type,
          breed: pet.breed || '',
          birthdate: pet.birthdate ? new Date(pet.birthdate).toISOString().split('T')[0] : undefined,
          sexo: pet.sexo || undefined,
          peso: pet.peso || undefined,
        });
      } else {
        form.reset({
          name: '',
          type: 'dog',
          breed: '',
          birthdate: undefined,
          sexo: undefined,
          peso: undefined,
        });
      }
    }
  }, [open, pet, form]);
  
  const onSubmit = async (data: PetFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const petData = {
        nome: data.name,
        especie: data.type,
        raca: data.breed || null,
        data_nascimento: data.birthdate ? data.birthdate : null,
        sexo: data.sexo || null,
        peso: data.peso || null,
        tutor_id: user.id,
        updated_at: new Date().toISOString(),
      };
      
      console.log("Enviando dados do pet:", petData);
      
      let response;
      
      if (isEditing && pet) {
        response = await supabase
          .from('pets')
          .update(petData)
          .eq('id', pet.id);
      } else {
        response = await supabase
          .from('pets')
          .insert({ ...petData, created_at: new Date().toISOString() });
      }
      
      const { error } = response;
      
      if (error) {
        console.error("Erro na requisição Supabase:", error);
        throw error;
      }
      
      toast({
        title: isEditing ? "Pet atualizado" : "Pet adicionado",
        description: isEditing ? "As informações do pet foram atualizadas." : "Novo pet adicionado com sucesso.",
      });
      
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o pet.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Editar ${pet?.name}` : 'Adicionar Novo Pet'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do seu pet.' 
              : 'Adicione informações sobre seu pet para melhorar o atendimento veterinário.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Pet *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do pet" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espécie *</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de animal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dog">Cachorro</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                      <SelectItem value="bird">Pássaro</SelectItem>
                      <SelectItem value="reptile">Réptil</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raça</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Raça do pet" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o sexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="macho">Macho</SelectItem>
                        <SelectItem value="femea">Fêmea</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="Peso do pet" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PetFormDialog;
