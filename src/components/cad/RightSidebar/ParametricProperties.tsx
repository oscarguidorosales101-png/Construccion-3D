import React from 'react';
import type { CADObjectNode, CADObjectParams } from '../../../types/cad';

interface ParametricPropertiesProps {
  node: CADObjectNode;
  onChangeParams: (params: CADObjectParams) => void;
}

export const ParametricProperties: React.FC<ParametricPropertiesProps> = ({
  node,
  onChangeParams,
}) => {
  const p = node.params;

  const update = (key: string, val: number | string | boolean) => {
    onChangeParams({
      ...p,
      [key]: val,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
          Tipo: <span style={{ color: 'var(--accent-cad)', textTransform: 'capitalize' }}>{node.type}</span>
        </span>
        {node.isSubComponent && (
          <span className="badge badge-amber">{node.subComponentRole || 'Subcomponente'}</span>
        )}
      </div>

      {/* Box / Rect-Prism */}
      {(node.type === 'box' || node.type === 'rect-prism') && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Ancho (X)</span>
              <span className="value-badge">{((p as { width?: number }).width || 1).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={(p as { width?: number }).width || 1}
              onChange={(e) => update('width', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Alto (Y)</span>
              <span className="value-badge">{((p as { height?: number }).height || 1).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={(p as { height?: number }).height || 1}
              onChange={(e) => update('height', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Profundidad (Z)</span>
              <span className="value-badge">{((p as { depth?: number }).depth || 1).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={(p as { depth?: number }).depth || 1}
              onChange={(e) => update('depth', parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Rect Plate */}
      {node.type === 'rect-plate' && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Ancho de Placa</span>
              <span className="value-badge">{((p as { width?: number }).width || 2).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15"
              step="0.1"
              value={(p as { width?: number }).width || 2}
              onChange={(e) => update('width', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Largo / Altura de Virola</span>
              <span className="value-badge">{((p as { length?: number }).length || 3).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15"
              step="0.1"
              value={(p as { length?: number }).length || 3}
              onChange={(e) => update('length', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Espesor Nominal (t)</span>
              <span className="value-badge">{(((p as { thickness?: number }).thickness || 0.01) * 1000).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.003"
              max="0.05"
              step="0.001"
              value={(p as { thickness?: number }).thickness || 0.01}
              onChange={(e) => update('thickness', parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Cylinder */}
      {node.type === 'cylinder' && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Radio Superior</span>
              <span className="value-badge">{((p as { radiusTop?: number }).radiusTop || 0.5).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15"
              step="0.1"
              value={(p as { radiusTop?: number }).radiusTop || 0.5}
              onChange={(e) => update('radiusTop', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Radio Inferior</span>
              <span className="value-badge">{((p as { radiusBottom?: number }).radiusBottom || 0.5).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15"
              step="0.1"
              value={(p as { radiusBottom?: number }).radiusBottom || 0.5}
              onChange={(e) => update('radiusBottom', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Altura (H)</span>
              <span className="value-badge">{((p as { height?: number }).height || 1).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="25"
              step="0.2"
              value={(p as { height?: number }).height || 1}
              onChange={(e) => update('height', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Segmentos Radiales</span>
              <span className="value-badge">{(p as { radialSegments?: number }).radialSegments || 32}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              step="4"
              value={(p as { radialSegments?: number }).radialSegments || 32}
              onChange={(e) => update('radialSegments', parseInt(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Pipe / Tube */}
      {node.type === 'pipe' && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Radio Exterior</span>
              <span className="value-badge">{((p as { outerRadius?: number }).outerRadius || 0.5).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="10"
              step="0.05"
              value={(p as { outerRadius?: number }).outerRadius || 0.5}
              onChange={(e) => update('outerRadius', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Espesor de Pared</span>
              <span className="value-badge">{(((p as { wallThickness?: number }).wallThickness || 0.05) * 1000).toFixed(0)} mm</span>
            </div>
            <input
              type="range"
              min="0.003"
              max="0.2"
              step="0.002"
              value={(p as { wallThickness?: number }).wallThickness || 0.05}
              onChange={(e) => update('wallThickness', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Longitud / Altura</span>
              <span className="value-badge">{((p as { height?: number }).height || 1).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.2"
              value={(p as { height?: number }).height || 1}
              onChange={(e) => update('height', parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Sphere */}
      {node.type === 'sphere' && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Radio</span>
              <span className="value-badge">{((p as { radius?: number }).radius || 0.5).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={(p as { radius?: number }).radius || 0.5}
              onChange={(e) => update('radius', parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Cone */}
      {node.type === 'cone' && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Radio Base</span>
              <span className="value-badge">{((p as { radius?: number }).radius || 0.5).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15"
              step="0.1"
              value={(p as { radius?: number }).radius || 0.5}
              onChange={(e) => update('radius', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Altura</span>
              <span className="value-badge">{((p as { height?: number }).height || 1).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15"
              step="0.1"
              value={(p as { height?: number }).height || 1}
              onChange={(e) => update('height', parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Torus */}
      {node.type === 'torus' && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Radio Principal</span>
              <span className="value-badge">{((p as { radius?: number }).radius || 0.5).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={(p as { radius?: number }).radius || 0.5}
              onChange={(e) => update('radius', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Radio del Tubo</span>
              <span className="value-badge">{((p as { tubeRadius?: number }).tubeRadius || 0.1).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={(p as { tubeRadius?: number }).tubeRadius || 0.1}
              onChange={(e) => update('tubeRadius', parseFloat(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Ring */}
      {node.type === 'ring' && (
        <>
          <div className="form-group">
            <div className="form-label">
              <span>Radio Interior</span>
              <span className="value-badge">{((p as { innerRadius?: number }).innerRadius || 0.3).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="10"
              step="0.05"
              value={(p as { innerRadius?: number }).innerRadius || 0.3}
              onChange={(e) => update('innerRadius', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Radio Exterior</span>
              <span className="value-badge">{((p as { outerRadius?: number }).outerRadius || 0.6).toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="12"
              step="0.05"
              value={(p as { outerRadius?: number }).outerRadius || 0.6}
              onChange={(e) => update('outerRadius', parseFloat(e.target.value))}
            />
          </div>
        </>
      )}
    </div>
  );
};
