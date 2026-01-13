import React, { useState, useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useResponsive, useDropdown } from '../../hooks';
import {
  DocenteKPICard,
  FiltrosDocente,
  baseChartOptions,
  lineChartOptions,
  horizontalBarOptions,
  doughnutWithLegendOptions,
  trimestrePlugin,
  chartColors,
  formatearNombreCompleto
} from './shared';

function ProgresoTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState('');
  const [trimestreNombre, setTrimestreNombre] = useState('');
  const [analizado, setAnalizado] = useState(false);

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  const asignaturasDisponibles = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return asignaciones
      .filter(a => a.curso_id === parseInt(cursoSeleccionado))
      .map(a => ({ id: a.asignatura_id, nombre: a.asignatura_nombre }));
  }, [cursoSeleccionado, asignaciones]);

  const estadisticas = useMemo(() => {
    if (!analizado || !cursoSeleccionado || !asignaturaSeleccionada) return null;

    const alumnos = alumnosPorCurso[cursoSeleccionado] || [];
    const cursoId = parseInt(cursoSeleccionado);
    const asignaturaId = parseInt(asignaturaSeleccionada);
    const trimestre = trimestreSeleccionado ? parseInt(trimestreSeleccionado) : null;

    let notasFiltradas = notasRegistradas.filter(n =>
      n.curso_id === cursoId && n.asignatura_id === asignaturaId && n.nota !== null
    );
    if (trimestre) notasFiltradas = notasFiltradas.filter(n => n.trimestre === trimestre);

    const promediosPorAlumno = alumnos.map(alumno => {
      const notasAlumno = notasFiltradas.filter(n => n.alumno_id === alumno.id);
      if (notasAlumno.length === 0) return { alumno, promedio: null, notas: [] };
      const promedio = notasAlumno.reduce((a, b) => a + b.nota, 0) / notasAlumno.length;
      return { alumno, promedio, notas: notasAlumno };
    }).filter(p => p.promedio !== null);

    if (promediosPorAlumno.length === 0) {
      return {
        totalAlumnos: alumnos.length, alumnosConNotas: 0, aprobados: 0, reprobados: 0,
        promedioCurso: 0, notaMaxima: 0, notaMinima: 0, porcentajeAprobados: 0, porcentajeReprobados: 0,
        distribucion: { excelente: 0, bueno: 0, suficiente: 0, insuficiente: 0 },
        alumnosAtencion: [], top5: [], promediosPorTrimestre: { 1: 0, 2: 0, 3: 0 }
      };
    }

    const promedios = promediosPorAlumno.map(p => p.promedio);
    const aprobados = promediosPorAlumno.filter(p => p.promedio >= 4.0).length;
    const reprobados = promediosPorAlumno.length - aprobados;
    const promedioCurso = promedios.reduce((a, b) => a + b, 0) / promedios.length;

    const distribucion = {
      excelente: promediosPorAlumno.filter(p => p.promedio >= 6.0).length,
      bueno: promediosPorAlumno.filter(p => p.promedio >= 5.0 && p.promedio < 6.0).length,
      suficiente: promediosPorAlumno.filter(p => p.promedio >= 4.0 && p.promedio < 5.0).length,
      insuficiente: promediosPorAlumno.filter(p => p.promedio < 4.0).length
    };

    const alumnosAtencion = promediosPorAlumno
      .filter(p => p.promedio < 4.0)
      .sort((a, b) => a.promedio - b.promedio)
      .map(p => ({
        nombre: `${p.alumno.nombres} ${p.alumno.apellidos}`,
        promedio: p.promedio,
        notasRojas: p.notas.filter(n => n.nota < 4.0).length,
        tendencia: 'estable'
      }));

    const top5 = [...promediosPorAlumno]
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 5)
      .map(p => ({
        nombre: `${p.alumno.apellidos.split(' ')[0]}, ${p.alumno.nombres.split(' ')[0]}`,
        promedio: p.promedio
      }));

    const promediosPorTrimestre = { 1: 0, 2: 0, 3: 0 };
    [1, 2, 3].forEach(trim => {
      const notasTrim = notasRegistradas.filter(n =>
        n.curso_id === cursoId && n.asignatura_id === asignaturaId && n.trimestre === trim && n.nota !== null
      );
      if (notasTrim.length > 0) {
        promediosPorTrimestre[trim] = notasTrim.reduce((a, b) => a + b.nota, 0) / notasTrim.length;
      }
    });

    return {
      totalAlumnos: alumnos.length, alumnosConNotas: promediosPorAlumno.length, aprobados, reprobados,
      promedioCurso, notaMaxima: Math.max(...promedios), notaMinima: Math.min(...promedios),
      porcentajeAprobados: Math.round((aprobados / promediosPorAlumno.length) * 100),
      porcentajeReprobados: Math.round((reprobados / promediosPorAlumno.length) * 100),
      distribucion, alumnosAtencion, top5, promediosPorTrimestre
    };
  }, [analizado, cursoSeleccionado, asignaturaSeleccionada, trimestreSeleccionado, alumnosPorCurso, notasRegistradas]);

  const handleCursoChange = (cursoId, nombre) => {
    setCursoSeleccionado(cursoId);
    setCursoNombre(nombre);
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setAnalizado(false);
  };

  const analizarProgreso = () => {
    if (!cursoSeleccionado || !asignaturaSeleccionada) {
      alert('Seleccione curso y asignatura');
      return;
    }
    setAnalizado(true);
  };

  // Datos para graficos
  const chartDistribucion = {
    labels: ['1.0-3.9', '4.0-4.9', '5.0-5.9', '6.0-7.0'],
    datasets: [{
      data: estadisticas ? [
        estadisticas.distribucion.insuficiente, estadisticas.distribucion.suficiente,
        estadisticas.distribucion.bueno, estadisticas.distribucion.excelente
      ] : [0, 0, 0, 0],
      backgroundColor: chartColors.distribucion,
      borderRadius: 4
    }]
  };

  const chartTrimestre = {
    labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Promedio',
      data: estadisticas ? [
        null, null, estadisticas.promediosPorTrimestre[1],
        null, null, estadisticas.promediosPorTrimestre[2],
        null, null, null, estadisticas.promediosPorTrimestre[3]
      ] : [null, null, 0, null, null, 0, null, null, null, 0],
      borderColor: chartColors.primary,
      backgroundColor: chartColors.primaryLight,
      fill: true, tension: 0.4, spanGaps: true, pointRadius: 6, pointBackgroundColor: chartColors.primary
    }]
  };

  const chartAprobacion = {
    labels: ['Aprobados', 'Necesitan Apoyo'],
    datasets: [{
      data: estadisticas ? [estadisticas.aprobados, estadisticas.reprobados] : [0, 0],
      backgroundColor: chartColors.aprobacion,
      borderWidth: 0
    }]
  };

  const chartTop5 = {
    labels: estadisticas?.top5.map(a => a.nombre) || [],
    datasets: [{
      data: estadisticas?.top5.map(a => a.promedio) || [],
      backgroundColor: chartColors.top5,
      borderRadius: 4
    }]
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header"><h3>Parametros de Analisis</h3></div>
        <div className="card-body">
          <FiltrosDocente
            isMobile={isMobile}
            cursos={cursos}
            asignaturas={asignaturasDisponibles}
            cursoSeleccionado={cursoSeleccionado}
            cursoNombre={cursoNombre}
            asignaturaSeleccionada={asignaturaSeleccionada}
            asignaturaNombre={asignaturaNombre}
            trimestreSeleccionado={trimestreSeleccionado}
            trimestreNombre={trimestreNombre}
            onCursoChange={handleCursoChange}
            onAsignaturaChange={(id, nombre) => { setAsignaturaSeleccionada(id); setAsignaturaNombre(nombre); }}
            onTrimestreChange={(id, nombre) => { setTrimestreSeleccionado(id); setTrimestreNombre(nombre); }}
            onAccion={analizarProgreso}
            accionTexto="Analizar"
            dropdownAbierto={dropdownAbierto}
            setDropdownAbierto={setDropdownAbierto}
          />
        </div>
      </div>

      {estadisticas && (
        <>
          <div className="docente-kpis-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '12px' }}>
            <DocenteKPICard tipo="alumnos" valor={estadisticas.alumnosConNotas} label="Total Alumnos" variante="primary" />
            <DocenteKPICard tipo="aprobados" valor={estadisticas.aprobados} label="Aprobados" trend="up" trendValue={`${estadisticas.porcentajeAprobados}%`} variante="success" />
            <DocenteKPICard tipo="alerta" valor={estadisticas.reprobados} label="Requieren Apoyo" trend="down" trendValue={`${estadisticas.porcentajeReprobados}%`} variante="danger" />
            <DocenteKPICard tipo="promedio" valor={estadisticas.promedioCurso.toFixed(1)} label="Promedio Curso" variante="info" />
            <DocenteKPICard tipo="estrella" valor={estadisticas.notaMaxima.toFixed(1)} label="Nota Maxima" variante="warning" />
            <DocenteKPICard tipo="barras" valor={estadisticas.notaMinima.toFixed(1)} label="Nota Minima" variante="secondary" />
          </div>

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
                        <tr key={index}>
                          <td>{formatearNombreCompleto(alumno.nombre)}</td>
                          <td><span className="docente-nota-badge nota-insuficiente">{alumno.promedio.toFixed(1)}</span></td>
                          <td>{alumno.notasRojas}</td>
                          <td><span className={`docente-tendencia ${alumno.tendencia}`}>
                            {alumno.tendencia === 'mejorando' ? '↑' : alumno.tendencia === 'empeorando' ? '↓' : '→'}
                          </span></td>
                          <td>{isMobile ? 'Refuerzo' : 'Requiere refuerzo'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center text-muted">No hay alumnos con bajo rendimiento</td></tr>
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
