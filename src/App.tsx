import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type {
  CADObjectNode,
  CADObjectParams,
  CADPrimitiveType,
  CADSceneState,
  CADTransform,
  RenderShadingMode,
  TankAssemblyParams,
  TransformMode,
  UnitSystem,
  ViewOrientation,
} from './types/cad';
import type { NativeProjectFormat, ProjectMetadata } from './types/project';
import type { UserProfile } from './types/auth';
import type { BIMBuildingModel, DrawingView2D, DocumentSheet } from './types/bim';

// 3D & Parametric Engine
import { CADCanvas } from './components/cad/CADCanvas';
import { generateTankAssembly } from './engine3d/parametric/tankGenerator';
import { generate30StoryOfficeTower, type Tower30StoryConfig } from './engine3d/bim/towerGenerator';
import { HistoryManager } from './engine3d/history/historyManager';

// UI Components
import { Navbar } from './components/ui/Navbar';
import { LeftPanel } from './components/cad/LeftSidebar/LeftPanel';
import { RightPanel } from './components/cad/RightSidebar/RightPanel';
import { StatusBar } from './components/cad/bottom/StatusBar';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { LandingPage } from './components/dashboard/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { SupabaseSetupGuide } from './components/auth/SupabaseSetupGuide';
import { DocumentationModal } from './components/bim/documentation/DocumentationModal';

// Services
import { authService } from './services/supabase/authService';
import { projectService } from './services/supabase/projectService';
import { exportSceneToGLTF } from './services/export/gltfExport';
import { exportSceneToSTL } from './services/export/stlExport';
import { exportSheetToPDF } from './services/export/pdfExport';
import { exportViewToDXF } from './services/export/dxfExport';
import { exportModelToIFC } from './services/export/ifcExport';
import {
  serializeNativeProject,
  downloadNativeProject,
  deserializeNativeProject,
} from './services/export/nativeExport';

