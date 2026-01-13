import React from 'react';
import { BeneficioIcons } from './icons';

function BeneficiosSection({ beneficios }) {
  return (
    <section className="beneficios">
      <div className="section-container">
        <div className="section-header">
          <h2>Por que elegir nuestro Portal?</h2>
          <p>Tecnologia al servicio de la educacion</p>
        </div>
        <div className="beneficios-grid">
          {beneficios.map((beneficio, index) => (
            <div className="beneficio-item" key={index}>
              <div className="beneficio-icon">
                {BeneficioIcons[beneficio.icono]}
              </div>
              <h4>{beneficio.titulo}</h4>
              <p>{beneficio.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BeneficiosSection;
