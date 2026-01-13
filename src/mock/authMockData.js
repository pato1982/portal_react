/**
 * Datos mock para autenticación (SOLO para modo demo/desarrollo)
 *
 * IMPORTANTE: Este archivo SOLO se usa cuando VITE_APP_MODE=demo
 * En producción, estos datos vienen del backend
 */

// Usuarios demo con credenciales de prueba
export const usuariosDemo = {
  administrador: {
    id: 1,
    email: 'admin@colegio.cl',
    password: 'Admin123', // En producción esto nunca estaría aquí
    tipo: 'administrador',
    nombres: 'Administrador',
    apellidos: 'Sistema',
    establecimiento: 'Colegio Demo',
    establecimiento_id: 1
  },
  docente: {
    id: 2,
    email: 'docente@colegio.cl',
    password: 'Docente123',
    tipo: 'docente',
    nombres: 'María',
    apellidos: 'González',
    iniciales: 'MG',
    especialidades: ['Matemáticas', 'Ciencias Naturales']
  },
  apoderado: {
    id: 3,
    email: 'apoderado@colegio.cl',
    password: 'Apoderado123',
    tipo: 'apoderado',
    nombres: 'Juan',
    apellidos: 'Pérez',
    pupilos: [
      { id: 1, nombres: 'Pedro', apellidos: 'Pérez González', curso: '5° Básico A' }
    ]
  }
};

// Función para obtener credenciales demo (para auto-llenado en desarrollo)
export const getCredencialesDemo = (tipo) => {
  const usuario = usuariosDemo[tipo];
  if (!usuario) return null;

  return {
    email: usuario.email,
    password: usuario.password
  };
};

// Función para validar login en modo demo
export const validarLoginDemo = (email, password, tipo) => {
  const usuario = usuariosDemo[tipo];

  if (!usuario) {
    return { success: false, error: 'Tipo de usuario no válido' };
  }

  if (usuario.email !== email || usuario.password !== password) {
    return { success: false, error: 'Credenciales incorrectas' };
  }

  // Retornar usuario sin la contraseña
  const { password: _, ...usuarioSinPassword } = usuario;
  return { success: true, usuario: usuarioSinPassword };
};
