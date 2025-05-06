import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Upload, User, ArrowRight, ArrowLeft } from 'lucide-react';

// Schema para etapa 1
const step1Schema = z.object({
  nome_completo: z.string().min(2, 'Nome completo é obrigatório'),
  crm: z.string().min(3, 'CRM é obrigatório'),
  estado_crm: z.string().length(2, 'UF deve ter 2 caracteres'),
  tipo_atendimento: z.enum(['clinica', 'domicilio', 'ambos']),
  especialidades: z.array(z.string()).min(1, 'Selecione pelo menos uma especialidade'),
  foto_perfil: z.string().optional(),
});

// Schema para etapa 2
const step2Schema = z.object({
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'UF deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
});

// Schema para etapa 3
const step3Schema = z.object({
  confirma: z.boolean().refine(val => val === true, {
    message: 'Você precisa confirmar os dados para continuar',
  }),
});

// Lista de especialidades disponíveis
const especialidadesDisponiveis = [
  { id: 'clinica_geral', label: 'Clínica Geral' },
  { id: 'ortopedia', label: 'Ortopedia' },
  { id: 'dermatologia', label: 'Dermatologia' },
  { id: 'cardiologia', label: 'Cardiologia' },
  { id: 'odontologia', label: 'Odontologia' },
  { id: 'vacinacao', label: 'Vacinação' },
  { id: 'cirurgia', label: 'Cirurgia' },
  { id: 'oncologia', label: 'Oncologia' },
  { id: 'comportamento', label: 'Comportamento Animal' },
  { id: 'nutricao', label: 'Nutrição' },
  { id: 'exoticos', label: 'Animais Exóticos' },
];

interface VeterinarioProfileFormProps {
  onSubmit?: (data: any) => Promise<void>;
}

