/**
 * Servicio de Registro
 *
 * En modo demo usa datos mock locales
 * En modo producción conecta a la API real
 */

import config from '../config/env';
import {
  preRegistroApoderados,
  preRegistroDocentes,
  codigosPortal,
  establecimientos,
  cursos,
  datosAutoLlenado
} from '../mock/registroMockData';

/**
 * Obtiene la lista de establecimientos disponibles
 * @returns {Promise<string[]>}
 */
export const obtenerEstablecimientos = async () => {
  if (config.isDemoMode()) {
    return establecimientos;
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/establecimientos`);
    const data = await response.json();
    return data.establecimientos || [];
  } catch (error) {
    console.error('Error obteniendo establecimientos:', error);
    return [];
  }
};

/**
 * Obtiene la lista de cursos disponibles
 * @returns {Promise<string[]>}
 */
export const obtenerCursos = async () => {
  if (config.isDemoMode()) {
    return cursos;
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/cursos`);
    const data = await response.json();
    return data.cursos || [];
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    return [];
  }
};

/**
 * Valida el código de Portal Estudiantil (para admin)
 * @param {string} codigo - Código a validar
 * @returns {Promise<Object>}
 */
export const validarCodigoPortal = async (codigo) => {
  if (config.isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const esValido = codigosPortal.includes(codigo.toUpperCase());
    return {
      success: esValido,
      error: esValido ? null : 'El código ingresado no es válido. Por favor verifique el código proporcionado por Portal Estudiantil o comuníquese con soporte.'
    };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/registro/validar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    });

    const data = await response.json();
    return {
      success: response.ok,
      error: data.message || null
    };
  } catch (error) {
    console.error('Error validando código:', error);
    return { success: false, error: 'Error de conexión' };
  }
};

/**
 * Valida el pre-registro de un docente
 * @param {string} rut - RUT del docente
 * @returns {Promise<Object>}
 */
export const validarPreRegistroDocente = async (rut) => {
  if (config.isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const esValido = preRegistroDocentes.includes(rut);
    return {
      success: esValido,
      error: esValido ? null : 'El RUT ingresado no coincide con el registrado por el establecimiento. Por favor, comuníquese con ellos para verificar o corregir sus datos.'
    };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/registro/validar-docente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut }),
    });

    const data = await response.json();
    return {
      success: response.ok,
      error: data.message || null
    };
  } catch (error) {
    console.error('Error validando docente:', error);
    return { success: false, error: 'Error de conexión' };
  }
};

/**
 * Valida el pre-registro de un apoderado y sus alumnos
 * @param {string} rutApoderado - RUT del apoderado
 * @param {Array} alumnos - Lista de alumnos con sus RUTs
 * @returns {Promise<Object>}
 */
export const validarPreRegistroApoderado = async (rutApoderado, alumnos) => {
  if (config.isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Buscar el apoderado en el pre-registro
    const preRegistro = preRegistroApoderados.find(pr => pr.rutApoderado === rutApoderado);

    if (!preRegistro) {
      return {
        success: false,
        error: 'El RUT del apoderado ingresado no coincide con el registrado en el establecimiento. Por favor, comuníquese con el establecimiento para verificar sus datos.'
      };
    }

    // Validar cada alumno
    const alumnosNoCoinciden = [];
    alumnos.forEach((alumno, index) => {
      if (!preRegistro.alumnosAsociados.includes(alumno.rut)) {
        alumnosNoCoinciden.push(index + 1);
      }
    });

    if (alumnosNoCoinciden.length > 0) {
      const alumnoTexto = alumnosNoCoinciden.length === 1
        ? `El RUT del Alumno ${alumnosNoCoinciden[0]}`
        : `Los RUT de los Alumnos ${alumnosNoCoinciden.join(', ')}`;

      return {
        success: false,
        error: `${alumnoTexto} no coincide con los registrados en el establecimiento para este apoderado. Por favor, comuníquese con el establecimiento para verificar los datos.`
      };
    }

    return { success: true, error: null };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/registro/validar-apoderado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rutApoderado, alumnos }),
    });

    const data = await response.json();
    return {
      success: response.ok,
      error: data.message || null
    };
  } catch (error) {
    console.error('Error validando apoderado:', error);
    return { success: false, error: 'Error de conexión' };
  }
};

/**
 * Registra un nuevo usuario
 * @param {string} tipo - Tipo de usuario
 * @param {Object} datos - Datos del registro
 * @returns {Promise<Object>}
 */
export const registrarUsuario = async (tipo, datos) => {
  if (config.isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // En modo demo, simular registro exitoso
    const mensajes = {
      admin: 'Cuenta de administrador creada con éxito. Ya puede iniciar sesión con su RUT y la contraseña que acaba de crear.',
      docente: 'Cuenta creada con éxito. Ya puede iniciar sesión con su RUT y la contraseña que acaba de crear.',
      apoderado: 'Registro realizado con éxito. Ya puede iniciar sesión con su RUT y la contraseña que acaba de crear.'
    };

    return {
      success: true,
      message: mensajes[tipo] || 'Registro exitoso'
    };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/registro/${tipo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Registro exitoso' : 'Error en el registro')
    };
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, message: 'Error de conexión' };
  }
};

/**
 * Obtiene datos de auto-llenado (solo en modo demo)
 * @returns {Object|null}
 */
export const obtenerDatosAutoLlenado = () => {
  if (!config.isDemoMode()) {
    return null;
  }
  return datosAutoLlenado;
};

/**
 * Verifica si estamos en modo demo
 * @returns {boolean}
 */
export const esModoDemo = () => config.isDemoMode();

export default {
  obtenerEstablecimientos,
  obtenerCursos,
  validarCodigoPortal,
  validarPreRegistroDocente,
  validarPreRegistroApoderado,
  registrarUsuario,
  obtenerDatosAutoLlenado,
  esModoDemo,
};
