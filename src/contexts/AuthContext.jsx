import React, { createContext, useContext, useState, useCallback } from 'react';

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

  // Iniciar sesión
  const login = useCallback((datosUsuario, tipo) => {
    setUsuario(datosUsuario);
    setTipoUsuario(tipo);
  }, []);

  // Cerrar sesión
  const logout = useCallback(() => {
    setUsuario(null);
    setTipoUsuario(null);
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
    isApoderado
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} { usuario, tipoUsuario, login, logout, isAuthenticated, isAdmin, isDocente, isApoderado }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}

export default AuthContext;
