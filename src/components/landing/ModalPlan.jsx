import React from 'react';

function ModalPlan({ plan, activo, onCerrar, onContactar }) {
  if (!plan) return null;

  const { nombre, precio, promo, headerClass, secciones } = plan;

  const renderItem = (item, index) => {
    if (typeof item === 'string') {
      return <li key={index}>{item}</li>;
    }

    const className = item.destacado ? 'feature-destacado' : item.premium ? 'feature-premium' : '';
    return <li key={index} className={className}>{item.text}</li>;
  };

  return (
    <div
      className={`modal-footer-overlay ${activo ? 'active' : ''}`}
      onClick={onCerrar}
    >
      <div className="modal-footer-contenido modal-plan" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-footer-header ${headerClass}`}>
          <div className="modal-plan-header-top">
            <h2>Plan {nombre}</h2>
            <div className="modal-plan-precio-box">
              <span className="modal-plan-precio">{precio}</span>
              <span className="modal-plan-periodo">/ alumno al año</span>
            </div>
          </div>
          <div className="modal-plan-promo-banner">
            <span className="promo-icon">🎁</span>
            <span className="promo-text">{promo.toUpperCase()}</span>
            <span className="promo-sub">para establecimientos nuevos</span>
          </div>
          <button className="modal-footer-cerrar" onClick={onCerrar}>&times;</button>
        </div>
        <div className="modal-footer-body">
          {secciones.map((seccion, idx) => (
            <div className="modal-plan-seccion" key={idx}>
              <h3>{seccion.titulo}</h3>
              <ul>
                {seccion.items.map((item, itemIdx) => renderItem(item, itemIdx))}
              </ul>
            </div>
          ))}
        </div>
        <div className="modal-footer-pie">
          <button className="btn btn-primary" onClick={onContactar}>Contáctanos</button>
        </div>
      </div>
    </div>
  );
}

export default ModalPlan;
