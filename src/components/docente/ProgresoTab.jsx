import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useResponsive, useDropdown } from '../../hooks';
import {
  DocenteKPICard,
  baseChartOptions,
  lineChartOptions,
  horizontalBarOptions,
  doughnutWithLegendOptions,
  trimestrePlugin,
  chartColors,
  formatearNombreCompleto
} from './shared';
import config from '../../config/env';

function ProgresoTab({ docenteId, establecimientoId }) {
  const [cursos, setCursos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState('');

  const [estadisticas, setEstadisticas] = useState(null);
  const [notasDetalladas, setNotasDetalladas] = useState([]); // Nuevo estado para datos granulares
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [error, setError] = useState('');

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  const trimestres = [
    { id: '', nombre: 'Todos los trimestres' },
    { id: '1', nombre: '1er Trimestre' },
    { id: '2', nombre: '2do Trimestre' },
    { id: '3', nombre: '3er Trimestre' }
  ];

  // Cargar cursos
  useEffect(() => {
    const cargarCursos = async () => {
      if (!docenteId || !establecimientoId) {
        setCargandoCursos(false);
        return;
      }
      setCargandoCursos(true);
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/docente/${docenteId}/cursos?establecimiento_id=${establecimientoId}`
        );
        const data = await response.json();
        if (data.success) setCursos(data.data || []);
        else setError('Error al cargar cursos');
      } catch (err) {
        console.error('Error al cargar cursos:', err);
        setError('Error de conexion al cargar cursos');
      } finally {
        setCargandoCursos(false);
      }
    };
    cargarCursos();
  }, [docenteId, establecimientoId]);

  // Cargar asignaturas
  useEffect(() => {
    const cargarAsignaturas = async () => {
      if (!cursoSeleccionado || !docenteId || !establecimientoId) {
        setAsignaturas([]);
        return;
      }
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/docente/${docenteId}/asignaturas-por-curso/${cursoSeleccionado}?establecimiento_id=${establecimientoId}`
        );
        const data = await response.json();
        if (data.success) {
          const asignaturasMapeadas = data.data.map(a => ({
            asignatura_id: a.id,
            asignatura_nombre: a.nombre
          }));
          setAsignaturas(asignaturasMapeadas);
        }
      } catch (err) {
        console.error('Error al cargar asignaturas:', err);
      }
    };
    cargarAsignaturas();
  }, [cursoSeleccionado, docenteId, establecimientoId]);

  const handleCursoChange = (e) => {
    const cursoId = e.target.value;
    const curso = cursos.find(c => c.id === parseInt(cursoId) || c.id.toString() === cursoId);
    setCursoSeleccionado(cursoId);
    setCursoNombre(curso ? curso.nombre : '');
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setEstadisticas(null);
    setNotasDetalladas([]);
  };

  const handleAsignaturaChange = (e) => {
    const asignaturaId = e.target.value;
    const asignatura = asignaturas.find(a => a.asignatura_id.toString() === asignaturaId);
    setAsignaturaSeleccionada(asignaturaId);
    setAsignaturaNombre(asignatura ? asignatura.asignatura_nombre : '');
  };

  const handleTrimestreChange = (e) => {
    setTrimestreSeleccionado(e.target.value);
  };

  const analizarProgreso = async () => {
    if (!cursoSeleccionado || !asignaturaSeleccionada) {
      setError('Seleccione curso y asignatura');
      return;
    }

    setError('');
    setCargandoEstadisticas(true);

    try {
      // 1. Obtener KPI y Estadisticas Generales
      let urlStats = `${config.apiBaseUrl}/docente/${docenteId}/progreso/estadisticas?establecimiento_id=${establecimientoId}&curso_id=${cursoSeleccionado}&asignatura_id=${asignaturaSeleccionada}`;
      if (trimestreSeleccionado) urlStats += `&trimestre=${trimestreSeleccionado}`;
      const resStats = await fetch(urlStats);
      const dataStats = await resStats.json();

      if (!dataStats.success) throw new Error(dataStats.error || 'Error en estadisticas');

      // 2. Obtener Notas Detalladas para el Grafico de Evolucion
      // Usamos el endpoint de VerNotasTab para obtener la matriz completa
      const urlNotas = `${config.apiBaseUrl}/docente/${docenteId}/notas/por-asignatura?establecimiento_id=${establecimientoId}&curso_id=${cursoSeleccionado}&asignatura_id=${asignaturaSeleccionada}`;
      const resNotas = await fetch(urlNotas);
      const dataNotas = await resNotas.json();

      if (dataStats.success) {
        setEstadisticas(dataStats.data);
        if (dataNotas.success) {
          setNotasDetalladas(dataNotas.data);
        }
      }
    } catch (err) {
      console.error('Error al analizar progreso:', err);
      setError('Error de conexion o datos no disponibles.');
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  // Calcular evolucion detallada nota a nota
  const chartEvolucionData = useMemo(() => {
    if (!notasDetalladas || notasDetalladas.length === 0) return null;

    const labels = [];
    const dataPoints = [];

    // Helper para calcular promedio de una columna
    const calcPromedioColumna = (trimestreKey, notaIndex) => {
      let suma = 0;
      let count = 0;
      notasDetalladas.forEach(alumno => {
        const notasTrim = alumno[trimestreKey]; // notas_t1, etc
        if (notasTrim && notasTrim[notaIndex]) {
          const valor = parseFloat(notasTrim[notaIndex].nota);
          if (!isNaN(valor) && !notasTrim[notaIndex].es_pendiente) {
            suma += valor;
            count++;
          }
        }
      });
      return count > 0 ? (suma / count) : null;
    };

    const calcPromedioFinalTrimestre = (trimestreNum) => {
      // Usar el promedio ya calculado por el backend si existe, o calcularlo
      // En notasDetalladas no viene el promedio final explicito facil, mejor calcularlo
      let suma = 0;
      let count = 0;
      notasDetalladas.forEach(alumno => {
        // Replicar logica de VerNotasTab para promedio alumno
        const notas = alumno[`notas_t${trimestreNum}`];
        const validas = notas.filter(n => n.nota !== null && !n.es_pendiente).map(n => parseFloat(n.nota));
        if (validas.length > 0) {
          const promAlumno = validas.reduce((a, b) => a + b, 0) / validas.length;
          suma += promAlumno;
          count++;
        }
      });
      return count > 0 ? (suma / count) : null;
    };

    // Generar puntos para T1, T2, T3
    [1, 2, 3].forEach(t => {
      // Si hay seleccion de trimestre, filtrar
      if (trimestreSeleccionado && trimestreSeleccionado !== t.toString()) return;

      // Notas 1 a 8
      for (let i = 0; i < 8; i++) {
        const prom = calcPromedioColumna(`notas_t${t}`, i);
        if (prom !== null) {
          labels.push(`T${t} N${i + 1}`);
          dataPoints.push(prom);
        }
      }
      // Promedio Final Trimestre
      const promFinal = calcPromedioFinalTrimestre(t);
      if (promFinal !== null) {
        labels.push(`T${t} Final`);
        dataPoints.push(promFinal);
      }
    });

    return {
      labels,
      datasets: [{
        label: 'Promedio Curso (Evolución Nota a Nota)',
        data: dataPoints,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    };

  }, [notasDetalladas, trimestreSeleccionado]);


  // KPIs / Distribucion / Top5 siguen usando 'estadisticas'
  const chartDistribucion = useMemo(() => ({
    labels: ['1.0-3.9', '4.0-4.9', '5.0-5.9', '6.0-7.0'],
    datasets: [{
      data: estadisticas ? [
        estadisticas.distribucion.insuficiente,
        estadisticas.distribucion.suficiente,
        estadisticas.distribucion.bueno,
        estadisticas.distribucion.excelente
      ] : [0, 0, 0, 0],
      backgroundColor: chartColors.distribucion,
      borderRadius: 4
    }]
  }), [estadisticas]);

  const chartAprobacion = useMemo(() => ({
    labels: ['Aprobados', 'Necesitan Apoyo'],
    datasets: [{
      data: estadisticas ? [estadisticas.kpis.aprobados, estadisticas.kpis.reprobados] : [0, 0],
      backgroundColor: chartColors.aprobacion,
      borderWidth: 0
    }]
  }), [estadisticas]);

  const chartTop5 = useMemo(() => ({
    labels: estadisticas?.top5.map(a => a.nombre) || [],
    datasets: [{
      data: estadisticas?.top5.map(a => a.promedio) || [],
      backgroundColor: chartColors.top5,
      borderRadius: 4
    }]
  }), [estadisticas]);

  // Opciones especificas para el grafico de evolucion
  const evolucionChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `Promedio: ${Number(context.raw).toFixed(1)}`
        }
      }
    },
    scales: {
      y: {
        min: 1.0,
        max: 7.0,
        grid: { color: '#f1f5f9' },
        ticks: { stepSize: 0.5 }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 }, // Letra mas chica como solictado
          autoSkip: false,
          maxRotation: 0,
          callback: function (val, index, values) {
            const label = this.getLabelForValue(val);
            const currentTrim = label.split(' ')[0]; // "T1"

            // Mostrar etiqueta solo al inicio de cada bloque de trimestre
            if (index === 0) return currentTrim.replace('T', 'Trimestre ');

            const prevLabel = this.getLabelForValue(values[index - 1].value);
            const prevTrim = prevLabel.split(' ')[0];

            if (currentTrim !== prevTrim) {
              return currentTrim.replace('T', 'Trimestre ');
            }
            return '';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }), []);

  if (cargandoCursos) {
    return (
      <div className="tab-panel active">
        <div className="card"><div className="card-body text-center"><p>Cargando datos...</p></div></div>
      </div>
    );
  }

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header"><h3>Parametros de Analisis</h3></div>
        <div className="card-body">
          <div className="filtros-progreso-container" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '15px',
            alignItems: isMobile ? 'stretch' : 'flex-end',
            marginBottom: '10px'
          }}>
            <div className="filtro-grupo" style={{ flex: isMobile ? 'auto' : '1' }}>
              <label className="filtro-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Curso</label>
              <select className="form-control" value={cursoSeleccionado} onChange={handleCursoChange} style={{ width: '100%' }}>
                <option value="">Seleccionar curso</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="filtro-grupo" style={{ flex: isMobile ? 'auto' : '1' }}>
              <label className="filtro-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Asignatura</label>
              <select className="form-control" value={asignaturaSeleccionada} onChange={handleAsignaturaChange} disabled={!cursoSeleccionado} style={{ width: '100%' }}>
                <option value="">Seleccionar asignatura</option>
                {asignaturas.map(a => <option key={a.asignatura_id} value={a.asignatura_id}>{a.asignatura_nombre}</option>)}
              </select>
            </div>
            <div className="filtro-grupo" style={{ flex: isMobile ? 'auto' : '1' }}>
              <label className="filtro-label" style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Trimestre</label>
              <select className="form-control" value={trimestreSeleccionado} onChange={handleTrimestreChange} style={{ width: '100%' }}>
                {trimestres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="filtro-accion" style={{ flex: isMobile ? 'auto' : '0 0 auto' }}>
              <button className="btn btn-primary" onClick={analizarProgreso} disabled={!cursoSeleccionado || !asignaturaSeleccionada || cargandoEstadisticas} style={{ width: isMobile ? '100%' : 'auto', minWidth: '120px' }}>
                {cargandoEstadisticas ? 'Analizando...' : 'Analizar'}
              </button>
            </div>
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>

      {cargandoEstadisticas && (
        <div className="card mt-4"><div className="card-body text-center"><p>Analizando datos de progreso...</p></div></div>
      )}

      {estadisticas && !cargandoEstadisticas && (
        <>
          <div className="docente-kpis-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', gap: '12px' }}>
            <DocenteKPICard tipo="alumnos" valor={estadisticas.kpis.alumnosConNotas} label="Total Alumnos" variante="primary" />
            <DocenteKPICard tipo="aprobados" valor={estadisticas.kpis.aprobados} label="Aprobados" trend="up" trendValue={`${estadisticas.kpis.porcentajeAprobados}%`} variante="success" />
            <DocenteKPICard tipo="alerta" valor={estadisticas.kpis.reprobados} label="Requieren Apoyo" trend="down" trendValue={`${estadisticas.kpis.porcentajeReprobados}%`} variante="danger" />
            <DocenteKPICard tipo="promedio" valor={estadisticas.kpis.promedioCurso} label="Promedio Curso" variante="info" />
            <DocenteKPICard tipo="estrella" valor={estadisticas.kpis.notaMaxima} label="Nota Maxima" variante="warning" />
            <DocenteKPICard tipo="barras" valor={estadisticas.kpis.notaMinima} label="Nota Minima" variante="secondary" />
          </div>

          <div className="docente-charts-grid" style={{ marginTop: '20px' }}>
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Distribucion de Notas</h3></div>
              <div className="card-body docente-chart-container"><Bar data={chartDistribucion} options={baseChartOptions} /></div>
            </div>
            {/* GRAFICO EVOLUCION REEMPLAZA AL DE TRIMESTRE */}
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Evolucion de Notas (Nota a Nota)</h3></div>
              <div className="card-body docente-chart-container">
                {chartEvolucionData ?
                  <Line data={chartEvolucionData} options={evolucionChartOptions} /> :
                  <p className="text-center text-muted">Sin datos suficientes para proyectar evolución.</p>
                }
              </div>
            </div>
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Tasa de Aprobacion</h3></div>
              <div className="card-body docente-chart-container docente-chart-sm"><Doughnut data={chartAprobacion} options={doughnutWithLegendOptions} /></div>
            </div>
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Top 5 Mejores Promedios</h3></div>
              <div className="card-body docente-chart-container"><Bar data={chartTop5} options={horizontalBarOptions} /></div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header"><h3>Alumnos que Requieren Atencion</h3></div>
            <div className="card-body">
              <div className="table-responsive table-scroll">
                <table className={`data-table ${isMobile ? 'tabla-compacta-movil' : ''}`}>
                  <thead>
                    <tr>
                      <th>Alumno</th><th>Promedio</th><th>{isMobile ? 'Rojas' : 'Notas Rojas'}</th><th>{isMobile ? 'Tend.' : 'Tendencia'}</th><th>{isMobile ? 'Obs.' : 'Observacion'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.alumnosAtencion.length > 0 ? estadisticas.alumnosAtencion.map((alumno, index) => (
                      <tr key={alumno.alumno_id || index}>
                        <td>{formatearNombreCompleto(alumno.nombre)}</td>
                        <td><span className="docente-nota-badge nota-insuficiente">{alumno.promedio.toFixed(1)}</span></td>
                        <td>{alumno.notasRojas}</td>
                        <td><span className={`docente-tendencia ${alumno.tendencia}`}>{alumno.tendencia === 'mejorando' ? '↑' : alumno.tendencia === 'empeorando' ? '↓' : '→'}</span></td>
                        <td>{isMobile ? 'Refuerzo' : 'Requiere refuerzo'}</td>
                      </tr>
                    )) :
                      <tr><td colSpan="5" className="text-center text-muted">No hay alumnos con bajo rendimiento</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProgresoTab;
