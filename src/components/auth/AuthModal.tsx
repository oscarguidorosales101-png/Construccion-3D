import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { authService } from '../../services/supabase/authService';
import { LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import type { UserProfile } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  onOpenSetupGuide: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onOpenSetupGuide,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isConfigured = authService.isConfigured();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor introduce tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);
    const res = await authService.signIn(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      setSuccessMsg('¡Sesión iniciada con éxito!');
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 700);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password || !confirmPassword) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    const res = await authService.signUp(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      if (res.confirmationRequired) {
        setSuccessMsg('Registro exitoso. Se ha enviado un correo para verificar tu cuenta antes de acceder.');
      } else {
        setSuccessMsg('¡Cuenta creada e iniciada exitosamente!');
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 700);
      }
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('Por favor introduce tu correo para restablecer la contraseña.');
      return;
    }

    setIsLoading(true);
    const res = await authService.resetPassword(email);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        tab === 'signin'
          ? 'Iniciar Sesión en FORMA 3D'
          : tab === 'signup'
          ? 'Crear Cuenta en FORMA 3D'
          : 'Recuperar Contraseña'
      }
      maxWidth="460px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Status banner if Supabase is not connected */}
        {!isConfigured && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 600 }}>
              <Database size={16} />
              <span>Servicio de Autenticación en la Nube</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Para iniciar sesión con Supabase Auth y sincronizar proyectos en PostgreSQL, configura tus variables en <code>.env</code>.
            </p>
            <button
              onClick={onOpenSetupGuide}
              style={{
                alignSelf: 'flex-start',
                padding: '6px 12px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--accent-amber)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Ver Instrucciones de Conexión Supabase
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-input)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => { setTab('signin'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: tab === 'signin' ? 'var(--text-main)' : 'var(--text-muted)',
              backgroundColor: tab === 'signin' ? 'var(--bg-panel)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            Acceder
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: tab === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
              backgroundColor: tab === 'signup' ? 'var(--bg-panel)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-danger)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-success)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form rendering */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="ingeniero@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  style={{ fontSize: '11px', color: 'var(--accent-cad)', textDecoration: 'underline' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                padding: '10px',
                backgroundColor: 'var(--accent-cad)',
                color: '#090b0e',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <LogIn size={16} />
              {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {tab === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="ingeniero@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña (mínimo 6 caracteres)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                padding: '10px',
                backgroundColor: 'var(--accent-cad)',
                color: '#090b0e',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <UserPlus size={16} />
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta Profesional'}
            </button>
          </form>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Introduce tu correo registrado y te enviaremos las instrucciones de restablecimiento de contraseña de forma segura.
            </p>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="ingeniero@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setTab('signin')}
                style={{
                  flex: 1,
                  padding: '9px',
                  backgroundColor: 'var(--bg-panel-hover)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                }}
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 2,
                  padding: '9px',
                  backgroundColor: 'var(--accent-cad)',
                  color: '#090b0e',
                  fontWeight: 600,
                  fontSize: '12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <KeyRound size={14} />
                {isLoading ? 'Enviando...' : 'Enviar Enlace'}
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
            fontSize: '11px',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--accent-success)' }} />
          <span>Cifrado de credenciales de alta seguridad impulsado por Supabase Auth & RLS.</span>
        </div>
      </div>
    </Modal>
  );
};