const VeterinarioProfileForm: React.FC<VeterinarioProfileFormProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    nome_completo: '',
    crm: '',
    estado_crm: '',
    tipo_atendimento: 'clinica',
    especialidades: [],
    foto_perfil: '',
    cidade: '',
    estado: '',
    cep: '',
    confirma: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<boolean>(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Formulários para cada etapa
  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nome_completo: profileData.nome_completo || '',
      crm: profileData.crm || '',
      estado_crm: profileData.estado_crm || '',
      tipo_atendimento: profileData.tipo_atendimento || 'clinica',
      especialidades: profileData.especialidades || [],
      foto_perfil: profileData.foto_perfil || '',
    },
  });

  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      cidade: profileData.cidade || '',
      estado: profileData.estado || '',
      cep: profileData.cep || '',
    },
  });

  const step3Form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      confirma: false,
    },
  });

  // Buscar dados existentes do veterinário
  useEffect(() => {
    if (user) {
      fetchVeterinarioProfile();
    }
  }, [user]);

  const fetchVeterinarioProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('veterinarios')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          nome_completo: data.nome_completo || '',
          crm: data.crm || '',
          estado_crm: data.estado_crm || '',
          tipo_atendimento: data.tipo_atendimento || 'clinica',
          especialidades: data.especialidades || [],
          foto_perfil: data.foto_perfil || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
        });
        
        if (data.foto_perfil) {
          setImagePreview(data.foto_perfil);
        }
        
        step1Form.reset({
          nome_completo: data.nome_completo || '',
          crm: data.crm || '',
          estado_crm: data.estado_crm || '',
          tipo_atendimento: data.tipo_atendimento || 'clinica',
          especialidades: data.especialidades || [],
          foto_perfil: data.foto_perfil || '',
        });
        
        step2Form.reset({
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
        });
        
        setExistingProfile(true);
      } else {
        // Se não existe perfil, tentar preencher nome do usuário através dos dados de autenticação
        if (user?.user_metadata?.name) {
          step1Form.setValue('nome_completo', user.user_metadata.name);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados de perfil.",
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar CEP
  const formatCEP = (cep: string) => {
    cep = cep.replace(/\D/g, '');
    if (cep.length > 5) {
      cep = cep.slice(0, 5) + '-' + cep.slice(5, 8);
    }
    return cep;
  };

  // Função para buscar CEP
  const buscarCEP = async (cep: string) => {
    if (cep.length < 8) return;
    
    cep = cep.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        step2Form.setValue('cidade', data.localidade);
        step2Form.setValue('estado', data.uf);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Handler para upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O tamanho máximo da imagem é 5MB',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload para o Supabase Storage (exemplo - ajustar conforme necessário)
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      // TODO: Implementar upload para Supabase Storage quando disponível
      // Por enquanto, simulamos o upload com o preview
      step1Form.setValue('foto_perfil', fileName);
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Falha no upload da imagem',
        variant: 'destructive'
      });
    }
  };

  // Função para avançar para próxima etapa
  const nextStep = async (formData: any) => {
    if (step === 1) {
      setProfileData({ ...profileData, ...formData });
      setStep(2);
    } else if (step === 2) {
      setProfileData({ 
        ...profileData, 
        ...formData
      });
      setStep(3);
    }
  };

  // Função para voltar para etapa anterior
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Função para salvar perfil
  const saveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Prepara os dados para salvar
      const saveData = {
        user_id: user?.id,
        nome_completo: profileData.nome_completo,
        crm: profileData.crm,
        estado_crm: profileData.estado_crm,
        tipo_atendimento: profileData.tipo_atendimento,
        especialidades: profileData.especialidades,
        foto_perfil: profileData.foto_perfil || null,
        cidade: profileData.cidade,
        estado: profileData.estado,
        cep: profileData.cep.replace(/\D/g, ''),
        status_aprovacao: 'pendente' as 'pendente', // Corrigindo o tipo explicitamente
        email: user?.email,
      };

      // Decidir se deve criar novo ou atualizar
      let result;
      if (existingProfile) {
        result = await supabase
          .from('veterinarios')
          .update(saveData)
          .eq('user_id', user?.id);
      } else {
        result = await supabase
          .from('veterinarios')
          .insert([saveData]);
      }

      if (result.error) throw result.error;
      
      // Após salvar com sucesso, chamar o callback onSubmit se existir
      if (onSubmit) {
        await onSubmit(saveData);
      } else {
        toast({
          title: 'Perfil salvo',
          description: 'Seu perfil foi enviado para análise e será aprovado em breve.',
        });
      }
      
      // Atualizar o estado para refletir que agora existe um perfil
      setExistingProfile(true);
      
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar seu perfil.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização da etapa atual
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Form {...step1Form}>
            <form onSubmit={step1Form.handleSubmit(nextStep)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={step1Form.control}
                  name="nome_completo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={step1Form.control}
                    name="crm"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>CRMV</FormLabel>
                        <FormControl>
                          <Input placeholder="Número do CRMV" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={step1Form.control}
                    name="estado_crm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF CRMV</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={step1Form.control}
                  name="tipo_atendimento"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Atendimento</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="clinica" id="clinica" />
                            <label htmlFor="clinica" className="text-sm font-medium">
                              Clínica
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="domicilio" id="domicilio" />
                            <label htmlFor="domicilio" className="text-sm font-medium">
                              Domicílio
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ambos" id="ambos" />
                            <label htmlFor="ambos" className="text-sm font-medium">
                              Ambos
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={step1Form.control}
                  name="especialidades"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Especialidades</FormLabel>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {especialidadesDisponiveis.map((especialidade) => (
                          <FormField
                            key={especialidade.id}
                            control={step1Form.control}
                            name="especialidades"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={especialidade.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(especialidade.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, especialidade.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== especialidade.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {especialidade.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={step1Form.control}
                  name="foto_perfil"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Foto de Perfil</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center space-y-4">
                          {imagePreview ? (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden">
                              <img 
                                src={imagePreview} 
                                alt="Foto de perfil" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          <div className="flex items-center">
                            <label 
                              htmlFor="foto-upload" 
                              className="cursor-pointer bg-[#2D113F] text-white px-4 py-2 rounded-md hover:bg-[#2D113F]/80 flex items-center gap-2"
                            >
                              <Upload size={18} />
                              Escolher foto
                            </label>
                            <input
                              id="foto-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(e);
                              }}
                              {...fieldProps}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#2D113F] hover:bg-[#2D113F]/80 flex items-center gap-2"
                >
                  Próxima Etapa 
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );
        
      case 2:
        return (
          <Form {...step2Form}>
            <form onSubmit={step2Form.handleSubmit(nextStep)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={step2Form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="00000-000" 
                            {...field} 
                            value={formatCEP(field.value)}
                            onChange={(e) => {
                              const formattedCEP = formatCEP(e.target.value);
                              field.onChange(formattedCEP);
                              if (formattedCEP.replace(/\D/g, '').length === 8) {
                                buscarCEP(formattedCEP);
                              }
                            }}
                            maxLength={9}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={step2Form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={step2Form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado (UF)</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#2D113F] hover:bg-[#2D113F]/80 flex items-center gap-2"
                >
                  Pré-visualização
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );
        
      case 3:
        return (
          <Form {...step3Form}>
            <form onSubmit={step3Form.handleSubmit(saveProfile)} className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-6 bg-white">
                  <h3 className="text-xl font-semibold mb-4">Pré-visualização do Perfil</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <div className="w-32 h-32 rounded-full overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Foto de perfil" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold">{profileData.nome_completo}</h2>
                        <p className="text-sm text-gray-500">CRMV {profileData.crm} - {profileData.estado_crm}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Especialidades</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profileData.especialidades.map((esp: string) => (
                            <span 
                              key={esp} 
                              className="bg-[#2D113F]/10 text-[#2D113F] text-xs px-2 py-1 rounded"
                            >
                              {especialidadesDisponiveis.find(e => e.id === esp)?.label || esp}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Tipo de Atendimento</h4>
                        <p className="text-sm">
                          {profileData.tipo_atendimento === 'clinica' ? 'Clínica' : 
                           profileData.tipo_atendimento === 'domicilio' ? 'Domicílio' : 
                           'Clínica e Domicílio'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Localização</h4>
                        <p className="text-sm">{profileData.cidade} - {profileData.estado}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={step3Form.control}
                  name="confirma"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Confirmo que os dados informados são verdadeiros e estou ciente que meu perfil será analisado antes de ser publicado no HubbPet.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Editar dados
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !step3Form.getValues().confirma}
                  className="bg-[#2D113F] hover:bg-[#2D113F]/80 flex items-center gap-2"
                >
                  {isLoading ? 'Salvando...' : existingProfile ? 'Atualizar Cadastro' : 'Finalizar Cadastro'}
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="logo-container">
            <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo_ESCURO.png" alt="HubbPet" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#2D113F]">Cadastro de Perfil Veterinário</h1>
        <p className="text-muted-foreground">
          {existingProfile 
            ? 'Atualize suas informações profissionais para melhorar sua visibilidade' 
            : 'Complete seu perfil profissional para começar a atender no HubbPet'}
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`flex-1 border-t-2 ${step >= 1 ? 'border-[#2D113F]' : 'border-gray-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-[#2D113F] text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-[#2D113F]' : 'border-gray-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-[#2D113F] text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-[#2D113F]' : 'border-gray-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-[#2D113F] text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
          <div className={`flex-1 border-t-2 ${step > 3 ? 'border-[#2D113F]' : 'border-gray-200'}`} />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <div className="text-center flex-1">
            <span className={`${step === 1 ? 'font-medium text-[#2D113F]' : 'text-gray-500'}`}>
              Informações Profissionais
            </span>
          </div>
          <div className="text-center flex-1">
            <span className={`${step === 2 ? 'font-medium text-[#2D113F]' : 'text-gray-500'}`}>
              Localização
            </span>
          </div>
          <div className="text-center flex-1">
            <span className={`${step === 3 ? 'font-medium text-[#2D113F]' : 'text-gray-500'}`}>
              Revisão e Envio
            </span>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {isLoading && step === 1 ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
            </div>
          ) : (
            renderStep()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VeterinarioProfileForm;
