import type {
  BIMBuildingModel,
  AreaScheduleRow,
  MaterialTakeoffRow,
  DoorWindowScheduleRow,
  DrawingView2D,
} from '../../types/bim';

/**
 * Calculates building area schedule (Gross area, Usable rentable area, Core area, Efficiency)
 */
export function calculateBuildingAreaSchedule(model: BIMBuildingModel): {
  rows: AreaScheduleRow[];
  totalGrossAreaM2: number;
  totalRentableAreaM2: number;
  totalCoreAreaM2: number;
  averageEfficiencyPercentage: number;
} {
  const rows: AreaScheduleRow[] = [];
  const floorGross = model.footprintWidth * model.footprintLength; // 36 * 30 = 1080 m2
  const coreArea = model.coreBounds.width * model.coreBounds.length; // 12 * 10 = 120 m2

  let totalGross = 0;
  let totalRentable = 0;
  let totalCore = 0;

  model.storeys.forEach((storey) => {
    let gross = floorGross;
    let core = coreArea;
    let rentable = floorGross - coreArea;

    if (storey.isRoof) {
      gross = floorGross;
      rentable = 0; // Roof has 0 rentable area
      core = 168; // Mechanical room
    } else if (storey.isPodium && storey.floorNumber === 1) {
      // Podium entrance lobby
      rentable = floorGross - coreArea - 180; // Public atrium
    }

    const efficiency = gross > 0 ? (rentable / gross) * 100 : 0;

    totalGross += gross;
    totalRentable += rentable;
    totalCore += core;

    rows.push({
      storeyName: storey.name,
      grossAreaM2: Math.round(gross * 10) / 10,
      rentableAreaM2: Math.round(rentable * 10) / 10,
      coreAreaM2: Math.round(core * 10) / 10,
      efficiencyPercentage: Math.round(efficiency * 10) / 10,
    });
  });

  const avgEfficiency = totalGross > 0 ? (totalRentable / totalGross) * 100 : 0;

  return {
    rows,
    totalGrossAreaM2: Math.round(totalGross),
    totalRentableAreaM2: Math.round(totalRentable),
    totalCoreAreaM2: Math.round(totalCore),
    averageEfficiencyPercentage: Math.round(avgEfficiency * 10) / 10,
  };
}

/**
 * Calculates material quantities takeoff (Concrete volume, Steel, Glass envelope area)
 */
