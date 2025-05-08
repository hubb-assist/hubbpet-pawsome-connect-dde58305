import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, User } from 'lucide-react';
const LandingPage = () => {
  return <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-hubbpet-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="logo-container mb-6">
                <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png" alt="HubbPet" />
              </div>
              <h1 className="text-4xl font-bold mb-6 font-['Poppins'] md:text-4xl my-[32px] py-[16px] px-[3px] mx-0">
                CONECTANDO TUTORES E VETERINÁRIOS EM POUCOS CLIQUES
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-hubbpet-auxiliary hover:bg-hubbpet-auxiliary/80 font-['Poppins'] uppercase bg-[E72A4A] text-pink-700 bg-white font-semibold">
                    Encontre um veterinário
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="border-white hover:text-hubbpet-primary font-['Poppins'] uppercase bg-[#dd6b20] text-sm font-medium text-white">
                    É um veterinário? Cadastre-se
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center relative">
              <img alt="Cachorro fofo" style={{
              height: '350px'
            }} className="rounded-lg w-full max-w-md shadow-lg z-10 object-contain" src="/lovable-uploads/7243cf0c-a49d-4ab5-9bd8-a80e9fdde964.png" />
              {/* Elementos decorativos */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-hubbpet-secondary opacity-50"></div>
              <div className="absolute top-1/4 -right-6 w-8 h-8 rounded-full bg-hubbpet-auxiliary opacity-50"></div>
              <div className="absolute bottom-10 -left-10 w-16 h-16 rounded-full border-2 border-hubbpet-secondary opacity-50"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Resto da página mantido igual */}
      {/* How it Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-hubbpet-primary">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-hubbpet-primary text-white">
                    <Search className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-2">Busque</h3>
                <p className="text-gray-600">
                  Encontre veterinários por localização, especialidade ou tipo de atendimento
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-hubbpet-secondary text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-2">Agende</h3>
                <p className="text-gray-600">
                  Escolha o horário disponível e agende seu atendimento com poucos cliques
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-hubbpet-auxiliary text-white">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-2">Atenda</h3>
                <p className="text-gray-600">
                  Receba atendimento de qualidade e mantenha o histórico do seu pet em um só lugar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4 text-hubbpet-primary">Para tutores</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-secondary">•</div>
                  <p>Busca fácil por veterinários próximos</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-secondary">•</div>
                  <p>Agendamento online com pagamento integrado</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-secondary">•</div>
                  <p>Histórico completo de atendimentos e documentos</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-secondary">•</div>
                  <p>Avaliações e recomendações de profissionais</p>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mb-4 mt-8 text-hubbpet-primary">Para veterinários</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-auxiliary">•</div>
                  <p>Aumente sua visibilidade no mercado</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-auxiliary">•</div>
                  <p>Gestão simplificada de agenda e pacientes</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-auxiliary">•</div>
                  <p>Recebimentos garantidos e automáticos</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 text-hubbpet-auxiliary">•</div>
                  <p>Geração de laudos e receitas diretamente na plataforma</p>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img src="https://images.unsplash.com/photo-1628009368231-7bb7cfcbf266?auto=format&fit=crop&q=80" alt="Veterinário examinando um cachorro" className="rounded-lg w-full shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-hubbpet-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de tutores e veterinários que já estão utilizando o HubbPet para transformar a saúde dos pets.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-hubbpet-secondary hover:bg-hubbpet-secondary/80">
              Criar minha conta agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="logo-container mb-4">
                <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png" alt="HubbPet" />
              </div>
              <p className="text-gray-400">
                Conectando tutores e veterinários para um melhor cuidado com os pets.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-medium text-lg mb-4">Empresa</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Como funciona</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Carreiras</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-4">Suporte</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Central de ajuda</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Termos de uso</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacidade</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} HubbPet. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;