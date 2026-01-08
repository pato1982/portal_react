import React, { useState, useMemo, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

function ProgresoTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState('');
  const [trimestreNombre, setTrimestreNombre] = useState('');
  const [analizado, setAnalizado] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 699);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 699);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-select-container')) {
        setDropdownAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Asignaturas disponibles segun el curso seleccionado
  const asignaturasDisponibles = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return asignaciones
      .filter(a => a.curso_id === parseInt(cursoSeleccionado))
      .map(a => ({ id: a.asignatura_id, nombre: a.asignatura_nombre }));
  }, [cursoSeleccionado, asignaciones]);

  // Calcular estadisticas
  const estadisticas = useMemo(() => {
    if (!analizado || !cursoSeleccionado || !asignaturaSeleccionada) {
      return null;
    }

    const alumnos = alumnosPorCurso[cursoSeleccionado] || [];
    const cursoId = parseInt(cursoSeleccionado);
    const asignaturaId = parseInt(asignaturaSeleccionada);
    const trimestre = trimestreSeleccionado ? parseInt(trimestreSeleccionado) : null;

    // Filtrar notas
    let notasFiltradas = notasRegistradas.filter(n =>
      n.curso_id === cursoId &&
      n.asignatura_id === asignaturaId &&
      n.nota !== null
    );

    if (trimestre) {
      notasFiltradas = notasFiltradas.filter(n => n.trimestre === trimestre);
    }

    // Calcular promedios por alumno
    const promediosPorAlumno = alumnos.map(alumno => {
      const notasAlumno = notasFiltradas.filter(n => n.alumno_id === alumno.id);
      if (notasAlumno.length === 0) return { alumno, promedio: null, notas: [] };

      const promedio = notasAlumno.reduce((a, b) => a + b.nota, 0) / notasAlumno.length;
      return { alumno, promedio, notas: notasAlumno };
    }).filter(p => p.promedio !== null);

    if (promediosPorAlumno.length === 0) {
      return {
        totalAlumnos: alumnos.length,
        alumnosConNotas: 0,
        aprobados: 0,
        reprobados: 0,
        promedioCurso: 0,
        notaMaxima: 0,
        notaMinima: 0,
        porcentajeAprobados: 0,
        porcentajeReprobados: 0,
        distribucion: { excelente: 0, bueno: 0, suficiente: 0, insuficiente: 0 },
        alumnosAtencion: [],
        top5: [],
        promediosPorTrimestre: { 1: 0, 2: 0, 3: 0 }
      };
    }

    const promedios = promediosPorAlumno.map(p => p.promedio);
    const aprobados = promediosPorAlumno.filter(p => p.promedio >= 4.0).length;
    const reprobados = promediosPorAlumno.length - aprobados;
    const promedioCurso = promedios.reduce((a, b) => a + b, 0) / promedios.length;

    // Distribucion de notas
    const distribucion = {
      excelente: promediosPorAlumno.filter(p => p.promedio >= 6.0).length,
      bueno: promediosPorAlumno.filter(p => p.promedio >= 5.0 && p.promedio < 6.0).length,
      suficiente: promediosPorAlumno.filter(p => p.promedio >= 4.0 && p.promedio < 5.0).length,
      insuficiente: promediosPorAlumno.filter(p => p.promedio < 4.0).length
    };

    // Alumnos que requieren atencion (promedio < 4.0)
    const alumnosAtencion = promediosPorAlumno
      .filter(p => p.promedio < 4.0)
      .sort((a, b) => a.promedio - b.promedio)
      .map(p => ({
        nombre: `${p.alumno.nombres} ${p.alumno.apellidos}`,
        promedio: p.promedio,
        notasRojas: p.notas.filter(n => n.nota < 4.0).length,
        tendencia: 'estable' // Demo
      }));

    // Top 5 mejores promedios
    const top5 = [...promediosPorAlumno]
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 5)
      .map(p => ({
        nombre: `${p.alumno.apellidos.split(' ')[0]}, ${p.alumno.nombres.split(' ')[0]}`,
        promedio: p.promedio
      }));

    // Promedios por trimestre (para grafico de tendencia)
    const promediosPorTrimestre = { 1: 0, 2: 0, 3: 0 };
    [1, 2, 3].forEach(trim => {
      const notasTrim = notasRegistradas.filter(n =>
        n.curso_id === cursoId &&
        n.asignatura_id === asignaturaId &&
        n.trimestre === trim &&
        n.nota !== null
      );
      if (notasTrim.length > 0) {
        promediosPorTrimestre[trim] = notasTrim.reduce((a, b) => a + b.nota, 0) / notasTrim.length;
      }
    });

    return {
      totalAlumnos: alumnos.length,
      alumnosConNotas: promediosPorAlumno.length,
      aprobados,
      reprobados,
      promedioCurso,
      notaMaxima: Math.max(...promedios),
      notaMinima: Math.min(...promedios),
      porcentajeAprobados: Math.round((aprobados / promediosPorAlumno.length) * 100),
      porcentajeReprobados: Math.round((reprobados / promediosPorAlumno.length) * 100),
      distribucion,
      alumnosAtencion,
      top5,
      promediosPorTrimestre
    };
  }, [analizado, cursoSeleccionado, asignaturaSeleccionada, trimestreSeleccionado, alumnosPorCurso, notasRegistradas, asignaciones]);

  const handleCursoChange = (cursoId, nombre = '') => {
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
        estadisticas.distribucion.insuficiente,
        estadisticas.distribucion.suficiente,
        estadisticas.distribucion.bueno,
        estadisticas.distribucion.excelente
      ] : [0, 0, 0, 0],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
      borderRadius: 4
    }]
  };

  const chartTrimestre = {
    labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Promedio',
      data: estadisticas ? [
        null, null, estadisticas.promediosPorTrimestre[1],  // T1 al final de Mayo
        null, null, estadisticas.promediosPorTrimestre[2],  // T2 al final de Agosto
        null, null, null, estadisticas.promediosPorTrimestre[3]  // T3 al final de Diciembre
      ] : [null, null, 0, null, null, 0, null, null, null, 0],
      borderColor: '#1e3a5f',
      backgroundColor: 'rgba(30, 58, 95, 0.1)',
      fill: true,
      tension: 0.4,
      spanGaps: true,
      pointRadius: 6,
      pointBackgroundColor: '#1e3a5f'
    }]
  };

  const chartAprobacion = {
    labels: ['Aprobados', 'Necesitan Apoyo'],
    datasets: [{
      data: estadisticas ? [estadisticas.aprobados, estadisticas.reprobados] : [0, 0],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0
    }]
  };

  const chartTop5 = {
    labels: estadisticas?.top5.map(a => a.nombre) || [],
    datasets: [{
      data: estadisticas?.top5.map(a => a.promedio) || [],
      backgroundColor: ['#1e3a5f', '#2d4a6f', '#4a6a8f', '#6a8aaf', '#8aaacf'],
      borderRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  // Plugin para dibujar barras de fin de trimestre
  const trimestrePlugin = {
    id: 'trimestreBars',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      const yAxis = chart.scales.y;

      // Indices de fin de trimestre: Mayo (2), Agosto (5), Diciembre (9)
      const finTrimestres = [2, 5, 9];
      const colores = ['rgba(30, 58, 95, 0.15)', 'rgba(30, 58, 95, 0.15)', 'rgba(30, 58, 95, 0.15)'];

      finTrimestres.forEach((index, i) => {
        const x = xAxis.getPixelForValue(index);
        ctx.save();
        ctx.fillStyle = colores[i];
        ctx.fillRect(x - 3, yAxis.top, 6, yAxis.bottom - yAxis.top);
        ctx.restore();
      });
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: false,
        min: 1,
        max: 8,
        ticks: {
          callback: function(value) {
            return value === 8 ? '' : value;
          },
          stepSize: 1
        }
      }
    }
  };

  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, max: 7 }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                return {
                  text: `${label}: ${value}`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.backgroundColor[i],
                  hidden: false,
                  index: i,
                  pointStyle: 'circle'
                };
              });
            }
            return [];
          }
        }
      }
    }
  };

  // Formatear nombre: "Apellido1 Apellido2 P."
  const formatearNombreCompleto = (nombreCompleto) => {
    if (!nombreCompleto) return '';
    const partes = nombreCompleto.trim().split(' ');

    if (partes.length >= 4) {
      // Nombre1 Nombre2 Apellido1 Apellido2
      const apellido1 = partes[2];
      const apellido2 = partes[3];
      const inicialNombre = partes[0].charAt(0) + '.';
      return `${apellido1} ${apellido2} ${inicialNombre}`;
    } else if (partes.length === 3) {
      // Nombre Apellido1 Apellido2
      const apellido1 = partes[1];
      const apellido2 = partes[2];
      const inicialNombre = partes[0].charAt(0) + '.';
      return `${apellido1} ${apellido2} ${inicialNombre}`;
    }
    return nombreCompleto;
  };

  return (
    <div className="tab-panel active">
      {/* Filtros */}
      <div className="card">
        <div className="card-header">
          <h3>Parametros de Analisis</h3>
        </div>
        <div className="card-body">
          {isMobile ? (
            <>
              {/* Móvil: Fila 1 - Curso y Asignatura */}
              <div className="form-row-movil">
                <div className="form-group">
                  <label>Curso</label>
                  <div className="custom-select-container">
                    <div
                      className="custom-select-trigger"
                      onClick={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
                    >
                      <span>{cursoNombre || 'Seleccionar...'}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'curso' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'curso' && (
                      <div className="custom-select-options">
                        <div className="custom-select-option" onClick={() => { handleCursoChange('', ''); setDropdownAbierto(null); }}>
                          Seleccionar...
                        </div>
                        {cursos.map(curso => (
                          <div
                            key={curso.id}
                            className={`custom-select-option ${cursoSeleccionado === curso.id.toString() ? 'selected' : ''}`}
                            onClick={() => { handleCursoChange(curso.id, curso.nombre); setDropdownAbierto(null); }}
                          >
                            {curso.nombre}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Asignatura</label>
                  <div className="custom-select-container">
                    <div
                      className={`custom-select-trigger ${!cursoSeleccionado ? 'disabled' : ''}`}
                      onClick={() => cursoSeleccionado && setDropdownAbierto(dropdownAbierto === 'asignatura' ? null : 'asignatura')}
                    >
                      <span>{asignaturaNombre || (cursoSeleccionado ? 'Seleccionar...' : 'Seleccione curso')}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'asignatura' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'asignatura' && cursoSeleccionado && (
                      <div className="custom-select-options">
                        <div className="custom-select-option" onClick={() => { setAsignaturaSeleccionada(''); setAsignaturaNombre(''); setDropdownAbierto(null); }}>
                          Seleccionar...
                        </div>
                        {asignaturasDisponibles.map(asig => (
                          <div
                            key={asig.id}
                            className={`custom-select-option ${asignaturaSeleccionada === asig.id.toString() ? 'selected' : ''}`}
                            onClick={() => { setAsignaturaSeleccionada(asig.id); setAsignaturaNombre(asig.nombre); setDropdownAbierto(null); }}
                          >
                            {asig.nombre}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Móvil: Fila 2 - Trimestre y Botón */}
              <div className="form-row-movil" style={{ alignItems: 'flex-end' }}>
                <div className="form-group">
                  <label>Trimestre</label>
                  <div className="custom-select-container">
                    <div
                      className="custom-select-trigger"
                      onClick={() => setDropdownAbierto(dropdownAbierto === 'trimestre' ? null : 'trimestre')}
                    >
                      <span>{trimestreNombre || 'Todos'}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'trimestre' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'trimestre' && (
                      <div className="custom-select-options">
                        <div className="custom-select-option" onClick={() => { setTrimestreSeleccionado(''); setTrimestreNombre(''); setDropdownAbierto(null); }}>
                          Todos
                        </div>
                        {[
                          { id: '1', nombre: 'Primero' },
                          { id: '2', nombre: 'Segundo' },
                          { id: '3', nombre: 'Tercero' }
                        ].map(t => (
                          <div
                            key={t.id}
                            className={`custom-select-option ${trimestreSeleccionado === t.id ? 'selected' : ''}`}
                            onClick={() => { setTrimestreSeleccionado(t.id); setTrimestreNombre(t.nombre); setDropdownAbierto(null); }}
                          >
                            {t.nombre}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={analizarProgreso}>
                    Analizar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="docente-filtros-row" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
              <div className="form-group">
                <label>Curso</label>
                <select
                  className="form-control"
                  value={cursoSeleccionado}
                  onChange={(e) => {
                    const curso = cursos.find(c => c.id.toString() === e.target.value);
                    handleCursoChange(e.target.value, curso?.nombre || '');
                  }}
                >
                  <option value="">Seleccionar</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Asignatura</label>
                <select
                  className="form-control"
                  value={asignaturaSeleccionada}
                  onChange={(e) => {
                    const asig = asignaturasDisponibles.find(a => a.id.toString() === e.target.value);
                    setAsignaturaSeleccionada(e.target.value);
                    setAsignaturaNombre(asig?.nombre || '');
                  }}
                  disabled={!cursoSeleccionado}
                >
                  <option value="">{cursoSeleccionado ? 'Seleccionar' : 'Primero seleccione un curso'}</option>
                  {asignaturasDisponibles.map(asig => (
                    <option key={asig.id} value={asig.id}>{asig.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Trimestre</label>
                <select
                  className="form-control"
                  value={trimestreSeleccionado}
                  onChange={(e) => {
                    setTrimestreSeleccionado(e.target.value);
                    const nombres = { '1': 'Primero', '2': 'Segundo', '3': 'Tercero' };
                    setTrimestreNombre(nombres[e.target.value] || '');
                  }}
                >
                  <option value="">Todos</option>
                  <option value="1">Primero</option>
                  <option value="2">Segundo</option>
                  <option value="3">Tercero</option>
                </select>
              </div>
              <div className="docente-filtros-actions">
                <button className="btn btn-primary" onClick={analizarProgreso}>
                  Analizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      {estadisticas && (
        <>
          <div className="docente-kpis-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '12px' }}>
            <div className="docente-kpi-card kpi-primary" style={{ padding: '12px', gap: '10px' }}>
              <div className="docente-kpi-icon" style={{ width: '36px', height: '36px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="docente-kpi-data">
                <span className="docente-kpi-value" style={{ fontSize: '20px' }}>{estadisticas.alumnosConNotas}</span>
                <span className="docente-kpi-label" style={{ fontSize: '11px' }}>Total Alumnos</span>
              </div>
            </div>

            <div className="docente-kpi-card kpi-success" style={{ padding: '12px', gap: '10px' }}>
              <div className="docente-kpi-icon" style={{ width: '36px', height: '36px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="docente-kpi-data">
                <span className="docente-kpi-value" style={{ fontSize: '20px' }}>{estadisticas.aprobados}</span>
                <div className="docente-kpi-label-row" style={{ gap: '4px' }}>
                  <span className="docente-kpi-label" style={{ fontSize: '11px' }}>Aprobados</span>
                  <span className="docente-kpi-trend up" style={{ fontSize: '10px', padding: '1px 4px' }}>{estadisticas.porcentajeAprobados}%</span>
                </div>
              </div>
            </div>

            <div className="docente-kpi-card kpi-danger" style={{ padding: '12px', gap: '10px' }}>
              <div className="docente-kpi-icon" style={{ width: '36px', height: '36px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="docente-kpi-data">
                <span className="docente-kpi-value" style={{ fontSize: '20px' }}>{estadisticas.reprobados}</span>
                <div className="docente-kpi-label-row" style={{ gap: '4px' }}>
                  <span className="docente-kpi-label" style={{ fontSize: '11px' }}>Requieren Apoyo</span>
                  <span className="docente-kpi-trend down" style={{ fontSize: '10px', padding: '1px 4px' }}>{estadisticas.porcentajeReprobados}%</span>
                </div>
              </div>
            </div>

            <div className="docente-kpi-card kpi-info" style={{ padding: '12px', gap: '10px' }}>
              <div className="docente-kpi-icon" style={{ width: '36px', height: '36px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </div>
              <div className="docente-kpi-data">
                <span className="docente-kpi-value" style={{ fontSize: '20px' }}>{estadisticas.promedioCurso.toFixed(1)}</span>
                <span className="docente-kpi-label" style={{ fontSize: '11px' }}>Promedio Curso</span>
              </div>
            </div>

            <div className="docente-kpi-card kpi-warning" style={{ padding: '12px', gap: '10px' }}>
              <div className="docente-kpi-icon" style={{ width: '36px', height: '36px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="docente-kpi-data">
                <span className="docente-kpi-value" style={{ fontSize: '20px' }}>{estadisticas.notaMaxima.toFixed(1)}</span>
                <span className="docente-kpi-label" style={{ fontSize: '11px' }}>Nota Maxima</span>
              </div>
            </div>

            <div className="docente-kpi-card kpi-secondary" style={{ padding: '12px', gap: '10px' }}>
              <div className="docente-kpi-icon" style={{ width: '36px', height: '36px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 20V10" />
                  <path d="M12 20V4" />
                  <path d="M6 20v-6" />
                </svg>
              </div>
              <div className="docente-kpi-data">
                <span className="docente-kpi-value" style={{ fontSize: '20px' }}>{estadisticas.notaMinima.toFixed(1)}</span>
                <span className="docente-kpi-label" style={{ fontSize: '11px' }}>Nota Minima</span>
              </div>
            </div>
          </div>

          {/* Graficos */}
          <div className="docente-charts-grid" style={{ marginTop: '20px' }}>
            <div className="card docente-chart-card">
              <div className="card-header">
                <h3>Distribucion de Notas</h3>
              </div>
              <div className="card-body docente-chart-container">
                <Bar data={chartDistribucion} options={chartOptions} />
              </div>
            </div>

            <div className="card docente-chart-card">
              <div className="card-header">
                <h3>Rendimiento por Trimestre</h3>
              </div>
              <div className="card-body docente-chart-container">
                <Line data={chartTrimestre} options={lineOptions} plugins={[trimestrePlugin]} />
              </div>
            </div>

            <div className="card docente-chart-card">
              <div className="card-header">
                <h3>Tasa de Aprobacion</h3>
              </div>
              <div className="card-body docente-chart-container docente-chart-sm">
                <Doughnut data={chartAprobacion} options={doughnutOptions} />
              </div>
            </div>

            <div className="card docente-chart-card">
              <div className="card-header">
                <h3>Top 5 Mejores Promedios</h3>
              </div>
              <div className="card-body docente-chart-container">
                <Bar data={chartTop5} options={horizontalBarOptions} />
              </div>
            </div>
          </div>

          {/* Tabla alumnos atencion */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3>Alumnos que Requieren Atencion</h3>
            </div>
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
