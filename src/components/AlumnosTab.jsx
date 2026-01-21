import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useResponsive, useDropdown } from '../hooks';
import { useMensaje } from '../contexts';
import config from '../config/env';

// Componente Select para movil
const SelectMovilLocal = ({ label, value, valueName, onChange, options, placeholder, isOpen, onToggle }) => (
  <div className="form-group">
    <label>{label}</label>
    <div className="custom-select-container">
      <div className="custom-select-trigger" onClick={onToggle}>
        <span>{valueName || placeholder}</span>
        <span className="custom-select-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="custom-select-options">
          <div className="custom-select-option" onClick={() => onChange('', '')}>{placeholder}</div>
          {options.map(opt => (
            <div key={opt.id} className={`custom-select-option ${value === String(opt.id) || value === opt.nombre ? 'selected' : ''}`} onClick={() => onChange(opt.id || opt.nombre, opt.nombre)}>
              {opt.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Modal de edicion COMPLETO CON PESTAÑAS
const ModalEditarAlumno = ({ alumno: alumnoInicial, cursos, onGuardar, onCerrar }) => {
  const [activeTab, setActiveTab] = useState('alumno'); // 'alumno' | 'apoderado'
  const [loading, setLoading] = useState(true);
  const [datosCompletos, setDatosCompletos] = useState(null);

  // Formulario editable del alumno
  const [formAlumno, setFormAlumno] = useState({
    curso_id: '',
    rut: '',
    nombres: '',
    apellidos: '',
    direccion: '',
    sexo: ''
  });

  const [guardando, setGuardando] = useState(false);

  // Cargar datos completos al abrir
  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/alumnos/${alumnoInicial.id}/detalle`);
        const json = await res.json();
        if (json.success) {
          setDatosCompletos(json.data);
          // Pre-llenar formulario alumno
          const al = json.data.alumno;
          setFormAlumno({
            curso_id: al.curso_id || '',
            rut: al.rut || '',
            nombres: al.nombres || '',
            apellidos: al.apellidos || '',
            direccion: al.direccion || '',
            sexo: al.sexo || ''
          });
        } else {
          alert("Error cargando ficha");
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchDetalle();
  }, [alumnoInicial]);

  const handleChange = (e) => {
    setFormAlumno({ ...formAlumno, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/alumnos/${alumnoInicial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: formAlumno.rut,
          nombres: formAlumno.nombres,
          apellidos: formAlumno.apellidos,
          curso_id: formAlumno.curso_id ? parseInt(formAlumno.curso_id) : null,
          usuario_modificacion: 'Administrador'
        })
      });
      const data = await response.json();
      if (data.success) {
        onGuardar();
      } else {
        alert(data.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 15px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
        Cargando ficha del alumno...
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ficha del Alumno: {datosCompletos?.alumno?.nombres} {datosCompletos?.alumno?.apellidos}</h3>
          <button className="modal-close" onClick={onCerrar}>&times;</button>
        </div>

        {/* Pestañas del Modal */}
        <div className="modal-tabs">
          <button type="button" className={`modal-tab-btn ${activeTab === 'alumno' ? 'active' : ''}`} onClick={() => setActiveTab('alumno')}>👤 Datos Alumno</button>
          <button type="button" className={`modal-tab-btn ${activeTab === 'apoderado' ? 'active' : ''}`} onClick={() => setActiveTab('apoderado')}>👪 Apoderado</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'alumno' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Curso Actual</label>
                  <select className="form-control" name="curso_id" value={formAlumno.curso_id} onChange={handleChange}>
                    <option value="">Sin Curso (Pendiente Matricula)</option>
                    {cursos.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label>RUT</label>
                  <input type="text" className="form-control" name="rut" value={formAlumno.rut} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Nombres</label><input type="text" className="form-control" name="nombres" value={formAlumno.nombres} onChange={handleChange} /></div>
                <div className="form-group"><label>Apellidos</label><input type="text" className="form-control" name="apellidos" value={formAlumno.apellidos} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Dirección</label><input type="text" className="form-control" name="direccion" value={formAlumno.direccion} onChange={handleChange} placeholder="Calle, Número, Comuna" /></div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select className="form-control" name="sexo" value={formAlumno.sexo} onChange={handleChange}>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>
              {datosCompletos.alumno.matricula_id && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.9em' }}>
                  ✅ Alumno con matrícula activa (ID: {datosCompletos.alumno.matricula_id}) para el año {datosCompletos.alumno.anio_academico}.
                </div>
              )}
            </>
          )}

          {activeTab === 'apoderado' && (
            <div className="info-readonly">
              {datosCompletos.apoderado ? (
                <>
                  <div className="info-section-title" style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '10px', borderBottom: '2px solid #e0e7ff', paddingBottom: '5px' }}>Datos del Responsable</div>
                  <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="info-item"><label style={{ fontSize: '0.85em', color: '#666' }}>Nombre Completo</label><div style={{ fontWeight: 500 }}>{datosCompletos.apoderado.nombres} {datosCompletos.apoderado.apellidos}</div></div>
                    <div className="info-item"><label style={{ fontSize: '0.85em', color: '#666' }}>RUT</label><div style={{ fontWeight: 500 }}>{datosCompletos.apoderado.rut}</div></div>
                    <div className="info-item"><label style={{ fontSize: '0.85em', color: '#666' }}>Parentesco</label><div style={{ fontWeight: 500, color: '#2563eb' }}>{datosCompletos.apoderado.parentezco}</div></div>
                    <div className="info-item"><label style={{ fontSize: '0.85em', color: '#666' }}>Email</label><div style={{ fontWeight: 500 }}>{datosCompletos.apoderado.email}</div></div>
                    <div className="info-item"><label style={{ fontSize: '0.85em', color: '#666' }}>Teléfono</label><div style={{ fontWeight: 500 }}>{datosCompletos.apoderado.telefono}</div></div>
                  </div>
                  <div className="info-item" style={{ marginTop: '15px' }}><label style={{ fontSize: '0.85em', color: '#666' }}>Dirección</label><div style={{ fontWeight: 500 }}>{datosCompletos.apoderado.direccion}</div></div>
                </>
              ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤷‍♂️</div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#374151' }}>Sin Apoderado Asignado</h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9em' }}>Este alumno no tiene un apoderado vinculado en su matrícula vigente.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={guardando}>Cerrar</button>
          {activeTab === 'alumno' && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          )}
        </div>
      </div>
      <style>{`
        .modal-xl { max-width: 700px; width: 90%; }
        .modal-tabs { display: flex; border-bottom: 1px solid #ddd; margin-bottom: 20px; padding: 0 20px; }
        .modal-tab-btn { flex: 1; padding: 12px; border: none; background: none; cursor: pointer; border-bottom: 3px solid transparent; font-weight: 500; color: #64748b; transition: all 0.2s; font-size: 1rem; }
        .modal-tab-btn:hover { color: #3b82f6; background: #f8fafc; }
        .modal-tab-btn.active { border-bottom-color: #3b82f6; color: #2563eb; background: #eff6ff; font-weight: 600; }
        .modal-body { padding: 0 20px 20px; }
      `}</style>
    </div>
  );
};

function AlumnosTab() {
  const { mostrarMensaje } = useMensaje();
  const [filtros, setFiltros] = useState({ cursoId: '', cursoNombre: '', busquedaAlumno: '', alumnoSeleccionado: null });
  const [modalEditar, setModalEditar] = useState({ visible: false, alumno: null });
  const [cursosDB, setCursosDB] = useState([]);
  const [alumnosPorCursoDB, setAlumnosPorCursoDB] = useState({});
  const [alumnosDelCursoFiltro, setAlumnosDelCursoFiltro] = useState([]);
  const [dropdownAlumnoAbierto, setDropdownAlumnoAbierto] = useState(false);
  const dropdownAlumnoRef = useRef(null);

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  // Cerrar dropdown de alumnos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownAlumnoRef.current && !dropdownAlumnoRef.current.contains(event.target)) {
        setDropdownAlumnoAbierto(false);
      }
    };
    if (dropdownAlumnoAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownAlumnoAbierto]);

  // Cargar cursos y alumnos al montar el componente
  useEffect(() => {
    cargarCursos();
    cargarAlumnos();
  }, []);

  const cargarCursos = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/cursos`);
      const data = await response.json();
      if (data.success) {
        setCursosDB(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
    }
  };

  const cargarAlumnos = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/alumnos/por-curso`);
      const data = await response.json();
      if (data.success) {
        setAlumnosPorCursoDB(data.data || {});
      }
    } catch (error) {
      console.error('Error cargando alumnos:', error);
    }
  };

  // Cargar alumnos del curso seleccionado
  const cargarAlumnosDelCurso = async (cursoId) => {
    if (!cursoId) {
      setAlumnosDelCursoFiltro([]);
      return;
    }
    try {
      const response = await fetch(`${config.apiBaseUrl}/alumnos?curso_id=${cursoId}`);
      const data = await response.json();
      if (data.success) {
        setAlumnosDelCursoFiltro(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando alumnos del curso:', error);
    }
  };

  // Cuando cambia el curso del filtro
  const handleCambiarCursoFiltro = (cursoId, cursoNombre) => {
    setFiltros({ ...filtros, cursoId, cursoNombre, busquedaAlumno: '', alumnoSeleccionado: null });
    cargarAlumnosDelCurso(cursoId);
  };

  // Cuando se selecciona un alumno del dropdown
  const handleSeleccionarAlumnoFiltro = (alumno) => {
    setFiltros({ ...filtros, busquedaAlumno: alumno.nombre_completo, alumnoSeleccionado: alumno });
    setDropdownAlumnoAbierto(false);
  };

  // Alumnos filtrados por texto de búsqueda (para el dropdown)
  const alumnosSugeridos = useMemo(() => {
    if (!filtros.busquedaAlumno || filtros.alumnoSeleccionado) return alumnosDelCursoFiltro;
    return alumnosDelCursoFiltro.filter(alumno =>
      alumno.nombre_completo.toLowerCase().includes(filtros.busquedaAlumno.toLowerCase()) ||
      alumno.rut.toLowerCase().includes(filtros.busquedaAlumno.toLowerCase())
    );
  }, [alumnosDelCursoFiltro, filtros.busquedaAlumno, filtros.alumnoSeleccionado]);

  // Alumnos mostrados en la tabla
  const alumnosFiltrados = useMemo(() => {
    // Si hay un alumno seleccionado específicamente, mostrar solo ese
    if (filtros.alumnoSeleccionado) {
      return [filtros.alumnoSeleccionado];
    }

    // Si hay un curso seleccionado, mostrar alumnos de ese curso
    if (filtros.cursoId) {
      // Filtrar por texto de búsqueda si hay
      if (filtros.busquedaAlumno) {
        return alumnosDelCursoFiltro.filter(alumno =>
          alumno.nombre_completo.toLowerCase().includes(filtros.busquedaAlumno.toLowerCase()) ||
          alumno.rut.toLowerCase().includes(filtros.busquedaAlumno.toLowerCase())
        );
      }
      return alumnosDelCursoFiltro;
    }

    // Si no hay filtros, mostrar todos los alumnos
    let alumnos = [];
    Object.entries(alumnosPorCursoDB).forEach(([curso, lista]) => {
      lista.forEach(alumno => alumnos.push(alumno));
    });
    return alumnos;
  }, [filtros.cursoId, filtros.busquedaAlumno, filtros.alumnoSeleccionado, alumnosDelCursoFiltro, alumnosPorCursoDB]);

  const eliminarAlumno = async (alumno) => {
    if (window.confirm(`¿Desea eliminar al alumno ${alumno.nombre_completo}?\n\nEsta acción lo desactivará del sistema y no aparecerá en ningún listado.`)) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/alumnos/${alumno.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_modificacion: 'Administrador' })
        });
        const data = await response.json();
        if (data.success) {
          mostrarMensaje('Exito', 'Alumno eliminado correctamente', 'success');
          cargarAlumnos();
          // Recargar también los alumnos del filtro si hay un curso seleccionado
          if (filtros.cursoId) {
            cargarAlumnosDelCurso(filtros.cursoId);
          }
        } else {
          mostrarMensaje('Error', data.error || 'Error al eliminar', 'error');
        }
      } catch (error) {
        mostrarMensaje('Error', 'Error de conexión', 'error');
      }
    }
  };

  // Función para cuando se guarda un alumno editado
  const handleGuardarEdicion = () => {
    mostrarMensaje('Exito', 'Alumno actualizado correctamente', 'success');
    setModalEditar({ visible: false, alumno: null });
    cargarAlumnos();
    // Recargar también los alumnos del filtro si hay un curso seleccionado
    if (filtros.cursoId) {
      cargarAlumnosDelCurso(filtros.cursoId);
    }
  };

  return (
    <div className="tab-panel active">
      <div className="card full-width-card">
        <div className="card-header"><h3>Kárdex de Alumnos (Gestión y Consulta)</h3></div>
        <div className="card-body">
          <div className="filtros-alumnos">
            <div className="form-row form-row-filtros">
              <div className="form-group">
                <label>Curso</label>
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
                      <div className="custom-select-option" onClick={() => { handleCambiarCursoFiltro('', ''); setDropdownAbierto(null); }}>Todos los cursos</div>
                      {cursosDB.map(curso => (
                        <div
                          key={curso.id}
                          className={`custom-select-option ${filtros.cursoId === String(curso.id) ? 'selected' : ''}`}
                          onClick={() => { handleCambiarCursoFiltro(curso.id, curso.nombre); setDropdownAbierto(null); }}
                        >
                          {curso.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group" style={{ position: 'relative' }} ref={dropdownAlumnoRef}>
                <label>Alumno</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={filtros.cursoId ? "Buscar alumno..." : "Seleccione un curso primero"}
                  value={filtros.busquedaAlumno}
                  disabled={!filtros.cursoId}
                  onChange={(e) => {
                    setFiltros({ ...filtros, busquedaAlumno: e.target.value, alumnoSeleccionado: null });
                    setDropdownAlumnoAbierto(true);
                  }}
                  onFocus={() => filtros.cursoId && setDropdownAlumnoAbierto(true)}
                />
                {dropdownAlumnoAbierto && filtros.cursoId && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0 0 8px 8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}>
                    {/* Opción "Todos" al inicio */}
                    <div
                      onClick={() => {
                        setFiltros({ ...filtros, busquedaAlumno: '', alumnoSeleccionado: null });
                        setDropdownAlumnoAbierto(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '2px solid #e2e8f0',
                        background: !filtros.alumnoSeleccionado && !filtros.busquedaAlumno ? '#eff6ff' : 'white',
                        color: '#3b82f6',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = !filtros.alumnoSeleccionado && !filtros.busquedaAlumno ? '#eff6ff' : 'white'}
                    >
                      Todos los alumnos
                    </div>
                    {/* Lista de alumnos filtrados */}
                    {alumnosSugeridos.length > 0 ? (
                      alumnosSugeridos.map(alumno => (
                        <div
                          key={alumno.id}
                          onClick={() => handleSeleccionarAlumnoFiltro(alumno)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: filtros.alumnoSeleccionado?.id === alumno.id ? '#eff6ff' : 'white'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.background = filtros.alumnoSeleccionado?.id === alumno.id ? '#eff6ff' : 'white'}
                        >
                          <div>
                            <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>
                              {alumno.nombre_completo}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                              {alumno.rut}
                            </div>
                          </div>
                          <div style={{ color: '#64748b', fontSize: '10px', whiteSpace: 'nowrap', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {alumno.curso_nombre}
                          </div>
                        </div>
                      ))
                    ) : filtros.busquedaAlumno ? (
                      <div style={{ padding: '12px', color: '#94a3b8', fontSize: '14px' }}>
                        No se encontraron alumnos
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            {filtros.cursoNombre && (
              <div style={{ marginTop: '10px', padding: '8px 12px', background: '#eff6ff', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#3b82f6', fontWeight: '500' }}>Mostrando:</span>
                <span style={{ color: '#1e40af' }}>{filtros.cursoNombre?.replace(/Básico|Basico|Básica|Basica/gi, 'B').replace(/Media/gi, 'M')}</span>
                {filtros.alumnoSeleccionado && (
                  <>
                    <span style={{ color: '#94a3b8' }}>→</span>
                    <span style={{ color: '#1e40af' }}>{filtros.alumnoSeleccionado.nombre_completo}</span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFiltros({ cursoId: '', cursoNombre: '', busquedaAlumno: '', alumnoSeleccionado: null });
                    setAlumnosDelCursoFiltro([]);
                  }}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px' }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
          <div className="table-responsive table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Nombre Completo</th><th>RUT</th><th>Curso</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {alumnosFiltrados.length > 0 ? alumnosFiltrados.map(alumno => (
                  <tr key={alumno.id}>
                    <td>{alumno.nombre_completo}</td>
                    <td>{alumno.rut}</td>
                    <td>{alumno.curso_nombre?.replace(/Básico|Basico|Básica|Basica/gi, 'B').replace(/Media/gi, 'M')}</td>
                    <td>
                      <div className="acciones-btns">
                        <button className="btn-icon btn-icon-edit" onClick={() => setModalEditar({ visible: true, alumno })} title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn-icon btn-icon-delete" onClick={() => eliminarAlumno(alumno)} title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (<tr><td colSpan="4" className="text-center text-muted">No hay alumnos registrados</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalEditar.visible && (
        <ModalEditarAlumno
          alumno={modalEditar.alumno}
          cursos={cursosDB}
          onGuardar={handleGuardarEdicion}
          onCerrar={() => setModalEditar({ visible: false, alumno: null })}
        />
      )}
    </div>
  );
}

export default AlumnosTab;
