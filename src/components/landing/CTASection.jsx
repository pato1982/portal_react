import React from 'react';

function CTASection({ onIrARegistro, onIrALogin }) {
  return (
    <section className="cta-final">
      <div className="section-container">
        <h2>Comience a usar el Portal Estudiantil</h2>
        <p>Unase a nuestra comunidad educativa digital y mantengase conectado con el progreso academico.</p>
        <div className="cta-actions">
          <button className="btn btn-white btn-lg" onClick={onIrARegistro}>Crear una Cuenta</button>
          <button className="btn btn-outline-white btn-lg" onClick={onIrALogin}>Ya tengo cuenta</button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
