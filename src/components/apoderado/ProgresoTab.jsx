import React, { useMemo, useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

function ProgresoTab({ notas, pupilo }) {
  const chartRendimientoRef = useRef(null);
  const chartAsignaturasRef = useRef(null);
  const chartRendimientoInstance = useRef(null);
  const chartAsignaturasInstance = useRef(null);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('todas');

  // Calcular estadisticas generales
  const estadisticas = useMemo(() => {
    if (notas.length === 0) return null;

    const totalNotas = notas.length;
    const sumaNotas = notas.reduce((acc, n) => acc + n.nota, 0);
    const promedio = sumaNotas / totalNotas;
    const notaMaxima = Math.max(...notas.map(n => n.nota));
    const notaMinima = Math.min(...notas.map(n => n.nota));
    const aprobadas = notas.filter(n => n.nota >= 4.0).length;
    const reprobadas = notas.filter(n => n.nota < 4.0).length;

    // Promedios por trimestre
    const promediosPorTrimestre = {};
    [1, 2, 3].forEach(trim => {
      const notasTrim = notas.filter(n => n.trimestre === trim);
      if (notasTrim.length > 0) {
        const suma = notasTrim.reduce((acc, n) => acc + n.nota, 0);
        promediosPorTrimestre[trim] = suma / notasTrim.length;
      }
    });

    // Promedios por asignatura
    const asignaturas = [...new Set(notas.map(n => n.asignatura))].sort();
    const promediosPorAsignatura = {};
    asignaturas.forEach(asig => {
      const notasAsig = notas.filter(n => n.asignatura === asig);
      const suma = notasAsig.reduce((acc, n) => acc + n.nota, 0);
      promediosPorAsignatura[asig] = suma / notasAsig.length;
    });

    return {
      totalNotas,
      promedio,
      notaMaxima,
      notaMinima,
      aprobadas,
      reprobadas,
      porcentajeAprobacion: (aprobadas / totalNotas) * 100,
      promediosPorTrimestre,
      promediosPorAsignatura,
      asignaturas
    };
  }, [notas]);

  // Estadisticas filtradas por asignatura seleccionada (para KPIs)
  const estadisticasFiltradas = useMemo(() => {
    if (!estadisticas) return null;

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

    // Filtrar notas por asignatura seleccionada
    const notasAsignatura = notas.filter(n => n.asignatura === asignaturaSeleccionada);

    if (notasAsignatura.length === 0) {
      return {
        promedio: 0,
        notaMaxima: 0,
        notaMinima: 0,
        porcentajeAprobacion: 0,
        totalNotas: 0,
        label: asignaturaSeleccionada
      };
    }

    const totalNotas = notasAsignatura.length;
    const sumaNotas = notasAsignatura.reduce((acc, n) => acc + n.nota, 0);
    const promedio = sumaNotas / totalNotas;
    const notaMaxima = Math.max(...notasAsignatura.map(n => n.nota));
    const notaMinima = Math.min(...notasAsignatura.map(n => n.nota));
    const aprobadas = notasAsignatura.filter(n => n.nota >= 4.0).length;
    const porcentajeAprobacion = (aprobadas / totalNotas) * 100;

    return {
      promedio,
      notaMaxima,
      notaMinima,
      porcentajeAprobacion,
      totalNotas,
      label: asignaturaSeleccionada
    };
  }, [estadisticas, asignaturaSeleccionada, notas]);

  // Datos mensuales por asignatura (demo)
  const datosMensualesPorAsignatura = useMemo(() => {
    // Datos demo para cada asignatura
    return {
      'todas': [5.8, 6.0, 6.2, 5.9, 6.1, 6.4, 6.3, 6.5, 6.2, 6.4],
      'Ciencias': [6.0, 6.2, 6.5, 6.3, 6.4, 6.8, 6.5, 6.7, 6.4, 6.6],
      'Historia': [5.2, 5.5, 5.8, 5.6, 5.7, 6.0, 5.9, 6.1, 5.8, 6.0],
      'Ingles': [6.5, 6.8, 7.0, 6.9, 7.0, 7.0, 6.8, 7.0, 6.9, 7.0],
      'Lenguaje': [5.5, 5.8, 6.0, 5.9, 6.0, 6.2, 6.1, 6.3, 6.0, 6.2],
      'Matematicas': [6.2, 6.5, 6.3, 6.4, 6.6, 6.8, 6.7, 6.9, 6.5, 6.7]
    };
  }, []);

  // Datos mensuales segun asignatura seleccionada
  const datosMensuales = useMemo(() => {
    return datosMensualesPorAsignatura[asignaturaSeleccionada] || datosMensualesPorAsignatura['todas'];
  }, [asignaturaSeleccionada, datosMensualesPorAsignatura]);

  // Calcular variaciones porcentuales
  const variaciones = useMemo(() => {
    const vars = [];
    for (let i = 1; i < datosMensuales.length; i++) {
      const variacion = ((datosMensuales[i] - datosMensuales[i - 1]) / datosMensuales[i - 1]) * 100;
      vars.push(variacion.toFixed(1));
    }
    return vars;
  }, [datosMensuales]);

  // Grafico de rendimiento mensual
  useEffect(() => {
    if (!chartRendimientoRef.current || !estadisticas) return;

    if (chartRendimientoInstance.current) {
      chartRendimientoInstance.current.destroy();
    }

    const ctx = chartRendimientoRef.current.getContext('2d');

    const meses = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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
          pointBorderWidth: 2
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
  }, [estadisticas, datosMensuales, variaciones, asignaturaSeleccionada]);

  // Grafico de promedios por asignatura
  useEffect(() => {
    if (!chartAsignaturasRef.current || !estadisticas) return;

    if (chartAsignaturasInstance.current) {
      chartAsignaturasInstance.current.destroy();
    }

    const ctx = chartAsignaturasRef.current.getContext('2d');

    const labels = estadisticas.asignaturas;
    const data = labels.map(asig => estadisticas.promediosPorAsignatura[asig]);

    const colors = labels.map(asig => {
      const nota = estadisticas.promediosPorAsignatura[asig];
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
  }, [estadisticas]);

  const getNotaClass = (nota) => {
    if (nota >= 6.0) return 'nota-excelente';
    if (nota >= 5.0) return 'nota-buena';
    if (nota >= 4.0) return 'nota-suficiente';
    return 'nota-insuficiente';
  };

  if (!estadisticas) {
    return (
      <div className="tab-panel active">
        <div className="progreso-vacio">
          <p>No hay datos suficientes para mostrar el progreso</p>
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
              {estadisticas.asignaturas.map(asig => (
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
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas.promedio)}`}>
                  {estadisticasFiltradas.promedio.toFixed(1)}
                </span>
                <span className="kpi-label">Promedio {estadisticasFiltradas.label}</span>
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
                <span className="kpi-valor">94%</span>
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
                <span className="kpi-valor">{estadisticasFiltradas.totalNotas}</span>
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
                <span className="kpi-valor">{estadisticasFiltradas.porcentajeAprobacion.toFixed(0)}%</span>
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
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas.notaMaxima)}`}>
                  {estadisticasFiltradas.notaMaxima.toFixed(1)}
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
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas.notaMinima)}`}>
                  {estadisticasFiltradas.notaMinima.toFixed(1)}
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
