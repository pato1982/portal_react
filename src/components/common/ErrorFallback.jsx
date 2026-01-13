import React from 'react';
import './ErrorFallback.css';

/**
 * ErrorFallback - Componente de UI para mostrar cuando ocurre un error
 *
 * Props:
 * - error: El error capturado
 * - resetError: Función para reintentar
 * - title: Título personalizado (opcional)
 * - message: Mensaje personalizado (opcional)
 * - showDetails: Mostrar detalles técnicos del error (default: false)
 * - variant: 'page' | 'section' | 'inline' (default: 'section')
 */
function ErrorFallback({
  error,
  resetError,
  title = 'Algo salió mal',
  message = 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.',
  showDetails = false,
  variant = 'section'
}) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={`error-fallback error-fallback--${variant}`}>
      <div className="error-fallback__content">
        {/* Icono */}
        <div className="error-fallback__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Título y mensaje */}
        <h2 className="error-fallback__title">{title}</h2>
        <p className="error-fallback__message">{message}</p>

        {/* Detalles técnicos (solo en desarrollo) */}
        {showDetails && error && (
          <details className="error-fallback__details">
            <summary>Detalles técnicos</summary>
            <pre>{error.message}</pre>
            {error.stack && (
              <pre className="error-fallback__stack">{error.stack}</pre>
            )}
          </details>
        )}

        {/* Acciones */}
        <div className="error-fallback__actions">
          {resetError && (
            <button
              onClick={resetError}
              className="error-fallback__btn error-fallback__btn--primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Intentar de nuevo
            </button>
          )}

          {variant === 'page' && (
            <>
              <button
                onClick={handleReload}
                className="error-fallback__btn error-fallback__btn--secondary"
              >
                Recargar página
              </button>
              <button
                onClick={handleGoHome}
                className="error-fallback__btn error-fallback__btn--link"
              >
                Volver al inicio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PageErrorFallback - Fallback para errores a nivel de página completa
 */
export function PageErrorFallback(props) {
  return (
    <ErrorFallback
      {...props}
      variant="page"
      title="Error en la página"
      message="No se pudo cargar esta página. Por favor, intente recargar o vuelva al inicio."
      showDetails={import.meta.env.DEV}
    />
  );
}

/**
 * SectionErrorFallback - Fallback para errores en secciones/tabs
 */
export function SectionErrorFallback(props) {
  return (
    <ErrorFallback
      {...props}
      variant="section"
      title="Error al cargar"
      message="Esta sección no se pudo cargar correctamente."
    />
  );
}

/**
 * InlineErrorFallback - Fallback compacto para componentes pequeños
 */
export function InlineErrorFallback({ error, resetError }) {
  return (
    <div className="error-fallback error-fallback--inline">
      <span className="error-fallback__inline-icon">⚠️</span>
      <span className="error-fallback__inline-text">Error al cargar</span>
      {resetError && (
        <button
          onClick={resetError}
          className="error-fallback__inline-btn"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export default ErrorFallback;
