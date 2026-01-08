import React, { useState, useMemo, useEffect } from 'react';

function AsistenciaTab({ cursos, alumnosPorCurso }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [asistencia, setAsistencia] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [asistenciaGuardada, setAsistenciaGuardada] = useState({}); // Simula BD
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

  // Verificar si la fecha seleccionada es hoy
  const esHoy = fechaSeleccionada === new Date().toISOString().split('T')[0];

  // Alumnos del curso seleccionado
  const alumnosDelCurso = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return alumnosPorCurso[cursoSeleccionado] || [];
  }, [cursoSeleccionado, alumnosPorCurso]);

  const handleCursoChange = (cursoId, nombre = '') => {
    setCursoSeleccionado(cursoId);
    setCursoNombre(nombre);
    setMostrarLista(false);
    setAsistencia({});
  };

  const handleCargarLista = () => {
    if (!cursoSeleccionado || !fechaSeleccionada) {
      alert('Seleccione curso y fecha');
      return;
    }
    // Inicializar asistencia con "presente" por defecto
    const asistenciaInicial = {};
    alumnosDelCurso.forEach(alumno => {
      asistenciaInicial[alumno.id] = 'presente';
    });
    setAsistencia(asistenciaInicial);
    setMostrarLista(true);
  };

  const handleAsistenciaChange = (alumnoId, estado) => {
    setAsistencia(prev => ({
      ...prev,
      [alumnoId]: estado
    }));
  };

  const handleGuardarAsistencia = () => {
    // Crear clave unica para esta asistencia
    const clave = `${cursoSeleccionado}-${fechaSeleccionada}`;

    // Guardar en el estado (simula BD)
    setAsistenciaGuardada(prev => ({
      ...prev,
      [clave]: { ...asistencia }
    }));

    console.log('Asistencia guardada:', {
      curso_id: cursoSeleccionado,
      fecha: fechaSeleccionada,
      asistencia: asistencia
    });

    setModoEdicion(false);
    alert('Asistencia guardada exitosamente');
  };

  const handleModificarAsistencia = () => {
    if (!esHoy) {
      alert('Solo puede modificar la asistencia del dia de hoy');
      return;
    }

    if (!cursoSeleccionado) {
      alert('Seleccione un curso');
      return;
    }

    const clave = `${cursoSeleccionado}-${fechaSeleccionada}`;
    const asistenciaExistente = asistenciaGuardada[clave];

    if (!asistenciaExistente) {
      alert('No hay asistencia registrada para modificar en esta fecha');
      return;
    }

    // Cargar la asistencia existente
    setAsistencia({ ...asistenciaExistente });
    setModoEdicion(true);
    setMostrarLista(true);
  };

  const limpiarFiltros = () => {
    setCursoSeleccionado('');
    setCursoNombre('');
    setFechaSeleccionada(new Date().toISOString().split('T')[0]);
    setMostrarLista(false);
    setAsistencia({});
    setModoEdicion(false);
  };

  // Formatear nombre del alumno: "Perez Silva P."
  const formatearNombreAlumno = (alumno) => {
    const nombresArr = alumno.nombres.split(' ');
    const apellidosArr = alumno.apellidos.split(' ');

    const primerApellido = apellidosArr[0] || '';
    const segundoApellido = apellidosArr[1] || '';
    const inicialPrimerNombre = nombresArr[0] ? `${nombresArr[0].charAt(0)}.` : '';

    return `${primerApellido} ${segundoApellido} ${inicialPrimerNombre}`.replace(/\s+/g, ' ').trim();
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-CL', options);
  };

  // Contar asistencia
  const contarAsistencia = () => {
    const conteo = { presente: 0, ausente: 0, tardio: 0, justificado: 0 };
    Object.values(asistencia).forEach(estado => {
      if (conteo[estado] !== undefined) {
        conteo[estado]++;
      }
    });
    return conteo;
  };

  const conteo = contarAsistencia();

  return (
    <div className="tab-panel active">
      {/* Filtros */}
      <div className="card">
        <div className="card-header">
          <h3>Registro de Asistencia</h3>
        </div>
        <div className="card-body">
          <div className="docente-asistencia-filtros">
            <div className="docente-asistencia-filtros-row">
              <div className="form-group">
                <label>Curso</label>
                {isMobile ? (
                  <div className="custom-select-container">
                    <div
                      className="custom-select-trigger"
                      onClick={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
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
                ) : (
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
                )}
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                />
              </div>
            </div>
            <div className="docente-filtros-actions">
              <button className="btn btn-secondary" onClick={limpiarFiltros}>
                Limpiar
              </button>
              <button className="btn btn-primary" onClick={handleCargarLista}>
                Cargar Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Asistencia */}
      {mostrarLista && (
        <div className="card" style={{ marginTop: '20px' }}>
          {!isMobile && (
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>
                Lista de Asistencia - {formatearFecha(fechaSeleccionada)}
                {modoEdicion && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#f59e0b', fontWeight: 'normal' }}>(Editando)</span>}
              </h3>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ color: '#10b981' }}>Presentes: {conteo.presente}</span>
                <span style={{ color: '#ef4444' }}>Ausentes: {conteo.ausente}</span>
                <span style={{ color: '#f59e0b' }}>Tardios: {conteo.tardio}</span>
                <span style={{ color: '#3b82f6' }}>Justificados: {conteo.justificado}</span>
              </div>
            </div>
          )}
          <div className="card-body">
            {isMobile && (
              <div className="docente-asistencia-info-movil">
                <p className="docente-asistencia-titulo-movil">
                  Lista de Asistencia - {formatearFecha(fechaSeleccionada)}
                  {modoEdicion && <span style={{ marginLeft: '6px', color: '#f59e0b' }}>(Editando)</span>}
                </p>
                <div className="docente-asistencia-conteo-movil">
                  <span style={{ color: '#10b981' }}>Presentes: {conteo.presente}</span>
                  <span style={{ color: '#ef4444' }}>Ausentes: {conteo.ausente}</span>
                  <span style={{ color: '#f59e0b' }}>Tardíos: {conteo.tardio}</span>
                  <span style={{ color: '#3b82f6' }}>Justificados: {conteo.justificado}</span>
                </div>
              </div>
            )}
            <div className="table-responsive">
              <table className="data-table docente-tabla-asistencia">
                <thead>
                  <tr>
                    <th style={{ width: '30px', textAlign: 'center' }}>N</th>
                    <th style={{ minWidth: isMobile ? '100px' : '200px' }}>Alumno</th>
                    <th style={{ width: isMobile ? '40px' : '80px', textAlign: 'center' }}>{isMobile ? 'P' : 'Presente'}</th>
                    <th style={{ width: isMobile ? '40px' : '80px', textAlign: 'center' }}>{isMobile ? 'A' : 'Ausente'}</th>
                    <th style={{ width: isMobile ? '40px' : '80px', textAlign: 'center' }}>{isMobile ? 'T' : 'Tardio'}</th>
                    <th style={{ width: isMobile ? '40px' : '80px', textAlign: 'center' }}>{isMobile ? 'J' : 'Justificado'}</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosDelCurso.map((alumno, index) => (
                    <tr key={alumno.id}>
                      <td style={{ textAlign: 'center' }}>{index + 1}</td>
                      <td>{formatearNombreAlumno(alumno)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="asistencia-radio">
                          <input
                            type="radio"
                            name={`asistencia-${alumno.id}`}
                            checked={asistencia[alumno.id] === 'presente'}
                            onChange={() => handleAsistenciaChange(alumno.id, 'presente')}
                          />
                          <span className="asistencia-circle presente"></span>
                        </label>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="asistencia-radio">
                          <input
                            type="radio"
                            name={`asistencia-${alumno.id}`}
                            checked={asistencia[alumno.id] === 'ausente'}
                            onChange={() => handleAsistenciaChange(alumno.id, 'ausente')}
                          />
                          <span className="asistencia-circle ausente"></span>
                        </label>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="asistencia-radio">
                          <input
                            type="radio"
                            name={`asistencia-${alumno.id}`}
                            checked={asistencia[alumno.id] === 'tardio'}
                            onChange={() => handleAsistenciaChange(alumno.id, 'tardio')}
                          />
                          <span className="asistencia-circle tardio"></span>
                        </label>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="asistencia-radio">
                          <input
                            type="radio"
                            name={`asistencia-${alumno.id}`}
                            checked={asistencia[alumno.id] === 'justificado'}
                            onChange={() => handleAsistenciaChange(alumno.id, 'justificado')}
                          />
                          <span className="asistencia-circle justificado"></span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="docente-asistencia-acciones">
              <button
                className="btn btn-secondary"
                onClick={handleModificarAsistencia}
                disabled={!esHoy}
                title={!esHoy ? 'Solo disponible para el dia de hoy' : 'Modificar asistencia guardada'}
              >
                {isMobile ? 'Modificar' : 'Modificar Asistencia'}
              </button>
              <button className="btn btn-primary" onClick={handleGuardarAsistencia}>
                {modoEdicion ? (isMobile ? 'Actualizar' : 'Actualizar Asistencia') : (isMobile ? 'Guardar' : 'Guardar Asistencia')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AsistenciaTab;
