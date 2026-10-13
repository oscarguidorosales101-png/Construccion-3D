import * as THREE from 'three';
import type {
  TankAssemblyParams,
  CADObjectNode,
} from '../../types/cad';
import {
  createCurvedPlateGeometry,
  createAnnularRingGeometry,
  createPipeGeometry,
} from './primitiveGenerators';

export interface TankComponentMesh {
  id: string;
  name: string;
  role: string;
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  materialId?: string;
}

/**
 * Builds all parametric subcomponents of an industrial storage tank (API-650 style)
 * Returns individual CADObjectNodes and their procedural geometries
 */
export function generateTankAssembly(
  rootId: string,
  params: TankAssemblyParams,
  baseMaterialId: string
): {
  nodes: Record<string, CADObjectNode>;
  meshes: TankComponentMesh[];
} {
  const nodes: Record<string, CADObjectNode> = {};
  const meshes: TankComponentMesh[] = [];

  const R = Math.max(0.5, params.diameter / 2);
  const H = Math.max(0.5, params.totalHeight);
  const wallThickM = Math.max(0.003, params.wallThicknessMm / 1000);
  const courses = Math.max(1, Math.min(12, Math.round(params.coursesCount)));
  const platesPerCourse = Math.max(2, Math.min(24, Math.round(params.platesPerCourse)));
  const courseHeight = H / courses;
  const plateArcAngle = (Math.PI * 2) / platesPerCourse;

  const childIds: string[] = [];

  // =========================================================================
  // 1. Annular Bottom Plates & Floor (Fondo y Anillo de Base)
  // =========================================================================
  const bottomThickM = Math.max(0.004, params.bottomPlateThicknessMm / 1000);
  const annularExt = Math.max(0.05, params.bottomAnnularExtension || 0.25);
  const bottomId = `${rootId}-bottom-plate`;
  childIds.push(bottomId);

  const bottomGeom = createAnnularRingGeometry(0, R + annularExt, bottomThickM, Math.PI * 2, 64);
  meshes.push({
    id: bottomId,
    name: 'Fondo y Placa Anular de Base',
    role: 'tank-bottom',
    geometry: bottomGeom,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    materialId: 'mat-steel-carbon',
  });

  nodes[bottomId] = {
    id: bottomId,
    name: 'Fondo y Placa Anular de Base',
    type: 'cylinder',
    parentId: rootId,
    visible: true,
    locked: false,
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    materialId: 'mat-steel-carbon',
    params: {
      radiusTop: R + annularExt,
      radiusBottom: R + annularExt,
      height: bottomThickM,
      radialSegments: 64,
    },
    isSubComponent: true,
    subComponentRole: 'tank-bottom',
  };

  // =========================================================================
  // 2. Shell Plate Courses (Virolas / Anillos de Placas Curvadas con Juntas Desfasadas)
  // =========================================================================
  for (let c = 0; c < courses; c++) {
    const courseY = c * courseHeight;
    const courseNum = c + 1;
    // Stagger vertical joints by half a plate arc every alternate course
    const angleOffset = (c % 2 === 1) ? plateArcAngle / 2 : 0;
    // Thickness can taper slightly or stay constant
    const courseThick = wallThickM;

    for (let p = 0; p < platesPerCourse; p++) {
      const plateNum = p + 1;
      const plateId = `${rootId}-course-${courseNum}-plate-${plateNum}`;
      childIds.push(plateId);

      const startAngle = angleOffset + p * plateArcAngle;
      // Slight gap tolerance simulation (0.003 rad) to highlight engineering seams
      const arcWidth = plateArcAngle - 0.004;

      const plateGeom = createCurvedPlateGeometry(R, courseThick, courseHeight - 0.002, arcWidth, 16);
      
      meshes.push({
        id: plateId,
        name: `Virola ${courseNum} — Placa ${plateNum}`,
        role: 'shell-plate',
        geometry: plateGeom,
        position: [0, courseY, 0],
        rotation: [0, startAngle, 0],
        materialId: baseMaterialId,
      });

      nodes[plateId] = {
        id: plateId,
        name: `Virola ${courseNum} — Placa ${plateNum}`,
        type: 'rect-plate',
        parentId: rootId,
        visible: true,
        locked: false,
        transform: { position: [0, courseY, 0], rotation: [0, startAngle, 0], scale: [1, 1, 1] },
        materialId: baseMaterialId,
        params: {
          width: plateArcAngle * R,
          length: courseHeight,
          thickness: courseThick,
        },
        isSubComponent: true,
        subComponentRole: 'shell-plate',
      };
    }
  }

  // =========================================================================
  // 3. Conical / Dome Roof (Techo Cónico Autoportante o Estructurado)
  // =========================================================================
  if (params.roofType === 'conical') {
    const roofId = `${rootId}-roof-cone`;
    childIds.push(roofId);

    const slopeRatio = Math.max(0.03, (params.roofSlopePercentage || 8) / 100);
    const roofApexHeight = R * slopeRatio + 0.3; // Height of the cone apex
    const roofRadius = R + wallThickM + 0.08; // Slight eave overhang
    const roofGeom = new THREE.ConeGeometry(roofRadius, roofApexHeight, 64);
    
    // Cone geometry center in Three.js is at half its height
    const roofY = H + roofApexHeight / 2;

    meshes.push({
      id: roofId,
      name: 'Techo Cónico Autoportante',
      role: 'tank-roof',
      geometry: roofGeom,
      position: [0, roofY, 0],
      rotation: [0, 0, 0],
      materialId: 'mat-paint-white',
    });

    nodes[roofId] = {
      id: roofId,
      name: 'Techo Cónico Autoportante',
      type: 'cone',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: { position: [0, roofY, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      materialId: 'mat-paint-white',
      params: {
        radius: roofRadius,
        height: roofApexHeight,
        radialSegments: 64,
      },
      isSubComponent: true,
      subComponentRole: 'tank-roof',
    };
  } else if (params.roofType === 'dome') {
    const domeId = `${rootId}-roof-dome`;
    childIds.push(domeId);
    const domeRadius = R * 1.05;
    const domeGeom = new THREE.SphereGeometry(domeRadius, 48, 16, 0, Math.PI * 2, 0, Math.PI * 0.28);
    const domeY = H - (domeRadius * Math.cos(Math.PI * 0.28));

    meshes.push({
      id: domeId,
      name: 'Techo Domo Geodésico / Curvo',
      role: 'tank-roof',
      geometry: domeGeom,
      position: [0, domeY, 0],
      rotation: [0, 0, 0],
      materialId: 'mat-paint-white',
    });

    nodes[domeId] = {
      id: domeId,
      name: 'Techo Domo Geodésico / Curvo',
      type: 'sphere',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: { position: [0, domeY, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      materialId: 'mat-paint-white',
      params: { radius: domeRadius, widthSegments: 48, heightSegments: 16 },
      isSubComponent: true,
      subComponentRole: 'tank-roof',
    };
  }

  // =========================================================================
  // 4. Wind Girders / Anillos Rigidizadores de Viento
  // =========================================================================
  if (params.hasWindGirders) {
    const wgCount = Math.max(1, Math.min(4, params.windGirdersCount || 1));
    for (let w = 0; w < wgCount; w++) {
      const wgId = `${rootId}-wind-girder-${w + 1}`;
      childIds.push(wgId);

      // Elevated evenly along upper third
      const wgY = H * (0.55 + (w * 0.35) / Math.max(1, wgCount));
      const girderWidth = 0.22; // 220 mm girder projection
      const girderThick = 0.015; // 15 mm plate

      const wgGeom = createAnnularRingGeometry(R + wallThickM, R + wallThickM + girderWidth, girderThick, Math.PI * 2, 64);
      meshes.push({
        id: wgId,
        name: `Anillo Rigidizador de Viento ${w + 1}`,
        role: 'wind-girder',
        geometry: wgGeom,
        position: [0, wgY, 0],
        rotation: [0, 0, 0],
        materialId: 'mat-steel-carbon',
      });

      nodes[wgId] = {
        id: wgId,
        name: `Anillo Rigidizador de Viento ${w + 1}`,
        type: 'ring',
        parentId: rootId,
        visible: true,
        locked: false,
        transform: { position: [0, wgY, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        materialId: 'mat-steel-carbon',
        params: { innerRadius: R + wallThickM, outerRadius: R + wallThickM + girderWidth, thetaSegments: 64 },
        isSubComponent: true,
        subComponentRole: 'wind-girder',
      };
    }
  }

  // =========================================================================
  // 5. Roof Perimeter Handrail (Barandilla Perimetral Superior)
  // =========================================================================
  if (params.hasRoofHandrail) {
    const handrailId = `${rootId}-roof-handrail`;
    childIds.push(handrailId);

    const railR = R + wallThickM + 0.02;
    const railHeight = 1.05; // 1050 mm standard safety guardrail
    const railTubeR = 0.02; // 40 mm pipe diameter

    // Top circular rail tube
    const railGeom = new THREE.TorusGeometry(railR, railTubeR, 12, 64);
    railGeom.rotateX(Math.PI / 2);

    meshes.push({
      id: handrailId,
      name: 'Barandilla Perimetral de Techo (1050 mm)',
      role: 'handrail',
      geometry: railGeom,
      position: [0, H + railHeight, 0],
      rotation: [0, 0, 0],
      materialId: 'mat-paint-yellow',
    });

    nodes[handrailId] = {
      id: handrailId,
      name: 'Barandilla Perimetral de Techo (1050 mm)',
      type: 'torus',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: { position: [0, H + railHeight, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      materialId: 'mat-paint-yellow',
      params: { radius: railR, tubeRadius: railTubeR, radialSegments: 12, tubularSegments: 64 },
      isSubComponent: true,
      subComponentRole: 'handrail',
    };
  }

  // =========================================================================
  // 6. Helical / Spiral Staircase (Escalera de Caracol Externa con Peldaños)
  // =========================================================================
  if (params.hasSpiralStairs) {
    const stairGroupId = `${rootId}-spiral-stairs`;
    childIds.push(stairGroupId);

    const stairW = Math.max(0.6, Math.min(1.2, params.stairWidth || 0.8));
    const stairR = R + wallThickM + 0.05; // clearance from shell
    const turns = Math.max(0.4, Math.min(2.5, params.stairTurns || 0.75));
    const totalStepCount = Math.max(12, Math.min(60, Math.round(H * 4.5))); // ~220mm riser
    const dTheta = (turns * Math.PI * 2) / totalStepCount;
    const dY = H / totalStepCount;

    // We can group all steps into an optimized merged geometry or a series of treads
    // Building a composite BufferGeometry for all steps of the spiral staircase
    const stepGeometries: THREE.BufferGeometry[] = [];
    const stepDepth = 0.28;
    const stepThick = 0.04;

    for (let s = 0; s < totalStepCount; s++) {
      const stepTheta = s * dTheta;
      const stepY = s * dY;
      const stepCenterR = stairR + stairW / 2;

      const singleStep = new THREE.BoxGeometry(stairW, stepThick, stepDepth);
      singleStep.rotateY(-stepTheta);
      singleStep.translate(
        Math.cos(stepTheta) * stepCenterR,
        stepY + stepThick / 2,
        Math.sin(stepTheta) * stepCenterR
      );
      stepGeometries.push(singleStep);
    }

    // Merge stair steps
    const mergedSteps = mergeBufferGeometries(stepGeometries);
    
    meshes.push({
      id: stairGroupId,
      name: `Escalera Helicoidal Exterior (${totalStepCount} Peldaños)`,
      role: 'spiral-stairs',
      geometry: mergedSteps,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      materialId: 'mat-paint-yellow',
    });

    nodes[stairGroupId] = {
      id: stairGroupId,
      name: `Escalera Helicoidal Exterior (${totalStepCount} Peldaños)`,
      type: 'box',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      materialId: 'mat-paint-yellow',
      params: { width: stairW, height: H, depth: stairR },
      isSubComponent: true,
      subComponentRole: 'spiral-stairs',
    };
  }

  // =========================================================================
  // 7. Clean-Out Manhole Door (Boca de Hombre / Puerta de Limpieza en Curso 1)
  // =========================================================================
  if (params.hasCleanOutDoor) {
    const manholeId = `${rootId}-cleanout-door`;
    childIds.push(manholeId);

    const manholeR = 0.45; // 900 mm nominal cleanout
    const manholeProj = 0.35;
    const manholeElevation = 0.75; // Y = 0.75m above base
    const manholeAngle = 0; // Front facing

    const pipeGeom = createPipeGeometry(manholeR, 0.02, manholeProj, 32);
    // Rotate to face radially outward along +X
    pipeGeom.rotateZ(Math.PI / 2);
    pipeGeom.translate(R + wallThickM + manholeProj / 2, manholeElevation, 0);

    meshes.push({
      id: manholeId,
      name: 'Puerta de Limpieza / Manhole DN900',
      role: 'manway',
      geometry: pipeGeom,
      position: [0, 0, 0],
      rotation: [0, manholeAngle, 0],
      materialId: 'mat-paint-blue',
    });

    nodes[manholeId] = {
      id: manholeId,
      name: 'Puerta de Limpieza / Manhole DN900',
      type: 'pipe',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: { position: [0, 0, 0], rotation: [0, manholeAngle, 0], scale: [1, 1, 1] },
      materialId: 'mat-paint-blue',
      params: { outerRadius: manholeR, wallThickness: 0.02, height: manholeProj, radialSegments: 32 },
      isSubComponent: true,
      subComponentRole: 'manway',
    };
  }

  // =========================================================================
  // 8. Industrial Nozzles with Flanges (Boquillas y Bridas Paramétricas)
  // =========================================================================
  if (params.nozzles && params.nozzles.length > 0) {
    params.nozzles.forEach((noz) => {
      const nozId = `${rootId}-nozzle-${noz.id}`;
      childIds.push(nozId);

      const nozR = Math.max(0.04, (noz.nominalDiameterMm / 2000));
      const nozProj = Math.max(0.2, noz.projectionLength || 0.4);
      const nozAngleRad = (noz.azimuthDeg * Math.PI) / 180;
      const nozElev = Math.min(H - 0.2, Math.max(0.3, noz.elevation));

      // Neck pipe
      const neckGeom = createPipeGeometry(nozR, 0.008, nozProj, 24);
      neckGeom.rotateZ(Math.PI / 2);
      neckGeom.translate(R + wallThickM + nozProj / 2, nozElev, 0);

      meshes.push({
        id: nozId,
        name: `Boquilla ${noz.name} (DN${noz.nominalDiameterMm})`,
        role: 'nozzle',
        geometry: neckGeom,
        position: [0, 0, 0],
        rotation: [0, nozAngleRad, 0],
        materialId: 'mat-paint-blue',
      });

      nodes[nozId] = {
        id: nozId,
        name: `Boquilla ${noz.name} (DN${noz.nominalDiameterMm})`,
        type: 'pipe',
        parentId: rootId,
        visible: true,
        locked: false,
        transform: { position: [0, 0, 0], rotation: [0, nozAngleRad, 0], scale: [1, 1, 1] },
        materialId: 'mat-paint-blue',
        params: { outerRadius: nozR, wallThickness: 0.008, height: nozProj, radialSegments: 24 },
        isSubComponent: true,
        subComponentRole: 'nozzle',
      };
    });
  }

  // =========================================================================
  // 9. Root Assembly Node
  // =========================================================================
  nodes[rootId] = {
    id: rootId,
    name: `Tanque Industrial ${params.tag || 'TK-101'}`,
    type: 'tank-assembly',
    visible: true,
    locked: false,
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    materialId: baseMaterialId,
    params: { ...params },
    children: childIds,
  };

  return { nodes, meshes };
}

/**
 * Utility to merge multiple BufferGeometries into one single geometry
 */
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BoxGeometry(0.1, 0.1, 0.1);
  if (geometries.length === 1) return geometries[0];

  let totalVertices = 0;
  for (const geom of geometries) {
    const pos = geom.getAttribute('position');
    if (pos) totalVertices += pos.count;
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);

  let offset = 0;
  for (const geom of geometries) {
    const pos = geom.getAttribute('position');
    const norm = geom.getAttribute('normal');
    if (pos) {
      positions.set(pos.array, offset * 3);
      if (norm) {
        normals.set(norm.array, offset * 3);
      }
      offset += pos.count;
    }
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.computeVertexNormals();
  return merged;
}

/**
 * Calculates industrial metrics for a tank assembly
 */
export function calculateTankMetrics(params: TankAssemblyParams) {
  const R = params.diameter / 2;
  const H = params.totalHeight;
  const tM = params.wallThicknessMm / 1000;
  
  // Total nominal volume (m3) = PI * R^2 * H
  const nominalVolumeM3 = Math.PI * Math.pow(R, 2) * H;
  
  // Steel plate surface area = Shell area + Bottom area + Roof area
  const shellAreaM2 = 2 * Math.PI * R * H;
  const bottomAreaM2 = Math.PI * Math.pow(R + (params.bottomAnnularExtension || 0.2), 2);
  const roofAreaM2 = Math.PI * R * Math.sqrt(Math.pow(R, 2) + Math.pow(R * 0.08, 2));
  const totalPlateAreaM2 = shellAreaM2 + bottomAreaM2 + roofAreaM2;

  // Approximate steel weight = Area * thickness * 7850 kg/m3
  const shellWeightKg = shellAreaM2 * tM * 7850;
  const bottomWeightKg = bottomAreaM2 * (params.bottomPlateThicknessMm / 1000) * 7850;
  const roofWeightKg = roofAreaM2 * 0.006 * 7850;
  const accessoriesWeightKg = (params.hasSpiralStairs ? 1800 : 0) + (params.hasRoofHandrail ? 450 : 0) + 600;
  
  const estimatedTotalWeightKg = shellWeightKg + bottomWeightKg + roofWeightKg + accessoriesWeightKg;

  return {
    nominalVolumeM3: Math.round(nominalVolumeM3 * 100) / 100,
    nominalCapacityLiters: Math.round(nominalVolumeM3 * 1000),
    shellAreaM2: Math.round(shellAreaM2 * 10) / 10,
    totalPlateAreaM2: Math.round(totalPlateAreaM2 * 10) / 10,
    estimatedTotalWeightKg: Math.round(estimatedTotalWeightKg),
    estimatedTotalWeightTonnes: Math.round((estimatedTotalWeightKg / 1000) * 10) / 10,
  };
}
