import React, { useState, useEffect, useRef } from 'react';
import AsistenciaTab from './AsistenciaTab';
import AgregarNotaTab from './AgregarNotaTab';
import ModificarNotaTab from './ModificarNotaTab';
import VerNotasTab from './VerNotasTab';
import ProgresoTab from './ProgresoTab';
import config from '../../config/env';

function DocentePage({ onCambiarVista, usuarioDocente }) {
  const [tabActual, setTabActual] = useState('asistencia');
  const [currentDate, setCurrentDate] = useState('');
  const [establecimientoDropdownAbierto, setEstablecimientoDropdownAbierto] = useState(false);
  const [establecimientosDocente, setEstablecimientosDocente] = useState([]);
  const [establecimientoActual, setEstablecimientoActual] = useState(null);
  const [cargandoEstablecimientos, setCargandoEstablecimientos] = useState(true);
  const dropdownRef = useRef(null);

  // Datos del docente desde el usuario logueado
  const docenteActual = {
    id: usuarioDocente?.docente_id || 0,
    nombres: usuarioDocente?.nombres || 'Docente',
    apellidos: usuarioDocente?.apellidos || '',
    iniciales: usuarioDocente?.iniciales || 'D'
  };

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('es-CL', options));
    };
    updateDate();
  }, []);

  // Cargar establecimientos del docente
  useEffect(() => {
    const cargarEstablecimientos = async () => {
      if (!docenteActual.id) {
        setCargandoEstablecimientos(false);
        return;
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/docente/${docenteActual.id}/establecimientos`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          setEstablecimientosDocente(data.data);
          setEstablecimientoActual(data.data[0]);
        } else {
          setEstablecimientosDocente([]);
          setEstablecimientoActual({ id: 0, nombre: 'Sin establecimiento', comuna: '' });
        }
      } catch (error) {
        console.error('Error al cargar establecimientos:', error);
        setEstablecimientosDocente([]);
        setEstablecimientoActual({ id: 0, nombre: 'Sin establecimiento', comuna: '' });
      } finally {
        setCargandoEstablecimientos(false);
      }
    };

    cargarEstablecimientos();
  }, [docenteActual.id]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEstablecimientoDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'agregar-nota', label: 'Agregar Nota' },
    { id: 'modificar-nota', label: 'Modificar Nota' },
    { id: 'ver-notas', label: 'Ver Notas' },
    { id: 'progreso', label: 'Progreso' }
  ];

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <div className="brand">
            <div className="logo">
              <span className="logo-icon">E</span>
            </div>
            <div className="brand-text">
              <h1>Portal Docente</h1>
            </div>
          </div>
          <div className="header-info">
            {/* Selector de Establecimiento */}
            <div className="establecimiento-selector" ref={dropdownRef}>
              <button
                className="establecimiento-btn"
                onClick={() => establecimientosDocente.length > 1 && setEstablecimientoDropdownAbierto(!establecimientoDropdownAbierto)}
                style={{ cursor: establecimientosDocente.length > 1 ? 'pointer' : 'default' }}
              >
                <span className="establecimiento-nombre">
                  {cargandoEstablecimientos ? 'Cargando...' : (establecimientoActual?.nombre || 'Sin establecimiento')}
                </span>
                {establecimientosDocente.length > 1 && (
                  <svg
                    className={`establecimiento-arrow ${establecimientoDropdownAbierto ? 'rotated' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </button>
              {establecimientoDropdownAbierto && establecimientosDocente.length > 1 && (
                <div className="establecimiento-dropdown">
                  {establecimientosDocente
                    .filter(est => est.id !== establecimientoActual?.id)
                    .map(est => (
                      <button
                        key={est.id}
                        className="establecimiento-option"
                        onClick={() => {
                          setEstablecimientoActual(est);
                          setEstablecimientoDropdownAbierto(false);
                        }}
                      >
                        <span className="est-nombre">{est.nombre}</span>
                        <span className="est-comuna">{est.comuna}</span>
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
            <span className="header-separator">|</span>
            <span className="user-info">{docenteActual.nombres} {docenteActual.apellidos}</span>
            <span className="current-date">{currentDate}</span>
            <button className="btn-logout" onClick={onCambiarVista} title="Cerrar Sesion">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="control-panel">
          <div className="panel-header">
            <h2>Panel de Control - Docente</h2>
          </div>

          <div className="tabs-container">
            <nav className="tabs-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${tabActual === tab.id ? 'active' : ''}`}
                  onClick={() => setTabActual(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="tabs-content">
              {tabActual === 'asistencia' && (
                <AsistenciaTab
                  docenteId={docenteActual.id}
                  establecimientoId={establecimientoActual?.id}
                  usuarioId={usuarioDocente?.id}
                />
              )}
              {tabActual === 'agregar-nota' && (
                <AgregarNotaTab
                  docenteId={docenteActual.id}
                  establecimientoId={establecimientoActual?.id}
                  usuarioId={usuarioDocente?.id}
                />
              )}
              {tabActual === 'modificar-nota' && (
                <ModificarNotaTab
                  docenteId={docenteActual.id}
                  establecimientoId={establecimientoActual?.id}
                />
              )}
              {tabActual === 'ver-notas' && (
                <VerNotasTab
                  docenteId={docenteActual.id}
                  establecimientoId={establecimientoActual?.id}
                />
              )}
              {tabActual === 'progreso' && (
                <ProgresoTab
                  docenteId={docenteActual.id}
                  establecimientoId={establecimientoActual?.id}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>Sistema de Gestion Academica &copy; 2024 | Todos los derechos reservados</p>
        <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
      </footer>
    </div>
  );
}

export default DocentePage;
