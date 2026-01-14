/**
 * Servicio de Contacto
 *
 * Maneja el envio de consultas de contacto desde la landing page
 */

import config from '../config/env';

/**
 * Envia una consulta de contacto al backend
 * @param {Object} datos - Datos del formulario de contacto
 * @param {string} datos.nombre - Nombre del solicitante
 * @param {string} datos.establecimiento - Nombre del establecimiento
 * @param {string} datos.telefono - Telefono de contacto
 * @param {string} datos.correo - Correo electronico
 * @param {string} datos.consulta - Mensaje de la consulta
 * @returns {Promise<Object>} Resultado del envio
 */
export const enviarConsulta = async (datos) => {
  if (config.isDemoMode()) {
    // Simular delay de red en modo demo
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Consulta enviada correctamente. Nos pondremos en contacto pronto.'
    };
  }

  // Modo produccion: llamar a la API real
  try {
    const response = await fetch(`${config.apiBaseUrl}/contacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Error al enviar la consulta'
      };
    }

    return {
      success: true,
      message: data.message || 'Consulta enviada correctamente'
    };
  } catch (error) {
    console.error('Error al enviar consulta de contacto:', error);
    return {
      success: false,
      error: 'Error de conexion. Por favor, intente nuevamente.'
    };
  }
};

export default {
  enviarConsulta,
};
