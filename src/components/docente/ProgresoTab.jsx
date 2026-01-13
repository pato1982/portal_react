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
  // Estados para filtros
  const [cursos, setCursos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState('');

  // Estados para datos
  const [estadisticas, setEstadisticas] = useState(null);
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

  // Cargar cursos y asignaturas del docente
  useEffect(() => {
    const cargarCursosAsignaturas = async () => {
      if (!docenteId || !establecimientoId) {
        setCargandoCursos(false);
        return;
      }

      setCargandoCursos(true);
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/docente/${docenteId}/cursos-asignaturas?establecimiento_id=${establecimientoId}`
        );
        const data = await response.json();

        if (data.success) {
          setCursos(data.data.cursos || []);
          // Las asignaturas se filtrarán cuando se seleccione un curso
        } else {
          setError('Error al cargar cursos');
        }
      } catch (err) {
        console.error('Error al cargar cursos:', err);
        setError('Error de conexion');
      } finally {
        setCargandoCursos(false);
      }
    };

    cargarCursosAsignaturas();
  }, [docenteId, establecimientoId]);

  // Cargar asignaturas cuando cambia el curso
  useEffect(() => {
    const cargarAsignaturas = async () => {
      if (!cursoSeleccionado || !docenteId || !establecimientoId) {
        setAsignaturas([]);
        return;
      }

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/docente/${docenteId}/cursos-asignaturas?establecimiento_id=${establecimientoId}`
        );
        const data = await response.json();

        if (data.success) {
          const asignaturasDelCurso = data.data.asignaturas.filter(
            a => a.curso_id === parseInt(cursoSeleccionado)
          );
          setAsignaturas(asignaturasDelCurso);
        }
      } catch (err) {
        console.error('Error al cargar asignaturas:', err);
      }
    };

    cargarAsignaturas();
  }, [cursoSeleccionado, docenteId, establecimientoId]);

  const handleCursoChange = (e) => {
    const cursoId = e.target.value;
    const curso = cursos.find(c => c.id === parseInt(cursoId));
    setCursoSeleccionado(cursoId);
    setCursoNombre(curso ? curso.nombre : '');
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setEstadisticas(null);
  };

  const handleAsignaturaChange = (e) => {
    const asignaturaId = e.target.value;
    const asignatura = asignaturas.find(a => a.asignatura_id === parseInt(asignaturaId));
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
      let url = `${config.apiBaseUrl}/docente/${docenteId}/progreso/estadisticas?establecimiento_id=${establecimientoId}&curso_id=${cursoSeleccionado}&asignatura_id=${asignaturaSeleccionada}`;

      if (trimestreSeleccionado) {
        url += `&trimestre=${trimestreSeleccionado}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
      } else {
        setError(data.error || 'Error al obtener estadisticas');
      }
    } catch (err) {
      console.error('Error al analizar progreso:', err);
      setError('Error de conexion');
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  // Datos para graficos
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

  const chartTrimestre = useMemo(() => ({
    labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Promedio',
      data: estadisticas ? [
        null, null, estadisticas.promediosPorTrimestre[1] || null,
        null, null, estadisticas.promediosPorTrimestre[2] || null,
        null, null, null, estadisticas.promediosPorTrimestre[3] || null
      ] : [null, null, 0, null, null, 0, null, null, null, 0],
      borderColor: chartColors.primary,
      backgroundColor: chartColors.primaryLight,
      fill: true,
      tension: 0.4,
      spanGaps: true,
      pointRadius: 6,
      pointBackgroundColor: chartColors.primary
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
        <div className="card">
          <div className="card-body text-center">
            <p>Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header"><h3>Parametros de Analisis</h3></div>
        <div className="card-body">
          <div className="filtros-docente-grid">
            {/* Selector de Curso */}
            <div className="filtro-grupo">
              <label className="filtro-label">Curso</label>
              <select
                className="form-control"
                value={cursoSeleccionado}
                onChange={handleCursoChange}
              >
                <option value="">Seleccionar curso</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Asignatura */}
            <div className="filtro-grupo">
              <label className="filtro-label">Asignatura</label>
              <select
                className="form-control"
                value={asignaturaSeleccionada}
                onChange={handleAsignaturaChange}
                disabled={!cursoSeleccionado}
              >
                <option value="">Seleccionar asignatura</option>
                {asignaturas.map(asig => (
                  <option key={asig.asignatura_id} value={asig.asignatura_id}>
                    {asig.asignatura_nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Trimestre */}
            <div className="filtro-grupo">
              <label className="filtro-label">Trimestre</label>
              <select
                className="form-control"
                value={trimestreSeleccionado}
                onChange={handleTrimestreChange}
              >
                {trimestres.map(trim => (
                  <option key={trim.id} value={trim.id}>
                    {trim.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Boton Analizar */}
            <div className="filtro-grupo filtro-accion">
              <button
                className="btn btn-primary"
                onClick={analizarProgreso}
                disabled={!cursoSeleccionado || !asignaturaSeleccionada || cargandoEstadisticas}
              >
                {cargandoEstadisticas ? 'Analizando...' : 'Analizar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3">{error}</div>
          )}
        </div>
      </div>

      {cargandoEstadisticas && (
        <div className="card mt-4">
          <div className="card-body text-center">
            <p>Analizando datos de progreso...</p>
          </div>
        </div>
      )}

      {estadisticas && !cargandoEstadisticas && (
        <>
          {/* KPIs */}
          <div
            className="docente-kpis-grid"
            style={{
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
              gap: '12px'
            }}
          >
            <DocenteKPICard
              tipo="alumnos"
              valor={estadisticas.kpis.alumnosConNotas}
              label="Total Alumnos"
              variante="primary"
            />
            <DocenteKPICard
              tipo="aprobados"
              valor={estadisticas.kpis.aprobados}
              label="Aprobados"
              trend="up"
              trendValue={`${estadisticas.kpis.porcentajeAprobados}%`}
              variante="success"
            />
            <DocenteKPICard
              tipo="alerta"
              valor={estadisticas.kpis.reprobados}
              label="Requieren Apoyo"
              trend="down"
              trendValue={`${estadisticas.kpis.porcentajeReprobados}%`}
              variante="danger"
            />
            <DocenteKPICard
              tipo="promedio"
              valor={estadisticas.kpis.promedioCurso}
              label="Promedio Curso"
              variante="info"
            />
            <DocenteKPICard
              tipo="estrella"
              valor={estadisticas.kpis.notaMaxima}
              label="Nota Maxima"
              variante="warning"
            />
            <DocenteKPICard
              tipo="barras"
              valor={estadisticas.kpis.notaMinima}
              label="Nota Minima"
              variante="secondary"
            />
          </div>

          {/* Graficos */}
          <div className="docente-charts-grid" style={{ marginTop: '20px' }}>
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Distribucion de Notas</h3></div>
              <div className="card-body docente-chart-container">
                <Bar data={chartDistribucion} options={baseChartOptions} />
              </div>
            </div>
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Rendimiento por Trimestre</h3></div>
              <div className="card-body docente-chart-container">
                <Line data={chartTrimestre} options={lineChartOptions} plugins={[trimestrePlugin]} />
              </div>
            </div>
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Tasa de Aprobacion</h3></div>
              <div className="card-body docente-chart-container docente-chart-sm">
                <Doughnut data={chartAprobacion} options={doughnutWithLegendOptions} />
              </div>
            </div>
            <div className="card docente-chart-card">
              <div className="card-header"><h3>Top 5 Mejores Promedios</h3></div>
              <div className="card-body docente-chart-container">
                <Bar data={chartTop5} options={horizontalBarOptions} />
              </div>
            </div>
          </div>

          {/* Tabla Alumnos que Requieren Atencion */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header"><h3>Alumnos que Requieren Atencion</h3></div>
            <div className="card-body">
              <div className="table-responsive table-scroll">
                <table className={`data-table ${isMobile ? 'tabla-compacta-movil' : ''}`}>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Promedio</th>
                      <th>{isMobile ? 'Rojas' : 'Notas Rojas'}</th>
                      <th>{isMobile ? 'Tend.' : 'Tendencia'}</th>
                      <th>{isMobile ? 'Obs.' : 'Observacion'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.alumnosAtencion.length > 0 ? (
                      estadisticas.alumnosAtencion.map((alumno, index) => (
                        <tr key={alumno.alumno_id || index}>
                          <td>{formatearNombreCompleto(alumno.nombre)}</td>
                          <td>
                            <span className="docente-nota-badge nota-insuficiente">
                              {alumno.promedio.toFixed(1)}
                            </span>
                          </td>
                          <td>{alumno.notasRojas}</td>
                          <td>
                            <span className={`docente-tendencia ${alumno.tendencia}`}>
                              {alumno.tendencia === 'mejorando' ? '↑' : alumno.tendencia === 'empeorando' ? '↓' : '→'}
                            </span>
                          </td>
                          <td>{isMobile ? 'Refuerzo' : 'Requiere refuerzo'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No hay alumnos con bajo rendimiento
                        </td>
                      </tr>
                    )}
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
