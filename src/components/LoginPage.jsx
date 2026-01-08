import React, { useState } from 'react';
import '../styles/login.css';

function LoginPage({ onVolver, onLoginExitoso }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  // Credenciales demo por tipo de usuario
  const credencialesDemo = {
    admin: { email: 'admin@colegio.cl', password: 'Admin123' },
    docente: { email: 'docente@colegio.cl', password: 'Docente123' },
    apoderado: { email: 'apoderado@colegio.cl', password: 'Apoderado123' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const seleccionarTipo = (tipo) => {
    setTipoSeleccionado(tipo);
    setFormData(credencialesDemo[tipo]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tipoSeleccionado) {
      setError('Seleccione un tipo de usuario');
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Por favor complete todos los campos');
      return;
    }

    // Login exitoso - navegar a la vista correspondiente
    onLoginExitoso(tipoSeleccionado);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <span>E</span>
            </div>
            <h1>Portal Estudiantil</h1>
            <p>Seleccione su perfil para ingresar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            {/* Botones de seleccion de tipo */}
            <div className="login-tipo-btns">
              <button
                type="button"
                className={`login-tipo-btn admin ${tipoSeleccionado === 'admin' ? 'activo' : ''}`}
                onClick={() => seleccionarTipo('admin')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span>Admin</span>
              </button>
              <button
                type="button"
                className={`login-tipo-btn docente ${tipoSeleccionado === 'docente' ? 'activo' : ''}`}
                onClick={() => seleccionarTipo('docente')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Docente</span>
              </button>
              <button
                type="button"
                className={`login-tipo-btn apoderado ${tipoSeleccionado === 'apoderado' ? 'activo' : ''}`}
                onClick={() => seleccionarTipo('apoderado')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Apoderado</span>
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electronico</label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.cl"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contrasena</label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingrese su contrasena"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login">
              Iniciar Sesion
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <button onClick={onVolver} className="btn-volver">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
