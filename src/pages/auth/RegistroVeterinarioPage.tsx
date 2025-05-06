
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckIcon, ArrowRight, ArrowLeft } from 'lucide-react';

// Esquema para a primeira etapa (dados pessoais e profissionais)
const etapa1Schema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  nomeCompleto: z.string().min(3, { message: 'Nome completo é obrigatório' }),
  crm: z.string().min(1, { message: 'CRM é obrigatório' }),
  estadoCrm: z.string().min(2, { message: 'Estado do CRM é obrigatório' }),
  especialidades: z.string().optional(),
  bio: z.string().optional(),
  telefone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Esquema para a segunda etapa (endereço e localização)
const etapa2Schema = z.object({
  cep: z.string().min(8, { message: 'CEP é obrigatório' }),
  cidade: z.string().min(1, { message: 'Cidade é obrigatória' }),
  estado: z.string().min(2, { message: 'Estado é obrigatório' }),
  tipoAtendimento: z.enum(['clinica', 'domicilio', 'ambos']),
  valorMinimo: z.string().optional(),
});

// União dos esquemas para o formulário completo
const formSchema = z.object({
  ...etapa1Schema.shape,
  ...etapa2Schema.shape
});

// Tipo para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

const RegistroVeterinarioPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Configuração do formulário com validação Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(
      currentStep === 1 ? etapa1Schema : currentStep === 2 ? etapa2Schema : formSchema
    ),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nomeCompleto: '',
      crm: '',
      estadoCrm: '',
      especialidades: '',
      bio: '',
      telefone: '',
      cep: '',
      cidade: '',
      estado: '',
      tipoAtendimento: 'clinica',
      valorMinimo: '0',
    },
    mode: 'onChange'
  });
  
  // Função para avançar para a próxima etapa
  const handleNext = async () => {
    const isValid = await form.trigger(
      Object.keys(currentStep === 1 ? etapa1Schema.shape : {}) as any
    );
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Função para voltar para a etapa anterior
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Função para processar o envio do formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // 1. Criação da conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.nomeCompleto,
            role: 'veterinario',
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Erro ao criar conta de usuário');
      }
      
      // 2. Criação do registro na tabela veterinarios
      const especialidadesArray = values.especialidades
        ? values.especialidades.split(',').map(esp => esp.trim())
        : [];
      
      const { error: profileError } = await supabase
        .from('veterinarios')
        .insert({
          user_id: authData.user.id,
          nome_completo: values.nomeCompleto,
          email: values.email,
          crm: values.crm,
          estado_crm: values.estadoCrm,
          especialidades: especialidadesArray,
          bio: values.bio || null,
          telefone: values.telefone || null,
          cep: values.cep,
          cidade: values.cidade,
          estado: values.estado,
          tipo_atendimento: values.tipoAtendimento,
          valor_minimo: values.valorMinimo ? parseFloat(values.valorMinimo) : 0,
          status_aprovacao: 'pendente'
        });
      
      if (profileError) throw profileError;
      
      // Exibir mensagem de sucesso
      toast("Cadastro realizado com sucesso", {
        description: "Seu perfil foi enviado para análise. Acesse com seu e-mail e senha."
      });
      
      // Redirecionar para a página de login
      navigate('/auth', { state: { successMessage: 'Cadastro realizado! Faça login para continuar.' } });
      
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast("Erro no cadastro", {
        description: error.message || 'Ocorreu um erro ao criar sua conta.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Renderização das etapas do formulário
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail*</FormLabel>
                  <FormControl>
                    <Input placeholder="seu.email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha*</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha*</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            <h3 className="text-lg font-medium">Dados Profissionais</h3>
            
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo*</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Nome Sobrenome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CRM*</FormLabel>
                    <FormControl>
                      <Input placeholder="Número do CRM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estadoCrm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado do CRM*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="especialidades"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidades</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Clínica Geral, Dermatologia, Ortopedia" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Separe as especialidades por vírgulas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte sobre sua experiência profissional" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Localização e Atendimento</h3>
            
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP*</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade*</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tipoAtendimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Atendimento*</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <Button
                      type="button"
                      variant={field.value === 'clinica' ? 'default' : 'outline'}
                      onClick={() => form.setValue('tipoAtendimento', 'clinica')}
                      className={field.value === 'clinica' ? 'bg-[#C52339] hover:bg-[#C52339]/90' : ''}
                    >
                      {field.value === 'clinica' && <CheckIcon className="mr-2 h-4 w-4" />}
                      Em Clínica
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'domicilio' ? 'default' : 'outline'}
                      onClick={() => form.setValue('tipoAtendimento', 'domicilio')}
                      className={field.value === 'domicilio' ? 'bg-[#C52339] hover:bg-[#C52339]/90' : ''}
                    >
                      {field.value === 'domicilio' && <CheckIcon className="mr-2 h-4 w-4" />}
                      A Domicílio
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'ambos' ? 'default' : 'outline'}
                      onClick={() => form.setValue('tipoAtendimento', 'ambos')}
                      className={field.value === 'ambos' ? 'bg-[#C52339] hover:bg-[#C52339]/90' : ''}
                    >
                      {field.value === 'ambos' && <CheckIcon className="mr-2 h-4 w-4" />}
                      Ambos
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="valorMinimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Mínimo da Consulta (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Revise seus dados</h3>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <h4 className="font-medium mb-2">Dados da Conta</h4>
              <p><strong>E-mail:</strong> {form.getValues('email')}</p>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <h4 className="font-medium mb-2">Dados Profissionais</h4>
              <p><strong>Nome:</strong> {form.getValues('nomeCompleto')}</p>
              <p><strong>CRM:</strong> {form.getValues('crm')} / {form.getValues('estadoCrm')}</p>
              {form.getValues('especialidades') && (
                <p><strong>Especialidades:</strong> {form.getValues('especialidades')}</p>
              )}
              {form.getValues('telefone') && (
                <p><strong>Telefone:</strong> {form.getValues('telefone')}</p>
              )}
              {form.getValues('bio') && (
                <div>
                  <strong>Biografia:</strong>
                  <p className="mt-1">{form.getValues('bio')}</p>
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <h4 className="font-medium mb-2">Localização e Atendimento</h4>
              <p><strong>CEP:</strong> {form.getValues('cep')}</p>
              <p><strong>Cidade/Estado:</strong> {form.getValues('cidade')}/{form.getValues('estado')}</p>
              <p>
                <strong>Tipo de Atendimento:</strong> {
                  form.getValues('tipoAtendimento') === 'clinica' ? 'Em Clínica' :
                  form.getValues('tipoAtendimento') === 'domicilio' ? 'A Domicílio' : 'Ambos'
                }
              </p>
              <p><strong>Valor Mínimo:</strong> R$ {form.getValues('valorMinimo') || '0,00'}</p>
            </div>
            
            <div className="bg-[#C52339]/10 p-4 rounded-md border border-[#C52339]/20">
              <p className="text-sm">
                Ao enviar, você confirma que todas as informações acima são verdadeiras e que possui registro 
                profissional válido. Seu perfil passará por uma verificação antes de ser aprovado na plataforma.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Renderização da barra de progresso
  const renderProgressBar = () => {
    return (
      <div className="flex items-center mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#C52339] h-2.5 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <span className="ml-4 text-sm font-medium">
          {currentStep}/3
        </span>
      </div>
    );
  };
  
  // Renderização dos botões de navegação
  const renderNavigationButtons = () => {
    return (
      <div className="flex justify-between space-x-2">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/escolher-perfil')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="bg-[#C52339] hover:bg-[#C52339]/80"
          >
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#C52339] hover:bg-[#C52339]/80"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-center p-4">
        <a href="/">
          <div className="icon-container">
            <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_icon.png" alt="HubbPet" />
          </div>
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <Card className="border-[#C52339]/20">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="logo-container">
                  <img 
                    src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo_ESCURO.png" 
                    alt="HubbPet" 
                    className="h-10 object-contain" 
                  />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Cadastro de Veterinário</CardTitle>
              <CardDescription className="text-center">
                Complete seu perfil profissional para começar a atender no HubbPet
              </CardDescription>
              {renderProgressBar()}
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
                  {renderStepContent()}
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  {renderNavigationButtons()}
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegistroVeterinarioPage;
