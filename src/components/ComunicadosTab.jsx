import React, { useState, useEffect } from 'react';
import { cursosDB } from '../data/demoData';

function ComunicadosTab({ mostrarMensaje }) {
  const [formData, setFormData] = useState({
    tipoComunicado: '',
    tipoComunicadoNombre: '',
    modoCurso: '',
    modoCursoNombre: '',
    cursosSeleccionados: [],
    titulo: '',
    mensaje: ''
  });
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

  const tiposComunicado = [
    { id: 'informativo', nombre: 'Informativo' },
    { id: 'urgente', nombre: 'Urgente' },
    { id: 'reunion', nombre: 'Reunion' },
    { id: 'evento', nombre: 'Evento' }
  ];

  const modosCurso = [
    { id: 'todos', nombre: 'Todos los Cursos' },
    { id: 'especificos', nombre: 'Cursos Especificos' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCursoToggle = (cursoId) => {
    const nuevosSeleccionados = formData.cursosSeleccionados.includes(cursoId)
      ? formData.cursosSeleccionados.filter(id => id !== cursoId)
      : [...formData.cursosSeleccionados, cursoId];
    setFormData({ ...formData, cursosSeleccionados: nuevosSeleccionados });
  };

  const enviarComunicado = () => {
    if (!formData.titulo || !formData.mensaje) {
      mostrarMensaje('Error', 'Por favor complete todos los campos', 'error');
      return;
    }
    mostrarMensaje('Exito', 'Comunicado enviado correctamente (demo)', 'success');
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setFormData({
      tipoComunicado: '',
      tipoComunicadoNombre: '',
      modoCurso: '',
      modoCursoNombre: '',
      cursosSeleccionados: [],
      titulo: '',
      mensaje: ''
    });
  };

  return (
    <div className="tab-panel active">
      <div className="two-columns">
        {/* Columna Izquierda: Opciones del Comunicado */}
        <div className="column">
          <div className="card">
            <div className="card-header">
              <h3>Opciones del Comunicado</h3>
            </div>
            <div className="card-body">
              <div className="form-row form-row-filtros">
                <div className="form-group">
                  <label>Tipo de Comunicado</label>
                  {isMobile ? (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'tipo' ? null : 'tipo')}
                      >
                        <span>{formData.tipoComunicadoNombre || 'Seleccionar...'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'tipo' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'tipo' && (
                        <div className="custom-select-options">
                          <div
                            className="custom-select-option"
                            onClick={() => {
                              setFormData({ ...formData, tipoComunicado: '', tipoComunicadoNombre: '' });
                              setDropdownAbierto(null);
                            }}
                          >
                            Seleccionar...
                          </div>
                          {tiposComunicado.map(tipo => (
                            <div
                              key={tipo.id}
                              className={`custom-select-option ${formData.tipoComunicado === tipo.id ? 'selected' : ''}`}
                              onClick={() => {
                                setFormData({ ...formData, tipoComunicado: tipo.id, tipoComunicadoNombre: tipo.nombre });
                                setDropdownAbierto(null);
                              }}
                            >
                              {tipo.nombre}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      name="tipoComunicado"
                      value={formData.tipoComunicado}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar...</option>
                      {tiposComunicado.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label>Curso</label>
                  {isMobile ? (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'modoCurso' ? null : 'modoCurso')}
                      >
                        <span>{formData.modoCursoNombre || 'Seleccionar...'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'modoCurso' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'modoCurso' && (
                        <div className="custom-select-options">
                          <div
                            className="custom-select-option"
                            onClick={() => {
                              setFormData({ ...formData, modoCurso: '', modoCursoNombre: '', cursosSeleccionados: [] });
                              setDropdownAbierto(null);
                            }}
                          >
                            Seleccionar...
                          </div>
                          {modosCurso.map(modo => (
                            <div
                              key={modo.id}
                              className={`custom-select-option ${formData.modoCurso === modo.id ? 'selected' : ''}`}
                              onClick={() => {
                                setFormData({ ...formData, modoCurso: modo.id, modoCursoNombre: modo.nombre });
                                setDropdownAbierto(null);
                              }}
                            >
                              {modo.nombre}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      name="modoCurso"
                      value={formData.modoCurso}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar...</option>
                      {modosCurso.map(modo => (
                        <option key={modo.id} value={modo.id}>{modo.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {formData.modoCurso === 'especificos' && (
                <div className="cursos-grid-container" style={{ marginTop: '15px' }}>
                  <div className="checkbox-group checkbox-4-columnas">
                    {cursosDB.map(curso => (
                      <div key={curso.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`curso-com-${curso.id}`}
                          checked={formData.cursosSeleccionados.includes(curso.id)}
                          onChange={() => handleCursoToggle(curso.id)}
                        />
                        <label htmlFor={`curso-com-${curso.id}`}>{curso.nombre}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Redactar Comunicado */}
        <div className="column">
          <div className="card">
            <div className="card-header">
              <h3>Redactar Comunicado</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Titulo</label>
                <input
                  type="text"
                  className="form-control"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Ej: Reunion de apoderados"
                />
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea
                  className="form-control"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  rows="8"
                  placeholder="Escriba el comunicado aqui..."
                ></textarea>
              </div>
              <div className="form-actions form-actions-comunicados">
                <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>Limpiar</button>
                <button type="button" className="btn btn-primary" onClick={enviarComunicado}>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComunicadosTab;
