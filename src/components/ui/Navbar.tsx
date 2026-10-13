import React, { useState, useRef } from 'react';
import {
  Box,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Layers,
  Eye,
  Grid,
  Magnet,
  FolderOpen,
  User,
  LogOut,
  ChevronDown,
  Check,
  HardDrive,
  Cloud,
} from 'lucide-react';
import type { ViewOrientation, RenderShadingMode } from '../../types/cad';
import type { UserProfile } from '../../types/auth';

interface NavbarProps {
  projectName: string;
  onRenameProject: (newName: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  isSaving: boolean;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  isCloudSynced: boolean;
  // View controls
  viewOrientation: ViewOrientation;
  onChangeView: (view: ViewOrientation) => void;
  shadingMode: RenderShadingMode;
  onChangeShading: (mode: RenderShadingMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  // Export/Import
  onExportGLB: () => void;
  onExportSTL: () => void;
  onExportNative: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Navigation & Auth
  onOpenDashboard: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectName,
  onRenameProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  isSaving,
  hasUnsavedChanges,
  isCloudSynced,
  viewOrientation,
  onChangeView,
  shadingMode,
  onChangeShading,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  onExportGLB,
  onExportSTL,
  onExportNative,
  onImportFile,
  onOpenDashboard,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showShadingMenu, setShowShadingMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFinishRename = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      onRenameProject(tempName.trim());
    } else {
      setTempName(projectName);
    }
  };

