import React from 'react';
import type { CADPrimitiveType } from '../../../types/cad';
import {
  Box,
  Cylinder,
  Circle,
  Disc,
  Layers,
  Square,
  Maximize2,
  Plus,
} from 'lucide-react';

interface PrimitivesTabProps {
  onAddPrimitive: (type: CADPrimitiveType) => void;
}

const PRIMITIVE_ITEMS: {
  type: CADPrimitiveType;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'box',
    title: 'Cubo / Prisma',
    desc: 'Bloque sólido tridimensional parametrizable',
    icon: <Box size={18} />,
  },
  {
    type: 'rect-plate',
    title: 'Placa Rectangular',
    desc: 'Chapa o chapa base con espesor milimétrico',
    icon: <Square size={18} />,
  },
  {
    type: 'cylinder',
    title: 'Cilindro Sólido',
    desc: 'Cuerpo cilíndrico para ejes, columnas y recipientes',
    icon: <Cylinder size={18} />,
  },
  {
    type: 'pipe',
    title: 'Tubo / Tubería',
    desc: 'Conducto hueco con espesor de pared',
    icon: <Maximize2 size={18} />,
  },
  {
    type: 'cone',
    title: 'Cono / Reducción',
    desc: 'Cuerpo cónico para techos o tolvas industriales',
    icon: <Layers size={18} />,
  },
  {
    type: 'sphere',
    title: 'Esfera / Domo',
    desc: 'Geometría esférica de alta precisión',
    icon: <Circle size={18} />,
  },
  {
    type: 'torus',
    title: 'Toroide / Codo',
    desc: 'Anillo toroidal para tuberías o juntas',
    icon: <Disc size={18} />,
  },
  {
    type: 'ring',
    title: 'Anillo Plano',
    desc: 'Brida o rigidizador anular plano',
    icon: <Disc size={18} />,
  },
];

export const PrimitivesTab: React.FC<PrimitivesTabProps> = ({ onAddPrimitive }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        Haz clic en una primitiva industrial para agregarla en el origen o centro de trabajo:
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {PRIMITIVE_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddPrimitive(item.type)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '10px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cad)';
              e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'var(--bg-input)';
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: '6px',
                color: 'var(--accent-cad)',
              }}
            >
              {item.icon}
              <Plus size={14} style={{ color: 'var(--text-dim)' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
              {item.title}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', lineHeight: '1.3' }}>
              {item.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
