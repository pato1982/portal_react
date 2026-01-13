import React from 'react';
import { FeatureIcons } from './icons';

function FeatureCard({ tipo, titulo, descripcion, items, iconPosition = 'left' }) {
  const icon = FeatureIcons[tipo];

  const contenido = (
    <div className="feature-content">
      <h3>{titulo}</h3>
      <p className="feature-description">{descripcion}</p>
      <ul className="feature-list">
        {items.map((item, index) => (
          <li key={index}>
            <span className="check-icon">&#10003;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const iconElement = (
    <div className="feature-icon">
      {icon}
    </div>
  );

  return (
    <div className={`feature-card feature-${tipo}`}>
      {iconPosition === 'left' ? (
        <>
          {iconElement}
          {contenido}
        </>
      ) : (
        <>
          {contenido}
          {iconElement}
        </>
      )}
    </div>
  );
}

export default FeatureCard;
