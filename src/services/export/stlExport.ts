import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export interface STLExportOptions {
  binary?: boolean;
  fileName?: string;
}

export function exportSceneToSTL(scene: THREE.Object3D, options: STLExportOptions = {}): void {
  const exporter = new STLExporter();
  const isBinary = options.binary ?? true;

  const result = exporter.parse(scene, { binary: isBinary });

  const fileName = `${options.fileName || 'forma3d-model'}.stl`;

  if (typeof result === 'string') {
    const blob = new Blob([result], { type: 'text/plain' });
    triggerDownload(blob, fileName);
  } else {
    // result is DataView / ArrayBuffer
    const blob = new Blob([result.buffer], { type: 'application/octet-stream' });
    triggerDownload(blob, fileName);
  }
}

function triggerDownload(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
