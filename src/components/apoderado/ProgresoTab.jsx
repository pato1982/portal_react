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
        console.log('[DEBUG ProgresoTab] Fetching progreso from:', urlProgreso);
        const resProgreso = await fetch(urlProgreso);
        const dataProgreso = await resProgreso.json();

        console.log('[DEBUG ProgresoTab] Respuesta API progreso:', dataProgreso);

        if (dataProgreso.success) {
          console.log('[DEBUG ProgresoTab] Datos recibidos:', dataProgreso.data);
          console.log('[DEBUG ProgresoTab] Asignaturas:', dataProgreso.data.asignaturas);
          console.log('[DEBUG ProgresoTab] PromediosPorAsignatura:', dataProgreso.data.promediosPorAsignatura);
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

  // Grafico moderno de promedios por asignatura
  useEffect(() => {
    if (!chartAsignaturasRef.current || !datosProgreso) return;

    if (chartAsignaturasInstance.current) {
      chartAsignaturasInstance.current.destroy();
    }

    const { asignaturas, promediosPorAsignatura } = datosProgreso;

    if (!asignaturas || asignaturas.length === 0) return;

    // Función para abreviar asignaturas según dispositivo
    const abreviarAsignatura = (nombre, corto = false) => {
      if (!nombre) return '';
      const mapCorto = {
        'Matemáticas': 'Mat',
        'Lenguaje y Comunicación': 'Len',
        'Lenguaje': 'Len',
        'Historia, Geografía y Ciencias Sociales': 'His',
        'Historia': 'His',
        'Ciencias Naturales': 'C.N',
        'Ciencias': 'Cie',
        'Educación Física y Salud': 'E.F',
        'Educación Física': 'E.F',
        'Artes Visuales': 'Art',
        'Artes': 'Art',
        'Música': 'Mús',
        'Tecnología': 'Tec',
        'Inglés': 'Ing',
        'Orientación': 'Ori',
        'Religión': 'Rel',
        'Química': 'Quí',
        'Física': 'Fís',
        'Biología': 'Bio'
      };
      const mapLargo = {
        'Matemáticas': 'Matemát.',
        'Lenguaje y Comunicación': 'Lenguaje',
        'Lenguaje': 'Lenguaje',
        'Historia, Geografía y Ciencias Sociales': 'Historia',
        'Historia': 'Historia',
        'Ciencias Naturales': 'Cs. Nat.',
        'Ciencias': 'Ciencias',
        'Educación Física y Salud': 'Ed. Física',
        'Educación Física': 'Ed. Física',
        'Artes Visuales': 'Artes V.',
        'Artes': 'Artes',
        'Música': 'Música',
        'Tecnología': 'Tecnol.',
        'Inglés': 'Inglés',
        'Orientación': 'Orient.',
        'Religión': 'Religión',
        'Química': 'Química',
        'Física': 'Física',
        'Biología': 'Biología'
      };

      const map = corto ? mapCorto : mapLargo;
      if (map[nombre]) return map[nombre];

      return corto ? nombre.substring(0, 3) : (nombre.length > 8 ? nombre.substring(0, 7) + '.' : nombre);
    };

    const timer = setTimeout(() => {
      if (!chartAsignaturasRef.current) return;

      const ctx = chartAsignaturasRef.current.getContext('2d');
      if (!ctx) return;

      // Labels según dispositivo
      const labels = asignaturas.map(a => abreviarAsignatura(a, isMobile));
      const data = asignaturas.map(asig => promediosPorAsignatura[asig] || 0);

      // Crear gradientes para cada barra
      const createGradient = (ctx, nota) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        if (nota >= 6.0) {
          gradient.addColorStop(0, '#34d399');
          gradient.addColorStop(1, '#059669');
        } else if (nota >= 5.0) {
          gradient.addColorStop(0, '#60a5fa');
          gradient.addColorStop(1, '#2563eb');
        } else if (nota >= 4.0) {
          gradient.addColorStop(0, '#fbbf24');
          gradient.addColorStop(1, '#d97706');
        } else {
          gradient.addColorStop(0, '#f87171');
          gradient.addColorStop(1, '#dc2626');
        }
        return gradient;
      };

      const backgroundColors = data.map(nota => createGradient(ctx, nota));

      // Plugin para mostrar notas encima de las barras
      const notasEncimaPlugin = {
        id: 'notasEncima',
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          const meta = chart.getDatasetMeta(0);

          let fontSize = isMobile ? 9 : (isTablet ? 10 : 12);

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          meta.data.forEach((bar, index) => {
            const nota = data[index];
            if (nota && nota > 0) {
              const x = bar.x;
              const y = bar.y - 8;

              // Fondo redondeado para la nota
              const text = nota.toFixed(1);
              ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
              const textWidth = ctx.measureText(text).width;

              // Pill background
              const pillPadding = isMobile ? 4 : 6;
              const pillHeight = fontSize + 6;
              const pillWidth = textWidth + (pillPadding * 2);
              const pillX = x - pillWidth / 2;
              const pillY = y - pillHeight + 2;

              // Color del pill según nota
              let pillColor = nota >= 6.0 ? '#059669' : (nota >= 5.0 ? '#2563eb' : (nota >= 4.0 ? '#d97706' : '#dc2626'));

              ctx.fillStyle = pillColor;
              ctx.beginPath();
              ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 4);
              ctx.fill();

              // Texto blanco
              ctx.fillStyle = '#ffffff';
              ctx.fillText(text, x, y);
            }
          });

          ctx.restore();
        }
      };

      chartAsignaturasInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Promedio',
            data: data,
            backgroundColor: backgroundColors,
            borderRadius: {
              topLeft: 8,
              topRight: 8,
              bottomLeft: 0,
              bottomRight: 0
            },
            borderSkipped: false,
            barPercentage: isMobile ? 0.7 : 0.65,
            categoryPercentage: isMobile ? 0.85 : 0.8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 800,
            easing: 'easeOutQuart'
          },
          layout: {
            padding: {
              top: 30
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleFont: {
                size: 13,
                weight: '600',
                family: "'Segoe UI', system-ui, sans-serif"
              },
              bodyFont: {
                size: 12,
                family: "'Segoe UI', system-ui, sans-serif"
              },
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                title: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex;
                  return asignaturas[index];
                },
                label: (context) => {
                  const nota = context.parsed.y;
                  let estado = nota >= 6.0 ? 'Excelente' : (nota >= 5.0 ? 'Bueno' : (nota >= 4.0 ? 'Suficiente' : 'Insuficiente'));
                  return [`Promedio: ${nota.toFixed(1)}`, `Estado: ${estado}`];
                }
              }
            }
          },
          scales: {
            y: {
              min: 1,
              max: 7.5,
              ticks: {
                stepSize: 1,
                font: {
                  size: isMobile ? 10 : 11,
                  family: "'Segoe UI', system-ui, sans-serif"
                },
                color: '#64748b',
                callback: (value) => value <= 7 ? value : ''
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)',
                drawBorder: false
              },
              border: {
                display: false
              }
            },
            x: {
              ticks: {
                font: {
                  size: isMobile ? 9 : (isTablet ? 10 : 11),
                  weight: '500',
                  family: "'Segoe UI', system-ui, sans-serif"
                },
                color: '#475569',
                maxRotation: isMobile ? 45 : 0,
                minRotation: isMobile ? 45 : 0
              },
              grid: {
                display: false
              },
              border: {
                display: false
              }
            }
          }
        },
        plugins: [notasEncimaPlugin]
      });

      chartAsignaturasInstance.current.resize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (chartAsignaturasInstance.current) {
        chartAsignaturasInstance.current.destroy();
        chartAsignaturasInstance.current = null;
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
        
        .progreso-layout {
          display: flex;
          gap: 20px;
          align-items: stretch; /* ESTIRAR hijos para igualar altura */
          width: 100%;
          min-height: 480px; /* Altura mínima base para alinear */
        }
        
        /* Los contenedores de gráficos (Columna Izq y Der) */
        .progreso-layout > .card {
          flex: 1; 
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        
        .progreso-layout > .card .card-body {
          flex: 1; /* Ocupar todo el espacio vertical disponible en la card */
          display: flex; /* Para centrar contenido si es necesario */
          flex-direction: column;
          position: relative;
          min-height: 400px; /* Asegurar altura interna para el gráfico */
          padding: 10px; /* Resetear padding si es necesario */
        }

        /* Contenedor central de KPIs en Desktop */
        .progreso-kpis-central {
          width: 280px; 
          flex-shrink: 0;
          display: flex;
          flex-direction: row; 
          gap: 15px;
          align-items: stretch; /* Estirar columnas internas */
        }

        /* Columnas internas de KPIs */
        .kpis-columna {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between; /* Distribuir verticalmente (Arriba, Medio, Abajo) */
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
          flex: 1; /* Cada KPI toma 1/3 de la altura disponible de su columna */
          max-height: 32%; /* Evitar que crezcan demasiado si hay poco contenido */
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
        
        /* Contenedor del Chart: Altura Absoluta para evitar colapso */
        .chart-container {
          position: relative;
          width: 100%;
          height: 100%; /* Llenar el card-body */
          min-height: 350px; /* Mínimo garantizado */
          flex-grow: 1;
        }
        
        /* Asegurar que el canvas funcione bien */
        .chart-container canvas {
           display: block;
           width: 100%;
           height: 100%;
        }


        /* --- TABLET (max-width: 1024px) --- */
        @media (max-width: 1024px) {
          .progreso-layout {
            flex-direction: column;
            align-items: normal; /* Reset stretch */
            gap: 20px; /* Restaurar gap */
          }
          
          .progreso-layout > .card {
            width: 100%;
            flex: none;
            min-height: auto; /* Dejar que la altura sea automática */
          }
          
          .progreso-layout > .card .card-body {
             min-height: 300px; /* Un poco menos alto en tablet */
          }

          .progreso-kpis-central {
            width: 100%;
            flex-direction: row; 
            justify-content: flex-start; /* Alinear al inicio para scroll */
            flex-wrap: nowrap;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 8px; /* Scrollbar space */
          }

          .kpis-columna {
             flex-direction: row; /* Deshacer columna vertical */
             gap: 10px;
             flex: none; /* No estirar, usar contenido */
             display: contents; /* 'contents' hace que los hijos directos (cards) sean hijos del grid/flex padre (kpis-central) */
          }

          /* Ajustar tarjetas individuales para tablet: TODOS IGUALES */
          .kpi-card-vertical {
            min-width: 120px; /* Ancho fijo mínimo */
            width: 120px;     /* Ancho fijo objetivo */
            flex: 0 0 auto;   /* No crecer, no encoger, base auto */
            padding: 10px 5px;
            height: auto;
            max-height: none;
            flex-direction: column; 
            text-align: center; 
            justify-content: center;
          }
          
          /* Icono visible en tablet pero arriba */
          .kpi-card-vertical .kpi-icon { 
             display: flex; 
             margin-bottom: 5px; 
             width: 32px; 
             height: 32px;
          }
          .kpi-icon svg { width: 18px; height: 18px; }

          .kpi-valor { font-size: 1.1rem; }
          .kpi-label { font-size: 0.7rem; }
        }


        /* --- MOBILE (max-width: 768px) --- */
        @media (max-width: 768px) {
          .progreso-kpis-central {
            flex-direction: column;
            overflow-x: visible;
            gap: 10px;
            display: flex; /* Restaurar flex normal, quitar 'contents' effect wrapper */
          }

          /* Reset de 'contents' en .kpis-columna para mobile si se usó arriba */
          .kpis-columna {
            display: flex;
            flex-direction: row;
            width: 100%;
            gap: 10px;
            flex: none;
          }

          .kpi-card-vertical {
            flex: 1; /* Volver a flex 1 para ocupar ancho equitativo */
            width: auto;
            min-width: 0;
            padding: 8px;
            flex-direction: row; /* Icono al lado */
            text-align: left;
            justify-content: flex-start;
          }

          .kpi-card-vertical .kpi-icon {
             margin-bottom: 0;
             margin-right: 8px;
          }

          .kpi-valor { font-size: 1rem; }
          .kpi-label { font-size: 0.65rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        }

        /* ========================================= */
        /* ESTILOS GRÁFICO MODERNO DE ASIGNATURAS   */
        /* ========================================= */

        .chart-asignaturas-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .chart-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px !important;
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .chart-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chart-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .chart-header-modern h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .chart-legend-mini {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 500;
          color: #64748b;
        }

        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-item.excelente .dot { background: linear-gradient(135deg, #34d399 0%, #059669 100%); }
        .legend-item.bueno .dot { background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%); }
        .legend-item.suficiente .dot { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); }
        .legend-item.insuficiente .dot { background: linear-gradient(135deg, #f87171 0%, #dc2626 100%); }

        .chart-asignaturas-card .card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 350px;
          padding: 15px;
        }

        .chart-container-modern {
          position: relative;
          width: 100%;
          flex: 1;
          min-height: 320px;
          height: 320px;
        }

        .chart-container-modern canvas {
          display: block;
          max-width: 100%;
        }

        /* --- Responsive Gráfico Moderno TABLET --- */
        @media (max-width: 1024px) {
          .chart-header-modern {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 16px !important;
          }

          .chart-legend-mini {
            width: 100%;
            justify-content: flex-start;
          }

          .chart-icon {
            width: 32px;
            height: 32px;
          }

          .chart-icon svg {
            width: 16px;
            height: 16px;
          }

          .chart-header-modern h3 {
            font-size: 0.9rem;
          }

          .chart-container-modern {
            min-height: 280px;
            height: 280px;
          }

          .chart-asignaturas-card .card-body {
            min-height: 300px;
          }
        }

        /* --- Responsive Gráfico Moderno MOBILE --- */
        @media (max-width: 768px) {
          .chart-header-modern {
            padding: 10px 12px !important;
          }

          .chart-title-wrapper {
            gap: 8px;
          }

          .chart-icon {
            width: 28px;
            height: 28px;
            border-radius: 8px;
          }

          .chart-icon svg {
            width: 14px;
            height: 14px;
          }

          .chart-header-modern h3 {
            font-size: 0.85rem;
          }

          .chart-legend-mini {
            gap: 8px;
          }

          .legend-item {
            font-size: 0.6rem;
            gap: 3px;
          }

          .legend-item .dot {
            width: 6px;
            height: 6px;
          }

          .chart-container-modern {
            min-height: 260px;
            height: 260px;
            padding: 8px;
          }

          .chart-asignaturas-card .card-body {
            min-height: 280px;
          }
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

        {/* Columna Derecha: Promedio por Asignatura - Moderno */}
        <div className="card chart-asignaturas-card">
          <div className="card-header chart-header-modern">
            <div className="chart-title-wrapper">
              <div className="chart-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3>Rendimiento por Asignatura</h3>
            </div>
            <div className="chart-legend-mini">
              <span className="legend-item excelente"><span className="dot"></span>6+</span>
              <span className="legend-item bueno"><span className="dot"></span>5+</span>
              <span className="legend-item suficiente"><span className="dot"></span>4+</span>
              <span className="legend-item insuficiente"><span className="dot"></span>&lt;4</span>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container-modern">
              <canvas ref={chartAsignaturasRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgresoTab;
