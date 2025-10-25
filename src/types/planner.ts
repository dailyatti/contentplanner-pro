export type ViewType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'notes' | 'goals' | 'drawing' | 'budget' | 'settings';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  linkedPlans: string[];
  tags: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  createdAt: Date;
}

export interface PlanItem {
  id: string;
  title: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
  date: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  linkedNotes: string[];
}

export interface Drawing {
  id: string;
  title: string;
  data: string; // base64 encoded image data
  createdAt: Date;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily' | 'one-time';
  nextPayment: Date;
  isActive: boolean;
  category: string;
  createdAt: Date;
}

export interface BudgetSettings {
  monthlyBudget: number;
  currency: string;
  notifications: boolean;
  warningThreshold: number; // percentage
}

export interface Transaction {
  id: string;
  subscriptionId?: string;
  amount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense' | 'subscription';
  category: string;
}