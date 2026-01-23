import React, { useMemo, useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import config from '../../config/env';
import { useResponsive } from '../../hooks';

// Registrar componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProgresoTab({ pupilo }) {
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('todas');

  // Hook responsivo para tamaños de pantalla
  const { isMobile, isTablet } = useResponsive();

  // Estados para datos de la API
  const [datosProgreso, setDatosProgreso] = useState(null);
  const [notasRaw, setNotasRaw] = useState([]);
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
        const urlProgreso = `${config.apiBaseUrl}/apoderado/pupilo/${pupilo.id}/progreso`;
        const resProgreso = await fetch(urlProgreso);
        const dataProgreso = await resProgreso.json();

        if (dataProgreso.success) {
          setDatosProgreso(dataProgreso.data);
        } else {
          setError(dataProgreso.error || 'Error al cargar progreso');
        }

        const urlNotas = `${config.apiBaseUrl}/apoderado/pupilo/${pupilo.id}/notas`;
        const resNotas = await fetch(urlNotas);
        const dataNotas = await resNotas.json();

        if (dataNotas.success && Array.isArray(dataNotas.data)) {
          setNotasRaw(dataNotas.data);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error de conexión');
      } finally {
        setCargando(false);
      }
    };

    cargarProgreso();
  }, [pupilo?.id]);

  // Estadísticas para KPIs
  const estadisticasFiltradas = useMemo(() => {
    if (!datosProgreso) return null;
    const { estadisticas, promediosPorAsignatura } = datosProgreso;
    const promedios = Object.values(promediosPorAsignatura || {}).filter(val => val !== null);

    return {
      promedio: estadisticas.promedio,
      notaMaxima: promedios.length > 0 ? Math.max(...promedios) : 0,
      notaMinima: promedios.length > 0 ? Math.min(...promedios) : 0,
      porcentajeAprobacion: estadisticas.porcentajeAprobacion,
      totalNotas: estadisticas.totalNotas
    };
  }, [datosProgreso]);

  // Datos para el gráfico de línea (Desempeño Mensual)
  const lineChartData = useMemo(() => {
    if (!datosProgreso) return null;

    const mesesLabels = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesesOrden = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let datasetsData = [];

    if (asignaturaSeleccionada === 'todas') {
      datasetsData = mesesOrden.map(m => datosProgreso.promediosMensuales[m] || null);
    } else {
      datasetsData = mesesOrden.map(mes => {
        const notasDelMes = notasRaw.filter(n => {
          if (n.asignatura !== asignaturaSeleccionada) return false;
          if (!n.nota || n.es_pendiente) return false;
          const fecha = new Date(n.fecha || n.fecha_evaluacion);
          return (fecha.getMonth() + 1) === mes;
        });
        if (notasDelMes.length > 0) {
          const suma = notasDelMes.reduce((acc, curr) => acc + parseFloat(curr.nota), 0);
          return parseFloat((suma / notasDelMes.length).toFixed(1));
        }
        return null;
      });
    }

    return {
      labels: mesesLabels,
      datasets: [{
        label: asignaturaSeleccionada === 'todas' ? 'Promedio General' : asignaturaSeleccionada,
        data: datasetsData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        spanGaps: true
      }]
    };
  }, [datosProgreso, notasRaw, asignaturaSeleccionada]);

  // Datos para el gráfico de barras (Promedio por Asignatura)
  const barChartData = useMemo(() => {
    if (!datosProgreso || !datosProgreso.asignaturas) return null;

    const { asignaturas, promediosPorAsignatura } = datosProgreso;

    // Función para abreviar asignaturas
    const abreviar = (nombre) => {
      const map = {
        'Matemáticas': 'Mat', 'Lenguaje y Comunicación': 'Len', 'Lenguaje': 'Len',
        'Historia, Geografía y Ciencias Sociales': 'His', 'Historia': 'His',
        'Ciencias Naturales': 'Cs.Nat', 'Educación Física y Salud': 'E.Fís',
        'Educación Física': 'E.Fís', 'Artes Visuales': 'Artes', 'Inglés': 'Ing'
      };
      if (isMobile && map[nombre]) return map[nombre];
      return nombre.length > 10 ? nombre.substring(0, 8) + '...' : nombre;
    };

    const labels = asignaturas.map(a => abreviar(a));
    const values = asignaturas.map(asig => parseFloat(promediosPorAsignatura[asig] || 0).toFixed(1));
    const colors = values.map(v => {
      if (v >= 6.0) return '#10b981';
      if (v >= 5.0) return '#3b82f6';
      if (v >= 4.0) return '#f59e0b';
      return '#ef4444';
    });

    return {
      labels,
      datasets: [{
        label: 'Promedio',
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
        barPercentage: 0.6
      }]
    };
  }, [datosProgreso, isMobile]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { min: 1, max: 7, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  const getNotaClass = (nota) => {
    if (nota >= 6.0) return 'nota-excelente';
    if (nota >= 5.0) return 'nota-buena';
    if (nota >= 4.0) return 'nota-suficiente';
    return 'nota-insuficiente';
  };

  if (!pupilo) return <div className="tab-panel active"><div className="card-body">Seleccione un pupilo.</div></div>;
  if (cargando) return <div className="tab-panel active"><div className="card-body">Cargando...</div></div>;
  if (error) return <div className="tab-panel active"><div className="card-body" style={{ color: 'red' }}>{error}</div></div>;
  if (!datosProgreso || datosProgreso.estadisticas.totalNotas === 0) {
    return <div className="tab-panel active"><div className="card-body">No hay datos suficientes para {pupilo.nombres}.</div></div>;
  }

  return (
    <div className="tab-panel active" style={{ padding: '20px' }}>
      <style>{`
        .progreso-grid { display: grid; grid-template-columns: 1fr 280px 1fr; gap: 20px; min-height: 450px; }
        @media (max-width: 1024px) { .progreso-grid { grid-template-columns: 1fr; } }
        .kpi-col { display: flex; flex-direction: column; gap: 15px; justify-content: center; }
        .kpi-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; }
        .kpi-val { font-size: 24px; font-weight: bold; }
        .chart-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; }
        .chart-header { padding: 15px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .chart-body { flex: 1; min-height: 300px; padding: 20px; position: relative; }
        .nota-excelente { color: #059669; } .nota-buena { color: #2563eb; } .nota-suficiente { color: #d97706; } .nota-insuficiente { color: #dc2626; }
      `}</style>

      <div className="progreso-grid">
        {/* Gráfico Mensual */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Rendimiento Mensual</h3>
            <select
              value={asignaturaSeleccionada}
              onChange={e => setAsignaturaSeleccionada(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="todas">Todas</option>
              {datosProgreso.asignaturas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="chart-body">
            {lineChartData && <Line data={lineChartData} options={chartOptions} />}
          </div>
        </div>

        {/* KPIs Centrales */}
        <div className="kpi-col">
          <div className="kpi-card">
            <div className={`kpi-val ${getNotaClass(estadisticasFiltradas.promedio)}`}>{parseFloat(estadisticasFiltradas.promedio).toFixed(1)}</div>
            <div style={{ color: '#64748b' }}>Promedio General</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val" style={{ color: '#10b981' }}>{estadisticasFiltradas.porcentajeAprobacion.toFixed(0)}%</div>
            <div style={{ color: '#64748b' }}>Aprobación</div>
          </div>
          <div className="kpi-card">
            <div className={`kpi-val ${getNotaClass(estadisticasFiltradas.notaMaxima)}`}>{estadisticasFiltradas.notaMaxima.toFixed(1)}</div>
            <div style={{ color: '#64748b' }}>Mejor Promedio</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val" style={{ color: '#3b82f6' }}>{datosProgreso.asistencia.porcentaje.toFixed(0)}%</div>
            <div style={{ color: '#64748b' }}>Asistencia</div>
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Rendimiento por Asignatura</h3>
          </div>
          <div className="chart-body">
            {barChartData && <Bar data={barChartData} options={chartOptions} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgresoTab;
