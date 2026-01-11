import React, { useState, useMemo, useEffect, useRef } from 'react';
import InformacionTab from './InformacionTab';
import NotasTab from './NotasTab';
import ComunicadosTab from './ComunicadosTab';
import ProgresoTab from './ProgresoTab';

// Datos demo del apoderado
const apoderadoDemo = {
  id: 1,
  nombre: 'Maria',
  apellidos: 'Gonzalez Rodriguez',
  rut: '12.345.678-9',
  email: 'maria.gonzalez@email.com',
  telefono: '+56 9 1234 5678',
  direccion: 'Av. Principal 123, Santiago',
  parentesco: 'Madre'
};

// Datos demo de pupilos
const pupilosDemo = [
  {
    id: 1,
    nombres: 'Pedro',
    apellidos: 'Gonzalez Martinez',
    rut: '21.234.567-8',
    fechaNacimiento: '2012-03-15',
    curso: '6to Basico A',
    curso_id: 1,
    email: 'pedro.gonzalez@colegio.cl',
    foto: null
  },
  {
    id: 2,
    nombres: 'Ana',
    apellidos: 'Gonzalez Martinez',
    rut: '22.345.678-9',
    fechaNacimiento: '2014-07-22',
    curso: '4to Basico B',
    curso_id: 2,
    email: 'ana.gonzalez@colegio.cl',
    foto: null
  }
];

// Notas demo - Pedro (alumno_id: 1)
const notasDemo = [
  // Pedro - Trimestre 1
  { id: 1, alumno_id: 1, asignatura: 'Matematicas', asignatura_id: 1, nota: 6.5, trimestre: 1, fecha: '2024-04-15', comentario: 'Excelente desempeno en algebra' },
  { id: 2, alumno_id: 1, asignatura: 'Lenguaje', asignatura_id: 2, nota: 5.8, trimestre: 1, fecha: '2024-04-18', comentario: '' },
  { id: 3, alumno_id: 1, asignatura: 'Ciencias', asignatura_id: 3, nota: 6.2, trimestre: 1, fecha: '2024-04-20', comentario: 'Muy buen trabajo en laboratorio' },
  { id: 4, alumno_id: 1, asignatura: 'Historia', asignatura_id: 4, nota: 5.5, trimestre: 1, fecha: '2024-04-22', comentario: '' },
  { id: 5, alumno_id: 1, asignatura: 'Ingles', asignatura_id: 5, nota: 6.8, trimestre: 1, fecha: '2024-04-25', comentario: 'Destacado en pronunciacion' },
  // Pedro - Trimestre 2
  { id: 6, alumno_id: 1, asignatura: 'Matematicas', asignatura_id: 1, nota: 6.3, trimestre: 2, fecha: '2024-07-10', comentario: '' },
  { id: 7, alumno_id: 1, asignatura: 'Lenguaje', asignatura_id: 2, nota: 6.0, trimestre: 2, fecha: '2024-07-12', comentario: 'Mejoro en comprension lectora' },
  { id: 8, alumno_id: 1, asignatura: 'Ciencias', asignatura_id: 3, nota: 6.5, trimestre: 2, fecha: '2024-07-15', comentario: '' },
  { id: 9, alumno_id: 1, asignatura: 'Historia', asignatura_id: 4, nota: 5.8, trimestre: 2, fecha: '2024-07-18', comentario: '' },
  { id: 10, alumno_id: 1, asignatura: 'Ingles', asignatura_id: 5, nota: 7.0, trimestre: 2, fecha: '2024-07-20', comentario: 'Excelente' },
  // Pedro - Trimestre 3
  { id: 11, alumno_id: 1, asignatura: 'Matematicas', asignatura_id: 1, nota: 6.7, trimestre: 3, fecha: '2024-10-05', comentario: '' },
  { id: 12, alumno_id: 1, asignatura: 'Lenguaje', asignatura_id: 2, nota: 6.2, trimestre: 3, fecha: '2024-10-08', comentario: '' },
  // Ana - Trimestre 1
  { id: 13, alumno_id: 2, asignatura: 'Matematicas', asignatura_id: 1, nota: 5.8, trimestre: 1, fecha: '2024-04-15', comentario: '' },
  { id: 14, alumno_id: 2, asignatura: 'Lenguaje', asignatura_id: 2, nota: 6.5, trimestre: 1, fecha: '2024-04-18', comentario: 'Excelente redaccion' },
  { id: 15, alumno_id: 2, asignatura: 'Ciencias', asignatura_id: 3, nota: 5.5, trimestre: 1, fecha: '2024-04-20', comentario: '' },
  { id: 16, alumno_id: 2, asignatura: 'Historia', asignatura_id: 4, nota: 6.0, trimestre: 1, fecha: '2024-04-22', comentario: '' },
  { id: 17, alumno_id: 2, asignatura: 'Ingles', asignatura_id: 5, nota: 5.2, trimestre: 1, fecha: '2024-04-25', comentario: 'Debe practicar vocabulario' },
  // Ana - Trimestre 2
  { id: 18, alumno_id: 2, asignatura: 'Matematicas', asignatura_id: 1, nota: 6.0, trimestre: 2, fecha: '2024-07-10', comentario: '' },
  { id: 19, alumno_id: 2, asignatura: 'Lenguaje', asignatura_id: 2, nota: 6.8, trimestre: 2, fecha: '2024-07-12', comentario: '' },
  { id: 20, alumno_id: 2, asignatura: 'Ciencias', asignatura_id: 3, nota: 5.8, trimestre: 2, fecha: '2024-07-15', comentario: 'Mejorando' },
  { id: 21, alumno_id: 2, asignatura: 'Historia', asignatura_id: 4, nota: 6.2, trimestre: 2, fecha: '2024-07-18', comentario: '' },
  { id: 22, alumno_id: 2, asignatura: 'Ingles', asignatura_id: 5, nota: 5.5, trimestre: 2, fecha: '2024-07-20', comentario: '' },
  // Ana - Trimestre 3
  { id: 23, alumno_id: 2, asignatura: 'Matematicas', asignatura_id: 1, nota: 6.2, trimestre: 3, fecha: '2024-10-05', comentario: '' },
  { id: 24, alumno_id: 2, asignatura: 'Lenguaje', asignatura_id: 2, nota: 7.0, trimestre: 3, fecha: '2024-10-08', comentario: 'Sobresaliente' },
];

