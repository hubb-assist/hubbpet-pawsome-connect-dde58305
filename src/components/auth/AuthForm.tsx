import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [emailForResend, setEmailForResend] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setNeedsEmailConfirmation(false);
    
    try {
      console.log("Tentando fazer login com:", data.email);
      await signIn(data.email, data.password);
      console.log("Login bem-sucedido");
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      if (error.message && (error.message.includes("Email not confirmed") || error.message.includes("confirmation"))) {
        setNeedsEmailConfirmation(true);
        setEmailForResend(data.email);
        setError("É necessário confirmar seu e-mail antes de fazer login. Verifique sua caixa de entrada.");
      } else if (error.message && error.message.includes("Invalid login")) {
        setError("Email ou senha incorretos. Por favor, tente novamente.");
      } else if (error.message && error.message.includes("rate limit")) {
        setError("Muitas tentativas de login. Por favor, tente novamente mais tarde.");
      } else {
        setError(error.message || "Erro ao fazer login. Por favor, tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Tentando registrar com:", data.email);
      // Sempre registramos como "tutor" já que removemos a opção de seleção
      await signUp(data.email, data.password, data.name, "tutor");
      
      // Após registro bem-sucedido, tenta criar o perfil do tutor
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        const userEmail = session?.user?.email;
        
        if (userId && userEmail) {
          console.log("Criando perfil de tutor para:", userId);
          const { error: tutorError } = await supabase.from('tutores').insert({
            user_id: userId,
            nome: data.name,
            email: userEmail
          });
          
          if (tutorError) {
            console.error("Erro ao criar perfil de tutor:", tutorError);
          }
        }
      } catch (profileError) {
        console.error("Erro ao configurar perfil:", profileError);
        // Não bloqueia o fluxo se falhar aqui, pois o perfil pode ser criado depois
      }
      
      setAuthMode("login");
      setNeedsEmailConfirmation(true);
      setEmailForResend(data.email);
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada para ativar sua conta.",
      });
      
      registerForm.reset();
    } catch (error: any) {
      console.error("Erro no registro:", error);
      
      if (error.message && error.message.includes("already registered")) {
        setError("Este e-mail já está registrado. Por favor, faça login ou use outro e-mail.");
      } else {
        setError(error.message || "Erro ao fazer cadastro. Por favor, tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!emailForResend) return;
    
    setIsResending(true);
    
    try {
      console.log("Reenviando e-mail para:", emailForResend);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForResend,
      });
      
      if (error) throw error;
      
      toast({
        title: "E-mail enviado",
        description: "Um novo e-mail de confirmação foi enviado. Por favor, verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      console.error("Erro ao reenviar e-mail:", error);
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message || "Ocorreu um erro ao enviar o e-mail de confirmação.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-[#2D113F]/20">
      <CardHeader>
        <div className="flex justify-center items-center mb-6">
          <div className="logo-container text-center">
            <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo_ESCURO.png" alt="HubbPet" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-[#2D113F]">
          {authMode === "login" ? "Login" : "Cadastro"}
        </CardTitle>
        <CardDescription className="text-center">
          {authMode === "login" 
            ? "Acesse sua conta no HubbPet" 
            : "Crie sua conta como tutor de pet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {needsEmailConfirmation && (
          <Alert className="mb-4" variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Confirmação de E-mail Necessária</AlertTitle>
            <AlertDescription className="mt-2">
              Você precisa confirmar seu e-mail antes de fazer login. Verifique sua caixa de entrada (e pasta de spam).
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                >
                  {isResending ? "Enviando..." : "Reenviar e-mail de confirmação"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} autoComplete="current-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[#2D113F] hover:bg-[#2D113F]/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
                
                <div className="text-center">
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">ou</span>
                    </div>
                  </div>
                  <Link to="/">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full"
                    >
                      Voltar
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} autoComplete="name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[#2D113F] hover:bg-[#2D113F]/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        {authMode === "login" 
          ? "Ainda não tem conta? Clique em Cadastro" 
          : "Já tem conta? Clique em Login"}
      </CardFooter>
    </Card>
  );
}
