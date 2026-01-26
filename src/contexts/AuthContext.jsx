import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Contexto para manejar la autenticación y el usuario actual
 *
 * Uso:
 * const { usuario, login, logout, isAuthenticated } = useAuth();
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null); // 'administrador' | 'docente' | 'apoderado'
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const cargarSesion = () => {
      try {
        // Intentar cargar de localStorage (Persistente)
        const storedUser = localStorage.getItem('auth_user');
        const storedType = localStorage.getItem('auth_type');

        if (storedUser && storedType) {
          setUsuario(JSON.parse(storedUser));
          setTipoUsuario(storedType);
          setCargandoSesion(false);
          return;
        }

        // Intentar cargar de sessionStorage (Solo pestaña actual)
        const sessionUser = sessionStorage.getItem('auth_user');
        const sessionType = sessionStorage.getItem('auth_type');

        if (sessionUser && sessionType) {
          setUsuario(JSON.parse(sessionUser));
          setTipoUsuario(sessionType);
        }
      } catch (error) {
        console.error('Error cargando sesión:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_type');
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_type');
      } finally {
        setCargandoSesion(false);
      }
    };

    cargarSesion();
  }, []);

  // Iniciar sesión
  const login = useCallback((datosUsuario, tipo, recordar = false) => {
    setUsuario(datosUsuario);
    setTipoUsuario(tipo);

    const userStr = JSON.stringify(datosUsuario);

    if (recordar) {
      // Guardar en localStorage (Persistente)
      localStorage.setItem('auth_user', userStr);
      localStorage.setItem('auth_type', tipo);
    } else {
      // Guardar en sessionStorage (Temporal)
      sessionStorage.setItem('auth_user', userStr);
      sessionStorage.setItem('auth_type', tipo);
    }
  }, []);

  // Cerrar sesión
  const logout = useCallback(() => {
    setUsuario(null);
    setTipoUsuario(null);

    // Limpiar todo
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_type');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_type');
  }, []);

  // Verificar si está autenticado
  const isAuthenticated = usuario !== null;

  // Verificar tipo de usuario
  const isAdmin = tipoUsuario === 'administrador';
  const isDocente = tipoUsuario === 'docente';
  const isApoderado = tipoUsuario === 'apoderado';

  const value = {
    usuario,
    tipoUsuario,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isDocente,
    isApoderado,
    cargandoSesion
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} { usuario, tipoUsuario, login, logout, isAuthenticated, isAdmin, isDocente, isApoderado, cargandoSesion }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}

export default AuthContext;
