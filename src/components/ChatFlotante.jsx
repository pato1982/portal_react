import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  obtenerContactos,
  obtenerMensajes,
  crearConversacion,
  enviarMensaje,
  marcarConversacionLeida,
  obtenerNoLeidos,
  obtenerNuevosMensajes
} from '../services/chatService';

function ChatFlotante({ usuario, establecimientoId }) {
  const [chatAbierto, setChatAbierto] = useState(false);
  const [contactoActual, setContactoActual] = useState(null);
  const [conversacionActual, setConversacionActual] = useState(null);
  const [mensajeInput, setMensajeInput] = useState('');
  const [contactos, setContactos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);
  const [ultimoTimestamp, setUltimoTimestamp] = useState(null);

  const mensajesRef = useRef(null);
  const pollingRef = useRef(null);

  // Verificar si el usuario puede usar el chat (solo docentes y admins)
  const puedeUsarChat = usuario &&
    (usuario.tipo === 'docente' || usuario.tipo === 'administrador' || usuario.tipo === 'admin');

  // Cargar contactos al abrir el chat
  const cargarContactos = useCallback(async () => {
    if (!usuario?.id || !establecimientoId) return;

    setCargando(true);
    try {
      const resultado = await obtenerContactos(usuario.id, establecimientoId);
      if (resultado.success) {
        setContactos(resultado.data || []);
      }
    } catch (error) {
      console.error('Error al cargar contactos:', error);
    } finally {
      setCargando(false);
    }
  }, [usuario?.id, establecimientoId]);

  // Cargar mensajes de una conversacion
  const cargarMensajes = useCallback(async (conversacionId) => {
    if (!conversacionId || !usuario?.id) return;

    setCargando(true);
    try {
      const resultado = await obtenerMensajes(conversacionId, usuario.id);
      if (resultado.success) {
        setMensajes(resultado.data || []);
        // Marcar como leidos
        await marcarConversacionLeida(conversacionId, usuario.id);
        // Actualizar timestamp para polling
        setUltimoTimestamp(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setCargando(false);
    }
  }, [usuario?.id]);

  // Obtener total de no leidos
  const actualizarNoLeidos = useCallback(async () => {
    if (!usuario?.id || !establecimientoId) return;

    try {
      const resultado = await obtenerNoLeidos(usuario.id, establecimientoId);
      if (resultado.success) {
        setTotalNoLeidos(resultado.data?.total_no_leidos || 0);
      }
    } catch (error) {
      console.error('Error al obtener no leidos:', error);
    }
  }, [usuario?.id, establecimientoId]);

  // Polling para nuevos mensajes
  const verificarNuevosMensajes = useCallback(async () => {
    if (!usuario?.id || !establecimientoId || !chatAbierto) return;

    try {
      const resultado = await obtenerNuevosMensajes(usuario.id, establecimientoId, ultimoTimestamp);
      if (resultado.success && resultado.data?.length > 0) {
        // Agregar nuevos mensajes a la conversacion actual si aplica
        if (conversacionActual) {
          const nuevosParaConversacion = resultado.data.filter(
            m => m.conversacion_id === conversacionActual
          );
          if (nuevosParaConversacion.length > 0) {
            setMensajes(prev => [...prev, ...nuevosParaConversacion.map(m => ({
              ...m,
              direccion: 'recibido'
            }))]);
          }
        }
        // Actualizar conteo de no leidos
        actualizarNoLeidos();
        // Actualizar contactos para reflejar nuevos mensajes
        cargarContactos();
      }
      if (resultado.timestamp) {
        setUltimoTimestamp(resultado.timestamp);
      }
    } catch (error) {
      console.error('Error en polling:', error);
    }
  }, [usuario?.id, establecimientoId, chatAbierto, ultimoTimestamp, conversacionActual, actualizarNoLeidos, cargarContactos]);

  // Efecto para cargar contactos cuando se abre el chat
  useEffect(() => {
    if (chatAbierto && puedeUsarChat) {
      cargarContactos();
      actualizarNoLeidos();
    }
  }, [chatAbierto, puedeUsarChat, cargarContactos, actualizarNoLeidos]);

  // Efecto para polling cada 5 segundos
  useEffect(() => {
    if (chatAbierto && puedeUsarChat) {
      pollingRef.current = setInterval(verificarNuevosMensajes, 5000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [chatAbierto, puedeUsarChat, verificarNuevosMensajes]);

  // Efecto para actualizar no leidos periodicamente (cuando el chat esta cerrado)
  useEffect(() => {
    if (!chatAbierto && puedeUsarChat) {
      actualizarNoLeidos();
      const interval = setInterval(actualizarNoLeidos, 30000); // cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [chatAbierto, puedeUsarChat, actualizarNoLeidos]);

  // Scroll al ultimo mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  const toggleChat = () => {
    setChatAbierto(!chatAbierto);
    if (!chatAbierto) {
      setContactoActual(null);
      setConversacionActual(null);
      setMensajes([]);
    }
  };

  const seleccionarContacto = async (contacto) => {
    setContactoActual(contacto);
    setCargando(true);

    try {
      // Crear o recuperar conversacion
      const resultado = await crearConversacion(
        usuario.id,
        contacto.usuario_id,
        establecimientoId
      );

      if (resultado.success) {
        setConversacionActual(resultado.data.id);
        await cargarMensajes(resultado.data.id);

        // Actualizar no leidos del contacto
        setContactos(prev => prev.map(c =>
          c.usuario_id === contacto.usuario_id
            ? { ...c, mensajes_no_leidos: 0 }
            : c
        ));
        actualizarNoLeidos();
      }
    } catch (error) {
      console.error('Error al seleccionar contacto:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleEnviarMensaje = async () => {
    if (!mensajeInput.trim() || !conversacionActual || enviando) return;

    const textoMensaje = mensajeInput.trim();
    setMensajeInput('');
    setEnviando(true);

    // Agregar mensaje optimisticamente
    const mensajeOptimista = {
      id: `temp-${Date.now()}`,
      mensaje: textoMensaje,
      direccion: 'enviado',
      fecha_envio: new Date().toISOString(),
      enviando: true
    };
    setMensajes(prev => [...prev, mensajeOptimista]);

    try {
      const resultado = await enviarMensaje(conversacionActual, usuario.id, textoMensaje);

      if (resultado.success) {
        // Reemplazar mensaje optimista con el real
        setMensajes(prev => prev.map(m =>
          m.id === mensajeOptimista.id
            ? { ...resultado.data, direccion: 'enviado' }
            : m
        ));
        setUltimoTimestamp(new Date().toISOString());
      } else {
        // Marcar como error
        setMensajes(prev => prev.map(m =>
          m.id === mensajeOptimista.id
            ? { ...m, error: true, enviando: false }
            : m
        ));
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMensajes(prev => prev.map(m =>
        m.id === mensajeOptimista.id
          ? { ...m, error: true, enviando: false }
          : m
      ));
    } finally {
      setEnviando(false);
    }
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
    }
  };

  // No mostrar el chat si el usuario no puede usarlo
  if (!puedeUsarChat) {
    return null;
  }

  return (
    <>
      {/* Boton flotante */}
      <button className="chat-fab" onClick={toggleChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {totalNoLeidos > 0 && (
          <span className="chat-fab-badge">{totalNoLeidos > 99 ? '99+' : totalNoLeidos}</span>
        )}
      </button>

      {/* Overlay para cerrar al hacer clic fuera */}
      {chatAbierto && (
        <div className="chat-overlay" onClick={toggleChat}></div>
      )}

      {/* Modal del chat */}
      <div className={`chat-modal ${chatAbierto ? 'active' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-title">
            {contactoActual ? (
              <>
                <button
                  className="chat-back-btn"
                  onClick={() => {
                    setContactoActual(null);
                    setConversacionActual(null);
                    setMensajes([]);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <span>{contactoActual.nombre_completo}</span>
                <span className="chat-header-tipo">
                  {contactoActual.tipo === 'administrador' ? 'Admin' : 'Docente'}
                </span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Chat
              </>
            )}
          </div>
          <button className="chat-close-btn" onClick={toggleChat}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="chat-body">
          {!contactoActual ? (
            /* Lista de contactos */
            <div className="chat-contacts-full">
              {cargando ? (
                <div className="chat-loading">Cargando contactos...</div>
              ) : contactos.length === 0 ? (
                <div className="chat-empty">No hay contactos disponibles</div>
              ) : (
                contactos.map(contacto => (
                  <div
                    key={contacto.usuario_id}
                    className={`chat-contact-item ${contacto.es_admin ? 'admin-contact' : ''}`}
                    onClick={() => seleccionarContacto(contacto)}
                  >
                    <div className="chat-contact-avatar">
                      {contacto.foto_url ? (
                        <img src={contacto.foto_url} alt={contacto.nombre_completo} />
                      ) : (
                        <span>{contacto.nombre_completo?.charAt(0)?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="chat-contact-info">
                      <div className="chat-contact-name">
                        {contacto.nombre_completo}
                        {contacto.es_admin === 1 && (
                          <span className="chat-admin-badge">Admin</span>
                        )}
                      </div>
                      <div className="chat-contact-tipo">
                        {contacto.tipo === 'administrador' ? 'Administrador' : 'Docente'}
                        {contacto.especialidad && ` - ${contacto.especialidad}`}
                      </div>
                    </div>
                    {contacto.mensajes_no_leidos > 0 && (
                      <span className="chat-contact-badge">{contacto.mensajes_no_leidos}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Conversacion */
            <>
              <div className="chat-messages" ref={mensajesRef}>
                {cargando ? (
                  <div className="chat-loading">Cargando mensajes...</div>
                ) : mensajes.length === 0 ? (
                  <div className="chat-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>Inicia la conversacion</p>
                  </div>
                ) : (
                  mensajes.map((msg, index) => {
                    const mostrarFecha = index === 0 ||
                      formatearFecha(msg.fecha_envio) !== formatearFecha(mensajes[index - 1]?.fecha_envio);

                    return (
                      <React.Fragment key={msg.id}>
                        {mostrarFecha && (
                          <div className="chat-fecha-separador">
                            {formatearFecha(msg.fecha_envio)}
                          </div>
                        )}
                        <div className={`chat-message ${msg.direccion} ${msg.enviando ? 'enviando' : ''} ${msg.error ? 'error' : ''}`}>
                          <div className="chat-message-content">
                            {msg.mensaje}
                          </div>
                          <div className="chat-message-time">
                            {formatearHora(msg.fecha_envio)}
                            {msg.enviando && <span className="chat-sending-indicator">...</span>}
                            {msg.error && <span className="chat-error-indicator">!</span>}
                            {msg.direccion === 'enviado' && msg.leido === 1 && (
                              <span className="chat-read-indicator">✓✓</span>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Escribe un mensaje..."
                  value={mensajeInput}
                  onChange={(e) => setMensajeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensaje()}
                  disabled={enviando}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleEnviarMensaje}
                  disabled={enviando || !mensajeInput.trim()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatFlotante;
