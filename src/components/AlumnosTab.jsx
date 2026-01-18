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

// Modal de edicion
const ModalEditarAlumno = ({ alumno, cursos, onGuardar, onCerrar }) => {
  const [formEditar, setFormEditar] = useState({
    curso_id: alumno?.curso_id || '',
    rut: alumno?.rut || '',
    nombres: alumno?.nombres || '',
    apellidos: alumno?.apellidos || ''
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    setFormEditar({ ...formEditar, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formEditar.rut || !formEditar.nombres || !formEditar.apellidos) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/alumnos/${alumno.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: formEditar.rut,
          nombres: formEditar.nombres,
          apellidos: formEditar.apellidos,
          curso_id: formEditar.curso_id ? parseInt(formEditar.curso_id) : null,
          usuario_modificacion: 'Administrador' // TODO: obtener del contexto
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

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar Alumno</h3>
          <button className="modal-close" onClick={onCerrar}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Curso</label>
              <select className="form-control" name="curso_id" value={formEditar.curso_id} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {cursos.map(curso => (<option key={curso.id} value={curso.id}>{curso.nombre}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label>RUT</label>
              <input type="text" className="form-control" name="rut" value={formEditar.rut} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nombres</label>
              <input type="text" className="form-control" name="nombres" value={formEditar.nombres} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <input type="text" className="form-control" name="apellidos" value={formEditar.apellidos} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Seccion datos apoderado
const DatosApoderado = ({ tipo, datos, onChange }) => (
  <div style={{ backgroundColor: '#f9fafb', padding: '16px', border: '1px solid #d1d5db', borderTop: 'none' }}>
    <div className="form-row">
      <div className="form-group">
        <label>Nombres</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ej: Maria Jose"
          value={datos.nombres}
          onChange={(e) => onChange({ ...datos, nombres: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Apellidos</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ej: Gonzalez Perez"
          value={datos.apellidos}
          onChange={(e) => onChange({ ...datos, apellidos: e.target.value })}
        />
      </div>
    </div>
    <div className="form-row form-row-rut-tel">
      <div className="form-group">
        <label>RUT</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ej: 12.345.678-9"
          value={datos.rut}
          onChange={(e) => onChange({ ...datos, rut: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>{tipo === 'nuevo' ? 'Telefono' : 'Parentesco'}</label>
        {tipo === 'nuevo' ? (
          <input
            type="tel"
            className="form-control"
            placeholder="Ej: +56 9 1234 5678"
            value={datos.telefono}
            onChange={(e) => onChange({ ...datos, telefono: e.target.value })}
          />
        ) : (
          <select
            className="form-control"
            value={datos.parentesco}
            onChange={(e) => onChange({ ...datos, parentesco: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="Padre">Padre</option>
            <option value="Madre">Madre</option>
            <option value="Tutor Legal">Tutor Legal</option>
            <option value="Abuelo/a">Abuelo/a</option>
            <option value="Tio/a">Tio/a</option>
            <option value="Otro">Otro</option>
          </select>
        )}
      </div>
    </div>
    {tipo === 'nuevo' && (
      <div className="form-row form-row-correo-parentesco">
        <div className="form-group">
          <label>Correo Electronico</label>
          <input
            type="email"
            className="form-control"
            placeholder="Ej: correo@ejemplo.com"
            value={datos.email}
            onChange={(e) => onChange({ ...datos, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Parentesco</label>
          <select
            className="form-control"
            value={datos.parentesco}
            onChange={(e) => onChange({ ...datos, parentesco: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="Madre">Madre</option>
            <option value="Padre">Padre</option>
            <option value="Abuelo/a">Abuelo/a</option>
            <option value="Tio/a">Tio/a</option>
            <option value="Tutor Legal">Tutor Legal</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>
    )}
  </div>
);

function AlumnosTab() {
  const { mostrarMensaje } = useMensaje();
  const [subTab, setSubTab] = useState('gestion');
  const [formData, setFormData] = useState({ curso: '', cursoNombre: '', rut: '', nombres: '', apellidos: '', fechaNacimiento: '', sexo: '' });
  const [apoderadoData, setApoderadoData] = useState({ nombres: '', apellidos: '', rut: '', telefono: '', email: '', parentesco: '' });
  const [apoderadoExpanded, setApoderadoExpanded] = useState(false);
  const [apoderadoExiste, setApoderadoExiste] = useState(false);
  const [filtros, setFiltros] = useState({ cursoId: '', cursoNombre: '', busquedaAlumno: '', alumnoSeleccionado: null });
  const [modalEditar, setModalEditar] = useState({ visible: false, alumno: null });
  const [cursosDB, setCursosDB] = useState([]);
  const [alumnosPorCursoDB, setAlumnosPorCursoDB] = useState({});
  const [alumnosDelCursoFiltro, setAlumnosDelCursoFiltro] = useState([]);
  const [dropdownAlumnoAbierto, setDropdownAlumnoAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
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

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que se haya seleccionado apoderado nuevo o existente
    if (!apoderadoExpanded && !apoderadoExiste) {
      mostrarMensaje('Error', 'Debe seleccionar si el apoderado es nuevo o existente', 'error');
      return;
    }

    // Validar datos del apoderado
    if (!apoderadoData.nombres || !apoderadoData.apellidos || !apoderadoData.rut || !apoderadoData.parentesco) {
      mostrarMensaje('Error', 'Complete todos los datos obligatorios del apoderado', 'error');
      return;
    }

    setCargando(true);

    try {
      const payload = {
        // Datos del alumno
        alumno_rut: formData.rut,
        alumno_nombres: formData.nombres,
        alumno_apellidos: formData.apellidos,
        alumno_fecha_nacimiento: formData.fechaNacimiento,
        alumno_sexo: formData.sexo,
        curso_id: formData.curso,
        establecimiento_id: 1, // TODO: obtener del contexto del admin
        // Datos del apoderado
        apoderado_rut: apoderadoData.rut,
        apoderado_nombres: apoderadoData.nombres,
        apoderado_apellidos: apoderadoData.apellidos,
        apoderado_telefono: apoderadoData.telefono,
        apoderado_email: apoderadoData.email,
        parentesco: apoderadoData.parentesco,
        tipo_apoderado: apoderadoExpanded ? 'nuevo' : 'existente'
      };

      const response = await fetch(`${config.apiBaseUrl}/alumnos/con-apoderado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        mostrarMensaje('Exito', data.message, 'success');
        limpiarFormulario();
        cargarAlumnos(); // Recargar lista
      } else {
        mostrarMensaje('Error', data.error || 'Error al crear alumno', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('Error', 'Error de conexión al servidor', 'error');
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({ curso: '', cursoNombre: '', rut: '', nombres: '', apellidos: '', fechaNacimiento: '', sexo: '' });
    setApoderadoData({ nombres: '', apellidos: '', rut: '', telefono: '', email: '', parentesco: '' });
    setApoderadoExpanded(false);
    setApoderadoExiste(false);
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
      <div className="sub-tabs-mobile sub-tabs-alumnos">
        <button type="button" className={`sub-tab-btn ${subTab === 'gestion' ? 'active' : ''}`} onClick={() => setSubTab('gestion')}>Gestion de Alumnos</button>
        <button type="button" className={`sub-tab-btn ${subTab === 'listado' ? 'active' : ''}`} onClick={() => setSubTab('listado')}>Listado de Alumnos</button>
      </div>

      <div className="two-columns">
        <div className={`column ${subTab === 'listado' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header"><h3>Gestion de Alumnos</h3></div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="form-alumnos">
                <div className="form-alumnos-grid">
                  <div className="form-group grupo-curso">
                    <label htmlFor="selectCursoAlumno">Curso</label>
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
                          <div className="custom-select-option" onClick={() => { setFormData({ ...formData, curso: '', cursoNombre: '' }); setDropdownAbierto(null); }}>Seleccionar...</div>
                          {cursosDB.map(curso => (
                            <div
                              key={curso.id}
                              className={`custom-select-option ${formData.curso === String(curso.id) ? 'selected' : ''}`}
                              onClick={() => { setFormData({ ...formData, curso: String(curso.id), cursoNombre: curso.nombre }); setDropdownAbierto(null); }}
                            >
                              {curso.nombre}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group grupo-rut">
                    <label htmlFor="inputRutAlumno">RUT</label>
                    <input type="text" id="inputRutAlumno" className="form-control" name="rut" value={formData.rut} onChange={handleInputChange} placeholder="Ej: 12.345.678-9" required />
                  </div>
                  <div className="form-group grupo-fecha">
                    <label htmlFor="inputFechaNacAlumno">Fecha de Nacimiento</label>
                    <input type="date" id="inputFechaNacAlumno" className="form-control" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group grupo-nombres">
                    <label htmlFor="inputNombreAlumno">Nombres</label>
                    <input type="text" id="inputNombreAlumno" className="form-control" name="nombres" value={formData.nombres} onChange={handleInputChange} placeholder="Ej: Juan Pablo" required />
                  </div>
                  <div className="form-group grupo-apellidos">
                    <label htmlFor="inputApellidoAlumno">Apellidos</label>
                    <input type="text" id="inputApellidoAlumno" className="form-control" name="apellidos" value={formData.apellidos} onChange={handleInputChange} placeholder="Ej: Perez Gonzalez" required />
                  </div>
                  <div className="form-group grupo-sexo">
                    <label htmlFor="selectSexoAlumno">Sexo</label>
                    <select id="selectSexoAlumno" className="form-control" name="sexo" value={formData.sexo} onChange={handleInputChange} required>
                      <option value="">Seleccionar...</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="apoderado-botones-container">
                  <div className="apoderado-boton" onClick={() => !apoderadoExiste && setApoderadoExpanded(!apoderadoExpanded)} style={{ opacity: apoderadoExiste ? 0.5 : 1, cursor: apoderadoExiste ? 'not-allowed' : 'pointer' }}>
                    <h4 className="apoderado-boton-texto"><span className="texto-desktop">Datos del Apoderado</span><span className="texto-mobile">Dato Apod.</span></h4>
                    <div className="apoderado-checkbox">{apoderadoExpanded && <span>✓</span>}</div>
                  </div>
                  <div className="apoderado-boton" onClick={() => !apoderadoExpanded && setApoderadoExiste(!apoderadoExiste)} style={{ opacity: apoderadoExpanded ? 0.5 : 1, cursor: apoderadoExpanded ? 'not-allowed' : 'pointer' }}>
                    <h4 className="apoderado-boton-texto"><span className="texto-desktop">Apoderado Existente</span><span className="texto-mobile">Apod. Existente</span></h4>
                    <div className="apoderado-checkbox">{apoderadoExiste && <span>✓</span>}</div>
                  </div>
                </div>

                {apoderadoExpanded && <DatosApoderado tipo="nuevo" datos={apoderadoData} onChange={setApoderadoData} />}
                {apoderadoExiste && <DatosApoderado tipo="existente" datos={apoderadoData} onChange={setApoderadoData} />}

                <div className="form-actions form-actions-alumnos">
                  <button type="button" className="btn btn-secondary" onClick={limpiarFormulario} disabled={cargando}>Limpiar</button>
                  <button type="submit" className="btn btn-primary" disabled={cargando}>{cargando ? 'Guardando...' : 'Agregar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className={`column ${subTab === 'gestion' ? 'hidden-mobile' : ''}`}>
          <div className="card">
            <div className="card-header"><h3>Listado de Alumnos</h3></div>
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
