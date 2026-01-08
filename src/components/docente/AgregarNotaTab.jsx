import React, { useState, useMemo, useEffect } from 'react';

function AgregarNotaTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas, onAgregarNota }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [trimestre, setTrimestre] = useState('');
  const [trimestreNombre, setTrimestreNombre] = useState('');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [comentario, setComentario] = useState('');
  const [notaPendiente, setNotaPendiente] = useState(false);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 699);
  const [pestanaActiva, setPestanaActiva] = useState('registro');

  // Filtros para ultimas notas
  const [filtroUltCurso, setFiltroUltCurso] = useState('');
  const [filtroUltCursoNombre, setFiltroUltCursoNombre] = useState('');
  const [filtroUltAlumno, setFiltroUltAlumno] = useState('');

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
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funciones para abrir dropdowns (cierra los otros al abrir uno)
  const abrirDropdown = (nombre) => {
    setDropdownAbierto(dropdownAbierto === nombre ? null : nombre);
    setMostrarDropdown(false);
  };

  const abrirDropdownAlumno = (abrir) => {
    setMostrarDropdown(abrir);
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
    if (alumnoSeleccionado) return alumnosDelCurso;
    if (!busquedaAlumno) return alumnosDelCurso;
    const busqueda = busquedaAlumno.toLowerCase();
    return alumnosDelCurso.filter(a =>
      `${a.nombres} ${a.apellidos}`.toLowerCase().includes(busqueda)
    );
  }, [alumnosDelCurso, busquedaAlumno, alumnoSeleccionado]);

  // Ultimas notas filtradas
  const ultimasNotasFiltradas = useMemo(() => {
    let notas = [...notasRegistradas].slice(0, 20);

    if (filtroUltCurso) {
      notas = notas.filter(n => n.curso_id === parseInt(filtroUltCurso));
    }
    if (filtroUltAlumno) {
      const busqueda = filtroUltAlumno.toLowerCase();
      notas = notas.filter(n => n.alumno_nombre.toLowerCase().includes(busqueda));
    }

    return notas;
  }, [notasRegistradas, filtroUltCurso, filtroUltAlumno]);

  const handleCursoChange = (cursoId, nombre = '') => {
    setCursoSeleccionado(cursoId);
    setCursoNombre(nombre);
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setAlumnoSeleccionado('');
    setBusquedaAlumno('');
  };

  const handleSeleccionarAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno.id);
    setBusquedaAlumno(`${alumno.nombres} ${alumno.apellidos}`);
    setMostrarDropdown(false);
  };

  const limpiarFormulario = () => {
    setCursoSeleccionado('');
    setCursoNombre('');
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setAlumnoSeleccionado('');
    setTrimestre('');
    setTrimestreNombre('');
    setNota('');
    setFecha(new Date().toISOString().split('T')[0]);
    setComentario('');
    setNotaPendiente(false);
    setBusquedaAlumno('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cursoSeleccionado || !asignaturaSeleccionada || !alumnoSeleccionado || !trimestre || (!nota && !notaPendiente)) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const alumno = alumnosDelCurso.find(a => a.id === parseInt(alumnoSeleccionado));
    const curso = cursos.find(c => c.id === parseInt(cursoSeleccionado));
    const asignatura = asignaturasDisponibles.find(a => a.id === parseInt(asignaturaSeleccionada));

    const nuevaNota = {
      alumno_id: parseInt(alumnoSeleccionado),
      alumno_nombre: `${alumno.nombres} ${alumno.apellidos}`,
      curso_id: parseInt(cursoSeleccionado),
      curso_nombre: curso.nombre,
      asignatura_id: parseInt(asignaturaSeleccionada),
      asignatura_nombre: asignatura.nombre,
      nota: notaPendiente ? null : parseFloat(nota),
      trimestre: parseInt(trimestre),
      fecha: fecha,
      comentario: comentario,
      pendiente: notaPendiente
    };

    onAgregarNota(nuevaNota);
    limpiarFormulario();
    alert('Nota registrada exitosamente');
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL');
  };

  const getNotaClass = (nota) => {
    if (nota === null) return 'nota-pendiente';
    if (nota >= 6.0) return 'nota-excelente';
    if (nota >= 5.0) return 'nota-buena';
    if (nota >= 4.0) return 'nota-suficiente';
    return 'nota-insuficiente';
  };

  // Formatear nombre completo: "Apellido1 Apellido2 P."
  const formatearNombreCompleto = (nombreCompleto) => {
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length >= 4) {
      // Nombre1 Nombre2 Apellido1 Apellido2
      const apellido1 = partes[2];
      const apellido2 = partes[3];
      const inicialNombre = partes[0].charAt(0) + '.';
      return `${apellido1} ${apellido2} ${inicialNombre}`;
    } else if (partes.length === 3) {
      // Nombre Apellido1 Apellido2
      const apellido1 = partes[1];
      const apellido2 = partes[2];
      const inicialNombre = partes[0].charAt(0) + '.';
      return `${apellido1} ${apellido2} ${inicialNombre}`;
    }
    return nombreCompleto;
  };

  return (
    <div className="tab-panel active">
      {/* Pestañas solo en móvil */}
      {isMobile && (
        <div className="mobile-subtabs">
          <button
            className={`mobile-subtab ${pestanaActiva === 'registro' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('registro')}
          >
            Registro de Calificaciones
          </button>
          <button
            className={`mobile-subtab ${pestanaActiva === 'ultimas' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('ultimas')}
          >
            Últimas Notas
          </button>
        </div>
      )}

      <div className="two-columns">
        {/* Columna Izquierda: Formulario */}
        {(!isMobile || pestanaActiva === 'registro') && (
        <div className="column">
          <div className="card">
            <div className="card-header">
              <h3>Registro de Calificacion</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
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
                              <div className="custom-select-option" onClick={() => { handleCursoChange('', ''); setDropdownAbierto(null); }}>
                                Seleccionar...
                              </div>
                              {cursos.map(curso => (
                                <div
                                  key={curso.id}
                                  className={`custom-select-option ${cursoSeleccionado === curso.id.toString() ? 'selected' : ''}`}
                                  onClick={() => { handleCursoChange(curso.id, curso.nombre); setDropdownAbierto(null); }}
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
                            <span>{asignaturaNombre || 'Seleccionar...'}</span>
                            <span className="custom-select-arrow">{dropdownAbierto === 'asignatura' ? '▲' : '▼'}</span>
                          </div>
                          {dropdownAbierto === 'asignatura' && cursoSeleccionado && (
                            <div className="custom-select-options">
                              <div className="custom-select-option" onClick={() => { setAsignaturaSeleccionada(''); setAsignaturaNombre(''); setDropdownAbierto(null); }}>
                                Seleccionar...
                              </div>
                              {asignaturasDisponibles.map(asig => (
                                <div
                                  key={asig.id}
                                  className={`custom-select-option ${asignaturaSeleccionada === asig.id.toString() ? 'selected' : ''}`}
                                  onClick={() => { setAsignaturaSeleccionada(asig.id); setAsignaturaNombre(asig.nombre); setDropdownAbierto(null); }}
                                >
                                  {asig.nombre}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Móvil: Fila 2 - Alumno y Trimestre */}
                    <div className="form-row-movil">
                      <div className="form-group">
                        <label>Alumno</label>
                        <div className="docente-autocomplete-container">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar..."
                            value={busquedaAlumno}
                            onChange={(e) => { setBusquedaAlumno(e.target.value); abrirDropdownAlumno(true); setAlumnoSeleccionado(''); }}
                            onFocus={() => abrirDropdownAlumno(true)}
                            disabled={!cursoSeleccionado}
                            autoComplete="off"
                          />
                          <button type="button" className="docente-autocomplete-arrow" onClick={() => abrirDropdownAlumno(!mostrarDropdown)} disabled={!cursoSeleccionado}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                          {mostrarDropdown && alumnosDelCurso.length > 0 && (
                            <div className="docente-autocomplete-dropdown">
                              {alumnosFiltrados.map(alumno => (
                                <div key={alumno.id} className="docente-autocomplete-item" onClick={() => handleSeleccionarAlumno(alumno)}>
                                  {alumno.nombres} {alumno.apellidos}
                                </div>
                              ))}
                              {alumnosFiltrados.length === 0 && <div className="docente-autocomplete-item disabled">No se encontraron</div>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Trimestre</label>
                        <div className="custom-select-container">
                          <div className="custom-select-trigger" onClick={() => abrirDropdown('trimestre')}>
                            <span>{trimestreNombre || 'Seleccionar...'}</span>
                            <span className="custom-select-arrow">{dropdownAbierto === 'trimestre' ? '▲' : '▼'}</span>
                          </div>
                          {dropdownAbierto === 'trimestre' && (
                            <div className="custom-select-options">
                              <div className="custom-select-option" onClick={() => { setTrimestre(''); setTrimestreNombre(''); setDropdownAbierto(null); }}>
                                Seleccionar...
                              </div>
                              {[{ id: '1', nombre: '1er Trimestre' }, { id: '2', nombre: '2do Trimestre' }, { id: '3', nombre: '3er Trimestre' }].map(t => (
                                <div
                                  key={t.id}
                                  className={`custom-select-option ${trimestre === t.id ? 'selected' : ''}`}
                                  onClick={() => { setTrimestre(t.id); setTrimestreNombre(t.nombre); setDropdownAbierto(null); }}
                                >
                                  {t.nombre}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Móvil: Fila 3 - Fecha y Nota */}
                    <div className="form-row-movil">
                      <div className="form-group">
                        <label>Fecha</label>
                        <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Nota (1.0 - 7.0)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1.0"
                          max="7.0"
                          step="0.1"
                          placeholder="Ej: 6.5"
                          value={nota}
                          onChange={(e) => setNota(e.target.value)}
                          disabled={notaPendiente}
                          required={!notaPendiente}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Desktop: Fila 1 - Curso, Asignatura, Alumno */}
                    <div className="form-row form-row-tres">
                      <div className="form-group">
                        <label htmlFor="cursoNuevaNota">Curso</label>
                        <select
                          id="cursoNuevaNota"
                          className="form-control"
                          value={cursoSeleccionado}
                          onChange={(e) => {
                            const curso = cursos.find(c => c.id.toString() === e.target.value);
                            handleCursoChange(e.target.value, curso?.nombre || '');
                          }}
                          required
                        >
                          <option value="">Seleccionar curso</option>
                          {cursos.map(curso => (
                            <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="asignaturaNuevaNota">Asignatura</label>
                        <select
                          id="asignaturaNuevaNota"
                          className="form-control"
                          value={asignaturaSeleccionada}
                          onChange={(e) => {
                            const asig = asignaturasDisponibles.find(a => a.id.toString() === e.target.value);
                            setAsignaturaSeleccionada(e.target.value);
                            setAsignaturaNombre(asig?.nombre || '');
                          }}
                          required
                          disabled={!cursoSeleccionado}
                        >
                          <option value="">{cursoSeleccionado ? 'Seleccionar' : 'Primero seleccione curso'}</option>
                          {asignaturasDisponibles.map(asig => (
                            <option key={asig.id} value={asig.id}>{asig.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="alumnoNuevaNota">Alumno</label>
                        <div className="docente-autocomplete-container">
                          <input
                            type="text"
                            id="alumnoNuevaNota"
                            className="form-control"
                            placeholder="Buscar alumno..."
                            value={busquedaAlumno}
                            onChange={(e) => {
                              setBusquedaAlumno(e.target.value);
                              abrirDropdownAlumno(true);
                              setAlumnoSeleccionado('');
                            }}
                            onFocus={() => abrirDropdownAlumno(true)}
                            disabled={!cursoSeleccionado}
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            className="docente-autocomplete-arrow"
                            onClick={() => abrirDropdownAlumno(!mostrarDropdown)}
                            disabled={!cursoSeleccionado}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                          {mostrarDropdown && alumnosDelCurso.length > 0 && (
                            <div className="docente-autocomplete-dropdown">
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
                    </div>

                    {/* Desktop: Fila 2 - Trimestre, Fecha, Nota */}
                    <div className="form-row form-row-tres">
                      <div className="form-group">
                        <label htmlFor="trimestreNuevaNota">Trimestre</label>
                        <select
                          id="trimestreNuevaNota"
                          className="form-control"
                          value={trimestre}
                          onChange={(e) => {
                            setTrimestre(e.target.value);
                            const nombres = { '1': 'Primer Trimestre', '2': 'Segundo Trimestre', '3': 'Tercer Trimestre' };
                            setTrimestreNombre(nombres[e.target.value] || '');
                          }}
                          required
                        >
                          <option value="">Seleccionar trimestre</option>
                          <option value="1">Primer Trimestre</option>
                          <option value="2">Segundo Trimestre</option>
                          <option value="3">Tercer Trimestre</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="fechaNuevaNota">Fecha</label>
                        <input
                          type="date"
                          id="fechaNuevaNota"
                          className="form-control"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="notaNueva">Nota (1.0 - 7.0)</label>
                        <input
                          type="number"
                          id="notaNueva"
                          className="form-control"
                          min="1.0"
                          max="7.0"
                          step="0.1"
                          placeholder="Ej: 6.5"
                          value={nota}
                          onChange={(e) => setNota(e.target.value)}
                          disabled={notaPendiente}
                          required={!notaPendiente}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Checkbox nota pendiente */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notaPendiente}
                      onChange={(e) => {
                        setNotaPendiente(e.target.checked);
                        if (e.target.checked) setNota('');
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#475569' }}>Nota pendiente</span>
                  </label>
                </div>

                {/* Comentario */}
                <div className="form-group">
                  <label htmlFor="comentarioNuevaNota">Comentario (Opcional)</label>
                  <textarea
                    id="comentarioNuevaNota"
                    className="form-control"
                    rows="3"
                    placeholder="Ingrese alguna observacion..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  ></textarea>
                </div>

                <div className={`form-actions ${isMobile ? 'form-actions-movil' : ''}`}>
                  <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>
                    Limpiar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isMobile ? 'Registrar' : 'Registrar Nota'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        )}

        {/* Columna Derecha: Ultimas notas */}
        {(!isMobile || pestanaActiva === 'ultimas') && (
        <div className="column">
          <div className="card">
            <div className="card-header">
              <h3>Ultimas Notas Registradas</h3>
            </div>
            <div className="card-body">
              {/* Filtros */}
              <div className="filtros-alumnos">
                <div className={isMobile ? 'form-row-movil' : 'form-row'}>
                  <div className="form-group">
                    <label>Curso</label>
                    {isMobile ? (
                      <div className="custom-select-container">
                        <div
                          className="custom-select-trigger"
                          onClick={() => abrirDropdown('filtroUltCurso')}
                        >
                          <span>{filtroUltCursoNombre || 'Todos'}</span>
                          <span className="custom-select-arrow">{dropdownAbierto === 'filtroUltCurso' ? '▲' : '▼'}</span>
                        </div>
                        {dropdownAbierto === 'filtroUltCurso' && (
                          <div className="custom-select-options">
                            <div
                              className="custom-select-option"
                              onClick={() => {
                                setFiltroUltCurso('');
                                setFiltroUltCursoNombre('');
                                setDropdownAbierto(null);
                              }}
                            >
                              Todos
                            </div>
                            {cursos.map(curso => (
                              <div
                                key={curso.id}
                                className={`custom-select-option ${filtroUltCurso === curso.id.toString() ? 'selected' : ''}`}
                                onClick={() => {
                                  setFiltroUltCurso(curso.id);
                                  setFiltroUltCursoNombre(curso.nombre);
                                  setDropdownAbierto(null);
                                }}
                              >
                                {curso.nombre}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <select
                        className="form-control"
                        value={filtroUltCurso}
                        onChange={(e) => {
                          setFiltroUltCurso(e.target.value);
                          const curso = cursos.find(c => c.id.toString() === e.target.value);
                          setFiltroUltCursoNombre(curso?.nombre || '');
                        }}
                      >
                        <option value="">Todos</option>
                        {cursos.map(curso => (
                          <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Alumno</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar alumno..."
                      value={filtroUltAlumno}
                      onChange={(e) => setFiltroUltAlumno(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="table-responsive table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Curso</th>
                      <th>Asignatura</th>
                      <th>Fecha</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasNotasFiltradas.length > 0 ? (
                      ultimasNotasFiltradas.map(nota => (
                        <tr key={nota.id}>
                          <td>{formatearNombreCompleto(nota.alumno_nombre)}</td>
                          <td>{nota.curso_nombre}</td>
                          <td>{nota.asignatura_nombre}</td>
                          <td>{formatearFecha(nota.fecha)}</td>
                          <td>
                            <span className={`docente-nota-badge ${getNotaClass(nota.nota)}`}>
                              {nota.nota !== null ? nota.nota.toFixed(1) : 'P'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No hay notas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default AgregarNotaTab;