export function calculateBuildingMaterialTakeoff(model: BIMBuildingModel): {
  rows: MaterialTakeoffRow[];
  totalVolumeM3: number;
  totalEstimatedWeightTonnes: number;
} {
  const storeys = model.totalStoreys;
  const slabVolPerFloor = model.footprintWidth * model.footprintLength * 0.35; // 378 m3 per slab
  const totalSlabConcreteM3 = slabVolPerFloor * storeys;

  // Columns: ~36 columns per floor * 0.75m * 0.75m * 3.25m * 30 floors
  const totalColumnConcreteM3 = 36 * (0.75 * 0.75) * (model.floorToFloorHeight - 0.35) * storeys;

  // Core walls: perimeter (12+10)*2 * 0.30m thick * 108m height
  const totalCoreConcreteM3 = (model.coreBounds.width * 2 + model.coreBounds.length * 2) * 0.3 * (storeys * model.floorToFloorHeight);

  const totalConcreteM3 = totalSlabConcreteM3 + totalColumnConcreteM3 + totalCoreConcreteM3;
  const concreteWeightTonnes = (totalConcreteM3 * 2400) / 1000;

  // Glass Curtain Wall Facade
  const facadePerimeter = (model.footprintWidth + model.footprintLength) * 2; // (36+30)*2 = 132 m
  const totalHeight = storeys * model.floorToFloorHeight;
  const totalGlassAreaM2 = facadePerimeter * (totalHeight - storeys * 0.35);
  const glassWeightTonnes = (totalGlassAreaM2 * 0.012 * 2500) / 1000;

  // Rebar Structural Steel (approx. 110 kg per m3 of reinforced concrete)
  const rebarSteelWeightTonnes = (totalConcreteM3 * 110) / 1000;

  // Aluminum Mullions
  const aluminumWeightTonnes = (totalGlassAreaM2 * 14) / 1000;

  const rows: MaterialTakeoffRow[] = [
    {
      materialName: 'Hormigón Armado Estructural (H-30)',
      category: 'Estructura Portante',
      volumeM3: Math.round(totalConcreteM3),
      areaM2: Math.round(model.footprintWidth * model.footprintLength * storeys),
      estimatedWeightKg: Math.round(concreteWeightTonnes * 1000),
    },
    {
      materialName: 'Acero Corrugado para Armaduras (B-500S)',
      category: 'Armaduras Estructurales',
      volumeM3: Math.round(rebarSteelWeightTonnes / 7.85),
      areaM2: 0,
      estimatedWeightKg: Math.round(rebarSteelWeightTonnes * 1000),
    },
    {
      materialName: 'Vidrio Laminado Doble Low-E Control Solar',
      category: 'Envolvente / Fachada',
      volumeM3: Math.round(totalGlassAreaM2 * 0.012),
      areaM2: Math.round(totalGlassAreaM2),
      estimatedWeightKg: Math.round(glassWeightTonnes * 1000),
    },
    {
      materialName: 'Montantes de Aluminio Extruido Anodizado',
      category: 'Carpintería de Fachada',
      volumeM3: Math.round(aluminumWeightTonnes / 2.7),
      areaM2: Math.round(totalGlassAreaM2 * 0.15),
      estimatedWeightKg: Math.round(aluminumWeightTonnes * 1000),
    },
  ];

  const totalVol = totalConcreteM3 + totalGlassAreaM2 * 0.012;
  const totalWeight = concreteWeightTonnes + rebarSteelWeightTonnes + glassWeightTonnes + aluminumWeightTonnes;

  return {
    rows,
    totalVolumeM3: Math.round(totalVol),
    totalEstimatedWeightTonnes: Math.round(totalWeight),
  };
}

/**
 * Calculates door and window schedules (Carpinterías)
 */
export function calculateBuildingDoorWindowSchedule(model: BIMBuildingModel): DoorWindowScheduleRow[] {
  const typicalFloors = model.totalStoreys - 2;

  return [
    {
      tag: 'P-01',
      itemType: 'Puerta',
      widthMm: 3600,
      heightMm: 3200,
      material: 'Vidrio Templado con Perfilería Inox',
      quantity: 2,
      location: 'Vestíbulo Acceso Principal (Podio)',
    },
    {
      tag: 'P-02',
      itemType: 'Puerta',
      widthMm: 1800,
      heightMm: 2400,
      material: 'Vidrio Doble Batiente',
      quantity: 4,
      location: 'Acceso Lateral y Salidas de Emergencia Podio',
    },
    {
      tag: 'P-03',
      itemType: 'Puerta',
      widthMm: 1000,
      heightMm: 2100,
      material: 'Acero RF-90 Cortafuego',
      quantity: 2 * model.totalStoreys,
      location: 'Accesos a Escaleras de Evacuación Presurizadas',
    },
    {
      tag: 'P-04',
      itemType: 'Puerta',
      widthMm: 900,
      heightMm: 2100,
      material: 'Madera Enchapada Maciza',
      quantity: 4 * typicalFloors,
      location: 'Baterías de Sanitarios y Cuartos Técnicos',
    },
    {
      tag: 'V-01',
      itemType: 'Ventana',
      widthMm: 1500,
      heightMm: 3250,
      material: 'Módulo de Muro Cortina Unitized',
      quantity: Math.round(((model.footprintWidth + model.footprintLength) * 2 / 1.5) * typicalFloors),
      location: 'Fachada Perimetral Pisos Tipo 03 a 29',
    },
    {
      tag: 'V-02',
      itemType: 'Ventana',
      widthMm: 2000,
      heightMm: 3800,
      material: 'Vidrio Estructural Suspendido Spider',
      quantity: 24,
      location: 'Planta de Acceso y Fachada del Podio',
    },
  ];
}