  return (
    <header
      style={{
        height: '48px',
        backgroundColor: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImportFile}
        accept=".forma3d,.json,.glb,.gltf,.stl"
        style={{ display: 'none' }}
      />

      {/* Left: Brand & Project Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onOpenDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-main)',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.04em',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 180, 216, 0.1)',
            border: '1px solid rgba(0, 180, 216, 0.25)',
          }}
          title="Ver panel de proyectos"
        >
          <Box size={18} style={{ color: 'var(--accent-cad)' }} />
          <span>FORMA <span style={{ color: 'var(--accent-cad)' }}>3D</span></span>
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Project Name editable */}
        {isEditingName ? (
          <input
            type="text"
            value={tempName}
            autoFocus
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleFinishRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishRename();
              if (e.key === 'Escape') {
                setTempName(projectName);
                setIsEditingName(false);
              }
            }}
            style={{
              height: '28px',
              padding: '2px 8px',
              fontSize: '13px',
              fontWeight: 500,
              width: '180px',
            }}
          />
        ) : (
          <div
            onClick={() => {
              setTempName(projectName);
              setIsEditingName(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-main)',
            }}
            title="Click para renombrar proyecto"
          >
            <span>{projectName}</span>
            {hasUnsavedChanges && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-amber)',
                }}
                title="Cambios no guardados"
              />
            )}
          </div>
        )}

        {/* Sync Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10px',
            fontWeight: 500,
            backgroundColor: isCloudSynced ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.15)',
            color: isCloudSynced ? 'var(--accent-cad)' : 'var(--text-dim)',
            border: `1px solid ${isCloudSynced ? 'rgba(59, 130, 246, 0.25)' : 'var(--border-subtle)'}`,
          }}
          title={isCloudSynced ? 'Sincronizado con Supabase PostgreSQL' : 'Almacenado localmente'}
        >
          {isCloudSynced ? <Cloud size={12} /> : <HardDrive size={12} />}
          <span>{isCloudSynced ? 'Nube' : 'Local'}</span>
        </div>
      </div>

      {/* Center: Undo/Redo, Save, Viewports & Shading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: canUndo ? 'var(--text-main)' : 'var(--text-dim)',
            opacity: canUndo ? 1 : 0.4,
          }}
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: canRedo ? 'var(--text-main)' : 'var(--text-dim)',
            opacity: canRedo ? 1 : 0.4,
          }}
          title="Rehacer (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: hasUnsavedChanges ? 'rgba(245, 158, 11, 0.18)' : 'var(--bg-input)',
            color: hasUnsavedChanges ? 'var(--accent-amber)' : 'var(--text-muted)',
            border: `1px solid ${hasUnsavedChanges ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)'}`,
          }}
          title="Guardar proyecto"
        >
          <Save size={14} />
          <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* View Orientation Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowViewMenu(!showViewMenu);
              setShowShadingMenu(false);
              setShowExportMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 9px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-main)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Eye size={13} style={{ color: 'var(--accent-cad)' }} />
            <span style={{ textTransform: 'capitalize' }}>{viewOrientation}</span>
            <ChevronDown size={12} />
          </button>

          {showViewMenu && (
            <div
              style={{
                position: 'absolute',
                top: '32px',
                left: 0,
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '4px',
                minWidth: '130px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {(['perspective', 'isometric', 'top', 'front', 'right', 'left'] as ViewOrientation[]).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    onChangeView(v);
                    setShowViewMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: viewOrientation === v ? 'var(--accent-cad)' : 'var(--text-main)',
                    backgroundColor: viewOrientation === v ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                    textTransform: 'capitalize',
                  }}
                >
                  <span>{v === 'perspective' ? 'Perspectiva' : v === 'isometric' ? 'Isométrica' : v === 'top' ? 'Planta (Top)' : v === 'front' ? 'Frontal' : v === 'right' ? 'Derecha' : 'Izquierda'}</span>
                  {viewOrientation === v && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shading Mode Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowShadingMenu(!showShadingMenu);
              setShowViewMenu(false);
              setShowExportMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 9px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-main)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Layers size={13} style={{ color: 'var(--accent-cad)' }} />
            <span>{shadingMode === 'solid' ? 'Sólido' : shadingMode === 'wireframe' ? 'Alámbrico' : 'Mixto'}</span>
            <ChevronDown size={12} />
          </button>

          {showShadingMenu && (
            <div
              style={{
                position: 'absolute',
                top: '32px',
                left: 0,
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '4px',
                minWidth: '140px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {[
                { id: 'solid', label: 'Sólido PBR' },
                { id: 'wireframe', label: 'Líneas Alámbricas' },
                { id: 'shaded-wireframe', label: 'Sólido con Bordes' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onChangeShading(m.id as RenderShadingMode);
                    setShowShadingMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: shadingMode === m.id ? 'var(--accent-cad)' : 'var(--text-main)',
                    backgroundColor: shadingMode === m.id ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                  }}
                >
                  <span>{m.label}</span>
                  {shadingMode === m.id && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid toggle */}
        <button
          onClick={onToggleGrid}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: showGrid ? 'var(--accent-cad)' : 'var(--text-dim)',
            backgroundColor: showGrid ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
          }}
          title="Alternar cuadrícula (G)"
        >
          <Grid size={15} />
        </button>

        {/* Snap toggle */}
        <button
          onClick={onToggleSnap}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: snapToGrid ? 'var(--accent-cad)' : 'var(--text-dim)',
            backgroundColor: snapToGrid ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
          }}
          title="Ajuste magnético / Snap a rejilla"
        >
          <Magnet size={15} />
        </button>
      </div>

      {/* Right: Import, Export & User Account */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--text-main)',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
          }}
          title="Importar proyecto (.forma3d) o modelo 3D"
        >
          <Upload size={13} />
          <span>Importar</span>
        </button>

        {/* Export Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowViewMenu(false);
              setShowShadingMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'rgba(0, 180, 216, 0.15)',
              color: 'var(--accent-cad)',
              border: '1px solid rgba(0, 180, 216, 0.3)',
            }}
          >
            <Download size={13} />
            <span>Exportar</span>
            <ChevronDown size={12} />
          </button>

          {showExportMenu && (
            <div
              style={{
                position: 'absolute',
                top: '32px',
                right: 0,
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                minWidth: '220px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <button
                onClick={() => {
                  onExportNative();
                  setShowExportMenu(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Proyecto FORMA 3D (.forma3d)
                </span>
                <span style={{ fontSize: '10px', color: 'var(--accent-cad)' }}>
                  Conserva parámetros, historial y jerarquía
                </span>
              </button>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

              <button
                onClick={() => {
                  onExportGLB();
                  setShowExportMenu(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Escena 3D GLB (.glb)
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Para Blender, visualizadores y WebGL
                </span>
              </button>

              <button
                onClick={() => {
                  onExportSTL();
                  setShowExportMenu(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Malla STL (.stl)
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Para software de impresión 3D y mecanizado
                </span>
              </button>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle)', margin: '0 2px' }} />

        {/* Dashboard link */}
        <button
          onClick={onOpenDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
          title="Panel de proyectos"
        >
          <FolderOpen size={14} />
          <span>Proyectos</span>
        </button>

        {/* User Account / Auth */}
        {currentUser ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                color: 'var(--text-main)',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-cad)',
                  color: '#090b0e',
                  fontWeight: 700,
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentUser.email.charAt(0).toUpperCase()}
              </div>
              <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.email.split('@')[0]}
              </span>
              <ChevronDown size={12} />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '32px',
                  right: 0,
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                  minWidth: '160px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
                  {currentUser.email}
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    setShowUserMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--accent-danger)',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={13} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          >
            <User size={13} />
            <span>Cuenta</span>
          </button>
        )}
      </div>
    </header>
  );
};