// Comunicados demo - con alumno_id para filtrar por pupilo
const comunicadosDemo = [
  // Comunicados de Pedro (alumno_id: 1)
  {
    id: 1,
    alumno_id: 1,
    titulo: 'Reunion de Apoderados 6to Basico',
    mensaje: 'Se convoca a reunion de apoderados del 6to Basico A el dia viernes 15 de noviembre a las 18:00 hrs en el salon principal del establecimiento. Se trataran temas importantes sobre el cierre del ano escolar.',
    fecha: '2024-11-08',
    tipo: 'reunion',
    leido: false
  },
  {
    id: 2,
    alumno_id: 1,
    titulo: 'Calendario de Examenes Finales',
    mensaje: 'Informamos que los examenes finales del 6to Basico se realizaran del 2 al 13 de diciembre. Adjunto encontrara el calendario detallado por asignatura.',
    fecha: '2024-11-05',
    tipo: 'academico',
    leido: true
  },
  {
    id: 3,
    alumno_id: 1,
    titulo: 'Actividad Dia del Alumno',
    mensaje: 'El proximo miercoles 20 de noviembre celebraremos el Dia del Alumno con diversas actividades recreativas. Los estudiantes pueden asistir con ropa de color.',
    fecha: '2024-11-01',
    tipo: 'evento',
    leido: true
  },
  {
    id: 4,
    alumno_id: 1,
    titulo: 'Felicitaciones por rendimiento',
    mensaje: 'Felicitamos a Pedro por su excelente desempeno en la asignatura de Ingles durante el segundo trimestre.',
    fecha: '2024-10-15',
    tipo: 'academico',
    leido: true
  },
  // Comunicados de Ana (alumno_id: 2)
  {
    id: 5,
    alumno_id: 2,
    titulo: 'Reunion de Apoderados 4to Basico',
    mensaje: 'Se convoca a reunion de apoderados del 4to Basico B el dia jueves 14 de noviembre a las 17:00 hrs en la sala de reuniones.',
    fecha: '2024-11-07',
    tipo: 'reunion',
    leido: false
  },
  {
    id: 6,
    alumno_id: 2,
    titulo: 'Excursion Pedagogica',
    mensaje: 'El 4to Basico B realizara una excursion al Museo de Historia Natural el dia 22 de noviembre. Se adjunta autorizacion para firmar.',
    fecha: '2024-11-04',
    tipo: 'evento',
    leido: true
  },
  {
    id: 7,
    alumno_id: 2,
    titulo: 'Destacada en Lenguaje',
    mensaje: 'Felicitamos a Ana por obtener la mejor nota del curso en la evaluacion de comprension lectora.',
    fecha: '2024-10-20',
    tipo: 'academico',
    leido: true
  },
  {
    id: 8,
    alumno_id: 2,
    titulo: 'Actualizacion de Datos',
    mensaje: 'Solicitamos actualizar los datos de contacto de emergencia en secretaria antes del 30 de noviembre.',
    fecha: '2024-10-28',
    tipo: 'administrativo',
    leido: true
  }
];

