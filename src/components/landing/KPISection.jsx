import React from 'react';
import { KPIIcons } from './icons';

function KPISection({ kpis }) {
  return (
    <div className="kpis-container">
      {kpis.map((kpi, index) => (
        <div className="kpi-card" key={index}>
          <div className="kpi-icon">
            {KPIIcons[kpi.icono]}
          </div>
          <div className="kpi-content">
            <div className="kpi-number">{kpi.numero}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KPISection;
