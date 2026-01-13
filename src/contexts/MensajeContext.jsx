import React, { createContext, useContext, useState, useCallback } from 'react';
import ModalMensaje from '../components/ModalMensaje';

/**
 * Contexto para manejar mensajes/notificaciones en toda la aplicación
 *
 * Uso:
 * const { mostrarMensaje } = useMensaje();
 * mostrarMensaje('Éxito', 'Operación completada', 'success');
 */

const MensajeContext = createContext(null);

export function MensajeProvider({ children }) {
  const [mensaje, setMensaje] = useState({
    visible: false,
    titulo: '',
    texto: '',
    tipo: 'info' // 'info' | 'success' | 'error' | 'warning'
  });

  // Mostrar un mensaje
  const mostrarMensaje = useCallback((titulo, texto, tipo = 'info') => {
    setMensaje({
      visible: true,
      titulo,
      texto,
      tipo
    });
  }, []);

  // Cerrar el mensaje actual
  const cerrarMensaje = useCallback(() => {
    setMensaje(prev => ({ ...prev, visible: false }));
  }, []);

  // Helpers para tipos específicos de mensajes
  const mostrarExito = useCallback((titulo, texto) => {
    mostrarMensaje(titulo, texto, 'success');
  }, [mostrarMensaje]);

  const mostrarError = useCallback((titulo, texto) => {
    mostrarMensaje(titulo, texto, 'error');
  }, [mostrarMensaje]);

  const mostrarAdvertencia = useCallback((titulo, texto) => {
    mostrarMensaje(titulo, texto, 'warning');
  }, [mostrarMensaje]);

  const mostrarInfo = useCallback((titulo, texto) => {
    mostrarMensaje(titulo, texto, 'info');
  }, [mostrarMensaje]);

  const value = {
    mostrarMensaje,
    cerrarMensaje,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarInfo,
    mensajeActual: mensaje
  };

  return (
    <MensajeContext.Provider value={value}>
      {children}

      {/* Modal de mensaje renderizado automáticamente */}
      {mensaje.visible && (
        <ModalMensaje
          titulo={mensaje.titulo}
          texto={mensaje.texto}
          tipo={mensaje.tipo}
          onClose={cerrarMensaje}
        />
      )}
    </MensajeContext.Provider>
  );
}

/**
 * Hook para usar el contexto de mensajes
 * @returns {Object} { mostrarMensaje, cerrarMensaje, mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo }
 */
export function useMensaje() {
  const context = useContext(MensajeContext);

  if (!context) {
    throw new Error('useMensaje debe usarse dentro de un MensajeProvider');
  }

  return context;
}

export default MensajeContext;
