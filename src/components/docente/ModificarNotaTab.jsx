import React, { useState, useMemo } from 'react';
import { useResponsive, useDropdown } from '../../hooks';
import {
  SelectNativo,
  SelectMovil,
  AutocompleteAlumno,
  formatearFecha,
  getNotaClass,
  formatearNombreCompleto
} from './shared';

// Modal de edicion
const ModalEditar = ({ nota, editNota, setEditNota, editTrimestre, setEditTrimestre, editFecha, setEditFecha, editComentario, setEditComentario, onGuardar, onCerrar }) => (
  <div className="modal-overlay" onClick={onCerrar}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Editar Calificacion</h3>
        <button className="modal-close" onClick={onCerrar}>&times;</button>
      </div>
      <form onSubmit={onGuardar}>
        <div className="modal-body">
          <div className="docente-modal-info">
            <div className="docente-info-item"><label>Alumno</label><span>{nota?.alumno_nombre}</span></div>
            <div className="docente-info-item"><label>Curso</label><span>{nota?.curso_nombre}</span></div>
            <div className="docente-info-item"><label>Asignatura</label><span>{nota?.asignatura_nombre}</span></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nota</label>
              <input type="number" className="form-control" min="1.0" max="7.0" step="0.1" value={editNota} onChange={(e) => setEditNota(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Trimestre</label>
              <select className="form-control" value={editTrimestre} onChange={(e) => setEditTrimestre(e.target.value)}>
                <option value="1">Primer Trimestre</option>
                <option value="2">Segundo Trimestre</option>
                <option value="3">Tercer Trimestre</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" className="form-control" value={editFecha} onChange={(e) => setEditFecha(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Comentario</label>
            <textarea className="form-control" rows="3" value={editComentario} onChange={(e) => setEditComentario(e.target.value)}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
);

// Modal de confirmacion eliminar
const ModalEliminar = ({ nota, onConfirmar, onCerrar }) => (
  <div className="modal-overlay" onClick={onCerrar}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header" style={{ background: '#fef2f2' }}>
        <h3 style={{ color: '#dc2626' }}>Eliminar Calificacion</h3>
        <button className="modal-close" onClick={onCerrar}>&times;</button>
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
            <p>Esta a punto de eliminar la nota de <strong>{nota?.alumno_nombre}</strong>. Esta accion no se puede deshacer.</p>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
        <button className="btn btn-danger" onClick={onConfirmar}>Eliminar Nota</button>
      </div>
    </div>
  </div>
);

function ModificarNotaTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas, onEditarNota, onEliminarNota }) {
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroCursoNombre, setFiltroCursoNombre] = useState('');
  const [filtroAsignatura, setFiltroAsignatura] = useState('');
  const [filtroAsignaturaNombre, setFiltroAsignaturaNombre] = useState('');
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroAlumnoId, setFiltroAlumnoId] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [buscado, setBuscado] = useState(false);

  // Estados modales
  const [modalEditar, setModalEditar] = useState(false);
  const [notaEditando, setNotaEditando] = useState(null);
  const [editNota, setEditNota] = useState('');
  const [editTrimestre, setEditTrimestre] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editComentario, setEditComentario] = useState('');
  const [modalEliminar, setModalEliminar] = useState(false);
  const [notaEliminar, setNotaEliminar] = useState(null);

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  const asignaturasDisponibles = useMemo(() => {
    if (!filtroCurso) return [];
    return asignaciones.filter(a => a.curso_id === parseInt(filtroCurso)).map(a => ({ id: a.asignatura_id, nombre: a.asignatura_nombre }));
  }, [filtroCurso, asignaciones]);

  const alumnosDelCurso = useMemo(() => filtroCurso ? (alumnosPorCurso[filtroCurso] || []) : [], [filtroCurso, alumnosPorCurso]);

  const resultadosBusqueda = useMemo(() => {
    if (!buscado) return [];
    let resultados = [...notasRegistradas];
    if (filtroCurso) resultados = resultados.filter(n => n.curso_id === parseInt(filtroCurso));
    if (filtroAsignatura) resultados = resultados.filter(n => n.asignatura_id === parseInt(filtroAsignatura));
    if (filtroAlumnoId) resultados = resultados.filter(n => n.alumno_id === filtroAlumnoId);
    else if (filtroAlumno) resultados = resultados.filter(n => n.alumno_nombre.toLowerCase().includes(filtroAlumno.toLowerCase()));
    if (filtroFecha) resultados = resultados.filter(n => n.fecha === filtroFecha);
    return resultados;
  }, [notasRegistradas, filtroCurso, filtroAsignatura, filtroAlumno, filtroAlumnoId, filtroFecha, buscado]);

  const handleCursoChange = (cursoId, nombre = '') => {
    setFiltroCurso(cursoId);
    setFiltroCursoNombre(nombre);
    setFiltroAsignatura('');
    setFiltroAsignaturaNombre('');
    setFiltroAlumno('');
    setFiltroAlumnoId('');
  };

  const handleSeleccionarAlumno = (alumno) => {
    if (alumno) {
      setFiltroAlumno(`${alumno.nombres} ${alumno.apellidos}`);
      setFiltroAlumnoId(alumno.id);
    } else {
      setFiltroAlumno('');
      setFiltroAlumnoId('');
    }
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
  };

  const abrirModalEditar = (nota) => {
    setNotaEditando(nota);
    setEditNota(nota.nota !== null ? nota.nota.toString() : '');
    setEditTrimestre(nota.trimestre.toString());
    setEditFecha(nota.fecha);
    setEditComentario(nota.comentario || '');
    setModalEditar(true);
  };

  const guardarEdicion = (e) => {
    e.preventDefault();
    onEditarNota(notaEditando.id, {
      nota: editNota ? parseFloat(editNota) : null,
      trimestre: parseInt(editTrimestre),
      fecha: editFecha,
      comentario: editComentario
    });
    setModalEditar(false);
    alert('Nota actualizada exitosamente');
  };

  const confirmarEliminar = () => {
    onEliminarNota(notaEliminar.id);
    setModalEliminar(false);
    alert('Nota eliminada exitosamente');
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header"><h3>Buscar Nota</h3></div>
        <div className="card-body">
          {isMobile ? (
            <>
              <div className="form-row-movil">
                <SelectMovil label="Curso" value={filtroCurso} valueName={filtroCursoNombre} onChange={handleCursoChange} options={cursos} placeholder="Seleccionar..." isOpen={dropdownAbierto === 'curso'} onToggle={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')} onClose={() => setDropdownAbierto(null)} />
                <SelectMovil label="Asignatura" value={filtroAsignatura} valueName={filtroAsignaturaNombre} onChange={(id, nombre) => { setFiltroAsignatura(id); setFiltroAsignaturaNombre(nombre); }} options={asignaturasDisponibles} placeholder="Todas" disabled={!filtroCurso} isOpen={dropdownAbierto === 'asignatura'} onToggle={() => setDropdownAbierto(dropdownAbierto === 'asignatura' ? null : 'asignatura')} onClose={() => setDropdownAbierto(null)} />
              </div>
              <div className="form-row-movil">
                <AutocompleteAlumno alumnos={alumnosDelCurso} alumnoSeleccionado={filtroAlumnoId} busqueda={filtroAlumno} onBusquedaChange={(val) => { setFiltroAlumno(val); setFiltroAlumnoId(''); }} onSeleccionar={handleSeleccionarAlumno} disabled={!filtroCurso} placeholder="Todos" onDropdownOpen={() => setDropdownAbierto(null)} />
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
                </div>
              </div>
              <div className="form-actions form-actions-movil">
                <button type="button" className="btn btn-secondary" onClick={limpiarBusqueda}>Limpiar</button>
                <button type="button" className="btn btn-primary" onClick={() => setBuscado(true)}>Buscar</button>
              </div>
            </>
          ) : (
            <div className="docente-filtros-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr auto' }}>
              <SelectNativo label="Curso" value={filtroCurso} onChange={(e) => { const curso = cursos.find(c => c.id.toString() === e.target.value); handleCursoChange(e.target.value, curso?.nombre || ''); }} options={cursos} placeholder="Seleccionar curso" />
              <SelectNativo label="Asignatura" value={filtroAsignatura} onChange={(e) => { const asig = asignaturasDisponibles.find(a => a.id.toString() === e.target.value); setFiltroAsignatura(e.target.value); setFiltroAsignaturaNombre(asig?.nombre || ''); }} options={asignaturasDisponibles} placeholder={filtroCurso ? 'Todas las asignaturas' : 'Primero seleccione curso'} disabled={!filtroCurso} />
              <AutocompleteAlumno alumnos={alumnosDelCurso} alumnoSeleccionado={filtroAlumnoId} busqueda={filtroAlumno} onBusquedaChange={(val) => { setFiltroAlumno(val); setFiltroAlumnoId(''); }} onSeleccionar={handleSeleccionarAlumno} disabled={!filtroCurso} placeholder={filtroCurso ? "Todos los alumnos" : "Primero seleccione curso"} />
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
              </div>
              <div className="docente-filtros-actions">
                <button type="button" className="btn btn-secondary" onClick={limpiarBusqueda}>Limpiar</button>
                <button type="button" className="btn btn-primary" onClick={() => setBuscado(true)}>Buscar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header"><h3>Resultados</h3></div>
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
                {resultadosBusqueda.length > 0 ? resultadosBusqueda.map(nota => (
                  <tr key={nota.id}>
                    <td>{formatearNombreCompleto(nota.alumno_nombre)}</td>
                    <td>{nota.asignatura_nombre}</td>
                    <td><span className={`docente-nota-badge ${getNotaClass(nota.nota)}`}>{nota.nota !== null ? nota.nota.toFixed(1) : 'P'}</span></td>
                    <td>{nota.trimestre}</td>
                    <td>{formatearFecha(nota.fecha)}</td>
                    <td>
                      <div className="acciones-btns">
                        <button className="btn-icon btn-icon-edit" onClick={() => abrirModalEditar(nota)} title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="btn-icon btn-icon-delete" onClick={() => { setNotaEliminar(nota); setModalEliminar(true); }} title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center text-muted">{buscado ? 'No se encontraron notas' : 'Realice una busqueda'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalEditar && <ModalEditar nota={notaEditando} editNota={editNota} setEditNota={setEditNota} editTrimestre={editTrimestre} setEditTrimestre={setEditTrimestre} editFecha={editFecha} setEditFecha={setEditFecha} editComentario={editComentario} setEditComentario={setEditComentario} onGuardar={guardarEdicion} onCerrar={() => setModalEditar(false)} />}
      {modalEliminar && <ModalEliminar nota={notaEliminar} onConfirmar={confirmarEliminar} onCerrar={() => setModalEliminar(false)} />}
    </div>
  );
}

export default ModificarNotaTab;
