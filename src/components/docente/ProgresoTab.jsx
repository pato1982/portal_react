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
  formatearNombreCompleto,
  SelectNativo
} from './shared';
import { ordenarCursos } from './shared/utils';
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
  const [notasDetalladas, setNotasDetalladas] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [error, setError] = useState('');

  const { isMobile } = useResponsive();

  const trimestres = [
    { id: '', nombre: 'Todos los trimestres' },
    { id: '1', nombre: '1er Trimestre' },
    { id: '2', nombre: '2do Trimestre' },
    { id: '3', nombre: '3er Trimestre' }
  ];

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
        if (data.success) setCursos(ordenarCursos(data.data || []));
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
          // Mapeo para SelectNativo (necesita id, nombre) y logica interna
          const asignaturasMapeadas = data.data.map(a => ({
            id: a.id,
            nombre: a.nombre,
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
    const asignatura = asignaturas.find(a => a.id.toString() === asignaturaId);
    setAsignaturaSeleccionada(asignaturaId);
    setAsignaturaNombre(asignatura ? asignatura.nombre : '');
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
      let urlStats = `${config.apiBaseUrl}/docente/${docenteId}/progreso/estadisticas?establecimiento_id=${establecimientoId}&curso_id=${cursoSeleccionado}&asignatura_id=${asignaturaSeleccionada}`;
      if (trimestreSeleccionado) urlStats += `&trimestre=${trimestreSeleccionado}`;
      const resStats = await fetch(urlStats);
      const dataStats = await resStats.json();

      if (!dataStats.success) throw new Error(dataStats.error || 'Error en estadisticas');

      const urlNotas = `${config.apiBaseUrl}/docente/${docenteId}/notas/por-asignatura?establecimiento_id=${establecimientoId}&curso_id=${cursoSeleccionado}&asignatura_id=${asignaturaSeleccionada}`;
      const resNotas = await fetch(urlNotas);
      const dataNotas = await resNotas.json();

      if (dataStats.success) {
        setEstadisticas(dataStats.data);
        if (dataNotas.success) setNotasDetalladas(dataNotas.data);
      }
    } catch (err) {
      console.error('Error al analizar progreso:', err);
      setError('Error de conexion o datos no disponibles.');
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  const chartEvolucionData = useMemo(() => {
    if (!notasDetalladas || notasDetalladas.length === 0) return null;

    const labels = [];
    const dataPoints = [];
    const pointColors = [];
    const pointRadii = [];

    const calcPromedioColumna = (trimestreKey, notaIndex) => {
      let suma = 0;
      let count = 0;
      notasDetalladas.forEach(alumno => {
        const notasTrim = alumno[trimestreKey];
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
      let suma = 0;
      let count = 0;
      notasDetalladas.forEach(alumno => {
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

    [1, 2, 3].forEach(t => {
      if (trimestreSeleccionado && trimestreSeleccionado !== t.toString()) return;

      for (let i = 0; i < 8; i++) {
        const prom = calcPromedioColumna(`notas_t${t}`, i);
        if (prom !== null) {
          labels.push(`T${t} N${i + 1}`);
          dataPoints.push(prom);
          pointColors.push(chartColors.primary);
          pointRadii.push(4);
        }
      }
      const promFinal = calcPromedioFinalTrimestre(t);
      if (promFinal !== null) {
        labels.push(`T${t} Final`);
        dataPoints.push(promFinal);
        // DESTACAR PUNTO FINAL (Color diferente: Rojo/Naranja)
        pointColors.push('#f97316'); // Naranja brillante
        pointRadii.push(6);
      }
    });

    return {
      labels,
      datasets: [{
        label: 'Promedio Curso',
        data: dataPoints,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: pointColors,
        pointRadius: pointRadii,
        pointHoverRadius: 8
      }]
    };

  }, [notasDetalladas, trimestreSeleccionado]);

  // Opciones grafico evolucion
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
          font: { size: 10 },
          autoSkip: false,
          maxRotation: 0,
          callback: function (val, index, values) {
            const label = this.getLabelForValue(val);
            const currentTrim = label.split(' ')[0];

            // LOGICA CAMBIADA: Mostrar etiqueta al FINAL del bloque
            if (index === values.length - 1) return currentTrim.replace('T', 'Trimestre ');

            const nextLabel = this.getLabelForValue(values[index + 1].value);
            const nextTrim = nextLabel.split(' ')[0];

            if (currentTrim !== nextTrim) {
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

  if (cargandoCursos) {
    return (
      <div className="tab-panel active">
        <div className="card"><div className="card-body text-center"><p>Cargando datos...</p></div></div>
      </div>
    );
  }

  return (
    <div className="tab-panel active">
      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header"><h3>Parametros de Analisis</h3></div>
        <div className="card-body" style={{ overflow: 'visible' }}>
          <div className="filtros-progreso-container" style={{ marginBottom: '10px' }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Fila 1: Curso y Asignatura */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <SelectNativo
                      label="Curso"
                      value={cursoSeleccionado}
                      onChange={handleCursoChange}
                      options={cursos}
                      placeholder="Curso"
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <SelectNativo
                      label="Asignatura"
                      value={asignaturaSeleccionada}
                      onChange={handleAsignaturaChange}
                      options={asignaturas}
                      placeholder="Asignatura"
                      disabled={!cursoSeleccionado}
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </div>
                </div>

                {/* Fila 2: Trimestre y Botón */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <SelectNativo
                      label="Trimestre"
                      value={trimestreSeleccionado}
                      onChange={handleTrimestreChange}
                      options={trimestres}
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={analizarProgreso}
                      disabled={!cursoSeleccionado || !asignaturaSeleccionada || cargandoEstadisticas}
                      style={{ width: '100%', height: '30px', fontSize: '13px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {cargandoEstadisticas ? '...' : 'Analizar'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Layout Desktop/Tablet Original */
              <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <SelectNativo
                    label="Curso"
                    value={cursoSeleccionado}
                    onChange={handleCursoChange}
                    options={cursos}
                    placeholder="Seleccionar curso"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectNativo
                    label="Asignatura"
                    value={asignaturaSeleccionada}
                    onChange={handleAsignaturaChange}
                    options={asignaturas}
                    placeholder="Seleccionar asignatura"
                    disabled={!cursoSeleccionado}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectNativo
                    label="Trimestre"
                    value={trimestreSeleccionado}
                    onChange={handleTrimestreChange}
                    options={trimestres}
                  />
                </div>
                <div className="filtro-accion" style={{ flex: '0 0 auto', marginBottom: '15px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={analizarProgreso}
                    disabled={!cursoSeleccionado || !asignaturaSeleccionada || cargandoEstadisticas}
                    style={{ minWidth: '100px', height: '30px', fontSize: '13px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {cargandoEstadisticas ? 'Analizando...' : 'Analizar'}
                  </button>
                </div>
              </div>
            )}
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
