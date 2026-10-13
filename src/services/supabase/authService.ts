import { supabase, isSupabaseConfigured } from './client';
import type { UserProfile } from '../../types/auth';

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  async signUp(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null; confirmationRequired?: boolean }> {
    if (!this.isConfigured() || !supabase) {
      return {
        user: null,
        error: 'Supabase no está configurado. Conecta tus variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const confirmationRequired = !data.session;
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            createdAt: data.user.created_at,
          },
          error: null,
          confirmationRequired,
        };
      }

      return { user: null, error: 'No se pudo crear la cuenta de usuario.' };
    } catch (err) {
      return {
        user: null,
        error: err instanceof Error ? err.message : 'Error inesperado durante el registro.',
      };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!this.isConfigured() || !supabase) {
      return {
        user: null,
        error: 'Supabase no está configurado. Conecta tus credenciales de Supabase en .env para autenticación remota.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            createdAt: data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: 'Credenciales inválidas.' };
    } catch (err) {
      return {
        user: null,
        error: err instanceof Error ? err.message : 'Error durante el inicio de sesión.',
      };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    if (!this.isConfigured() || !supabase) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al cerrar sesión.' };
    }
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!this.isConfigured() || !supabase) {
      return {
        error: 'Supabase no está configurado. Requiere credenciales activas para el envío de correos.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      return { error: error ? error.message : null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al solicitar recuperación.' };
    }
  },

  async getCurrentSessionUser(): Promise<UserProfile | null> {
    if (!this.isConfigured() || !supabase) {
      return null;
    }

    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        return {
          id: data.session.user.id,
          email: data.session.user.email || '',
          createdAt: data.session.user.created_at,
        };
      }
      return null;
    } catch {
      return null;
    }
  },
};
