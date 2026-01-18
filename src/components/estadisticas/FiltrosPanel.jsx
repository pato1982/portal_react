import React from 'react';

function FiltrosPanel({
  vistaActual,
  cursoSeleccionado,
  docenteSeleccionado,
  asignaturaSeleccionada,
  asignaturaDocenteSeleccionada,
  cursoAsistenciaSeleccionado,
  onVistaChange,
  onCursoChange,
  onDocenteChange,
  onAsignaturaChange,
  onAsignaturaDocenteChange,
  onCursoAsistenciaChange,
  datosPorCurso,
  datosPorDocente,
  datosPorAsignatura,
  datosAsistenciaPorCurso,
  isMobile,
  dropdownAbierto,
  setDropdownAbierto
}) {

  const renderSelect = (id, value, onChange, options, placeholder, disabled = false) => {
    return (
      <div className={`custom-select-container ${disabled ? 'disabled' : ''}`}>
        <div
          className="custom-select-trigger"
          onClick={() => !disabled && setDropdownAbierto(dropdownAbierto === id ? null : id)}
        >
          <span>{options.find(o => o.value === value)?.label || placeholder}</span>
          <span className="custom-select-arrow">{dropdownAbierto === id ? '▲' : '▼'}</span>
        </div>
        {dropdownAbierto === id && (
          <div className="custom-select-options">
            <div className="custom-select-option" onClick={() => { onChange(''); setDropdownAbierto(null); }}>
              {placeholder}
            </div>
            {options.map(opt => (
              <div
                key={opt.value}
                className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => { onChange(opt.value); setDropdownAbierto(null); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const vistaOptions = [
    { value: 'general', label: 'General del Establecimiento' },
    { value: 'curso', label: 'Por Curso' },
    { value: 'docente', label: 'Por Docente' },
    { value: 'asignatura', label: 'Por Asignatura' },
    { value: 'asistencia', label: 'Asistencia' }
  ];

  // Generar opciones usando los IDs como value y nombres como label
  const cursoOptions = Object.entries(datosPorCurso).map(([id, data]) => ({
    value: id.toString(),
    label: data.nombre || id
  }));

  const docenteOptions = Object.entries(datosPorDocente).map(([id, data]) => ({
    value: id.toString(),
    label: data.nombre || id
  }));

  const asignaturaOptions = Object.entries(datosPorAsignatura).map(([id, data]) => ({
    value: id.toString(),
    label: data.nombre || id
  }));

  const cursoAsistOptions = Object.entries(datosAsistenciaPorCurso).map(([id, data]) => ({
    value: id.toString(),
    label: data.nombre || id
  }));

  // Opciones de asignaturas para el docente seleccionado
  const getAsignaturaDocenteOptions = () => {
    if (!docenteSeleccionado || !datosPorDocente[docenteSeleccionado]) return [];
    const docente = datosPorDocente[docenteSeleccionado];

    // Si tiene asignaturasIds (del API), usarlos
    if (docente.asignaturasIds && docente.asignaturasIds.length > 0) {
      return docente.asignaturasIds.map(a => ({
        value: a.id.toString(),
        label: a.nombre
      }));
    }

    // Fallback: usar array de nombres
    if (docente.asignaturas && docente.asignaturas.length > 0) {
      return docente.asignaturas.map(a => ({
        value: a,
        label: a
      }));
    }

    return [];
  };

  return (
    <div className="stats-filtros-panel">
      <div className="stats-filtros-header">
        <h3>Panel de Estadisticas</h3>
        <p>Seleccione una vista para explorar los datos</p>
      </div>

      <div className="stats-filtros-grid">
        <div className="stats-filtros-row">
          {/* Selector de Vista */}
          <div className="stats-filtro-grupo">
            <label>Vista</label>
            {renderSelect('vista', vistaActual, onVistaChange, vistaOptions, 'Seleccionar...')}
          </div>

          {/* Filtro secundario segun vista */}
          {vistaActual === 'curso' && (
            <div className="stats-filtro-grupo">
              <label>Curso</label>
              {renderSelect('curso', cursoSeleccionado, onCursoChange, cursoOptions, 'Seleccionar curso...')}
            </div>
          )}

          {vistaActual === 'docente' && (
            <div className="stats-filtro-grupo">
              <label>Docente</label>
              {renderSelect('docente', docenteSeleccionado, onDocenteChange, docenteOptions, 'Seleccionar docente...')}
            </div>
          )}

          {vistaActual === 'asignatura' && (
            <div className="stats-filtro-grupo">
              <label>Asignatura</label>
              {renderSelect('asignatura', asignaturaSeleccionada, onAsignaturaChange, asignaturaOptions, 'Seleccionar asignatura...')}
            </div>
          )}

          {vistaActual === 'asistencia' && (
            <div className="stats-filtro-grupo">
              <label>Curso</label>
              {renderSelect('cursoAsist', cursoAsistenciaSeleccionado, onCursoAsistenciaChange, cursoAsistOptions, 'Todos los cursos')}
            </div>
          )}
        </div>

        {/* Fila 2: Tercer filtro (solo para docente) */}
        {vistaActual === 'docente' && docenteSeleccionado && (
          <div className="stats-filtros-row stats-filtros-row-segundo">
            <div className="stats-filtro-grupo">
              <label>Asignatura</label>
              {(() => {
                const asigOptions = getAsignaturaDocenteOptions();
                const isSingleAsig = asigOptions.length === 1;
                const currentValue = asignaturaDocenteSeleccionada || (isSingleAsig ? asigOptions[0]?.value : '');
                return renderSelect('asigDocente', currentValue, onAsignaturaDocenteChange, asigOptions, 'Seleccionar asignatura...', isSingleAsig);
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FiltrosPanel;
