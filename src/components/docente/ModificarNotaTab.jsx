import React, { useState, useMemo, useEffect } from 'react';

function ModificarNotaTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas, onEditarNota, onEliminarNota }) {
  // Filtros de busqueda
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroCursoNombre, setFiltroCursoNombre] = useState('');
  const [filtroAsignatura, setFiltroAsignatura] = useState('');
  const [filtroAsignaturaNombre, setFiltroAsignaturaNombre] = useState('');
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroAlumnoId, setFiltroAlumnoId] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Dropdown de alumnos
  const [mostrarDropdownAlumno, setMostrarDropdownAlumno] = useState(false);
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
    if (!filtroCurso) return [];
    return asignaciones
      .filter(a => a.curso_id === parseInt(filtroCurso))
      .map(a => ({ id: a.asignatura_id, nombre: a.asignatura_nombre }));
  }, [filtroCurso, asignaciones]);

  // Alumnos del curso seleccionado
  const alumnosDelCurso = useMemo(() => {
    if (!filtroCurso) return [];
    return alumnosPorCurso[filtroCurso] || [];
  }, [filtroCurso, alumnosPorCurso]);

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

  const handleCursoChange = (cursoId, nombre = '') => {
    setFiltroCurso(cursoId);
    setFiltroCursoNombre(nombre);
    setFiltroAsignatura('');
    setFiltroAsignaturaNombre('');
    setFiltroAlumno('');
    setFiltroAlumnoId('');
  };

  const handleSeleccionarAlumno = (alumno) => {
    setFiltroAlumno(`${alumno.nombres} ${alumno.apellidos}`);
    setFiltroAlumnoId(alumno.id);
    setMostrarDropdownAlumno(false);
  };

  // Modal de edicion
  const [modalEditar, setModalEditar] = useState(false);
  const [notaEditando, setNotaEditando] = useState(null);
  const [editNota, setEditNota] = useState('');
  const [editTrimestre, setEditTrimestre] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editComentario, setEditComentario] = useState('');

  // Modal de confirmacion eliminar
  const [modalEliminar, setModalEliminar] = useState(false);
  const [notaEliminar, setNotaEliminar] = useState(null);

  // Resultados de busqueda
  const [buscado, setBuscado] = useState(false);

  const resultadosBusqueda = useMemo(() => {
    if (!buscado) return [];

    let resultados = [...notasRegistradas];

    if (filtroCurso) {
      resultados = resultados.filter(n => n.curso_id === parseInt(filtroCurso));
    }
    if (filtroAsignatura) {
      resultados = resultados.filter(n => n.asignatura_id === parseInt(filtroAsignatura));
    }
    // Filtrar por alumno (por ID si está seleccionado, o por texto si no)
    if (filtroAlumnoId) {
      resultados = resultados.filter(n => n.alumno_id === filtroAlumnoId);
    } else if (filtroAlumno) {
      const busqueda = filtroAlumno.toLowerCase();
      resultados = resultados.filter(n => n.alumno_nombre.toLowerCase().includes(busqueda));
    }
    if (filtroFecha) {
      resultados = resultados.filter(n => n.fecha === filtroFecha);
    }

    return resultados;
  }, [notasRegistradas, filtroCurso, filtroAsignatura, filtroAlumno, filtroAlumnoId, filtroFecha, buscado]);

  const buscarNotas = () => {
    setBuscado(true);
  };

  const limpiarBusqueda = () => {
    setFiltroCurso('');
    setFiltroCursoNombre('');
    setFiltroAsignatura('');
    setFiltroAsignaturaNombre('');
    setFiltroAlumno('');
    setFiltroAlumnoId('');
    setFiltroFecha('');
    setBuscado(false);
    setMostrarDropdownAlumno(false);
  };

  const abrirModalEditar = (nota) => {
    setNotaEditando(nota);
    setEditNota(nota.nota !== null ? nota.nota.toString() : '');
    setEditTrimestre(nota.trimestre.toString());
    setEditFecha(nota.fecha);
    setEditComentario(nota.comentario || '');
    setModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setModalEditar(false);
    setNotaEditando(null);
  };

  const guardarEdicion = (e) => {
    e.preventDefault();

    onEditarNota(notaEditando.id, {
      nota: editNota ? parseFloat(editNota) : null,
      trimestre: parseInt(editTrimestre),
      fecha: editFecha,
      comentario: editComentario
    });

    cerrarModalEditar();
    alert('Nota actualizada exitosamente');
  };

  const abrirModalEliminar = (nota) => {
    setNotaEliminar(nota);
    setModalEliminar(true);
  };

  const cerrarModalEliminar = () => {
    setModalEliminar(false);
    setNotaEliminar(null);
  };

  const confirmarEliminar = () => {
    onEliminarNota(notaEliminar.id);
    cerrarModalEliminar();
    alert('Nota eliminada exitosamente');
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

  // Formatear nombre: "Apellido1 Apellido2 P."
  const formatearNombreCompleto = (nombreCompleto) => {
    if (!nombreCompleto) return '';
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
      {/* Busqueda */}
      <div className="card">
        <div className="card-header">
          <h3>Buscar Nota</h3>
        </div>
        <div className="card-body">
          {isMobile ? (
            <>
              {/* Móvil: Fila 1 - Curso y Asignatura */}
              <div className="form-row-movil">
                <div className="form-group">
                  <label>Curso</label>
                  <div className="custom-select-container">
                    <div className="custom-select-trigger" onClick={() => abrirDropdown('curso')}>
                      <span>{filtroCursoNombre || 'Seleccionar...'}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'curso' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'curso' && (
                      <div className="custom-select-options">
                        <div className="custom-select-option" onClick={() => { handleCursoChange('', ''); setDropdownAbierto(null); }}>Seleccionar...</div>
                        {cursos.map(curso => (
                          <div key={curso.id} className={`custom-select-option ${filtroCurso === curso.id.toString() ? 'selected' : ''}`} onClick={() => { handleCursoChange(curso.id, curso.nombre); setDropdownAbierto(null); }}>
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
                    <div className={`custom-select-trigger ${!filtroCurso ? 'disabled' : ''}`} onClick={() => filtroCurso && abrirDropdown('asignatura')}>
                      <span>{filtroAsignaturaNombre || 'Todas'}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'asignatura' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'asignatura' && filtroCurso && (
                      <div className="custom-select-options">
                        <div className="custom-select-option" onClick={() => { setFiltroAsignatura(''); setFiltroAsignaturaNombre(''); setDropdownAbierto(null); }}>Todas</div>
                        {asignaturasDisponibles.map(asig => (
                          <div key={asig.id} className={`custom-select-option ${filtroAsignatura === asig.id.toString() ? 'selected' : ''}`} onClick={() => { setFiltroAsignatura(asig.id); setFiltroAsignaturaNombre(asig.nombre); setDropdownAbierto(null); }}>
                            {asig.nombre}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Móvil: Fila 2 - Alumno y Fecha */}
              <div className="form-row-movil">
                <div className="form-group">
                  <label>Alumno</label>
                  <div className="docente-autocomplete-container">
                    <input type="text" className="form-control" placeholder="Todos" value={filtroAlumno} onChange={(e) => { setFiltroAlumno(e.target.value); setFiltroAlumnoId(''); abrirDropdownAlumno(true); }} onFocus={() => abrirDropdownAlumno(true)} disabled={!filtroCurso} autoComplete="off" />
                    <button type="button" className="docente-autocomplete-arrow" onClick={() => abrirDropdownAlumno(!mostrarDropdownAlumno)} disabled={!filtroCurso}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    {mostrarDropdownAlumno && alumnosDelCurso.length > 0 && (
                      <div className="docente-autocomplete-dropdown">
                        <div className="docente-autocomplete-item" onClick={() => { setFiltroAlumno(''); setFiltroAlumnoId(''); setMostrarDropdownAlumno(false); }}>Todos</div>
                        {alumnosFiltrados.map(alumno => (
                          <div key={alumno.id} className="docente-autocomplete-item" onClick={() => handleSeleccionarAlumno(alumno)}>{alumno.nombres} {alumno.apellidos}</div>
                        ))}
                        {alumnosFiltrados.length === 0 && <div className="docente-autocomplete-item disabled">No se encontraron</div>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
                </div>
              </div>

              {/* Móvil: Botones */}
              <div className="form-actions form-actions-movil">
                <button type="button" className="btn btn-secondary" onClick={limpiarBusqueda}>Limpiar</button>
                <button type="button" className="btn btn-primary" onClick={buscarNotas}>Buscar</button>
              </div>
            </>
          ) : (
            <div className="docente-filtros-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr auto' }}>
              <div className="form-group">
                <label>Curso</label>
                <select className="form-control" value={filtroCurso} onChange={(e) => { const curso = cursos.find(c => c.id.toString() === e.target.value); handleCursoChange(e.target.value, curso?.nombre || ''); }}>
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (<option key={curso.id} value={curso.id}>{curso.nombre}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label>Asignatura</label>
                <select className="form-control" value={filtroAsignatura} onChange={(e) => { const asig = asignaturasDisponibles.find(a => a.id.toString() === e.target.value); setFiltroAsignatura(e.target.value); setFiltroAsignaturaNombre(asig?.nombre || ''); }} disabled={!filtroCurso}>
                  <option value="">{filtroCurso ? 'Todas las asignaturas' : 'Primero seleccione curso'}</option>
                  {asignaturasDisponibles.map(asig => (<option key={asig.id} value={asig.id}>{asig.nombre}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label>Alumno</label>
                <div className="docente-autocomplete-container">
                  <input type="text" className="form-control" placeholder={filtroCurso ? "Todos los alumnos" : "Primero seleccione curso"} value={filtroAlumno} onChange={(e) => { setFiltroAlumno(e.target.value); setFiltroAlumnoId(''); abrirDropdownAlumno(true); }} onFocus={() => abrirDropdownAlumno(true)} disabled={!filtroCurso} autoComplete="off" />
                  <button type="button" className="docente-autocomplete-arrow" onClick={() => abrirDropdownAlumno(!mostrarDropdownAlumno)} disabled={!filtroCurso}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                  {mostrarDropdownAlumno && alumnosDelCurso.length > 0 && (
                    <div className="docente-autocomplete-dropdown">
                      <div className="docente-autocomplete-item" onClick={() => { setFiltroAlumno(''); setFiltroAlumnoId(''); setMostrarDropdownAlumno(false); }}>Todos</div>
                      {alumnosFiltrados.map(alumno => (<div key={alumno.id} className="docente-autocomplete-item" onClick={() => handleSeleccionarAlumno(alumno)}>{alumno.nombres} {alumno.apellidos}</div>))}
                      {alumnosFiltrados.length === 0 && (<div className="docente-autocomplete-item disabled">No se encontraron alumnos</div>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
              </div>
              <div className="docente-filtros-actions">
                <button type="button" className="btn btn-secondary" onClick={limpiarBusqueda}>Limpiar</button>
                <button type="button" className="btn btn-primary" onClick={buscarNotas}>Buscar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3>Resultados</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive table-scroll">
            <table className={`data-table ${isMobile ? 'tabla-compacta-movil' : ''}`}>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Asignatura</th>
                  <th>Nota</th>
                  <th>Trimestre</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resultadosBusqueda.length > 0 ? (
                  resultadosBusqueda.map(nota => (
                    <tr key={nota.id}>
                      <td>{formatearNombreCompleto(nota.alumno_nombre)}</td>
                      <td>{nota.asignatura_nombre}</td>
                      <td>
                        <span className={`docente-nota-badge ${getNotaClass(nota.nota)}`}>
                          {nota.nota !== null ? nota.nota.toFixed(1) : 'P'}
                        </span>
                      </td>
                      <td>{nota.trimestre}</td>
                      <td>{formatearFecha(nota.fecha)}</td>
                      <td>
                        <div className="acciones-btns">
                          <button
                            className="btn-icon btn-icon-edit"
                            onClick={() => abrirModalEditar(nota)}
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            onClick={() => abrirModalEliminar(nota)}
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      {buscado ? 'No se encontraron notas' : 'Realice una busqueda'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Editar */}
      {modalEditar && (
        <div className="modal-overlay" onClick={cerrarModalEditar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Calificacion</h3>
              <button className="modal-close" onClick={cerrarModalEditar}>&times;</button>
            </div>
            <form onSubmit={guardarEdicion}>
              <div className="modal-body">
                <div className="docente-modal-info">
                  <div className="docente-info-item">
                    <label>Alumno</label>
                    <span>{notaEditando?.alumno_nombre}</span>
                  </div>
                  <div className="docente-info-item">
                    <label>Curso</label>
                    <span>{notaEditando?.curso_nombre}</span>
                  </div>
                  <div className="docente-info-item">
                    <label>Asignatura</label>
                    <span>{notaEditando?.asignatura_nombre}</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nota</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1.0"
                      max="7.0"
                      step="0.1"
                      value={editNota}
                      onChange={(e) => setEditNota(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Trimestre</label>
                    <select
                      className="form-control"
                      value={editTrimestre}
                      onChange={(e) => setEditTrimestre(e.target.value)}
                    >
                      <option value="1">Primer Trimestre</option>
                      <option value="2">Segundo Trimestre</option>
                      <option value="3">Tercer Trimestre</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Comentario</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editComentario}
                    onChange={(e) => setEditComentario(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModalEditar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="modal-overlay" onClick={cerrarModalEliminar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#fef2f2' }}>
              <h3 style={{ color: '#dc2626' }}>Eliminar Calificacion</h3>
              <button className="modal-close" onClick={cerrarModalEliminar}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="docente-alert-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <h4>Confirmar eliminacion</h4>
                  <p>Esta a punto de eliminar la nota de <strong>{notaEliminar?.alumno_nombre}</strong>. Esta accion no se puede deshacer.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModalEliminar}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmarEliminar}>
                Eliminar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModificarNotaTab;
