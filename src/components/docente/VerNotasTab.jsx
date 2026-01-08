import React, { useState, useMemo, useEffect } from 'react';

function VerNotasTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroAlumnoId, setFiltroAlumnoId] = useState('');
  const [mostrarDropdownAlumno, setMostrarDropdownAlumno] = useState(false);
  const [consultado, setConsultado] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 699);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 699);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-select-container')) {
        setDropdownAbierto(null);
      }
      if (!event.target.closest('.docente-autocomplete-container')) {
        setMostrarDropdownAlumno(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funciones para abrir dropdowns (cierra los otros al abrir uno)
  const abrirDropdown = (nombre) => {
    setDropdownAbierto(dropdownAbierto === nombre ? null : nombre);
    setMostrarDropdownAlumno(false);
  };

  const abrirDropdownAlumno = (abrir) => {
    setMostrarDropdownAlumno(abrir);
    if (abrir) setDropdownAbierto(null);
  };

  // Asignaturas disponibles segun el curso seleccionado
  const asignaturasDisponibles = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return asignaciones
      .filter(a => a.curso_id === parseInt(cursoSeleccionado))
      .map(a => ({ id: a.asignatura_id, nombre: a.asignatura_nombre }));
  }, [cursoSeleccionado, asignaciones]);

  // Alumnos del curso seleccionado
  const alumnosDelCurso = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return alumnosPorCurso[cursoSeleccionado] || [];
  }, [cursoSeleccionado, alumnosPorCurso]);

  // Alumnos filtrados por busqueda
  const alumnosFiltrados = useMemo(() => {
    // Si ya hay un alumno seleccionado, mostrar todos al abrir dropdown
    if (filtroAlumnoId) return alumnosDelCurso;
    if (!filtroAlumno) return alumnosDelCurso;
    const busqueda = filtroAlumno.toLowerCase();
    return alumnosDelCurso.filter(a =>
      `${a.nombres} ${a.apellidos}`.toLowerCase().includes(busqueda)
    );
  }, [alumnosDelCurso, filtroAlumno, filtroAlumnoId]);

  // Datos para la tabla de notas por trimestre
  const datosTabla = useMemo(() => {
    if (!consultado || !cursoSeleccionado || !asignaturaSeleccionada) return [];

    const alumnos = alumnosPorCurso[cursoSeleccionado] || [];
    const cursoId = parseInt(cursoSeleccionado);
    const asignaturaId = parseInt(asignaturaSeleccionada);

    return alumnos.map(alumno => {
      // Obtener notas del alumno para esta asignatura
      const notasAlumno = notasRegistradas.filter(n =>
        n.alumno_id === alumno.id &&
        n.curso_id === cursoId &&
        n.asignatura_id === asignaturaId
      );

      // Organizar notas por trimestre (maximo 8 notas por trimestre)
      const notasPorTrimestre = {
        1: [],
        2: [],
        3: []
      };

      notasAlumno.forEach(nota => {
        if (notasPorTrimestre[nota.trimestre] && notasPorTrimestre[nota.trimestre].length < 8) {
          notasPorTrimestre[nota.trimestre].push(nota.nota);
        }
      });

      // Calcular promedios por trimestre
      const calcularPromedio = (notas) => {
        const notasValidas = notas.filter(n => n !== null);
        if (notasValidas.length === 0) return null;
        return notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
      };

      const promedioT1 = calcularPromedio(notasPorTrimestre[1]);
      const promedioT2 = calcularPromedio(notasPorTrimestre[2]);
      const promedioT3 = calcularPromedio(notasPorTrimestre[3]);

      // Calcular promedio final
      const promediosTrimestre = [promedioT1, promedioT2, promedioT3].filter(p => p !== null);
      const promedioFinal = promediosTrimestre.length > 0
        ? promediosTrimestre.reduce((a, b) => a + b, 0) / promediosTrimestre.length
        : null;

      return {
        alumno,
        notasT1: notasPorTrimestre[1],
        notasT2: notasPorTrimestre[2],
        notasT3: notasPorTrimestre[3],
        promedioT1,
        promedioT2,
        promedioT3,
        promedioFinal,
        estado: promedioFinal !== null ? (promedioFinal >= 4.0 ? 'Aprobado' : 'Reprobado') : '-'
      };
    }).filter(row => {
      // Aplicar filtro de alumno
      if (filtroAlumnoId) {
        if (row.alumno.id !== parseInt(filtroAlumnoId)) return false;
      }
      return true;
    });
  }, [consultado, cursoSeleccionado, asignaturaSeleccionada, alumnosPorCurso, notasRegistradas, filtroAlumnoId]);

  const handleCursoChange = (cursoId, nombre = '') => {
    setCursoSeleccionado(cursoId);
    setCursoNombre(nombre);
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setFiltroAlumno('');
    setFiltroAlumnoId('');
    setConsultado(false);
  };

  const handleSeleccionarAlumno = (alumno) => {
    setFiltroAlumnoId(alumno.id);
    setFiltroAlumno(`${alumno.nombres} ${alumno.apellidos}`);
    setMostrarDropdownAlumno(false);
  };

  const consultar = () => {
    if (!cursoSeleccionado || !asignaturaSeleccionada) {
      alert('Seleccione curso y asignatura');
      return;
    }
    setConsultado(true);
  };

  const limpiarFiltros = () => {
    setCursoSeleccionado('');
    setCursoNombre('');
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setFiltroAlumno('');
    setFiltroAlumnoId('');
    setMostrarDropdownAlumno(false);
    setConsultado(false);
  };

  const getNotaClass = (nota) => {
    if (nota === null || nota === undefined) return '';
    if (nota >= 6.0) return 'nota-excelente';
    if (nota >= 5.0) return 'nota-buena';
    if (nota >= 4.0) return 'nota-suficiente';
    return 'nota-insuficiente';
  };

  const formatearNota = (nota) => {
    if (nota === null || nota === undefined) return '-';
    return nota.toFixed(1);
  };

  // Formatear nombre del alumno: "Apellido1 Apellido2 P."
  const formatearNombreAlumno = (alumno) => {
    const nombresArr = alumno.nombres.split(' ');
    const apellidosArr = alumno.apellidos.split(' ');

    const primerApellido = apellidosArr[0] || '';
    const segundoApellido = apellidosArr[1] || '';
    const inicialPrimerNombre = nombresArr[0] ? `${nombresArr[0].charAt(0)}.` : '';

    return `${primerApellido} ${segundoApellido} ${inicialPrimerNombre}`.replace(/\s+/g, ' ').trim();
  };

  // Renderizar celdas de notas para un trimestre
  const renderNotasCeldas = (notas) => {
    const celdas = [];
    for (let i = 0; i < 8; i++) {
      const nota = notas[i];
      celdas.push(
        <td key={i} className={nota !== undefined ? getNotaClass(nota) : ''}>
          {nota !== undefined ? (nota !== null ? nota.toFixed(1) : 'P') : '-'}
        </td>
      );
    }
    return celdas;
  };

  return (
    <div className="tab-panel active">
      {/* Filtros */}
      <div className="card">
        <div className="card-header">
          <h3>Filtros</h3>
        </div>
        <div className="card-body">
          {isMobile ? (
            <>
              {/* Móvil: Fila 1 - Curso y Asignatura */}
              <div className="form-row-movil">
                <div className="form-group">
                  <label>Curso</label>
                  <div className="custom-select-container">
                    <div
                      className="custom-select-trigger"
                      onClick={() => abrirDropdown('curso')}
                    >
                      <span>{cursoNombre || 'Seleccionar...'}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'curso' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'curso' && (
                      <div className="custom-select-options">
                        <div
                          className="custom-select-option"
                          onClick={() => {
                            handleCursoChange('', '');
                            setDropdownAbierto(null);
                          }}
                        >
                          Seleccionar...
                        </div>
                        {cursos.map(curso => (
                          <div
                            key={curso.id}
                            className={`custom-select-option ${cursoSeleccionado === curso.id.toString() ? 'selected' : ''}`}
                            onClick={() => {
                              handleCursoChange(curso.id, curso.nombre);
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
                      className={`custom-select-trigger ${!cursoSeleccionado ? 'disabled' : ''}`}
                      onClick={() => cursoSeleccionado && abrirDropdown('asignatura')}
                    >
                      <span>{asignaturaNombre || (cursoSeleccionado ? 'Seleccionar...' : 'Seleccione curso')}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'asignatura' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'asignatura' && cursoSeleccionado && (
                      <div className="custom-select-options">
                        <div
                          className="custom-select-option"
                          onClick={() => {
                            setAsignaturaSeleccionada('');
                            setAsignaturaNombre('');
                            setDropdownAbierto(null);
                          }}
                        >
                          Seleccionar...
                        </div>
                        {asignaturasDisponibles.map(asig => (
                          <div
                            key={asig.id}
                            className={`custom-select-option ${asignaturaSeleccionada === asig.id.toString() ? 'selected' : ''}`}
                            onClick={() => {
                              setAsignaturaSeleccionada(asig.id);
                              setAsignaturaNombre(asig.nombre);
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
              </div>

              {/* Móvil: Fila 2 - Alumno solo */}
              <div className="form-group">
                <label>Alumno</label>
                <div className="docente-autocomplete-container">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Todos"
                    value={filtroAlumno}
                    onChange={(e) => {
                      setFiltroAlumno(e.target.value);
                      abrirDropdownAlumno(true);
                      setFiltroAlumnoId('');
                    }}
                    onFocus={() => abrirDropdownAlumno(true)}
                    disabled={!cursoSeleccionado}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="docente-autocomplete-arrow"
                    onClick={() => abrirDropdownAlumno(!mostrarDropdownAlumno)}
                    disabled={!cursoSeleccionado}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {mostrarDropdownAlumno && alumnosDelCurso.length > 0 && (
                    <div className="docente-autocomplete-dropdown">
                      <div
                        className="docente-autocomplete-item"
                        onClick={() => { setFiltroAlumno(''); setFiltroAlumnoId(''); setMostrarDropdownAlumno(false); }}
                      >
                        Todos
                      </div>
                      {alumnosFiltrados.map(alumno => (
                        <div
                          key={alumno.id}
                          className="docente-autocomplete-item"
                          onClick={() => handleSeleccionarAlumno(alumno)}
                        >
                          {alumno.nombres} {alumno.apellidos}
                        </div>
                      ))}
                      {alumnosFiltrados.length === 0 && (
                        <div className="docente-autocomplete-item disabled">No se encontraron alumnos</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Móvil: Botones */}
              <div className="form-actions form-actions-movil">
                <button className="btn btn-secondary" onClick={limpiarFiltros}>
                  Limpiar
                </button>
                <button className="btn btn-primary" onClick={consultar}>
                  Consultar
                </button>
              </div>
            </>
          ) : (
            <div className="docente-filtros-row" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
              <div className="form-group">
                <label>Curso</label>
                <select
                  className="form-control"
                  value={cursoSeleccionado}
                  onChange={(e) => {
                    const curso = cursos.find(c => c.id.toString() === e.target.value);
                    handleCursoChange(e.target.value, curso?.nombre || '');
                  }}
                >
                  <option value="">Seleccionar</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Asignatura</label>
                <select
                  className="form-control"
                  value={asignaturaSeleccionada}
                  onChange={(e) => {
                    const asig = asignaturasDisponibles.find(a => a.id.toString() === e.target.value);
                    setAsignaturaSeleccionada(e.target.value);
                    setAsignaturaNombre(asig?.nombre || '');
                  }}
                  disabled={!cursoSeleccionado}
                >
                  <option value="">{cursoSeleccionado ? 'Seleccionar' : 'Primero seleccione un curso'}</option>
                  {asignaturasDisponibles.map(asig => (
                    <option key={asig.id} value={asig.id}>{asig.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Alumno</label>
                <div className="docente-autocomplete-container">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={cursoSeleccionado ? "Todos los alumnos" : "Primero seleccione un curso"}
                    value={filtroAlumno}
                    onChange={(e) => {
                      setFiltroAlumno(e.target.value);
                      abrirDropdownAlumno(true);
                      setFiltroAlumnoId('');
                    }}
                    onFocus={() => abrirDropdownAlumno(true)}
                    disabled={!cursoSeleccionado}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="docente-autocomplete-arrow"
                    onClick={() => abrirDropdownAlumno(!mostrarDropdownAlumno)}
                    disabled={!cursoSeleccionado}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {mostrarDropdownAlumno && alumnosDelCurso.length > 0 && (
                    <div className="docente-autocomplete-dropdown">
                      <div
                        className="docente-autocomplete-item"
                        onClick={() => { setFiltroAlumno(''); setFiltroAlumnoId(''); setMostrarDropdownAlumno(false); }}
                      >
                        Todos
                      </div>
                      {alumnosFiltrados.map(alumno => (
                        <div
                          key={alumno.id}
                          className="docente-autocomplete-item"
                          onClick={() => handleSeleccionarAlumno(alumno)}
                        >
                          {alumno.nombres} {alumno.apellidos}
                        </div>
                      ))}
                      {alumnosFiltrados.length === 0 && (
                        <div className="docente-autocomplete-item disabled">No se encontraron alumnos</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="docente-filtros-actions">
                <button className="btn btn-secondary" onClick={limpiarFiltros}>
                  Limpiar
                </button>
                <button className="btn btn-primary" onClick={consultar}>
                  Consultar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de notas */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3>Calificaciones del Curso</h3>
        </div>
        <div className="card-body">
          <div className="docente-tabla-trimestres-container">
            <table className="docente-tabla docente-tabla-trimestres">
              <thead>
                <tr>
                  <th rowSpan="2" className="th-fixed">N</th>
                  <th rowSpan="2" className="th-fixed th-alumno">Alumno</th>
                  <th colSpan="9" className="th-trimestre">Trimestre 1</th>
                  <th colSpan="9" className="th-trimestre">Trimestre 2</th>
                  <th colSpan="9" className="th-trimestre">Trimestre 3</th>
                  <th rowSpan="2" className="th-fixed th-final" style={{ width: '45px' }}>PROM</th>
                  <th rowSpan="2" className="th-fixed" style={{ width: '40px' }}>APR</th>
                </tr>
                <tr>
                  {/* Trimestre 1 */}
                  <th className="th-sub">N1</th>
                  <th className="th-sub">N2</th>
                  <th className="th-sub">N3</th>
                  <th className="th-sub">N4</th>
                  <th className="th-sub">N5</th>
                  <th className="th-sub">N6</th>
                  <th className="th-sub">N7</th>
                  <th className="th-sub">N8</th>
                  <th className="th-sub th-prom">Prom</th>
                  {/* Trimestre 2 */}
                  <th className="th-sub">N1</th>
                  <th className="th-sub">N2</th>
                  <th className="th-sub">N3</th>
                  <th className="th-sub">N4</th>
                  <th className="th-sub">N5</th>
                  <th className="th-sub">N6</th>
                  <th className="th-sub">N7</th>
                  <th className="th-sub">N8</th>
                  <th className="th-sub th-prom">Prom</th>
                  {/* Trimestre 3 */}
                  <th className="th-sub">N1</th>
                  <th className="th-sub">N2</th>
                  <th className="th-sub">N3</th>
                  <th className="th-sub">N4</th>
                  <th className="th-sub">N5</th>
                  <th className="th-sub">N6</th>
                  <th className="th-sub">N7</th>
                  <th className="th-sub">N8</th>
                  <th className="th-sub th-prom">Prom</th>
                </tr>
              </thead>
              <tbody>
                {datosTabla.length > 0 ? (
                  datosTabla.map((row, index) => (
                    <tr key={row.alumno.id}>
                      <td>{index + 1}</td>
                      <td className="td-alumno">{formatearNombreAlumno(row.alumno)}</td>
                      {/* Trimestre 1 */}
                      {renderNotasCeldas(row.notasT1)}
                      <td className={`td-prom ${getNotaClass(row.promedioT1)}`}>
                        {formatearNota(row.promedioT1)}
                      </td>
                      {/* Trimestre 2 */}
                      {renderNotasCeldas(row.notasT2)}
                      <td className={`td-prom ${getNotaClass(row.promedioT2)}`}>
                        {formatearNota(row.promedioT2)}
                      </td>
                      {/* Trimestre 3 */}
                      {renderNotasCeldas(row.notasT3)}
                      <td className={`td-prom ${getNotaClass(row.promedioT3)}`}>
                        {formatearNota(row.promedioT3)}
                      </td>
                      {/* Final */}
                      <td className={`td-final ${getNotaClass(row.promedioFinal)}`}>
                        {formatearNota(row.promedioFinal)}
                      </td>
                      <td className={row.estado === 'Aprobado' ? 'estado-aprobado' : row.estado === 'Reprobado' ? 'estado-reprobado' : ''} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '600' }}>
                        {row.estado === 'Aprobado' ? 'APR' : row.estado === 'Reprobado' ? 'REP' : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="31" className="text-center text-muted">
                      {consultado ? 'No hay datos para mostrar' : 'Seleccione curso y asignatura'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerNotasTab;