// Initial Industrial Tank Setup
function createInitialTankProject(): {
  metadata: ProjectMetadata;
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
} {
  const rootId = 'tank-assembly-default';
  const defaultParams: TankAssemblyParams = {
    tag: 'TK-101',
    diameter: 8.0,
    totalHeight: 10.0,
    wallThicknessMm: 8.0,
    coursesCount: 5,
    platesPerCourse: 6,
    bottomPlateThicknessMm: 10.0,
    bottomAnnularExtension: 0.25,
    roofType: 'conical',
    roofSlopePercentage: 8.0,
    hasWindGirders: true,
    windGirdersCount: 2,
    hasRoofHandrail: true,
    hasSpiralStairs: true,
    stairWidth: 0.8,
    stairTurns: 0.75,
    hasCleanOutDoor: true,
    nozzles: [],
  };
  const { nodes } = generateTankAssembly(rootId, defaultParams, 'mat-steel-carbon');
  return {
    metadata: {
      id: 'proj-tank-demo',
      name: 'Tanque Industrial ASME VIII (Demostración)',
      projectType: 'tank-industrial',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
    objects: nodes,
    rootIds: [rootId],
  };
}

// Initial 30-Story Office Tower Project Setup
function createInitialTowerProject(): {
  metadata: ProjectMetadata;
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
  bimModel: BIMBuildingModel;
  drawingViews: DrawingView2D[];
  documentSheets: DocumentSheet[];
} {
  const tower = generate30StoryOfficeTower({
    totalStoreys: 30,
    floorHeight: 3.6,
    widthX: 36.0,
    lengthZ: 30.0,
    coreWidth: 12.0,
    coreLength: 10.0,
    columnSpan: 6.0,
  });

  return {
    metadata: {
      id: 'proj-torre-30p',
      name: 'Torre de Oficinas Corporativa (30 Pisos)',
      description: 'Edificio corporativo de 30 niveles con planta de 36x30 m, altura 108 m, losas de hormigón armado, muro cortina y núcleo central.',
      projectType: 'bim-building',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
    objects: tower.cadNodes,
    rootIds: tower.rootIds,
    bimModel: tower.bimModel,
    drawingViews: tower.drawingViews,
    documentSheets: tower.documentSheets,
  };
}

export default function App() {
  // Navigation View
  const [currentView, setCurrentView] = useState<'landing' | 'editor' | 'dashboard'>('editor');

  // Auth & User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  // Project State (Defaults to the 30-Story Corporate Office Tower)
  const [initialSetup] = useState(() => createInitialTowerProject());
  const [currentMetadata, setCurrentMetadata] = useState<ProjectMetadata>(initialSetup.metadata);
  const [projectList, setProjectList] = useState<ProjectMetadata[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // BIM Building Model & 2D Documentation State
  const [bimModel, setBimModel] = useState<BIMBuildingModel | null>(initialSetup.bimModel);
  const [drawingViews, setDrawingViews] = useState<DrawingView2D[]>(initialSetup.drawingViews);
  const [documentSheets, setDocumentSheets] = useState<DocumentSheet[]>(initialSetup.documentSheets);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  // CAD Scene State
  const [objects, setObjects] = useState<Record<string, CADObjectNode>>(initialSetup.objects);
  const [rootIds, setRootIds] = useState<string[]>(initialSetup.rootIds);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSnapSize] = useState(0.25);
  const [angleSnapDeg] = useState(15);
  const [viewOrientation, setViewOrientation] = useState<ViewOrientation>('perspective');
  const [shadingMode, setShadingMode] = useState<RenderShadingMode>('shaded-wireframe');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes] = useState(true);
  const [unit, setUnit] = useState<UnitSystem>('m');

  // History Undo/Redo Manager
  const historyRef = useRef<HistoryManager>(new HistoryManager(50));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Three.js Root Scene Reference for GLTF / STL exports
  const threeSceneRef = useRef<THREE.Scene | null>(null);

  const isCloudConfigured = authService.isConfigured();

  // Update Undo/Redo flags
  const refreshHistoryFlags = useCallback(() => {
    setCanUndo(historyRef.current.canUndo());
    setCanRedo(historyRef.current.canRedo());
  }, []);

  // Push current state to undo history before modifying
  const recordHistory = useCallback(() => {
    historyRef.current.pushState({
      objects,
      rootIds,
      selectedId,
    });
    refreshHistoryFlags();
    setHasUnsavedChanges(true);
  }, [objects, rootIds, selectedId, refreshHistoryFlags]);

  // Check auth and load project list on mount
  useEffect(() => {
    const init = async () => {
      const user = await authService.getCurrentSessionUser();
      setCurrentUser(user);
      const list = await projectService.listProjects(user?.id);
      setProjectList(list);
    };
    init();
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        handleSaveProject();
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'q') {
        setTransformMode('select');
      } else if (e.key.toLowerCase() === 'w') {
        setTransformMode('translate');
      } else if (e.key.toLowerCase() === 'e') {
        setTransformMode('rotate');
      } else if (e.key.toLowerCase() === 'r') {
        setTransformMode('scale');
      } else if (e.key.toLowerCase() === 'g') {
        setShowGrid((prev) => !prev);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          handleDeleteObject(selectedId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Undo Handler
  const handleUndo = useCallback(() => {
    const previous = historyRef.current.undo({
      objects,
      rootIds,
      selectedId,
    });
    if (previous) {
      setObjects(previous.objects);
      setRootIds(previous.rootIds);
      setSelectedId(previous.selectedId);
      refreshHistoryFlags();
      setHasUnsavedChanges(true);
    }
  }, [objects, rootIds, selectedId, refreshHistoryFlags]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    const next = historyRef.current.redo({
      objects,
      rootIds,
      selectedId,
    });
    if (next) {
      setObjects(next.objects);
      setRootIds(next.rootIds);
      setSelectedId(next.selectedId);
      refreshHistoryFlags();
      setHasUnsavedChanges(true);
    }
  }, [objects, rootIds, selectedId, refreshHistoryFlags]);

  // -------------------------------------------------------------
  // CAD Object Actions (Create, Delete, Duplicate, Transform)
  // -------------------------------------------------------------

  const handleAddPrimitive = (type: CADPrimitiveType) => {
    recordHistory();
    const id = `obj-${type}-${Date.now()}`;
    const nameMap: Record<CADPrimitiveType, string> = {
      box: 'Cubo',
      'rect-prism': 'Prisma Rectangular',
      cylinder: 'Cilindro Sólido',
      pipe: 'Tubo Industrial',
      sphere: 'Esfera',
      cone: 'Cono',
      torus: 'Toroide',
      ring: 'Anillo Plano',
      'rect-plate': 'Placa Rectangular',
      'tank-assembly': 'Tanque Ensamblado',
    };

    const initialParams: CADObjectParams =
      type === 'rect-plate'
        ? { width: 3, length: 4, thickness: 0.012 }
        : type === 'pipe'
        ? { outerRadius: 0.6, wallThickness: 0.05, height: 2, radialSegments: 32 }
        : type === 'cylinder'
        ? { radiusTop: 0.8, radiusBottom: 0.8, height: 2, radialSegments: 32 }
        : type === 'box' || type === 'rect-prism'
        ? { width: 2, height: 2, depth: 2 }
        : { width: 2, height: 2, depth: 2 };

    const newNode: CADObjectNode = {
      id,
      name: `${nameMap[type]} #${rootIds.length + 1}`,
      type,
      visible: true,
      locked: false,
      transform: {
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      materialId: 'mat-steel-carbon',
      params: initialParams,
    };

    setObjects((prev) => ({ ...prev, [id]: newNode }));
    setRootIds((prev) => [...prev, id]);
    setSelectedId(id);
  };

  const handleBuildTank = (params: TankAssemblyParams) => {
    recordHistory();
    const rootId = `tank-assembly-${Date.now()}`;
    const { nodes } = generateTankAssembly(rootId, params, 'mat-steel-carbon');

    setObjects((prev) => {
      // Remove previous tank if one existed
      const cleaned = { ...prev };
      rootIds.forEach((rid) => {
        if (cleaned[rid]?.type === 'tank-assembly') {
          if (cleaned[rid].children) {
            cleaned[rid].children?.forEach((cid) => delete cleaned[cid]);
          }
          delete cleaned[rid];
        }
      });
      return { ...cleaned, ...nodes };
    });

    setRootIds((prev) => {
      const filtered = prev.filter((rid) => objects[rid]?.type !== 'tank-assembly');
      return [...filtered, rootId];
    });

    setSelectedId(rootId);
  };

  const handleDeleteObject = (id: string) => {
    const node = objects[id];
    if (!node) return;

    recordHistory();

    setObjects((prev) => {
      const next = { ...prev };
      if (node.children) {
        node.children.forEach((cid) => delete next[cid]);
      }
      delete next[id];
      return next;
    });

    setRootIds((prev) => prev.filter((rid) => rid !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDuplicateObject = (id: string) => {
    const source = objects[id];
    if (!source || source.isSubComponent) return;

    recordHistory();
    const newId = `obj-copy-${Date.now()}`;
    const newNode: CADObjectNode = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: `${source.name} (Copia)`,
      transform: {
        ...source.transform,
        position: [
          source.transform.position[0] + 1.5,
          source.transform.position[1],
          source.transform.position[2] + 1.5,
        ],
      },
    };

    setObjects((prev) => ({ ...prev, [newId]: newNode }));
    setRootIds((prev) => [...prev, newId]);
    setSelectedId(newId);
  };

  const handleRenameObject = (id: string, newName: string) => {
    if (!objects[id]) return;
    recordHistory();
    setObjects((prev) => ({
      ...prev,
      [id]: { ...prev[id], name: newName },
    }));
  };

  const handleToggleVisibility = (id: string) => {
    if (!objects[id]) return;
    setObjects((prev) => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id].visible },
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleLock = (id: string) => {
    if (!objects[id]) return;
    setObjects((prev) => ({
      ...prev,
      [id]: { ...prev[id], locked: !prev[id].locked },
    }));
  };

  const handleChangeTransform = (id: string, newTransform: CADTransform) => {
    if (!objects[id]) return;
    setObjects((prev) => ({
      ...prev,
      [id]: { ...prev[id], transform: newTransform },
    }));
    setHasUnsavedChanges(true);
  };

  const handleChangeParams = (newParams: CADObjectParams) => {
    if (!selectedId || !objects[selectedId]) return;
    recordHistory();

    const current = objects[selectedId];

    // If changing params on a tank-assembly, regenerate all its pieces!
    if (current.type === 'tank-assembly') {
      const { nodes } = generateTankAssembly(current.id, newParams as TankAssemblyParams, current.materialId);
      setObjects((prev) => {
        const next = { ...prev };
        if (current.children) {
          current.children.forEach((cid) => delete next[cid]);
        }
        return { ...next, ...nodes };
      });
    } else {
      setObjects((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], params: newParams },
      }));
    }
  };

  const handleChangeMaterial = (materialId: string) => {
    if (!selectedId || !objects[selectedId]) return;
    recordHistory();
    setObjects((prev) => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], materialId },
    }));
  };

  // -------------------------------------------------------------
  // Project Persistence & Export/Import
  // -------------------------------------------------------------

  const getCurrentSceneState = useCallback((): CADSceneState => {
    return {
      objects,
      rootIds,
      selectedId,
      selectedIds: selectedId ? [selectedId] : [],
      hoveredId: null,
      transformMode,
      snapToGrid,
      gridSnapSize,
      angleSnapDeg,
      viewOrientation,
      shadingMode,
      showGrid,
      showAxes,
      unit,
    };
  }, [
    objects,
    rootIds,
    selectedId,
    transformMode,
    snapToGrid,
    gridSnapSize,
    angleSnapDeg,
    viewOrientation,
    shadingMode,
    showGrid,
    showAxes,
    unit,
  ]);

  const handleSaveProject = async () => {
    setIsSaving(true);
    const sceneState = getCurrentSceneState();
    const bimData = bimModel
      ? {
          model: bimModel,
          views: drawingViews,
          sheets: documentSheets,
        }
      : undefined;
    const nativeProject = serializeNativeProject(
      sceneState,
      currentMetadata,
      [15, 12, 18],
      [0, 4, 0],
      bimData
    );

    const res = await projectService.saveProject(nativeProject, currentUser?.id);
    setIsSaving(false);

    if (res.success) {
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toLocaleTimeString());
      // Refresh list
      const list = await projectService.listProjects(currentUser?.id);
      setProjectList(list);
    } else {
      alert(res.error || 'Error al guardar.');
    }
  };

  const handleExportGLB = () => {
    if (!threeSceneRef.current) {
      alert('La escena 3D no está lista para exportar.');
      return;
    }
    exportSceneToGLTF(threeSceneRef.current, {
      binary: true,
      fileName: currentMetadata.name.toLowerCase().replace(/\s+/g, '_'),
    });
  };

  const handleExportSTL = () => {
    if (!threeSceneRef.current) {
      alert('La escena 3D no está lista para exportar.');
      return;
    }
    exportSceneToSTL(threeSceneRef.current, {
      binary: true,
      fileName: currentMetadata.name.toLowerCase().replace(/\s+/g, '_'),
    });
  };

  const handleExportNative = () => {
    const sceneState = getCurrentSceneState();
    const bimData = bimModel
      ? {
          model: bimModel,
          views: drawingViews,
          sheets: documentSheets,
        }
      : undefined;
    const native = serializeNativeProject(
      sceneState,
      currentMetadata,
      [15, 12, 18],
      [0, 4, 0],
      bimData
    );
    downloadNativeProject(native);
  };

  const handleGenerateTower = (config: Tower30StoryConfig) => {
    recordHistory();
    const tower = generate30StoryOfficeTower(config);
    setObjects(tower.cadNodes);
    setRootIds(tower.rootIds);
    setBimModel(tower.bimModel);
    setDrawingViews(tower.drawingViews);
    setDocumentSheets(tower.documentSheets);
    setSelectedId(null);
    setCurrentMetadata((prev) => ({
      ...prev,
      projectType: 'bim-building',
      name: `Torre Corporativa (${config.totalStoreys} Pisos)`,
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  };

  const handleExportPDF = () => {
    if (!bimModel || documentSheets.length === 0) {
      alert('No hay láminas de documentación disponibles para exportar a PDF.');
      return;
    }
    const sheet = documentSheets[0];
    exportSheetToPDF(sheet, bimModel, drawingViews, currentMetadata.name);
  };

  const handleExportDXF = () => {
    if (!bimModel || !drawingViews || drawingViews.length === 0) {
      alert('No hay planos 2D disponibles para exportar a DXF.');
      return;
    }
    const view = drawingViews.find((v) => v.type === 'floor-plan' && v.name.includes('Tipo')) || drawingViews[0];
    exportViewToDXF(view, bimModel, currentMetadata.name);
  };

  const handleExportIFC = () => {
    if (!bimModel) {
      alert('No hay un modelo BIM paramétrico activo para exportar a IFC.');
      return;
    }
    exportModelToIFC(bimModel, currentMetadata.name);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = deserializeNativeProject(content);

      if (res.success && res.project) {
        loadNativeProjectIntoEditor(res.project);
      } else {
        alert(res.error || 'No se pudo importar el archivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadNativeProjectIntoEditor = (project: NativeProjectFormat) => {
    setCurrentMetadata(project.metadata);
    setObjects(project.scene.objects);
    setRootIds(project.scene.rootIds);
    setUnit(project.scene.unit || 'm');
    setViewOrientation(project.scene.cameraSettings.viewOrientation || 'perspective');
    setShadingMode(project.scene.environment.shadingMode || 'solid');
    setSelectedId(null);
    if (project.bim) {
      setBimModel(project.bim.model);
      setDrawingViews(project.bim.views);
      setDocumentSheets(project.bim.sheets);
    } else {
      setBimModel(null);
      setDrawingViews([]);
      setDocumentSheets([]);
    }
    historyRef.current.clear();
    refreshHistoryFlags();
    setHasUnsavedChanges(false);
    setCurrentView('editor');
  };

  const handleCreateNewProject = (template: 'empty' | 'tank' | 'tower') => {
    historyRef.current.clear();
    refreshHistoryFlags();

    if (template === 'tower') {
      const setup = createInitialTowerProject();
      setCurrentMetadata(setup.metadata);
      setObjects(setup.objects);
      setRootIds(setup.rootIds);
      setBimModel(setup.bimModel);
      setDrawingViews(setup.drawingViews);
      setDocumentSheets(setup.documentSheets);
    } else if (template === 'tank') {
      const setup = createInitialTankProject();
      setCurrentMetadata(setup.metadata);
      setObjects(setup.objects);
      setRootIds(setup.rootIds);
      setBimModel(null);
      setDrawingViews([]);
      setDocumentSheets([]);
    } else {
      setCurrentMetadata({
        id: `proj-empty-${Date.now()}`,
        name: 'Nuevo Proyecto CAD',
        projectType: 'free-cad',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
      });
      setObjects({});
      setRootIds([]);
      setBimModel(null);
      setDrawingViews([]);
      setDocumentSheets([]);
    }

    setSelectedId(null);
    setHasUnsavedChanges(false);
    setCurrentView('editor');
  };

  const handleOpenProjectFromDashboard = async (projectId: string) => {
    const res = await projectService.loadProject(projectId);
    if (res.project) {
      loadNativeProjectIntoEditor(res.project);
    } else {
      alert(res.error || 'No se pudo cargar el proyecto.');
    }
  };

  const handleDeleteProjectFromDashboard = async (projectId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      await projectService.deleteProject(projectId, currentUser?.id);
      const list = await projectService.listProjects(currentUser?.id);
      setProjectList(list);
    }
  };

  const handleDuplicateProjectFromDashboard = async (projectId: string) => {
    const res = await projectService.loadProject(projectId);
    if (res.project) {
      const clone: NativeProjectFormat = JSON.parse(JSON.stringify(res.project));
      clone.metadata.id = `proj-copy-${Date.now()}`;
      clone.metadata.name = `${clone.metadata.name} (Copia)`;
      clone.metadata.createdAt = new Date().toISOString();
      clone.metadata.updatedAt = new Date().toISOString();
      await projectService.saveProject(clone, currentUser?.id);
      const list = await projectService.listProjects(currentUser?.id);
      setProjectList(list);
    }
  };

  const handleRenameProjectFromDashboard = async (projectId: string, newName: string) => {
    const res = await projectService.loadProject(projectId);
    if (res.project) {
      res.project.metadata.name = newName;
      res.project.metadata.updatedAt = new Date().toISOString();
      await projectService.saveProject(res.project, currentUser?.id);
      const list = await projectService.listProjects(currentUser?.id);
      setProjectList(list);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    const list = await projectService.listProjects();
    setProjectList(list);
  };

  const selectedNode = selectedId ? objects[selectedId] || null : null;

  return (
    <div className="app-container">
      {/* 1. Public Landing Page */}
      {currentView === 'landing' && (
        <LandingPage
          onEnterEditor={() => setCurrentView('editor')}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        />
      )}

      {/* 2. Project Dashboard */}
      {currentView === 'dashboard' && (
        <ProjectDashboard
          projects={projectList}
          activeProjectId={currentMetadata.id}
          onOpenProject={handleOpenProjectFromDashboard}
          onCreateNewProject={handleCreateNewProject}
          onDuplicateProject={handleDuplicateProjectFromDashboard}
          onDeleteProject={handleDeleteProjectFromDashboard}
          onRenameProject={handleRenameProjectFromDashboard}
          onImportProject={handleImportFile}
          onBackToEditor={() => setCurrentView('editor')}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
          isCloudConfigured={isCloudConfigured}
        />
      )}

      {/* 3. CAD Workspace Editor */}
      <Navbar
        projectName={currentMetadata.name}
        onRenameProject={(newName) => {
          setCurrentMetadata((prev) => ({ ...prev, name: newName }));
          setHasUnsavedChanges(true);
        }}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveProject}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        hasUnsavedChanges={hasUnsavedChanges}
        isCloudSynced={isCloudConfigured && currentUser !== null}
        viewOrientation={viewOrientation}
        onChangeView={setViewOrientation}
        shadingMode={shadingMode}
        onChangeShading={setShadingMode}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid((prev) => !prev)}
        onExportGLB={handleExportGLB}
        onExportSTL={handleExportSTL}
        onExportNative={handleExportNative}
        onExportPDF={handleExportPDF}
        onExportDXF={handleExportDXF}
        onExportIFC={handleExportIFC}
        onImportFile={handleImportFile}
        onOpenDocumentation={() => setIsDocumentationOpen(true)}
        onOpenDashboard={() => setCurrentView('dashboard')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="workspace-layout">
        {/* Left CAD Tools & Primitives & Component Outliner Tree */}
        <LeftPanel
          objects={objects}
          rootIds={rootIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddPrimitive={handleAddPrimitive}
          onBuildTank={handleBuildTank}
          onGenerateTower={handleGenerateTower}
          onOpenDocumentation={() => setIsDocumentationOpen(true)}
          onExportPDF={handleExportPDF}
          onExportDXF={handleExportDXF}
          onExportIFC={handleExportIFC}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onDeleteObject={handleDeleteObject}
          onDuplicateObject={handleDuplicateObject}
          onRenameObject={handleRenameObject}
        />

        {/* Central 3D Canvas Viewport */}
        <CADCanvas
          objects={objects}
          rootIds={rootIds}
          selectedId={selectedId}
          transformMode={transformMode}
          snapToGrid={snapToGrid}
          gridSnapSize={gridSnapSize}
          angleSnapDeg={angleSnapDeg}
          viewOrientation={viewOrientation}
          shadingMode={shadingMode}
          showGrid={showGrid}
          showAxes={showAxes}
          onSelect={setSelectedId}
          onChangeTransform={handleChangeTransform}
          onSceneReady={(scene) => {
            threeSceneRef.current = scene;
          }}
        />

        {/* Right Inspection & Parametric Dimensions & Material Picker */}
        <RightPanel
          selectedNode={selectedNode}
          onChangeTransform={(t) => selectedId && handleChangeTransform(selectedId, t)}
          onChangeParams={handleChangeParams}
          onChangeMaterial={handleChangeMaterial}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        transformMode={transformMode}
        onChangeTransformMode={setTransformMode}
        selectedCount={selectedId ? 1 : 0}
        selectedName={selectedNode?.name}
        totalObjects={Object.keys(objects).length}
        unit={unit}
        onToggleUnit={() => setUnit((u) => (u === 'm' ? 'mm' : 'm'))}
        snapToGrid={snapToGrid}
      />

      {/* BIM Documentation Sheets & Technical Drawings Modal */}
      {bimModel && (
        <DocumentationModal
          isOpen={isDocumentationOpen}
          onClose={() => setIsDocumentationOpen(false)}
          model={bimModel}
          sheets={documentSheets}
          views={drawingViews}
        />
      )}

      {/* Auth Modal (Real Supabase Auth + Local Server Fallback) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          projectService.listProjects(user.id).then(setProjectList);
        }}
        onOpenSetupGuide={() => {
          setIsAuthOpen(false);
          setIsSetupGuideOpen(true);
        }}
      />

      {/* Supabase Setup Guide Modal */}
      <SupabaseSetupGuide
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />
    </div>
  );
}
