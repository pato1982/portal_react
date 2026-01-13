import React from 'react';

// Componente de select nativo para desktop
export function SelectNativo({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select
        className="form-control"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.nombre}</option>
        ))}
      </select>
    </div>
  );
}

// Componente de select custom para movil
export function SelectMovil({
  label,
  value,
  valueName,
  onChange,
  options,
  placeholder,
  disabled,
  isOpen,
  onToggle,
  onClose
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="custom-select-container">
        <div
          className={`custom-select-trigger ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && onToggle()}
        >
          <span>{valueName || placeholder}</span>
          <span className="custom-select-arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && !disabled && (
          <div className="custom-select-options">
            <div className="custom-select-option" onClick={() => { onChange('', ''); onClose(); }}>
              {placeholder}
            </div>
            {options.map(opt => (
              <div
                key={opt.id}
                className={`custom-select-option ${value === opt.id.toString() ? 'selected' : ''}`}
                onClick={() => { onChange(opt.id, opt.nombre); onClose(); }}
              >
                {opt.nombre}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Panel de filtros completo
function FiltrosDocente({
  isMobile,
  cursos,
  asignaturas,
  cursoSeleccionado,
  cursoNombre,
  asignaturaSeleccionada,
  asignaturaNombre,
  trimestreSeleccionado,
  trimestreNombre,
  onCursoChange,
  onAsignaturaChange,
  onTrimestreChange,
  onAccion,
  accionTexto = 'Analizar',
  dropdownAbierto,
  setDropdownAbierto,
  mostrarTrimestre = true,
  columnas = '1fr 1fr 1fr auto'
}) {
  const trimestres = [
    { id: '1', nombre: 'Primero' },
    { id: '2', nombre: 'Segundo' },
    { id: '3', nombre: 'Tercero' }
  ];

  if (isMobile) {
    return (
      <>
        <div className="form-row-movil">
          <SelectMovil
            label="Curso"
            value={cursoSeleccionado}
            valueName={cursoNombre}
            onChange={onCursoChange}
            options={cursos}
            placeholder="Seleccionar..."
            isOpen={dropdownAbierto === 'curso'}
            onToggle={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
            onClose={() => setDropdownAbierto(null)}
          />
          <SelectMovil
            label="Asignatura"
            value={asignaturaSeleccionada}
            valueName={asignaturaNombre}
            onChange={onAsignaturaChange}
            options={asignaturas}
            placeholder={cursoSeleccionado ? 'Seleccionar...' : 'Seleccione curso'}
            disabled={!cursoSeleccionado}
            isOpen={dropdownAbierto === 'asignatura'}
            onToggle={() => setDropdownAbierto(dropdownAbierto === 'asignatura' ? null : 'asignatura')}
            onClose={() => setDropdownAbierto(null)}
          />
        </div>
        <div className="form-row-movil" style={{ alignItems: 'flex-end' }}>
          {mostrarTrimestre && (
            <SelectMovil
              label="Trimestre"
              value={trimestreSeleccionado}
              valueName={trimestreNombre}
              onChange={onTrimestreChange}
              options={trimestres}
              placeholder="Todos"
              isOpen={dropdownAbierto === 'trimestre'}
              onToggle={() => setDropdownAbierto(dropdownAbierto === 'trimestre' ? null : 'trimestre')}
              onClose={() => setDropdownAbierto(null)}
            />
          )}
          <div className="form-group">
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onAccion}>
              {accionTexto}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="docente-filtros-row" style={{ gridTemplateColumns: columnas }}>
      <SelectNativo
        label="Curso"
        value={cursoSeleccionado}
        onChange={(e) => {
          const curso = cursos.find(c => c.id.toString() === e.target.value);
          onCursoChange(e.target.value, curso?.nombre || '');
        }}
        options={cursos}
        placeholder="Seleccionar"
      />
      <SelectNativo
        label="Asignatura"
        value={asignaturaSeleccionada}
        onChange={(e) => {
          const asig = asignaturas.find(a => a.id.toString() === e.target.value);
          onAsignaturaChange(e.target.value, asig?.nombre || '');
        }}
        options={asignaturas}
        placeholder={cursoSeleccionado ? 'Seleccionar' : 'Primero seleccione un curso'}
        disabled={!cursoSeleccionado}
      />
      {mostrarTrimestre && (
        <SelectNativo
          label="Trimestre"
          value={trimestreSeleccionado}
          onChange={(e) => {
            const nombres = { '1': 'Primero', '2': 'Segundo', '3': 'Tercero' };
            onTrimestreChange(e.target.value, nombres[e.target.value] || '');
          }}
          options={trimestres}
          placeholder="Todos"
        />
      )}
      <div className="docente-filtros-actions">
        <button className="btn btn-primary" onClick={onAccion}>
          {accionTexto}
        </button>
      </div>
    </div>
  );
}

export default FiltrosDocente;
