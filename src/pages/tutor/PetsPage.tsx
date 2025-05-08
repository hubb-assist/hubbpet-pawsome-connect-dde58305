import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Pet, PetSexo } from '@/domain/models/User';
import PetFormDialog from '@/components/tutor/PetFormDialog';
import DeleteConfirmationDialog from '@/components/tutor/DeleteConfirmationDialog';

// Mapeamento de códigos para valores legíveis
const petTypeMapping: Record<string, string> = {
  "Cachorro": "dog",
  "Gato": "cat",
  "Pássaro": "bird",
  "Réptil": "reptile",
  "Outro": "other"
};

const PetsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Primeiro, buscar o ID real do tutor
      const { data: tutor, error: tutorError } = await supabase
        .from('tutores')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (tutorError) {
        console.error("Erro ao buscar perfil do tutor:", tutorError);
        toast({
          title: "Erro de perfil",
          description: "Seu perfil de tutor não está disponível. Por favor, faça logout e login novamente.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Buscando pets para o tutor:", tutor.id);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('tutor_id', tutor.id)
        .order('nome', { ascending: true });
      
      if (error) {
        console.error("Erro ao buscar pets:", error);
        throw error;
      }
      
      console.log("Pets recebidos:", data);
      
      // Converter os dados recebidos do Supabase para o formato esperado por Pet
      const formattedPets: Pet[] = data?.map(pet => {
        // Identificar o tipo do pet com base no mapeamento inverso
        const petType = petTypeMapping[pet.especie] || "other";
        
        return {
          id: pet.id,
          name: pet.nome,
          type: petType as 'dog' | 'cat' | 'bird' | 'reptile' | 'other',
          breed: pet.raca || '',
          birthdate: pet.data_nascimento ? new Date(pet.data_nascimento) : undefined,
          sexo: pet.sexo as PetSexo | undefined,
          peso: pet.peso ? Number(pet.peso) : undefined,
          tutorId: pet.tutor_id,
          createdAt: new Date(pet.created_at),
          updatedAt: new Date(pet.updated_at)
        };
      }) || [];
      
      setPets(formattedPets);
    } catch (error: any) {
      console.error('Erro ao buscar pets:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus pets.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPet = (pet: Pet) => {
    setCurrentPet(pet);
    setIsEditDialogOpen(true);
  };

  const handleDeletePet = (pet: Pet) => {
    setCurrentPet(pet);
    setIsDeleteDialogOpen(true);
  };

  const deletePet = async () => {
    if (!currentPet) return;
    
    try {
      console.log("Removendo pet:", currentPet.id);
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', currentPet.id);
        
      if (error) throw error;
        
      setPets(pets.filter(pet => pet.id !== currentPet.id));
      toast({
        title: "Pet removido",
        description: `${currentPet.name} foi removido com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro ao remover pet:", error);
      toast({
        title: "Erro ao remover pet",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentPet(null);
    }
  };

  const petTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'dog': 'Cachorro',
      'cat': 'Gato',
      'bird': 'Pássaro',
      'reptile': 'Réptil',
      'other': 'Outro'
    };
    return types[type] || type;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Pets</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Pet
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Carregando pets...</div>
        </div>
      ) : pets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <CardTitle>{pet.name}</CardTitle>
                <CardDescription>{petTypeLabel(pet.type)} • {pet.breed || 'Raça não especificada'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pet.birthdate && (
                    <p className="text-sm">
                      Data de Nascimento: {pet.birthdate.toLocaleDateString()}
                    </p>
                  )}
                  {pet.sexo && (
                    <p className="text-sm">
                      Sexo: {pet.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                    </p>
                  )}
                  {pet.peso && (
                    <p className="text-sm">
                      Peso: {pet.peso} kg
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditPet(pet)}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeletePet(pet)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Remover
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum pet.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Seu Primeiro Pet
            </Button>
          </CardContent>
        </Card>
      )}

      <PetFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSaved={fetchPets}
      />

      {currentPet && (
        <>
          <PetFormDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            pet={currentPet}
            onSaved={fetchPets}
          />

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={deletePet}
            title={`Remover ${currentPet.name}`}
            description={`Tem certeza que deseja remover ${currentPet.name}? Esta ação não poderá ser desfeita.`}
          />
        </>
      )}
    </div>
  );
};

export default PetsPage;
