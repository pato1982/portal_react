import React from 'react';

// Iconos SVG para los KPIs
const icons = {
  alumnos: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  aprobados: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  alerta: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  promedio: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  ),
  estrella: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  barras: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  )
};

function DocenteKPICard({ tipo, valor, label, trend, trendValue, variante = 'primary' }) {
  return (
    <div className={`docente-kpi-card kpi-${variante}`} style={{ padding: '12px', gap: '10px' }}>
      <div className="docente-kpi-icon" style={{ width: '36px', height: '36px' }}>
        {icons[tipo] || icons.promedio}
      </div>
      <div className="docente-kpi-data">
        <span className="docente-kpi-value" style={{ fontSize: '20px' }}>{valor}</span>
        {trend ? (
          <div className="docente-kpi-label-row" style={{ gap: '4px' }}>
            <span className="docente-kpi-label" style={{ fontSize: '11px' }}>{label}</span>
            <span className={`docente-kpi-trend ${trend}`} style={{ fontSize: '10px', padding: '1px 4px' }}>
              {trendValue}
            </span>
          </div>
        ) : (
          <span className="docente-kpi-label" style={{ fontSize: '11px' }}>{label}</span>
        )}
      </div>
    </div>
  );
}

export default DocenteKPICard;
