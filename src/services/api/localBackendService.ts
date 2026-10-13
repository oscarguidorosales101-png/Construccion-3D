import type { UserProfile } from '../../types/auth';
import type { NativeProjectFormat, ProjectMetadata } from '../../types/project';

const API_BASE = 'http://localhost:3001/api';
const TOKEN_KEY = 'forma3d_session_token';

export const localBackendService = {
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string | null) {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  },

  async isServerOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // -------------------------------------------------------------
  // Auth API
  // -------------------------------------------------------------
  async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { user: null, error: data.error || 'Error al registrar usuario.' };
      }
      this.setToken(data.token);
      return { user: data.user, error: null };
    } catch {
      return { user: null, error: 'Servidor local no disponible.' };
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { user: null, error: data.error || 'Credenciales inválidas.' };
      }
      this.setToken(data.token);
      return { user: data.user, error: null };
    } catch {
      return { user: null, error: 'Servidor local no disponible.' };
    }
  },

  async getMe(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.setToken(null);
        return null;
      }
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    this.setToken(null);
  },

  // -------------------------------------------------------------
  // Projects API
  // -------------------------------------------------------------
  async listProjects(): Promise<ProjectMetadata[]> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/projects`, { method: 'GET', headers });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async saveProject(project: NativeProjectFormat): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(project),
      });
      if (res.ok) return { success: true };
      const data = await res.json();
      return { success: false, error: data.error || 'Error al guardar proyecto.' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error de conexión.' };
    }
  },

  async loadProject(id: string): Promise<NativeProjectFormat | null> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'GET', headers });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async deleteProject(id: string): Promise<boolean> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE', headers });
      return res.ok;
    } catch {
      return false;
    }
  },
};
