export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  organization?: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  sessionToken: string | null;
  isLoading: boolean;
  isConfigured: boolean; // True if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided
  error: string | null;
}
