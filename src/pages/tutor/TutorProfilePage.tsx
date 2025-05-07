
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

interface TutorProfileFormData {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  cidade: string;
  estado: string;
}

const TutorProfilePage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<TutorProfileFormData | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<TutorProfileFormData>({
    defaultValues: profileData || {
      nome: '',
      email: user?.email || '',
      telefone: '',
      cep: '',
      cidade: '',
      estado: ''
    }
  });

  React.useEffect(() => {
    const fetchTutorProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tutores')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfileData({
            nome: data.nome || '',
            email: data.email || user.email || '',
            telefone: data.telefone || '',
            cep: data.cep || '',
            cidade: data.cidade || '',
            estado: data.estado || ''
          });
        }
      } catch (error: any) {
        console.error('Erro ao buscar perfil do tutor:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTutorProfile();
  }, [user]);
  
  const onSubmit = async (data: TutorProfileFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tutores')
        .upsert({
          user_id: user.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cep: data.cep,
          cidade: data.cidade,
          estado: data.estado,
          updated_at: new Date()
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize seus dados pessoais e de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input 
                  id="nome" 
                  placeholder="Seu nome completo" 
                  {...register("nome", { required: "Nome é obrigatório" })}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  {...register("email", { required: "Email é obrigatório" })}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  placeholder="(00) 00000-0000" 
                  {...register("telefone", { required: "Telefone é obrigatório" })}
                />
                {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input 
                  id="cep" 
                  placeholder="00000-000" 
                  {...register("cep")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input 
                  id="cidade" 
                  placeholder="Sua cidade" 
                  {...register("cidade")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input 
                  id="estado" 
                  placeholder="UF" 
                  maxLength={2}
                  {...register("estado")}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorProfilePage;
