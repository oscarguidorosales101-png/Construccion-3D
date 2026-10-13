import type { CADObjectNode, UnitSystem, ViewOrientation, RenderShadingMode } from './cad';

export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
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
}
