import React, { useState, useEffect, useRef } from 'react';
import config from '../../config/env';

function ChatApoderado({ usuario, pupiloSeleccionado }) {
  // Estados principales
  const [chatAbierto, setChatAbierto] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('docentes'); // Solo docentes por defecto
  const [busqueda, setBusqueda] = useState('');

  // Estados de datos
  const [contactos, setContactos] = useState([]);

  // Estados de chat activo
  const [contactoActual, setContactoActual] = useState(null);
  const [conversacionActiva, setConversacionActiva] = useState(null); // ID y datos de la conversacion
  const [mensajes, setMensajes] = useState([]);
  const [mensajeInput, setMensajeInput] = useState('');
  const [respuestaHabilitada, setRespuestaHabilitada] = useState(true);

  // Estados de UI
  const [cargando, setCargando] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);

  // Estados de panel movil
  const [mostrarListaMobile, setMostrarListaMobile] = useState(true);

  const mensajesRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

  // ==================== API CALLS ====================

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const cargarContactos = async () => {
    if (!usuario?.id) return;

    try {
      // Priorizar el establecimiento del pupilo seleccionado
      const establecimientoId = pupiloSeleccionado?.establecimiento_id || usuario.establecimiento_id;

      if (!establecimientoId) {
        console.warn('No hay establecimiento ID disponible para cargar contactos');
        return;
      }

      let url = `${config.apiBaseUrl}/chat/contactos?usuario_id=${usuario.id}&establecimiento_id=${establecimientoId}`;
      // Si hay un pupilo seleccionado, enviamos su ID para que el backend filtre asignaturas
      if (pupiloSeleccionado?.id) {
        url += `&alumno_id=${pupiloSeleccionado.id}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Error al cargar contactos');

      const data = await response.json();
      if (data.success) {
        setContactos(data.data);
        const noLeidos = data.data.reduce((acc, c) => acc + (c.mensajes_no_leidos || 0), 0);
        setTotalNoLeidos(noLeidos);
      }
    } catch (error) {
      console.error('Error cargando contactos:', error);
    }
  };

  const iniciarConversacion = async (contacto) => {
    if (!usuario?.id || !contacto?.usuario_id) return;

    try {
      setCargandoMensajes(true);

      // 1. Obtener o crear conversacion
      const response = await fetch(`${config.apiBaseUrl}/chat/conversacion`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          usuario_id: usuario.id,
          otro_usuario_id: contacto.usuario_id,
          establecimiento_id: usuario.establecimiento_id,
          asunto: `Chat con ${usuario.nombres}`,
          contexto_tipo: 'general'
        })
      });

      if (!response.ok) throw new Error('Error al iniciar conversacion');

      const data = await response.json();
      if (data.success && data.data.id) {
        const conversacionId = data.data.id;
        setConversacionActiva({ id: conversacionId }); // Guardamos ID basico temporalmente

        // 2. Cargar mensajes
        await cargarMensajes(conversacionId);
      }

    } catch (error) {
      console.error('Error iniciando conversacion:', error);
      alert('No se pudo abrir el chat. Intente nuevamente.');
    } finally {
      setCargandoMensajes(false);
    }
  };

  const cargarMensajes = async (conversacionId) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/chat/conversacion/${conversacionId}/mensajes?usuario_id=${usuario.id}&limite=50`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Error cargando mensajes');

      const data = await response.json();
      if (data.success) {
        setMensajes(data.data);
        verificarEstadoBloqueo(conversacionId);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const verificarEstadoBloqueo = async (conversacionId) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/chat/conversaciones?usuario_id=${usuario.id}&establecimiento_id=${usuario.establecimiento_id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const conv = data.data.find(c => c.id === conversacionId);
          if (conv) {
            setRespuestaHabilitada(conv.respuesta_habilitada === 1);
          }
        }
      }
    } catch (e) { console.error(e); }
  };

  // ==================== EFFECTS ====================

  // Cargar contactos al abrir o al cambiar pupilo
  useEffect(() => {
    if (chatAbierto) {
      cargarContactos();
      // Polling para actualizar lista de contactos (no leidos)
      const interval = setInterval(cargarContactos, 10000); // Cada 10s
      return () => clearInterval(interval);
    }
  }, [chatAbierto, usuario, pupiloSeleccionado]); // <--- Dependencia CRUCIAL

  // Polling de mensajes activos
  useEffect(() => {
    if (chatAbierto && conversacionActiva?.id) {
      const interval = setInterval(() => {
        cargarMensajes(conversacionActiva.id);
      }, 3000); // Cada 3s actualiza chat activo
      pollingRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [chatAbierto, conversacionActiva]);

  // Scroll al final
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Focus input
  useEffect(() => {
    if (contactoActual && inputRef.current && !cargandoMensajes) {
      inputRef.current.focus();
    }
  }, [contactoActual, cargandoMensajes]);


  // ==================== HANDLERS ====================

  const toggleChat = () => {
    setChatAbierto(!chatAbierto);
    if (!chatAbierto) {
      setContactoActual(null);
      setConversacionActiva(null);
      setMensajes([]);
      setMostrarListaMobile(true);
    }
  };

  const seleccionarContacto = async (contacto) => {
    setContactoActual(contacto);
    setMostrarListaMobile(false);
    setMensajes([]);
    setRespuestaHabilitada(true);

    await iniciarConversacion(contacto);

    // Marcar leidos visualmente
    setContactos(prev => prev.map(c =>
      c.usuario_id === contacto.usuario_id
        ? { ...c, mensajes_no_leidos: 0 }
        : c
    ));
    setTotalNoLeidos(prev => Math.max(0, prev - (contacto.mensajes_no_leidos || 0)));
  };

  const handleEnviarMensaje = async () => {
    if (!mensajeInput.trim() || !conversacionActiva || enviando) return;
    if (!respuestaHabilitada) {
      alert("No puedes responder a esta conversación porque el docente la ha finalizado o bloqueado.");
      return;
    }

    const textoMensaje = mensajeInput.trim();
    setMensajeInput('');
    setEnviando(true);

    const tempId = `temp-${Date.now()}`;
    const nuevoMensaje = {
      id: tempId,
      mensaje: textoMensaje,
      direccion: 'enviado',
      fecha_envio: new Date().toISOString(),
      enviando: true,
      leido: 0
    };
    setMensajes(prev => [...prev, nuevoMensaje]);

    try {
      const response = await fetch(`${config.apiBaseUrl}/chat/mensaje`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversacion_id: conversacionActiva.id,
          remitente_id: usuario.id,
          mensaje: textoMensaje,
          tipo_mensaje: 'texto'
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          setRespuestaHabilitada(false);
          throw new Error('El docente ha bloqueado las respuestas.');
        }
        throw new Error('Error enviando mensaje');
      }

      const data = await response.json();
      if (data.success) {
        setMensajes(prev => prev.map(m =>
          m.id === tempId ? { ...data.data, direccion: 'enviado' } : m
        ));
      }

    } catch (error) {
      console.error(error);
      alert(error.message || 'Error al enviar mensaje');
      setMensajes(prev => prev.map(m =>
        m.id === tempId ? { ...m, error: true, enviando: false } : m
      ));
    } finally {
      setEnviando(false);
    }
  };

  const volverALista = () => {
    setContactoActual(null);
    setConversacionActiva(null);
    setMensajes([]);
    setMostrarListaMobile(true);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  // ==================== HELPERS ====================

  const formatearHora = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatearFechaSeparador = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  };

  const getIniciales = (nombre) => {
    if (!nombre) return '?';
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  const getContactosFiltrados = () => {
    let lista = contactos;
    // Si queremos filtrar por tipo cuando existan más tipos, aquí es donde.
    // Actualmente el backend ya devuelve lo correcto para apoderado.

    if (busqueda) {
      lista = lista.filter(c =>
        c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.especialidad && c.especialidad.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }
    return lista;
  };

  // ==================== RENDER ====================

  return (
    <>
      {/* FAB Button */}
      <button className="chatv2-fab" onClick={toggleChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {totalNoLeidos > 0 && (
          <span className="chatv2-fab-badge">{totalNoLeidos > 99 ? '99+' : totalNoLeidos}</span>
        )}
      </button>

      {/* Overlay */}
      {chatAbierto && <div className="chatv2-overlay" onClick={toggleChat}></div>}

      {/* Modal Principal */}
      <div className={`chatv2-modal ${chatAbierto ? 'active' : ''}`}>

        {/* Header del Modal */}
        <div className="chatv2-header">
          <div className="chatv2-header-left">
            <svg className="chatv2-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="chatv2-header-title">
              Mensanería {pupiloSeleccionado ? `- ${pupiloSeleccionado.nombres}` : ''}
            </span>
            {totalNoLeidos > 0 && (
              <span className="chatv2-header-badge">{totalNoLeidos}</span>
            )}
          </div>
          <button className="chatv2-close-btn" onClick={toggleChat}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="chatv2-content">

          {/* Columna 1: Navegacion Estática Lateral */}
          <div className={`chatv2-nav ${!mostrarListaMobile ? 'hidden-mobile' : ''}`} style={{ width: '40px', padding: '10px 0', alignItems: 'center' }}>
            <div className="chatv2-nav-static" style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              color: '#64748b',
              fontWeight: 'bold',
              fontSize: '12px',
              letterSpacing: '1px',
              height: '100%',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              CONTACTOS
            </div>
          </div>

          {/* Columna 2: Lista de Contactos */}
          <div className={`chatv2-list ${!mostrarListaMobile ? 'hidden-mobile' : ''}`}>

            {/* Barra de busqueda */}
            <div className="chatv2-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Lista de contactos */}
            <div className="chatv2-list-items">
              {cargando ? (
                <div className="chatv2-loading">
                  <div className="chatv2-spinner"></div>
                  <span>Cargando...</span>
                </div>
              ) : getContactosFiltrados().length === 0 ? (
                <div className="chatv2-empty-list">
                  <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    {pupiloSeleccionado ? 'No hay docentes disponibles.' : 'Selecciona un pupilo arriba.'}
                  </p>
                </div>
              ) : (
                getContactosFiltrados().map(contacto => (
                  <div
                    key={contacto.usuario_id}
                    className={`chatv2-list-item ${contactoActual?.usuario_id === contacto.usuario_id ? 'active' : ''}`}
                    onClick={() => seleccionarContacto(contacto)}
                  >
                    <div className={`chatv2-avatar ${contacto.es_admin ? 'admin' : 'docente'}`}>
                      {getIniciales(contacto.nombre_completo)}
                      {contacto.mensajes_no_leidos > 0 && (
                        <span className="chatv2-avatar-badge"></span>
                      )}
                    </div>
                    <div className="chatv2-list-item-info">
                      <div className="chatv2-list-item-header">
                        <span className="chatv2-list-item-name">
                          {contacto.nombre_completo}
                          {contacto.es_admin === 1 && <span className="chatv2-tag admin">Admin</span>}
                        </span>
                      </div>
                      {/* Aquí mostramos las asignaturas en lugar de la especialidad genérica */}
                      <div className="chatv2-list-item-preview">
                        <span className="chatv2-list-item-role" style={{ fontSize: '11px', color: '#64748b' }}>
                          {contacto.tipo === 'administrador' ? 'Administración' : (contacto.asignaturas || 'Docente General')}
                        </span>
                      </div>
                    </div>
                    {contacto.mensajes_no_leidos > 0 && (
                      <span className="chatv2-unread-badge">{contacto.mensajes_no_leidos}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 3: Area de Chat */}
          <div className={`chatv2-chat ${mostrarListaMobile ? 'hidden-mobile' : ''}`}>

            {contactoActual ? (
              <>
                {/* Header del Chat */}
                <div className="chatv2-chat-header">
                  <button className="chatv2-back-btn" onClick={volverALista}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <div className={`chatv2-avatar small ${contactoActual.es_admin ? 'admin' : 'docente'}`}>
                    {getIniciales(contactoActual.nombre_completo)}
                  </div>
                  <div className="chatv2-chat-header-info">
                    <span className="chatv2-chat-header-name">{contactoActual.nombre_completo}</span>
                    <span className="chatv2-chat-header-status">
                      {!respuestaHabilitada ? 'Respuestas bloqueadas' : 'En línea'}
                    </span>
                  </div>
                  <div className="chatv2-chat-header-actions">
                    <button
                      className="chatv2-cancel-masivo"
                      onClick={volverALista}
                      title="Cerrar chat"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Area de Mensajes */}
                <div className="chatv2-messages" ref={mensajesRef}>
                  {cargandoMensajes ? (
                    <div className="chatv2-loading">
                      <div className="chatv2-spinner"></div>
                      <span>Cargando mensajes...</span>
                    </div>
                  ) : mensajes.length === 0 ? (
                    <div className="chatv2-empty-chat">
                      <p>Inicia la conversación con {contactoActual.nombre_completo} para tu pupilo {pupiloSeleccionado.nombres}.</p>
                    </div>
                  ) : (
                    mensajes.map((msg, index) => {
                      const mostrarFecha = index === 0 ||
                        formatearFechaSeparador(msg.fecha_envio) !== formatearFechaSeparador(mensajes[index - 1]?.fecha_envio);

                      return (
                        <React.Fragment key={msg.id}>
                          {mostrarFecha && (
                            <div className="chatv2-date-separator">
                              <span>{formatearFechaSeparador(msg.fecha_envio)}</span>
                            </div>
                          )}
                          <div className={`chatv2-message ${msg.direccion} ${msg.enviando ? 'sending' : ''} ${msg.error ? 'error' : ''}`}>
                            <div className="chatv2-message-bubble">
                              <p>{msg.mensaje}</p>
                              <div className="chatv2-message-meta">
                                <span className="chatv2-message-time">{formatearHora(msg.fecha_envio)}</span>
                                {msg.enviando && <span className="chatv2-message-sending">...</span>}
                                {msg.error && <span className="chatv2-message-error" title="No enviado">!</span>}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}

                  {!respuestaHabilitada && (
                    <div style={{
                      textAlign: 'center',
                      margin: '10px 20px',
                      padding: '10px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      🚫 El docente ha cerrado las respuestas en esta conversación.
                    </div>
                  )}
                </div>

                {/* Input de Mensaje */}
                <div className="chatv2-input-area">
                  <div className="chatv2-input-wrapper">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={respuestaHabilitada ? "Escribe un mensaje..." : "Respuestas deshabilitadas"}
                      value={mensajeInput}
                      onChange={(e) => setMensajeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensaje()}
                      disabled={enviando || !respuestaHabilitada}
                      style={!respuestaHabilitada ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                  <button
                    className="chatv2-send-btn"
                    onClick={handleEnviarMensaje}
                    disabled={enviando || !mensajeInput.trim() || !respuestaHabilitada}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="chatv2-placeholder">
                <div className="chatv2-placeholder-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <h3>Selecciona un contacto</h3>
                <p>Elige un docente de la lista para conversar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .chatv2-pupilo-info {
          padding: 8px 16px;
          background: #f0f9ff;
          border-bottom: 1px solid #e0f2fe;
          font-size: 12px;
          color: #0369a1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chatv2-avatar.docente {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
      `}</style>
    </>
  );
}

export default ChatApoderado;
