import React from 'react';

function PlanCard({ tipo, plan, onVerDetalle }) {
  const { nombre, precio, periodo, promo, badge, badgeClass, featuresGrid } = plan;
  const isPrimary = tipo === 'intermedio';

  return (
    <div className={`plan-card plan-${tipo}`}>
      {badge && (
        <div className={`plan-badge ${badgeClass || ''}`}>{badge}</div>
      )}
      <div className="plan-header">
        <h3>{nombre}</h3>
        <div className="plan-precio">
          <span className="precio-valor">{precio}</span>
          <span className="precio-periodo">{periodo}</span>
        </div>
        <div className="plan-promo">{promo}</div>
      </div>
      <div className="plan-body">
        <ul className="plan-features dos-columnas">
          {featuresGrid.map((feature, index) => (
            <li key={index}><span className="check">&#10003;</span> {feature}</li>
          ))}
        </ul>
      </div>
      <div className="plan-footer">
        <button
          className={`btn ${isPrimary ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => onVerDetalle(tipo)}
        >
          Ver detalle
        </button>
      </div>
    </div>
  );
}

export default PlanCard;
