/**
 * Servicio de Chat
 *
 * Maneja la comunicacion entre docentes y administradores
 * Solo funciona en modo produccion (requiere API real)
 */

import config from '../config/env';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Obtiene la lista de contactos disponibles para chat
 * @param {number} usuarioId - ID del usuario actual
 * @param {number} establecimientoId - ID del establecimiento
 * @returns {Promise<Object>} Lista de contactos (admins primero, luego docentes)
 */
export const obtenerContactos = async (usuarioId, establecimientoId) => {
  if (config.isDemoMode()) {
    // En modo demo, retornar datos de ejemplo
    return {
      success: true,
      data: [
        { usuario_id: 1, nombre_completo: 'Administrador Demo', tipo: 'administrador', es_admin: 1, mensajes_no_leidos: 0 },
        { usuario_id: 2, nombre_completo: 'Prof. Garcia', tipo: 'docente', es_admin: 0, mensajes_no_leidos: 2 },
        { usuario_id: 3, nombre_completo: 'Prof. Lopez', tipo: 'docente', es_admin: 0, mensajes_no_leidos: 0 }
      ]
    };
  }

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/chat/contactos?usuario_id=${usuarioId}&establecimiento_id=${establecimientoId}`,
      { headers: getAuthHeaders() }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener contactos' };
    }

    return data;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Obtiene las conversaciones del usuario
 * @param {number} usuarioId - ID del usuario actual
 * @param {number} establecimientoId - ID del establecimiento
 * @returns {Promise<Object>} Lista de conversaciones
 */
export const obtenerConversaciones = async (usuarioId, establecimientoId) => {
  if (config.isDemoMode()) {
    return { success: true, data: [] };
  }

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/chat/conversaciones?usuario_id=${usuarioId}&establecimiento_id=${establecimientoId}`,
      { headers: getAuthHeaders() }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener conversaciones' };
    }

    return data;
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Obtiene los mensajes de una conversacion
 * @param {number} conversacionId - ID de la conversacion
 * @param {number} usuarioId - ID del usuario actual
 * @param {number} limite - Cantidad de mensajes a obtener
 * @param {number} offset - Offset para paginacion
 * @returns {Promise<Object>} Lista de mensajes
 */
export const obtenerMensajes = async (conversacionId, usuarioId, limite = 50, offset = 0) => {
  if (config.isDemoMode()) {
    return {
      success: true,
      data: [
        { id: 1, mensaje: 'Hola, buenos dias', direccion: 'recibido', fecha_envio: new Date().toISOString() },
        { id: 2, mensaje: 'Buenos dias, en que puedo ayudarle?', direccion: 'enviado', fecha_envio: new Date().toISOString() }
      ]
    };
  }

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/chat/conversacion/${conversacionId}/mensajes?usuario_id=${usuarioId}&limite=${limite}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener mensajes' };
    }

    return data;
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Crea o recupera una conversacion existente
 * @param {number} usuarioId - ID del usuario actual
 * @param {number} otroUsuarioId - ID del otro participante
 * @param {number} establecimientoId - ID del establecimiento
 * @param {string} asunto - Asunto opcional
 * @returns {Promise<Object>} ID de la conversacion
 */
