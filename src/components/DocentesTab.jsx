import React, { useState } from 'react';
import { docentesDB, asignaturasDB, docenteEspecialidadesDB } from '../data/demoData';

function DocentesTab({ mostrarMensaje }) {
  const [subTab, setSubTab] = useState('agregar');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    especialidades: []
  });
  const [filtros, setFiltros] = useState({ docente: '', asignatura: '' });
  const [modalEditar, setModalEditar] = useState({ visible: false, docente: null });
  const [modalAgregarAsignatura, setModalAgregarAsignatura] = useState(false);
  const [modalEliminarAsignatura, setModalEliminarAsignatura] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEspecialidadChange = (asignaturaId) => {
    const nuevasEspecialidades = formData.especialidades.includes(asignaturaId)
      ? formData.especialidades.filter(id => id !== asignaturaId)
      : [...formData.especialidades, asignaturaId];
    setFormData({ ...formData, especialidades: nuevasEspecialidades });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mostrarMensaje('Exito', 'Docente agregado correctamente (demo)', 'success');
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      rut: '',
      email: '',
      especialidades: []
    });
  };

  const getDocentesFiltrados = () => {
    return docentesDB.filter(docente => {
      const matchNombre = !filtros.docente || docente.nombre_completo.toLowerCase().includes(filtros.docente.toLowerCase());
      const especialidades = docenteEspecialidadesDB[docente.id] || [];
      const matchAsignatura = !filtros.asignatura || especialidades.some(esp => esp.nombre.toLowerCase().includes(filtros.asignatura.toLowerCase()));
      return matchNombre && matchAsignatura;
    });
  };

  const getEspecialidadesDocente = (docenteId) => {
    const especialidades = docenteEspecialidadesDB[docenteId] || [];
    return especialidades.map(e => abreviarNombre(e.nombre)).join(', ') || 'Sin especialidades';
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

  return (
    <div className="tab-panel active">
      {/* Sub-pestañas para móvil */}
      <div className="sub-tabs-mobile sub-tabs-docentes">
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'agregar' ? 'active' : ''}`}
          onClick={() => setSubTab('agregar')}
        >
          Agregar Docente
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${subTab === 'listado' ? 'active' : ''}`}
          onClick={() => setSubTab('listado')}
        >
          Listado Docentes
        </button>
      </div>

      <div className="two-columns">
        {/* Columna Izquierda: Agregar Docente */}
        <div className={`column ${subTab === 'listado' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h3>Agregar Docente</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombres</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      placeholder="Ej: Maria Jose"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellidos</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      placeholder="Ej: Gonzalez Perez"
                      required
                    />
                  </div>
                </div>

                <div className="form-row form-row-rut-email">
                  <div className="form-group">
                    <label>RUT</label>
                    <input
                      type="text"
                      className="form-control"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      placeholder="Ej: 12.345.678-9"
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo Electronico</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ej: docente@correo.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-con-boton">
                    <label>Especialidades</label>
                    <div className="botones-asignatura">
                      <button type="button" className="btn-agregar-asignatura" onClick={() => setModalAgregarAsignatura(true)}>
                        <span>+</span> Agregar
                      </button>
                      <button type="button" className="btn-eliminar-asignatura" onClick={() => setModalEliminarAsignatura(true)}>
                        <span>-</span> Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="checkbox-group checkbox-4-columnas especialidades-grid">
                    {asignaturasDB.map(asignatura => (
                      <div key={asignatura.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`esp-${asignatura.id}`}
                          checked={formData.especialidades.includes(asignatura.id)}
                          onChange={() => handleEspecialidadChange(asignatura.id)}
                        />
                        <label htmlFor={`esp-${asignatura.id}`}>{abreviarNombre(asignatura.nombre)}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions form-actions-docentes">
                  <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>Limpiar</button>
                  <button type="submit" className="btn btn-primary">Agregar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Listado de Docentes */}
        <div className={`column ${subTab === 'agregar' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header">
              <h3>Listado de Docentes</h3>
            </div>
            <div className="card-body">
              <div className="filtros-docentes">
                <div className="form-row form-row-filtros">
                  <div className="form-group">
                    <label>Docente</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar docente..."
                      value={filtros.docente}
                      onChange={(e) => setFiltros({ ...filtros, docente: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Asignatura</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar asignatura..."
                      value={filtros.asignatura}
                      onChange={(e) => setFiltros({ ...filtros, asignatura: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="table-responsive table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre Completo</th>
                      <th>Especialidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDocentesFiltrados().length > 0 ? (
                      getDocentesFiltrados().map(docente => (
                        <tr key={docente.id}>
                          <td>{docente.nombre_completo}</td>
                          <td>{getEspecialidadesDocente(docente.id)}</td>
                          <td>
                            <div className="acciones-btns">
                              <button className="btn-icon btn-icon-edit" onClick={() => setModalEditar({ visible: true, docente })} title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button className="btn-icon btn-icon-delete" onClick={() => mostrarMensaje('Exito', 'Docente eliminado (demo)', 'success')} title="Eliminar">
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
                        <td colSpan="3" className="text-center text-muted">No hay docentes registrados</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editar Docente */}
      {modalEditar.visible && (
        <div className="modal-overlay" onClick={() => setModalEditar({ visible: false, docente: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Docente</h3>
              <button className="modal-close" onClick={() => setModalEditar({ visible: false, docente: null })}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input type="text" className="form-control" defaultValue={modalEditar.docente?.nombres} />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" className="form-control" defaultValue={modalEditar.docente?.apellidos} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>RUT</label>
                  <input type="text" className="form-control" defaultValue={modalEditar.docente?.rut} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" defaultValue={modalEditar.docente?.email} />
                </div>
              </div>
              <div className="form-group">
                <label>Especialidades</label>
                <div className="checkbox-group checkbox-4-columnas especialidades-grid">
                  {asignaturasDB.map(asignatura => (
                    <div key={asignatura.id} className="checkbox-item">
                      <input type="checkbox" id={`edit-esp-${asignatura.id}`} />
                      <label htmlFor={`edit-esp-${asignatura.id}`}>{abreviarNombre(asignatura.nombre)}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalEditar({ visible: false, docente: null })}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                mostrarMensaje('Exito', 'Docente actualizado (demo)', 'success');
                setModalEditar({ visible: false, docente: null });
              }}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Asignatura */}
      {modalAgregarAsignatura && (
        <div className="modal-overlay" onClick={() => setModalAgregarAsignatura(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nueva Asignatura</h3>
              <button className="modal-close" onClick={() => setModalAgregarAsignatura(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Asignatura</label>
                <input type="text" className="form-control" placeholder="Ej: Filosofia" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalAgregarAsignatura(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                mostrarMensaje('Exito', 'Asignatura agregada (demo)', 'success');
                setModalAgregarAsignatura(false);
              }}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Asignatura */}
      {modalEliminarAsignatura && (
        <div className="modal-overlay" onClick={() => setModalEliminarAsignatura(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Asignatura</h3>
              <button className="modal-close" onClick={() => setModalEliminarAsignatura(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Seleccione la asignatura a eliminar</label>
                <select className="form-control">
                  <option value="">Seleccione una asignatura...</option>
                  {asignaturasDB.map(asig => (
                    <option key={asig.id} value={asig.id}>{asig.nombre}</option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '12px', color: '#d97706', marginTop: '10px' }}>
                <strong>Advertencia:</strong> Solo se pueden eliminar asignaturas que no tengan notas ni asignaciones activas.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalEliminarAsignatura(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => {
                mostrarMensaje('Exito', 'Asignatura eliminada (demo)', 'success');
                setModalEliminarAsignatura(false);
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocentesTab;
