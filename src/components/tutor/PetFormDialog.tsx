
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
import { Label } from '@/components/ui/label';
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

interface PetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet?: Pet;
  onSaved: () => void;
}

interface PetFormValues {
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'reptile' | 'other';
  breed: string;
  birthdate?: string;
}

const PetFormDialog = ({ open, onOpenChange, pet, onSaved }: PetFormDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const isEditing = !!pet;
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<PetFormValues>({
    defaultValues: pet ? {
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      birthdate: pet.birthdate ? new Date(pet.birthdate).toISOString().split('T')[0] : undefined,
    } : {
      name: '',
      type: 'dog',
      breed: '',
      birthdate: undefined,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      if (pet) {
        setValue('name', pet.name);
        setValue('type', pet.type);
        setValue('breed', pet.breed || '');
        setValue('birthdate', pet.birthdate ? new Date(pet.birthdate).toISOString().split('T')[0] : undefined);
      } else {
        reset({
          name: '',
          type: 'dog',
          breed: '',
          birthdate: undefined,
        });
      }
    }
  }, [open, pet, setValue, reset]);
  
  const onSubmit = async (data: PetFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const petData = {
        name: data.name,
        type: data.type,
        breed: data.breed || null,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        tutor_id: user.id,
        updated_at: new Date(),
      };
      
      let response;
      
      if (isEditing && pet) {
        response = await supabase
          .from('pets')
          .update(petData)
          .eq('id', pet.id);
      } else {
        response = await supabase
          .from('pets')
          .insert({ ...petData, created_at: new Date() });
      }
      
      const { error } = response;
      
      if (error) throw error;
      
      toast({
        title: isEditing ? "Pet atualizado" : "Pet adicionado",
        description: isEditing ? "As informações do pet foram atualizadas." : "Novo pet adicionado com sucesso.",
      });
      
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const petType = watch('type');
  
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Pet *</Label>
            <Input 
              id="name" 
              {...register("name", { required: "Nome é obrigatório" })}
              placeholder="Nome do pet" 
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Espécie *</Label>
            <Select 
              defaultValue={petType} 
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de animal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Cachorro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="bird">Pássaro</SelectItem>
                <SelectItem value="reptile">Réptil</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="breed">Raça</Label>
            <Input 
              id="breed" 
              {...register("breed")}
              placeholder="Raça do pet" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthdate">Data de Nascimento</Label>
            <Input 
              id="birthdate" 
              type="date" 
              {...register("birthdate")}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PetFormDialog;
