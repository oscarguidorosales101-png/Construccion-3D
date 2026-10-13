import React from 'react';
import type { TransformMode, UnitSystem } from '../../../types/cad';
import { MousePointer, Move, RotateCw, Scaling, ShieldCheck } from 'lucide-react';

interface StatusBarProps {
  transformMode: TransformMode;
  onChangeTransformMode: (mode: TransformMode) => void;
  selectedCount: number;
  selectedName?: string;
  totalObjects: number;
  unit: UnitSystem;
  onToggleUnit: () => void;
  snapToGrid: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  transformMode,
  onChangeTransformMode,
  selectedCount,
  selectedName,
  totalObjects,
  unit,
  onToggleUnit,
  snapToGrid,
}) => {
  return (
    <footer
      style={{
        height: '28px',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Left: Transformation tool switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
          Herramienta:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'var(--bg-input)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => onChangeTransformMode('select')}
            style={{
              padding: '2px 6px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: transformMode === 'select' ? 'var(--accent-cad)' : 'var(--text-dim)',
              backgroundColor: transformMode === 'select' ? 'var(--bg-panel)' : 'transparent',
            }}
            title="Seleccionar (Q)"
          >
            <MousePointer size={11} />
            <span>Selección</span>
          </button>

          <button
            onClick={() => onChangeTransformMode('translate')}
            style={{
              padding: '2px 6px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: transformMode === 'translate' ? 'var(--accent-cad)' : 'var(--text-dim)',
              backgroundColor: transformMode === 'translate' ? 'var(--bg-panel)' : 'transparent',
            }}
            title="Mover (W)"
          >
            <Move size={11} />
            <span>Mover</span>
          </button>

          <button
            onClick={() => onChangeTransformMode('rotate')}
            style={{
              padding: '2px 6px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: transformMode === 'rotate' ? 'var(--accent-cad)' : 'var(--text-dim)',
              backgroundColor: transformMode === 'rotate' ? 'var(--bg-panel)' : 'transparent',
            }}
            title="Rotar (E)"
          >
            <RotateCw size={11} />
            <span>Rotar</span>
          </button>

          <button
            onClick={() => onChangeTransformMode('scale')}
            style={{
              padding: '2px 6px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: transformMode === 'scale' ? 'var(--accent-cad)' : 'var(--text-dim)',
              backgroundColor: transformMode === 'scale' ? 'var(--bg-panel)' : 'transparent',
            }}
            title="Escalar (R)"
          >
            <Scaling size={11} />
            <span>Escala</span>
          </button>
        </div>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Selected info */}
        <div>
          {selectedCount === 0 ? (
            <span style={{ color: 'var(--text-dim)' }}>Ningún elemento seleccionado</span>
          ) : (
            <span>
              Seleccionado:{' '}
              <strong style={{ color: 'var(--accent-amber)' }}>{selectedName || `${selectedCount} elementos`}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Right: Engine metrics & Units */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>
          Objetos en escena: <strong style={{ color: 'var(--text-main)' }}>{totalObjects}</strong>
        </span>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle)' }} />

        <span>
          Snap:{' '}
          <strong style={{ color: snapToGrid ? 'var(--accent-cad)' : 'var(--text-dim)' }}>
            {snapToGrid ? 'Activo (0.25 m / 15°)' : 'Desactivado'}
          </strong>
        </span>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Unit Toggle */}
        <button
          onClick={onToggleUnit}
          style={{
            padding: '2px 6px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--accent-cad)',
            cursor: 'pointer',
          }}
          title="Cambiar unidades (m / mm)"
        >
          Unidad: {unit.toUpperCase()}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-success)' }}>
          <ShieldCheck size={12} />
          <span style={{ fontSize: '10px' }}>WebGL 2.0 Activo</span>
        </div>
      </div>
    </footer>
  );
};
