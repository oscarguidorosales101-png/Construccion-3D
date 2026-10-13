import React, { useState } from 'react';
import type { CADObjectNode } from '../../../types/cad';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Box,
  Layers,
  Search,
} from 'lucide-react';

interface OutlinerTabProps {
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onRenameObject: (id: string, newName: string) => void;
}

export const OutlinerTab: React.FC<OutlinerTabProps> = ({
  objects,
  rootIds,
  selectedId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDeleteObject,
  onDuplicateObject,
  onRenameObject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setTempName(currentName);
  };

  const handleFinishRename = (id: string) => {
    if (tempName.trim()) {
      onRenameObject(id, tempName.trim());
    }
    setEditingId(null);
  };

  const renderNode = (id: string, depth: number = 0) => {
    const node = objects[id];
    if (!node) return null;

    if (
      searchTerm &&
      !node.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!node.children || !node.children.some((cId) => objects[cId]?.name.toLowerCase().includes(searchTerm.toLowerCase())))
    ) {
      return null;
    }

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[id] ?? (depth === 0);
    const isSelected = selectedId === id;

    return (
      <div key={id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          onClick={() => onSelect(id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 6px',
            paddingLeft: `${depth * 14 + 6}px`,
            backgroundColor: isSelected ? 'rgba(0, 180, 216, 0.18)' : 'transparent',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '11px',
            color: isSelected ? 'var(--accent-cad)' : node.visible ? 'var(--text-main)' : 'var(--text-dim)',
            transition: 'background-color 0.1s',
            borderLeft: isSelected ? '2px solid var(--accent-cad)' : '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Left section: expand arrow + icon + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', flex: 1 }}>
            {hasChildren ? (
              <span
                onClick={(e) => toggleExpand(id, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
            ) : (
              <span style={{ width: '16px' }} />
            )}

            {hasChildren ? (
              <Layers size={13} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            ) : (
              <Box size={13} style={{ color: 'var(--accent-cad)', flexShrink: 0 }} />
            )}

            {editingId === id ? (
              <input
                type="text"
                value={tempName}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => handleFinishRename(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename(id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                style={{
                  padding: '1px 4px',
                  fontSize: '11px',
                  height: '20px',
                  width: '120px',
                }}
              />
            ) : (
              <span
                onDoubleClick={(e) => handleStartRename(id, node.name, e)}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '140px',
                }}
                title={node.name}
              >
                {node.name}
              </span>
            )}
          </div>

          {/* Right section: action icons */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visibility Toggle */}
            <button
              onClick={() => onToggleVisibility(id)}
              style={{
                color: node.visible ? 'var(--text-muted)' : 'var(--text-dim)',
                padding: '2px',
              }}
              title={node.visible ? 'Ocultar' : 'Mostrar'}
            >
              {node.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>

            {/* Lock Toggle */}
            <button
              onClick={() => onToggleLock(id)}
              style={{
                color: node.locked ? 'var(--accent-amber)' : 'var(--text-dim)',
                padding: '2px',
              }}
              title={node.locked ? 'Desbloquear' : 'Bloquear'}
            >
              {node.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>

            {/* Duplicate button (only for root nodes or standalone) */}
            {!node.isSubComponent && (
              <button
                onClick={() => onDuplicateObject(id)}
                style={{ color: 'var(--text-muted)', padding: '2px' }}
                title="Duplicar"
              >
                <Copy size={12} />
              </button>
            )}

            {/* Delete button (only for root or standalone) */}
            {!node.isSubComponent && (
              <button
                onClick={() => onDeleteObject(id)}
                style={{ color: 'var(--accent-danger)', padding: '2px' }}
                title="Eliminar"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Children if expanded */}
        {hasChildren && isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {node.children!.map((childId) => renderNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <Search size={13} style={{ color: 'var(--text-dim)' }} />
        <input
          type="text"
          placeholder="Buscar componentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            fontSize: '11px',
            width: '100%',
          }}
        />
      </div>

      {/* Component Tree List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          maxHeight: 'calc(100vh - 220px)',
          overflowY: 'auto',
        }}
      >
        {rootIds.length === 0 ? (
          <div style={{ padding: '20px 8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-dim)' }}>
            No hay objetos en la escena. Agrega una primitiva o construye un tanque.
          </div>
        ) : (
          rootIds.map((rootId) => renderNode(rootId, 0))
        )}
      </div>
    </div>
  );
};
