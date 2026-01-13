import React from 'react';

function FormularioAlumnos({
  alumnos,
  cursos,
  onAlumnoChange,
  onAgregarAlumno,
  onEliminarAlumno,
  datosAutoLlenado,
  onAutoLlenar
}) {
  return (
    <>
      {datosAutoLlenado && (
        <button type="button" className="btn-autollenar" onClick={onAutoLlenar}>
          Auto-llenar (Demo)
        </button>
      )}
      {alumnos.map((alumno, index) => (
        <div key={index} className={`alumno-seccion ${index > 0 ? 'alumno-nuevo' : ''}`}>
          <div className="alumno-header">
            <div className="alumno-titulo">Alumno {index + 1}</div>
            {index > 0 && (
              <button
                type="button"
                className="btn-eliminar-alumno"
                onClick={() => onEliminarAlumno(index)}
              >
                x
              </button>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nombres *</label>
              <input
                type="text"
                value={alumno.nombres}
                onChange={(e) => onAlumnoChange(index, 'nombres', e.target.value)}
                placeholder="Nombres del alumno"
              />
            </div>
            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                value={alumno.apellidos}
                onChange={(e) => onAlumnoChange(index, 'apellidos', e.target.value)}
                placeholder="Apellidos del alumno"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>RUT *</label>
              <input
                type="text"
                value={alumno.rut}
                onChange={(e) => onAlumnoChange(index, 'rut', e.target.value)}
                placeholder="12.345.678-9"
                maxLength="12"
              />
            </div>
            <div className="form-group">
              <label>Curso *</label>
              <select
                value={alumno.curso}
                onChange={(e) => onAlumnoChange(index, 'curso', e.target.value)}
              >
                <option value="">Seleccione curso</option>
                {cursos.map((curso, i) => (
                  <option key={i} value={curso}>{curso}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <div className="agregar-alumno-container">
        <button type="button" className="btn-agregar-alumno" onClick={onAgregarAlumno}>
          <span className="btn-agregar-icon">+</span>
          <span>Agregar alumno</span>
        </button>
      </div>
    </>
  );
}

export default FormularioAlumnos;
