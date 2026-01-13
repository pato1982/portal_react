import React from 'react';
import { EmailIcon } from './icons';

function ModalContacto({
  activo,
  onCerrar,
  formData,
  onChange,
  onSubmit
}) {
  return (
    <div
      className={`modal-footer-overlay ${activo ? 'active' : ''}`}
      onClick={onCerrar}
    >
      <div className="modal-footer-contenido modal-contacto" onClick={(e) => e.stopPropagation()}>
        <div className="modal-footer-header modal-contacto-header">
          <div className="modal-contacto-titulo">
            <EmailIcon size={24} color="currentColor" />
            <h2>Contactanos</h2>
          </div>
          <button className="modal-footer-cerrar" onClick={onCerrar}>&times;</button>
        </div>
        <div className="modal-footer-body">
          <form onSubmit={onSubmit} className="form-contacto">
            <div className="form-row-doble">
              <div className="form-group">
                <label htmlFor="nombre">Solicitante *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={onChange}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="establecimiento">Establecimiento *</label>
                <input
                  type="text"
                  id="establecimiento"
                  name="establecimiento"
                  value={formData.establecimiento}
                  onChange={onChange}
                  placeholder="Nombre del colegio"
                  required
                />
              </div>
            </div>
            <div className="form-row-doble form-row-tel-correo">
              <div className="form-group">
                <label htmlFor="telefono">Telefono *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={onChange}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="correo">Correo electronico *</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={onChange}
                  placeholder="ejemplo@correo.cl"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="consulta">Consulta *</label>
              <textarea
                id="consulta"
                name="consulta"
                value={formData.consulta}
                onChange={onChange}
                placeholder="Escriba su consulta o mensaje..."
                rows="5"
                required
              ></textarea>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={onCerrar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Enviar consulta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalContacto;
