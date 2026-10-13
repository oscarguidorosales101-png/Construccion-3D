export type BIMElementType =
  | 'wall'
  | 'slab'
  | 'column'
  | 'beam'
  | 'door'
  | 'window'
  | 'stair'
  | 'curtain-wall'
  | 'space'
  | 'core';

export interface BaseBIMElement {
  id: string;
  name: string;
  type: BIMElementType;
  storeyId: string; // Associated level
  materialId: string;
  visible: boolean;
  locked: boolean;
  isLoadBearing?: boolean;
}

export interface WallOpening {
  id: string;
  type: 'door' | 'window';
  positionAlongWall: number; // Distance from wall start (m)
  width: number; // (m)
  height: number; // (m)
  sillElevation: number; // (m) from floor level
  elementId?: string; // Associated door/window element
}

export interface WallElement extends BaseBIMElement {
  type: 'wall';
  startPoint: [number, number]; // [X, Z] in meters
  endPoint: [number, number]; // [X, Z] in meters
  length: number;
  height: number;
  thickness: number; // e.g. 0.20m (200mm)
  baseElevation: number; // relative to storey
  wallCategory: 'exterior' | 'interior' | 'core' | 'parapet';
  openings: WallOpening[];
}

export interface SlabElement extends BaseBIMElement {
  type: 'slab';
  width: number; // X span
  length: number; // Z span
  thickness: number; // e.g. 0.30m (300mm)
  elevation: number;
  position: [number, number, number]; // Center [X, Y, Z]
  slabCategory: 'floor' | 'roof' | 'podium' | 'balcony';
  penetrations?: { x: number; z: number; width: number; length: number }[]; // Hole for core/stairs
}

export interface ColumnElement extends BaseBIMElement {
  type: 'column';
  shape: 'rectangular' | 'circular';
  width: number; // X dimension
  depth: number; // Z dimension
  height: number;
  position: [number, number, number]; // [X, Y, Z]
  baseElevation: number;
}

export interface DoorElement extends BaseBIMElement {
  type: 'door';
  wallId?: string;
  width: number;
  height: number;
  doorType: 'single' | 'double' | 'sliding' | 'glass';
  swingAngleDeg: number; // 90° for architectural representation
  position: [number, number, number];
  rotationY: number;
}

export interface WindowElement extends BaseBIMElement {
  type: 'window';
  wallId?: string;
  width: number;
  height: number;
  sillElevation: number;
  windowType: 'fixed' | 'operable' | 'curtain';
  position: [number, number, number];
  rotationY: number;
}

export interface SpaceElement extends BaseBIMElement {
  type: 'space';
  tag: string; // e.g. "OFICINA-301"
  functionName: string; // "Área de Oficinas Abiertas", "Vestíbulo", etc.
  areaM2: number;
  perimeterM: number;
  ceilingHeight: number;
  bounds: [number, number, number, number]; // [minX, minZ, maxX, maxZ]
}

export interface BuildingStorey {
  id: string;
  floorNumber: number; // 1, 2, ..., 30
  name: string; // "Nivel 01 - Acceso", "Nivel Tipo 15", "Cubierta Técnica"
  elevation: number; // Global Y height from ground (m)
  height: number; // Floor-to-floor height (m, e.g. 3.6m)
  isPodium?: boolean;
  isTypical?: boolean;
  isRoof?: boolean;
}

export type BIMElement =
  | WallElement
  | SlabElement
  | ColumnElement
  | DoorElement
  | WindowElement
  | SpaceElement;

export interface BIMBuildingModel {
  id: string;
  name: string;
  totalStoreys: number;
  floorToFloorHeight: number;
  footprintWidth: number; // X (e.g. 36m)
  footprintLength: number; // Z (e.g. 30m)
  storeys: BuildingStorey[];
  elements: Record<string, BIMElement>;
  coreBounds: { width: number; length: number; x: number; z: number };
  columnSpan?: number;
}

// -------------------------------------------------------------
// 2D Documentation, Drawing Views & Sheet Layout Types
// -------------------------------------------------------------

export type DrawingViewType =
  | 'floor-plan'
  | 'section'
  | 'elevation'
  | 'axonometric-3d';

export interface DimensionLine2D {
  id: string;
  start: [number, number]; // [X, Y] in meters on the view
  end: [number, number];
  value: number; // in meters or mm
  text: string;
  offset: number; // perpendicular offset distance
  orientation: 'horizontal' | 'vertical' | 'aligned';
}

export interface LevelMarker2D {
  storeyId: string;
  name: string;
  elevation: number; // e.g. +108.00 m
}

export interface DrawingView2D {
  id: string;
  name: string;
  type: DrawingViewType;
  storeyId?: string;
  cutElevation?: number; // 1.20m by default
  sectionDirection?: 'X' | 'Z';
  sectionCutPos?: number;
  elevationAspect?: 'north' | 'south' | 'east' | 'west';
  scale: number; // e.g. 100 for 1:100, 200 for 1:200
  dimensions: DimensionLine2D[];
  levelMarkers?: LevelMarker2D[];
}

export type PaperSize = 'A0' | 'A1' | 'A2' | 'A3' | 'A4';
export type PaperOrientation = 'landscape' | 'portrait';

export interface TitleBlockData {
  projectName: string;
  buildingType: string;
  sheetTitle: string;
  sheetNumber: string; // e.g. "ARQ-01", "ARQ-02"
  scaleText: string; // e.g. "1:100 / 1:200"
  date: string;
  author: string;
  company: string;
  revision: string; // e.g. "REV-A"
  status: 'Para Aprobación' | 'Anteproyecto' | 'Construcción' | 'Conceptual';
}

export interface PlacedViewOnSheet {
  id: string;
  viewId: string;
  xMm: number; // Position on sheet from top-left (mm)
  yMm: number;
  widthMm: number;
  heightMm: number;
  title: string;
  scaleText: string;
}

export interface DocumentSheet {
  id: string;
  sheetNumber: string; // "LÁMINA-01"
  title: string;
  paperSize: PaperSize;
  orientation: PaperOrientation;
  titleBlock: TitleBlockData;
  placedViews: PlacedViewOnSheet[];
  notes: string[];
}

export interface AreaScheduleRow {
  storeyName: string;
  grossAreaM2: number;
  rentableAreaM2: number;
  coreAreaM2: number;
  efficiencyPercentage: number;
}

export interface MaterialTakeoffRow {
  materialName: string;
  category: string;
  volumeM3: number;
  areaM2: number;
  estimatedWeightKg: number;
}

export interface DoorWindowScheduleRow {
  tag: string;
  itemType: 'Puerta' | 'Ventana';
  widthMm: number;
  heightMm: number;
  material: string;
  quantity: number;
  location: string;
}
