import React from 'react';

function FormularioDatos({
  formData,
  onChange,
  onRutChange,
  tipoUsuario,
  establecimientos,
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
      <div className="form-group form-group-full">
        <label htmlFor="nombres">Nombres y Apellidos *</label>
        <input
          type="text"
          id="nombres"
          name="nombres"
          value={formData.nombres}
          onChange={onChange}
          placeholder="Ej: Juan Perez Lopez"
        />
      </div>

      <div className="form-row form-row-rut-tel">
        <div className="form-group">
          <label htmlFor="rut">RUT *</label>
          <input
            type="text"
            id="rut"
            name="rut"
            value={formData.rut}
            onChange={onRutChange}
            placeholder="12.345.678-9"
            maxLength="12"
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Telefono *</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={onChange}
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      <div className="form-group form-group-full">
        <label htmlFor="correo">Correo electronico *</label>
        <input
          type="email"
          id="correo"
          name="correo"
          value={formData.correo}
          onChange={onChange}
          placeholder="ejemplo@correo.cl"
        />
      </div>

      {tipoUsuario === 'administrador' && (
        <div className="form-group">
          <label htmlFor="establecimiento">Establecimiento *</label>
          <select
            id="establecimiento"
            name="establecimiento"
            value={formData.establecimiento}
            onChange={onChange}
          >
            <option value="">Seleccione un establecimiento</option>
            {establecimientos.map((est, index) => (
              <option key={index} value={est}>{est}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

export default FormularioDatos;
