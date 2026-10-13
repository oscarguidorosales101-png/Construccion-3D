import React, { useState, useRef } from 'react';
import type { ProjectMetadata } from '../../types/project';
import type { UserProfile } from '../../types/auth';
import {
  Box,
  Plus,
  Search,
  Upload,
  Calendar,
  Layers,
  Trash2,
  Copy,
  Edit2,
  ExternalLink,
  ArrowRight,
  Database,
  User,
} from 'lucide-react';

interface ProjectDashboardProps {
  projects: ProjectMetadata[];
  activeProjectId: string | null;
  onOpenProject: (projectId: string) => void;
  onCreateNewProject: (template: 'empty' | 'tank') => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackToEditor: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenSetupGuide: () => void;
  isCloudConfigured: boolean;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  activeProjectId,
  onOpenProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onImportProject,
  onBackToEditor,
  currentUser,
  onOpenAuth,
  onOpenSetupGuide,
  isCloudConfigured,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartRename = (id: string, name: string) => {
    setEditingId(id);
    setTempName(name);
  };

  const handleFinishRename = (id: string) => {
    if (tempName.trim()) {
      onRenameProject(id, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-darkest)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImportProject}
        accept=".forma3d,.json"
        style={{ display: 'none' }}
      />

      {/* Top Banner / Navigation */}
      <header
        style={{
          height: '56px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '16px',
              color: 'var(--text-main)',
            }}
          >
            <Box size={22} style={{ color: 'var(--accent-cad)' }} />
            <span>FORMA <span style={{ color: 'var(--accent-cad)' }}>3D</span></span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>|</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Panel de Proyectos & Modelos CAD
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!currentUser ? (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--text-main)',
              }}
            >
              <User size={14} />
              <span>Iniciar Sesión / Registro</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-cad)',
                  color: '#090b0e',
                  fontWeight: 700,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentUser.email.charAt(0).toUpperCase()}
              </div>
              <span>{currentUser.email}</span>
            </div>
          )}

          <button
            onClick={onBackToEditor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'var(--accent-cad)',
              color: '#090b0e',
              fontWeight: 600,
              fontSize: '12px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span>Volver al Editor</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Banner informing about Supabase status */}
        {!isCloudConfigured && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={20} style={{ color: 'var(--accent-amber)' }} />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Almacenamiento Local Activo (IndexedDB / LocalStorage)
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Tus proyectos se guardan automáticamente en este navegador. Para habilitar sincronización en la nube con Supabase PostgreSQL y autenticación de usuarios, conecta tus variables.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSetupGuide}
              style={{
                padding: '7px 12px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--accent-amber)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Configurar Supabase
            </button>
          </div>
        )}

        {/* Action Bar: Search, New Project, Import */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onCreateNewProject('tank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                backgroundColor: 'var(--accent-cad)',
                color: '#090b0e',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 10px var(--accent-cad-glow)',
              }}
            >
              <Plus size={16} />
              <span>Nuevo Tanque Industrial</span>
            </button>

            <button
              onClick={() => onCreateNewProject('empty')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 14px',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Box size={15} />
              <span>Proyecto en Blanco</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 14px',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Upload size={15} />
              <span>Importar .forma3d</span>
            </button>
          </div>

          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              width: '260px',
            }}
          >
            <Search size={15} style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '12px',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Project Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-panel)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
                color: 'var(--text-dim)',
              }}
            >
              <Box size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                No se encontraron proyectos
              </div>
              <p style={{ fontSize: '12px' }}>Crea un nuevo tanque industrial o importa un archivo .forma3d para comenzar.</p>
            </div>
          ) : (
            filtered.map((proj) => {
              const isActive = activeProjectId === proj.id;
              const isEditing = editingId === proj.id;

              return (
                <div
                  key={proj.id}
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: `1px solid ${isActive ? 'var(--accent-cad)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 0 12px var(--accent-cad-glow)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(0, 180, 216, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-cad)',
                          }}
                        >
                          <Layers size={18} />
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempName}
                            autoFocus
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={() => handleFinishRename(proj.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFinishRename(proj.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            style={{ fontSize: '13px', fontWeight: 600, height: '26px' }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: 'var(--text-main)',
                            }}
                          >
                            {proj.name}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => handleStartRename(proj.id, proj.name)}
                          style={{ padding: '4px', color: 'var(--text-dim)' }}
                          title="Renombrar"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDuplicateProject(proj.id)}
                          style={{ padding: '4px', color: 'var(--text-dim)' }}
                          title="Duplicar"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          style={{ padding: '4px', color: 'var(--accent-danger)' }}
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                      {proj.description || 'Modelo de ingeniería paramétrico tridimensional'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-dim)' }}>
                      <Calendar size={12} />
                      <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                      <span className="badge badge-cad" style={{ fontSize: '9px' }}>v{proj.version || '1.0'}</span>
                    </div>

                    <button
                      onClick={() => onOpenProject(proj.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: isActive ? 'rgba(0, 180, 216, 0.2)' : 'var(--bg-panel-hover)',
                        color: isActive ? 'var(--accent-cad)' : 'var(--text-main)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{isActive ? 'Activo en Editor' : 'Abrir Modelo'}</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
