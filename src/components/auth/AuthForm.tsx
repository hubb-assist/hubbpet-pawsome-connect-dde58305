
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const authFormSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).optional(),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(values.email, values.password);
      } else {
        await signUp(values.email, values.password, values.name || '', 'tutor');

        // Após o cadastro, precisamos verificar se o usuário foi criado e inserir na tabela tutores
        try {
          // Precisamos buscar a sessão atual após o cadastro
          const { data: sessionData } = await supabase.auth.getSession();
          
          // Agora precisamos verificar se o usuário já existe na tabela tutores
          if (sessionData?.session?.user?.id) {
            const userId = sessionData.session.user.id;
            const userEmail = sessionData.session.user.email;
            
            // Verificar se o tutor já existe
            const { data: tutorExists } = await supabase
              .from('tutores')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
            
            // Se o tutor não existir, criar um novo registro
            if (!tutorExists && userId && userEmail) {
              await supabase.from('tutores').insert({
                user_id: userId,
                nome: values.name || 'Novo Tutor',
                email: userEmail
              });
              
              console.log('Tutor criado com sucesso:', userId);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar/criar perfil de tutor:', error);
        }
      }
      
    } catch (error) {
      console.error('Erro durante autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Login' : 'Cadastro'}</CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Entre com sua conta para continuar.' 
            : 'Crie uma nova conta para começar.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'signup' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? 'Processando...' 
                : mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {mode === 'login' ? (
          <p className="text-sm text-center">
            Não tem uma conta?{' '}
            <Button variant="link" className="p-0" onClick={() => navigate('/auth?mode=signup')}>
              Cadastre-se
            </Button>
          </p>
        ) : (
          <p className="text-sm text-center">
            Já tem uma conta?{' '}
            <Button variant="link" className="p-0" onClick={() => navigate('/auth?mode=login')}>
              Faça login
            </Button>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
