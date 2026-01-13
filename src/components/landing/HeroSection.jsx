import React from 'react';
import { FloatingCardIcons } from './icons';

function HeroSection({ onIrARegistro }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Bienvenido al <span className="highlight">Portal Estudiantil</span></h1>
        <p className="hero-subtitle">
          La plataforma integral que conecta a apoderados, docentes y administradores
          para un seguimiento academico eficiente y transparente.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onIrARegistro}>Comenzar Ahora</button>
        </div>
      </div>
      <div className="hero-image">
        <div className="hero-graphic">
          {/* Cubo 3D giratorio */}
          <div className="cube-container">
            <div className="cube">
              <div className="cube-face cube-front">
                <span className="cube-letra">E</span>
                <span className="cube-texto">Portal Estudiantil</span>
              </div>
              <div className="cube-face cube-back">
                <span className="cube-letra">E</span>
                <span className="cube-texto">Portal Estudiantil</span>
              </div>
              <div className="cube-face cube-right">
                <span className="cube-letra">E</span>
                <span className="cube-texto">Portal Estudiantil</span>
              </div>
              <div className="cube-face cube-left">
                <span className="cube-letra">E</span>
                <span className="cube-texto">Portal Estudiantil</span>
              </div>
              <div className="cube-face cube-top">
                <span className="cube-letra">E</span>
                <span className="cube-texto">Portal Estudiantil</span>
              </div>
              <div className="cube-face cube-bottom">
                <span className="cube-letra">E</span>
                <span className="cube-texto">Portal Estudiantil</span>
              </div>
            </div>
          </div>
          {/* Tarjetas flotantes */}
          <div className="graphic-card card-1">
            <div className="card-icon">{FloatingCardIcons.notas}</div>
            <span>Notas en linea</span>
          </div>
          <div className="graphic-card card-2">
            <div className="card-icon">{FloatingCardIcons.mobile}</div>
            <span>Acceso movil</span>
          </div>
          <div className="graphic-card card-3">
            <div className="card-icon">{FloatingCardIcons.comunicados}</div>
            <span>Comunicados</span>
          </div>
          <div className="graphic-card card-4">
            <div className="card-icon">{FloatingCardIcons.estadisticas}</div>
            <span>Estadisticas</span>
          </div>
          <div className="graphic-card card-5">
            <div className="card-icon">{FloatingCardIcons.apoderados}</div>
            <span>Apoderados</span>
          </div>
          <div className="graphic-card card-6">
            <div className="card-icon">{FloatingCardIcons.asistencias}</div>
            <span>Asistencias</span>
          </div>
          <div className="graphic-card card-7">
            <div className="card-icon">{FloatingCardIcons.matriculas}</div>
            <span>Matriculas</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
