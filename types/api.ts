// types/api.ts

export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  message?: string[];
  errorCode?: string;
}

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
  verificationToken?: string;
  wallet: {
    balance: number;
    bonusBalance: number;
    isLocked: boolean;
    totalDeposits: number;
    totalStakes: number;
    totalWinnings: number;
    totalWithdrawals: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    roles: string[];
    walletAddress: string;
  };
}

export interface SignupRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateEmailRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  resetToken: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  otp: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResendVerifyEmailRequest {
  email: string;
}

export interface ResendVerifyEmailResponse {
  verificationToken: string;
}

export interface PollOption {
  id?: string;
  text: string;
}

export interface CreatePollRequest {
  title: string;
  description: string;
  category: string;
  endTime: string;
  options: PollOption[];
  showName: string;
  season: string;
}

export interface UpdatePollRequest {
  title?: string;
  description?: string;
  endTime?: string;
  status?: 'draft' | 'active' | 'closed' | 'resolved' | 'cancelled';
}

export interface ResolvePollRequest {
  correctOptionId: string;
}

export interface Poll {
  id: string; // Unique identifier
  title: string; // Poll title
  description: string; // Poll description
  category: string; // Category: 'eviction', 'hoh', 'task', 'general'
  status: string; // Status: 'active', 'closed', 'resolved', 'cancelled'
  season: string; // Season number (e.g., '10')
  showName: string; // Name of the show (e.g., 'Biggie Nija')
  // Options array
  options: Array<{
    id?: string; // Option ID
    _id?: string; // Alternative ID field (MongoDB)
    text: string; // Option text/name
  }>;

  // Timing
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last update timestamp
  startTime?: string; // Poll start time
  endTime?: string; // Poll end time

  // Statistics
  totalStakeAmount?: number; // Total amount staked on the poll
  totalParticipants?: number; // Number of unique participants
  stakesPerOption?: {
    // Stakes amount per option
    [optionId: string]: number;
  };
  statistics?: {
    totalStakeAmount: number;
    totalParticipants: number;
    stakerUserIds: string[]; // Array of user IDs who have staked
    options?: any[];
  };

  // Resolution fields (when poll is resolved)
  winningOptionId?: string; // ID of the winning option
  correctOptionId?: string; // ID of the correct/winning option

  // Creator info
  createdBy?: {
    id: string;
    username: string;
  };
}

export interface CreateStakeRequest {
  pollId: string;
  selectedOptionId: string;
  amount: number;
}

export interface Stake {
  id: string;
  pollId: string;
  selectedOptionId: string;
  amount: number;
  status: 'active' | 'won' | 'lost' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  amount: number;
  email: string;
  phoneNumber: string;
  name: string;
}

export interface WithdrawalRequest {
  amount: number;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Wallet {
  id: string;
  balance: number;
  lockedBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
}

export interface VerifyAccountRequest {
  accountNumber: string;
  bankCode: string;
}

export interface Notification {
  id: string;
  type: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  title: string;
  message: string;
  createdAt: string;
}

export interface NotificationPreferences {
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  types: Record<string, boolean>;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  // Individual preference flags
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  winNotifications?: boolean;
  depositNotifications?: boolean;
  promotionalNotifications?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PublicPollsParams extends PaginationParams {
  search?: string; // For searching title, description, poll options
  status?: string; // Filter by poll status
  category?: string; // Filter by poll category
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  pagingCounter: number;
}

export interface StakesParams extends PaginationParams {
  userId?: string;
  pollId?: string;
  status?: 'active' | 'won' | 'lost' | 'refunded';
}

export interface TransactionParams extends PaginationParams {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationParams extends PaginationParams {
  userId?: string;
  type?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  unread?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CalculateWinningsParams {
  pollId: string;
  selectedOptionId: string;
  amount: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalPolls: number;
  totalStakes: number;
  totalRevenue: number;
}

export interface AdminUserParams extends PaginationParams {
  search?: string; // For searching username, email, firstName, lastName
  status?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  kycCompleted?: boolean;
}

export interface AdminTransactionParams extends PaginationParams {
  type?: string;
  status?: string;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Wallet Authentication Types
export interface WalletNonceRequest {
  address: string;
  chainId: number;
}

export interface WalletNonceResponse {
  nonce: string;
  address: string;
  chainId: number;
  issuedAt: string;
  expiresAt: string;
}

export interface WalletMessageRequest {
  address: string;
  chainId: number;
}

export interface WalletMessageResponse {
  message: string;
}

export interface WalletSignInRequest {
  message: string;
  signature: string;
  verified?: boolean;
}

export interface WalletSignInResponse {
  accessToken: string;
  refreshToken: string;
  user: User & {
    isNewUser?: boolean;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
