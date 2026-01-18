import React, { useState, useEffect, useRef } from 'react';

function ChatApoderado({ usuario, pupiloSeleccionado }) {
  // Estados principales
  const [chatAbierto, setChatAbierto] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('todos'); // todos, docentes, administracion
  const [busqueda, setBusqueda] = useState('');

  // Estados de datos (mock - sin conexion a BD)
  const [contactos, setContactos] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);

  // Estados de chat activo
  const [contactoActual, setContactoActual] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeInput, setMensajeInput] = useState('');

  // Estados de UI
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);

  // Estados de panel movil
  const [mostrarListaMobile, setMostrarListaMobile] = useState(true);

  const mensajesRef = useRef(null);
  const inputRef = useRef(null);

  // Datos mock de contactos (docentes y administradores)
  const contactosMock = [
    {
      id: 1,
      usuario_id: 101,
      nombre_completo: 'Maria Gonzalez',
      tipo: 'docente',
      asignatura: 'Matematicas',
      es_admin: 0,
      mensajes_no_leidos: 2,
      ultimo_mensaje: 'Recuerde enviar la tarea',
      ultimo_mensaje_fecha: new Date().toISOString()
    },
    {
      id: 2,
      usuario_id: 102,
      nombre_completo: 'Carlos Rodriguez',
      tipo: 'docente',
      asignatura: 'Lenguaje',
      es_admin: 0,
      mensajes_no_leidos: 0,
      ultimo_mensaje: 'Gracias por su respuesta',
      ultimo_mensaje_fecha: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      usuario_id: 103,
      nombre_completo: 'Ana Martinez',
      tipo: 'docente',
      asignatura: 'Ciencias',
      es_admin: 0,
      mensajes_no_leidos: 1,
      ultimo_mensaje: null,
      ultimo_mensaje_fecha: null
    },
    {
      id: 4,
      usuario_id: 104,
      nombre_completo: 'Director Juan Perez',
      tipo: 'administrador',
      cargo: 'Director',
      es_admin: 1,
      mensajes_no_leidos: 0,
      ultimo_mensaje: 'Bienvenido al sistema',
      ultimo_mensaje_fecha: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 5,
      usuario_id: 105,
      nombre_completo: 'Secretaria Laura Silva',
      tipo: 'administrador',
      cargo: 'Secretaria',
      es_admin: 1,
      mensajes_no_leidos: 0,
      ultimo_mensaje: null,
      ultimo_mensaje_fecha: null
    }
  ];

  // Mensajes mock para demo
  const mensajesMock = {
    101: [
      { id: 1, mensaje: 'Buenos dias, le informo que su hijo tiene una tarea pendiente de matematicas.', direccion: 'recibido', fecha_envio: new Date(Date.now() - 7200000).toISOString(), leido: 1 },
      { id: 2, mensaje: 'Gracias por informarme, revisare con el esta tarde.', direccion: 'enviado', fecha_envio: new Date(Date.now() - 3600000).toISOString(), leido: 1 },
      { id: 3, mensaje: 'Recuerde enviar la tarea antes del viernes.', direccion: 'recibido', fecha_envio: new Date().toISOString(), leido: 0 }
    ],
    102: [
      { id: 4, mensaje: 'Hola, queria consultar sobre el rendimiento de mi hijo en Lenguaje.', direccion: 'enviado', fecha_envio: new Date(Date.now() - 90000000).toISOString(), leido: 1 },
      { id: 5, mensaje: 'Su hijo ha mostrado mejoras significativas. Siga apoyandolo en casa.', direccion: 'recibido', fecha_envio: new Date(Date.now() - 87000000).toISOString(), leido: 1 },
      { id: 6, mensaje: 'Gracias por su respuesta', direccion: 'enviado', fecha_envio: new Date(Date.now() - 86400000).toISOString(), leido: 1 }
    ],
    104: [
      { id: 7, mensaje: 'Bienvenido al sistema de comunicacion del colegio.', direccion: 'recibido', fecha_envio: new Date(Date.now() - 172800000).toISOString(), leido: 1 }
    ]
  };

  // Cargar contactos mock al abrir el chat
  useEffect(() => {
    if (chatAbierto) {
      setContactos(contactosMock);
      const noLeidos = contactosMock.reduce((acc, c) => acc + (c.mensajes_no_leidos || 0), 0);
      setTotalNoLeidos(noLeidos);
    }
  }, [chatAbierto]);

  // Scroll al final de mensajes
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Focus en input al seleccionar contacto
  useEffect(() => {
    if (contactoActual && inputRef.current) {
      inputRef.current.focus();
    }
  }, [contactoActual]);

  // ==================== HANDLERS ====================

  const toggleChat = () => {
    setChatAbierto(!chatAbierto);
    if (!chatAbierto) {
      setContactoActual(null);
      setMensajes([]);
      setMostrarListaMobile(true);
    }
  };

  const seleccionarContacto = (contacto) => {
    setContactoActual(contacto);
    setMostrarListaMobile(false);

    // Cargar mensajes mock
    const msgs = mensajesMock[contacto.usuario_id] || [];
    setMensajes(msgs);

    // Simular marcar como leido
    setContactos(prev => prev.map(c =>
      c.usuario_id === contacto.usuario_id
        ? { ...c, mensajes_no_leidos: 0 }
        : c
    ));

    // Actualizar total no leidos
    setTotalNoLeidos(prev => Math.max(0, prev - (contacto.mensajes_no_leidos || 0)));
  };

  const handleEnviarMensaje = () => {
    if (!mensajeInput.trim() || !contactoActual || enviando) return;

    const textoMensaje = mensajeInput.trim();
    setMensajeInput('');
    setEnviando(true);

    // Agregar mensaje optimista
    const nuevoMensaje = {
      id: `temp-${Date.now()}`,
      mensaje: textoMensaje,
      direccion: 'enviado',
      fecha_envio: new Date().toISOString(),
      enviando: true
    };
    setMensajes(prev => [...prev, nuevoMensaje]);

    // Simular envio (sin BD real)
    setTimeout(() => {
      setMensajes(prev => prev.map(m =>
        m.id === nuevoMensaje.id
          ? { ...m, enviando: false, leido: 0 }
          : m
      ));
      setEnviando(false);
    }, 500);
  };

  const volverALista = () => {
    setContactoActual(null);
    setMensajes([]);
    setMostrarListaMobile(true);
  };

  // ==================== HELPERS ====================

  const formatearHora = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatearFechaRelativa = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return formatearHora(fecha);
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatearFechaSeparador = (fecha) => {
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

  // Filtrar contactos segun vista y busqueda
  const getContactosFiltrados = () => {
    let lista = contactos;

    // Filtrar por tipo
    if (vistaActiva === 'docentes') {
      lista = lista.filter(c => c.tipo === 'docente');
    } else if (vistaActiva === 'administracion') {
      lista = lista.filter(c => c.tipo === 'administrador');
    }

    // Filtrar por busqueda
    if (busqueda) {
      lista = lista.filter(c =>
        c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.asignatura && c.asignatura.toLowerCase().includes(busqueda.toLowerCase()))
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
            <span className="chatv2-header-title">Mensajes</span>
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

          {/* Columna 1: Navegacion */}
          <div className={`chatv2-nav ${!mostrarListaMobile ? 'hidden-mobile' : ''}`}>
            <button
              className={`chatv2-nav-item ${vistaActiva === 'todos' ? 'active' : ''}`}
              onClick={() => setVistaActiva('todos')}
              title="Todos"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Todos</span>
            </button>
            <button
              className={`chatv2-nav-item ${vistaActiva === 'docentes' ? 'active' : ''}`}
              onClick={() => setVistaActiva('docentes')}
              title="Docentes"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Docentes</span>
            </button>
            <button
              className={`chatv2-nav-item ${vistaActiva === 'administracion' ? 'active' : ''}`}
              onClick={() => setVistaActiva('administracion')}
              title="Administracion"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span>Admin</span>
            </button>
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
                placeholder="Buscar docente o admin..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Pupilo seleccionado */}
            {pupiloSeleccionado && (
              <div className="chatv2-pupilo-info">
                <span>Consultas sobre:</span>
                <strong>{pupiloSeleccionado.nombres} {pupiloSeleccionado.apellidos}</strong>
              </div>
            )}

            {/* Lista de contactos */}
            <div className="chatv2-list-items">
              {cargando ? (
                <div className="chatv2-loading">
                  <div className="chatv2-spinner"></div>
                  <span>Cargando...</span>
                </div>
              ) : getContactosFiltrados().length === 0 ? (
                <div className="chatv2-empty-list">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <span>Sin contactos disponibles</span>
                </div>
              ) : (
                getContactosFiltrados().map(contacto => (
                  <div
                    key={contacto.id}
                    className={`chatv2-list-item ${contactoActual?.id === contacto.id ? 'active' : ''}`}
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
                        <span className="chatv2-list-item-time">
                          {contacto.ultimo_mensaje_fecha && formatearFechaRelativa(contacto.ultimo_mensaje_fecha)}
                        </span>
                      </div>
                      <div className="chatv2-list-item-preview">
                        <span className="chatv2-list-item-role">
                          {contacto.tipo === 'administrador'
                            ? contacto.cargo
                            : contacto.asignatura || 'Docente'
                          }
                        </span>
                        {contacto.ultimo_mensaje && (
                          <span className="chatv2-list-item-lastmsg">
                            {contacto.ultimo_mensaje.length > 30
                              ? contacto.ultimo_mensaje.substring(0, 30) + '...'
                              : contacto.ultimo_mensaje
                            }
                          </span>
                        )}
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
                      {contactoActual.tipo === 'administrador'
                        ? contactoActual.cargo
                        : contactoActual.asignatura || 'Docente'
                      }
                    </span>
                  </div>
                </div>

                {/* Area de Mensajes */}
                <div className="chatv2-messages" ref={mensajesRef}>
                  {cargando ? (
                    <div className="chatv2-loading">
                      <div className="chatv2-spinner"></div>
                      <span>Cargando mensajes...</span>
                    </div>
                  ) : mensajes.length === 0 ? (
                    <div className="chatv2-empty-chat">
                      <div className="chatv2-empty-chat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <p>Inicia la conversacion</p>
                      <span>Envia un mensaje a {contactoActual.nombre_completo.split(' ')[0]}</span>
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
                                {msg.direccion === 'enviado' && !msg.enviando && !msg.error && (
                                  <span className="chatv2-message-status">
                                    {msg.leido === 1 ? (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                        <polyline points="20 12 9 23 4 18"></polyline>
                                      </svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    )}
                                  </span>
                                )}
                                {msg.enviando && (
                                  <span className="chatv2-message-sending">
                                    <div className="chatv2-mini-spinner"></div>
                                  </span>
                                )}
                                {msg.error && (
                                  <span className="chatv2-message-error" title="Error al enviar">!</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                {/* Input de Mensaje */}
                <div className="chatv2-input-area">
                  <div className="chatv2-input-wrapper">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={mensajeInput}
                      onChange={(e) => setMensajeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensaje()}
                      disabled={enviando}
                    />
                  </div>
                  <button
                    className="chatv2-send-btn"
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
            ) : (
              /* Placeholder cuando no hay chat seleccionado */
              <div className="chatv2-placeholder">
                <div className="chatv2-placeholder-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <h3>Selecciona un contacto</h3>
                <p>Elige un docente o administrador para iniciar una conversacion</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estilos adicionales para info del pupilo */}
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
        .chatv2-pupilo-info strong {
          color: #0c4a6e;
        }
        .chatv2-list-item-lastmsg {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chatv2-avatar.docente {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
      `}</style>
    </>
  );
}

export default ChatApoderado;
