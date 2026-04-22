
import { FaultCategory, FaultStatus, Priority, LoadSheddingStatus, Area, UserRole } from './constants';

export interface User {
  id: string;
  name: string;
  email: string;
  area: string;
  role: UserRole;
  isApproved?: boolean;
  registrationDate?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  isExternal?: boolean;
  lastLogin?: string;
  phone?: string;
  address?: string;
  employeeId?: string;
}

export interface FaultReport {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  area: Area;
  address: string;
  category: FaultCategory;
  priority: Priority;
  description: string;
  reportedDate: string;
  status: FaultStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  adminNotes?: string;
  estimatedResolutionTime?: string;
  actualResolutionTime?: string;
  gpsLocation?: { lat: number; lon: number };
  photos: string[];
}

export interface LoadSheddingSchedule {
  id: string;
  area: Area;
  startTime: string;
  endTime: string;
  date: string;
  status: LoadSheddingStatus;
  reason: string;
  affectedCustomers: number;
  alternativeSupply: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_fault' | 'fault_assigned' | 'fault_resolved' | 'load_shedding' | 'power_restored';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface FaultResolutionStep {
  id: string;
  step: string;
  completed: boolean;
  completedAt?: string;
  technicianNotes?: string;
}

export interface FaultResolutionData {
  resolutionSteps: FaultResolutionStep[];
  partsUsed: string[];
  resolutionSummary: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface LoadSheddingImpact {
  area: Area;
  duration: number;
  customersAffected: number;
  businessesAffected: number;
  criticalServicesAffected: string[];
}

export interface Fault {
  id: string;
  customerId: string;
  area: Area;
  address: string;
  technician: string;
  technicianId?: string;
  category: FaultCategory;
  priority: Priority;
  status: FaultStatus;
  description: string;
  reportedDate: string;
  assignedDate?: string;
  resolvedDate?: string;
  faultNumber?: string;
  gpsLocation?: { lat: number; lon: number };
  photos: string[];
  signature?: { name: string; timestamp: string };
  resolutionData?: FaultResolutionData;
  customerFeedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
}
