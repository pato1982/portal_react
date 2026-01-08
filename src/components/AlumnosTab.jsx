import React, { useState, useEffect } from 'react';
import { cursosDB, alumnosPorCursoDB } from '../data/demoData';

function AlumnosTab({ mostrarMensaje }) {
  const [subTab, setSubTab] = useState('gestion');
  const [formData, setFormData] = useState({
    curso: '',
    cursoNombre: '',
    rut: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: ''
  });
  const [apoderadoExpanded, setApoderadoExpanded] = useState(false);
  const [apoderadoExiste, setApoderadoExiste] = useState(false);
  const [filtros, setFiltros] = useState({ curso: '', cursoNombre: '', nombre: '' });
  const [modalEditar, setModalEditar] = useState({ visible: false, alumno: null });
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mostrarMensaje('Exito', 'Alumno agregado correctamente (demo)', 'success');
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setFormData({
      curso: '',
      cursoNombre: '',
      rut: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      sexo: ''
    });
    setApoderadoExpanded(false);
    setApoderadoExiste(false);
  };

  const getAlumnosFiltrados = () => {
    let alumnos = [];
    Object.entries(alumnosPorCursoDB).forEach(([curso, lista]) => {
      if (!filtros.curso || curso.toLowerCase().includes(filtros.curso.toLowerCase())) {
        lista.forEach(alumno => {
          if (!filtros.nombre || alumno.nombre_completo.toLowerCase().includes(filtros.nombre.toLowerCase())) {
            alumnos.push(alumno);
          }
        });
      }
    });
    return alumnos;
  };

  const editarAlumno = (alumno) => {
    setModalEditar({ visible: true, alumno });
  };

  const eliminarAlumno = (alumno) => {
    if (window.confirm(`¿Desea eliminar al alumno ${alumno.nombre_completo}?`)) {
      mostrarMensaje('Exito', 'Alumno eliminado correctamente (demo)', 'success');
    }
  };

  return (
    <div className="tab-panel active">
      {/* Sub-pestañas para móvil */}
      <div className="sub-tabs-mobile sub-tabs-alumnos">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'gestion' ? 'active' : ''}`}
          onClick={() => setSubTab('gestion')}
        >
          Gestion de Alumnos
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'listado' ? 'active' : ''}`}
          onClick={() => setSubTab('listado')}
        >
          Listado de Alumnos
        </button>
      </div>

      <div className="two-columns">
        {/* Columna Izquierda: Gestión de Alumnos */}
        <div className={`column ${subTab === 'listado' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h3>Gestion de Alumnos</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="form-alumnos">
                <div className="form-alumnos-grid">
                  <div className="form-group grupo-curso">
                    <label htmlFor="selectCursoAlumno">Curso</label>
                    {isMobile ? (
                      <div className="custom-select-container">
                        <div
                          className="custom-select-trigger"
                          onClick={() => setDropdownAbierto(dropdownAbierto === 'cursoForm' ? null : 'cursoForm')}
                        >
                          <span>{formData.cursoNombre || 'Seleccionar...'}</span>
                          <span className="custom-select-arrow">{dropdownAbierto === 'cursoForm' ? '▲' : '▼'}</span>
                        </div>
                        {dropdownAbierto === 'cursoForm' && (
                          <div className="custom-select-options">
                            <div
                              className="custom-select-option"
                              onClick={() => {
                                setFormData({ ...formData, curso: '', cursoNombre: '' });
                                setDropdownAbierto(null);
                              }}
                            >
                              Seleccionar...
                            </div>
                            {cursosDB.map(curso => (
                              <div
                                key={curso.id}
                                className={`custom-select-option ${formData.curso === String(curso.id) ? 'selected' : ''}`}
                                onClick={() => {
                                  setFormData({ ...formData, curso: String(curso.id), cursoNombre: curso.nombre });
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
                        id="selectCursoAlumno"
                        className="form-control"
                        name="curso"
                        value={formData.curso}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {cursosDB.map(curso => (
                          <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="form-group grupo-rut">
                    <label htmlFor="inputRutAlumno">RUT</label>
                    <input
                      type="text"
                      id="inputRutAlumno"
                      className="form-control"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      placeholder="Ej: 12.345.678-9"
                      required
                    />
                  </div>
                  <div className="form-group grupo-fecha">
                    <label htmlFor="inputFechaNacAlumno">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      id="inputFechaNacAlumno"
                      className="form-control"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group grupo-nombres">
                    <label htmlFor="inputNombreAlumno">Nombres</label>
                    <input
                      type="text"
                      id="inputNombreAlumno"
                      className="form-control"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      placeholder="Ej: Juan Pablo"
                      required
                    />
                  </div>
                  <div className="form-group grupo-apellidos">
                    <label htmlFor="inputApellidoAlumno">Apellidos</label>
                    <input
                      type="text"
                      id="inputApellidoAlumno"
                      className="form-control"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      placeholder="Ej: Perez Gonzalez"
                      required
                    />
                  </div>
                  <div className="form-group grupo-sexo">
                    <label htmlFor="selectSexoAlumno">Sexo</label>
                    <select
                      id="selectSexoAlumno"
                      className="form-control"
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Barras de Apoderado */}
                <div className="apoderado-botones-container">
                  <div
                    className="apoderado-boton"
                    onClick={() => !apoderadoExiste && setApoderadoExpanded(!apoderadoExpanded)}
                    style={{
                      opacity: apoderadoExiste ? 0.5 : 1,
                      cursor: apoderadoExiste ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <h4 className="apoderado-boton-texto">
                      <span className="texto-desktop">Datos del Apoderado</span>
                      <span className="texto-mobile">Dato Apod.</span>
                    </h4>
                    <div className="apoderado-checkbox">
                      {apoderadoExpanded && <span>✓</span>}
                    </div>
                  </div>

                  <div
                    className="apoderado-boton"
                    onClick={() => !apoderadoExpanded && setApoderadoExiste(!apoderadoExiste)}
                    style={{
                      opacity: apoderadoExpanded ? 0.5 : 1,
                      cursor: apoderadoExpanded ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <h4 className="apoderado-boton-texto">
                      <span className="texto-desktop">Apoderado Existente</span>
                      <span className="texto-mobile">Apod. Existente</span>
                    </h4>
                    <div className="apoderado-checkbox">
                      {apoderadoExiste && <span>✓</span>}
                    </div>
                  </div>
                </div>

                {/* Contenido expandible: Datos del Apoderado */}
                {apoderadoExpanded && (
                  <div style={{ backgroundColor: '#f9fafb', padding: '16px', border: '1px solid #d1d5db', borderTop: 'none' }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombres</label>
                        <input type="text" className="form-control" placeholder="Ej: Maria Jose" />
                      </div>
                      <div className="form-group">
                        <label>Apellidos</label>
                        <input type="text" className="form-control" placeholder="Ej: Gonzalez Perez" />
                      </div>
                    </div>
                    <div className="form-row form-row-rut-tel">
                      <div className="form-group">
                        <label>RUT</label>
                        <input type="text" className="form-control" placeholder="Ej: 12.345.678-9" />
                      </div>
                      <div className="form-group">
                        <label>Telefono</label>
                        <input type="tel" className="form-control" placeholder="Ej: +56 9 1234 5678" />
                      </div>
                    </div>
                    <div className="form-row form-row-correo-parentesco">
                      <div className="form-group">
                        <label>Correo Electronico</label>
                        <input type="email" className="form-control" placeholder="Ej: correo@ejemplo.com" />
                      </div>
                      <div className="form-group">
                        <label>Parentesco</label>
                        <select className="form-control">
                          <option value="">Seleccionar...</option>
                          <option value="madre">Madre</option>
                          <option value="padre">Padre</option>
                          <option value="abuelo">Abuelo/a</option>
                          <option value="tio">Tio/a</option>
                          <option value="tutor">Tutor Legal</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenido expandible: Apoderado Ya Existe */}
                {apoderadoExiste && (
                  <div style={{ backgroundColor: '#f9fafb', padding: '16px', border: '1px solid #d1d5db', borderTop: 'none' }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombres</label>
                        <input type="text" className="form-control" placeholder="Ej: Maria Jose" />
                      </div>
                      <div className="form-group">
                        <label>Apellidos</label>
                        <input type="text" className="form-control" placeholder="Ej: Gonzalez Perez" />
                      </div>
                    </div>
                    <div className="form-row form-row-rut-tel">
                      <div className="form-group">
                        <label>RUT</label>
                        <input type="text" className="form-control" placeholder="Ej: 12.345.678-9" />
                      </div>
                      <div className="form-group">
                        <label>Parentesco</label>
                        <select className="form-control">
                          <option value="">Seleccionar...</option>
                          <option value="Padre">Padre</option>
                          <option value="Madre">Madre</option>
                          <option value="Tutor Legal">Tutor Legal</option>
                          <option value="Abuelo/a">Abuelo/a</option>
                          <option value="Tio/a">Tio/a</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-actions form-actions-alumnos">
                  <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>Limpiar</button>
                  <button type="submit" className="btn btn-primary">Agregar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Listado de Alumnos */}
        <div className={`column ${subTab === 'gestion' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h3>Listado de Alumnos</h3>
            </div>
            <div className="card-body">
              <div className="filtros-alumnos">
                <div className="form-row form-row-filtros">
                  <div className="form-group">
                    <label>Curso</label>
                    {isMobile ? (
                      <div className="custom-select-container">
                        <div
                          className="custom-select-trigger"
                          onClick={() => setDropdownAbierto(dropdownAbierto === 'filtroCurso' ? null : 'filtroCurso')}
                        >
                          <span>{filtros.cursoNombre || 'Todos los cursos'}</span>
                          <span className="custom-select-arrow">{dropdownAbierto === 'filtroCurso' ? '▲' : '▼'}</span>
                        </div>
                        {dropdownAbierto === 'filtroCurso' && (
                          <div className="custom-select-options">
                            <div
                              className="custom-select-option"
                              onClick={() => {
                                setFiltros({ ...filtros, curso: '', cursoNombre: '' });
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
                                  setFiltros({ ...filtros, curso: curso.nombre, cursoNombre: curso.nombre });
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
                        value={filtros.curso}
                        onChange={(e) => setFiltros({ ...filtros, curso: e.target.value })}
                      >
                        <option value="">Todos los cursos</option>
                        {cursosDB.map(curso => (
                          <option key={curso.id} value={curso.nombre}>{curso.nombre}</option>
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
                      value={filtros.nombre}
                      onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="table-responsive table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre Completo</th>
                      <th>RUT</th>
                      <th>Curso</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAlumnosFiltrados().length > 0 ? (
                      getAlumnosFiltrados().map(alumno => (
                        <tr key={alumno.id}>
                          <td>{alumno.nombre_completo}</td>
                          <td>{alumno.rut}</td>
                          <td>{alumno.curso_nombre}</td>
                          <td>
                            <div className="acciones-btns">
                              <button className="btn-icon btn-icon-edit" onClick={() => editarAlumno(alumno)} title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button className="btn-icon btn-icon-delete" onClick={() => eliminarAlumno(alumno)} title="Eliminar">
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
                        <td colSpan="4" className="text-center text-muted">No hay alumnos registrados</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editar Alumno */}
      {modalEditar.visible && (
        <div className="modal-overlay" onClick={() => setModalEditar({ visible: false, alumno: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Alumno</h3>
              <button className="modal-close" onClick={() => setModalEditar({ visible: false, alumno: null })}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Curso</label>
                  <select className="form-control" defaultValue="">
                    <option value="">Seleccionar...</option>
                    {cursosDB.map(curso => (
                      <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>RUT</label>
                  <input type="text" className="form-control" defaultValue={modalEditar.alumno?.rut} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input type="text" className="form-control" defaultValue={modalEditar.alumno?.nombres} />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" className="form-control" defaultValue={modalEditar.alumno?.apellidos} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalEditar({ visible: false, alumno: null })}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                mostrarMensaje('Exito', 'Alumno actualizado correctamente (demo)', 'success');
                setModalEditar({ visible: false, alumno: null });
              }}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumnosTab;
