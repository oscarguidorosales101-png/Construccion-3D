import {
  Box,
  Layers,
  ArrowRight,
  Maximize2,
  Download,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onEnterEditor: () => void;
  onOpenAuth: () => void;
  onOpenSetupGuide: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterEditor,
  onOpenAuth,
  onOpenSetupGuide,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-darkest)',
        zIndex: 300,
        overflowY: 'auto',
        color: 'var(--text-main)',
      }}
    >
      {/* Header */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 18, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box size={24} style={{ color: 'var(--accent-cad)' }} />
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.04em' }}>
            FORMA <span style={{ color: 'var(--accent-cad)' }}>3D</span>
          </span>
          <span className="badge badge-cad" style={{ marginLeft: '6px' }}>CAD Paramétrico Industrial</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenSetupGuide}
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Guía Supabase
          </button>
          <button
            onClick={onOpenAuth}
            style={{
              fontSize: '13px',
              color: 'var(--text-main)',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500,
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={onEnterEditor}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'var(--accent-cad)',
              color: '#090b0e',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px var(--accent-cad-glow)',
            }}
          >
            <span>Lanzar Editor 3D</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '80px 24px 60px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: 'rgba(0, 180, 216, 0.1)',
            border: '1px solid rgba(0, 180, 216, 0.3)',
            color: 'var(--accent-cad)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <Sparkles size={14} />
          <span>Plataforma Web Independiente de Ingeniería & Modelado Tridimensional</span>
        </div>

        <h1
          style={{
            fontSize: '44px',
            fontWeight: 800,
            lineHeight: '1.15',
            letterSpacing: '-0.02em',
            maxWidth: '850px',
          }}
        >
          Modelado CAD Paramétrico y Construcción 3D para la Industria
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            maxWidth: '720px',
          }}
        >
          Diseña ensamblajes industriales, genera estructuras con chapas cilíndricas desfasadas (estilo API-650), escaleras helicoidales de caracol, anillos de viento y boquillas de proceso con cálculo geométrico en tiempo real y exportación en formatos estándar.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
          <button
            onClick={onEnterEditor}
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--accent-cad)',
              color: '#090b0e',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px var(--accent-cad-glow)',
            }}
          >
            <span>Iniciar FORMA 3D en Vivo</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={onOpenAuth}
            style={{
              padding: '12px 22px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Registrarse con Correo
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '20px 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(0, 180, 216, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cad)',
            }}
          >
            <Layers size={22} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Constructor Paramétrico de Tanques</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Despiece real de virolas cilíndricas con juntas verticales desfasadas, fondo anular, techo cónico autoportante, escalera de caracol exterior y boquillas con bridas.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
            }}
          >
            <Maximize2 size={22} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Modelado Libre & Transformación</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Gizmos interactivos de precisión para traslación, rotación y escala con ajuste magnético a rejilla (0.25 m) y snapping angular de 15°.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-success)',
            }}
          >
            <Download size={22} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Interoperabilidad & Formato Nativo</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Exporta a GLB para intercambio 3D, STL para fabricación aditiva, y guarda en formato nativo versionado <code>.forma3d</code> para preservar el árbol paramétrico.
          </p>
        </div>
      </section>
    </div>
  );
};
