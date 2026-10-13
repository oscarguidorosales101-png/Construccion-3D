import React from 'react';
import type { CADObjectNode } from '../../../types/cad';
import { getCADMaterial } from '../../../engine3d/materials/cadMaterials';
import { Scale, Ruler } from 'lucide-react';

interface EngineeringMetricsProps {
  node: CADObjectNode;
}

export const EngineeringMetrics: React.FC<EngineeringMetricsProps> = ({ node }) => {
  const mat = getCADMaterial(node.materialId);

  // Approximate volume calculation based on primitive type
  let volumeM3 = 0.1;
  let surfaceAreaM2 = 0.5;

  const p = node.params;
  const sx = node.transform.scale[0];
  const sy = node.transform.scale[1];
  const sz = node.transform.scale[2];

  switch (node.type) {
    case 'box':
    case 'rect-prism': {
      const w = ((p as { width?: number }).width || 1) * sx;
      const h = ((p as { height?: number }).height || 1) * sy;
      const d = ((p as { depth?: number }).depth || 1) * sz;
      volumeM3 = w * h * d;
      surfaceAreaM2 = 2 * (w * h + h * d + w * d);
      break;
    }
    case 'rect-plate': {
      const w = ((p as { width?: number }).width || 2) * sx;
      const l = ((p as { length?: number }).length || 3) * sz;
      const t = ((p as { thickness?: number }).thickness || 0.01) * sy;
      volumeM3 = w * l * t;
      surfaceAreaM2 = 2 * (w * l + w * t + l * t);
      break;
    }
    case 'cylinder': {
      const r = ((p as { radiusTop?: number }).radiusTop || 0.5) * Math.max(sx, sz);
      const h = ((p as { height?: number }).height || 1) * sy;
      volumeM3 = Math.PI * Math.pow(r, 2) * h;
      surfaceAreaM2 = 2 * Math.PI * r * h + 2 * Math.PI * Math.pow(r, 2);
      break;
    }
    case 'pipe': {
      const ro = ((p as { outerRadius?: number }).outerRadius || 0.5) * Math.max(sx, sz);
      const thick = ((p as { wallThickness?: number }).wallThickness || 0.05);
      const ri = Math.max(0.01, ro - thick);
      const h = ((p as { height?: number }).height || 1) * sy;
      volumeM3 = Math.PI * (Math.pow(ro, 2) - Math.pow(ri, 2)) * h;
      surfaceAreaM2 = 2 * Math.PI * ro * h + 2 * Math.PI * ri * h;
      break;
    }
    case 'sphere': {
      const r = ((p as { radius?: number }).radius || 0.5) * Math.max(sx, sy, sz);
      volumeM3 = (4 / 3) * Math.PI * Math.pow(r, 3);
      surfaceAreaM2 = 4 * Math.PI * Math.pow(r, 2);
      break;
    }
    default:
      volumeM3 = 0.5;
      surfaceAreaM2 = 1.0;
  }

  const weightKg = volumeM3 * mat.densityKgM3;
  const weightTonnes = weightKg / 1000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          padding: '10px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--accent-cad)' }}>
          <Scale size={14} />
          <span>Métricas de Ingeniería Estimadas</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Material Activo:</span>
            <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{mat.name.split('(')[0]}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Densidad del Material:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{mat.densityKgM3} kg/m³</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Volumen de Sólido:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {volumeM3 < 0.01 ? (volumeM3 * 1000).toFixed(2) + ' dm³' : volumeM3.toFixed(3) + ' m³'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Área Superficial:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {surfaceAreaM2.toFixed(3)} m²
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Masa / Peso Estimado:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
              {weightKg >= 1000 ? `${weightTonnes.toFixed(2)} t (${Math.round(weightKg).toLocaleString()} kg)` : `${weightKg.toFixed(2)} kg`}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          lineHeight: '1.4',
        }}
      >
        <Ruler size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
        <span>Las métricas se recalculan reactivamente al desplazar, rotar, escalar o modificar las cotas paramétricas de la pieza.</span>
      </div>
    </div>
  );
};
