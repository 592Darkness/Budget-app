import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Category, Transaction, TransactionType, RecurringFrequency } from './types';
import { addDays, addWeeks, addMonths, addYears, isBefore, isSameDay, parseISO } from 'date-fns';

const defaultCategories: Category[] = [
  { id: '1', name: 'Housing', allocatedAmount: 50000, color: '#ef4444' },
  { id: '2', name: 'Food', allocatedAmount: 30000, color: '#f97316' },
  { id: '3', name: 'Transportation', allocatedAmount: 15000, color: '#eab308' },
  { id: '4', name: 'Utilities', allocatedAmount: 20000, color: '#22c55e' },
  { id: '5', name: 'Entertainment', allocatedAmount: 10000, color: '#3b82f6' },
];

const initialState: AppState = {
  transactions: [],
  categories: defaultCategories,
  theme: 'dark',
};

interface AppContextType extends AppState {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('budget-app-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse state from local storage', e);
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('budget-app-state', JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  // Process recurring transactions
  useEffect(() => {
    const today = new Date();
    setState(prevState => {
      let updatedTransactions = [...prevState.transactions];
      let hasUpdates = false;

      prevState.transactions.forEach((tx) => {
        if (tx.isRecurring && tx.nextPostDate) {
          let nextDate = parseISO(tx.nextPostDate);
          let currentTx = { ...tx };
          
          while (isBefore(nextDate, today) || isSameDay(nextDate, today)) {
            // Create new transaction instance
            const newTx: Transaction = {
              ...currentTx,
              id: uuidv4(),
              date: nextDate.toISOString(),
              isRecurring: false, // The posted one is not recurring itself
              nextPostDate: undefined,
            };
            updatedTransactions.push(newTx);
            hasUpdates = true;

            // Calculate next post date
            switch (currentTx.recurringFrequency) {
              case 'daily':
                nextDate = addDays(nextDate, 1);
                break;
              case 'weekly':
                nextDate = addWeeks(nextDate, 1);
                break;
              case 'monthly':
                nextDate = addMonths(nextDate, 1);
                break;
              case 'yearly':
                nextDate = addYears(nextDate, 1);
                break;
              default:
                nextDate = addMonths(nextDate, 1);
            }
          }
          
          // Update the original recurring template's nextPostDate
          if (hasUpdates) {
            const index = updatedTransactions.findIndex(t => t.id === currentTx.id);
            if (index !== -1) {
              updatedTransactions[index] = { ...currentTx, nextPostDate: nextDate.toISOString() };
            }
          }
        }
      });

      return hasUpdates ? { ...prevState, transactions: updatedTransactions } : prevState;
    });
  }, []); // Run once on mount

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: uuidv4() };
    setState(prev => ({ ...prev, transactions: [...prev.transactions, newTx] }));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(tx => tx.id !== id)
    }));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCat: Category = { ...category, id: uuidv4() };
    setState(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    }));
  };

  const deleteCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id),
      // Also remove category from transactions or handle it
      transactions: prev.transactions.map(tx => tx.categoryId === id ? { ...tx, categoryId: undefined } : tx)
    }));
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
