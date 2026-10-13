import type { NativeProjectFormat, ProjectMetadata } from '../../types/project';
import type { CADSceneState } from '../../types/cad';

export const CURRENT_FORMA_VERSION = '1.0.0';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Creates the complete native .forma3d JSON structure from current scene state
 */
export function serializeNativeProject(
  state: CADSceneState,
  metadata: ProjectMetadata,
  cameraPos: [number, number, number] = [15, 12, 18],
  cameraTarget: [number, number, number] = [0, 4, 0]
): NativeProjectFormat {
  return {
    formaVersion: CURRENT_FORMA_VERSION,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    metadata: {
      ...metadata,
      updatedAt: new Date().toISOString(),
    },
    scene: {
      unit: state.unit,
      objects: state.objects,
      rootIds: state.rootIds,
      cameraSettings: {
        position: cameraPos,
        target: cameraTarget,
        fov: 45,
        viewOrientation: state.viewOrientation,
      },
      environment: {
        shadingMode: state.shadingMode,
        gridVisible: state.showGrid,
        axesVisible: state.showAxes,
      },
    },
  };
}

/**
 * Triggers browser download of native .forma3d file
 */
export function downloadNativeProject(project: NativeProjectFormat) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const fileName = `${project.metadata.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'proyecto'}.forma3d`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Validates and parses an uploaded .forma3d JSON string
 */
export function deserializeNativeProject(jsonContent: string): {
  success: boolean;
  project?: NativeProjectFormat;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);

    // Schema validation
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'El archivo no contiene un JSON válido.' };
    }

    if (!parsed.scene || !parsed.scene.objects || !Array.isArray(parsed.scene.rootIds)) {
      return { success: false, error: 'Estructura incompatible: faltan objetos o jerarquía de la escena.' };
    }

    if (!parsed.metadata || !parsed.metadata.name) {
      return { success: false, error: 'Estructura de metadatos incompleta.' };
    }

    return {
      success: true,
      project: parsed as NativeProjectFormat,
    };
  } catch (err) {
    return {
      success: false,
      error: `Error al interpretar el archivo: ${err instanceof Error ? err.message : 'Formato inválido'}`,
    };
  }
}
