import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Link } from 'react-router-dom';

const formSchema = z.object({
  nome: z.string().min(2, {
    message: "Nome precisa ter ao menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  password: z.string().min(6, {
    message: "Senha precisa ter ao menos 6 caracteres.",
  }),
})

type FormData = z.infer<typeof formSchema>

interface AuthFormProps {
  isRegister?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: FormData) => {
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.nome
            }
          }
        });
        
        if (error) throw error;
        
        if (data.session) {
          // Corrigido para verificar a sessão em vez de user
          const user = data.session?.user;
          
          if (user) {
            // Se criou conta com sucesso, redirecionar para página de escolha de perfil
            navigate('/escolher-perfil');
          } else {
            toast("Confira seu e-mail", {
              description: "Enviamos um link de verificação para seu e-mail."
            });
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          console.error('Erro ao fazer login:', error);
          setError('Falha ao fazer login. Verifique seu email e senha.');
          return;
        }

        // Autenticação bem-sucedida
        signIn(values.email);
        navigate('/meus-pets');
      }
    } catch (error: any) {
      console.error(isRegister ? 'Erro ao registrar:' : 'Erro ao fazer login:', error.message);
      setError(error.message || 'Ocorreu um erro. Tente novamente.');
      toast("Ocorreu um erro", {
        description: "Não foi possível realizar a ação. Tente novamente mais tarde."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          {isRegister ? "Crie sua conta" : "Entre na sua conta"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {isRegister
            ? "Vamos começar a cuidar do seu pet!"
            : "Bem-vindo de volta!"}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {isRegister && (
            <FormField
              control={form.control}
              name="nome"
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seuemail@aumigo.com" {...field} />
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
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              isRegister ? "Criar conta" : "Entrar"
            )}
          </Button>
        </form>
      </Form>
      <div className="text-sm text-gray-600 text-center">
        {isRegister ? (
          <>
            Já tem uma conta?{" "}
            <Link to="/login" className="text-hubbpet-primary">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Não tem uma conta?{" "}
            <Link to="/register" className="text-hubbpet-primary">
              Criar conta
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
