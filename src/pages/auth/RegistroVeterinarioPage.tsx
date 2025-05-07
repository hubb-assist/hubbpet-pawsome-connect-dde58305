
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Loader } from 'lucide-react';

const RegistroVeterinarioPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [crm, setCrm] = useState('');
  const [estado_crm, setEstadoCrm] = useState('');
  const [especializacoes, setEspecializacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleRegistrarVeterinario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast("Erro de autenticação", {
        description: "Você precisa estar logado para se registrar como veterinário."
      });
      navigate('/auth');
      return;
    }
    
    if (!nome || !crm || !estado_crm) {
      setErro('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }
    
    setIsLoading(true);
    setErro(null);
    
    try {
      // Verificar se já existe registro para este usuário
      const { data: existingVeterinario, error: checkError } = await supabase
        .from('veterinarios')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingVeterinario) {
        // Se já existe, redirecionar para a página de aguardando aprovação
        navigate('/vet/aguardando-aprovacao');
        return;
      }
      
      // Criar novo registro de veterinário
      const { error } = await supabase.from('veterinarios').insert({
        user_id: user.id,
        nome_completo: nome,
        crm: crm,
        estado_crm: estado_crm,
        especialidades: especializacoes.split(',').map(item => item.trim()),
        status_aprovacao: 'pendente',
        email: user.email,
      });
      
      if (error) throw error;
      
      // Atualizar o papel do usuário se ainda não foi definido
      await supabase.auth.updateUser({
        data: { role: 'veterinario' }
      });
      
      // Definir o papel na tabela roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'veterinario'
        });
        
      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Erro ao definir papel:', roleError);
      }
      
      toast("Cadastro enviado", {
        description: "Seu cadastro de veterinário foi enviado e está em análise."
      });
      
      navigate('/vet/aguardando-aprovacao');
      
    } catch (error: any) {
      console.error('Erro ao registrar veterinário:', error);
      setErro(error.message || 'Ocorreu um erro no cadastro.');
      
      toast("Erro no cadastro", {
        description: error.message || "Ocorreu um erro ao processar seu cadastro."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img 
            src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo_ESCURO.png" 
            alt="HubbPet" 
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-[#2D113F] mb-2">Cadastro de Veterinário</h1>
          <p className="text-gray-500">Preencha seus dados profissionais para começar o processo de aprovação.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
            <CardDescription>
              Seus dados serão verificados por nossa equipe antes da aprovação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistrarVeterinario} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome"
                  placeholder="Seu nome completo" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="crm">CRMV</Label>
                  <Input 
                    id="crm"
                    placeholder="Número do CRMV" 
                    value={crm} 
                    onChange={(e) => setCrm(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado_crm">UF</Label>
                  <Input 
                    id="estado_crm"
                    placeholder="UF" 
                    maxLength={2} 
                    value={estado_crm} 
                    onChange={(e) => setEstadoCrm(e.target.value.toUpperCase())} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="especializacoes">Especialidades</Label>
                <Input 
                  id="especializacoes"
                  placeholder="Especialidades separadas por vírgula" 
                  value={especializacoes} 
                  onChange={(e) => setEspecializacoes(e.target.value)} 
                />
              </div>
              
              {erro && <p className="text-red-500 text-sm">{erro}</p>}
              
              <div className="pt-2 flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#2D113F] hover:bg-[#2D113F]/80"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Cadastro'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-4 text-sm text-gray-500">
          Já possui conta? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>Faça login</Button>
        </p>
      </div>
    </div>
  );
};

export default RegistroVeterinarioPage;
