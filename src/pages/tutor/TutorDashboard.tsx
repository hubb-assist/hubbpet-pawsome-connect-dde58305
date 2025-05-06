
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TutorDashboard = () => {
  const upcomingAppointments = [
    {
      id: 1,
      veterinaryName: 'Dra. Ana Silva',
      petName: 'Max',
      service: 'Consulta de rotina',
      date: '2023-05-20T14:00:00',
      status: 'confirmed',
    },
    {
      id: 2,
      veterinaryName: 'Dr. Carlos Mendes',
      petName: 'Luna',
      service: 'Vacinação',
      date: '2023-05-25T10:30:00',
      status: 'confirmed',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-hubbpet-primary">Dashboard</h1>
        <Link to="/tutor/search">
          <Button className="bg-hubbpet-secondary hover:bg-hubbpet-secondary/80">
            <Search className="mr-2 h-4 w-4" />
            Buscar veterinários
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pets cadastrados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Max e Luna
            </p>
            <Link to="/tutor/pets" className="text-xs text-hubbpet-primary hover:underline block mt-2">
              Gerenciar pets
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas realizadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 para Max, 2 para Luna
            </p>
            <Link to="/tutor/appointments" className="text-xs text-hubbpet-primary hover:underline block mt-2">
              Ver histórico
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo agendamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold">{upcomingAppointments[0]?.petName}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingAppointments[0]?.service} com {upcomingAppointments[0]?.veterinaryName}
            </p>
            <p className="text-xs text-hubbpet-primary font-medium mt-1">
              {formatDate(upcomingAppointments[0]?.date)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Agendamentos Próximos</h2>
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <p className="font-medium">{appointment.service}</p>
                    <p className="text-sm text-muted-foreground">Pet: {appointment.petName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.veterinaryName}</p>
                  </div>
                  <div className="mt-2 md:mt-0 flex flex-col items-start md:items-end">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Confirmado
                    </div>
                    <p className="text-sm mt-1">{formatDate(appointment.date)}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">Reagendar</Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-50">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Link to="/tutor/appointments">
            <Button variant="outline">Ver todos os agendamentos</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
