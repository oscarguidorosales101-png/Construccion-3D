import { supabase, isSupabaseConfigured } from './client';
import type { UserProfile } from '../../types/auth';
import { localBackendService } from '../api/localBackendService';

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  async signUp(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null; confirmationRequired?: boolean }> {
    if (this.isConfigured() && supabase) {
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
    }

    // Local db.json backend fallback
    return await localBackendService.register(email, password);
  },

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (this.isConfigured() && supabase) {
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
    }

    // Local db.json backend fallback
    return await localBackendService.login(email, password);
  },

  async signOut(): Promise<{ error: string | null }> {
    if (this.isConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        return { error: error ? error.message : null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Error al cerrar sesión.' };
      }
    }

    await localBackendService.logout();
    return { error: null };
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!this.isConfigured() || !supabase) {
      return {
        error: 'Para restablecimiento de contraseña vía email se requiere Supabase activo.',
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
    if (this.isConfigured() && supabase) {
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
    }

    return await localBackendService.getMe();
  },
};

