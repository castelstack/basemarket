import { create } from 'zustand';
import { Transaction, Notification } from '@/types';

interface WalletState {
  transactions: Transaction[];
  notifications: Notification[];
  isLoading: boolean;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  markNotificationAsRead: (id: number) => void;
}

const sampleTransactions: Transaction[] = [
  {
    id: 1,
    type: 'deposit',
    amount: 10000,
    description: 'Bank Transfer Deposit',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'completed'
  },
  {
    id: 2,
    type: 'stake',
    amount: -2000,
    description: 'Stake on "Who will be evicted?" - Mercy',
    timestamp: new Date('2024-01-16T14:20:00'),
    status: 'completed'
  },
  {
    id: 3,
    type: 'win',
    amount: 5500,
    description: 'Winnings from "Best Task Performance"',
    timestamp: new Date('2024-01-16T22:00:00'),
    status: 'completed'
  }
];

export const useWalletStore = create<WalletState>((set, get) => ({
  transactions: sampleTransactions,
  notifications: [],
  isLoading: false,

  deposit: async (amount: number) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTransaction: Transaction = {
      id: Date.now(),
      type: 'deposit',
      amount,
      description: `Deposit via Bank Transfer`,
      timestamp: new Date(),
      status: 'completed'
    };

    const { transactions, addNotification } = get();
    set({ 
      transactions: [newTransaction, ...transactions],
      isLoading: false 
    });

    addNotification(`Successfully deposited ₦${amount.toLocaleString()}`, 'success');
  },

  withdraw: async (amount: number) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTransaction: Transaction = {
      id: Date.now(),
      type: 'withdraw',
      amount: -amount,
      description: `Withdrawal to Bank Account`,
      timestamp: new Date(),
      status: 'completed'
    };

    const { transactions, addNotification } = get();
    set({ 
      transactions: [newTransaction, ...transactions],
      isLoading: false 
    });

    addNotification(`Successfully withdrew ₦${amount.toLocaleString()}`, 'success');
  },

  addNotification: (message: string, type: 'success' | 'error' | 'info') => {
    const { notifications } = get();
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };

    set({ notifications: [newNotification, ...notifications] });
  },

  markNotificationAsRead: (id: number) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
  }
}));