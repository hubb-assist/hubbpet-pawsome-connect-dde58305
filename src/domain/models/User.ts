
export enum UserRole {
  TUTOR = 'tutor',
  VETERINARY = 'veterinary',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tutor extends User {
  pets: Pet[];
  appointments: Appointment[];
}

export interface Veterinary extends User {
  crmv: string;
  bio: string;
  specialties: string[];
  location: Location;
  services: Service[];
  workingHours: WorkingHours[];
  appointments: Appointment[];
  rating: number;
  approved: boolean;
}

export interface Admin extends User {
  permissions: string[];
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'reptile' | 'other';
  breed: string;
  birthdate?: Date;
  tutorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  serviceType: 'clinic' | 'home' | 'both';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  veterinaryId: string;
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  veterinaryId: string;
}

export interface Appointment {
  id: string;
  tutorId: string;
  petId: string;
  veterinaryId: string;
  serviceId: string;
  date: Date;
  status: 'scheduled' | 'completed' | 'canceled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  rating?: number;
  feedback?: string;
  documents?: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'report' | 'prescription' | 'certificate';
  fileUrl: string;
  appointmentId: string;
  createdAt: Date;
}
