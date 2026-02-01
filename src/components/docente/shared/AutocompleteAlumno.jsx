import React, { useState, useEffect, useMemo } from 'react';

function AutocompleteAlumno({
  alumnos,
  alumnoSeleccionado,
  busqueda,
  onBusquedaChange,
  onSeleccionar,
  disabled,
  placeholder = 'Buscar alumno...',
  label = 'Alumno',
  mostrarLabel = true,
  onDropdownOpen
}) {
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.docente-autocomplete-container')) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alumnosFiltrados = useMemo(() => {
    if (alumnoSeleccionado) return alumnos;
    if (!busqueda) return alumnos;
    const busquedaLower = busqueda.toLowerCase();
    return alumnos.filter(a =>
      `${a.nombres} ${a.apellidos}`.toLowerCase().includes(busquedaLower)
    );
  }, [alumnos, busqueda, alumnoSeleccionado]);

  const handleInputChange = (e) => {
    onBusquedaChange(e.target.value);
    setMostrarDropdown(true);
    if (onDropdownOpen) onDropdownOpen();
  };

  const handleFocus = () => {
    setMostrarDropdown(true);
    if (onDropdownOpen) onDropdownOpen();
  };

  const handleToggle = () => {
    if (!disabled) {
      setMostrarDropdown(!mostrarDropdown);
      if (!mostrarDropdown && onDropdownOpen) onDropdownOpen();
    }
  };

  const handleSeleccionar = (alumno) => {
    onSeleccionar(alumno);
    setMostrarDropdown(false);
  };

  return (
    <div className="form-group">
      {mostrarLabel && <label>{label}</label>}
      <div className="docente-autocomplete-container">
        <input
          type="text"
          className="form-control"
          placeholder={disabled ? 'Seleccione curso' : placeholder}
          value={busqueda}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className="docente-autocomplete-arrow"
          onClick={handleToggle}
          disabled={disabled}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {mostrarDropdown && alumnos.length > 0 && (
          <div className="docente-autocomplete-dropdown">
            {alumnosFiltrados.map(alumno => (
              <div
                key={alumno.id}
                className="docente-autocomplete-item"
                onClick={() => handleSeleccionar(alumno)}
              >
                {alumno.nombres} {alumno.apellidos}
              </div>
            ))}
            {alumnosFiltrados.length === 0 && (
              <div className="docente-autocomplete-item disabled">No se encontraron alumnos</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AutocompleteAlumno;
