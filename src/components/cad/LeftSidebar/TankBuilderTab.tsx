import React, { useState } from 'react';
import type { TankAssemblyParams } from '../../../types/cad';
import { calculateTankMetrics } from '../../../engine3d/parametric/tankGenerator';
import {
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface TankBuilderTabProps {
  initialParams?: Partial<TankAssemblyParams>;
  onBuildTank: (params: TankAssemblyParams) => void;
  activeTankId?: string | null;
}

const DEFAULT_TANK_PARAMS: TankAssemblyParams = {
  tag: 'TK-101',
  diameter: 8.0,
  totalHeight: 10.0,
  wallThicknessMm: 8.0,
  coursesCount: 5,
  platesPerCourse: 6,
  bottomPlateThicknessMm: 10.0,
  bottomAnnularExtension: 0.25,
  roofType: 'conical',
  roofSlopePercentage: 8.0,
  hasWindGirders: true,
  windGirdersCount: 2,
  hasRoofHandrail: true,
  hasSpiralStairs: true,
  stairWidth: 0.8,
  stairTurns: 0.75,
  hasCleanOutDoor: true,
  nozzles: [
    {
      id: 'noz-inlet',
      name: 'N1 - Entrada de Producto',
      elevation: 9.0,
      azimuthDeg: 45,
      nominalDiameterMm: 200,
      projectionLength: 0.45,
      hasFlange: true,
      type: 'process-nozzle',
    },
    {
      id: 'noz-outlet',
      name: 'N2 - Salida / Succión',
      elevation: 0.8,
      azimuthDeg: 180,
      nominalDiameterMm: 250,
      projectionLength: 0.5,
      hasFlange: true,
      type: 'process-nozzle',
    },
    {
      id: 'noz-drain',
      name: 'N3 - Drenaje de Fondo',
      elevation: 0.3,
      azimuthDeg: 270,
      nominalDiameterMm: 100,
      projectionLength: 0.4,
      hasFlange: true,
      type: 'drain',
    },
  ],
};

export const TankBuilderTab: React.FC<TankBuilderTabProps> = ({
  initialParams,
  onBuildTank,
  activeTankId,
}) => {
  const [params, setParams] = useState<TankAssemblyParams>({
    ...DEFAULT_TANK_PARAMS,
    ...initialParams,
  });

  const metrics = calculateTankMetrics(params);

  const updateParam = <K extends keyof TankAssemblyParams>(key: K, val: TankAssemblyParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const handleBuild = () => {
    onBuildTank(params);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Overview Card */}
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
            Constructor de Tanques Industriales
          </span>
          <span className="badge badge-cad">API-650 Style</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Ensamblaje procedural de chapas cilíndricas curvadas, juntas desfasadas, escalera de caracol, anillos de viento y boquillas.
        </p>
      </div>

      {/* Main Parameters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="form-group">
          <label className="form-label">Identificador / Tag</label>
          <input
            type="text"
            value={params.tag}
            onChange={(e) => updateParam('tag', e.target.value)}
            placeholder="TK-101"
          />
        </div>

        {/* Diámetro */}
        <div className="form-group">
          <div className="form-label">
            <span>Diámetro Nominal (D)</span>
            <span className="value-badge">{params.diameter.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="30.0"
            step="0.5"
            value={params.diameter}
            onChange={(e) => updateParam('diameter', parseFloat(e.target.value))}
          />
        </div>

        {/* Altura */}
        <div className="form-group">
          <div className="form-label">
            <span>Altura Total del Manto (H)</span>
            <span className="value-badge">{params.totalHeight.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="24.0"
            step="0.5"
            value={params.totalHeight}
            onChange={(e) => updateParam('totalHeight', parseFloat(e.target.value))}
          />
        </div>

        {/* Espesor y Anillos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="form-group">
            <div className="form-label">
              <span>Espesor Manto</span>
              <span className="value-badge">{params.wallThicknessMm} mm</span>
            </div>
            <input
              type="number"
              min="4"
              max="40"
              value={params.wallThicknessMm}
              onChange={(e) => updateParam('wallThicknessMm', Math.max(4, parseFloat(e.target.value) || 6))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Virolas / Cursos</span>
              <span className="value-badge">{params.coursesCount}</span>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              value={params.coursesCount}
              onChange={(e) => updateParam('coursesCount', Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>

        {/* Placas por virola */}
        <div className="form-group">
          <div className="form-label">
            <span>Placas Curvadas por Virola</span>
            <span className="value-badge">{params.platesPerCourse} placas/anillo</span>
          </div>
          <input
            type="range"
            min="2"
            max="16"
            step="1"
            value={params.platesPerCourse}
            onChange={(e) => updateParam('platesPerCourse', parseInt(e.target.value))}
          />
        </div>

        {/* Techo */}
        <div className="form-group">
          <label className="form-label">Tipo de Techo</label>
          <select
            value={params.roofType}
            onChange={(e) => updateParam('roofType', e.target.value as TankAssemblyParams['roofType'])}
          >
            <option value="conical">Techo Cónico Autoportante</option>
            <option value="dome">Techo Domo Geodésico</option>
            <option value="open">Abierto / Techo Flotante</option>
          </select>
        </div>

        {params.roofType === 'conical' && (
          <div className="form-group">
            <div className="form-label">
              <span>Pendiente del Techo</span>
              <span className="value-badge">{params.roofSlopePercentage}%</span>
            </div>
            <input
              type="range"
              min="4"
              max="20"
              step="1"
              value={params.roofSlopePercentage}
              onChange={(e) => updateParam('roofSlopePercentage', parseInt(e.target.value))}
            />
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* Accesorios Industriales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Accesorios y Seguridad
        </span>

        {/* Escalera de caracol */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '6px 8px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span>Escalera Helicoidal de Caracol</span>
          <input
            type="checkbox"
            checked={params.hasSpiralStairs}
            onChange={(e) => updateParam('hasSpiralStairs', e.target.checked)}
            style={{ width: '15px', height: '15px', accentColor: 'var(--accent-cad)' }}
          />
        </label>

        {/* Barandilla de techo */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '6px 8px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span>Barandilla Perimetral Superior</span>
          <input
            type="checkbox"
            checked={params.hasRoofHandrail}
            onChange={(e) => updateParam('hasRoofHandrail', e.target.checked)}
            style={{ width: '15px', height: '15px', accentColor: 'var(--accent-cad)' }}
          />
        </label>

        {/* Anillos rigidizadores de viento */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '6px 8px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span>Anillos Rigidizadores de Viento</span>
          <input
            type="checkbox"
            checked={params.hasWindGirders}
            onChange={(e) => updateParam('hasWindGirders', e.target.checked)}
            style={{ width: '15px', height: '15px', accentColor: 'var(--accent-cad)' }}
          />
        </label>

        {/* Boca de hombre */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '6px 8px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span>Manhole / Puerta de Limpieza DN900</span>
          <input
            type="checkbox"
            checked={params.hasCleanOutDoor}
            onChange={(e) => updateParam('hasCleanOutDoor', e.target.checked)}
            style={{ width: '15px', height: '15px', accentColor: 'var(--accent-cad)' }}
          />
        </label>
      </div>

      {/* Live Engineering Metrics Calculation */}
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
          <span>Cálculo Paramétrico Estimado</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Volumen Nominal:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {metrics.nominalVolumeM3} m³
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Capacidad:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {(metrics.nominalCapacityLiters / 1000).toFixed(0)} m³ ({metrics.nominalCapacityLiters.toLocaleString()} L)
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Área Chapas:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {metrics.totalPlateAreaM2} m²
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Peso Acero Estimado:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cad)' }}>
              {metrics.estimatedTotalWeightTonnes} ton ({metrics.estimatedTotalWeightKg.toLocaleString()} kg)
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
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
          marginTop: '4px',
        }}
      >
        <Sparkles size={16} />
        <span>{activeTankId ? 'Actualizar Tanque Paramétrico' : 'Construir Ensamble de Tanque'}</span>
      </button>
    </div>
  );
};
