import React, { useState, useEffect } from 'react';
import { cursosDB, asignaturasDB, trimestresDB, alumnosPorCursoDB } from '../data/demoData';

function NotasPorCursoTab({ mostrarMensaje }) {
  const [filtros, setFiltros] = useState({
    curso: '',
    cursoId: null,
    asignatura: '',
    asignaturaId: null,
    trimestre: '',
    trimestreId: null
  });
  const [showTabla, setShowTabla] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-select-container')) {
        setDropdownAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCursoChange = (cursoId) => {
    const curso = cursosDB.find(c => c.id === parseInt(cursoId));
    setFiltros({
      ...filtros,
      curso: curso?.nombre || '',
      cursoId: cursoId ? parseInt(cursoId) : null,
      asignatura: '',
      asignaturaId: null,
      trimestre: '',
      trimestreId: null
    });
    setShowTabla(false);
  };

  const handleAsignaturaChange = (asignaturaId) => {
    const asignatura = asignaturasDB.find(a => a.id === parseInt(asignaturaId));
    setFiltros({
      ...filtros,
      asignatura: asignatura?.nombre || '',
      asignaturaId: asignaturaId ? parseInt(asignaturaId) : null,
      trimestre: '',
      trimestreId: null
    });
    setShowTabla(false);
  };

  const handleTrimestreChange = (trimestreId) => {
    if (trimestreId === 'todas') {
      setFiltros({
        ...filtros,
        trimestre: 'Todas',
        trimestreId: 'todas'
      });
      setShowTabla(true);
    } else {
      const trimestre = trimestresDB.find(t => t.id === parseInt(trimestreId));
      setFiltros({
        ...filtros,
        trimestre: trimestre?.nombre || '',
        trimestreId: trimestreId ? parseInt(trimestreId) : null
      });
      if (trimestreId) {
        setShowTabla(true);
      }
    }
  };

  const getAlumnosCurso = () => {
    if (!filtros.curso) return [];
    return alumnosPorCursoDB[filtros.curso] || [];
  };

  // Generar notas aleatorias para demo (8 notas)
  const generarNotasDemo = () => {
    return Array.from({ length: 8 }, () => (Math.random() * 3 + 4).toFixed(1));
  };

  // Generar notas para todos los trimestres (8 notas por trimestre)
  const generarNotasTodasDemo = () => {
    return trimestresDB.map(trim => ({
      trimestre: trim.nombre,
      notas: Array.from({ length: 8 }, () => (Math.random() * 3 + 4).toFixed(1))
    }));
  };

  // Calcular promedio de un array de notas
  const calcularPromedio = (notas) => {
    const suma = notas.reduce((a, b) => a + parseFloat(b), 0);
    return (suma / notas.length).toFixed(1);
  };

  // Abreviar nombre: "Juan Pablo Gonzalez Perez" → "Juan P. Gonzalez P."
  const abreviarNombreAlumno = (nombreCompleto) => {
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length >= 4) {
      // Nombre1 Nombre2 Apellido1 Apellido2 → Nombre1 N. Apellido1 A.
      const nombre1 = partes[0];
      const nombre2Inicial = partes[1].charAt(0) + '.';
      const apellido1 = partes[2];
      const apellido2Inicial = partes[3].charAt(0) + '.';
      return `${nombre1} ${nombre2Inicial} ${apellido1} ${apellido2Inicial}`;
    } else if (partes.length === 3) {
      // Nombre Apellido1 Apellido2 → Nombre Apellido1 A.
      const apellido2Inicial = partes[2].charAt(0) + '.';
      return `${partes[0]} ${partes[1]} ${apellido2Inicial}`;
    }
    return nombreCompleto;
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header">
          <h3>Notas por Curso y Asignatura</h3>
        </div>
        <div className="card-body">
          <div className="filtros-notas-curso filtros-notas-inline">
            <div className="form-group">
              <label>Curso</label>
              <div className="custom-select-container">
                <div
                  className="custom-select-trigger"
                  onClick={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
                >
                  <span>{filtros.curso || 'Seleccionar...'}</span>
                  <span className="custom-select-arrow">{dropdownAbierto === 'curso' ? '▲' : '▼'}</span>
                </div>
                {dropdownAbierto === 'curso' && (
                  <div className="custom-select-options custom-select-scroll">
                    <div
                      className="custom-select-option"
                      onClick={() => {
                        handleCursoChange('');
                        setDropdownAbierto(null);
                      }}
                    >
                      Seleccionar...
                    </div>
                    {cursosDB.map(curso => (
                      <div
                        key={curso.id}
                        className={`custom-select-option ${filtros.cursoId === curso.id ? 'selected' : ''}`}
                        onClick={() => {
                          handleCursoChange(curso.id);
                          setDropdownAbierto(null);
                        }}
                      >
                        {curso.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
                <label>Asignatura</label>
                <div className="custom-select-container">
                  <div
                    className="custom-select-trigger"
                    onClick={() => setDropdownAbierto(dropdownAbierto === 'asignatura' ? null : 'asignatura')}
                  >
                    <span>{filtros.asignatura || 'Seleccionar...'}</span>
                    <span className="custom-select-arrow">{dropdownAbierto === 'asignatura' ? '▲' : '▼'}</span>
                  </div>
                  {dropdownAbierto === 'asignatura' && (
                    <div className="custom-select-options custom-select-scroll">
                      <div
                        className="custom-select-option"
                        onClick={() => {
                          handleAsignaturaChange('');
                          setDropdownAbierto(null);
                        }}
                      >
                        Seleccionar...
                      </div>
                      {asignaturasDB.map(asig => (
                        <div
                          key={asig.id}
                          className={`custom-select-option ${filtros.asignaturaId === asig.id ? 'selected' : ''}`}
                          onClick={() => {
                            handleAsignaturaChange(asig.id);
                            setDropdownAbierto(null);
                          }}
                        >
                          {asig.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            <div className="form-group">
                <label>Trimestre</label>
                <div className="custom-select-container">
                  <div
                    className="custom-select-trigger"
                    onClick={() => setDropdownAbierto(dropdownAbierto === 'trimestre' ? null : 'trimestre')}
                  >
                    <span>{filtros.trimestre || 'Seleccionar...'}</span>
                    <span className="custom-select-arrow">{dropdownAbierto === 'trimestre' ? '▲' : '▼'}</span>
                  </div>
                  {dropdownAbierto === 'trimestre' && (
                    <div className="custom-select-options custom-select-scroll">
                      <div
                        className="custom-select-option"
                        onClick={() => {
                          handleTrimestreChange('');
                          setDropdownAbierto(null);
                        }}
                      >
                        Seleccionar...
                      </div>
                      <div
                        className={`custom-select-option ${filtros.trimestreId === 'todas' ? 'selected' : ''}`}
                        onClick={() => {
                          handleTrimestreChange('todas');
                          setDropdownAbierto(null);
                        }}
                      >
                        Todas
                      </div>
                      {trimestresDB.map(trim => (
                        <div
                          key={trim.id}
                          className={`custom-select-option ${filtros.trimestreId === trim.id ? 'selected' : ''}`}
                          onClick={() => {
                            handleTrimestreChange(trim.id);
                            setDropdownAbierto(null);
                          }}
                        >
                          {trim.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
          </div>

          {showTabla ? (
            <div className="tabla-notas-curso-container">
              <div className="table-responsive table-scroll">
                {filtros.trimestreId === 'todas' ? (
                  /* Tabla con TODAS las notas de todos los trimestres */
                  <table className="data-table tabla-notas-amplia">
                    <thead>
                      <tr>
                        <th rowSpan="2" className="th-nombre">Alumno</th>
                        {trimestresDB.map(trim => (
                          <th key={trim.id} colSpan="9" className="th-trimestre">
                            {trim.nombre.replace('Trimestre ', 'T')}
                          </th>
                        ))}
                        <th rowSpan="2" className="th-promedio-final">P.F.</th>
                      </tr>
                      <tr>
                        {trimestresDB.map(trim => (
                          <React.Fragment key={`notas-${trim.id}`}>
                            <th className="th-nota">1</th>
                            <th className="th-nota">2</th>
                            <th className="th-nota">3</th>
                            <th className="th-nota">4</th>
                            <th className="th-nota">5</th>
                            <th className="th-nota">6</th>
                            <th className="th-nota">7</th>
                            <th className="th-nota">8</th>
                            <th className="th-prom-trim">P</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getAlumnosCurso().length > 0 ? (
                        getAlumnosCurso().map(alumno => {
                          const notasTrimestres = generarNotasTodasDemo();
                          const promediosTrimestre = notasTrimestres.map(t => calcularPromedio(t.notas));
                          const promedioFinal = calcularPromedio(promediosTrimestre);
                          return (
                            <tr key={alumno.id}>
                              <td className="celda-nombre">{abreviarNombreAlumno(alumno.nombre_completo)}</td>
                              {notasTrimestres.map((trim, trimIdx) => (
                                <React.Fragment key={`trim-${trimIdx}`}>
                                  {trim.notas.map((nota, notaIdx) => (
                                    <td key={notaIdx} className="celda-nota">
                                      <input
                                        type="text"
                                        className="nota-input-mini"
                                        defaultValue={nota}
                                      />
                                    </td>
                                  ))}
                                  <td className={`celda-promedio-trim ${parseFloat(promediosTrimestre[trimIdx]) >= 4.0 ? 'promedio-aprobado' : 'promedio-reprobado'}`}>
                                    {promediosTrimestre[trimIdx]}
                                  </td>
                                </React.Fragment>
                              ))}
                              <td className={`celda-promedio-final ${parseFloat(promedioFinal) >= 4.0 ? 'promedio-aprobado' : 'promedio-reprobado'}`}>
                                {promedioFinal}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={2 + (trimestresDB.length * 9)} className="text-center text-muted">No hay alumnos en este curso</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  /* Tabla de un solo trimestre */
                  <table className="data-table tabla-notas-amplia">
                    <thead>
                      <tr>
                        <th className="th-nombre">Alumno</th>
                        <th className="th-nota">1</th>
                        <th className="th-nota">2</th>
                        <th className="th-nota">3</th>
                        <th className="th-nota">4</th>
                        <th className="th-nota">5</th>
                        <th className="th-nota">6</th>
                        <th className="th-nota">7</th>
                        <th className="th-nota">8</th>
                        <th className="th-promedio-final">Prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAlumnosCurso().length > 0 ? (
                        getAlumnosCurso().map(alumno => {
                          const notas = generarNotasDemo();
                          const promedio = calcularPromedio(notas);
                          return (
                            <tr key={alumno.id}>
                              <td className="celda-nombre">{abreviarNombreAlumno(alumno.nombre_completo)}</td>
                              {notas.map((nota, idx) => (
                                <td key={idx} className="celda-nota">
                                  <input
                                    type="text"
                                    className="nota-input-mini"
                                    defaultValue={nota}
                                  />
                                </td>
                              ))}
                              <td className={`celda-promedio-final ${parseFloat(promedio) >= 4.0 ? 'promedio-aprobado' : 'promedio-reprobado'}`}>
                                {promedio}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center text-muted">No hay alumnos en este curso</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: '40px' }}>
              Seleccione un curso para comenzar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotasPorCursoTab;
