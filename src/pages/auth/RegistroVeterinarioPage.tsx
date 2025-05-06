
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
import { CheckIcon, ArrowRight, ArrowLeft, FileUp, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Função para validar CPF
function validarCPF(cpf: string) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se possui 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação do dígito verificador
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

// Esquema para a primeira etapa (dados pessoais e profissionais)
const etapa1Schema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  nomeCompleto: z.string().min(3, { message: 'Nome completo é obrigatório' }),
  crm: z.string().min(1, { message: 'CRM é obrigatório' }),
  estadoCrm: z.string().min(2, { message: 'Estado do CRM é obrigatório' }),
  cpf: z.string()
    .min(11, { message: 'CPF é obrigatório' })
    .refine((cpf) => validarCPF(cpf), { message: 'CPF inválido' }),
  rg: z.string().optional(),
  especialidades: z.string().optional(),
  bio: z.string().optional(),
  telefone: z.string()
    .min(10, { message: 'Telefone é obrigatório' })
    .refine((tel) => /^\(\d{2}\) \d{5}-\d{4}$/.test(tel) || /^\d{10,11}$/.test(tel), {
      message: 'Telefone inválido'
    }),
  crmvDocument: z
    .instanceof(FileList)
    .refine((files) => {
      return !files.length || (files.length > 0 && files[0].size <= 5 * 1024 * 1024);
    }, 'O arquivo deve ter no máximo 5MB')
    .refine((files) => {
      if (!files.length) return true;
      const file = files[0];
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      return validTypes.includes(file.type);
    }, 'Formato permitido: JPG, PNG ou PDF')
    .optional()
    .or(z.literal('')),
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
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  nomeCompleto: z.string().min(3, { message: 'Nome completo é obrigatório' }),
  crm: z.string().min(1, { message: 'CRM é obrigatório' }),
  estadoCrm: z.string().min(2, { message: 'Estado do CRM é obrigatório' }),
  cpf: z.string()
    .min(11, { message: 'CPF é obrigatório' })
    .refine((cpf) => validarCPF(cpf), { message: 'CPF inválido' }),
  rg: z.string().optional(),
  especialidades: z.string().optional(),
  bio: z.string().optional(),
  telefone: z.string()
    .min(10, { message: 'Telefone é obrigatório' })
    .refine((tel) => /^\(\d{2}\) \d{5}-\d{4}$/.test(tel) || /^\d{10,11}$/.test(tel), {
      message: 'Telefone inválido'
    }),
  crmvDocument: z
    .instanceof(FileList)
    .optional()
    .or(z.literal('')),
  cep: z.string().min(8, { message: 'CEP é obrigatório' }),
  cidade: z.string().min(1, { message: 'Cidade é obrigatória' }),
  estado: z.string().min(2, { message: 'Estado é obrigatório' }),
  tipoAtendimento: z.enum(['clinica', 'domicilio', 'ambos']),
  valorMinimo: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Tipo para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

const RegistroVeterinarioPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [crmvFile, setCrmvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
      cpf: '',
      rg: '',
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
  
  // Função para aplicar máscara de CPF
  const aplicarMascaraCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '').slice(0, 11);
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };
  
  // Função para aplicar máscara de RG
  const aplicarMascaraRG = (rg: string) => {
    rg = rg.replace(/[^\dxX]/g, '').slice(0, 9);
    if (rg.length <= 2) return rg;
    if (rg.length <= 5) return `${rg.slice(0, 2)}.${rg.slice(2)}`;
    if (rg.length <= 8) return `${rg.slice(0, 2)}.${rg.slice(2, 5)}.${rg.slice(5)}`;
    return `${rg.slice(0, 2)}.${rg.slice(2, 5)}.${rg.slice(5, 8)}-${rg.slice(8)}`;
  };
  
  // Função para aplicar máscara de telefone
  const aplicarMascaraTelefone = (telefone: string) => {
    telefone = telefone.replace(/\D/g, '').slice(0, 11);
    if (telefone.length <= 2) return telefone;
    if (telefone.length <= 7) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
  };
  
  // Função para aplicar máscara de CEP
  const aplicarMascaraCEP = (cep: string) => {
    cep = cep.replace(/\D/g, '').slice(0, 8);
    if (cep.length <= 5) return cep;
    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  };
  
  // Função para buscar CEP
  const buscarCEP = async (cep: string) => {
    cep = cep.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    setBuscandoCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        form.setValue('cidade', data.localidade, { shouldValidate: true });
        form.setValue('estado', data.uf, { shouldValidate: true });
      } else {
        toast("CEP não encontrado", {
          description: "Verifique o CEP informado ou preencha os campos manualmente.",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast("Erro ao buscar CEP", {
        description: "Não foi possível consultar o CEP. Preencha os campos manualmente.",
        variant: "destructive"
      });
    } finally {
      setBuscandoCep(false);
    }
  };
  
  // Função para avançar para a próxima etapa
  const handleNext = async () => {
    if (currentStep === 1) {
      // Validar apenas os campos da primeira etapa
      const result = await form.trigger([
        'email', 'password', 'confirmPassword', 'nomeCompleto', 
        'crm', 'estadoCrm', 'cpf', 'rg', 'especialidades', 'bio', 'telefone'
      ], { shouldFocus: true });
      
      if (result) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 2) {
      // Validar apenas os campos da segunda etapa
      const result = await form.trigger([
        'cep', 'cidade', 'estado', 'tipoAtendimento', 'valorMinimo'
      ], { shouldFocus: true });
      
      if (result) {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  // Função para voltar para a etapa anterior
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Função para fazer upload do documento CRMV
  const uploadCRMVDocument = async (file: File) => {
    if (!file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `crmvs/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('crmvs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          },
        });
      
      if (uploadError) throw uploadError;
      
      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage.from('crmvs').getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw new Error('Falha ao fazer upload do documento CRMV');
    }
  };
  
  // Função para processar o envio do formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let crmv_document_url = null;
      
      // Upload do CRMV document (se existir)
      if (crmvFile) {
        crmv_document_url = await uploadCRMVDocument(crmvFile);
      }
      
      // Remover máscaras dos campos antes de enviar
      const cpfSemMascara = values.cpf.replace(/\D/g, '');
      const telefoneSemMascara = values.telefone.replace(/\D/g, '');
      const cepSemMascara = values.cep.replace(/\D/g, '');
      
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
          cpf: values.cpf, // Mantemos a máscara para exibição
          rg: values.rg, // Mantemos a máscara para exibição
          especialidades: especialidadesArray,
          bio: values.bio || null,
          telefone: telefoneSemMascara,
          cep: cepSemMascara,
          cidade: values.cidade,
          estado: values.estado,
          tipo_atendimento: values.tipoAtendimento,
          valor_minimo: values.valorMinimo ? parseFloat(values.valorMinimo) : 0,
          status_aprovacao: 'pendente',
          crmv_document_url: crmv_document_url
        });
      
      if (profileError) throw profileError;
      
      // Exibir mensagem de sucesso
      toast("✅ Cadastro realizado com sucesso", {
        description: "Seu cadastro foi enviado com sucesso e está em análise. Em breve você receberá um e-mail com a aprovação da equipe do HubbPet."
      });
      
      // Redirecionar para a página de login
      navigate('/auth', { state: { successMessage: 'Cadastro realizado! Faça login para continuar.' } });
      
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast("Erro no cadastro", {
        description: error.message || 'Ocorreu um erro ao criar sua conta.',
        variant: "destructive"
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
                    <Input placeholder="seu.email@exemplo.com" type="email" {...field} />
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
            <h3 className="text-lg font-medium">Dados Pessoais e Profissionais</h3>
            
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo*</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Nome Sobrenome" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field: { onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>CPF*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...fieldProps}
                        onChange={(e) => {
                          const maskedValue = aplicarMascaraCPF(e.target.value);
                          onChange(maskedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rg"
                render={({ field: { onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000-0"
                        {...fieldProps}
                        onChange={(e) => {
                          const maskedValue = aplicarMascaraRG(e.target.value);
                          onChange(maskedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CRMV*</FormLabel>
                    <FormControl>
                      <Input placeholder="Número do CRMV" {...field} />
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
                    <FormLabel>Estado do CRMV*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SP" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="crmvDocument"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Documento CRMV (JPG, PNG ou PDF, máx 5MB)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        {...fieldProps}
                        onChange={(e) => {
                          onChange(e.target.files);
                          if (e.target.files && e.target.files[0]) {
                            setCrmvFile(e.target.files[0]);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('crmvDocumentInput')?.click()}
                      >
                        <FileUp size={18} />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {crmvFile && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Arquivo selecionado: {crmvFile.name}
                    </div>
                  )}
                </FormItem>
              )}
            />
            
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
              render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Telefone*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...fieldProps} 
                      onChange={(e) => {
                        const maskedValue = aplicarMascaraTelefone(e.target.value);
                        onChange(maskedValue);
                      }}
                    />
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
              render={({ field: { onChange, onBlur, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>CEP*</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2 relative">
                      <Input 
                        placeholder="00000-000" 
                        {...fieldProps} 
                        onChange={(e) => {
                          const maskedValue = aplicarMascaraCEP(e.target.value);
                          onChange(maskedValue);
                        }}
                        onBlur={(e) => {
                          onBlur();
                          const cep = e.target.value.replace(/\D/g, '');
                          if (cep.length === 8) {
                            buscarCEP(cep);
                          }
                        }}
                      />
                      {buscandoCep && (
                        <div className="absolute right-3">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {buscandoCep && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Buscando endereço...
                    </div>
                  )}
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
                      <Input placeholder="Ex: SP" maxLength={2} {...field} />
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
              <h4 className="font-medium mb-2">Dados Pessoais e Profissionais</h4>
              <p><strong>Nome:</strong> {form.getValues('nomeCompleto')}</p>
              <p><strong>CPF:</strong> {form.getValues('cpf')}</p>
              {form.getValues('rg') && (
                <p><strong>RG:</strong> {form.getValues('rg')}</p>
              )}
              <p><strong>CRMV:</strong> {form.getValues('crm')} / {form.getValues('estadoCrm')}</p>
              {crmvFile && (
                <p><strong>Documento CRMV:</strong> {crmvFile.name}</p>
              )}
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
  
  // Efeito para criar o bucket storage se não existir
  React.useEffect(() => {
    const createStorageBucketIfNeeded = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(b => b.name === 'crmvs')) {
          // O bucket não existe, mas não podemos criá-lo diretamente do frontend
          console.log('O bucket "crmvs" não existe. É necessário criá-lo no console do Supabase.');
        }
      } catch (error) {
        console.error('Erro ao verificar buckets:', error);
      }
    };
    
    createStorageBucketIfNeeded();
  }, []);
  
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
