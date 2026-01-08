import React, { useState, useEffect } from 'react';
import { docentesDB, cursosDB, asignaturasDB, asignacionesDB, docenteEspecialidadesDB } from '../data/demoData';

function AsignacionesTab({ mostrarMensaje }) {
  const [subTab, setSubTab] = useState('asignar');
  const [formData, setFormData] = useState({
    docente: '',
    docenteId: null,
    curso: '',
    cursoId: null,
    asignaturas: []
  });
  const [filtros, setFiltros] = useState({ curso: '', docente: '' });
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-select-container')) {
        setDropdownAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDocenteChange = (docenteId, nombreDocente) => {
    setFormData({
      ...formData,
      docente: nombreDocente,
      docenteId: docenteId,
      asignaturas: []
    });
  };

  const handleCursoChange = (cursoId, nombreCurso) => {
    setFormData({
      ...formData,
      curso: nombreCurso,
      cursoId: cursoId
    });
  };

  const handleAsignaturaChange = (asignaturaId) => {
    const nuevasAsignaturas = formData.asignaturas.includes(asignaturaId)
      ? formData.asignaturas.filter(id => id !== asignaturaId)
      : [...formData.asignaturas, asignaturaId];
    setFormData({ ...formData, asignaturas: nuevasAsignaturas });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mostrarMensaje('Exito', 'Asignacion creada correctamente (demo)', 'success');
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setFormData({
      docente: '',
      docenteId: null,
      curso: '',
      cursoId: null,
      asignaturas: []
    });
  };

  const getEspecialidadesDocente = () => {
    if (!formData.docenteId) return [];
    return docenteEspecialidadesDB[formData.docenteId] || [];
  };

  // Abrevia nombres compuestos: "Educación Física" → "Ed. Fís."
  const abreviarNombre = (nombre) => {
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return palabras.map(p => {
        if (p.length <= 4) return p;
        return p.substring(0, 3) + '.';
      }).join(' ');
    }
    return nombre;
  };

  const getAsignacionesFiltradas = () => {
    return asignacionesDB.filter(asig => {
      const matchCurso = !filtros.curso || asig.curso.toLowerCase().includes(filtros.curso.toLowerCase());
      const matchDocente = !filtros.docente || asig.docente.toLowerCase().includes(filtros.docente.toLowerCase());
      return matchCurso && matchDocente;
    });
  };

  return (
    <div className="tab-panel active">
      {/* Sub-pestañas para móvil */}
      <div className="sub-tabs-mobile sub-tabs-asignaciones">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'asignar' ? 'active' : ''}`}
          onClick={() => setSubTab('asignar')}
        >
          Asignar Docente
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'listado' ? 'active' : ''}`}
          onClick={() => setSubTab('listado')}
        >
          Asignaciones Actuales
        </button>
      </div>

      <div className="two-columns">
        {/* Columna Izquierda: Asignar Docente a Curso */}
        <div className={`column ${subTab === 'listado' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h3>Asignar Docente a Curso</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row form-row-filtros">
                  <div className="form-group">
                    <label>Docente</label>
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'docente' ? null : 'docente')}
                      >
                        <span>{formData.docente || 'Seleccionar...'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'docente' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'docente' && (
                        <div className="custom-select-options">
                          <div
                            className="custom-select-option"
                            onClick={() => {
                              handleDocenteChange(null, '');
                              setDropdownAbierto(null);
                            }}
                          >
                            Seleccionar...
                          </div>
                          {docentesDB.map(docente => (
                            <div
                              key={docente.id}
                              className={`custom-select-option ${formData.docenteId === docente.id ? 'selected' : ''}`}
                              onClick={() => {
                                handleDocenteChange(docente.id, docente.nombre_completo);
                                setDropdownAbierto(null);
                              }}
                            >
                              {docente.nombre_completo}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Curso</label>
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'cursoForm' ? null : 'cursoForm')}
                      >
                        <span>{formData.curso || 'Seleccionar...'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'cursoForm' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'cursoForm' && (
                        <div className="custom-select-options">
                          <div
                            className="custom-select-option"
                            onClick={() => {
                              handleCursoChange(null, '');
                              setDropdownAbierto(null);
                            }}
                          >
                            Seleccionar...
                          </div>
                          {cursosDB.map(curso => (
                            <div
                              key={curso.id}
                              className={`custom-select-option ${formData.cursoId === curso.id ? 'selected' : ''}`}
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
                </div>

                <div className="form-group">
                  <label>Asignaturas del Docente</label>
                  <div className="checkbox-group checkbox-4-columnas especialidades-grid">
                    {formData.docenteId ? (
                      getEspecialidadesDocente().length > 0 ? (
                        getEspecialidadesDocente().map(asig => (
                          <div key={asig.id} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`asig-${asig.id}`}
                              checked={formData.asignaturas.includes(asig.id)}
                              onChange={() => handleAsignaturaChange(asig.id)}
                            />
                            <label htmlFor={`asig-${asig.id}`}>{abreviarNombre(asig.nombre)}</label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Este docente no tiene especialidades asignadas</p>
                      )
                    ) : (
                      <p className="text-muted">Seleccione un docente para ver sus asignaturas</p>
                    )}
                  </div>
                </div>

                <div className="form-actions form-actions-asignaciones">
                  <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>Limpiar</button>
                  <button type="submit" className="btn btn-primary">Asignar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Asignaciones Actuales */}
        <div className={`column ${subTab === 'asignar' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h3>Asignaciones Actuales</h3>
            </div>
            <div className="card-body">
              <div className="filtros-asignaciones">
                <div className="form-row form-row-filtros">
                  <div className="form-group">
                    <label>Filtrar por Curso</label>
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'filtroCurso' ? null : 'filtroCurso')}
                      >
                        <span>{filtros.curso || 'Todos los cursos'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'filtroCurso' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'filtroCurso' && (
                        <div className="custom-select-options">
                          <div
                            className="custom-select-option"
                            onClick={() => {
                              setFiltros({ ...filtros, curso: '' });
                              setDropdownAbierto(null);
                            }}
                          >
                            Todos los cursos
                          </div>
                          {cursosDB.map(curso => (
                            <div
                              key={curso.id}
                              className={`custom-select-option ${filtros.curso === curso.nombre ? 'selected' : ''}`}
                              onClick={() => {
                                setFiltros({ ...filtros, curso: curso.nombre });
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
                    <label>Filtrar por Docente</label>
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'filtroDocente' ? null : 'filtroDocente')}
                      >
                        <span>{filtros.docente || 'Todos los docentes'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'filtroDocente' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'filtroDocente' && (
                        <div className="custom-select-options">
                          <div
                            className="custom-select-option"
                            onClick={() => {
                              setFiltros({ ...filtros, docente: '' });
                              setDropdownAbierto(null);
                            }}
                          >
                            Todos los docentes
                          </div>
                          {docentesDB.map(docente => (
                            <div
                              key={docente.id}
                              className={`custom-select-option ${filtros.docente === docente.nombre_completo ? 'selected' : ''}`}
                              onClick={() => {
                                setFiltros({ ...filtros, docente: docente.nombre_completo });
                                setDropdownAbierto(null);
                              }}
                            >
                              {docente.nombre_completo}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-responsive table-scroll">
                <table className="data-table tabla-asignaciones">
                  <thead>
                    <tr>
                      <th><span className="th-desktop">Docente</span><span className="th-mobile">Docente</span></th>
                      <th><span className="th-desktop">Curso</span><span className="th-mobile">Curso</span></th>
                      <th><span className="th-desktop">Asignatura</span><span className="th-mobile">Asig.</span></th>
                      <th><span className="th-desktop">Acciones</span><span className="th-mobile">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAsignacionesFiltradas().length > 0 ? (
                      getAsignacionesFiltradas().map(asig => (
                        <tr key={asig.id}>
                          <td>{asig.docente}</td>
                          <td>{asig.curso}</td>
                          <td>{asig.asignatura}</td>
                          <td>
                            <div className="acciones-btns">
                              <button className="btn-icon btn-icon-delete" onClick={() => mostrarMensaje('Exito', 'Asignacion eliminada (demo)', 'success')} title="Eliminar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No hay asignaciones registradas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AsignacionesTab;
