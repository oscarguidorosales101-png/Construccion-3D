import type { DrawingView2D, BIMBuildingModel } from '../../types/bim';

/**
 * Returns genuine AutoCAD ASCII DXF string
 */
export function generateDXFString(view: DrawingView2D, model: BIMBuildingModel): string {
  const lines: string[] = [];

  // DXF Header
  lines.push('0', 'SECTION', '2', 'HEADER');
  lines.push('9', '$ACADVER', '1', 'AC1009'); // AutoCAD Release 12 / 2000 compatible
  lines.push('9', '$INSUNITS', '70', '6'); // 6 = Meters
  lines.push('0', 'ENDSEC');

  // DXF Tables & Layers
  lines.push('0', 'SECTION', '2', 'TABLES');
  lines.push('0', 'TABLE', '2', 'LAYER', '70', '6');

  // Define Standard Architectural Layers (AIA CAD Layer Guidelines)
  const layerDefs = [
    { name: '0', color: 7 },
    { name: 'A-WALL-EXTR', color: 4 }, // Cyan
    { name: 'A-WALL-CORE', color: 1 }, // Red
    { name: 'A-COLS', color: 2 }, // Yellow
    { name: 'A-GLAZ', color: 5 }, // Blue
    { name: 'A-DOOR', color: 3 }, // Green
    { name: 'A-GRID', color: 8 }, // Gray
    { name: 'A-ANNO-DIMS', color: 30 }, // Orange
    { name: 'A-ANNO-TEXT', color: 7 }, // White
    { name: 'A-TITL', color: 7 },
  ];

  layerDefs.forEach((l) => {
    lines.push('0', 'LAYER', '2', l.name, '70', '0', '62', l.color.toString(), '6', 'CONTINUOUS');
  });

  lines.push('0', 'ENDTAB');
  lines.push('0', 'ENDSEC');

  // DXF Entities Section
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  const halfW = model.footprintWidth / 2; // 18m
  const halfL = model.footprintLength / 2; // 15m
  const coreHalfW = model.coreBounds.width / 2; // 6m
  const coreHalfL = model.coreBounds.length / 2; // 5m

  if (view.type === 'floor-plan') {
    // 1. Perimeter Slabs / Walls (A-WALL-EXTR)
    addDXFLine(lines, -halfW, -halfL, halfW, -halfL, 'A-WALL-EXTR');
    addDXFLine(lines, halfW, -halfL, halfW, halfL, 'A-WALL-EXTR');
    addDXFLine(lines, halfW, halfL, -halfW, halfL, 'A-WALL-EXTR');
    addDXFLine(lines, -halfW, halfL, -halfW, -halfL, 'A-WALL-EXTR');

    // 2. Elevator Core Walls (A-WALL-CORE)
    addDXFLine(lines, -coreHalfW, -coreHalfL, coreHalfW, -coreHalfL, 'A-WALL-CORE');
    addDXFLine(lines, coreHalfW, -coreHalfL, coreHalfW, coreHalfL, 'A-WALL-CORE');
    addDXFLine(lines, coreHalfW, coreHalfL, -coreHalfW, coreHalfL, 'A-WALL-CORE');
    addDXFLine(lines, -coreHalfW, coreHalfL, -coreHalfW, -coreHalfL, 'A-WALL-CORE');

    // 3. Structural Grid (A-GRID)
    const span = model.columnSpan || 6.0;
    const nx = Math.floor(model.footprintWidth / span);
    const nz = Math.floor(model.footprintLength / span);

    for (let i = 0; i <= nx; i++) {
      const gx = -halfW + i * span;
      addDXFLine(lines, gx, -halfL - 2.0, gx, halfL + 2.0, 'A-GRID');
      addDXFText(lines, gx, halfL + 2.5, 0.4, `EJE ${String.fromCharCode(65 + i)}`, 'A-GRID');
    }

    for (let j = 0; j <= nz; j++) {
      const gz = -halfL + j * span;
      addDXFLine(lines, -halfW - 2.0, gz, halfW + 2.0, gz, 'A-GRID');
      addDXFText(lines, -halfW - 3.5, gz, 0.4, `EJE ${j + 1}`, 'A-GRID');
    }

    // 4. Perimeter and Core Columns (A-COLS)
    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= nz; j++) {
        const cx = -halfW + i * span;
        const cz = -halfL + j * span;
        const cSize = 0.8;
        addDXFLine(lines, cx - cSize / 2, cz - cSize / 2, cx + cSize / 2, cz - cSize / 2, 'A-COLS');
        addDXFLine(lines, cx + cSize / 2, cz - cSize / 2, cx + cSize / 2, cz + cSize / 2, 'A-COLS');
        addDXFLine(lines, cx + cSize / 2, cz + cSize / 2, cx - cSize / 2, cz + cSize / 2, 'A-COLS');
        addDXFLine(lines, cx - cSize / 2, cz + cSize / 2, cx - cSize / 2, cz - cSize / 2, 'A-COLS');
      }
    }

    // 5. Associative Dimension Lines (A-ANNO-DIMS)
    const dimY = halfL + 4.0;
    addDXFLine(lines, -halfW, dimY, halfW, dimY, 'A-ANNO-DIMS');
    addDXFLine(lines, -halfW, dimY - 0.5, -halfW, dimY + 0.5, 'A-ANNO-DIMS');
    addDXFLine(lines, halfW, dimY - 0.5, halfW, dimY + 0.5, 'A-ANNO-DIMS');
    addDXFText(lines, 0, dimY + 0.6, 0.5, `${model.footprintWidth.toFixed(2)} m`, 'A-ANNO-DIMS');

    const dimX = halfW + 4.0;
    addDXFLine(lines, dimX, -halfL, dimX, halfL, 'A-ANNO-DIMS');
    addDXFLine(lines, dimX - 0.5, -halfL, dimX + 0.5, -halfL, 'A-ANNO-DIMS');
    addDXFLine(lines, dimX - 0.5, halfL, dimX + 0.5, halfL, 'A-ANNO-DIMS');
    addDXFText(lines, dimX + 0.6, 0, 0.5, `${model.footprintLength.toFixed(2)} m`, 'A-ANNO-DIMS');

    // Title & Scale
    addDXFText(lines, -halfW, -halfL - 5.0, 0.8, `${view.name.toUpperCase()} (ESCALA 1:${view.scale})`, 'A-TITL');
  } else {
    // Section or Elevation DXF
    const totalH = model.totalStoreys * model.floorToFloorHeight;
    // Ground
    addDXFLine(lines, -halfW - 5.0, 0, halfW + 5.0, 0, '0');
    // Building envelope
    addDXFLine(lines, -halfW, 0, halfW, 0, 'A-WALL-EXTR');
    addDXFLine(lines, halfW, 0, halfW, totalH, 'A-WALL-EXTR');
    addDXFLine(lines, halfW, totalH, -halfW, totalH, 'A-WALL-EXTR');
    addDXFLine(lines, -halfW, totalH, -halfW, 0, 'A-WALL-EXTR');

    // Floors lines
    for (let f = 1; f < model.totalStoreys; f++) {
      const elev = f * model.floorToFloorHeight;
      addDXFLine(lines, -halfW, elev, halfW, elev, 'A-GLAZ');
      if (f % 5 === 0 || f === 1) {
        addDXFText(lines, halfW + 1.0, elev, 0.4, `NIVEL +${elev.toFixed(1)} m`, 'A-ANNO-TEXT');
      }
    }

    // Height dimension
    addDXFLine(lines, -halfW - 3.0, 0, -halfW - 3.0, totalH, 'A-ANNO-DIMS');
    addDXFText(lines, -halfW - 5.0, totalH / 2, 0.6, `H = ${totalH.toFixed(2)} m`, 'A-ANNO-DIMS');

    // Title
    addDXFText(lines, -halfW, -4.0, 1.0, `${view.name} (Escala 1:${view.scale})`, 'A-TITL');
  }

  // End Entities and File
  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');

  return lines.join('\n');
}

/**
 * Generates genuine AutoCAD ASCII DXF (Release 12 / 2000 compatible) for architectural floor plans and sections
 */
export function exportViewToDXF(view: DrawingView2D, model: BIMBuildingModel, fileName?: string): void {
  const dxfContent = generateDXFString(view, model);
  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  const outName = `${(fileName || view.name).toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_')}.dxf`;

  triggerDownload(blob, outName);
}

function addDXFLine(
  lines: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  layer: string
) {
  lines.push('0', 'LINE', '8', layer);
  lines.push('10', x1.toFixed(4), '20', y1.toFixed(4), '30', '0.0');
  lines.push('11', x2.toFixed(4), '21', y2.toFixed(4), '31', '0.0');
}

function addDXFText(
  lines: string[],
  x: number,
  y: number,
  height: number,
  text: string,
  layer: string
) {
  lines.push('0', 'TEXT', '8', layer);
  lines.push('10', x.toFixed(4), '20', y.toFixed(4), '30', '0.0');
  lines.push('40', height.toFixed(4));
  lines.push('1', text);
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