export const crearConversacion = async (usuarioId, otroUsuarioId, establecimientoId, asunto = null) => {
  if (config.isDemoMode()) {
    return { success: true, data: { id: 1 } };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/chat/conversacion`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        usuario_id: usuarioId,
        otro_usuario_id: otroUsuarioId,
        establecimiento_id: establecimientoId,
        asunto
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al crear conversacion' };
    }

    return data;
  } catch (error) {
    console.error('Error al crear conversacion:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Envia un mensaje
 * @param {number} conversacionId - ID de la conversacion
 * @param {number} remitenteId - ID del remitente
 * @param {string} mensaje - Texto del mensaje
 * @param {string} tipoMensaje - Tipo: 'texto', 'imagen', 'archivo'
 * @returns {Promise<Object>} Mensaje enviado
 */
export const enviarMensaje = async (conversacionId, remitenteId, mensaje, tipoMensaje = 'texto') => {
  if (config.isDemoMode()) {
    return {
      success: true,
      data: {
        id: Date.now(),
        conversacion_id: conversacionId,
        remitente_id: remitenteId,
        mensaje,
        tipo_mensaje: tipoMensaje,
        fecha_envio: new Date().toISOString(),
        leido: 0
      }
    };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/chat/mensaje`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        conversacion_id: conversacionId,
        remitente_id: remitenteId,
        mensaje,
        tipo_mensaje: tipoMensaje
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al enviar mensaje' };
    }

    return data;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Marca todos los mensajes de una conversacion como leidos
 * @param {number} conversacionId - ID de la conversacion
 * @param {number} usuarioId - ID del usuario actual
 * @returns {Promise<Object>} Resultado
 */
export const marcarConversacionLeida = async (conversacionId, usuarioId) => {
  if (config.isDemoMode()) {
    return { success: true };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/chat/conversacion/${conversacionId}/leer-todos`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ usuario_id: usuarioId })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al marcar como leido' };
    }

    return data;
  } catch (error) {
    console.error('Error al marcar conversacion como leida:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Obtiene el total de mensajes no leidos
 * @param {number} usuarioId - ID del usuario actual
 * @param {number} establecimientoId - ID del establecimiento
 * @returns {Promise<Object>} Total de mensajes no leidos
 */
export const obtenerNoLeidos = async (usuarioId, establecimientoId) => {
  if (config.isDemoMode()) {
    return { success: true, data: { total_no_leidos: 0 } };
  }

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/chat/no-leidos?usuario_id=${usuarioId}&establecimiento_id=${establecimientoId}`,
      { headers: getAuthHeaders() }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener no leidos' };
    }

    return data;
  } catch (error) {
    console.error('Error al obtener no leidos:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Polling para nuevos mensajes (tiempo real)
 * @param {number} usuarioId - ID del usuario actual
 * @param {number} establecimientoId - ID del establecimiento
 * @param {string} desde - Timestamp ISO desde donde buscar
 * @returns {Promise<Object>} Nuevos mensajes
 */
export const obtenerNuevosMensajes = async (usuarioId, establecimientoId, desde) => {
  if (config.isDemoMode()) {
    return { success: true, data: [], timestamp: new Date().toISOString() };
  }

  try {
    const url = desde
      ? `${config.apiBaseUrl}/chat/nuevos-mensajes?usuario_id=${usuarioId}&establecimiento_id=${establecimientoId}&desde=${desde}`
      : `${config.apiBaseUrl}/chat/nuevos-mensajes?usuario_id=${usuarioId}&establecimiento_id=${establecimientoId}`;

    const response = await fetch(url, { headers: getAuthHeaders() });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener nuevos mensajes' };
    }

    return data;
  } catch (error) {
    console.error('Error al obtener nuevos mensajes:', error);
    return { success: false, error: 'Error de conexion' };
  }
};

/**
 * Obtiene los cursos del docente para el chat
 */
export const obtenerCursosDocente = async (docenteId, establecimientoId) => {
  if (config.isDemoMode()) {
    return { success: true, data: [] };
  }
  try {
    const response = await fetch(`${config.apiBaseUrl}/chat/docente/${docenteId}/cursos?establecimiento_id=${establecimientoId}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message };
    return data;
  } catch (error) {
    return { success: false, error: 'Error de conexión' };
  }
};

/**
 * Obtiene los alumnos y apoderados de un curso
 */
export const obtenerAlumnosCurso = async (cursoId, docenteUsuarioId) => {
  if (config.isDemoMode()) {
    return { success: true, data: [] };
  }
  try {
    const response = await fetch(`${config.apiBaseUrl}/chat/curso/${cursoId}/alumnos-chat?usuario_id=${docenteUsuarioId}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message };
    return data;
  } catch (error) {
    return { success: false, error: 'Error de conexión' };
  }
};

/**
 * Habilita o deshabilita la respuesta del apoderado
 */
export const habilitarRespuesta = async (conversacionId, habilitado) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/chat/conversacion/${conversacionId}/habilitar-respuesta`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ habilitado })
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message };
    return data;
  } catch (error) {
    return { success: false, error: 'Error de conexión' };
  }
};

/**
 * Envía mensaje masivo a varios destinatarios
 */
export const enviarMensajeMasivo = async (remitenteId, destinatariosIds, mensaje, establecimientoId) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/chat/mensaje-masivo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remitente_id: remitenteId, destinatarios_ids: destinatariosIds, mensaje, establecimiento_id: establecimientoId })
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message };
    return data;
  } catch (error) {
    return { success: false, error: 'Error de conexión' };
  }
};

export default {
  obtenerContactos,
  obtenerConversaciones,
  obtenerMensajes,
  crearConversacion,
  enviarMensaje,
  marcarConversacionLeida,
  obtenerNoLeidos,
  obtenerNoLeidos,
  obtenerNuevosMensajes,
  obtenerCursosDocente,
  obtenerAlumnosCurso,
  habilitarRespuesta,
  enviarMensajeMasivo
};
