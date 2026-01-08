import React, { useState } from 'react';

function ChatFlotante() {
  const [chatAbierto, setChatAbierto] = useState(false);
  const [contactoActual, setContactoActual] = useState(null);
  const [mensajeInput, setMensajeInput] = useState('');
  const [contactos, setContactos] = useState([
    { id: 1, nombre: 'M. Gonzalez', tipo: 'Docente', mensajes_no_leidos: 2 },
    { id: 2, nombre: 'J. Rodriguez', tipo: 'Docente', mensajes_no_leidos: 0 },
    { id: 3, nombre: 'A. Lopez', tipo: 'Docente', mensajes_no_leidos: 1 },
    { id: 4, nombre: 'P. Martinez', tipo: 'Docente', mensajes_no_leidos: 0 }
  ]);

  const mensajesDemo = [
    { id: 1, mensaje: 'Buenos dias, ¿como puedo ayudarle?', tipo: 'recibido', fecha_envio: '2024-01-15 09:30:00' },
    { id: 2, mensaje: 'Necesito informacion sobre las notas del trimestre', tipo: 'enviado', fecha_envio: '2024-01-15 09:32:00' },
    { id: 3, mensaje: 'Claro, las notas estan actualizadas en el sistema', tipo: 'recibido', fecha_envio: '2024-01-15 09:35:00' }
  ];

  const toggleChat = () => {
    setChatAbierto(!chatAbierto);
  };

  const seleccionarContacto = (contacto) => {
    setContactoActual(contacto);
    // Marcar mensajes como leídos al abrir el chat
    if (contacto.mensajes_no_leidos > 0) {
      setContactos(prevContactos =>
        prevContactos.map(c =>
          c.id === contacto.id ? { ...c, mensajes_no_leidos: 0 } : c
        )
      );
    }
  };

  const enviarMensaje = () => {
    if (mensajeInput.trim()) {
      setMensajeInput('');
      // En demo solo limpiamos el input
    }
  };

  const formatearHora = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const totalNoLeidos = contactos.reduce((acc, c) => acc + c.mensajes_no_leidos, 0);

  return (
    <>
      {/* Botón flotante */}
      <button className="chat-fab" onClick={toggleChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {totalNoLeidos > 0 && (
          <span className="chat-fab-badge">{totalNoLeidos}</span>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Chat con Docentes
          </div>
          <button className="chat-close-btn" onClick={toggleChat}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="chat-body">
          <div className="chat-contacts">
            {contactos.map(contacto => (
              <div
                key={contacto.id}
                className={`chat-contact-item ${contactoActual?.id === contacto.id ? 'active' : ''}`}
                onClick={() => seleccionarContacto(contacto)}
              >
                <div className="chat-contact-name">{contacto.nombre}</div>
                <div className="chat-contact-tipo">{contacto.tipo}</div>
                {contacto.mensajes_no_leidos > 0 && (
                  <span className="chat-contact-badge">{contacto.mensajes_no_leidos}</span>
                )}
              </div>
            ))}
          </div>
          <div className="chat-conversation">
            <div className="chat-messages">
              {contactoActual ? (
                mensajesDemo.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.tipo}`}>
                    {msg.mensaje}
                    <div className="chat-message-time">{formatearHora(msg.fecha_envio)}</div>
                  </div>
                ))
              ) : (
                <div className="chat-select-contact">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Selecciona un docente para iniciar una conversacion
                </div>
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Escribe un mensaje..."
                value={mensajeInput}
                onChange={(e) => setMensajeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                disabled={!contactoActual}
              />
              <button
                className="chat-send-btn"
                onClick={enviarMensaje}
                disabled={!contactoActual}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatFlotante;
