import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  obtenerContactos,
  obtenerMensajes,
  crearConversacion,
  enviarMensaje,
  marcarConversacionLeida,
  obtenerNoLeidos,
  obtenerNuevosMensajes,
  obtenerCursosDocente,
  obtenerAlumnosCurso,
  habilitarRespuesta,
  enviarMensajeMasivo
} from '../services/chatService';


function ChatFlotante({ usuario, establecimientoId }) {
  const [chatAbierto, setChatAbierto] = useState(false);
  const [contactoActual, setContactoActual] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // chat, institucional, cursos
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [conversacionActual, setConversacionActual] = useState(null);
  const [mensajeInput, setMensajeInput] = useState('');
  const [contactos, setContactos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);
  const [ultimoTimestamp, setUltimoTimestamp] = useState(null);
  const [respuestaHabilitada, setRespuestaHabilitada] = useState(true); // Default true (will update on load)
  const [esMensajeMasivo, setEsMensajeMasivo] = useState(false);
  const [destinatariosMasivos, setDestinatariosMasivos] = useState([]);
  const [nombreDestinatarioMasivo, setNombreDestinatarioMasivo] = useState('');

  const mensajesRef = useRef(null);
  const pollingRef = useRef(null);

  // Verificar si el usuario puede usar el chat (solo docentes y admins)
  const puedeUsarChat = usuario &&
    (usuario.tipo === 'docente' || usuario.tipo === 'administrador' || usuario.tipo === 'admin');

  // Cargar contactos al abrir el chat (Institucional)
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

  // Cargar cursos
  const cargarCursos = useCallback(async () => {
    if (!usuario?.id || !establecimientoId) return;
    setCargando(true);
    try {
      const resultado = await obtenerCursosDocente(usuario.id, establecimientoId);
      if (resultado.success) {
        setCursos(resultado.data || []);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setCargando(false);
    }
  }, [usuario?.id, establecimientoId]);

  // Cargar alumnos
  const cargarAlumnos = async (cursoId) => {
    setCargando(true);
    setAlumnos([]);
    try {
      const resultado = await obtenerAlumnosCurso(cursoId, usuario.id);
      if (resultado.success) {
        setAlumnos(resultado.data || []);
      }
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar mensajes de una conversacion
  const cargarMensajes = useCallback(async (conversacionId) => {
    if (!conversacionId || !usuario?.id) return;

    setCargando(true);
    try {
      const resultado = await obtenerMensajes(conversacionId, usuario.id);
      if (resultado.success) {
        setMensajes(resultado.data || []);
        // Si hay mensajes, verificar si la respuesta esta habilitada (se asume que viene en la conversacion, pero obtenerMensajes retorna mensajes)
        // Necesitamos la info de la conversacion. La info completa.
        // Por ahora, asumimos que viene en el endpoint de mensajes o lo manejamos separado.
        // En realidad, createConversacion retorna informacion.

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

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (chatAbierto && puedeUsarChat) {
      if (activeTab === 'institucional') cargarContactos();
      if (activeTab === 'cursos') cargarCursos();
      actualizarNoLeidos();
    }
  }, [chatAbierto, puedeUsarChat, activeTab, cargarContactos, cargarCursos, actualizarNoLeidos]);

  // Efecto para polling cada 5 segundos
  useEffect(() => {
    if (chatAbierto && puedeUsarChat && activeTab === 'chat' & conversacionActual !== null) {
      // Solo hacer polling si estamos en una conversacion o en la lista de chats activos (si existiera lista de chats)
      // Como el diseño actual es "contactos" o "conversacion", el polling de mensajes nuevos en la conversacion activa es critico.
      pollingRef.current = setInterval(verificarNuevosMensajes, 5000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [chatAbierto, puedeUsarChat, verificarNuevosMensajes, activeTab, conversacionActual]);

  // Efecto para actualizar no leidos periodicamente (cuando el chat esta cerrado)
  useEffect(() => {
    if (puedeUsarChat) {
      actualizarNoLeidos(); // Al montar
      const interval = setInterval(actualizarNoLeidos, 30000); // cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [puedeUsarChat, actualizarNoLeidos]);

  // Scroll al ultimo mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  const toggleChat = () => {
    setChatAbierto(!chatAbierto);
    if (!chatAbierto) {
      // Resetear estados al abrir
      setContactoActual(null);
      setConversacionActual(null);
      setMensajes([]);
      // Default a tab institucional si no hay nada
      if (activeTab === 'chat' && !conversacionActual) setActiveTab('institucional');
    } else {
      // Al cerrar (opcional: limpiar o mantener estado?)
      // setContactoActual(null);
      // setConversacionActual(null);
    }
  };

  const seleccionarContacto = async (contacto, tipoContacto = 'institucional') => {
    setContactoActual({
      ...contacto,
      nombre_completo: contacto.nombre_completo || contacto.nombre_apoderado || contacto.nombre_alumno // Handling differnt object shapes
    });
    setEsMensajeMasivo(false);
    setCargando(true);

    try {
      // Crear o recuperar conversacion
      const resultado = await crearConversacion(
        usuario.id,
        contacto.usuario_id || contacto.apoderado_usuario_id, // Apoderado ID logic
        establecimientoId
      );

      if (resultado.success) {
        setConversacionActual(resultado.data.id);

        // Fix: backend now returns 'respuesta_habilitada' in getConversaciones, but createConversacion returns data object.
        // Assuming createConversacion response structure or fetch it.
        // If we just got the ID, we have to assume default or fetch details.
        // For simplicity, let's look at the result data if it has the flag, otherwise default based on type.
        if (resultado.data.respuesta_habilitada !== undefined) {
          setRespuestaHabilitada(resultado.data.respuesta_habilitada === 1);
        } else {
          // If info missing, default to true unless it is parent (logic handled in backend creation)
          // We can update state later if needed
          setRespuestaHabilitada(true); // Temp default
        }

        await cargarMensajes(resultado.data.id);

        // Actualizar no leidos del contacto
        // ... (logic for specific contact update skipped for brevity, full reload might be needed or smart update)
        actualizarNoLeidos();
      }
    } catch (error) {
      console.error('Error al seleccionar contacto:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarCurso = (curso) => {
    setCursoSeleccionado(curso);
    cargarAlumnos(curso.id);
  };

  const iniciarMensajeMasivo = (curso, listaAlumnos) => {
    setEsMensajeMasivo(true);
    setDestinatariosMasivos(listaAlumnos.map(a => a.apoderado_usuario_id));
    setContactoActual({ nombre_completo: `Todos - ${curso.grado}° ${curso.letra}`, tipo: 'curso' });
    setConversacionActual('masivo'); // Dummy ID
    setMensajes([]);
  };

  const handleEnviarMensaje = async () => {
    if (!mensajeInput.trim() || !conversacionActual || enviando) return;

    const textoMensaje = mensajeInput.trim();
    setMensajeInput('');
    setEnviando(true);

    // Si es masivo
    if (esMensajeMasivo) {
      try {
        // Add optimistic message (fake)
        const mensajeOptimista = {
          id: `temp-${Date.now()}`,
          mensaje: textoMensaje,
          direccion: 'enviado',
          fecha_envio: new Date().toISOString(),
          enviando: true
        };
        setMensajes(prev => [...prev, mensajeOptimista]);

        const resultado = await enviarMensajeMasivo(
          usuario.id,
          destinatariosMasivos,
          textoMensaje,
          establecimientoId
        );

        if (resultado.success) {
          // Update optimistic
          setMensajes(prev => prev.map(m =>
            m.id === mensajeOptimista.id
              ? { ...m, enviando: false, leido: 1 } // Fake leido
              : m
          ));
        } else {
          setMensajes(prev => prev.map(m =>
            m.id === mensajeOptimista.id
              ? { ...m, error: true, enviando: false }
              : m
          ));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setEnviando(false);
      }
      return;
    }

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

  const toggleRespuestaHabilitada = async () => {
    if (!conversacionActual || esMensajeMasivo) return;
    const nuevoEstado = !respuestaHabilitada;
    setRespuestaHabilitada(nuevoEstado); // Optimistic UI

    const resultado = await habilitarRespuesta(conversacionActual, nuevoEstado);
    if (!resultado.success) {
      setRespuestaHabilitada(!nuevoEstado); // Revert on error
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

      {/* Modal del chat estilo WhatsApp */}
      <div className={`chat-modal ${chatAbierto ? 'active' : ''}`}>

        {/* Cabecera Principal */}
        <div className="chat-header">
          <div className="chat-header-title">Chat Docente</div>
          <button className="chat-close-btn" onClick={toggleChat}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={`chat-body ${contactoActual ? 'chat-mobile-view-messages' : 'chat-mobile-view-sidebar'}`}>
          {/* Columna Izquierda: Tabs y Listas */}
          <div className="chat-contacts-full">
            <div className="chat-tabs">
              <button
                className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >Chat</button>
              <button
                className={`chat-tab ${activeTab === 'institucional' ? 'active' : ''}`}
                onClick={() => setActiveTab('institucional')}
              >Institucional</button>
              <button
                className={`chat-tab ${activeTab === 'cursos' ? 'active' : ''}`}
                onClick={() => setActiveTab('cursos')}
              >Cursos</button>
            </div>

            <div className="chat-students-list">
              {activeTab === 'institucional' && (
                cargando ? (
                  <div className="chat-loading">Cargando colegas...</div>
                ) : contactos.length === 0 ? (
                  <div className="chat-empty">No hay colegas disponibles</div>
                ) : (
                  contactos.map(contacto => (
                    <div
                      key={contacto.usuario_id}
                      className={`chat-contact-item ${contacto.es_admin ? 'admin-contact' : ''} ${contactoActual?.usuario_id === contacto.usuario_id ? 'active' : ''}`}
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
                          {contacto.es_admin === 1 && <span className="chat-admin-badge">Admin</span>}
                        </div>
                        <div className="chat-contact-tipo">
                          {contacto.tipo === 'administrador' ? 'Administrador' : 'Docente'}
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === 'cursos' && (
                cursoSeleccionado ? (
                  // Lista de Alumnos del curso
                  cargando ? <div className="chat-loading">Cargando alumnos...</div> :
                    <>
                      <button className="chat-back-sub" onClick={() => setCursoSeleccionado(null)}>
                        ← Volver a cursos
                      </button>
                      <div className="chat-contact-item special-row" onClick={() => iniciarMensajeMasivo(cursoSeleccionado, alumnos)}>
                        <div className="chat-contact-avatar all-avatar">T</div>
                        <div className="chat-contact-info">
                          <div className="chat-contact-name">Todos</div>
                          <div className="chat-contact-tipo">Enviar a todos los apoderados</div>
                        </div>
                      </div>
                      {alumnos.map(alumno => (
                        <div
                          key={alumno.alumno_id}
                          className={`chat-contact-item ${contactoActual?.apoderado_usuario_id === alumno.apoderado_usuario_id ? 'active' : ''}`}
                          onClick={() => seleccionarContacto(alumno, 'apoderado')}
                        >
                          <div className="chat-contact-avatar">
                            <span>{alumno.nombre_alumno.charAt(0)}</span>
                          </div>
                          <div className="chat-contact-info">
                            <div className="chat-contact-name">{alumno.nombre_alumno}</div>
                            <div className="chat-contact-tipo">Apoderado: {alumno.nombre_apoderado}</div>
                          </div>
                        </div>
                      ))}
                    </>
                ) : (
                  // Lista de Cursos
                  cargando ? <div className="chat-loading">Cargando cursos...</div> :
                    cursos.map(curso => (
                      <div key={curso.id} className="chat-contact-item" onClick={() => seleccionarCurso(curso)}>
                        <div className="chat-contact-avatar course-avatar">
                          {curso.grado}{curso.letra}
                        </div>
                        <div className="chat-contact-info">
                          <div className="chat-contact-name">{curso.grado}° {curso.letra} {curso.nivel}</div>
                          <div className="chat-contact-tipo">{curso.nombre}</div>
                        </div>
                      </div>
                    ))
                )
              )}

              {activeTab === 'chat' && (
                <div className="chat-empty">
                  <p style={{ textAlign: 'center', marginTop: 20 }}>Selecciona Institucional o Cursos para iniciar</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Area de Mensajes */}
          <div className="chat-messages-area">
            {contactoActual ? (
              <>
                {/* Header especifico del contacto */}
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{contactoActual.nombre_completo}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{contactoActual.tipo === 'curso' ? 'Difusión masiva' : contactoActual.tipo || 'Chat'}</span>
                  </div>
                  {/* Boton volver en movil solo */}
                  <button
                    className="chat-back-sub"
                    style={{ border: 'none', background: 'none', display: 'none' }} // Hidden on desktop logic via CSS media query if needed
                    onClick={() => {
                      setContactoActual(null);
                      setConversacionActual(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

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

                {!esMensajeMasivo && (
                  <div className="chat-permissions">
                    <button
                      className={`perm-btn ${respuestaHabilitada ? 'active' : ''}`}
                      onClick={toggleRespuestaHabilitada}
                      title={respuestaHabilitada ? "Apoderado puede responder" : "Apoderado no puede responder"}
                    >
                      {respuestaHabilitada ? "Respuesta Habilitada" : "Habilitar respuesta"}
                      <div className={`toggle-switch ${respuestaHabilitada ? 'on' : 'off'}`}></div>
                    </button>
                  </div>
                )}

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
            ) : (
              <div className="chat-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <p>Selecciona un contacto para comenzar a chatear</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatFlotante;
