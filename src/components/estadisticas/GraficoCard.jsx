import React from 'react';

function GraficoCard({ titulo, badge, children }) {
  return (
    <div className="stats-grafico-card">
      <div className="stats-grafico-header">
        <h4>{titulo}</h4>
        <span className="stats-grafico-badge">{badge}</span>
      </div>
      <div className="stats-grafico-body">
        {children}
      </div>
    </div>
  );
}

export default GraficoCard;
