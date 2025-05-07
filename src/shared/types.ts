export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: 'tutor' | 'veterinary' | 'admin';
  avatar?: string;
};

export type SearchParams = {
  zipCode?: string;
  city?: string;
  serviceType?: 'clinic' | 'home' | 'both';
  specialty?: string;
  maxPrice?: number;
  minRating?: number;
};

export type DashboardStats = {
  appointmentsCount: number;
  completedAppointments: number;
  upcomingAppointments: number;
  totalSpent?: number; // For tutors
  totalEarned?: number; // For veterinarians
  rating?: number; // For veterinarians
};

export type Procedimento = {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
};
