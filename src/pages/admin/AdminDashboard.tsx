
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  veterinariosTotal: number;
  veterinariosPendentes: number;
  agendamentosHoje: number;
  receitaMes: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    veterinariosTotal: 0,
    veterinariosPendentes: 0,
    agendamentosHoje: 0,
    receitaMes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Obter contagem total de veterinários
        const { count: totalVets, error: totalError } = await supabase
          .from('veterinarios')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          console.error('Erro ao buscar total de veterinários:', totalError);
        }

        // Obter contagem de veterinários pendentes
        const { count: pendingVets, error: pendingError } = await supabase
          .from('veterinarios')
          .select('*', { count: 'exact', head: true })
          .eq('status_aprovacao', 'pendente');

        if (pendingError) {
          console.error('Erro ao buscar veterinários pendentes:', pendingError);
        }

        // Obter contagem de agendamentos de hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        const { count: todayAppointments, error: appointmentsError } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .gte('data_hora', hoje.toISOString())
          .lt('data_hora', amanha.toISOString());

        if (appointmentsError) {
          console.error('Erro ao buscar agendamentos de hoje:', appointmentsError);
        }

        // Obter receita do mês atual - usando abordagem alternativa
        let totalRevenue = 0;
        
        try {
          const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
          
          const { data: monthRevenue, error: revenueError } = await supabase
            .from('agendamentos')
            .select('valor_pago')
            .gte('data_hora', primeiroDia.toISOString())
            .lte('data_hora', ultimoDia.toISOString())
            .eq('status', 'realizado');
          
          if (revenueError) {
            console.error('Erro ao buscar receita do mês:', revenueError);
          } else if (monthRevenue) {
            totalRevenue = monthRevenue.reduce((sum, item) => sum + Number(item.valor_pago || 0), 0);
          }
        } catch (revenueError) {
          console.error('Erro ao calcular receita:', revenueError);
        }

        setStats({
          veterinariosTotal: totalVets || 0,
          veterinariosPendentes: pendingVets || 0,
          agendamentosHoje: todayAppointments || 0,
          receitaMes: totalRevenue
        });

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard Administrativo</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hubbpet-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Veterinários</CardTitle>
              <CardDescription>Total de profissionais cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.veterinariosTotal}</div>
                <div className="p-2 bg-green-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pendentes de Aprovação</CardTitle>
              <CardDescription>Veterinários aguardando revisão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.veterinariosPendentes}</div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <UserX className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <Link 
                to="/admin/veterinarios" 
                className="mt-3 text-sm text-blue-600 hover:underline block"
              >
                Ver pendentes
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Agendamentos Hoje</CardTitle>
              <CardDescription>Consultas previstas para hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.agendamentosHoje}</div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Receita no Mês</CardTitle>
              <CardDescription>Faturamento do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">R$ {stats.receitaMes.toFixed(2)}</div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funções</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/admin/veterinarios">
                <Button className="w-full bg-hubbpet-primary hover:bg-hubbpet-primary/80">
                  Aprovação de Veterinários
                </Button>
              </Link>
              <Link to="/admin/support">
                <Button className="w-full bg-hubbpet-primary hover:bg-hubbpet-primary/80">
                  Suporte e Conflitos
                </Button>
              </Link>
              <Link to="/admin/commissions">
                <Button className="w-full bg-hubbpet-primary hover:bg-hubbpet-primary/80">
                  Configurar Comissões
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button className="w-full bg-hubbpet-primary hover:bg-hubbpet-primary/80">
                  Configurações
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status da Plataforma</CardTitle>
            <CardDescription>Estatísticas gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Veterinários Ativos</span>
                <span className="font-medium">{stats.veterinariosTotal - stats.veterinariosPendentes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Taxa de Aprovação</span>
                <span className="font-medium">
                  {stats.veterinariosTotal > 0 
                    ? `${Math.round(((stats.veterinariosTotal - stats.veterinariosPendentes) / stats.veterinariosTotal) * 100)}%` 
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Comissão Média</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status do Sistema</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Código para o componente Button
const Button = ({ 
  children, 
  className, 
  ...props 
}: { 
  children: React.ReactNode, 
  className?: string, 
  [key: string]: any 
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md text-white transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default AdminDashboard;
