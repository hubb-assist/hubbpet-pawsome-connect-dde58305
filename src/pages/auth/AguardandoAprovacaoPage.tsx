
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, Home } from 'lucide-react';

const AguardandoAprovacaoPage: React.FC = () => {
  const navigate = useNavigate();
  
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
        <div className="w-full max-w-md">
          <Card className="border-[#2D113F]/20">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="logo-container">
                  <img 
                    src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo_ESCURO.png" 
                    alt="HubbPet" 
                    className="h-12 object-contain" 
                  />
                </div>
              </div>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-[#2D113F]/10 rounded-full flex items-center justify-center">
                  <Clock size={40} className="text-[#2D113F]" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center text-[#2D113F]">
                Cadastro em Análise
              </CardTitle>
              <CardDescription className="text-center text-base">
                Seu cadastro foi enviado com sucesso e está em análise pela nossa equipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-gray-500">
                Em breve você receberá um e-mail com a aprovação da equipe do HubbPet.
                Assim que seu cadastro for aprovado, você poderá começar a atender pacientes na plataforma.
              </p>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm">Dados pessoais verificados</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-amber-600">
                  <Clock size={16} />
                  <span className="text-sm">Validação CRMV em andamento</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-4">
              <Button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-[#2D113F] hover:bg-[#2D113F]/80"
              >
                <Home size={16} />
                Voltar para a Página Inicial
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AguardandoAprovacaoPage;