/**
 * Renders an SVG vector representation of a 2D Drawing View (Floor plan, Section, Elevation)
 */
export function renderSVGDrawingView(
  view: DrawingView2D,
  model: BIMBuildingModel,
  widthPx: number = 700,
  heightPx: number = 500
): string {
  const margin = 50;
  const drawW = widthPx - margin * 2;
  const drawH = heightPx - margin * 2;

  if (view.type === 'floor-plan') {
    // Floor plan projection
    const scaleFactor = Math.min(drawW / (model.footprintWidth * 1.3), drawH / (model.footprintLength * 1.3));
    const centerX = widthPx / 2;
    const centerY = heightPx / 2;

    const fpW = model.footprintWidth * scaleFactor;
    const fpL = model.footprintLength * scaleFactor;
    const coreW = model.coreBounds.width * scaleFactor;
    const coreL = model.coreBounds.length * scaleFactor;

    // Grid coordinates
    const gridCols = 7;
    const gridRows = 6;
    const colStep = fpW / (gridCols - 1);
    const rowStep = fpL / (gridRows - 1);

    let gridLinesSvg = '';
    const startX = centerX - fpW / 2;
    const startY = centerY - fpL / 2;

    // Grid letters & numbers
    for (let c = 0; c < gridCols; c++) {
      const gx = startX + c * colStep;
      const letter = String.fromCharCode(65 + c);
      gridLinesSvg += `
        <line x1="${gx}" y1="${startY - 25}" x2="${gx}" y2="${startY + fpL + 25}" stroke="#2563eb" stroke-dasharray="6,4" stroke-width="0.8" />
        <circle cx="${gx}" cy="${startY - 25}" r="9" fill="#0b0d10" stroke="#2563eb" stroke-width="1.2" />
        <text x="${gx}" y="${startY - 21}" font-size="10" font-family="Inter, sans-serif" font-weight="bold" fill="#38bdf8" text-anchor="middle">${letter}</text>
      `;
    }

    for (let r = 0; r < gridRows; r++) {
      const gy = startY + r * rowStep;
      const num = r + 1;
      gridLinesSvg += `
        <line x1="${startX - 25}" y1="${gy}" x2="${startX + fpW + 25}" y2="${gy}" stroke="#2563eb" stroke-dasharray="6,4" stroke-width="0.8" />
        <circle cx="${startX - 25}" cy="${gy}" r="9" fill="#0b0d10" stroke="#2563eb" stroke-width="1.2" />
        <text x="${startX - 25}" y="${gy + 4}" font-size="10" font-family="Inter, sans-serif" font-weight="bold" fill="#38bdf8" text-anchor="middle">${num}</text>
      `;
    }

    // Concrete columns cut
    let columnsSvg = '';
    const colPx = 0.75 * scaleFactor;
    for (let c = 0; c < gridCols; c++) {
      for (let r = 0; r < gridRows; r++) {
        const cx = startX + c * colStep;
        const cy = startY + r * rowStep;
        // Skip inside core
        if (Math.abs(cx - centerX) < (coreW / 2 - colPx) && Math.abs(cy - centerY) < (coreL / 2 - colPx)) {
          continue;
        }
        columnsSvg += `
          <rect x="${cx - colPx / 2}" y="${cy - colPx / 2}" width="${colPx}" height="${colPx}" fill="#475569" stroke="#94a3b8" stroke-width="1.2" />
        `;
      }
    }

    return `
      <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${widthPx}" height="${heightPx}" fill="#0f1217" />
        <!-- Engineering Grid -->
        <g opacity="0.8">${gridLinesSvg}</g>
        
        <!-- Perimeter Slab & Curtain Wall Outer Line -->
        <rect x="${startX}" y="${startY}" width="${fpW}" height="${fpL}" fill="#171b22" stroke="#38bdf8" stroke-width="2.5" />
        
        <!-- Interior Offset line for Glass Facade -->
        <rect x="${startX + 4}" y="${startY + 4}" width="${fpW - 8}" height="${fpL - 8}" fill="none" stroke="#60a5fa" stroke-width="1" stroke-dasharray="3,3" />

        <!-- Structural Columns Cut -->
        ${columnsSvg}

        <!-- Central Core Walls Cut (Hatched Pattern) -->
        <rect x="${centerX - coreW / 2}" y="${centerY - coreL / 2}" width="${coreW}" height="${coreL}" fill="#1e242d" stroke="#f59e0b" stroke-width="2.5" />
        <!-- Elevator shaft cavities -->
        <rect x="${centerX - coreW / 2 + 8}" y="${centerY - coreL / 2 + 8}" width="${coreW / 2 - 14}" height="${coreL - 16}" fill="#0f1217" stroke="#94a3b8" stroke-width="1" />
        <line x1="${centerX - coreW / 2 + 8}" y1="${centerY - coreL / 2 + 8}" x2="${centerX - 6}" y2="${centerY + coreL / 2 - 8}" stroke="#64748b" stroke-width="0.8" />
        <line x1="${centerX - coreW / 2 + 8}" y1="${centerY + coreL / 2 - 8}" x2="${centerX - 6}" y2="${centerY - coreL / 2 + 8}" stroke="#64748b" stroke-width="0.8" />
        
        <rect x="${centerX + 6}" y="${centerY - coreL / 2 + 8}" width="${coreW / 2 - 14}" height="${coreL - 16}" fill="#0f1217" stroke="#94a3b8" stroke-width="1" />
        <line x1="${centerX + 6}" y1="${centerY - coreL / 2 + 8}" x2="${centerX + coreW / 2 - 8}" y2="${centerY + coreL / 2 - 8}" stroke="#64748b" stroke-width="0.8" />
        <line x1="${centerX + 6}" y1="${centerY + coreL / 2 - 8}" x2="${centerX + coreW / 2 - 8}" y2="${centerY - coreL / 2 + 8}" stroke="#64748b" stroke-width="0.8" />

        <!-- Dimension Strings -->
        <line x1="${startX}" y1="${startY + fpL + 40}" x2="${startX + fpW}" y2="${startY + fpL + 40}" stroke="#f59e0b" stroke-width="1.2" />
        <line x1="${startX}" y1="${startY + fpL + 35}" x2="${startX}" y2="${startY + fpL + 45}" stroke="#f59e0b" stroke-width="1.2" />
        <line x1="${startX + fpW}" y1="${startY + fpL + 35}" x2="${startX + fpW}" y2="${startY + fpL + 45}" stroke="#f59e0b" stroke-width="1.2" />
        <text x="${centerX}" y="${startY + fpL + 54}" font-size="11" font-family="JetBrains Mono, monospace" font-weight="600" fill="#f59e0b" text-anchor="middle">36.00 m</text>

        <line x1="${startX - 40}" y1="${startY}" x2="${startX - 40}" y2="${startY + fpL}" stroke="#f59e0b" stroke-width="1.2" />
        <line x1="${startX - 45}" y1="${startY}" x2="${startX - 35}" y2="${startY}" stroke="#f59e0b" stroke-width="1.2" />
        <line x1="${startX - 45}" y1="${startY + fpL}" x2="${startX - 35}" y2="${startY + fpL}" stroke="#f59e0b" stroke-width="1.2" />
        <text x="${startX - 54}" y="${centerY + 4}" font-size="11" font-family="JetBrains Mono, monospace" font-weight="600" fill="#f59e0b" text-anchor="middle" transform="rotate(-90 ${startX - 54} ${centerY})">30.00 m</text>

        <!-- North Symbol -->
        <g transform="translate(${widthPx - 45}, 45)">
          <circle cx="0" cy="0" r="16" fill="#151921" stroke="#38bdf8" stroke-width="1.5" />
          <polygon points="0,-13 -5,0 0,-4 5,0" fill="#38bdf8" />
          <polygon points="0,13 -5,0 0,4 5,0" fill="#64748b" />
          <text x="0" y="-17" font-size="9" font-family="Inter, sans-serif" font-weight="bold" fill="#38bdf8" text-anchor="middle">N</text>
        </g>

        <!-- View Title & Scale -->
        <text x="${margin}" y="${heightPx - 15}" font-size="13" font-family="Inter, sans-serif" font-weight="bold" fill="#f1f5f9">${view.name}</text>
        <text x="${widthPx - margin}" y="${heightPx - 15}" font-size="11" font-family="JetBrains Mono, monospace" fill="#94a3b8" text-anchor="end">Escala 1:${view.scale}</text>
      </svg>
    `;
  }

  if (view.type === 'section') {
    // Vertical Transverse Section A-A'
    const totalH = model.totalStoreys * model.floorToFloorHeight; // 108m
    const scaleX = (drawW * 0.45) / model.footprintWidth;
    const scaleY = (drawH * 0.85) / totalH;
    const baseX = widthPx / 2;
    const baseY = heightPx - margin - 30;

    const bldW = model.footprintWidth * scaleX;
    const bldH = totalH * scaleY;
    const coreW = model.coreBounds.width * scaleX;

    let slabsSvg = '';
    let levelDatumSvg = '';

    for (let s = 1; s <= model.totalStoreys; s++) {
      const flY = baseY - (s - 1) * model.floorToFloorHeight * scaleY;
      const elevM = (s - 1) * model.floorToFloorHeight;
      // Slab cut line
      slabsSvg += `
        <line x1="${baseX - bldW / 2}" y1="${flY}" x2="${baseX + bldW / 2}" y2="${flY}" stroke="#94a3b8" stroke-width="1.5" />
      `;

      // Level datum marker every 5 floors or floor 1, 2, 30
      if (s === 1 || s === 2 || s % 5 === 0 || s === model.totalStoreys) {
        levelDatumSvg += `
          <g transform="translate(${baseX - bldW / 2 - 25}, ${flY})">
            <line x1="0" y1="0" x2="-35" y2="0" stroke="#f59e0b" stroke-width="1" />
            <polygon points="0,0 -8,-5 -8,5" fill="#f59e0b" />
            <text x="-40" y="-3" font-size="9" font-family="JetBrains Mono, monospace" fill="#f59e0b" text-anchor="end">N+${elevM.toFixed(1)}m</text>
            <text x="-40" y="8" font-size="8" font-family="Inter, sans-serif" fill="#94a3b8" text-anchor="end">Nivel ${s < 10 ? '0' + s : s}</text>
          </g>
        `;
      }
    }

    return `
      <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${widthPx}" height="${heightPx}" fill="#0f1217" />
        
        <!-- Ground Line -->
        <line x1="30" y1="${baseY}" x2="${widthPx - 30}" y2="${baseY}" stroke="#e2e8f0" stroke-width="3" />
        <text x="35" y="${baseY + 16}" font-size="9" font-family="Inter, sans-serif" font-weight="600" fill="#94a3b8">LÍNEA DE TERRENO N.P.T. ±0.00 m</text>

        <!-- Building Envelope & Core Cut -->
        <rect x="${baseX - bldW / 2}" y="${baseY - bldH}" width="${bldW}" height="${bldH}" fill="#13171f" stroke="#38bdf8" stroke-width="2" />
        <!-- Elevator core cut running through center -->
        <rect x="${baseX - coreW / 2}" y="${baseY - bldH}" width="${coreW}" height="${bldH}" fill="#1e242d" stroke="#f59e0b" stroke-width="2" />
        
        <!-- Floor Slabs Cut -->
        ${slabsSvg}

        <!-- Roof Penthouse -->
        <rect x="${baseX - coreW / 2}" y="${baseY - bldH - 5 * scaleY}" width="${coreW}" height="${5 * scaleY}" fill="#334155" stroke="#94a3b8" stroke-width="1.5" />
        
        <!-- Level Datums -->
        ${levelDatumSvg}

        <!-- Total Height Dimension -->
        <line x1="${baseX + bldW / 2 + 35}" y1="${baseY}" x2="${baseX + bldW / 2 + 35}" y2="${baseY - bldH}" stroke="#38bdf8" stroke-width="1.2" />
        <line x1="${baseX + bldW / 2 + 30}" y1="${baseY}" x2="${baseX + bldW / 2 + 40}" y2="${baseY}" stroke="#38bdf8" stroke-width="1.2" />
        <line x1="${baseX + bldW / 2 + 30}" y1="${baseY - bldH}" x2="${baseX + bldW / 2 + 40}" y2="${baseY - bldH}" stroke="#38bdf8" stroke-width="1.2" />
        <text x="${baseX + bldW / 2 + 48}" y="${baseY - bldH / 2}" font-size="11" font-family="JetBrains Mono, monospace" font-weight="600" fill="#38bdf8" text-anchor="middle" transform="rotate(-90 ${baseX + bldW / 2 + 48} ${baseY - bldH / 2})">H = 108.00 m (30 Pisos)</text>

        <!-- View Title & Scale -->
        <text x="${margin}" y="${heightPx - 12}" font-size="13" font-family="Inter, sans-serif" font-weight="bold" fill="#f1f5f9">${view.name}</text>
        <text x="${widthPx - margin}" y="${heightPx - 12}" font-size="11" font-family="JetBrains Mono, monospace" fill="#94a3b8" text-anchor="end">Escala 1:${view.scale}</text>
      </svg>
    `;
  }

  // Default: Elevation View
  const totalH = model.totalStoreys * model.floorToFloorHeight;
  const scaleX = (drawW * 0.45) / model.footprintWidth;
  const scaleY = (drawH * 0.85) / totalH;
  const baseX = widthPx / 2;
  const baseY = heightPx - margin - 30;
  const bldW = model.footprintWidth * scaleX;
  const bldH = totalH * scaleY;

  return `
    <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${widthPx}" height="${heightPx}" fill="#0f1217" />
      <line x1="30" y1="${baseY}" x2="${widthPx - 30}" y2="${baseY}" stroke="#e2e8f0" stroke-width="3" />
      
      <!-- Tower Facade Glazing Grid -->
      <rect x="${baseX - bldW / 2}" y="${baseY - bldH}" width="${bldW}" height="${bldH}" fill="#0d1b2a" stroke="#38bdf8" stroke-width="2" />
      
      <!-- Entrance Canopy at Podium -->
      <polygon points="${baseX - 45},${baseY - 14} ${baseX + 45},${baseY - 14} ${baseX + 55},${baseY - 18} ${baseX - 55},${baseY - 18}" fill="#f59e0b" stroke="#f59e0b" stroke-width="1" />
      <line x1="${baseX - 35}" y1="${baseY}" x2="${baseX - 35}" y2="${baseY - 18}" stroke="#e2e8f0" stroke-width="2" />
      <line x1="${baseX + 35}" y1="${baseY}" x2="${baseX + 35}" y2="${baseY - 18}" stroke="#e2e8f0" stroke-width="2" />

      <!-- Roof Parapet & Mechanical Penthouse -->
      <rect x="${baseX - bldW * 0.35}" y="${baseY - bldH - 12}" width="${bldW * 0.7}" height="12" fill="#334155" stroke="#94a3b8" stroke-width="1.2" />

      <!-- Title & Scale -->
      <text x="${margin}" y="${heightPx - 12}" font-size="13" font-family="Inter, sans-serif" font-weight="bold" fill="#f1f5f9">${view.name}</text>
      <text x="${widthPx - margin}" y="${heightPx - 12}" font-size="11" font-family="JetBrains Mono, monospace" fill="#94a3b8" text-anchor="end">Escala 1:${view.scale}</text>
    </svg>
  `;
}
