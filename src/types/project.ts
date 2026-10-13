import type { CADObjectNode, UnitSystem, ViewOrientation, RenderShadingMode } from './cad';
import type { BIMBuildingModel, DrawingView2D, DocumentSheet } from './bim';

export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  projectType?: 'bim-building' | 'tank-industrial' | 'free-cad';
  createdAt: string;
  updatedAt: string;
  version: string; // e.g. "1.0.0"
  ownerId?: string;
  thumbnail?: string;
}

export interface NativeProjectFormat {
  formaVersion: string;
  schemaVersion: number;
  metadata: ProjectMetadata;
  scene: {
    unit: UnitSystem;
    objects: Record<string, CADObjectNode>;
    rootIds: string[];
    cameraSettings: {
      position: [number, number, number];
      target: [number, number, number];
      fov: number;
      viewOrientation: ViewOrientation;
    };
    environment: {
      shadingMode: RenderShadingMode;
      gridVisible: boolean;
      axesVisible: boolean;
    };
  };
  bim?: {
    model: BIMBuildingModel;
    views: DrawingView2D[];
    sheets: DocumentSheet[];
  };
}
