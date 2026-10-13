import React, { useState } from 'react';
import { PrimitivesTab } from './PrimitivesTab';
import { TankBuilderTab } from './TankBuilderTab';
import { OutlinerTab } from './OutlinerTab';
import type { CADPrimitiveType, TankAssemblyParams, CADObjectNode } from '../../../types/cad';
import { Box, Layers, ListTree, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeftPanelProps {
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddPrimitive: (type: CADPrimitiveType) => void;
  onBuildTank: (params: TankAssemblyParams) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onRenameObject: (id: string, newName: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  objects,
  rootIds,
  selectedId,
  onSelect,
  onAddPrimitive,
  onBuildTank,
  onToggleVisibility,
  onToggleLock,
  onDeleteObject,
  onDuplicateObject,
  onRenameObject,
}) => {
  const [activeTab, setActiveTab] = useState<'primitives' | 'tank' | 'outliner'>('tank');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If selected object is a tank-assembly or subcomponent of tank, get its params
  const selectedNode = selectedId ? objects[selectedId] : null;
  const tankAssemblyId = selectedNode?.type === 'tank-assembly'
    ? selectedId
    : selectedNode?.parentId && objects[selectedNode.parentId]?.type === 'tank-assembly'
    ? selectedNode.parentId
    : null;
  const activeTankParams = tankAssemblyId ? (objects[tankAssemblyId]?.params as TankAssemblyParams) : undefined;

  if (isCollapsed) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
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
          title="Abrir panel de herramientas"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="cad-panel"
      style={{
        width: '320px',
        borderRight: '1px solid var(--border-subtle)',
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Panel Header */}
      <div className="panel-header">
        <span>HERRAMIENTAS & BIBLIOTECA</span>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{ color: 'var(--text-dim)', padding: '2px' }}
          title="Colapsar panel"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        <button
          className={`panel-tab ${activeTab === 'tank' ? 'active' : ''}`}
          onClick={() => setActiveTab('tank')}
        >
          <Layers size={13} />
          <span>Tanque</span>
        </button>
        <button
          className={`panel-tab ${activeTab === 'primitives' ? 'active' : ''}`}
          onClick={() => setActiveTab('primitives')}
        >
          <Box size={13} />
          <span>Primitivas</span>
        </button>
        <button
          className={`panel-tab ${activeTab === 'outliner' ? 'active' : ''}`}
          onClick={() => setActiveTab('outliner')}
        >
          <ListTree size={13} />
          <span>Árbol CAD ({rootIds.length})</span>
        </button>
      </div>

      {/* Panel Body */}
      <div className="panel-content">
        {activeTab === 'tank' && (
          <TankBuilderTab
            initialParams={activeTankParams}
            onBuildTank={onBuildTank}
            activeTankId={tankAssemblyId}
          />
        )}
        {activeTab === 'primitives' && <PrimitivesTab onAddPrimitive={onAddPrimitive} />}
        {activeTab === 'outliner' && (
          <OutlinerTab
            objects={objects}
            rootIds={rootIds}
            selectedId={selectedId}
            onSelect={onSelect}
            onToggleVisibility={onToggleVisibility}
            onToggleLock={onToggleLock}
            onDeleteObject={onDeleteObject}
            onDuplicateObject={onDuplicateObject}
            onRenameObject={onRenameObject}
          />
        )}
      </div>
    </aside>
  );
};
