export type TransactionType = 'income' | 'expense';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  parentId?: string; // For hierarchy
  allocatedAmount: number; // Envelope budget
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId?: string; // Optional for income, required for expense
  date: string; // ISO string
  note: string;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  nextPostDate?: string; // ISO string
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  theme: 'light' | 'dark';
}
