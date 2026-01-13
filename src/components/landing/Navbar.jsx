import React from 'react';

function Navbar({
  navbarShadow,
  menuMobileActivo,
  onToggleMenu,
  onCerrarMenu,
  onIrALogin,
  onIrARegistro
}) {
  return (
    <nav className={`landing-navbar ${navbarShadow ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <div className="nav-logo">
            <span className="logo-icon">E</span>
          </div>
          <span className="nav-title">Portal Estudiantil</span>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline" onClick={onIrALogin}>Iniciar Sesion</button>
          <button className="btn btn-primary" onClick={onIrARegistro}>Registrarse</button>
        </div>
        <button className="nav-toggle" onClick={onToggleMenu}>
          <span className={menuMobileActivo ? 'active' : ''}></span>
          <span className={menuMobileActivo ? 'active' : ''}></span>
          <span className={menuMobileActivo ? 'active' : ''}></span>
        </button>
      </div>
      {/* Menu movil */}
      <div className={`nav-mobile ${menuMobileActivo ? 'active' : ''}`}>
        <button className="btn btn-outline" onClick={() => { onCerrarMenu(); onIrALogin(); }}>Iniciar Sesion</button>
        <button className="btn btn-primary" onClick={() => { onCerrarMenu(); onIrARegistro(); }}>Registrarse</button>
      </div>
    </nav>
  );
}

export default Navbar;
