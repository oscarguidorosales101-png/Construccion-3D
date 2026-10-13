import type {
  BIMBuildingModel,
  BuildingStorey,
  BIMElement,
  SlabElement,
  ColumnElement,
  DrawingView2D,
  DocumentSheet,
} from '../../types/bim';
import type { CADObjectNode } from '../../types/cad';

export interface Tower30StoryConfig {
  tag?: string;
  totalStoreys?: number; // 30
  floorHeight?: number; // 3.6 m
  widthX?: number; // 36 m
  lengthZ?: number; // 30 m
  coreWidth?: number; // 12 m
  coreLength?: number; // 10 m
  columnSpan?: number; // 6 m
}

export function generate30StoryOfficeTower(config: Tower30StoryConfig = {}): {
  bimModel: BIMBuildingModel;
  cadNodes: Record<string, CADObjectNode>;
  rootIds: string[];
  drawingViews: DrawingView2D[];
  documentSheets: DocumentSheet[];
} {
  const storeysCount = config.totalStoreys || 30;
  const floorH = config.floorHeight || 3.6;
  const widthX = config.widthX || 36.0;
  const lengthZ = config.lengthZ || 30.0;
  const coreW = config.coreWidth || 12.0;
  const coreL = config.coreLength || 10.0;
  const colSpan = config.columnSpan || 6.0;

  const totalHeight = storeysCount * floorH;

  // 1. Create Building Storeys
  const storeys: BuildingStorey[] = [];
  for (let i = 1; i <= storeysCount; i++) {
    const elev = (i - 1) * floorH;
    let name = `Nivel ${i < 10 ? '0' + i : i}`;
    if (i === 1) name += ' — Vestíbulo de Acceso (Podio)';
    else if (i === 2) name += ' — Mezzanine / Servicios Podio';
    else if (i === storeysCount) name += ' — Cubierta Técnica & Sala de Máquinas';
    else name += ' — Planta Libre de Oficinas';

    storeys.push({
      id: `storey-${i}`,
      floorNumber: i,
      name,
      elevation: elev,
      height: floorH,
      isPodium: i <= 2,
      isTypical: i > 2 && i < storeysCount,
      isRoof: i === storeysCount,
    });
  }

  // 2. Generate BIM Elements
  const bimElements: Record<string, BIMElement> = {};
  const cadNodes: Record<string, CADObjectNode> = {};
  const childIds: string[] = [];
  const rootId = 'tower-building-root';

  // Core central bounds
  const coreBounds = {
    width: coreW,
    length: coreL,
    x: 0,
    z: 0,
  };

  // Generate Storey Slabs, Columns & Perimeter Walls
  for (let i = 1; i <= storeysCount; i++) {
    const s = storeys[i - 1];
    const elev = s.elevation;

    // Floor Slab
    const slabId = `bim-slab-lvl-${i}`;
    const slabElem: SlabElement = {
      id: slabId,
      name: `Losa Hormigón Armado — ${s.name}`,
      type: 'slab',
      storeyId: s.id,
      materialId: 'mat-concrete',
      visible: true,
      locked: false,
      width: widthX,
      length: lengthZ,
      thickness: 0.35,
      elevation: elev,
      position: [0, elev + 0.175, 0],
      slabCategory: i === storeysCount ? 'roof' : i <= 2 ? 'podium' : 'floor',
    };
    bimElements[slabId] = slabElem;
    childIds.push(slabId);

    cadNodes[slabId] = {
      id: slabId,
      name: `Losa e=${slabElem.thickness * 100}cm — Nivel ${i}`,
      type: 'box',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: {
        position: [0, elev + 0.175, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      materialId: 'mat-concrete',
      params: {
        width: widthX,
        height: slabElem.thickness,
        depth: lengthZ,
      },
      isSubComponent: true,
      subComponentRole: 'bim-slab',
    };

    // Structural Concrete Columns for this floor
    const colsX = Math.round(widthX / colSpan) + 1; // 7 columns
    const colsZ = Math.round(lengthZ / colSpan) + 1; // 6 columns
    const halfX = widthX / 2;
    const halfZ = lengthZ / 2;

    for (let cx = 0; cx < colsX; cx++) {
      for (let cz = 0; cz < colsZ; cz++) {
        const posX = -halfX + cx * colSpan;
        const posZ = -halfZ + cz * colSpan;

        // Skip columns inside core cavity
        if (Math.abs(posX) < coreW / 2 - 0.5 && Math.abs(posZ) < coreL / 2 - 0.5) {
          continue;
        }

        const colId = `bim-col-lvl-${i}-x${cx}-z${cz}`;
        const colSize = i <= 5 ? 0.9 : i <= 15 ? 0.75 : 0.6; // Structural column dimension tapering with height
        const colElem: ColumnElement = {
          id: colId,
          name: `Columna C${colSize * 100} — Nivel ${i}`,
          type: 'column',
          storeyId: s.id,
          materialId: 'mat-concrete',
          visible: true,
          locked: false,
          shape: 'rectangular',
          width: colSize,
          depth: colSize,
          height: floorH - 0.35,
          position: [posX, elev + 0.35 + (floorH - 0.35) / 2, posZ],
          baseElevation: elev + 0.35,
        };
        bimElements[colId] = colElem;
        childIds.push(colId);

        cadNodes[colId] = {
          id: colId,
          name: `Columna C${colSize * 100} (X:${posX.toFixed(1)}, Z:${posZ.toFixed(1)})`,
          type: 'box',
          parentId: rootId,
          visible: true,
          locked: false,
          transform: {
            position: [posX, elev + 0.35 + (floorH - 0.35) / 2, posZ],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
          materialId: 'mat-concrete',
          params: {
            width: colSize,
            height: floorH - 0.35,
            depth: colSize,
          },
          isSubComponent: true,
          subComponentRole: 'bim-column',
        };
      }
    }

    // Central Elevator & Service Core Wall for this floor
    const coreId = `bim-core-lvl-${i}`;
    cadNodes[coreId] = {
      id: coreId,
      name: `Núcleo de Circulación & Ascensores — Nivel ${i}`,
      type: 'box',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: {
        position: [0, elev + floorH / 2, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      materialId: 'mat-concrete',
      params: {
        width: coreW,
        height: floorH,
        depth: coreL,
      },
      isSubComponent: true,
      subComponentRole: 'bim-core',
    };
    childIds.push(coreId);

    // Glass Curtain Wall Facade Envelope (Perimeter)
    const facadeId = `bim-facade-lvl-${i}`;
    cadNodes[facadeId] = {
      id: facadeId,
      name: `Muro Cortina de Vidrio Técnico — Nivel ${i}`,
      type: 'box',
      parentId: rootId,
      visible: true,
      locked: false,
      transform: {
        position: [0, elev + 0.35 + (floorH - 0.35) / 2, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      materialId: 'mat-glass',
      params: {
        width: widthX - 0.05,
        height: floorH - 0.35,
        depth: lengthZ - 0.05,
      },
      isSubComponent: true,
      subComponentRole: 'bim-facade',
    };
    childIds.push(facadeId);
  }

  // Entrance Podium Canopy (Marquesina arquitectónica de acceso)
  const canopyId = 'bim-podium-canopy';
  cadNodes[canopyId] = {
    id: canopyId,
    name: 'Marquesina Voladiza de Acceso Principal (Podio)',
    type: 'box',
    parentId: rootId,
    visible: true,
    locked: false,
    transform: {
      position: [0, 4.5, lengthZ / 2 + 3.0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    materialId: 'mat-steel-carbon',
    params: {
      width: 14.0,
      height: 0.3,
      depth: 6.0,
    },
    isSubComponent: true,
    subComponentRole: 'bim-canopy',
  };
  childIds.push(canopyId);

  // Roof Parapet on Level 30
  const parapetId = 'bim-roof-parapet';
  cadNodes[parapetId] = {
    id: parapetId,
    name: 'Parapeto Perimetral de Cubierta (1.40 m)',
    type: 'pipe',
    parentId: rootId,
    visible: true,
    locked: false,
    transform: {
      position: [0, totalHeight + 0.7, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    materialId: 'mat-concrete',
    params: {
      outerRadius: Math.max(widthX, lengthZ) / 2,
      wallThickness: 0.3,
      height: 1.4,
      radialSegments: 4,
    },
    isSubComponent: true,
    subComponentRole: 'bim-parapet',
  };
  childIds.push(parapetId);

  // Mechanical Penthouse on Roof
  const penthouseId = 'bim-roof-penthouse';
  cadNodes[penthouseId] = {
    id: penthouseId,
    name: 'Sala de Máquinas & Chillers de Climatización',
    type: 'box',
    parentId: rootId,
    visible: true,
    locked: false,
    transform: {
      position: [0, totalHeight + 2.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    materialId: 'mat-steel-galvanized',
    params: {
      width: 14.0,
      height: 5.0,
      depth: 12.0,
    },
    isSubComponent: true,
    subComponentRole: 'bim-penthouse',
  };
  childIds.push(penthouseId);

  // Root Node
  cadNodes[rootId] = {
    id: rootId,
    name: `Torre de Oficinas Corporativa (${storeysCount} Pisos — H=${totalHeight.toFixed(1)}m)`,
    type: 'box',
    visible: true,
    locked: false,
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    materialId: 'mat-concrete',
    params: { width: widthX, height: totalHeight, depth: lengthZ },
    children: childIds,
  };

  const bimModel: BIMBuildingModel = {
    id: 'bim-tower-30f',
    name: `Torre de Oficinas Corporativa (${storeysCount} Pisos)`,
    totalStoreys: storeysCount,
    floorToFloorHeight: floorH,
    footprintWidth: widthX,
    footprintLength: lengthZ,
    storeys,
    elements: bimElements,
    coreBounds,
    columnSpan: colSpan,
  };

  // -------------------------------------------------------------
  // 3. Technical 2D Drawing Views
  // -------------------------------------------------------------
  const drawingViews: DrawingView2D[] = [
    {
      id: 'view-plan-lvl-01',
      name: 'Planta de Acceso — Nivel 01 (+0.00 m)',
      type: 'floor-plan',
      storeyId: 'storey-1',
      cutElevation: 1.2,
      scale: 100,
      dimensions: [
        {
          id: 'dim-p1-w',
          start: [-widthX / 2, -lengthZ / 2 - 3],
          end: [widthX / 2, -lengthZ / 2 - 3],
          value: widthX,
          text: `${widthX.toFixed(2)} m (Ancho Total)`,
          offset: 2.0,
          orientation: 'horizontal',
        },
        {
          id: 'dim-p1-l',
          start: [-widthX / 2 - 3, -lengthZ / 2],
          end: [-widthX / 2 - 3, lengthZ / 2],
          value: lengthZ,
          text: `${lengthZ.toFixed(2)} m (Fondo Total)`,
          offset: 2.0,
          orientation: 'vertical',
        },
        {
          id: 'dim-p1-core-w',
          start: [-coreW / 2, 0],
          end: [coreW / 2, 0],
          value: coreW,
          text: `${coreW.toFixed(2)} m (Núcleo Ascensores)`,
          offset: 1.0,
          orientation: 'horizontal',
        },
      ],
    },
    {
      id: 'view-plan-lvl-typical',
      name: 'Planta Arquitectónica Tipo — Niveles 03 a 29 (+10.80 m a +104.40 m)',
      type: 'floor-plan',
      storeyId: 'storey-15',
      cutElevation: 1.2,
      scale: 100,
      dimensions: [
        {
          id: 'dim-pt-w',
          start: [-widthX / 2, -lengthZ / 2 - 2],
          end: [widthX / 2, -lengthZ / 2 - 2],
          value: widthX,
          text: `${widthX.toFixed(2)} m`,
          offset: 1.5,
          orientation: 'horizontal',
        },
        {
          id: 'dim-pt-l',
          start: [-widthX / 2 - 2, -lengthZ / 2],
          end: [-widthX / 2 - 2, lengthZ / 2],
          value: lengthZ,
          text: `${lengthZ.toFixed(2)} m`,
          offset: 1.5,
          orientation: 'vertical',
        },
      ],
    },
    {
      id: 'view-plan-lvl-roof',
      name: 'Planta de Cubierta Técnica — Nivel 30 (+108.00 m)',
      type: 'floor-plan',
      storeyId: `storey-${storeysCount}`,
      cutElevation: 1.5,
      scale: 100,
      dimensions: [
        {
          id: 'dim-pr-w',
          start: [-widthX / 2, -lengthZ / 2 - 2],
          end: [widthX / 2, -lengthZ / 2 - 2],
          value: widthX,
          text: `${widthX.toFixed(2)} m`,
          offset: 1.5,
          orientation: 'horizontal',
        },
      ],
    },
    {
      id: 'view-section-aa',
      name: 'Sección Transversal A-A\' (Eje Central de Núcleo)',
      type: 'section',
      sectionDirection: 'Z',
      sectionCutPos: 0,
      scale: 200,
      dimensions: [
        {
          id: 'dim-sec-total-h',
          start: [-widthX / 2 - 4, 0],
          end: [-widthX / 2 - 4, totalHeight],
          value: totalHeight,
          text: `+${totalHeight.toFixed(2)} m (Altura Total)`,
          offset: 3.0,
          orientation: 'vertical',
        },
        {
          id: 'dim-sec-fl-h',
          start: [widthX / 2 + 4, 0],
          end: [widthX / 2 + 4, floorH],
          value: floorH,
          text: `${floorH.toFixed(2)} m (Entrepiso)`,
          offset: 2.0,
          orientation: 'vertical',
        },
      ],
      levelMarkers: [
        { storeyId: 'storey-1', name: 'Nivel 01 (Acceso)', elevation: 0.0 },
        { storeyId: 'storey-2', name: 'Nivel 02 (Mezzanine)', elevation: 3.6 },
        { storeyId: 'storey-10', name: 'Nivel 10 (Oficinas)', elevation: 32.4 },
        { storeyId: 'storey-20', name: 'Nivel 20 (Oficinas)', elevation: 68.4 },
        { storeyId: 'storey-30', name: 'Nivel 30 (Cubierta)', elevation: 104.4 },
        { storeyId: 'storey-top', name: 'Cota Coronación Penthouse', elevation: totalHeight + 5.0 },
      ],
    },
    {
      id: 'view-elevation-north',
      name: 'Elevación Frontal Norte (Fachada Principal con Marquesina)',
      type: 'elevation',
      elevationAspect: 'north',
      scale: 200,
      dimensions: [
        {
          id: 'dim-elev-w',
          start: [-widthX / 2, -2],
          end: [widthX / 2, -2],
          value: widthX,
          text: `${widthX.toFixed(2)} m`,
          offset: 2.0,
          orientation: 'horizontal',
        },
        {
          id: 'dim-elev-h',
          start: [widthX / 2 + 3, 0],
          end: [widthX / 2 + 3, totalHeight],
          value: totalHeight,
          text: `+${totalHeight.toFixed(2)} m`,
          offset: 2.0,
          orientation: 'vertical',
        },
      ],
    },
    {
      id: 'view-elevation-west',
      name: 'Elevación Lateral Oeste (Fachada de Muro Cortina)',
      type: 'elevation',
      elevationAspect: 'west',
      scale: 200,
      dimensions: [
        {
          id: 'dim-elev-w-l',
          start: [-lengthZ / 2, -2],
          end: [lengthZ / 2, -2],
          value: lengthZ,
          text: `${lengthZ.toFixed(2)} m`,
          offset: 2.0,
          orientation: 'horizontal',
        },
      ],
    },
  ];

  // -------------------------------------------------------------
  // 4. Document Sheets (Láminas Técnicas de Planos)
  // -------------------------------------------------------------
  const documentSheets: DocumentSheet[] = [
    {
      id: 'sheet-arq-01',
      sheetNumber: 'LÁMINA ARQ-01',
      title: 'Planta de Acceso, Elevación Frontal & Ficha General',
      paperSize: 'A1',
      orientation: 'landscape',
      titleBlock: {
        projectName: 'Torre de Oficinas Corporativa (30 Pisos)',
        buildingType: 'Edificio de Uso Terciario y Oficinas',
        sheetTitle: 'PLANTA NIVEL 01 & ELEVACIÓN NORTE',
        sheetNumber: 'ARQ-01',
        scaleText: '1:100 / 1:200',
        date: new Date().toLocaleDateString('es-ES'),
        author: 'Departamento Técnico CAD/BIM',
        company: 'FORMA 3D Engineering Platform',
        revision: 'REV-01',
        status: 'Conceptual',
      },
      placedViews: [
        {
          id: 'pv-1',
          viewId: 'view-plan-lvl-01',
          xMm: 45,
          yMm: 50,
          widthMm: 360,
          heightMm: 280,
          title: 'PLANTA NIVEL 01 — ACCESO Y PODIO',
          scaleText: 'Escala 1:100',
        },
        {
          id: 'pv-2',
          viewId: 'view-elevation-north',
          xMm: 440,
          yMm: 50,
          widthMm: 350,
          heightMm: 460,
          title: 'ELEVACIÓN FRONTAL NORTE',
          scaleText: 'Escala 1:200',
        },
      ],
      notes: [
        '1. Cotas expresadas en metros, niveles referidos al N.P.T. ±0.00 m.',
        '2. Estructura principal en pórticos de hormigón armado con núcleo sismorresistente.',
        '3. Fachada modular de vidrio con rotura de puente térmico y montantes de aluminio.',
        '4. Documento conceptual para revisión y coordinación BIM.',
      ],
    },
    {
      id: 'sheet-arq-02',
      sheetNumber: 'LÁMINA ARQ-02',
      title: 'Planta Tipo, Sección Transversal A-A\' & Cuadro de Áreas',
      paperSize: 'A1',
      orientation: 'landscape',
      titleBlock: {
        projectName: 'Torre de Oficinas Corporativa (30 Pisos)',
        buildingType: 'Edificio de Uso Terciario y Oficinas',
        sheetTitle: 'PLANTA TIPO, SECCIÓN A-A\' & CUADRO DE ÁREAS',
        sheetNumber: 'ARQ-02',
        scaleText: '1:100 / 1:200',
        date: new Date().toLocaleDateString('es-ES'),
        author: 'Departamento Técnico CAD/BIM',
        company: 'FORMA 3D Engineering Platform',
        revision: 'REV-01',
        status: 'Conceptual',
      },
      placedViews: [
        {
          id: 'pv-3',
          viewId: 'view-plan-lvl-typical',
          xMm: 45,
          yMm: 50,
          widthMm: 360,
          heightMm: 280,
          title: 'PLANTA ARQUITECTÓNICA TIPO (NIVELES 03-29)',
          scaleText: 'Escala 1:100',
        },
        {
          id: 'pv-4',
          viewId: 'view-section-aa',
          xMm: 440,
          yMm: 50,
          widthMm: 350,
          heightMm: 460,
          title: 'SECCIÓN TRANSVERSAL VERTICAL A-A\'',
          scaleText: 'Escala 1:200',
        },
      ],
      notes: [
        '1. La superficie bruta promedio por planta tipo es de 1,080.00 m².',
        '2. El núcleo central alberga 6 baterías de ascensores de alta velocidad y 2 escaleras de escape presurizadas.',
        '3. Altura libre entre forjados: 3.25 m libre bajo falso techo.',
      ],
    },
  ];

  return {
    bimModel,
    cadNodes,
    rootIds: [rootId],
    drawingViews,
    documentSheets,
  };
}
