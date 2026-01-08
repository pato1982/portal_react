import React, { useState, useEffect } from 'react';
import '../styles/landing.css';

function LandingPage({ onIrALogin, onIrARegistro }) {
  const [menuMobileActivo, setMenuMobileActivo] = useState(false);
  const [modalTerminosActivo, setModalTerminosActivo] = useState(false);
  const [modalPrivacidadActivo, setModalPrivacidadActivo] = useState(false);
  const [modalPlanActivo, setModalPlanActivo] = useState(null); // 'basico', 'intermedio', 'premium'
  const [modalContactoActivo, setModalContactoActivo] = useState(false);
  const [formContacto, setFormContacto] = useState({
    nombre: '',
    establecimiento: '',
    telefono: '',
    correo: '',
    consulta: ''
  });
  const [navbarShadow, setNavbarShadow] = useState(false);

  // Efecto de navbar al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setNavbarShadow(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar modales con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalTerminosActivo(false);
        setModalPrivacidadActivo(false);
        setModalPlanActivo(null);
        setModalContactoActivo(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bloquear scroll cuando hay modal abierto
  useEffect(() => {
    if (modalTerminosActivo || modalPrivacidadActivo || modalPlanActivo || modalContactoActivo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [modalTerminosActivo, modalPrivacidadActivo, modalPlanActivo, modalContactoActivo]);

  // Manejar cambios en el formulario de contacto
  const handleContactoChange = (e) => {
    const { name, value } = e.target;
    setFormContacto(prev => ({ ...prev, [name]: value }));
  };

  // Enviar formulario de contacto
  const handleContactoSubmit = (e) => {
    e.preventDefault();
    // Aqui se enviaria el formulario
    alert('Consulta enviada correctamente. Nos pondremos en contacto pronto.');
    setFormContacto({ nombre: '', establecimiento: '', telefono: '', correo: '', consulta: '' });
    setModalContactoActivo(false);
    setModalPlanActivo(null); // Cierra también el modal del plan si estaba abierto
  };

  // Abrir modal de contacto desde los planes
  const abrirContactoDesdePlan = () => {
    setModalPlanActivo(null);
    setModalContactoActivo(true);
  };

  const toggleMenuMobile = () => {
    setMenuMobileActivo(!menuMobileActivo);
  };

  const cerrarMenuMobile = () => {
    setMenuMobileActivo(false);
  };

  return (
    <div className="landing-page">
      {/* Navegacion */}
      <nav className={`landing-navbar ${navbarShadow ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <span className="logo-icon">E</span>
            </div>
            <span className="nav-title">Portal Estudiantil</span>
          </div>
          <div className="nav-actions">
            <button className="btn btn-outline" onClick={onIrALogin}>Iniciar Sesion</button>
            <button className="btn btn-primary" onClick={onIrARegistro}>Registrarse</button>
          </div>
          <button className="nav-toggle" onClick={toggleMenuMobile}>
            <span className={menuMobileActivo ? 'active' : ''}></span>
            <span className={menuMobileActivo ? 'active' : ''}></span>
            <span className={menuMobileActivo ? 'active' : ''}></span>
          </button>
        </div>
        {/* Menu movil */}
        <div className={`nav-mobile ${menuMobileActivo ? 'active' : ''}`}>
          <button className="btn btn-outline" onClick={() => { cerrarMenuMobile(); onIrALogin(); }}>Iniciar Sesion</button>
          <button className="btn btn-primary" onClick={() => { cerrarMenuMobile(); onIrARegistro(); }}>Registrarse</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenido al <span className="highlight">Portal Estudiantil</span></h1>
          <p className="hero-subtitle">
            La plataforma integral que conecta a apoderados, docentes y administradores
            para un seguimiento academico eficiente y transparente.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onIrARegistro}>Comenzar Ahora</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            {/* Cubo 3D giratorio */}
            <div className="cube-container">
              <div className="cube">
                <div className="cube-face cube-front">
                  <span className="cube-letra">E</span>
                  <span className="cube-texto">Portal Estudiantil</span>
                </div>
                <div className="cube-face cube-back">
                  <span className="cube-letra">E</span>
                  <span className="cube-texto">Portal Estudiantil</span>
                </div>
                <div className="cube-face cube-right">
                  <span className="cube-letra">E</span>
                  <span className="cube-texto">Portal Estudiantil</span>
                </div>
                <div className="cube-face cube-left">
                  <span className="cube-letra">E</span>
                  <span className="cube-texto">Portal Estudiantil</span>
                </div>
                <div className="cube-face cube-top">
                  <span className="cube-letra">E</span>
                  <span className="cube-texto">Portal Estudiantil</span>
                </div>
                <div className="cube-face cube-bottom">
                  <span className="cube-letra">E</span>
                  <span className="cube-texto">Portal Estudiantil</span>
                </div>
              </div>
            </div>
            {/* Tarjetas flotantes */}
            <div className="graphic-card card-1">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <span>Notas en linea</span>
            </div>
            <div className="graphic-card card-2">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <span>Acceso movil</span>
            </div>
            <div className="graphic-card card-3">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <span>Comunicados</span>
            </div>
            <div className="graphic-card card-4">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
              </div>
              <span>Estadisticas</span>
            </div>
            <div className="graphic-card card-5">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span>Apoderados</span>
            </div>
            <div className="graphic-card card-6">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M9 16l2 2 4-4"></path>
                </svg>
              </div>
              <span>Asistencias</span>
            </div>
            <div className="graphic-card card-7">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="M12 11h4"></path>
                  <path d="M12 16h4"></path>
                  <path d="M8 11h.01"></path>
                  <path d="M8 16h.01"></path>
                </svg>
              </div>
              <span>Matriculas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Caracteristicas */}
      <section className="caracteristicas" id="caracteristicas">
        <div className="section-container">
          <div className="section-header">
            <h2>Por que elegir nuestro Portal?</h2>
            <p>Disenada para facilitar la comunicacion y el seguimiento academico entre todos los actores de la comunidad educativa.</p>
          </div>

          {/* Apoderados */}
          <div className="feature-card feature-apoderados">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="feature-content">
              <h3>Para Apoderados</h3>
              <p className="feature-description">
                Mantengase informado sobre el rendimiento academico de sus hijos de manera simple y directa.
                Nuestra plataforma le permite estar al tanto del progreso escolar sin complicaciones.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Consulte las notas de sus pupilos en tiempo real</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Visualice el promedio por asignatura</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Reciba comunicados importantes del establecimiento</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Acceda desde cualquier dispositivo, en cualquier momento</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Docentes */}
          <div className="feature-card feature-docentes">
            <div className="feature-content">
              <h3>Para Docentes</h3>
              <p className="feature-description">
                Simplifique su trabajo administrativo y dedique mas tiempo a lo que realmente importa: ensenar.
                Registre las calificaciones de sus estudiantes de forma rapida y eficiente.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Registre notas de manera sencilla e intuitiva</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Visualice las calificaciones de sus cursos y asignaturas</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Mantenga informados a alumnos y apoderados de forma inmediata</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Trabaje comodamente desde su computador o telefono movil</span>
                </li>
              </ul>
            </div>
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
          </div>

          {/* Administradores */}
          <div className="feature-card feature-admin">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <div className="feature-content">
              <h3>Para Administradores</h3>
              <p className="feature-description">
                Tenga el control total del sistema educativo. Gestione la informacion academica,
                el personal docente y mantenga una comunicacion efectiva con toda la comunidad escolar.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Administre la informacion completa de alumnos y docentes</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Gestione cursos, asignaturas y asignaciones</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Visualice y supervise todas las calificaciones del establecimiento</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Envie comunicados importantes a los apoderados</span>
                </li>
                <li>
                  <span className="check-icon">&#10003;</span>
                  <span>Genere reportes y estadisticas academicas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpis-container">
            <div className="kpi-card">
              <div className="kpi-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div className="kpi-content">
                <div className="kpi-number">+40</div>
                <div className="kpi-label">Colegios</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="kpi-content">
                <div className="kpi-number">+8.000</div>
                <div className="kpi-label">Usuarios Activos</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="kpi-content">
                <div className="kpi-number">+200.000</div>
                <div className="kpi-label">Notas Registradas</div>
              </div>
            </div>
          </div>

          {/* Seccion de Planes */}
          <div className="planes-section">
            <div className="section-header">
              <h2>Nuestros Planes</h2>
              <p>Elige el plan que mejor se adapte a las necesidades de tu establecimiento</p>
            </div>
            <div className="planes-grid">
              {/* Plan Basico */}
              <div className="plan-card plan-basico">
                <div className="plan-header">
                  <h3>Basico</h3>
                  <div className="plan-precio">
                    <span className="precio-valor">$1.500</span>
                    <span className="precio-periodo">/alumno/año</span>
                  </div>
                  <div className="plan-promo">4 meses gratis</div>
                </div>
                <div className="plan-body">
                  <ul className="plan-features dos-columnas">
                    <li><span className="check">&#10003;</span> Ver notas</li>
                    <li><span className="check">&#10003;</span> Ver comunicados</li>
                    <li><span className="check">&#10003;</span> Registrar notas</li>
                    <li><span className="check">&#10003;</span> Modificar notas</li>
                    <li><span className="check">&#10003;</span> Control asistencia</li>
                    <li><span className="check">&#10003;</span> Enviar comunicados</li>
                    <li><span className="check">&#10003;</span> Gestion alumnos</li>
                    <li><span className="check">&#10003;</span> Gestion docentes</li>
                    <li><span className="check">&#10003;</span> Soporte 24/7</li>
                  </ul>
                </div>
                <div className="plan-footer">
                  <button className="btn btn-outline btn-sm" onClick={() => setModalPlanActivo('basico')}>
                    Ver detalle
                  </button>
                </div>
              </div>

              {/* Plan Intermedio */}
              <div className="plan-card plan-intermedio">
                <div className="plan-badge">Popular</div>
                <div className="plan-header">
                  <h3>Intermedio</h3>
                  <div className="plan-precio">
                    <span className="precio-valor">$2.500</span>
                    <span className="precio-periodo">/alumno/año</span>
                  </div>
                  <div className="plan-promo">3 meses gratis</div>
                </div>
                <div className="plan-body">
                  <ul className="plan-features dos-columnas">
                    <li><span className="check">&#10003;</span> Ver notas</li>
                    <li><span className="check">&#10003;</span> Ver comunicados</li>
                    <li><span className="check">&#10003;</span> Registrar notas</li>
                    <li><span className="check">&#10003;</span> Modificar notas</li>
                    <li><span className="check">&#10003;</span> Control asistencia</li>
                    <li><span className="check">&#10003;</span> Enviar comunicados</li>
                    <li><span className="check">&#10003;</span> Gestion alumnos</li>
                    <li><span className="check">&#10003;</span> Gestion docentes</li>
                    <li><span className="check">&#10003;</span> Graficos de notas</li>
                    <li><span className="check">&#10003;</span> KPIs rendimiento</li>
                    <li><span className="check">&#10003;</span> Progreso alumno</li>
                    <li><span className="check">&#10003;</span> Estadisticas admin</li>
                    <li><span className="check">&#10003;</span> Rankings</li>
                    <li><span className="check">&#10003;</span> Alertas riesgo</li>
                    <li><span className="check">&#10003;</span> Soporte 24/7</li>
                  </ul>
                </div>
                <div className="plan-footer">
                  <button className="btn btn-primary btn-sm" onClick={() => setModalPlanActivo('intermedio')}>
                    Ver detalle
                  </button>
                </div>
              </div>

              {/* Plan Premium */}
              <div className="plan-card plan-premium">
                <div className="plan-badge badge-premium">Completo</div>
                <div className="plan-header">
                  <h3>Premium</h3>
                  <div className="plan-precio">
                    <span className="precio-valor">$3.000</span>
                    <span className="precio-periodo">/alumno/año</span>
                  </div>
                  <div className="plan-promo">3 meses gratis</div>
                </div>
                <div className="plan-body">
                  <ul className="plan-features dos-columnas">
                    <li><span className="check">&#10003;</span> Ver notas</li>
                    <li><span className="check">&#10003;</span> Ver comunicados</li>
                    <li><span className="check">&#10003;</span> Registrar notas</li>
                    <li><span className="check">&#10003;</span> Modificar notas</li>
                    <li><span className="check">&#10003;</span> Control asistencia</li>
                    <li><span className="check">&#10003;</span> Enviar comunicados</li>
                    <li><span className="check">&#10003;</span> Gestion alumnos</li>
                    <li><span className="check">&#10003;</span> Gestion docentes</li>
                    <li><span className="check">&#10003;</span> Graficos de notas</li>
                    <li><span className="check">&#10003;</span> KPIs rendimiento</li>
                    <li><span className="check">&#10003;</span> Progreso alumno</li>
                    <li><span className="check">&#10003;</span> Estadisticas admin</li>
                    <li><span className="check">&#10003;</span> Rankings</li>
                    <li><span className="check">&#10003;</span> Alertas riesgo</li>
                    <li><span className="check">&#10003;</span> Matricula online</li>
                    <li><span className="check">&#10003;</span> Gestion matriculas</li>
                    <li><span className="check">&#10003;</span> Soporte 24/7</li>
                  </ul>
                </div>
                <div className="plan-footer">
                  <button className="btn btn-outline btn-sm" onClick={() => setModalPlanActivo('premium')}>
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="beneficios">
        <div className="section-container">
          <div className="section-header">
            <h2>Por que elegir nuestro Portal?</h2>
            <p>Tecnologia al servicio de la educacion</p>
          </div>
          <div className="beneficios-grid">
            <div className="beneficio-item">
              <div className="beneficio-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <h4>Acceso Multiplataforma</h4>
              <p>Utilice el portal desde su computador de escritorio, laptop, tablet o telefono movil. Siempre disponible cuando lo necesite.</p>
            </div>
            <div className="beneficio-item">
              <div className="beneficio-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h4>Seguro y Privado</h4>
              <p>La informacion de cada usuario esta protegida. Los apoderados solo acceden a los datos de sus pupilos, garantizando la privacidad de todos.</p>
            </div>
            <div className="beneficio-item">
              <div className="beneficio-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h4>Rapido y Sencillo</h4>
              <p>Interfaz intuitiva disenada para que cualquier persona pueda utilizarla sin complicaciones ni necesidad de capacitacion.</p>
            </div>
            <div className="beneficio-item">
              <div className="beneficio-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </div>
              <h4>Informacion Actualizada</h4>
              <p>Las notas y comunicados se actualizan en tiempo real. Siempre tendra acceso a la informacion mas reciente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final">
        <div className="section-container">
          <h2>Comience a usar el Portal Estudiantil</h2>
          <p>Unase a nuestra comunidad educativa digital y mantengase conectado con el progreso academico.</p>
          <div className="cta-actions">
            <button className="btn btn-white btn-lg" onClick={onIrARegistro}>Crear una Cuenta</button>
            <button className="btn btn-outline-white btn-lg" onClick={onIrALogin}>Ya tengo cuenta</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="contacto">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">E</span>
            </div>
            <span>Portal Estudiantil</span>
          </div>
          <div className="footer-links">
            <div className="footer-links-row">
              <button onClick={onIrALogin}>Iniciar Sesion</button>
              <button onClick={onIrARegistro}>Registrarse</button>
            </div>
            <div className="footer-links-row">
              <button onClick={() => setModalPrivacidadActivo(true)}>Privacidad</button>
              <button onClick={() => setModalTerminosActivo(true)}>Condiciones y Terminos</button>
            </div>
          </div>
          <div className="footer-contacto">
            <h4>Contacto</h4>
            <div className="contacto-items">
              <a href="mailto:contacto.portalestudiantil@gmail.com" className="contacto-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>contacto.portalestudiantil@gmail.com</span>
              </a>
              <a href="https://wa.me/56927899263" target="_blank" rel="noopener noreferrer" className="contacto-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>+56 9 2789 9263</span>
              </a>
            </div>
          </div>
          <div className="footer-copy">
            <p>2024 Sistema de Gestion Academica. Todos los derechos reservados.</p>
            <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
          </div>
        </div>
      </footer>

      {/* Modal de Terminos y Condiciones */}
      <div
        className={`modal-footer-overlay ${modalTerminosActivo ? 'active' : ''}`}
        onClick={() => setModalTerminosActivo(false)}
      >
        <div className="modal-footer-contenido" onClick={(e) => e.stopPropagation()}>
          <div className="modal-footer-header">
            <h2>Terminos y Condiciones de Uso</h2>
            <button className="modal-footer-cerrar" onClick={() => setModalTerminosActivo(false)}>&times;</button>
          </div>
          <div className="modal-footer-body">
            <h3>1. Aceptacion de los Terminos</h3>
            <p>Al acceder y utilizar Portal Estudiantil, usted acepta estar sujeto a estos Terminos y Condiciones de Uso y todas las leyes y regulaciones aplicables. Usted acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no esta de acuerdo con alguno de estos terminos, tiene prohibido usar o acceder a este sitio.</p>

            <h3>2. Definiciones</h3>
            <ul>
              <li><strong>Plataforma:</strong> Sistema de Gestion Academica Portal Estudiantil.</li>
              <li><strong>Usuario:</strong> Toda persona que acceda y utilice la plataforma, incluyendo apoderados, docentes y administradores.</li>
              <li><strong>Establecimiento:</strong> Institucion educacional que utiliza los servicios de la plataforma.</li>
              <li><strong>Contenido:</strong> Toda informacion, datos, textos y materiales disponibles en la plataforma.</li>
            </ul>

            <h3>3. Uso de la Plataforma</h3>
            <p>El usuario se compromete a:</p>
            <ul>
              <li>Utilizar la plataforma unicamente para los fines educativos y administrativos para los que fue disenada.</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>No compartir su cuenta con terceros.</li>
              <li>Proporcionar informacion veraz y actualizada.</li>
              <li>No intentar acceder a informacion de otros usuarios sin autorizacion.</li>
              <li>No utilizar la plataforma para actividades ilegales o no autorizadas.</li>
            </ul>

            <h3>4. Registro y Cuentas de Usuario</h3>
            <p>Para acceder a la plataforma, los usuarios deben registrarse proporcionando informacion personal valida. El usuario es responsable de mantener la confidencialidad de su contrasena y de todas las actividades que ocurran bajo su cuenta. Debe notificar inmediatamente cualquier uso no autorizado de su cuenta.</p>

            <h3>5. Propiedad Intelectual</h3>
            <p>Todos los contenidos de la plataforma, incluyendo pero no limitado a textos, graficos, logotipos, iconos, imagenes, clips de audio, descargas digitales y compilaciones de datos, son propiedad de Portal Estudiantil o sus proveedores de contenido y estan protegidos por las leyes chilenas e internacionales de propiedad intelectual, conforme a la <strong>Ley N 17.336</strong> sobre Propiedad Intelectual.</p>

            <h3>6. Proteccion de Datos</h3>
            <p>El tratamiento de datos personales se realiza conforme a nuestra Politica de Privacidad y en cumplimiento de la <strong>Ley N 19.628</strong> sobre Proteccion de la Vida Privada y la <strong>Ley N 21.719</strong> que moderniza el marco de proteccion de datos personales en Chile.</p>

            <h3>7. Responsabilidades del Usuario</h3>
            <p>El usuario sera responsable de:</p>
            <ul>
              <li>El uso adecuado de la plataforma conforme a estos terminos.</li>
              <li>La veracidad de la informacion proporcionada.</li>
              <li>Los danos y perjuicios que pudiera causar por el uso indebido de la plataforma.</li>
              <li>Mantener actualizada su informacion de contacto.</li>
            </ul>

            <h3>8. Limitacion de Responsabilidad</h3>
            <p>Portal Estudiantil no sera responsable por:</p>
            <ul>
              <li>Interrupciones del servicio por mantenimiento o causas de fuerza mayor.</li>
              <li>Perdida de datos debido a fallos tecnicos ajenos a nuestro control.</li>
              <li>El uso indebido de la plataforma por parte de los usuarios.</li>
              <li>Contenidos publicados por los usuarios que contravengan estos terminos.</li>
            </ul>

            <h3>9. Modificaciones del Servicio</h3>
            <p>Portal Estudiantil se reserva el derecho de modificar, suspender o discontinuar, temporal o permanentemente, el servicio o cualquier parte del mismo, con o sin previo aviso. No seremos responsables ante usted ni ante terceros por cualquier modificacion, suspension o interrupcion del servicio.</p>

            <h3>10. Modificaciones de los Terminos</h3>
            <p>Nos reservamos el derecho de actualizar estos Terminos y Condiciones en cualquier momento. Cuando se realicen modificaciones, los usuarios seran notificados a traves de la plataforma o mediante correo electronico. Las modificaciones entraran en vigor a partir de su publicacion. El uso continuado de la plataforma despues de recibir dicha notificacion se entendera como la aceptacion de los nuevos terminos por parte del usuario.</p>

            <h3>11. Legislacion Aplicable</h3>
            <p>Estos Terminos y Condiciones se regiran e interpretaran de acuerdo con las leyes de la Republica de Chile. Cualquier disputa que surja en relacion con estos terminos sera sometida a la jurisdiccion de los tribunales ordinarios de justicia de Chile.</p>

            <h3>12. Contacto</h3>
            <p>Para cualquier consulta relacionada con estos Terminos y Condiciones, puede contactarnos a traves de: <strong>contacto.portalestudiantil@gmail.com</strong></p>
          </div>
          <div className="modal-footer-pie">
            <p>Ultima actualizacion: Noviembre 2024 | Portal Estudiantil - Sistema de Gestion Academica</p>
          </div>
        </div>
      </div>

      {/* Modal de Privacidad */}
      <div
        className={`modal-footer-overlay ${modalPrivacidadActivo ? 'active' : ''}`}
        onClick={() => setModalPrivacidadActivo(false)}
      >
        <div className="modal-footer-contenido" onClick={(e) => e.stopPropagation()}>
          <div className="modal-footer-header">
            <h2>Politica de Privacidad</h2>
            <button className="modal-footer-cerrar" onClick={() => setModalPrivacidadActivo(false)}>&times;</button>
          </div>
          <div className="modal-footer-body">
            <h3>1. Introduccion</h3>
            <p>En Portal Estudiantil nos comprometemos a proteger la privacidad y los datos personales de nuestros usuarios. Esta politica de privacidad describe como recopilamos, utilizamos, almacenamos y protegemos su informacion personal, en cumplimiento con la legislacion chilena vigente.</p>

            <h3>2. Marco Legal Aplicable</h3>
            <p>Nuestra politica de privacidad se rige por las siguientes normativas chilenas:</p>
            <ul>
              <li><strong>Ley N 19.628</strong> sobre Proteccion de la Vida Privada (Ley de Proteccion de Datos Personales), que regula el tratamiento de datos personales en registros o bancos de datos.</li>
              <li><strong>Ley N 21.096</strong> que consagra el derecho a la proteccion de datos personales como garantia constitucional.</li>
              <li><strong>Ley N 21.719</strong> (Nueva Ley de Proteccion de Datos Personales) que moderniza el marco regulatorio estableciendo nuevos estandares de proteccion.</li>
              <li><strong>Ley N 20.584</strong> sobre derechos y deberes de las personas en relacion con acciones vinculadas a su atencion de salud, en lo aplicable a datos sensibles.</li>
            </ul>

            <h3>3. Datos que Recopilamos</h3>
            <p>Recopilamos los siguientes tipos de datos personales:</p>
            <ul>
              <li><strong>Datos de identificacion:</strong> nombre completo, RUT, direccion, telefono y correo electronico.</li>
              <li><strong>Datos academicos:</strong> calificaciones, asistencia, observaciones pedagogicas y reportes de rendimiento.</li>
              <li><strong>Datos de uso:</strong> informacion sobre como interactua con nuestra plataforma.</li>
            </ul>

            <h3>4. Finalidad del Tratamiento</h3>
            <p>Sus datos personales seran utilizados exclusivamente para:</p>
            <ul>
              <li>Gestionar el registro academico de los estudiantes.</li>
              <li>Facilitar la comunicacion entre el establecimiento educacional, docentes y apoderados.</li>
              <li>Generar reportes de rendimiento academico.</li>
              <li>Enviar comunicados y notificaciones relevantes.</li>
              <li>Mejorar nuestros servicios y la experiencia del usuario.</li>
            </ul>

            <h3>5. Derechos de los Titulares</h3>
            <p>De acuerdo con la legislacion chilena, usted tiene derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> conocer que datos personales suyos estan siendo tratados.</li>
              <li><strong>Rectificacion:</strong> solicitar la correccion de datos inexactos o incompletos.</li>
              <li><strong>Cancelacion:</strong> solicitar la eliminacion de sus datos cuando corresponda.</li>
              <li><strong>Oposicion:</strong> oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
              <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso comun.</li>
            </ul>

            <h3>6. Seguridad de los Datos</h3>
            <p>Implementamos medidas tecnicas y organizativas apropiadas para proteger sus datos personales contra el acceso no autorizado, la alteracion, divulgacion o destruccion. Estas medidas incluyen encriptacion de datos, accesos restringidos y protocolos de seguridad actualizados.</p>

            <h3>7. Conservacion de Datos</h3>
            <p>Los datos personales seran conservados durante el tiempo necesario para cumplir con las finalidades descritas y conforme a los plazos establecidos por la normativa educacional chilena.</p>

            <h3>8. Contacto</h3>
            <p>Para ejercer sus derechos o realizar consultas sobre esta politica de privacidad, puede contactarnos a traves de nuestros canales oficiales: <strong>contacto.portalestudiantil@gmail.com</strong></p>
          </div>
          <div className="modal-footer-pie">
            <p>Ultima actualizacion: Noviembre 2024 | Portal Estudiantil - Sistema de Gestion Academica</p>
          </div>
        </div>
      </div>

      {/* Modal Plan Basico */}
      <div
        className={`modal-footer-overlay ${modalPlanActivo === 'basico' ? 'active' : ''}`}
        onClick={() => setModalPlanActivo(null)}
      >
        <div className="modal-footer-contenido modal-plan" onClick={(e) => e.stopPropagation()}>
          <div className="modal-footer-header modal-plan-header-basico">
            <div className="modal-plan-header-top">
              <h2>Plan Basico</h2>
              <div className="modal-plan-precio-box">
                <span className="modal-plan-precio">$1.500</span>
                <span className="modal-plan-periodo">/ alumno al año</span>
              </div>
            </div>
            <div className="modal-plan-promo-banner">
              <span className="promo-icon">🎁</span>
              <span className="promo-text">4 MESES GRATIS</span>
              <span className="promo-sub">para establecimientos nuevos</span>
            </div>
            <button className="modal-footer-cerrar" onClick={() => setModalPlanActivo(null)}>&times;</button>
          </div>
          <div className="modal-footer-body">
            <div className="modal-plan-seccion">
              <h3>Panel Apoderado</h3>
              <ul>
                <li>Informacion completa del pupilo</li>
                <li>Libro de calificaciones</li>
                <li>Notas por trimestre</li>
                <li>Promedios por asignatura</li>
                <li>Detalle de cada evaluacion</li>
                <li>Comunicados del colegio</li>
                <li>Acceso multiplataforma</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Panel Docente</h3>
              <ul>
                <li>Control de asistencia</li>
                <li>Agregar notas con comentarios</li>
                <li>Modificar calificaciones</li>
                <li>Ver notas por curso y asignatura</li>
                <li>Filtros multiples</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Panel Administrador</h3>
              <ul>
                <li>Gestion completa de alumnos</li>
                <li>Gestion de docentes</li>
                <li>Asignacion de cursos</li>
                <li>Notas por curso</li>
                <li>Control de asistencia general</li>
                <li>Envio de comunicados masivos</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Soporte Tecnico</h3>
              <ul>
                <li>Atencion 24/7</li>
                <li>Soporte por email</li>
              </ul>
            </div>
          </div>
          <div className="modal-footer-pie">
            <button className="btn btn-primary" onClick={abrirContactoDesdePlan}>Contáctanos</button>
          </div>
        </div>
      </div>

      {/* Modal Plan Intermedio */}
      <div
        className={`modal-footer-overlay ${modalPlanActivo === 'intermedio' ? 'active' : ''}`}
        onClick={() => setModalPlanActivo(null)}
      >
        <div className="modal-footer-contenido modal-plan" onClick={(e) => e.stopPropagation()}>
          <div className="modal-footer-header modal-plan-header-intermedio">
            <div className="modal-plan-header-top">
              <h2>Plan Intermedio</h2>
              <div className="modal-plan-precio-box">
                <span className="modal-plan-precio">$2.500</span>
                <span className="modal-plan-periodo">/ alumno al año</span>
              </div>
            </div>
            <div className="modal-plan-promo-banner">
              <span className="promo-icon">🎁</span>
              <span className="promo-text">3 MESES GRATIS</span>
              <span className="promo-sub">para establecimientos nuevos</span>
            </div>
            <button className="modal-footer-cerrar" onClick={() => setModalPlanActivo(null)}>&times;</button>
          </div>
          <div className="modal-footer-body">
            <div className="modal-plan-seccion">
              <h3>Panel Apoderado</h3>
              <ul>
                <li>Informacion completa del pupilo</li>
                <li>Libro de calificaciones</li>
                <li>Notas por trimestre</li>
                <li>Promedios por asignatura</li>
                <li>Detalle de cada evaluacion</li>
                <li>Comunicados del colegio</li>
                <li>Acceso multiplataforma</li>
                <li className="feature-destacado">Grafico rendimiento mensual</li>
                <li className="feature-destacado">KPIs de rendimiento</li>
                <li className="feature-destacado">Promedio por asignatura (grafico)</li>
                <li className="feature-destacado">Ranking en el curso</li>
                <li className="feature-destacado">Tasa de aprobacion</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Panel Docente</h3>
              <ul>
                <li>Control de asistencia</li>
                <li>Agregar notas con comentarios</li>
                <li>Modificar calificaciones</li>
                <li>Ver notas por curso y asignatura</li>
                <li>Filtros multiples</li>
                <li className="feature-destacado">Grafico evolucion del curso</li>
                <li className="feature-destacado">KPIs del curso</li>
                <li className="feature-destacado">Distribucion de notas</li>
                <li className="feature-destacado">Alumnos en riesgo academico</li>
                <li className="feature-destacado">Comparativa trimestral</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Panel Administrador</h3>
              <ul>
                <li>Gestion completa de alumnos</li>
                <li>Gestion de docentes</li>
                <li>Asignacion de cursos</li>
                <li>Notas por curso</li>
                <li>Control de asistencia general</li>
                <li>Envio de comunicados masivos</li>
                <li className="feature-destacado">Dashboard estadisticas globales</li>
                <li className="feature-destacado">Graficos de rendimiento</li>
                <li className="feature-destacado">Rankings por curso</li>
                <li className="feature-destacado">Analisis por asignatura</li>
                <li className="feature-destacado">Tendencias academicas</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Soporte Tecnico</h3>
              <ul>
                <li>Atencion 24/7</li>
                <li>Soporte por email</li>
              </ul>
            </div>
          </div>
          <div className="modal-footer-pie">
            <button className="btn btn-primary" onClick={abrirContactoDesdePlan}>Contáctanos</button>
          </div>
        </div>
      </div>

      {/* Modal Plan Premium */}
      <div
        className={`modal-footer-overlay ${modalPlanActivo === 'premium' ? 'active' : ''}`}
        onClick={() => setModalPlanActivo(null)}
      >
        <div className="modal-footer-contenido modal-plan" onClick={(e) => e.stopPropagation()}>
          <div className="modal-footer-header modal-plan-header-premium">
            <div className="modal-plan-header-top">
              <h2>Plan Premium</h2>
              <div className="modal-plan-precio-box">
                <span className="modal-plan-precio">$3.000</span>
                <span className="modal-plan-periodo">/ alumno al año</span>
              </div>
            </div>
            <div className="modal-plan-promo-banner">
              <span className="promo-icon">🎁</span>
              <span className="promo-text">3 MESES GRATIS</span>
              <span className="promo-sub">para establecimientos nuevos</span>
            </div>
            <button className="modal-footer-cerrar" onClick={() => setModalPlanActivo(null)}>&times;</button>
          </div>
          <div className="modal-footer-body">
            <div className="modal-plan-seccion">
              <h3>Panel Apoderado</h3>
              <ul>
                <li>Informacion completa del pupilo</li>
                <li>Libro de calificaciones</li>
                <li>Notas por trimestre</li>
                <li>Promedios por asignatura</li>
                <li>Detalle de cada evaluacion</li>
                <li>Comunicados del colegio</li>
                <li>Acceso multiplataforma</li>
                <li>Grafico rendimiento mensual</li>
                <li>KPIs de rendimiento</li>
                <li>Promedio por asignatura (grafico)</li>
                <li>Ranking en el curso</li>
                <li>Tasa de aprobacion</li>
                <li className="feature-premium">Matricula 100% online</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Panel Docente</h3>
              <ul>
                <li>Control de asistencia</li>
                <li>Agregar notas con comentarios</li>
                <li>Modificar calificaciones</li>
                <li>Ver notas por curso y asignatura</li>
                <li>Filtros multiples</li>
                <li>Grafico evolucion del curso</li>
                <li>KPIs del curso</li>
                <li>Distribucion de notas</li>
                <li>Alumnos en riesgo academico</li>
                <li>Comparativa trimestral</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Panel Administrador</h3>
              <ul>
                <li>Gestion completa de alumnos</li>
                <li>Gestion de docentes</li>
                <li>Asignacion de cursos</li>
                <li>Notas por curso</li>
                <li>Control de asistencia general</li>
                <li>Envio de comunicados masivos</li>
                <li>Dashboard estadisticas globales</li>
                <li>Graficos de rendimiento</li>
                <li>Rankings por curso</li>
                <li>Analisis por asignatura</li>
                <li>Tendencias academicas</li>
                <li className="feature-premium">Gestion de matriculas</li>
                <li className="feature-premium">Proceso digital completo</li>
                <li className="feature-premium">Reportes de matricula</li>
              </ul>
            </div>

            <div className="modal-plan-seccion">
              <h3>Soporte Tecnico</h3>
              <ul>
                <li>Atencion 24/7</li>
                <li>Soporte por email</li>
              </ul>
            </div>
          </div>
          <div className="modal-footer-pie">
            <button className="btn btn-primary" onClick={abrirContactoDesdePlan}>Contáctanos</button>
          </div>
        </div>
      </div>

      {/* Boton flotante de contacto */}
      <button
        className="btn-contacto-flotante"
        onClick={() => setModalContactoActivo(true)}
        title="Contactanos"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      </button>

      {/* Modal de Contacto */}
      <div
        className={`modal-footer-overlay ${modalContactoActivo ? 'active' : ''}`}
        onClick={() => setModalContactoActivo(false)}
      >
        <div className="modal-footer-contenido modal-contacto" onClick={(e) => e.stopPropagation()}>
          <div className="modal-footer-header modal-contacto-header">
            <div className="modal-contacto-titulo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <h2>Contactanos</h2>
            </div>
            <button className="modal-footer-cerrar" onClick={() => setModalContactoActivo(false)}>&times;</button>
          </div>
          <div className="modal-footer-body">
            <form onSubmit={handleContactoSubmit} className="form-contacto">
              <div className="form-row-doble">
                <div className="form-group">
                  <label htmlFor="nombre">Solicitante *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formContacto.nombre}
                    onChange={handleContactoChange}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="establecimiento">Establecimiento *</label>
                  <input
                    type="text"
                    id="establecimiento"
                    name="establecimiento"
                    value={formContacto.establecimiento}
                    onChange={handleContactoChange}
                    placeholder="Nombre del colegio"
                    required
                  />
                </div>
              </div>
              <div className="form-row-doble form-row-tel-correo">
                <div className="form-group">
                  <label htmlFor="telefono">Telefono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formContacto.telefono}
                    onChange={handleContactoChange}
                    placeholder="+56 9 1234 5678"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="correo">Correo electronico *</label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formContacto.correo}
                    onChange={handleContactoChange}
                    placeholder="ejemplo@correo.cl"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="consulta">Consulta *</label>
                <textarea
                  id="consulta"
                  name="consulta"
                  value={formContacto.consulta}
                  onChange={handleContactoChange}
                  placeholder="Escriba su consulta o mensaje..."
                  rows="5"
                  required
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalContactoActivo(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Enviar consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
