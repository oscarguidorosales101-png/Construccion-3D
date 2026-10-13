export type UnitSystem = 'm' | 'mm';

export type TransformMode = 'translate' | 'rotate' | 'scale' | 'select';

export type ViewOrientation = 'perspective' | 'top' | 'front' | 'right' | 'left' | 'isometric';

export type RenderShadingMode = 'solid' | 'wireframe' | 'shaded-wireframe';

export type MaterialCategory = 
  | 'steel' 
  | 'carbon-steel' 
  | 'galvanized' 
  | 'aluminum' 
  | 'painted-metal' 
  | 'concrete' 
  | 'glass' 
  | 'plastic';

export interface CADMaterial {
  id: string;
  name: string;
  category: MaterialCategory;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
  densityKgM3: number; // For engineering weight estimations (e.g. Steel ~ 7850 kg/m³)
  wireframe?: boolean;
}

export type CADPrimitiveType =
  | 'box'
  | 'rect-prism'
  | 'cylinder'
  | 'pipe'
  | 'sphere'
  | 'cone'
  | 'torus'
  | 'ring'
  | 'rect-plate'
  | 'tank-assembly';

export interface BaseObjectParams {
  [key: string]: any;
}

export interface BoxParams extends BaseObjectParams {
  width: number;
  height: number;
  depth: number;
  segmentsX?: number;
  segmentsY?: number;
  segmentsZ?: number;
}

export interface CylinderParams extends BaseObjectParams {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
  openEnded?: boolean;
}

export interface PipeParams extends BaseObjectParams {
  outerRadius: number;
  wallThickness: number;
  height: number;
  radialSegments: number;
}

export interface SphereParams extends BaseObjectParams {
  radius: number;
  widthSegments: number;
  heightSegments: number;
}

export interface ConeParams extends BaseObjectParams {
  radius: number;
  height: number;
  radialSegments: number;
}

export interface TorusParams extends BaseObjectParams {
  radius: number;
  tubeRadius: number;
  radialSegments: number;
  tubularSegments: number;
}

export interface RingParams extends BaseObjectParams {
  innerRadius: number;
  outerRadius: number;
  thetaSegments: number;
}

export interface RectPlateParams extends BaseObjectParams {
  width: number;
  length: number;
  thickness: number;
}

export interface TankNozzleConfig {
  id: string;
  name: string;
  elevation: number; // height from tank base (m)
  azimuthDeg: number; // angle around cylinder (0-360)
  nominalDiameterMm: number; // e.g. 150mm (6") or 600mm (manway)
  projectionLength: number; // how far it sticks out (m)
  hasFlange: boolean;
  type: 'process-nozzle' | 'manway' | 'drain' | 'overflow';
}

export interface TankAssemblyParams extends BaseObjectParams {
  tag: string;
  diameter: number; // in meters (e.g. 10m)
  totalHeight: number; // in meters (e.g. 12m)
  wallThicknessMm: number; // e.g. 8 mm
  coursesCount: number; // Number of shell plate rings (courses) e.g. 5
  platesPerCourse: number; // Number of curved plates per ring e.g. 8
  bottomPlateThicknessMm: number; // e.g. 10 mm
  bottomAnnularExtension: number; // flange sticking out of shell e.g. 0.3m
  roofType: 'conical' | 'flat' | 'dome' | 'open';
  roofSlopePercentage: number; // e.g. 1:16 or 10%
  hasWindGirders: boolean; // stiffener rings
  windGirdersCount: number;
  hasRoofHandrail: boolean;
  hasSpiralStairs: boolean;
  stairWidth: number; // e.g. 0.8m
  stairTurns: number; // number of spiral loops
  hasCleanOutDoor: boolean; // Manhole de limpieza en primer anillo
  nozzles: TankNozzleConfig[];
}

export type CADObjectParams =
  | BoxParams
  | CylinderParams
  | PipeParams
  | SphereParams
  | ConeParams
  | TorusParams
  | RingParams
  | RectPlateParams
  | TankAssemblyParams;

export interface CADTransform {
  position: [number, number, number];
  rotation: [number, number, number]; // Euler in radians
  scale: [number, number, number];
}

export interface CADObjectNode {
  id: string;
  name: string;
  type: CADPrimitiveType;
  parentId?: string;
  visible: boolean;
  locked: boolean;
  transform: CADTransform;
  materialId: string;
  params: CADObjectParams;
  children?: string[]; // IDs of children if it's an assembly
  isSubComponent?: boolean; // If part of a larger parametric assembly (e.g., a specific shell plate)
  subComponentRole?: string; // 'shell-plate' | 'stair-step' | 'roof-cone' | 'nozzle' | etc.
}

export interface CADSceneState {
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
  selectedId: string | null;
  selectedIds: string[];
  hoveredId: string | null;
  transformMode: TransformMode;
  snapToGrid: boolean;
  gridSnapSize: number; // in meters
  angleSnapDeg: number; // e.g. 15 deg
  viewOrientation: ViewOrientation;
  shadingMode: RenderShadingMode;
  showGrid: boolean;
  showAxes: boolean;
  unit: UnitSystem;
}
