import React, { useState, useEffect, useRef } from 'react';
import HelpTooltip from '../common/HelpTooltip';
import TutorialGuide from '../common/TutorialGuide';
import AsistenciaTab from './AsistenciaTab';
import AgregarNotaTab from './AgregarNotaTab';
import ModificarNotaTab from './ModificarNotaTab';
import VerNotasTab from './VerNotasTab';
import ProgresoTab from './ProgresoTab';
import ChatDocenteV2 from '../ChatDocenteV2';
import config from '../../config/env';

function DocentePage({ onCambiarVista, usuarioDocente }) {
  const [tabActual, setTabActual] = useState(() => localStorage.getItem('docenteActiveTab') || 'asistencia');

  // Estado para el tutorial (se muestra si no existe la marca en localStorage)
  // Estado para el tutorial (se muestra siempre al recargar por solicitud)
  const [showTutorial, setShowTutorial] = useState(true);

  const cerrarTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenDocenteTour', 'true');
  };

  const handleTutorialStepChange = (tabId) => {
    setTabActual(tabId);
  };

  const DOCENTE_STEPS = [
    {
      target: 'asistencia',
      title: 'Asistencia',
      content: 'Herramienta diaria para el registro de asistencia. Seleccione el curso y marque los alumnos presentes, ausentes o atrasados.'
    },
    {
      target: 'agregar-nota',
      title: 'Agregar Nota',
      content: 'Ingrese nuevas calificaciones al libro de clases. Seleccione curso, asignatura, evaluación y registre las notas.'
    },
    {
      target: 'modificar-nota',
      title: 'Modificar Nota',
      content: 'Corrija calificaciones ingresadas erróneamente. Busque la evaluación y edite la nota. Los cambios quedan registrados.'
    },
    {
      target: 'ver-notas',
      title: 'Ver Notas',
      content: 'Visualice el panorama completo de calificaciones: sábana de notas, promedios parciales y avance curricular.'
    },
    {
      target: 'progreso',
      title: 'Progreso',
      content: 'Analíticas de rendimiento. Revise gráficos de aprobación, promedios e identifique estudiantes que requieren apoyo.'
    }
  ];

  // Persistir tab activa
  useEffect(() => {
    localStorage.setItem('docenteActiveTab', tabActual);
  }, [tabActual]);

  // Estado para Keep Alive Tabs (Optimización de carga)
  const [visitedTabs, setVisitedTabs] = useState(new Set([tabActual]));

  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(tabActual)) return prev;
      const newSet = new Set(prev);
      newSet.add(tabActual);
      return newSet;
    });
  }, [tabActual]);
  const [currentDate, setCurrentDate] = useState('');
  const [establecimientoDropdownAbierto, setEstablecimientoDropdownAbierto] = useState(false);
  const [establecimientosDocente, setEstablecimientosDocente] = useState([]);
  const [establecimientoActual, setEstablecimientoActual] = useState(null);
  const [cargandoEstablecimientos, setCargandoEstablecimientos] = useState(true);
  const dropdownRef = useRef(null);

  // Lógica de visibilidad de ayuda (Solo establecimiento ID 1)
  // Nota: establecimientoActual.id puede ser 1 numeral o '1' string, importante validar ambos o parsear.
  const mostrarAyuda = establecimientoActual?.id === 1 || establecimientoActual?.id === '1';

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
    {
      id: 'asistencia',
      label: 'Asistencia',
      desc: 'Herramienta diaria para el registro de asistencia. Seleccione el curso y marque los alumnos presentes, ausentes o atrasados.'
    },
    {
      id: 'agregar-nota',
      label: 'Agregar Nota',
      desc: 'Ingrese nuevas calificaciones al libro de clases. Primero seleccione el curso y la asignatura, luego el tipo de evaluación.'
    },
    {
      id: 'modificar-nota',
      label: 'Modificar Nota',
      desc: 'Permite corregir calificaciones ingresadas erróneamente. Busque la evaluación específica y edite la nota del alumno.'
    },
    {
      id: 'ver-notas',
      label: 'Ver Notas',
      desc: 'Visualice el panorama completo de calificaciones de sus cursos. Consulte la sábana de notas y promedios parciales.'
    },
    {
      id: 'progreso',
      label: 'Progreso',
      desc: 'Analíticas de rendimiento de sus cursos. Revise gráficos de aprobación/reprobación y promedios por asignatura.'
    }
  ];

  const renderTabsContent = () => {
    const tabsConfig = [
      {
        id: 'asistencia',
        Component: AsistenciaTab,
        props: { docenteId: docenteActual.id, establecimientoId: establecimientoActual?.id, usuarioId: usuarioDocente?.id }
      },
      {
        id: 'agregar-nota',
        Component: AgregarNotaTab,
        props: { docenteId: docenteActual.id, establecimientoId: establecimientoActual?.id, usuarioId: usuarioDocente?.id }
      },
      {
        id: 'modificar-nota',
        Component: ModificarNotaTab,
        props: { docenteId: docenteActual.id, establecimientoId: establecimientoActual?.id }
      },
      {
        id: 'ver-notas',
        Component: VerNotasTab,
        props: { docenteId: docenteActual.id, establecimientoId: establecimientoActual?.id }
      },
      {
        id: 'progreso',
        Component: ProgresoTab,
        props: { docenteId: docenteActual.id, establecimientoId: establecimientoActual?.id }
      }
    ];

    return tabsConfig.map(({ id, Component, props }) => {
      if (!visitedTabs.has(id) && tabActual !== id) return null;
      const isActive = tabActual === id;
      return (
        <div
          key={id}
          style={{ display: isActive ? 'block' : 'none' }}
          role="tabpanel"
        >
          <Component {...props} />
        </div>
      );
    });
  };

  return (
    <div className="app-container">
      {/* Botón flotante para reactivar tutorial */}
      {!showTutorial && (
        <button
          onClick={() => setShowTutorial(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 90,
            background: '#1e3a5f',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            title: 'Ver Tutorial'
          }}
        >
          <span className="material-symbols-outlined">help</span>
        </button>
      )}

      <TutorialGuide
        isVisible={showTutorial}
        onClose={cerrarTutorial}
        activeTab={tabActual}
        onStepChange={handleTutorialStepChange}
        steps={DOCENTE_STEPS}
      />

      <header className="main-header">
        <div className="header-content">
          <div className="brand">
            <div className="logo">
              <span className="logo-icon">E</span>
            </div>
            <div className="brand-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px', color: '#cbd5e1' }}>Portal Docente</span>
              <h1 style={{ margin: 0, fontSize: '16px', lineHeight: '1.2' }}>{docenteActual.nombres} {docenteActual.apellidos}</h1>
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
            {/* Nombre movido a la izquierda */}
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
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Panel de Control - Docente</h2>
            <button
              onClick={() => setShowTutorial(true)}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f59e0b',
                border: 'none',
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help</span>
              Ver Tutorial
            </button>
          </div>

          <div className="tabs-container">
            <nav className="tabs-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  className={`tab-btn ${tabActual === tab.id ? 'active' : ''}`}
                  onClick={() => setTabActual(tab.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {tab.label}
                  <HelpTooltip content={tab.desc} isVisible={mostrarAyuda} />
                </button>
              ))}
            </nav>

            <div className="tabs-content">
              {renderTabsContent()}
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>Sistema de Gestion Academica &copy; 2024 | Todos los derechos reservados</p>
        <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
      </footer>

      {/* Chat V2 - Nuevo diseño estilo Telegram/Discord */}
      <ChatDocenteV2
        usuario={{
          id: usuarioDocente?.id,
          tipo: 'docente',
          nombres: docenteActual.nombres,
          apellidos: docenteActual.apellidos
        }}
        establecimientoId={establecimientoActual?.id}
      />
    </div >
  );
}

export default DocentePage;
