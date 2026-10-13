import * as THREE from 'three';
import type {
  BoxParams,
  CylinderParams,
  PipeParams,
  SphereParams,
  ConeParams,
  TorusParams,
  RingParams,
  RectPlateParams,
  CADObjectParams,
  CADPrimitiveType,
} from '../../types/cad';

/**
 * Creates a thick cylindrical pipe geometry (outer radius, inner radius = outerRadius - wallThickness)
 */
export function createPipeGeometry(
  outerRadius: number,
  wallThickness: number,
  height: number,
  radialSegments: number = 36
): THREE.BufferGeometry {
  const safeThickness = Math.min(wallThickness, outerRadius * 0.95);
  const innerRadius = Math.max(0.001, outerRadius - safeThickness);

  const shape = new THREE.Shape();
  // Outer circle
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

  // Inner hole (opposite direction to create clean hole)
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: height,
    bevelEnabled: false,
    curveSegments: radialSegments,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center geometry vertically along Y axis
  geom.center();
  // Rotate so height is along Y axis
  geom.rotateX(Math.PI / 2);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates a curved cylindrical plate with radial thickness (used for tank shell plates)
 */
export function createCurvedPlateGeometry(
  radius: number,
  thickness: number,
  height: number,
  arcAngleRad: number,
  radialSegments: number = 16
): THREE.BufferGeometry {
  const innerR = Math.max(0.01, radius);
  const outerR = radius + thickness;

  const shape = new THREE.Shape();
  // Start at inner radius angle 0
  shape.absarc(0, 0, innerR, 0, arcAngleRad, false);
  // Line to outer radius
  const xEndOuter = outerR * Math.cos(arcAngleRad);
  const yEndOuter = outerR * Math.sin(arcAngleRad);
  shape.lineTo(xEndOuter, yEndOuter);
  // Arc back along outer radius
  shape.absarc(0, 0, outerR, arcAngleRad, 0, true);
  // Close inner edge
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: height,
    bevelEnabled: false,
    curveSegments: radialSegments,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Orient so height is along Y axis, centered vertically
  geom.rotateX(Math.PI / 2);
  geom.translate(0, height / 2, 0);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates an annular plate ring (used for tank foundation / annular bottom plates)
 */
export function createAnnularRingGeometry(
  innerRadius: number,
  outerRadius: number,
  thickness: number,
  arcAngleRad: number = Math.PI * 2,
  radialSegments: number = 48
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, 0, arcAngleRad, false);

  if (innerRadius > 0.001) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, arcAngleRad, true);
    shape.holes.push(hole);
  }

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: radialSegments,
  });
  geom.rotateX(Math.PI / 2);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Generates appropriate THREE.BufferGeometry based on primitive type and parameters
 */
export function generatePrimitiveGeometry(
  type: CADPrimitiveType,
  params: CADObjectParams
): THREE.BufferGeometry {
  switch (type) {
    case 'box':
    case 'rect-prism': {
      const p = params as BoxParams;
      const w = Math.max(0.01, p.width || 1);
      const h = Math.max(0.01, p.height || 1);
      const d = Math.max(0.01, p.depth || 1);
      return new THREE.BoxGeometry(w, h, d, p.segmentsX || 1, p.segmentsY || 1, p.segmentsZ || 1);
    }

    case 'rect-plate': {
      const p = params as RectPlateParams;
      const w = Math.max(0.01, p.width || 2);
      const l = Math.max(0.01, p.length || 3);
      const t = Math.max(0.001, p.thickness || 0.01);
      return new THREE.BoxGeometry(w, t, l);
    }

    case 'cylinder': {
      const p = params as CylinderParams;
      const rt = Math.max(0.001, p.radiusTop ?? 0.5);
      const rb = Math.max(0.001, p.radiusBottom ?? 0.5);
      const h = Math.max(0.01, p.height || 1);
      const segs = Math.max(8, p.radialSegments || 32);
      return new THREE.CylinderGeometry(rt, rb, h, segs, 1, p.openEnded || false);
    }

    case 'pipe': {
      const p = params as PipeParams;
      const outerR = Math.max(0.02, p.outerRadius || 0.5);
      const thick = Math.max(0.001, p.wallThickness || 0.05);
      const h = Math.max(0.01, p.height || 1);
      const segs = Math.max(12, p.radialSegments || 32);
      return createPipeGeometry(outerR, thick, h, segs);
    }

    case 'sphere': {
      const p = params as SphereParams;
      const r = Math.max(0.01, p.radius || 0.5);
      const ws = Math.max(8, p.widthSegments || 32);
      const hs = Math.max(6, p.heightSegments || 16);
      return new THREE.SphereGeometry(r, ws, hs);
    }

    case 'cone': {
      const p = params as ConeParams;
      const r = Math.max(0.01, p.radius || 0.5);
      const h = Math.max(0.01, p.height || 1);
      const segs = Math.max(8, p.radialSegments || 32);
      return new THREE.ConeGeometry(r, h, segs);
    }

    case 'torus': {
      const p = params as TorusParams;
      const r = Math.max(0.02, p.radius || 0.5);
      const tr = Math.max(0.005, p.tubeRadius || 0.1);
      const rs = Math.max(6, p.radialSegments || 16);
      const ts = Math.max(12, p.tubularSegments || 32);
      return new THREE.TorusGeometry(r, tr, rs, ts);
    }

    case 'ring': {
      const p = params as RingParams;
      const inR = Math.max(0.01, p.innerRadius || 0.3);
      const outR = Math.max(inR + 0.01, p.outerRadius || 0.6);
      const segs = Math.max(8, p.thetaSegments || 32);
      return new THREE.RingGeometry(inR, outR, segs);
    }

    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}
