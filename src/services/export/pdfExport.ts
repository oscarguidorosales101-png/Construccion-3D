import { jsPDF } from 'jspdf';
import type { DocumentSheet, BIMBuildingModel, DrawingView2D } from '../../types/bim';

export function exportSheetToPDF(
  sheet: DocumentSheet,
  model: BIMBuildingModel,
  views: DrawingView2D[],
  fileName?: string
): void {
  // Format sizes in mm:
  // A0: 1189 x 841
  // A1: 841 x 594
  // A2: 594 x 420
  // A3: 420 x 297
  // A4: 297 x 210
  const sizeMap: Record<string, [number, number]> = {
    A0: [1189, 841],
    A1: [841, 594],
    A2: [594, 420],
    A3: [420, 297],
    A4: [297, 210],
  };

  const rawSize = sizeMap[sheet.paperSize] || [841, 594];
  const widthMm = sheet.orientation === 'landscape' ? rawSize[0] : rawSize[1];
  const heightMm = sheet.orientation === 'landscape' ? rawSize[1] : rawSize[0];

  const doc = new jsPDF({
    orientation: sheet.orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  const margin = 15;
  const printableW = widthMm - margin * 2;
  const printableH = heightMm - margin * 2;

  // 1. Sheet Paper Background & Margins
  doc.setFillColor(250, 252, 255);
  doc.rect(0, 0, widthMm, heightMm, 'F');

  // Outer Border Line (thick 0.7mm)
  doc.setDrawColor(20, 25, 35);
  doc.setLineWidth(0.7);
  doc.rect(margin, margin, printableW, printableH);

  // Inner Margins (0.35mm)
  doc.setLineWidth(0.35);
  doc.rect(margin + 2, margin + 2, printableW - 4, printableH - 4);

  // 2. Title Block (Cajetín de Ingeniería / Arquitectura en la esquina inferior derecha)
  const tbW = 220;
  const tbH = 65;
  const tbX = widthMm - margin - 2 - tbW;
  const tbY = heightMm - margin - 2 - tbH;

  doc.setFillColor(240, 244, 250);
  doc.rect(tbX, tbY, tbW, tbH, 'FD');

  // Divider lines inside Title Block
  doc.setLineWidth(0.35);
  doc.line(tbX, tbY + 16, tbX + tbW, tbY + 16);
  doc.line(tbX, tbY + 36, tbX + tbW, tbY + 36);
  doc.line(tbX, tbY + 50, tbX + tbW, tbY + 50);

  doc.line(tbX + 130, tbY + 36, tbX + 130, tbY + tbH);
  doc.line(tbX + 175, tbY + 36, tbX + 175, tbY + tbH);

  // Title Block Typography
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('FORMA 3D — PLATAFORMA CAD/BIM', tbX + 6, tbY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(sheet.titleBlock.company, tbX + 6, tbY + 12);

  // Project Name & Building Type
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(sheet.titleBlock.projectName, tbX + 6, tbY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(sheet.titleBlock.buildingType, tbX + 6, tbY + 30);

  // Sheet Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199); // CAD Cyan
  doc.text(sheet.titleBlock.sheetTitle, tbX + 6, tbY + 44);

  // Metadata: Date, Scale, Author
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`FECHA: ${sheet.titleBlock.date}`, tbX + 6, tbY + 56);
  doc.text(`AUTOR: ${sheet.titleBlock.author}`, tbX + 6, tbY + 61);

  doc.text(`ESCALA: ${sheet.titleBlock.scaleText}`, tbX + 134, tbY + 44);
  doc.text(`ESTADO: ${sheet.titleBlock.status}`, tbX + 134, tbY + 56);

  // Sheet Number Big Stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(sheet.titleBlock.sheetNumber, tbX + 182, tbY + 48);

  doc.setFontSize(8);
  doc.setTextColor(217, 119, 6);
  doc.text(sheet.titleBlock.revision, tbX + 182, tbY + 58);

  // 3. Notes Box
  const notesW = 280;
  const notesX = margin + 8;
  const notesY = heightMm - margin - 2 - 45;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(notesX - 3, notesY - 4, notesW, 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('NOTAS GENERALES DE PROYECTO:', notesX, notesY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  sheet.notes.forEach((note, idx) => {
    doc.text(note, notesX, notesY + 6 + idx * 5);
  });

  // 4. Draw Placed Views Vector Geometry
  sheet.placedViews.forEach((pv) => {
    const vx = pv.xMm;
    const vy = pv.yMm;
    const vw = pv.widthMm;
    const vh = pv.heightMm;

    // View bounding frame
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.rect(vx, vy, vw, vh);

    // View Title Bar
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(pv.title, vx + 4, vy - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(pv.scaleText, vx + vw - 4, vy - 3, { align: 'right' });

    // Drawing content depending on view
    const viewObj = views.find((v) => v.id === pv.viewId);

    if (viewObj?.type === 'floor-plan') {
      drawFloorPlanToPDF(doc, vx, vy, vw, vh, model);
    } else if (viewObj?.type === 'section' || viewObj?.type === 'elevation') {
      drawSectionOrElevationToPDF(doc, vx, vy, vw, vh, model, viewObj.type);
    }
  });

  const outName = `${(fileName || sheet.sheetNumber).toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(outName);
}

function drawFloorPlanToPDF(
  doc: jsPDF,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
  model: BIMBuildingModel
) {
  const margin = 16;
  const drawW = vw - margin * 2;
  const drawH = vh - margin * 2;
  const scale = Math.min(drawW / model.footprintWidth, drawH / model.footprintLength);

  const cx = vx + vw / 2;
  const cy = vy + vh / 2;
  const fpW = model.footprintWidth * scale;
  const fpL = model.footprintLength * scale;
  const coreW = model.coreBounds.width * scale;
  const coreL = model.coreBounds.length * scale;

  // Exterior Slabs & Walls Outline
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.6);
  doc.rect(cx - fpW / 2, cy - fpL / 2, fpW, fpL);

  // Core Walls (Thick black / solid)
  doc.setFillColor(226, 232, 240);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(cx - coreW / 2, cy - coreL / 2, coreW, coreL, 'FD');

  // Core Internal Shafts
  doc.setLineWidth(0.3);
  doc.rect(cx - coreW / 2 + 3, cy - coreL / 2 + 3, coreW / 2 - 5, coreL - 6);
  doc.rect(cx + 2, cy - coreL / 2 + 3, coreW / 2 - 5, coreL - 6);

  // Column Grid
  const colsX = Math.round(model.footprintWidth / 6.0) + 1;
  const colsZ = Math.round(model.footprintLength / 6.0) + 1;
  const colStep = fpW / (colsX - 1);
  const rowStep = fpL / (colsZ - 1);

  doc.setFillColor(71, 85, 105);
  doc.setDrawColor(51, 65, 85);
  const colSz = 0.75 * scale;

  for (let c = 0; c < colsX; c++) {
    for (let r = 0; r < colsZ; r++) {
      const colX = cx - fpW / 2 + c * colStep;
      const colY = cy - fpL / 2 + r * rowStep;

      // Skip inside core
      if (Math.abs(colX - cx) < coreW / 2 - 1 && Math.abs(colY - cy) < coreL / 2 - 1) continue;

      doc.rect(colX - colSz / 2, colY - colSz / 2, colSz, colSz, 'FD');
    }
  }

  // Dimensions
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  const dimY = cy + fpL / 2 + 8;
  doc.line(cx - fpW / 2, dimY, cx + fpW / 2, dimY);
  doc.line(cx - fpW / 2, dimY - 2, cx - fpW / 2, dimY + 2);
  doc.line(cx + fpW / 2, dimY - 2, cx + fpW / 2, dimY + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(217, 119, 6);
  doc.text('36.00 m', cx, dimY + 4, { align: 'center' });
}

function drawSectionOrElevationToPDF(
  doc: jsPDF,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
  model: BIMBuildingModel,
  _type: string
) {
  const margin = 16;
  const drawW = vw - margin * 2;
  const drawH = vh - margin * 2;
  const totalH = model.totalStoreys * model.floorToFloorHeight;

  const scale = Math.min((drawW * 0.7) / model.footprintWidth, drawH / totalH);
  const cx = vx + vw / 2;
  const baseY = vy + vh - margin - 5;
  const bldW = model.footprintWidth * scale;
  const bldH = totalH * scale;

  // Ground line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(vx + 10, baseY, vx + vw - 10, baseY);

  // Tower Envelope
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.5);
  doc.rect(cx - bldW / 2, baseY - bldH, bldW, bldH, 'FD');

  // Slabs Lines
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  for (let s = 1; s <= model.totalStoreys; s++) {
    const sy = baseY - (s - 1) * model.floorToFloorHeight * scale;
    doc.line(cx - bldW / 2, sy, cx + bldW / 2, sy);

    if (s === 1 || s === model.totalStoreys || s % 10 === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`+${((s - 1) * 3.6).toFixed(1)}m`, cx - bldW / 2 - 3, sy + 1, { align: 'right' });
    }
  }

  // Penthouse
  doc.setFillColor(203, 213, 225);
  doc.rect(cx - bldW * 0.2, baseY - bldH - 5 * scale, bldW * 0.4, 5 * scale, 'FD');
}
