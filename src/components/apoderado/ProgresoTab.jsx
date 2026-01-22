import React, { useMemo, useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import config from '../../config/env';
import { useResponsive } from '../../hooks';

function ProgresoTab({ pupilo }) {
  const chartRendimientoRef = useRef(null);
  const chartAsignaturasRef = useRef(null);
  const chartRendimientoInstance = useRef(null);
  const chartAsignaturasInstance = useRef(null);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('todas');

  // Hook responsivo para tamaños de fuente
  const { isMobile, isTablet } = useResponsive();

  // Estados para datos de la API
  const [datosProgreso, setDatosProgreso] = useState(null);
  const [notasRaw, setNotasRaw] = useState([]); // Nuevas notas para calcular promedios dinámicos
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos de progreso cuando cambia el pupilo
  useEffect(() => {
    const cargarProgreso = async () => {
      if (!pupilo?.id) {
        setDatosProgreso(null);
        setNotasRaw([]);
        return;
      }

      setCargando(true);
      setError('');

      try {
        // 1. Cargar Progreso General
        const urlProgreso = `${config.apiBaseUrl}/apoderado/pupilo/${pupilo.id}/progreso`;
        const resProgreso = await fetch(urlProgreso);
        const dataProgreso = await resProgreso.json();

        if (dataProgreso.success) {
          setDatosProgreso(dataProgreso.data);
        } else {
          setError(dataProgreso.error || 'Error al cargar progreso');
        }

        // 2. Cargar Notas Detalladas (para filtrado por asignatura)
        const urlNotas = `${config.apiBaseUrl}/apoderado/pupilo/${pupilo.id}/notas`;
        const resNotas = await fetch(urlNotas);
        const dataNotas = await resNotas.json();

        if (dataNotas.success && Array.isArray(dataNotas.data)) {
          setNotasRaw(dataNotas.data);
        }

      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error de conexion');
      } finally {
        setCargando(false);
      }
    };

    cargarProgreso();
  }, [pupilo?.id]);

  // Estadisticas siempre globales (KPIs fijos)
  const estadisticasFiltradas = useMemo(() => {
    if (!datosProgreso) return null;

    const { estadisticas, promediosPorAsignatura } = datosProgreso;

    // Calcular promedios mas alto y mas bajo
    const promedios = Object.values(promediosPorAsignatura || {}).filter(val => val !== null);
    const promedioMaximo = promedios.length > 0 ? Math.max(...promedios) : 0;
    const promedioMinimo = promedios.length > 0 ? Math.min(...promedios) : 0;

    return {
      promedio: estadisticas.promedio,
      notaMaxima: promedioMaximo, // Ahora es Promedio + Alto
      notaMinima: promedioMinimo, // Ahora es Promedio + Bajo
      porcentajeAprobacion: estadisticas.porcentajeAprobacion,
      totalNotas: estadisticas.totalNotas,
      label: 'General'
    };
  }, [datosProgreso]);

  // Datos mensuales para el grafico
  const datosMensuales = useMemo(() => {
    if (!datosProgreso) return [];

    const mesesOrden = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Mar - Dic

    // CASO 1: Si es "todas", usar el pre-calculado del backend
    if (asignaturaSeleccionada === 'todas') {
      if (!datosProgreso.promediosMensuales) return [];
      const datos = [];
      mesesOrden.forEach(mes => {
        if (datosProgreso.promediosMensuales[mes] !== undefined) {
          datos.push(datosProgreso.promediosMensuales[mes]);
        } else {
          datos.push(null);
        }
      });
      return datos;
    }

    // CASO 2: Si hay una asignatura seleccionada, calcular desde notasRaw
    const datosCalculados = [];

    mesesOrden.forEach(mes => {
      // Filtrar notas de la asignatura y del mes correspondiente
      const notasDelMes = notasRaw.filter(n => {
        if (n.asignatura !== asignaturaSeleccionada) return false;
        if (!n.nota || n.es_pendiente) return false;

        // n.fecha viene como string "YYYY-MM-DD" o fecha completa
        const fecha = new Date(n.fecha || n.fecha_evaluacion);
        // getMonth() es 0-indexed (0=Enero, 2=Marzo). Sumamos 1.
        return (fecha.getMonth() + 1) === mes;
      });

      if (notasDelMes.length > 0) {
        const suma = notasDelMes.reduce((acc, curr) => acc + parseFloat(curr.nota), 0);
        const promedio = (suma / notasDelMes.length).toFixed(1);
        datosCalculados.push(parseFloat(promedio));
      } else {
        datosCalculados.push(null);
      }
    });

    return datosCalculados;
  }, [datosProgreso, notasRaw, asignaturaSeleccionada]);

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
              callback: function (value) {
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

    // Función simple para abreviar asignaturas
    const abreviarAsignatura = (nombre) => {
      if (!nombre) return '';
      const map = {
        'Matemáticas': 'Mat',
        'Lenguaje y Comunicación': 'Leng',
        'Lenguaje': 'Leng',
        'Historia, Geografía y Ciencias Sociales': 'Hist',
        'Historia': 'Hist',
        'Ciencias Naturales': 'C.Nat',
        'Ciencias': 'Cien',
        'Educación Física y Salud': 'Ed.Fís',
        'Educación Física': 'Ed.Fís',
        'Artes Visuales': 'Art',
        'Artes': 'Art',
        'Música': 'Mús',
        'Tecnología': 'Tec',
        'Inglés': 'Ing',
        'Orientación': 'Ori',
        'Religión': 'Rel',
        'Química': 'Quím',
        'Física': 'Fís',
        'Biología': 'Biol'
      };
      // Si está en el mapa, devolver abreviatura
      if (map[nombre]) return map[nombre];

      // Si no, intentar abreviar algorítmicamente (primeras 3 letras o iniciales si es muy largo)
      if (nombre.length > 10) {
        return nombre.substring(0, 4) + '.';
      }
      return nombre;
    };

    const ctx = chartAsignaturasRef.current.getContext('2d');
    const labels = asignaturas.map(abreviarAsignatura); // Aplicar abreviatura
    const data = asignaturas.map(asig => promediosPorAsignatura[asig] || 0);

    const colors = asignaturas.map(asig => {
      const nota = promediosPorAsignatura[asig] || 0;
      if (nota >= 6.0) return '#10b981';
      if (nota >= 5.0) return '#3b82f6';
      if (nota >= 4.0) return '#f59e0b';
      return '#ef4444';
    });

    // Plugin para mostrar notas dentro de las barras
    const notasEnBarrasPlugin = {
      id: 'notasEnBarras',
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);

        // Tamaño de fuente según dispositivo
        let fontSize = 11; // Desktop
        if (isMobile) {
          fontSize = 8;
        } else if (isTablet) {
          fontSize = 9;
        }

        ctx.save();
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        meta.data.forEach((bar, index) => {
          const nota = data[index];
          if (nota && nota > 0) {
            const x = bar.x;
            const y = bar.y + (bar.height / 2);

            // Solo mostrar si la barra es suficientemente alta
            if (bar.height > 15) {
              ctx.fillText(nota.toFixed(1), x, y);
            }
          }
        });

        ctx.restore();
      }
    };

    chartAsignaturasInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels, // Usar labels abreviados
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
          },
          tooltip: {
            callbacks: {
              // Mostrar nombre completo en el tooltip
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                return asignaturas[index];
              }
            }
          }
        },
        scales: {
          y: {
            min: 1,
            max: 8,
            ticks: {
              stepSize: 1,
              callback: function (value) {
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
      plugins: [notasEnBarrasPlugin]
    });

    return () => {
      if (chartAsignaturasInstance.current) {
        chartAsignaturasInstance.current.destroy();
      }
    };
  }, [datosProgreso, isMobile, isTablet]);

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
      <style>{`
        /* --- ESTILOS GENERALES (DESKTOP) --- */
        /* Objetivo Desktop: 3 filas de 2 KPIs (2 columnas verticales de 3) */
        
        .progreso-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          width: 100%;
        }
        
        /* Los gráficos ocupan el espacio disponible */
        .progreso-layout > .card {
          flex: 1; 
          min-width: 0; /* Prevenir desbordamiento flex */
        }

        /* Contenedor central de KPIs en Desktop: Row para poner las dos columnas lado a lado */
        .progreso-kpis-central {
          width: 280px; /* Ancho fijo para mantener proporción */
          flex-shrink: 0;
          display: flex;
          flex-direction: row; /* Columna 1 | Columna 2 */
          gap: 15px;
        }

        /* Cada columna de KPIs es vertical en Desktop */
        .kpis-columna {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        /* Tarjeta individual de KPI */
        .kpi-card-vertical {
          background: #fff;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          height: 100%; /* Llenar altura si es necesario */
        }

        .kpi-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Colores de iconos */
        .kpi-icon.promedio { background: #eff6ff; color: #3b82f6; }
        .kpi-icon.asistencia { background: #f0fdf4; color: #10b981; }
        .kpi-icon.ranking { background: #f3e8ff; color: #8b5cf6; }
        .kpi-icon.aprobacion { background: #fff7ed; color: #f97316; }
        .kpi-icon.mejor { background: #ecfeff; color: #06b6d4; }
        .kpi-icon.menor { background: #fff1f2; color: #f43f5e; }

        .kpi-data {
          display: flex;
          flex-direction: column;
        }

        .kpi-valor {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.2;
          color: #1e293b;
        }

        .kpi-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }
        
        /* Contenedor explícito para el Chart para evitar colapso */
        .chart-container {
          position: relative;
          height: 300px; 
          width: 100%;
        }


        /* --- TABLET (max-width: 1024px) --- */
        /* Objetivo: Mantener lo que al usuario le gustó (Horizontal scroll / strip) */
        @media (max-width: 1024px) {
          .progreso-layout {
            flex-direction: column;
          }
          
          .progreso-layout > .card {
            width: 100%;
            flex: none;
          }

          .progreso-kpis-central {
            width: 100%;
            flex-direction: row; 
            justify-content: space-between;
            flex-wrap: nowrap;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 5px;
          }

          .kpis-columna {
             flex-direction: row;
             gap: 10px;
             flex: 1;
          }

          /* Ajustes de tamaño Tablet */
          .kpi-card-vertical {
            min-width: 90px;
            padding: 10px 8px;
            flex: 1; /* Distribuir espacio */
          }
          
          .kpi-icon { width: 32px; height: 32px; }
          .kpi-icon svg { width: 18px; height: 18px; }
          .kpi-valor { font-size: 1.1rem; }
          .kpi-label { font-size: 0.7rem; }
          .kpi-card-vertical .kpi-icon { display: none; } /* Opcional: Ocultar icono en tablet si falta espacio, o dejarlo */
          .kpi-card-vertical { flex-direction: column; text-align: center; justify-content: center; } /* Vertical layout dentro de la card para ahorrar ancho */
        }
        
        /* Restaurar icono visible si se prefiere */
        @media (max-width: 1024px) {
           .kpi-card-vertical .kpi-icon { display: flex; margin-bottom: 5px; }
        }


        /* --- MOBILE (max-width: 768px) --- */
        /* Objetivo: 2 filas de 3 KPIs */
        /* Estructura DOM: [Columna1 (3 items)] [Columna2 (3 items)] */
        /* Para lograr 2 filas (la de arriba y la de abajo), necesitamos que 
           Columna1 sea la Fila 1 y Columna2 sea la Fila 2. */
           
        @media (max-width: 768px) {
          .progreso-kpis-central {
            flex-direction: column; /* Apilar los contenedores Columna1 y Columna2 verticalmente */
            overflow-x: visible; /* Quitar scroll horizontal de tablet */
            gap: 10px;
          }

          .kpis-columna {
            flex-direction: row; /* Items dentro de la columna se ponen uno al lado del otro */
            width: 100%;
            gap: 10px;
          }

          .kpi-card-vertical {
            flex: 1; /* Cada card ocupa 1/3 del ancho */
            min-width: 0; /* Permitir encoger */
            padding: 8px;
          }

          .kpi-valor { font-size: 1rem; }
          .kpi-label { font-size: 0.65rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        }

      `}</style>
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
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
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
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
                  <polyline points="20 6 9 17 4 12" />
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
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div className="kpi-data">
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas?.notaMaxima || 0)}`}>
                  {(estadisticasFiltradas?.notaMaxima || 0).toFixed(1)}
                </span>
                <span className="kpi-label">Promedio + Alto</span>
              </div>
            </div>

            <div className="kpi-card-vertical">
              <div className="kpi-icon menor">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
              </div>
              <div className="kpi-data">
                <span className={`kpi-valor ${getNotaClass(estadisticasFiltradas?.notaMinima || 0)}`}>
                  {(estadisticasFiltradas?.notaMinima || 0).toFixed(1)}
                </span>
                <span className="kpi-label">Promedio + Bajo</span>
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
