import { User as AppUser, UserRole } from './supabaseHelpers';

// Define response types
export interface SignUpResponse {
  success: boolean;
  data?: { userId: string };
  error?: string;
}

export interface SignInResponse {
  success: boolean;
  data?: { user: AppUser };
  error?: string;
}

export interface SignOutResponse {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: AppUser | null;
  signUp: (userData: {
    email: string;
    password: string;
    role: UserRole;
    full_name?: string;
    phone_number?: string;
    street_address?: string;
    city?: string;
    date_of_birth?: string;
    national_id_or_passport?: string;
    tin_number?: string;
  }) => Promise<SignUpResponse>;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signOut: () => Promise<SignOutResponse>;
  loading: boolean;
  isAdmin: boolean;
  isHost: boolean;
  isCustomer: boolean;
  updateUser: (id: string, userData: Partial<AppUser>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}