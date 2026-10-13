import React from 'react';
import { CAD_MATERIALS } from '../../../engine3d/materials/cadMaterials';
import type { CADMaterial } from '../../../types/cad';
import { Check } from 'lucide-react';

interface MaterialPickerProps {
  currentMaterialId: string;
  onSelectMaterial: (materialId: string) => void;
}

export const MaterialPicker: React.FC<MaterialPickerProps> = ({
  currentMaterialId,
  onSelectMaterial,
}) => {
  const activeMat = CAD_MATERIALS[currentMaterialId] || CAD_MATERIALS['mat-steel-carbon'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Active Material Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: activeMat.color,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.4)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
            {activeMat.name}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Densidad: {activeMat.densityKgM3} kg/m³ • Rugosidad: {activeMat.roughness}
          </span>
        </div>
      </div>

      {/* Preset Swatches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Biblioteca de Materiales de Ingeniería
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {Object.values(CAD_MATERIALS).map((mat: CADMaterial) => {
            const isSelected = mat.id === currentMaterialId;
            return (
              <button
                key={mat.id}
                onClick={() => onSelectMaterial(mat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 8px',
                  backgroundColor: isSelected ? 'rgba(0, 180, 216, 0.15)' : 'var(--bg-input)',
                  border: `1px solid ${isSelected ? 'var(--accent-cad)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    backgroundColor: mat.color,
                    flexShrink: 0,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Check size={11} style={{ color: '#fff', strokeWidth: 3 }} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: isSelected ? 'var(--accent-cad)' : 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {mat.name.split('(')[0].trim()}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                    {mat.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

      {/* Material Physical Specs Notice */}
      <div
        style={{
          padding: '8px 10px',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          lineHeight: '1.4',
        }}
      >
        <strong style={{ color: 'var(--accent-cad)' }}>Nota Técnica:</strong> Los materiales visuales PBR aproximan el aspecto óptico. Las densidades especificadas se emplean para el cálculo paramétrico de pesos y cargas del modelo.
      </div>
    </div>
  );
};
