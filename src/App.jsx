import React, { useState, useEffect } from 'react';
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
import ModalMensaje from './components/ModalMensaje';
import DocentePage from './components/docente/DocentePage';
import ApoderadoPage from './components/apoderado/ApoderadoPage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistroPage from './components/RegistroPage';
import { usuarioDemo } from './data/demoData';
import './styles/docente.css';
import './styles/apoderado.css';
import './styles/login.css';
import './styles/registro.css';

function App() {
  const [activeTab, setActiveTab] = useState('alumnos');
  const [modalMensaje, setModalMensaje] = useState({ visible: false, titulo: '', texto: '', tipo: '' });
  const [vistaActual, setVistaActual] = useState('landing'); // 'landing', 'loginPage', 'seleccion-rol', 'registro', 'admin', 'docente' o 'apoderado'
  const [tipoUsuarioRegistro, setTipoUsuarioRegistro] = useState(null); // 'admin', 'docente', 'apoderado'

  const mostrarMensaje = (titulo, texto, tipo = 'info') => {
    setModalMensaje({ visible: true, titulo, texto, tipo });
  };

  const cerrarModalMensaje = () => {
    setModalMensaje({ ...modalMensaje, visible: false });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'alumnos':
        return <AlumnosTab mostrarMensaje={mostrarMensaje} />;
      case 'docentes':
        return <DocentesTab mostrarMensaje={mostrarMensaje} />;
      case 'asignacion-cursos':
        return <AsignacionesTab mostrarMensaje={mostrarMensaje} />;
      case 'notas-por-curso':
        return <NotasPorCursoTab mostrarMensaje={mostrarMensaje} />;
      case 'asistencia':
        return <AsistenciaTab mostrarMensaje={mostrarMensaje} />;
      case 'comunicados':
        return <ComunicadosTab mostrarMensaje={mostrarMensaje} />;
      case 'estadisticas':
        return <EstadisticasTab />;
      default:
        return <AlumnosTab mostrarMensaje={mostrarMensaje} />;
    }
  };

  const cerrarSesion = () => {
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
    return <LandingPage onIrALogin={irALoginPage} onIrARegistro={irASeleccionRol} />;
  }

  // Pagina de Login
  if (vistaActual === 'loginPage') {
    return (
      <LoginPage
        onVolver={() => setVistaActual('landing')}
        onLoginExitoso={(tipo) => {
          if (tipo === 'admin') {
            setVistaActual('admin');
          } else if (tipo === 'docente') {
            setVistaActual('docente');
          } else if (tipo === 'apoderado') {
            setVistaActual('apoderado');
          }
        }}
      />
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
            <button className="login-option admin" onClick={() => { setTipoUsuarioRegistro('admin'); setVistaActual('registro'); }}>
              <div className="login-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
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
      <RegistroPage
        tipoUsuario={tipoUsuarioRegistro}
        onVolver={() => setVistaActual('seleccion-rol')}
        onRegistroExitoso={() => setVistaActual('landing')}
      />
    );
  }

  // Vista de docente
  if (vistaActual === 'docente') {
    return <DocentePage onCambiarVista={cerrarSesion} />;
  }

  // Vista de apoderado
  if (vistaActual === 'apoderado') {
    return <ApoderadoPage onCambiarVista={cerrarSesion} />;
  }

  // Vista de administrador
  return (
    <div className="app-container">
      <Header usuario={usuarioDemo} onCerrarSesion={cerrarSesion} />

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

      <ChatFlotante />

      {modalMensaje.visible && (
        <ModalMensaje
          titulo={modalMensaje.titulo}
          texto={modalMensaje.texto}
          tipo={modalMensaje.tipo}
          onClose={cerrarModalMensaje}
        />
      )}
    </div>
  );
}

export default App;
