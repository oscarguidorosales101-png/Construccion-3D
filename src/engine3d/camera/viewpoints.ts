import type { ViewOrientation } from '../../types/cad';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<ViewOrientation, CameraPreset> = {
  perspective: {
    position: [14, 11, 16],
    target: [0, 4, 0],
  },
  isometric: {
    position: [16, 16, 16],
    target: [0, 3, 0],
  },
  top: {
    position: [0, 28, 0],
    target: [0, 0, 0],
  },
  front: {
    position: [0, 5, 26],
    target: [0, 5, 0],
  },
  right: {
    position: [26, 5, 0],
    target: [0, 5, 0],
  },
  left: {
    position: [-26, 5, 0],
    target: [0, 5, 0],
  },
};
