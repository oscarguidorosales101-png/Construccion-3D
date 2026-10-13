import React, { useState } from 'react';
import type { Tower30StoryConfig } from '../../../engine3d/bim/towerGenerator';
import {
  Sparkles,
  FileText,
  Printer,
  FileCode,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface BIMBuilderTabProps {
  onGenerateTower: (config: Tower30StoryConfig) => void;
  onOpenDocumentation: () => void;
  onExportPDF: () => void;
  onExportDXF: () => void;
  onExportIFC: () => void;
  totalStoreys: number;
}

export const BIMBuilderTab: React.FC<BIMBuilderTabProps> = ({
  onGenerateTower,
  onOpenDocumentation,
  onExportPDF,
  onExportDXF,
  onExportIFC,
  totalStoreys,
}) => {
  const [storeys, setStoreys] = useState(30);
  const [floorHeight, setFloorHeight] = useState(3.6);
  const [widthX, setWidthX] = useState(36.0);
  const [lengthZ, setLengthZ] = useState(30.0);
  const [coreW] = useState(12.0);
  const [coreL] = useState(10.0);
  const [colSpan] = useState(6.0);

  const totalHeight = storeys * floorHeight;
  const totalGrossArea = widthX * lengthZ * storeys;

  const handleBuild = () => {
    onGenerateTower({
      totalStoreys: storeys,
      floorHeight,
      widthX,
      lengthZ,
      coreWidth: coreW,
      coreLength: coreL,
      columnSpan: colSpan,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Info */}
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: 'rgba(0, 180, 216, 0.08)',
          border: '1px solid rgba(0, 180, 216, 0.25)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cad)' }}>
            Modelado Arquitectónico BIM
          </span>
          <span className="badge badge-cad">LOD 300</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Diseño paramétrico de edificios, losas, columnas, muro cortina, núcleo de ascensores y planos 2D vinculados.
        </p>
      </div>

      {/* Button to open Plans & Documentation */}
      <button
        onClick={onOpenDocumentation}
        style={{
          padding: '10px',
          backgroundColor: 'rgba(0, 180, 216, 0.15)',
          border: '1px solid rgba(0, 180, 216, 0.35)',
          color: 'var(--accent-cad)',
          fontWeight: 700,
          fontSize: '12px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px var(--accent-cad-glow)',
        }}
      >
        <FileText size={16} />
        <span>Ver Planos, Láminas & Cómputos</span>
      </button>

      {/* Building Parameters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Parámetros de la Torre
        </span>

        {/* Niveles / Pisos */}
        <div className="form-group">
          <div className="form-label">
            <span>Número de Pisos / Niveles</span>
            <span className="value-badge">{storeys} Niveles</span>
          </div>
          <input
            type="range"
            min="2"
            max="50"
            step="1"
            value={storeys}
            onChange={(e) => setStoreys(parseInt(e.target.value))}
          />
        </div>

        {/* Altura de Entrepiso */}
        <div className="form-group">
          <div className="form-label">
            <span>Altura de Entrepiso (h)</span>
            <span className="value-badge">{floorHeight.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="2.8"
            max="5.0"
            step="0.1"
            value={floorHeight}
            onChange={(e) => setFloorHeight(parseFloat(e.target.value))}
          />
        </div>

        {/* Dimensiones en Planta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="form-group">
            <div className="form-label">
              <span>Ancho X</span>
              <span className="value-badge">{widthX.toFixed(0)} m</span>
            </div>
            <input
              type="number"
              min="15"
              max="80"
              step="1"
              value={widthX}
              onChange={(e) => setWidthX(parseFloat(e.target.value) || 20)}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Largo Z</span>
              <span className="value-badge">{lengthZ.toFixed(0)} m</span>
            </div>
            <input
              type="number"
              min="15"
              max="80"
              step="1"
              value={lengthZ}
              onChange={(e) => setLengthZ(parseFloat(e.target.value) || 20)}
            />
          </div>
        </div>
      </div>

      {/* Real-time Summary Card */}
      <div
        style={{
          padding: '10px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--accent-amber)' }}>
          <TrendingUp size={13} />
          <span>Dimensiones Globales del Edificio</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Altura Total:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {totalHeight.toFixed(1)} m
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Superficie Bruta:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {totalGrossArea.toLocaleString()} m²
            </div>
          </div>
        </div>
      </div>

      {/* Generate / Regenerate Button */}
      <button
        onClick={handleBuild}
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--accent-cad)',
          color: '#090b0e',
          fontWeight: 700,
          fontSize: '13px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px var(--accent-cad-glow)',
        }}
      >
        <Sparkles size={16} />
        <span>{totalStoreys > 0 ? 'Actualizar Torre de 30 Pisos' : 'Construir Torre de 30 Pisos'}</span>
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* Direct Export Center */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Centro de Exportación Rápida
        </span>

        <button
          onClick={onExportPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: 'var(--text-main)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={13} style={{ color: '#f87171' }} />
            <span>Láminas PDF Vectoriales</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>.pdf</span>
        </button>

        <button
          onClick={onExportDXF}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: 'var(--text-main)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileCode size={13} style={{ color: 'var(--accent-cad)' }} />
            <span>Planos 2D en AutoCAD</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>.dxf</span>
        </button>

        <button
          onClick={onExportIFC}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: 'var(--text-main)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={13} style={{ color: 'var(--accent-success)' }} />
            <span>Modelo Abierto BIM</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>.ifc</span>
        </button>
      </div>
    </div>
  );
};
