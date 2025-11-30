export interface User {
  id: string;
  username: string;
  roles: string[];
  walletAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  isEmailVerified: boolean;
  isTwoFactorAuthEnabled: boolean;
  googleId?: string;
  provider?: string;
  picture?: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  kycCompleted: boolean;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  category: 'eviction' | 'hoh' | 'task' | 'general';
  options: string[];
  stakes: Record<string, number>;
  userStakes: Record<string, UserStake[]>;
  status: 'active' | 'closed' | 'resolved';
  endTime: Date;
  endType?: 'scheduled' | 'manual';
  correctAnswer?: string;
  totalPool: number;
  participants: number;
}

export interface UserStake {
  userId: string;
  amount: number;
  timestamp: Date;
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdraw' | 'stake' | 'win';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
  read: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  username?: string;
}

export interface CreatePollData {
  title: string;
  description: string;
  category: 'eviction' | 'hoh' | 'task' | 'general';
  options: string[];
  endTime: Date;
  endType?: 'scheduled' | 'manual';
}