function ApoderadoPage({ onCambiarVista }) {
  const [tabActiva, setTabActiva] = useState('informacion');
  const [pupiloSeleccionado, setPupiloSeleccionado] = useState(pupilosDemo[0]);
  const [mostrarSelectorPupilo, setMostrarSelectorPupilo] = useState(false);
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [comunicados, setComunicados] = useState(comunicadosDemo);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarSelectorPupilo(false);
      }
    };

    if (mostrarSelectorPupilo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarSelectorPupilo]);

  const tabs = [
    { id: 'informacion', label: 'Informacion' },
    { id: 'notas', label: 'Notas' },
    { id: 'comunicados', label: 'Comunicados' },
    { id: 'progreso', label: 'Progreso' }
  ];

  // Filtrar notas por pupilo seleccionado
  const notasFiltradas = useMemo(() => {
    return notasDemo.filter(nota => nota.alumno_id === pupiloSeleccionado.id);
  }, [pupiloSeleccionado.id]);

  // Filtrar comunicados por pupilo seleccionado
  const comunicadosFiltrados = useMemo(() => {
    return comunicados.filter(c => c.alumno_id === pupiloSeleccionado.id);
  }, [comunicados, pupiloSeleccionado.id]);

  const handleCambiarPupilo = (pupilo) => {
    setPupiloSeleccionado(pupilo);
    setMostrarSelectorPupilo(false);
  };

  const marcarComoLeido = (comunicadoId) => {
    setComunicados(prev => prev.map(c =>
      c.id === comunicadoId ? { ...c, leido: true } : c
    ));
  };

  // Contar comunicados no leidos del pupilo seleccionado
  const comunicadosNoLeidos = comunicadosFiltrados.filter(c => !c.leido).length;

  const renderTabContent = () => {
    switch (tabActiva) {
      case 'informacion':
        return <InformacionTab pupilo={pupiloSeleccionado} apoderado={apoderadoDemo} />;
      case 'notas':
        return <NotasTab notas={notasFiltradas} pupilo={pupiloSeleccionado} />;
      case 'comunicados':
        return <ComunicadosTab comunicados={comunicadosFiltrados} onMarcarLeido={marcarComoLeido} />;
      case 'progreso':
        return <ProgresoTab notas={notasFiltradas} pupilo={pupiloSeleccionado} />;
      default:
        return <InformacionTab pupilo={pupiloSeleccionado} apoderado={apoderadoDemo} />;
    }
  };

  return (
    <div className="apoderado-container">
      {/* Header */}
      <header className="apoderado-header">
        <div className="apoderado-header-content">
          <div className="apoderado-header-left">
            <div className="apoderado-logo">
              <span>E</span>
            </div>
            <div className="apoderado-header-info">
              <h1>Portal del Apoderado</h1>
              <p>Bienvenido/a, {apoderadoDemo.nombre} {apoderadoDemo.apellidos}</p>
            </div>
          </div>
          <div className="apoderado-header-right">
            <button className="btn-cerrar-sesion" onClick={onCambiarVista}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="btn-text">Cerrar Sesion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="apoderado-main">
        {/* Card Pupilo */}
        <div className="pupilo-card">
          <div className="pupilo-card-content">
            <div className="pupilo-avatar">
              {pupiloSeleccionado.foto ? (
                <img src={pupiloSeleccionado.foto} alt={pupiloSeleccionado.nombres} />
              ) : (
                <div className="pupilo-avatar-placeholder">
                  {pupiloSeleccionado.nombres.charAt(0)}{pupiloSeleccionado.apellidos.charAt(0)}
                </div>
              )}
            </div>
            <div className="pupilo-info">
              <h2>{pupiloSeleccionado.nombres} {pupiloSeleccionado.apellidos}</h2>
              <p className="pupilo-curso">{pupiloSeleccionado.curso}</p>
              <p className="pupilo-rut">RUT: {pupiloSeleccionado.rut}</p>
            </div>
            <div className="pupilo-actions">
              {pupilosDemo.length > 1 && (
                <div className="pupilo-selector-container" ref={dropdownRef}>
                  <button
                    className="btn-cambiar-pupilo"
                    onClick={() => setMostrarSelectorPupilo(!mostrarSelectorPupilo)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <polyline points="17 11 19 13 23 9" />
                    </svg>
                    Cambiar Pupilo
                  </button>
                  {mostrarSelectorPupilo && (
                    <div className="pupilo-dropdown">
                      {pupilosDemo.map(pupilo => (
                        <div
                          key={pupilo.id}
                          className={`pupilo-dropdown-item ${pupilo.id === pupiloSeleccionado.id ? 'active' : ''}`}
                          onClick={() => handleCambiarPupilo(pupilo)}
                        >
                          <div className="pupilo-dropdown-avatar">
                            {pupilo.nombres.charAt(0)}{pupilo.apellidos.charAt(0)}
                          </div>
                          <div className="pupilo-dropdown-info">
                            <span className="pupilo-dropdown-name">{pupilo.nombres} {pupilo.apellidos}</span>
                            <span className="pupilo-dropdown-curso">{pupilo.curso}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button className="btn-agregar-pupilo" onClick={() => setMostrarModalAgregar(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Agregar Pupilo
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="apoderado-tabs-container">
          <nav className="apoderado-tabs-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`apoderado-tab-btn ${tabActiva === tab.id ? 'active' : ''}`}
                onClick={() => setTabActiva(tab.id)}
              >
                {tab.label}
                {tab.id === 'comunicados' && comunicadosNoLeidos > 0 && (
                  <span className="tab-badge">{comunicadosNoLeidos}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="apoderado-tabs-content">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="apoderado-footer">
        <p>Sistema de Gestion Academica &copy; 2024 | Portal del Apoderado</p>
        <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
      </footer>

      {/* Modal Agregar Pupilo */}
      {mostrarModalAgregar && (
        <div className="modal-overlay" onClick={() => setMostrarModalAgregar(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Pupilo</h3>
              <button className="modal-close" onClick={() => setMostrarModalAgregar(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Ingrese los datos solicitados para vincular un nuevo alumno a su cuenta de apoderado.
              </p>
              <div className="form-group">
                <label>RUT del Alumno</label>
                <input type="text" className="form-control" placeholder="Ej: 21.234.567-8" />
              </div>
              <div className="form-group">
                <label>Codigo de Vinculacion</label>
                <input type="text" className="form-control" placeholder="Ej: ABC123XYZ" />
              </div>
              <div className="form-group">
                <label>Parentesco</label>
                <select className="form-control">
                  <option value="">Seleccione parentesco</option>
                  <option value="padre">Padre</option>
                  <option value="madre">Madre</option>
                  <option value="tutor">Tutor Legal</option>
                  <option value="abuelo">Abuelo/a</option>
                  <option value="tio">Tio/a</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarModalAgregar(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">
                Vincular Pupilo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApoderadoPage;
