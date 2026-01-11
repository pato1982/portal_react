import React, { useState, useEffect } from 'react';
import AsistenciaTab from './AsistenciaTab';
import AgregarNotaTab from './AgregarNotaTab';
import ModificarNotaTab from './ModificarNotaTab';
import VerNotasTab from './VerNotasTab';
import ProgresoTab from './ProgresoTab';

function DocentePage({ onCambiarVista }) {
  const [tabActual, setTabActual] = useState('asistencia');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('es-CL', options));
    };
    updateDate();
  }, []);

  // Datos del docente (demo)
  const docenteActual = {
    id: 1,
    nombres: 'Maria',
    apellidos: 'Gonzalez',
    iniciales: 'MG'
  };

  // Cursos asignados al docente (demo)
  const cursosDocente = [
    { id: 1, nombre: '1° Basico A' },
    { id: 2, nombre: '2° Basico A' },
    { id: 5, nombre: '1° Medio A' }
  ];

  // Asignaciones del docente (curso-asignatura)
  const asignacionesDocente = [
    { curso_id: 1, asignatura_id: 1, curso_nombre: '1° Basico A', asignatura_nombre: 'Matematicas' },
    { curso_id: 1, asignatura_id: 2, curso_nombre: '1° Basico A', asignatura_nombre: 'Lenguaje' },
    { curso_id: 2, asignatura_id: 1, curso_nombre: '2° Basico A', asignatura_nombre: 'Matematicas' },
    { curso_id: 5, asignatura_id: 1, curso_nombre: '1° Medio A', asignatura_nombre: 'Matematicas' }
  ];

  // Alumnos demo por curso
  const alumnosPorCurso = {
    1: [
      { id: 1, nombres: 'Juan Pablo', apellidos: 'Perez Soto', rut: '21.234.567-8' },
      { id: 2, nombres: 'Maria Jose', apellidos: 'Lopez Vera', rut: '21.345.678-9' },
      { id: 3, nombres: 'Pedro Antonio', apellidos: 'Martinez Riquelme', rut: '21.456.789-0' },
      { id: 4, nombres: 'Ana Carolina', apellidos: 'Garcia Fuentes', rut: '21.567.890-1' },
      { id: 5, nombres: 'Carlos Andres', apellidos: 'Rodriguez Meza', rut: '21.678.901-2' }
    ],
    2: [
      { id: 6, nombres: 'Sofia Alejandra', apellidos: 'Hernandez Pino', rut: '21.789.012-3' },
      { id: 7, nombres: 'Diego Ignacio', apellidos: 'Sanchez Bravo', rut: '21.890.123-4' },
      { id: 8, nombres: 'Valentina Paz', apellidos: 'Torres Leiva', rut: '21.901.234-5' },
      { id: 9, nombres: 'Matias Felipe', apellidos: 'Flores Campos', rut: '22.012.345-6' }
    ],
    5: [
      { id: 10, nombres: 'Camila Fernanda', apellidos: 'Rojas Silva', rut: '20.123.456-7' },
      { id: 11, nombres: 'Benjamin Alonso', apellidos: 'Diaz Ortiz', rut: '20.234.567-8' },
      { id: 12, nombres: 'Isidora Belen', apellidos: 'Morales Vega', rut: '20.345.678-9' },
      { id: 13, nombres: 'Sebastian Nicolas', apellidos: 'Munoz Tapia', rut: '20.456.789-0' },
      { id: 14, nombres: 'Antonella Victoria', apellidos: 'Castro Nunez', rut: '20.567.890-1' }
    ]
  };

  const [notasRegistradas, setNotasRegistradas] = useState([
    { id: 1, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 1, fecha: '2024-03-15', comentario: '' },
    { id: 2, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 1, fecha: '2024-04-10', comentario: '' },
    { id: 3, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 1, fecha: '2024-05-08', comentario: 'Excelente progreso' }
  ]);

  const tabs = [
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'agregar-nota', label: 'Agregar Nota' },
    { id: 'modificar-nota', label: 'Modificar Nota' },
    { id: 'ver-notas', label: 'Ver Notas' },
    { id: 'progreso', label: 'Progreso' }
  ];

  const agregarNota = (nuevaNota) => {
    const nota = { id: notasRegistradas.length + 1, ...nuevaNota };
    setNotasRegistradas([nota, ...notasRegistradas]);
  };

  const editarNota = (id, datosActualizados) => {
    setNotasRegistradas(notasRegistradas.map(nota => nota.id === id ? { ...nota, ...datosActualizados } : nota));
  };

  const eliminarNota = (id) => {
    setNotasRegistradas(notasRegistradas.filter(nota => nota.id !== id));
  };

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
              {tabActual === 'asistencia' && <AsistenciaTab cursos={cursosDocente} alumnosPorCurso={alumnosPorCurso} />}
              {tabActual === 'agregar-nota' && <AgregarNotaTab cursos={cursosDocente} asignaciones={asignacionesDocente} alumnosPorCurso={alumnosPorCurso} notasRegistradas={notasRegistradas} onAgregarNota={agregarNota} />}
              {tabActual === 'modificar-nota' && <ModificarNotaTab cursos={cursosDocente} asignaciones={asignacionesDocente} alumnosPorCurso={alumnosPorCurso} notasRegistradas={notasRegistradas} onEditarNota={editarNota} onEliminarNota={eliminarNota} />}
              {tabActual === 'ver-notas' && <VerNotasTab cursos={cursosDocente} asignaciones={asignacionesDocente} alumnosPorCurso={alumnosPorCurso} notasRegistradas={notasRegistradas} />}
              {tabActual === 'progreso' && <ProgresoTab cursos={cursosDocente} asignaciones={asignacionesDocente} alumnosPorCurso={alumnosPorCurso} notasRegistradas={notasRegistradas} />}
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
