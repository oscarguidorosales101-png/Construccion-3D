import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export interface GLTFExportOptions {
  binary?: boolean; // true = .glb, false = .gltf
  fileName?: string;
}

export function exportSceneToGLTF(scene: THREE.Object3D, options: GLTFExportOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const isBinary = options.binary ?? true;
    const exporter = new GLTFExporter();

    exporter.parse(
      scene,
      (result) => {
        try {
          if (result instanceof ArrayBuffer) {
            saveArrayBufferAsFile(result, `${options.fileName || 'forma3d-model'}.glb`);
          } else {
            const output = JSON.stringify(result, null, 2);
            saveStringAsFile(output, `${options.fileName || 'forma3d-model'}.gltf`, 'application/json');
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        reject(error);
      },
      {
        binary: isBinary,
        embedImages: true,
      }
    );
  });
}

function saveArrayBufferAsFile(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  triggerDownload(blob, fileName);
}

function saveStringAsFile(text: string, fileName: string, mimeType: string) {
  const blob = new Blob([text], { type: mimeType });
  triggerDownload(blob, fileName);
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
