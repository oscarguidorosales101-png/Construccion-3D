import { supabase, isSupabaseConfigured } from './client';
import type { NativeProjectFormat, ProjectMetadata } from '../../types/project';

const LOCAL_STORAGE_KEY = 'forma3d_projects_v1';
const CURRENT_ACTIVE_KEY = 'forma3d_active_project_id';

export const projectService = {
  /**
   * Save a project. If Supabase is available & user logged in, saves remotely; otherwise saves locally.
   */
  async saveProject(project: NativeProjectFormat, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Always save to Local Cache first for instant recovery
      this.saveToLocalCache(project);

      // 2. If Supabase configured & user exists, sync remotely
      if (isSupabaseConfigured && supabase && userId) {
        const { error } = await supabase.from('projects').upsert({
          id: project.metadata.id,
          user_id: userId,
          name: project.metadata.name,
          description: project.metadata.description || '',
          version: project.formaVersion,
          content: project,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          return { success: false, error: `Error al guardar en Supabase: ${error.message}. Guardado localmente.` };
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error al guardar el proyecto.' };
    }
  },

  /**
   * List all projects available to the current user (locally + remotely if configured)
   */
  async listProjects(userId?: string): Promise<ProjectMetadata[]> {
    const localProjects = this.listLocalProjects();

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, description, created_at, updated_at, version, user_id')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const remoteMetadata: ProjectMetadata[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            version: row.version,
            ownerId: row.user_id,
          }));

          // Merge without duplicates (remote takes precedence)
          const merged = [...remoteMetadata];
          localProjects.forEach((lp) => {
            if (!merged.some((m) => m.id === lp.id)) {
              merged.push(lp);
            }
          });
          return merged;
        }
      } catch (e) {
        console.warn('Could not fetch remote projects, falling back to local cache', e);
      }
    }

    return localProjects;
  },

  /**
   * Load project by ID
   */
  async loadProject(projectId: string): Promise<{ project: NativeProjectFormat | null; error?: string }> {
    // Check remote if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('content')
          .eq('id', projectId)
          .single();

        if (!error && data?.content) {
          return { project: data.content as NativeProjectFormat };
        }
      } catch (e) {
        console.warn('Remote load failed, attempting local cache', e);
      }
    }

    // Fallback to local
    const local = this.loadFromLocalCache(projectId);
    if (local) {
      return { project: local };
    }

    return { project: null, error: 'Proyecto no encontrado.' };
  },

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
    this.deleteFromLocalCache(projectId);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Error al eliminar' };
      }
    }

    return { success: true };
  },

  // ----------------- Local Storage Caching -----------------
  listLocalProjects(): ProjectMetadata[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const dict: Record<string, NativeProjectFormat> = JSON.parse(raw);
      return Object.values(dict).map((p) => p.metadata);
    } catch {
      return [];
    }
  },

  saveToLocalCache(project: NativeProjectFormat) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const dict: Record<string, NativeProjectFormat> = raw ? JSON.parse(raw) : {};
      dict[project.metadata.id] = project;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dict));
      localStorage.setItem(CURRENT_ACTIVE_KEY, project.metadata.id);
    } catch (e) {
      console.warn('Local storage save failed', e);
    }
  },

  loadFromLocalCache(projectId: string): NativeProjectFormat | null {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const dict: Record<string, NativeProjectFormat> = JSON.parse(raw);
      return dict[projectId] || null;
    } catch {
      return null;
    }
  },

  deleteFromLocalCache(projectId: string) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const dict: Record<string, NativeProjectFormat> = JSON.parse(raw);
      delete dict[projectId];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dict));
    } catch (e) {
      console.warn('Local delete failed', e);
    }
  },

  getActiveProjectId(): string | null {
    return localStorage.getItem(CURRENT_ACTIVE_KEY);
  },
};
