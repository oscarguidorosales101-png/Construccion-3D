import React, { useState } from 'react';
import type {
  BIMBuildingModel,
  DocumentSheet,
  DrawingView2D,
} from '../../../types/bim';
import {
  calculateBuildingAreaSchedule,
  calculateBuildingMaterialTakeoff,
  calculateBuildingDoorWindowSchedule,
  renderSVGDrawingView,
} from '../../../engine3d/bim/documentationEngine';
import { exportSheetToPDF } from '../../../services/export/pdfExport';
import { exportViewToDXF } from '../../../services/export/dxfExport';
import { exportModelToIFC } from '../../../services/export/ifcExport';
import {
  FileText,
  FileCode,
  Layers,
  Table,
  Download,
  X,
  Printer,
  Compass,
  CheckCircle,
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: BIMBuildingModel;
  sheets: DocumentSheet[];
  views: DrawingView2D[];
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  model,
  sheets,
  views,
}) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'plans' | 'sections' | 'tables'>('sheets');
  const [selectedSheetId, setSelectedSheetId] = useState<string>(sheets[0]?.id || '');
  const [selectedViewId, setSelectedViewId] = useState<string>(views[0]?.id || '');

  if (!isOpen) return null;

  const currentSheet = sheets.find((s) => s.id === selectedSheetId) || sheets[0];
  const currentView = views.find((v) => v.id === selectedViewId) || views[0];

  // Calculations for BIM Schedules
  const areaSchedule = calculateBuildingAreaSchedule(model);
  const materialTakeoff = calculateBuildingMaterialTakeoff(model);
  const doorWindowSchedule = calculateBuildingDoorWindowSchedule(model);

  const planViews = views.filter((v) => v.type === 'floor-plan');
  const sectionViews = views.filter((v) => v.type === 'section' || v.type === 'elevation');

  const handleExportPDF = () => {
    if (!currentSheet) return;
    exportSheetToPDF(currentSheet, model, views, `${currentSheet.titleBlock.sheetNumber}_${model.name}`);
  };

  const handleExportDXF = () => {
    if (!currentView) return;
    exportViewToDXF(currentView, model, `${currentView.name}_CAD`);
  };

  const handleExportIFC = () => {
    exportModelToIFC(model, `${model.name}_IFC2X3`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: '52px',
          backgroundColor: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={20} style={{ color: 'var(--accent-cad)' }} />
          <span style={{ fontSize: '15px', fontWeight: 700 }}>
            CENTRO DE DOCUMENTACIÓN & PLANOS TÉCNICOS CAD/BIM
          </span>
          <span className="badge badge-cad">Generación Automática 2D/3D</span>
        </div>

        {/* Tab Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setActiveTab('sheets')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: activeTab === 'sheets' ? 'var(--accent-cad)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'sheets' ? 'var(--bg-panel)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Printer size={13} />
            <span>Láminas ({sheets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: activeTab === 'plans' ? 'var(--accent-cad)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'plans' ? 'var(--bg-panel)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Compass size={13} />
            <span>Plantas ({planViews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: activeTab === 'sections' ? 'var(--accent-cad)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'sections' ? 'var(--bg-panel)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers size={13} />
            <span>Secciones & Fachadas ({sectionViews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: activeTab === 'tables' ? 'var(--accent-cad)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'tables' ? 'var(--bg-panel)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Table size={13} />
            <span>Tablas & Cómputos</span>
          </button>
        </div>

        {/* Global Export Buttons & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
            }}
            title="Exportar lámina activa en formato PDF de alta resolución"
          >
            <Download size={13} />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={handleExportDXF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent-cad)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
            }}
            title="Exportar vista a plano vectorial AutoCAD DXF"
          >
            <FileCode size={13} />
            <span>Exportar DXF</span>
          </button>

          <button
            onClick={handleExportIFC}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
            }}
            title="Exportar modelo completo a formato abierto IFC2X3"
          >
            <CheckCircle size={13} />
            <span>Exportar IFC</span>
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

          <button
            onClick={onClose}
            style={{ padding: '4px', color: 'var(--text-muted)' }}
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sub-selector Sidebar */}
        <aside
          style={{
            width: '260px',
            backgroundColor: 'var(--bg-panel)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            padding: '14px',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            {activeTab === 'sheets' ? 'Láminas Técnicas' : activeTab === 'plans' ? 'Plantas por Piso' : activeTab === 'sections' ? 'Cortes y Fachadas' : 'Listado de Informes'}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
            {activeTab === 'sheets' &&
              sheets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSheetId(s.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    textAlign: 'left',
                    color: selectedSheetId === s.id ? 'var(--accent-cad)' : 'var(--text-main)',
                    backgroundColor: selectedSheetId === s.id ? 'rgba(0, 180, 216, 0.15)' : 'transparent',
                    border: `1px solid ${selectedSheetId === s.id ? 'rgba(0, 180, 216, 0.3)' : 'transparent'}`,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{s.sheetNumber}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{s.title}</div>
                </button>
              ))}

            {activeTab === 'plans' &&
              planViews.map((pv) => (
                <button
                  key={pv.id}
                  onClick={() => setSelectedViewId(pv.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    textAlign: 'left',
                    color: selectedViewId === pv.id ? 'var(--accent-cad)' : 'var(--text-main)',
                    backgroundColor: selectedViewId === pv.id ? 'rgba(0, 180, 216, 0.15)' : 'transparent',
                    border: `1px solid ${selectedViewId === pv.id ? 'rgba(0, 180, 216, 0.3)' : 'transparent'}`,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{pv.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Corte h={pv.cutElevation}m • Escala 1:{pv.scale}</div>
                </button>
              ))}

            {activeTab === 'sections' &&
              sectionViews.map((sv) => (
                <button
                  key={sv.id}
                  onClick={() => setSelectedViewId(sv.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    textAlign: 'left',
                    color: selectedViewId === sv.id ? 'var(--accent-cad)' : 'var(--text-main)',
                    backgroundColor: selectedViewId === sv.id ? 'rgba(0, 180, 216, 0.15)' : 'transparent',
                    border: `1px solid ${selectedViewId === sv.id ? 'rgba(0, 180, 216, 0.3)' : 'transparent'}`,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{sv.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Escala 1:{sv.scale}</div>
                </button>
              ))}

            {activeTab === 'tables' && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Datos generados en tiempo real directamente de la geometría del edificio de 30 pisos.
              </div>
            )}
          </div>
        </aside>

        {/* Center / Right Presentation Canvas */}
        <main style={{ flex: 1, backgroundColor: '#090b0e', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: SHEETS PREVIEW */}
          {activeTab === 'sheets' && currentSheet && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {currentSheet.sheetNumber} — {currentSheet.title}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Formato {currentSheet.paperSize} ({currentSheet.orientation}) • {currentSheet.titleBlock.scaleText}
                  </span>
                </div>
                <button
                  onClick={handleExportPDF}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--accent-cad)',
                    color: '#090b0e',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Printer size={14} />
                  <span>Descargar Lámina PDF Vectorial</span>
                </button>
              </div>

              {/* Sheet Visual Simulation */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #334155',
                  borderRadius: '4px',
                  padding: '24px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
                  color: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* Placed Views Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {currentSheet.placedViews.map((pv) => {
                    const vObj = views.find((v) => v.id === pv.viewId) || views[0];
                    return (
                      <div
                        key={pv.id}
                        style={{
                          border: '1px solid #cbd5e1',
                          padding: '12px',
                          borderRadius: '4px',
                          backgroundColor: '#090b0e',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                          {pv.title} ({pv.scaleText})
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderSVGDrawingView(vObj, model, 420, 260),
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Title Block Box in Sheet Preview */}
                <div
                  style={{
                    border: '1px solid #94a3b8',
                    padding: '12px',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800 }}>FORMA 3D — {currentSheet.titleBlock.projectName}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{currentSheet.titleBlock.sheetTitle}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>{currentSheet.titleBlock.sheetNumber}</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>{currentSheet.titleBlock.date} • {currentSheet.titleBlock.scaleText}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLOOR PLANS & SECTIONS VECTOR VIEWS */}
          {(activeTab === 'plans' || activeTab === 'sections') && currentView && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '850px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{currentView.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Proyección ortogonal vectorial • Escala 1:{currentView.scale}</span>
                </div>
                <button
                  onClick={handleExportDXF}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'rgba(0, 180, 216, 0.15)',
                    border: '1px solid rgba(0, 180, 216, 0.3)',
                    color: 'var(--accent-cad)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FileCode size={14} />
                  <span>Exportar Esta Vista a DXF</span>
                </button>
              </div>

              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                }}
                dangerouslySetInnerHTML={{
                  __html: renderSVGDrawingView(currentView, model, 850, 560),
                }}
              />
            </div>
          )}

          {/* TAB 3: SCHEDULES & TABLES */}
          {activeTab === 'tables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
              {/* Cuadro de Áreas */}
              <div style={{ backgroundColor: 'var(--bg-panel)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-cad)', marginBottom: '10px' }}>
                  CUADRO DE ÁREAS Y SUPERFICIES POR NIVEL
                </h3>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '6px' }}>Nivel / Planta</th>
                      <th style={{ padding: '6px' }}>Superficie Bruta (m²)</th>
                      <th style={{ padding: '6px' }}>Superficie Rentable (m²)</th>
                      <th style={{ padding: '6px' }}>Núcleo & Serv. (m²)</th>
                      <th style={{ padding: '6px' }}>Eficiencia (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaSchedule.rows.slice(0, 10).map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '6px', fontWeight: 600 }}>{r.storeyName}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{r.grossAreaM2}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{r.rentableAreaM2}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{r.coreAreaM2}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cad)' }}>{r.efficiencyPercentage}%</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: 'rgba(0, 180, 216, 0.1)', fontWeight: 700 }}>
                      <td style={{ padding: '8px' }}>TOTAL EDIFICIO (30 NIVELES)</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{areaSchedule.totalGrossAreaM2.toLocaleString()} m²</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{areaSchedule.totalRentableAreaM2.toLocaleString()} m²</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{areaSchedule.totalCoreAreaM2.toLocaleString()} m²</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cad)' }}>{areaSchedule.averageEfficiencyPercentage}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cómputo Métrico de Materiales */}
              <div style={{ backgroundColor: 'var(--bg-panel)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '10px' }}>
                  CÓMPUTO MÉTRICO DE MATERIALES ESTIMADOS
                </h3>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '6px' }}>Material</th>
                      <th style={{ padding: '6px' }}>Categoría</th>
                      <th style={{ padding: '6px' }}>Volumen (m³)</th>
                      <th style={{ padding: '6px' }}>Superficie (m²)</th>
                      <th style={{ padding: '6px' }}>Peso Estimado (t)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialTakeoff.rows.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '6px', fontWeight: 600 }}>{r.materialName}</td>
                        <td style={{ padding: '6px', color: 'var(--text-dim)' }}>{r.category}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{r.volumeM3.toLocaleString()}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{r.areaM2 ? r.areaM2.toLocaleString() : '—'}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                          {(r.estimatedWeightKg / 1000).toLocaleString()} t
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inventario de Puertas y Ventanas */}
              <div style={{ backgroundColor: 'var(--bg-panel)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '10px' }}>
                  INVENTARIO DE PUERTAS Y VENTANAS (CARPINTERÍAS)
                </h3>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '6px' }}>Clave</th>
                      <th style={{ padding: '6px' }}>Tipo</th>
                      <th style={{ padding: '6px' }}>Dimensiones (mm)</th>
                      <th style={{ padding: '6px' }}>Material</th>
                      <th style={{ padding: '6px' }}>Cantidad</th>
                      <th style={{ padding: '6px' }}>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doorWindowSchedule.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '6px', fontWeight: 700, color: 'var(--accent-cad)' }}>{r.tag}</td>
                        <td style={{ padding: '6px' }}>{r.itemType}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{r.widthMm} × {r.heightMm}</td>
                        <td style={{ padding: '6px' }}>{r.material}</td>
                        <td style={{ padding: '6px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.quantity}</td>
                        <td style={{ padding: '6px', color: 'var(--text-dim)' }}>{r.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
