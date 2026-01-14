import React, { useMemo, useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import config from '../../config/env';

function ProgresoTab({ pupilo }) {
  const chartRendimientoRef = useRef(null);
  const chartAsignaturasRef = useRef(null);
  const chartRendimientoInstance = useRef(null);
  const chartAsignaturasInstance = useRef(null);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('todas');

  // Estados para datos de la API
  const [datosProgreso, setDatosProgreso] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos de progreso cuando cambia el pupilo
  useEffect(() => {
    const cargarProgreso = async () => {
      if (!pupilo?.id) {
        setDatosProgreso(null);
        return;
      }

      setCargando(true);
      setError('');

      try {
        const url = `${config.apiBaseUrl}/apoderado/pupilo/${pupilo.id}/progreso`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setDatosProgreso(data.data);
        } else {
          setError(data.error || 'Error al cargar progreso');
        }
      } catch (err) {
        console.error('Error cargando progreso:', err);
        setError('Error de conexion');
      } finally {
        setCargando(false);
      }
    };

    cargarProgreso();
  }, [pupilo?.id]);

  // Estadisticas filtradas por asignatura seleccionada (para KPIs)
  const estadisticasFiltradas = useMemo(() => {
    if (!datosProgreso) return null;

    const { estadisticas, promediosPorAsignatura } = datosProgreso;

    // Si es "todas", usar estadisticas generales
    if (asignaturaSeleccionada === 'todas') {
      return {
        promedio: estadisticas.promedio,
        notaMaxima: estadisticas.notaMaxima,
        notaMinima: estadisticas.notaMinima,
        porcentajeAprobacion: estadisticas.porcentajeAprobacion,
        totalNotas: estadisticas.totalNotas,
        label: 'General'
      };
    }

    // Si hay datos de la asignatura seleccionada
    if (promediosPorAsignatura[asignaturaSeleccionada]) {
      return {
        promedio: promediosPorAsignatura[asignaturaSeleccionada],
        notaMaxima: estadisticas.notaMaxima, // Mantener general
        notaMinima: estadisticas.notaMinima, // Mantener general
        porcentajeAprobacion: estadisticas.porcentajeAprobacion, // Mantener general
        totalNotas: estadisticas.totalNotas, // Mantener general
        label: asignaturaSeleccionada
      };
    }

    return {
      promedio: 0,
      notaMaxima: 0,
      notaMinima: 0,
      porcentajeAprobacion: 0,
      totalNotas: 0,
      label: asignaturaSeleccionada
    };
  }, [datosProgreso, asignaturaSeleccionada]);

  // Datos mensuales para el grafico
  const datosMensuales = useMemo(() => {
    if (!datosProgreso || !datosProgreso.promediosMensuales) {
      return [];
    }

    const mesesOrden = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Mar - Dic
    const datos = [];

    mesesOrden.forEach(mes => {
      if (datosProgreso.promediosMensuales[mes] !== undefined) {
        datos.push(datosProgreso.promediosMensuales[mes]);
      } else {
        datos.push(null); // Sin datos para este mes
      }
    });

    return datos;
  }, [datosProgreso]);

  // Calcular variaciones porcentuales
  const variaciones = useMemo(() => {
    const vars = [];
    for (let i = 1; i < datosMensuales.length; i++) {
      if (datosMensuales[i] !== null && datosMensuales[i - 1] !== null) {
        const variacion = ((datosMensuales[i] - datosMensuales[i - 1]) / datosMensuales[i - 1]) * 100;
        vars.push(variacion.toFixed(1));
      } else {
        vars.push(null);
      }
    }
    return vars;
  }, [datosMensuales]);

  // Grafico de rendimiento mensual
  useEffect(() => {
    if (!chartRendimientoRef.current || !datosProgreso) return;

    if (chartRendimientoInstance.current) {
      chartRendimientoInstance.current.destroy();
    }

    const ctx = chartRendimientoRef.current.getContext('2d');
    const meses = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Filtrar datos validos
    const datosValidos = datosMensuales.filter(d => d !== null);

    if (datosValidos.length === 0) {
      return; // No hay datos para mostrar
    }

    // Plugin para mostrar variaciones
    const variacionPlugin = {
      id: 'variacionPlugin',
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);

        ctx.save();
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';

        for (let i = 1; i < meta.data.length; i++) {
          const current = meta.data[i];
          const previous = meta.data[i - 1];

          if (variaciones[i - 1] !== null) {
            const variacion = parseFloat(variaciones[i - 1]);
            const midX = (current.x + previous.x) / 2;
            const midY = (current.y + previous.y) / 2 - 12;

            if (variacion > 0) {
              ctx.fillStyle = '#10b981';
              ctx.fillText(`+${variacion}%`, midX, midY);
            } else if (variacion < 0) {
              ctx.fillStyle = '#ef4444';
              ctx.fillText(`${variacion}%`, midX, midY);
            } else {
              ctx.fillStyle = '#64748b';
              ctx.fillText(`0%`, midX, midY);
            }
          }
        }
        ctx.restore();
      }
    };

    chartRendimientoInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: asignaturaSeleccionada === 'todas' ? 'Promedio General' : asignaturaSeleccionada,
          data: datosMensuales,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0,
          pointRadius: 5,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          spanGaps: true // Conectar lineas aunque haya nulls
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            min: 1,
            max: 8,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value === 8 ? ' ' : value;
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      },
      plugins: [variacionPlugin]
    });

    return () => {
      if (chartRendimientoInstance.current) {
        chartRendimientoInstance.current.destroy();
      }
    };
  }, [datosProgreso, datosMensuales, variaciones, asignaturaSeleccionada]);

  // Grafico de promedios por asignatura
  useEffect(() => {
    if (!chartAsignaturasRef.current || !datosProgreso) return;

    if (chartAsignaturasInstance.current) {
      chartAsignaturasInstance.current.destroy();
    }

    const { asignaturas, promediosPorAsignatura } = datosProgreso;

    if (!asignaturas || asignaturas.length === 0) return;

    const ctx = chartAsignaturasRef.current.getContext('2d');
    const labels = asignaturas;
    const data = labels.map(asig => promediosPorAsignatura[asig] || 0);

    const colors = labels.map(asig => {
      const nota = promediosPorAsignatura[asig] || 0;
      if (nota >= 6.0) return '#10b981';
      if (nota >= 5.0) return '#3b82f6';
      if (nota >= 4.0) return '#f59e0b';
      return '#ef4444';
    });

    chartAsignaturasInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Promedio',
          data: data,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            min: 1,
            max: 8,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value === 8 ? ' ' : value;
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    return () => {
      if (chartAsignaturasInstance.current) {
        chartAsignaturasInstance.current.destroy();
      }
    };
  }, [datosProgreso]);

  const getNotaClass = (nota) => {
    if (nota >= 6.0) return 'nota-excelente';
    if (nota >= 5.0) return 'nota-buena';
    if (nota >= 4.0) return 'nota-suficiente';
    return 'nota-insuficiente';
  };

  // Si no hay pupilo seleccionado
  if (!pupilo) {
    return (
      <div className="tab-panel active">
        <div className="card">
          <div className="card-body text-center">
            <p style={{ color: '#64748b', padding: '40px 0' }}>
              No hay pupilo seleccionado. Seleccione un pupilo para ver su progreso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si esta cargando
  if (cargando) {
    return (
      <div className="tab-panel active">
        <div className="card">
          <div className="card-body text-center">
            <p style={{ color: '#64748b', padding: '40px 0' }}>
              Cargando progreso...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error
  if (error) {
    return (
      <div className="tab-panel active">
        <div className="card">
          <div className="card-body text-center">
            <p style={{ color: '#ef4444', padding: '40px 0' }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos
  if (!datosProgreso || datosProgreso.estadisticas.totalNotas === 0) {
    return (
      <div className="tab-panel active">
        <div className="progreso-vacio">
          <p>No hay datos suficientes para mostrar el progreso de {pupilo.nombres} {pupilo.apellidos}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-panel active">
      {/* Layout de 3 columnas */}
      <div className="progreso-layout">
        {/* Columna Izquierda: Rendimiento Mensual */}
        <div className="card">
          <div className="card-header card-header-con-filtro">
            <h3>Rendimiento Mensual</h3>
            <select
              className="filtro-asignatura"
              value={asignaturaSeleccionada}
              onChange={(e) => setAsignaturaSeleccionada(e.target.value)}
            >
              <option value="todas">Todas</option>
              {datosProgreso.asignaturas.map(asig => (
                <option key={asig} value={asig}>{asig}</option>
              ))}
            </select>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <canvas ref={chartRendimientoRef}></canvas>
            </div>
          </div>
        </div>

        {/* Columna Central: KPIs en 2 columnas */}
        <div className="progreso-kpis-central">
          <div className="kpis-columna">
            <div className="kpi-card-vertical">
              <div className="kpi-icon promedio">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="kpi-data">
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas?.promedio || 0)}`}>
                  {(estadisticasFiltradas?.promedio || 0).toFixed(1)}
                </span>
                <span className="kpi-label">Promedio {estadisticasFiltradas?.label}</span>
              </div>
            </div>

            <div className="kpi-card-vertical">
              <div className="kpi-icon asistencia">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="kpi-data">
                <span className="kpi-valor">{datosProgreso.asistencia.porcentaje.toFixed(0)}%</span>
                <span className="kpi-label">Asistencia</span>
              </div>
            </div>

            <div className="kpi-card-vertical">
              <div className="kpi-icon ranking">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div className="kpi-data">
                <span className="kpi-valor">{estadisticasFiltradas?.totalNotas || 0}</span>
                <span className="kpi-label">Total Notas</span>
              </div>
            </div>
          </div>

          <div className="kpis-columna">
            <div className="kpi-card-vertical">
              <div className="kpi-icon aprobacion">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="kpi-data">
                <span className="kpi-valor">{(estadisticasFiltradas?.porcentajeAprobacion || 0).toFixed(0)}%</span>
                <span className="kpi-label">Tasa Aprobacion</span>
              </div>
            </div>

            <div className="kpi-card-vertical">
              <div className="kpi-icon mejor">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <div className="kpi-data">
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas?.notaMaxima || 0)}`}>
                  {(estadisticasFiltradas?.notaMaxima || 0).toFixed(1)}
                </span>
                <span className="kpi-label">Nota Maxima</span>
              </div>
            </div>

            <div className="kpi-card-vertical">
              <div className="kpi-icon menor">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  <polyline points="17 18 23 18 23 12"/>
                </svg>
              </div>
              <div className="kpi-data">
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas?.notaMinima || 0)}`}>
                  {(estadisticasFiltradas?.notaMinima || 0).toFixed(1)}
                </span>
                <span className="kpi-label">Nota Minima</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Promedio por Asignatura */}
        <div className="card">
          <div className="card-header">
            <h3>Promedio por Asignatura</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <canvas ref={chartAsignaturasRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgresoTab;
