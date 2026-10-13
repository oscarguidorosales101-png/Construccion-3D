import React from 'react';
import type { CADTransform } from '../../../types/cad';

interface TransformInspectorProps {
  transform: CADTransform;
  isLocked: boolean;
  onChangeTransform: (newTransform: CADTransform) => void;
}

export const TransformInspector: React.FC<TransformInspectorProps> = ({
  transform,
  isLocked,
  onChangeTransform,
}) => {
  const radToDeg = (rad: number) => Math.round(((rad * 180) / Math.PI) * 10) / 10;
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  const updatePos = (axis: 0 | 1 | 2, val: number) => {
    if (isLocked) return;
    const newPos: [number, number, number] = [...transform.position];
    newPos[axis] = isNaN(val) ? 0 : val;
    onChangeTransform({ ...transform, position: newPos });
  };

  const updateRot = (axis: 0 | 1 | 2, degVal: number) => {
    if (isLocked) return;
    const newRot: [number, number, number] = [...transform.rotation];
    newRot[axis] = isNaN(degVal) ? 0 : degToRad(degVal);
    onChangeTransform({ ...transform, rotation: newRot });
  };

  const updateScale = (axis: 0 | 1 | 2, val: number) => {
    if (isLocked) return;
    const newScale: [number, number, number] = [...transform.scale];
    newScale[axis] = isNaN(val) || val <= 0 ? 0.01 : val;
    onChangeTransform({ ...transform, scale: newScale });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {isLocked && (
        <div style={{ padding: '6px 8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', fontSize: '11px', borderRadius: 'var(--radius-sm)' }}>
          Objeto bloqueado. Desbloquéalo en el árbol CAD para modificar sus coordenadas.
        </div>
      )}

      {/* Position */}
      <div className="form-group">
        <label className="form-label">
          <span>Posición (m)</span>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>X / Y / Z</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {(['X', 'Y', 'Z'] as const).map((axisLabel, idx) => (
            <div key={axisLabel} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: idx === 0 ? '#ef4444' : idx === 1 ? '#22c55e' : '#3b82f6',
                  pointerEvents: 'none',
                }}
              >
                {axisLabel}
              </span>
              <input
                type="number"
                step="0.1"
                disabled={isLocked}
                value={transform.position[idx]}
                onChange={(e) => updatePos(idx as 0 | 1 | 2, parseFloat(e.target.value))}
                style={{ paddingLeft: '18px', width: '100%', fontSize: '11px' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div className="form-group">
        <label className="form-label">
          <span>Rotación (Grados °)</span>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Euler</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {(['X', 'Y', 'Z'] as const).map((axisLabel, idx) => (
            <div key={axisLabel} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: idx === 0 ? '#ef4444' : idx === 1 ? '#22c55e' : '#3b82f6',
                  pointerEvents: 'none',
                }}
              >
                {axisLabel}
              </span>
              <input
                type="number"
                step="5"
                disabled={isLocked}
                value={radToDeg(transform.rotation[idx])}
                onChange={(e) => updateRot(idx as 0 | 1 | 2, parseFloat(e.target.value))}
                style={{ paddingLeft: '18px', width: '100%', fontSize: '11px' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className="form-group">
        <label className="form-label">
          <span>Escala Relativa</span>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Multiplicador</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {(['X', 'Y', 'Z'] as const).map((axisLabel, idx) => (
            <div key={axisLabel} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: idx === 0 ? '#ef4444' : idx === 1 ? '#22c55e' : '#3b82f6',
                  pointerEvents: 'none',
                }}
              >
                {axisLabel}
              </span>
              <input
                type="number"
                step="0.1"
                min="0.01"
                disabled={isLocked}
                value={transform.scale[idx]}
                onChange={(e) => updateScale(idx as 0 | 1 | 2, parseFloat(e.target.value))}
                style={{ paddingLeft: '18px', width: '100%', fontSize: '11px' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
