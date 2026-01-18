import React, { useState } from 'react';
import Header from './components/Header';
import TabsNav from './components/TabsNav';
import AlumnosTab from './components/AlumnosTab';
import DocentesTab from './components/DocentesTab';
import AsignacionesTab from './components/AsignacionesTab';
import NotasPorCursoTab from './components/NotasPorCursoTab';
import AsistenciaTab from './components/AsistenciaTab';
import ComunicadosTab from './components/ComunicadosTab';
import EstadisticasTab from './components/EstadisticasTab';
import ChatFlotante from './components/ChatFlotante';
import ChatDocenteV2 from './components/ChatDocenteV2';
import DocentePage from './components/docente/DocentePage';
import ApoderadoPage from './components/apoderado/ApoderadoPage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistroPage from './components/RegistroPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageErrorFallback, SectionErrorFallback } from './components/common/ErrorFallback';
import { useAuth } from './contexts';
import { usuarioDemo } from './data/demoData';
import './styles/docente.css';
import './styles/apoderado.css';
import './styles/login.css';
import './styles/registro.css';

function App() {
  const [activeTab, setActiveTab] = useState('alumnos');
  const [vistaActual, setVistaActual] = useState('landing'); // 'landing', 'loginPage', 'seleccion-rol', 'registro', 'administrador', 'docente' o 'apoderado'
  const [tipoUsuarioRegistro, setTipoUsuarioRegistro] = useState(null); // 'administrador', 'docente', 'apoderado'
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // Datos del usuario autenticado
  const { login: loginContext, logout: logoutContext } = useAuth();

  const renderTabContent = () => {
    // Cada tab se envuelve con ErrorBoundary para que un error en uno
    // no afecte a los demás ni crashee toda la aplicación
    const TabWrapper = ({ children }) => (
      <ErrorBoundary FallbackComponent={SectionErrorFallback} key={activeTab}>
        {children}
      </ErrorBoundary>
    );

    switch (activeTab) {
      case 'alumnos':
        return <TabWrapper><AlumnosTab /></TabWrapper>;
      case 'docentes':
        return <TabWrapper><DocentesTab /></TabWrapper>;
      case 'asignacion-cursos':
        return <TabWrapper><AsignacionesTab /></TabWrapper>;
      case 'notas-por-curso':
        return <TabWrapper><NotasPorCursoTab /></TabWrapper>;
      case 'asistencia':
        return <TabWrapper><AsistenciaTab /></TabWrapper>;
      case 'comunicados':
        return <TabWrapper><ComunicadosTab /></TabWrapper>;
      case 'estadisticas':
        return <TabWrapper><EstadisticasTab /></TabWrapper>;
      default:
        return <TabWrapper><AlumnosTab /></TabWrapper>;
    }
  };

  const cerrarSesion = () => {
    setUsuarioLogueado(null);
    logoutContext();
    setVistaActual('landing');
  };

  const irALoginPage = () => {
    setVistaActual('loginPage');
  };

  const irASeleccionRol = () => {
    setVistaActual('seleccion-rol');
  };

  // Landing page
  if (vistaActual === 'landing') {
    return (
      <ErrorBoundary FallbackComponent={PageErrorFallback}>
        <LandingPage onIrALogin={irALoginPage} onIrARegistro={irASeleccionRol} />
      </ErrorBoundary>
    );
  }

  // Pagina de Login
  if (vistaActual === 'loginPage') {
    return (
      <ErrorBoundary FallbackComponent={PageErrorFallback}>
        <LoginPage
          onVolver={() => setVistaActual('landing')}
          onLoginExitoso={(tipo, usuario) => {
            // Mapear establecimiento a nombre_establecimiento para el Header
            const usuarioConEstablecimiento = {
              ...usuario,
              tipo_usuario: tipo === 'administrador' ? 'Administrador' : tipo === 'docente' ? 'Docente' : 'Apoderado',
              nombre_establecimiento: usuario?.establecimiento || 'Establecimiento Educacional'
            };
            setUsuarioLogueado(usuarioConEstablecimiento);
            loginContext(usuarioConEstablecimiento, tipo);

            if (tipo === 'administrador') {
              setVistaActual('administrador');
            } else if (tipo === 'docente') {
              setVistaActual('docente');
            } else if (tipo === 'apoderado') {
              setVistaActual('apoderado');
            }
          }}
        />
      </ErrorBoundary>
    );
  }

  // Pantalla de seleccion de rol (simula login)
  if (vistaActual === 'seleccion-rol') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span>E</span>
            </div>
            <h1>Portal Estudiantil</h1>
            <p>Registrate segun tu perfil y comienza a gestionar la informacion academica</p>
          </div>
          <div className="login-options">
            <button className="login-option admin" onClick={() => { setTipoUsuarioRegistro('administrador'); setVistaActual('registro'); }}>
              <div className="login-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="login-option-text">
                <h3>Administrador</h3>
                <p>Gestionar alumnos, docentes, cursos y estadisticas</p>
              </div>
            </button>
            <button className="login-option docente" onClick={() => { setTipoUsuarioRegistro('docente'); setVistaActual('registro'); }}>
              <div className="login-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="login-option-text">
                <h3>Docente</h3>
                <p>Registrar notas, ver progreso de alumnos</p>
              </div>
            </button>
            <button className="login-option apoderado" onClick={() => { setTipoUsuarioRegistro('apoderado'); setVistaActual('registro'); }}>
              <div className="login-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="login-option-text">
                <h3>Apoderado</h3>
                <p>Ver notas, comunicados y progreso del alumno</p>
              </div>
            </button>
          </div>
          <div className="login-footer">
            <button
              onClick={() => setVistaActual('landing')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3182ce',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pagina de Registro
  if (vistaActual === 'registro') {
    return (
      <ErrorBoundary FallbackComponent={PageErrorFallback}>
        <RegistroPage
          tipoUsuario={tipoUsuarioRegistro}
          onVolver={() => setVistaActual('seleccion-rol')}
          onRegistroExitoso={() => setVistaActual('landing')}
        />
      </ErrorBoundary>
    );
  }

  // Vista de docente
  if (vistaActual === 'docente') {
    return (
      <ErrorBoundary FallbackComponent={PageErrorFallback}>
        <DocentePage onCambiarVista={cerrarSesion} usuarioDocente={usuarioLogueado} />
      </ErrorBoundary>
    );
  }

  // Vista de apoderado
  if (vistaActual === 'apoderado') {
    return (
      <ErrorBoundary FallbackComponent={PageErrorFallback}>
        <ApoderadoPage onCambiarVista={cerrarSesion} usuario={usuarioLogueado} />
      </ErrorBoundary>
    );
  }

  // Vista de administrador
  return (
    <div className="app-container">
      <Header usuario={usuarioLogueado || usuarioDemo} onCerrarSesion={cerrarSesion} />

      <main className="main-content">
        <section className="control-panel">
          <div className="panel-header">
            <h2>Panel de Control</h2>
          </div>

          <div className="tabs-container">
            <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="tabs-content">
              {renderTabContent()}
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>Sistema de Gestion Academica &copy; 2024 | Todos los derechos reservados</p>
        <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
      </footer>

      {/* Chat V2 - Mismo diseño que el docente */}
      <ErrorBoundary fallback={null}>
        <ChatDocenteV2
          usuario={usuarioLogueado ? {
            id: usuarioLogueado.id,
            tipo: 'administrador',
            nombres: usuarioLogueado.nombres,
            apellidos: usuarioLogueado.apellidos
          } : null}
          establecimientoId={usuarioLogueado?.establecimiento_id}
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;
