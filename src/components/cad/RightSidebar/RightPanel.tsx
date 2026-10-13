import React, { useState } from 'react';
import { TransformInspector } from './TransformInspector';
import { ParametricProperties } from './ParametricProperties';
import { MaterialPicker } from './MaterialPicker';
import { EngineeringMetrics } from './EngineeringMetrics';
import type { CADObjectNode, CADTransform, CADObjectParams } from '../../../types/cad';
import {
  Sliders,
  Maximize,
  Palette,
  Scale,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';

interface RightPanelProps {
  selectedNode: CADObjectNode | null;
  onChangeTransform: (newTransform: CADTransform) => void;
  onChangeParams: (newParams: CADObjectParams) => void;
  onChangeMaterial: (materialId: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedNode,
  onChangeTransform,
  onChangeParams,
  onChangeMaterial,
}) => {
  const [activeTab, setActiveTab] = useState<'transform' | 'params' | 'material' | 'metrics'>('transform');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 30,
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            color: 'var(--accent-cad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Abrir panel de propiedades"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="cad-panel"
      style={{
        width: '310px',
        borderLeft: '1px solid var(--border-subtle)',
        borderRight: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <button
            onClick={() => setIsCollapsed(true)}
            style={{ color: 'var(--text-dim)', padding: '2px' }}
            title="Colapsar panel"
          >
            <ChevronRight size={16} />
          </button>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedNode ? selectedNode.name : 'PROPIEDADES'}
          </span>
        </div>
        {selectedNode && (
          <span className="badge badge-cad">{selectedNode.type}</span>
        )}
      </div>

      {selectedNode ? (
        <>
          {/* Tabs */}
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === 'transform' ? 'active' : ''}`}
              onClick={() => setActiveTab('transform')}
              title="Transformaciones X, Y, Z"
            >
              <Maximize size={12} />
              <span>Posición</span>
            </button>
            <button
              className={`panel-tab ${activeTab === 'params' ? 'active' : ''}`}
              onClick={() => setActiveTab('params')}
              title="Cotas y dimensiones geométricas"
            >
              <Sliders size={12} />
              <span>Parámetros</span>
            </button>
            <button
              className={`panel-tab ${activeTab === 'material' ? 'active' : ''}`}
              onClick={() => setActiveTab('material')}
              title="Materiales y acabado superficial"
            >
              <Palette size={12} />
              <span>Material</span>
            </button>
            <button
              className={`panel-tab ${activeTab === 'metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('metrics')}
              title="Métricas de masa y volumen"
            >
              <Scale size={12} />
              <span>Métricas</span>
            </button>
          </div>

          {/* Tab content */}
          <div className="panel-content">
            {activeTab === 'transform' && (
              <TransformInspector
                transform={selectedNode.transform}
                isLocked={selectedNode.locked}
                onChangeTransform={onChangeTransform}
              />
            )}
            {activeTab === 'params' && (
              <ParametricProperties
                node={selectedNode}
                onChangeParams={onChangeParams}
              />
            )}
            {activeTab === 'material' && (
              <MaterialPicker
                currentMaterialId={selectedNode.materialId}
                onSelectMaterial={onChangeMaterial}
              />
            )}
            {activeTab === 'metrics' && (
              <EngineeringMetrics node={selectedNode} />
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            color: 'var(--text-dim)',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-input)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Info size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Ningún elemento seleccionado
            </div>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              Haz clic en cualquier pieza dentro del espacio 3D o en el árbol CAD para inspeccionar y editar sus cotas, transformaciones y material.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
