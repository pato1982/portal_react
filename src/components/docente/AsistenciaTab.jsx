import React, { useState, useEffect, useMemo } from 'react';
import { useResponsive, useDropdown } from '../../hooks';
import { SelectNativo, SelectMovil } from './shared';
import config from '../../config/env';

// Componente radio para asistencia
const AsistenciaRadio = ({ alumnoId, estado, estadoActual, onChange, disabled }) => (
  <td style={{ textAlign: 'center' }}>
    <label className="asistencia-radio">
      <input
        type="radio"
        name={`asistencia-${alumnoId}`}
        checked={estadoActual === estado}
        onChange={() => onChange(alumnoId, estado)}
        disabled={disabled}
      />
      <span className={`asistencia-circle ${estado}`}></span>
    </label>
  </td>
);

// Modal para justificacion
const ModalJustificacion = ({ isOpen, onClose, onConfirm, alumnoNombre }) => {
  const [comentario, setComentario] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!comentario.trim()) {
      alert('Debe ingresar un comentario para la justificacion');
      return;
    }
    onConfirm(comentario);
    setComentario('');
  };

  const handleClose = () => {
    setComentario('');
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b' }}>
          Justificar Asistencia
        </h3>
        <p style={{ color: '#64748b', marginBottom: '16px' }}>
          Alumno: <strong>{alumnoNombre}</strong>
        </p>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Motivo de la justificacion:
          </label>
          <textarea
            className="form-control"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Ingrese el motivo de la justificacion..."
            rows={4}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

function AsistenciaTab({ docenteId, establecimientoId, usuarioId }) {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [asistencia, setAsistencia] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [asistenciaExistente, setAsistenciaExistente] = useState(false);

  // Modal de justificacion
  const [modalJustificacion, setModalJustificacion] = useState({
    isOpen: false,
    alumnoId: null,
    alumnoNombre: ''
  });

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  // Fecha de hoy (solo lectura)
  const fechaHoy = new Date().toISOString().split('T')[0];

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
          setCursos(data.data);
        }
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      } finally {
        setCargandoCursos(false);
      }
    };

    cargarCursos();
  }, [docenteId, establecimientoId]);

  const handleCursoChange = (cursoId, nombre = '') => {
    setCursoSeleccionado(cursoId);
    setCursoNombre(nombre);
    setMostrarLista(false);
    setAsistencia({});
    setAsistenciaExistente(false);
  };

  const handleCargarLista = async () => {
    if (!cursoSeleccionado) {
      alert('Seleccione un curso');
      return;
    }

    setCargandoAlumnos(true);

    try {
      // Cargar alumnos del curso
      const responseAlumnos = await fetch(`${config.apiBaseUrl}/curso/${cursoSeleccionado}/alumnos`);
      const dataAlumnos = await responseAlumnos.json();

      if (!dataAlumnos.success) {
        alert('Error al cargar alumnos');
        return;
      }

      setAlumnos(dataAlumnos.data);

      // Verificar si ya existe asistencia para hoy
      const responseAsistencia = await fetch(
        `${config.apiBaseUrl}/asistencia/verificar/${cursoSeleccionado}/${fechaHoy}`
      );
      const dataAsistencia = await responseAsistencia.json();

      if (dataAsistencia.success && dataAsistencia.existe) {
        // Cargar asistencia existente
        const asistenciaInicial = {};
        dataAlumnos.data.forEach(alumno => {
          const registro = dataAsistencia.data[alumno.id];
          asistenciaInicial[alumno.id] = {
            estado: registro?.estado || 'presente',
            observacion: registro?.observacion || ''
          };
        });
        setAsistencia(asistenciaInicial);
        setAsistenciaExistente(true);
        setModoEdicion(false);
      } else {
        // Nueva asistencia - todos presentes por defecto
        const asistenciaInicial = {};
        dataAlumnos.data.forEach(alumno => {
          asistenciaInicial[alumno.id] = {
            estado: 'presente',
            observacion: ''
          };
        });
        setAsistencia(asistenciaInicial);
        setAsistenciaExistente(false);
        setModoEdicion(true);
      }

      setMostrarLista(true);
    } catch (error) {
      console.error('Error al cargar lista:', error);
      alert('Error al cargar la lista');
    } finally {
      setCargandoAlumnos(false);
    }
  };

  const handleAsistenciaChange = (alumnoId, estado) => {
    if (estado === 'justificado') {
      // Abrir modal para ingresar comentario
      const alumno = alumnos.find(a => a.id === alumnoId);
      setModalJustificacion({
        isOpen: true,
        alumnoId,
        alumnoNombre: `${alumno.nombres} ${alumno.apellidos}`
      });
    } else {
      setAsistencia(prev => ({
        ...prev,
        [alumnoId]: {
          estado,
          observacion: ''
        }
      }));
    }
  };

  const handleConfirmarJustificacion = (comentario) => {
    const { alumnoId } = modalJustificacion;
    setAsistencia(prev => ({
      ...prev,
      [alumnoId]: {
        estado: 'justificado',
        observacion: comentario
      }
    }));
    setModalJustificacion({ isOpen: false, alumnoId: null, alumnoNombre: '' });
  };

  const handleGuardarAsistencia = async () => {
    if (Object.keys(asistencia).length === 0) {
      alert('No hay asistencia para guardar');
      return;
    }

    setGuardando(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/asistencia/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establecimiento_id: establecimientoId,
          curso_id: cursoSeleccionado,
          fecha: fechaHoy,
          asistencia,
          registrado_por: usuarioId,
          docente_id: docenteId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Asistencia guardada exitosamente');
        setAsistenciaExistente(true);
        setModoEdicion(false);
      } else {
        alert(data.error || 'Error al guardar asistencia');
      }
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      alert('Error al guardar asistencia');
    } finally {
      setGuardando(false);
    }
  };

  const handleModificarAsistencia = () => {
    setModoEdicion(true);
  };

  const limpiarFiltros = () => {
    setCursoSeleccionado('');
    setCursoNombre('');
    setMostrarLista(false);
    setAsistencia({});
    setAlumnos([]);
    setModoEdicion(false);
    setAsistenciaExistente(false);
  };

  const formatearNombreAlumno = (alumno) => {
    const nombresArr = alumno.nombres.split(' ');
    const apellidosArr = alumno.apellidos.split(' ');
    const primerApellido = apellidosArr[0] || '';
    const segundoApellido = apellidosArr[1] || '';
    const inicialPrimerNombre = nombresArr[0] ? `${nombresArr[0].charAt(0)}.` : '';
    return `${primerApellido} ${segundoApellido} ${inicialPrimerNombre}`.replace(/\s+/g, ' ').trim();
  };

  const formatearFechaLarga = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const conteo = useMemo(() => {
    const c = { presente: 0, ausente: 0, tardio: 0, justificado: 0 };
    Object.values(asistencia).forEach(({ estado }) => {
      if (c[estado] !== undefined) c[estado]++;
    });
    return c;
  }, [asistencia]);

  const estados = ['presente', 'ausente', 'tardio', 'justificado'];

  return (
    <div className="tab-panel active">
      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header"><h3>Registro de Asistencia</h3></div>
        <div className="card-body" style={{ overflow: 'visible' }}>
          <div className="docente-asistencia-filtros">
            <div className="docente-asistencia-filtros-row">
              {cargandoCursos ? (
                <div className="form-group">
                  <label>Curso</label>
                  <div style={{ padding: '8px', color: '#64748b' }}>Cargando cursos...</div>
                </div>
              ) : isMobile ? (
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
              ) : (
                <SelectNativo
                  label="Curso"
                  value={cursoSeleccionado}
                  onChange={(e) => {
                    const curso = cursos.find(c => c.id.toString() === e.target.value);
                    handleCursoChange(e.target.value, curso?.nombre || '');
                  }}
                  options={cursos}
                  placeholder="Seleccionar"
                />
              )}
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaHoy}
                  disabled
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div className="docente-filtros-actions">
              <button className="btn btn-secondary" onClick={limpiarFiltros} style={{ height: '30px', fontSize: '13px', padding: '0 12px', display: 'flex', alignItems: 'center' }}>Limpiar</button>
              <button
                className="btn btn-primary"
                onClick={handleCargarLista}
                disabled={cargandoAlumnos || !cursoSeleccionado}
                style={{ height: '30px', fontSize: '13px', padding: '0 12px', display: 'flex', alignItems: 'center' }}
              >
                {cargandoAlumnos ? 'Cargando...' : 'Cargar Lista'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mostrarLista && (
        <div className="card" style={{ marginTop: '20px' }}>
          {!isMobile && (
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>
                Lista de Asistencia - {formatearFechaLarga(fechaHoy)}
                {asistenciaExistente && !modoEdicion && (
                  <span style={{ marginLeft: '10px', fontSize: '12px', color: '#10b981', fontWeight: 'normal' }}>(Guardada)</span>
                )}
                {modoEdicion && (
                  <span style={{ marginLeft: '10px', fontSize: '12px', color: '#f59e0b', fontWeight: 'normal' }}>(Editando)</span>
                )}
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
                  Lista de Asistencia - {formatearFechaLarga(fechaHoy)}
                  {asistenciaExistente && !modoEdicion && (
                    <span style={{ marginLeft: '6px', color: '#10b981' }}>(Guardada)</span>
                  )}
                  {modoEdicion && (
                    <span style={{ marginLeft: '6px', color: '#f59e0b' }}>(Editando)</span>
                  )}
                </p>
                <div className="docente-asistencia-conteo-movil">
                  <span style={{ color: '#10b981' }}>Presentes: {conteo.presente}</span>
                  <span style={{ color: '#ef4444' }}>Ausentes: {conteo.ausente}</span>
                  <span style={{ color: '#f59e0b' }}>Tardios: {conteo.tardio}</span>
                  <span style={{ color: '#3b82f6' }}>Justificados: {conteo.justificado}</span>
                </div>
              </div>
            )}
            {alumnos.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                No hay alumnos en este curso
              </div>
            ) : (
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
                    {alumnos.map((alumno, index) => (
                      <tr key={alumno.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          {formatearNombreAlumno(alumno)}
                          {asistencia[alumno.id]?.estado === 'justificado' && asistencia[alumno.id]?.observacion && (
                            <span
                              title={asistencia[alumno.id].observacion}
                              style={{ marginLeft: '8px', cursor: 'help', color: '#3b82f6' }}
                            >
                              (i)
                            </span>
                          )}
                        </td>
                        {estados.map(estado => (
                          <AsistenciaRadio
                            key={estado}
                            alumnoId={alumno.id}
                            estado={estado}
                            estadoActual={asistencia[alumno.id]?.estado}
                            onChange={handleAsistenciaChange}
                            disabled={!modoEdicion}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="docente-asistencia-acciones">
              {asistenciaExistente && !modoEdicion ? (
                <button className="btn btn-secondary" onClick={handleModificarAsistencia}>
                  {isMobile ? 'Modificar' : 'Modificar Asistencia'}
                </button>
              ) : null}
              {modoEdicion && (
                <button
                  className="btn btn-primary"
                  onClick={handleGuardarAsistencia}
                  disabled={guardando}
                >
                  {guardando
                    ? 'Guardando...'
                    : asistenciaExistente
                      ? (isMobile ? 'Actualizar' : 'Actualizar Asistencia')
                      : (isMobile ? 'Guardar' : 'Guardar Asistencia')
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Justificacion */}
      <ModalJustificacion
        isOpen={modalJustificacion.isOpen}
        onClose={() => setModalJustificacion({ isOpen: false, alumnoId: null, alumnoNombre: '' })}
        onConfirm={handleConfirmarJustificacion}
        alumnoNombre={modalJustificacion.alumnoNombre}
      />
    </div>
  );
}

export default AsistenciaTab;
