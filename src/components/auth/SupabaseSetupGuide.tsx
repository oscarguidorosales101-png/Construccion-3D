import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Database, Copy, Check, ExternalLink, Terminal, Shield } from 'lucide-react';

interface SupabaseSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupGuide: React.FC<SupabaseSetupGuideProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const envSnippet = `# FORMA 3D — Variables de Entorno
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guía de Integración con Supabase" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(0, 180, 216, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cad)',
            }}
          >
            <Database size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Conexión de Base de Datos y Auth</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Almacenamiento remoto PostgreSQL y aislamiento mediante Row Level Security (RLS).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
          <p>
            1. Crea un proyecto gratuito en{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-cad)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              supabase.com <ExternalLink size={11} />
            </a>.
          </p>
          <p>
            2. En el panel de Supabase, ve a <strong>Project Settings → API</strong> y copia la <code>URL</code> y la clave <code>anon public</code>.
          </p>
          <p>
            3. Crea un archivo <code>.env</code> en la raíz del proyecto con el siguiente contenido:
          </p>
        </div>

        {/* Code block with copy button */}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <button
            onClick={copyEnv}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '4px 8px',
              backgroundColor: 'var(--bg-panel-hover)',
              borderRadius: 'var(--radius-sm)',
              color: copied ? 'var(--accent-success)' : 'var(--text-main)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{envSnippet}</pre>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)', fontWeight: 600 }}>
            <Terminal size={14} />
            <span>4. Ejecutar Script SQL de Migración</span>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Abre el <strong>SQL Editor</strong> en Supabase y ejecuta el archivo incluido en el repositorio:
            <br />
            <code>supabase/schema.sql</code>. Esto creará la tabla <code>projects</code> y activará las políticas de aislamiento RLS de usuarios.
          </p>
        </div>

        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(0, 180, 216, 0.08)',
            border: '1px solid rgba(0, 180, 216, 0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Shield size={16} style={{ color: 'var(--accent-cad)', flexShrink: 0 }} />
          <span>
            <strong>Modo Local Activo:</strong> Puedes continuar diseñando y modelando sin limitaciones. Tus proyectos se guardan en el almacenamiento local y se pueden exportar a .forma3d, GLB o STL.
          </span>
        </div>
      </div>
    </Modal>
  );
};
