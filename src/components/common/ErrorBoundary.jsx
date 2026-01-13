import React, { Component } from 'react';

/**
 * ErrorBoundary - Componente que captura errores en sus hijos
 *
 * Uso:
 * <ErrorBoundary fallback={<MiComponenteFallback />}>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 *
 * O con render prop:
 * <ErrorBoundary fallback={(error, resetError) => <div onClick={resetError}>Error: {error.message}</div>}>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar estado para mostrar UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Guardar información del error
    this.setState({ errorInfo });

    // Aquí podrías enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    console.error('ErrorBoundary capturó un error:', error);
    console.error('Información del componente:', errorInfo.componentStack);

    // Callback opcional para notificar errores
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, FallbackComponent } = this.props;

    if (hasError) {
      // Si se proporciona un FallbackComponent, usarlo
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            resetError={this.resetError}
          />
        );
      }

      // Si fallback es una función, llamarla con error y resetError
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }

      // Si fallback es un elemento, renderizarlo
      if (fallback) {
        return fallback;
      }

      // Fallback por defecto
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>
            Algo salió mal
          </h3>
          <p style={{ color: '#7f1d1d', marginBottom: '15px' }}>
            Ha ocurrido un error inesperado.
          </p>
          <button
            onClick={this.resetError}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
