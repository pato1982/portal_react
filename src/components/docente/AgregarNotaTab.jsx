import React, { useState, useEffect, useMemo } from 'react';
import { useResponsive, useDropdown } from '../../hooks';
import { SelectNativo, SelectMovil, AutocompleteAlumno } from './shared';
import config from '../../config/env';

function AgregarNotaTab({ docenteId, establecimientoId, usuarioId }) {
  // Estados para datos cargados desde API
  const [cursos, setCursos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [tiposEvaluacion, setTiposEvaluacion] = useState([]);
  const [notasRecientes, setNotasRecientes] = useState([]);

  // Estados del formulario
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [trimestre, setTrimestre] = useState('');
  const [trimestreNombre, setTrimestreNombre] = useState('');
  const [tipoEvaluacion, setTipoEvaluacion] = useState('');
  const [tipoEvaluacionNombre, setTipoEvaluacionNombre] = useState('');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [comentario, setComentario] = useState('');
  const [notaPendiente, setNotaPendiente] = useState(false);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');

  // Estados de carga
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cargandoAsignaturas, setCargandoAsignaturas] = useState(false);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [cargandoNotas, setCargandoNotas] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados para filtros de notas recientes
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroCursoNombre, setFiltroCursoNombre] = useState('');
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroAlumnoNombre, setFiltroAlumnoNombre] = useState('');
  const [alumnosFiltro, setAlumnosFiltro] = useState([]);

  const [pestanaActiva, setPestanaActiva] = useState('registro');

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  const trimestres = [
    { id: '1', nombre: '1er Trimestre' },
    { id: '2', nombre: '2do Trimestre' },
    { id: '3', nombre: '3er Trimestre' }
  ];

  // Cargar cursos del docente
  useEffect(() => {
    const cargarCursos = async () => {
      if (!docenteId || !establecimientoId) {
        setCargandoCursos(false);
        return;
      }

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/docente/${docenteId}/cursos?establecimiento_id=${establecimientoId}`
        );
        const data = await response.json();
        if (data.success) {
          setCursos(data.data || []);
        }
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      } finally {
        setCargandoCursos(false);
      }
    };

    cargarCursos();
  }, [docenteId, establecimientoId]);

  // Cargar tipos de evaluación
  useEffect(() => {
    const cargarTiposEvaluacion = async () => {
      if (!establecimientoId) return;

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/tipos-evaluacion?establecimiento_id=${establecimientoId}`
        );
        const data = await response.json();
        if (data.success) {
          setTiposEvaluacion(data.data || []);
        }
      } catch (error) {
        console.error('Error al cargar tipos de evaluación:', error);
      }
    };

    cargarTiposEvaluacion();
  }, [establecimientoId]);

  // Cargar asignaturas cuando se selecciona curso
  useEffect(() => {
    const cargarAsignaturas = async () => {
      if (!cursoSeleccionado || !docenteId || !establecimientoId) {
        setAsignaturas([]);
        return;
      }

      setCargandoAsignaturas(true);
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/docente/${docenteId}/asignaturas-por-curso/${cursoSeleccionado}?establecimiento_id=${establecimientoId}`
        );
        const data = await response.json();
        if (data.success) {
          setAsignaturas(data.data || []);
        }
      } catch (error) {
        console.error('Error al cargar asignaturas:', error);
      } finally {
        setCargandoAsignaturas(false);
      }
    };

    cargarAsignaturas();
  }, [cursoSeleccionado, docenteId, establecimientoId]);

  // Cargar alumnos cuando se selecciona curso
  useEffect(() => {
    const cargarAlumnos = async () => {
      if (!cursoSeleccionado) {
        setAlumnos([]);
        return;
      }

      setCargandoAlumnos(true);
      try {
        const response = await fetch(`${config.apiBaseUrl}/curso/${cursoSeleccionado}/alumnos`);
        const data = await response.json();
        if (data.success) {
          setAlumnos(data.data || []);
        }
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
      } finally {
        setCargandoAlumnos(false);
      }
    };

    cargarAlumnos();
  }, [cursoSeleccionado]);

  // Cargar notas recientes
  const cargarNotasRecientes = async (cursoId = null, alumnoId = null) => {
    if (!docenteId || !establecimientoId) return;

    setCargandoNotas(true);
    try {
      let url = `${config.apiBaseUrl}/docente/${docenteId}/notas-recientes?establecimiento_id=${establecimientoId}&limit=30`;
      if (cursoId) url += `&curso_id=${cursoId}`;
      if (alumnoId) url += `&alumno_id=${alumnoId}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setNotasRecientes(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar notas recientes:', error);
    } finally {
      setCargandoNotas(false);
    }
  };

  // Cargar notas recientes al inicio
  useEffect(() => {
    cargarNotasRecientes();
  }, [docenteId, establecimientoId]);

  // Cargar alumnos para filtro cuando se selecciona curso en filtros
  useEffect(() => {
    const cargarAlumnosFiltro = async () => {
      if (!filtroCurso) {
        setAlumnosFiltro([]);
        setFiltroAlumno('');
        setFiltroAlumnoNombre('');
        return;
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/curso/${filtroCurso}/alumnos`);
        const data = await response.json();
        if (data.success) {
          setAlumnosFiltro(data.data || []);
        }
      } catch (error) {
        console.error('Error al cargar alumnos para filtro:', error);
      }
    };

    cargarAlumnosFiltro();
  }, [filtroCurso]);

  // Aplicar filtros a notas recientes
  useEffect(() => {
    cargarNotasRecientes(filtroCurso || null, filtroAlumno || null);
  }, [filtroCurso, filtroAlumno]);

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
    setBusquedaAlumno(`${alumno.apellidos}, ${alumno.nombres}`);
  };

  const limpiarFormulario = () => {
    setCursoSeleccionado('');
    setCursoNombre('');
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setAlumnoSeleccionado('');
    setTrimestre('');
    setTrimestreNombre('');
    setTipoEvaluacion('');
    setTipoEvaluacionNombre('');
    setNota('');
    setFecha(new Date().toISOString().split('T')[0]);
    setComentario('');
    setNotaPendiente(false);
    setBusquedaAlumno('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cursoSeleccionado || !asignaturaSeleccionada || !alumnoSeleccionado || !trimestre) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (!notaPendiente && !nota) {
      alert('Debe ingresar una nota o marcar como pendiente');
      return;
    }

    if (!notaPendiente && (parseFloat(nota) < 1.0 || parseFloat(nota) > 7.0)) {
      alert('La nota debe estar entre 1.0 y 7.0');
      return;
    }

    setGuardando(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/notas/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establecimiento_id: establecimientoId,
          alumno_id: parseInt(alumnoSeleccionado),
          asignatura_id: parseInt(asignaturaSeleccionada),
          curso_id: parseInt(cursoSeleccionado),
          docente_id: docenteId,
          tipo_evaluacion_id: tipoEvaluacion ? parseInt(tipoEvaluacion) : null,
          trimestre: parseInt(trimestre),
          nota: notaPendiente ? null : parseFloat(nota),
          es_pendiente: notaPendiente,
          fecha_evaluacion: fecha,
          comentario: comentario || null
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Nota registrada exitosamente');
        limpiarFormulario();
        cargarNotasRecientes(filtroCurso || null, filtroAlumno || null);
      } else {
        alert(data.error || 'Error al registrar nota');
      }
    } catch (error) {
      console.error('Error al registrar nota:', error);
      alert('Error al registrar nota');
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL');
  };

  // Formulario movil
  const FormularioMovil = () => (
    <>
      <div className="form-row-movil">
        {cargandoCursos ? (
          <div className="form-group">
            <label>Curso</label>
            <div style={{ padding: '8px', color: '#64748b' }}>Cargando...</div>
          </div>
        ) : (
          <SelectMovil
            label="Curso"
            value={cursoSeleccionado}
            valueName={cursoNombre}
            onChange={handleCursoChange}
            options={cursos}
            placeholder="Seleccionar..."
            isOpen={dropdownAbierto === 'curso'}
            onToggle={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
            onClose={() => setDropdownAbierto(null)}
          />
        )}
        <SelectMovil
          label="Asignatura"
          value={asignaturaSeleccionada}
          valueName={asignaturaNombre}
          onChange={(id, nombre) => { setAsignaturaSeleccionada(id); setAsignaturaNombre(nombre); }}
          options={asignaturas}
          placeholder={cargandoAsignaturas ? 'Cargando...' : (cursoSeleccionado ? 'Seleccionar...' : 'Seleccione curso')}
          disabled={!cursoSeleccionado || cargandoAsignaturas}
          isOpen={dropdownAbierto === 'asignatura'}
          onToggle={() => setDropdownAbierto(dropdownAbierto === 'asignatura' ? null : 'asignatura')}
          onClose={() => setDropdownAbierto(null)}
        />
      </div>
      <div className="form-row-movil">
        <AutocompleteAlumno
          alumnos={alumnos}
          alumnoSeleccionado={alumnoSeleccionado}
          busqueda={busquedaAlumno}
          onBusquedaChange={(val) => { setBusquedaAlumno(val); setAlumnoSeleccionado(''); }}
          onSeleccionar={handleSeleccionarAlumno}
          disabled={!cursoSeleccionado || cargandoAlumnos}
          placeholder={cargandoAlumnos ? 'Cargando...' : 'Buscar...'}
          onDropdownOpen={() => setDropdownAbierto(null)}
        />
        <SelectMovil
          label="Trimestre"
          value={trimestre}
          valueName={trimestreNombre}
          onChange={(id, nombre) => { setTrimestre(id); setTrimestreNombre(nombre); }}
          options={trimestres}
          placeholder="Seleccionar..."
          isOpen={dropdownAbierto === 'trimestre'}
          onToggle={() => setDropdownAbierto(dropdownAbierto === 'trimestre' ? null : 'trimestre')}
          onClose={() => setDropdownAbierto(null)}
        />
      </div>
      <div className="form-row-movil">
        <SelectMovil
          label="Tipo Evaluacion"
          value={tipoEvaluacion}
          valueName={tipoEvaluacionNombre}
          onChange={(id, nombre) => { setTipoEvaluacion(id); setTipoEvaluacionNombre(nombre); }}
          options={tiposEvaluacion}
          placeholder="Seleccionar..."
          isOpen={dropdownAbierto === 'tipoEval'}
          onToggle={() => setDropdownAbierto(dropdownAbierto === 'tipoEval' ? null : 'tipoEval')}
          onClose={() => setDropdownAbierto(null)}
        />
        <div className="form-group">
          <label>Fecha</label>
          <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
      </div>
      <div className="form-row-movil">
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
  );

  // Formulario desktop
  const FormularioDesktop = () => (
    <>
      <div className="form-row form-row-tres">
        {cargandoCursos ? (
          <div className="form-group">
            <label>Curso</label>
            <div style={{ padding: '8px', color: '#64748b' }}>Cargando cursos...</div>
          </div>
        ) : (
          <SelectNativo
            label="Curso"
            value={cursoSeleccionado}
            onChange={(e) => {
              const curso = cursos.find(c => c.id.toString() === e.target.value);
              handleCursoChange(e.target.value, curso?.nombre || '');
            }}
            options={cursos}
            placeholder="Seleccionar curso"
          />
        )}
        <SelectNativo
          label="Asignatura"
          value={asignaturaSeleccionada}
          onChange={(e) => {
            const asig = asignaturas.find(a => a.id.toString() === e.target.value);
            setAsignaturaSeleccionada(e.target.value);
            setAsignaturaNombre(asig?.nombre || '');
          }}
          options={asignaturas}
          placeholder={cargandoAsignaturas ? 'Cargando...' : (cursoSeleccionado ? 'Seleccionar' : 'Primero seleccione curso')}
          disabled={!cursoSeleccionado || cargandoAsignaturas}
        />
        <AutocompleteAlumno
          alumnos={alumnos}
          alumnoSeleccionado={alumnoSeleccionado}
          busqueda={busquedaAlumno}
          onBusquedaChange={(val) => { setBusquedaAlumno(val); setAlumnoSeleccionado(''); }}
          onSeleccionar={handleSeleccionarAlumno}
          disabled={!cursoSeleccionado || cargandoAlumnos}
          placeholder={cargandoAlumnos ? 'Cargando...' : undefined}
        />
      </div>
      <div className="form-row form-row-cuatro">
        <SelectNativo
          label="Trimestre"
          value={trimestre}
          onChange={(e) => {
            setTrimestre(e.target.value);
            const nombres = { '1': '1er Trimestre', '2': '2do Trimestre', '3': '3er Trimestre' };
            setTrimestreNombre(nombres[e.target.value] || '');
          }}
          options={trimestres}
          placeholder="Seleccionar"
        />
        <SelectNativo
          label="Tipo Evaluacion"
          value={tipoEvaluacion}
          onChange={(e) => {
            const tipo = tiposEvaluacion.find(t => t.id.toString() === e.target.value);
            setTipoEvaluacion(e.target.value);
            setTipoEvaluacionNombre(tipo?.nombre || '');
          }}
          options={tiposEvaluacion}
          placeholder="Seleccionar"
        />
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
  );

  // Componente de Ultimas Notas
  const TablaUltimasNotas = () => (
    <div className="card">
      <div className="card-header">
        <h3>Ultimas Notas Registradas</h3>
      </div>
      <div className="card-body">
        {/* Filtros */}
        <div className="filtros-notas-recientes" style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {isMobile ? (
            <>
              <SelectMovil
                label="Filtrar por Curso"
                value={filtroCurso}
                valueName={filtroCursoNombre}
                onChange={(id, nombre) => { setFiltroCurso(id); setFiltroCursoNombre(nombre); setFiltroAlumno(''); setFiltroAlumnoNombre(''); }}
                options={cursos}
                placeholder="Todos los cursos"
                isOpen={dropdownAbierto === 'filtroCurso'}
                onToggle={() => setDropdownAbierto(dropdownAbierto === 'filtroCurso' ? null : 'filtroCurso')}
                onClose={() => setDropdownAbierto(null)}
              />
              {filtroCurso && (
                <SelectMovil
                  label="Filtrar por Alumno"
                  value={filtroAlumno}
                  valueName={filtroAlumnoNombre}
                  onChange={(id, nombre) => { setFiltroAlumno(id); setFiltroAlumnoNombre(nombre); }}
                  options={alumnosFiltro.map(a => ({ id: a.id, nombre: `${a.apellidos}, ${a.nombres}` }))}
                  placeholder="Todos los alumnos"
                  isOpen={dropdownAbierto === 'filtroAlumno'}
                  onToggle={() => setDropdownAbierto(dropdownAbierto === 'filtroAlumno' ? null : 'filtroAlumno')}
                  onClose={() => setDropdownAbierto(null)}
                />
              )}
            </>
          ) : (
            <>
              <div className="form-group" style={{ minWidth: '180px' }}>
                <label>Filtrar por Curso</label>
                <select
                  className="form-control"
                  value={filtroCurso}
                  onChange={(e) => { setFiltroCurso(e.target.value); setFiltroAlumno(''); }}
                >
                  <option value="">Todos los cursos</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              {filtroCurso && (
                <div className="form-group" style={{ minWidth: '200px' }}>
                  <label>Filtrar por Alumno</label>
                  <select
                    className="form-control"
                    value={filtroAlumno}
                    onChange={(e) => setFiltroAlumno(e.target.value)}
                  >
                    <option value="">Todos los alumnos</option>
                    {alumnosFiltro.map(a => (
                      <option key={a.id} value={a.id}>{a.apellidos}, {a.nombres}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tabla */}
        {cargandoNotas ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            Cargando notas...
          </div>
        ) : notasRecientes.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            No hay notas registradas
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Alumno</th>
                  {!isMobile && <th>Curso</th>}
                  <th>Asignatura</th>
                  <th>Trim.</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {notasRecientes.map(n => (
                  <tr key={n.id}>
                    <td>{formatearFecha(n.fecha_evaluacion)}</td>
                    <td>{n.alumno_apellidos}, {n.alumno_nombres?.split(' ')[0]}</td>
                    {!isMobile && <td>{n.curso_nombre}</td>}
                    <td>{isMobile ? n.asignatura_nombre?.substring(0, 10) : n.asignatura_nombre}</td>
                    <td style={{ textAlign: 'center' }}>{n.trimestre}°</td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: n.es_pendiente ? '#f59e0b' : (n.nota >= 4.0 ? '#10b981' : '#ef4444') }}>
                      {n.es_pendiente ? 'Pend.' : n.nota?.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="tab-panel active">
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
            Ultimas Notas
          </button>
        </div>
      )}

      <div className="two-columns">
        {(!isMobile || pestanaActiva === 'registro') && (
          <div className="column">
            <div className="card">
              <div className="card-header">
                <h3>Registro de Calificacion</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {isMobile ? <FormularioMovil /> : <FormularioDesktop />}

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
                    <button type="submit" className="btn btn-primary" disabled={guardando}>
                      {guardando ? 'Guardando...' : (isMobile ? 'Registrar' : 'Registrar Nota')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {(!isMobile || pestanaActiva === 'ultimas') && (
          <div className="column">
            <TablaUltimasNotas />
          </div>
        )}
      </div>
    </div>
  );
}

export default AgregarNotaTab;
