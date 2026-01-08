import React from 'react';

function InformacionTab({ pupilo, apoderado }) {
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="tab-panel active">
      <div className="info-section">
        {/* Datos del Alumno */}
        <div className="card">
          <div className="card-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Datos del Alumno
            </h3>
          </div>
          <div className="card-body">
            <div className="info-grid-4">
              <div className="info-field">
                <span className="info-label">Nombres</span>
                <span className="info-value">{pupilo.nombres}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Apellidos</span>
                <span className="info-value">{pupilo.apellidos}</span>
              </div>
              <div className="info-field">
                <span className="info-label">RUT</span>
                <span className="info-value">{pupilo.rut}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Curso</span>
                <span className="info-value">{pupilo.curso}</span>
              </div>
            </div>
            <div className="info-grid-4" style={{ marginTop: '16px' }}>
              <div className="info-field">
                <span className="info-label">Fecha de Nacimiento</span>
                <span className="info-value">{formatearFecha(pupilo.fechaNacimiento)}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Edad</span>
                <span className="info-value">{calcularEdad(pupilo.fechaNacimiento)} anos</span>
              </div>
              <div className="info-field">
                <span className="info-label">Email Institucional</span>
                <span className="info-value">{pupilo.email}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Estado</span>
                <span className="info-value info-value-badge">Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Datos del Apoderado */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Datos del Apoderado
            </h3>
          </div>
          <div className="card-body">
            <div className="info-grid-4">
              <div className="info-field">
                <span className="info-label">Nombre Completo</span>
                <span className="info-value">{apoderado.nombre} {apoderado.apellidos}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Parentesco</span>
                <span className="info-value">{apoderado.parentesco || 'No especificado'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Telefono</span>
                <span className="info-value">{apoderado.telefono}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Correo Electronico</span>
                <span className="info-value">{apoderado.email}</span>
              </div>
            </div>
            <div className="info-grid-4" style={{ marginTop: '16px' }}>
              <div className="info-field">
                <span className="info-label">RUT</span>
                <span className="info-value">{apoderado.rut}</span>
              </div>
              <div className="info-field info-field-wide">
                <span className="info-label">Direccion</span>
                <span className="info-value">{apoderado.direccion}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InformacionTab;
