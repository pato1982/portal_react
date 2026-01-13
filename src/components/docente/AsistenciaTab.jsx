import React, { useState, useMemo } from 'react';
import { useResponsive, useDropdown } from '../../hooks';
import { SelectNativo, SelectMovil } from './shared';

// Componente radio para asistencia
const AsistenciaRadio = ({ alumnoId, estado, estadoActual, onChange }) => (
  <td style={{ textAlign: 'center' }}>
    <label className="asistencia-radio">
      <input
        type="radio"
        name={`asistencia-${alumnoId}`}
        checked={estadoActual === estado}
        onChange={() => onChange(alumnoId, estado)}
      />
      <span className={`asistencia-circle ${estado}`}></span>
    </label>
  </td>
);

function AsistenciaTab({ cursos, alumnosPorCurso }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [asistencia, setAsistencia] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [asistenciaGuardada, setAsistenciaGuardada] = useState({});

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  const esHoy = fechaSeleccionada === new Date().toISOString().split('T')[0];

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
    const asistenciaInicial = {};
    alumnosDelCurso.forEach(alumno => {
      asistenciaInicial[alumno.id] = 'presente';
    });
    setAsistencia(asistenciaInicial);
    setMostrarLista(true);
  };

  const handleAsistenciaChange = (alumnoId, estado) => {
    setAsistencia(prev => ({ ...prev, [alumnoId]: estado }));
  };

  const handleGuardarAsistencia = () => {
    const clave = `${cursoSeleccionado}-${fechaSeleccionada}`;
    setAsistenciaGuardada(prev => ({ ...prev, [clave]: { ...asistencia } }));
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
    Object.values(asistencia).forEach(estado => {
      if (c[estado] !== undefined) c[estado]++;
    });
    return c;
  }, [asistencia]);

  const estados = ['presente', 'ausente', 'tardio', 'justificado'];

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header"><h3>Registro de Asistencia</h3></div>
        <div className="card-body">
          <div className="docente-asistencia-filtros">
            <div className="docente-asistencia-filtros-row">
              {isMobile ? (
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
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                />
              </div>
            </div>
            <div className="docente-filtros-actions">
              <button className="btn btn-secondary" onClick={limpiarFiltros}>Limpiar</button>
              <button className="btn btn-primary" onClick={handleCargarLista}>Cargar Lista</button>
            </div>
          </div>
        </div>
      </div>

      {mostrarLista && (
        <div className="card" style={{ marginTop: '20px' }}>
          {!isMobile && (
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>
                Lista de Asistencia - {formatearFechaLarga(fechaSeleccionada)}
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
                  Lista de Asistencia - {formatearFechaLarga(fechaSeleccionada)}
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
                      {estados.map(estado => (
                        <AsistenciaRadio
                          key={estado}
                          alumnoId={alumno.id}
                          estado={estado}
                          estadoActual={asistencia[alumno.id]}
                          onChange={handleAsistenciaChange}
                        />
                      ))}
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
