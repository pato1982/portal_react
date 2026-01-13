import React from 'react';
import { EmailIcon, WhatsAppIcon } from './icons';

function LandingFooter({
  onIrALogin,
  onIrARegistro,
  onAbrirPrivacidad,
  onAbrirTerminos
}) {
  return (
    <footer className="landing-footer" id="contacto">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">E</span>
          </div>
          <span>Portal Estudiantil</span>
        </div>
        <div className="footer-links">
          <div className="footer-links-row">
            <button onClick={onIrALogin}>Iniciar Sesion</button>
            <button onClick={onIrARegistro}>Registrarse</button>
          </div>
          <div className="footer-links-row">
            <button onClick={onAbrirPrivacidad}>Privacidad</button>
            <button onClick={onAbrirTerminos}>Condiciones y Terminos</button>
          </div>
        </div>
        <div className="footer-contacto">
          <h4>Contacto</h4>
          <div className="contacto-items">
            <a href="mailto:contacto.portalestudiantil@gmail.com" className="contacto-item">
              <EmailIcon />
              <span>contacto.portalestudiantil@gmail.com</span>
            </a>
            <a href="https://wa.me/56927899263" target="_blank" rel="noopener noreferrer" className="contacto-item">
              <WhatsAppIcon />
              <span>+56 9 2789 9263</span>
            </a>
          </div>
        </div>
        <div className="footer-copy">
          <p>2024 Sistema de Gestion Academica. Todos los derechos reservados.</p>
          <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
