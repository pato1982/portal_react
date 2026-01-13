import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useResponsive, useDropdown } from '../hooks';
import config from '../config/env';
import {
  KPICard,
  GraficoCard,
  FiltrosPanel,
  variacionPlugin,
  barOptions,
  horizontalBarOptions,
  doughnutOptions,
  tendenciaOptions,
  asistenciaMensualOptions,
  asistenciaCursoOptions,
  rankingAsistenciaOptions,
  getColorByValue,
  getColorByAsistencia
} from './estadisticas';

function EstadisticasTab() {
  const [vistaActual, setVistaActual] = useState('general');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaDocenteSeleccionada, setAsignaturaDocenteSeleccionada] = useState('');
  const [cursoAsistenciaSeleccionado, setCursoAsistenciaSeleccionado] = useState('');

  // Estados para datos de la API
  const [datosGenerales, setDatosGenerales] = useState(null);
  const [datosCurso, setDatosCurso] = useState(null);
  const [datosDocente, setDatosDocente] = useState(null);
  const [datosAsignatura, setDatosAsignatura] = useState(null);
  const [datosAsistencia, setDatosAsistencia] = useState(null);

  // Datos para gráficos
  const [asignaturasProm, setAsignaturasProm] = useState([]);
  const [rankingCursos, setRankingCursos] = useState([]);
  const [distribucion, setDistribucion] = useState({ destacados: 0, regulares: 0, enRiesgo: 0 });
  const [asistenciaPorCurso, setAsistenciaPorCurso] = useState([]);

  // Listas para selectores
  const [listaCursos, setListaCursos] = useState([]);
  const [listaDocentes, setListaDocentes] = useState([]);
  const [listaAsignaturas, setListaAsignaturas] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  // Cargar listas para selectores al montar
  useEffect(() => {
    cargarListas();
  }, []);

  // Cargar datos según vista activa
  useEffect(() => {
    if (vistaActual === 'general') {
      cargarDatosGenerales();
    } else if (vistaActual === 'asistencia') {
      cargarDatosAsistencia(cursoAsistenciaSeleccionado);
    }
  }, [vistaActual]);

  // Cargar datos de curso cuando se selecciona
  useEffect(() => {
    if (vistaActual === 'curso' && cursoSeleccionado) {
      cargarDatosCurso(cursoSeleccionado);
    }
  }, [cursoSeleccionado]);

  // Cargar datos de docente cuando se selecciona
  useEffect(() => {
    if (vistaActual === 'docente' && docenteSeleccionado) {
      cargarDatosDocente(docenteSeleccionado);
    }
  }, [docenteSeleccionado]);

  // Cargar stats de docente por asignatura
  useEffect(() => {
    if (vistaActual === 'docente' && docenteSeleccionado && asignaturaDocenteSeleccionada) {
      cargarDatosDocenteAsignatura(docenteSeleccionado, asignaturaDocenteSeleccionada);
    }
  }, [asignaturaDocenteSeleccionada]);

  // Cargar datos de asignatura cuando se selecciona
  useEffect(() => {
    if (vistaActual === 'asignatura' && asignaturaSeleccionada) {
      cargarDatosAsignatura(asignaturaSeleccionada);
    }
  }, [asignaturaSeleccionada]);

  // Cargar asistencia por curso
  useEffect(() => {
    if (vistaActual === 'asistencia') {
      cargarDatosAsistencia(cursoAsistenciaSeleccionado);
    }
  }, [cursoAsistenciaSeleccionado]);

  const cargarListas = async () => {
    try {
      const [cursosRes, docentesRes, asignaturasRes] = await Promise.all([
        fetch(`${config.apiBaseUrl}/estadisticas/cursos`),
        fetch(`${config.apiBaseUrl}/estadisticas/docentes`),
        fetch(`${config.apiBaseUrl}/estadisticas/asignaturas`)
      ]);

      const cursosData = await cursosRes.json();
      const docentesData = await docentesRes.json();
      const asignaturasData = await asignaturasRes.json();

      if (cursosData.success) setListaCursos(cursosData.data || []);
      if (docentesData.success) setListaDocentes(docentesData.data || []);
      if (asignaturasData.success) setListaAsignaturas(asignaturasData.data || []);
    } catch (err) {
      console.error('Error cargando listas:', err);
    }
  };

  const cargarDatosGenerales = async () => {
    setCargando(true);
    setError(null);
    try {
      const [generalRes, asigRes, rankingRes, distRes] = await Promise.all([
        fetch(`${config.apiBaseUrl}/estadisticas/general`),
        fetch(`${config.apiBaseUrl}/estadisticas/general/asignaturas`),
        fetch(`${config.apiBaseUrl}/estadisticas/general/ranking-cursos`),
        fetch(`${config.apiBaseUrl}/estadisticas/general/distribucion`)
      ]);

      const generalData = await generalRes.json();
      const asigData = await asigRes.json();
      const rankingData = await rankingRes.json();
      const distData = await distRes.json();

      if (generalData.success) setDatosGenerales(generalData.data);
      if (asigData.success) setAsignaturasProm(asigData.data || []);
      if (rankingData.success) setRankingCursos(rankingData.data || []);
      if (distData.success) setDistribucion(distData.data);
    } catch (err) {
      setError('Error al cargar estadísticas generales');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosCurso = async (cursoId) => {
    setCargando(true);
    try {
      const [cursoRes, asigRes] = await Promise.all([
        fetch(`${config.apiBaseUrl}/estadisticas/curso/${cursoId}`),
        fetch(`${config.apiBaseUrl}/estadisticas/curso/${cursoId}/asignaturas`)
      ]);

      const cursoData = await cursoRes.json();
      const asigData = await asigRes.json();

      if (cursoData.success) setDatosCurso(cursoData.data);
      if (asigData.success) setAsignaturasProm(asigData.data || []);
    } catch (err) {
      console.error('Error cargando datos del curso:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosDocente = async (docenteId) => {
    setCargando(true);
    try {
      const res = await fetch(`${config.apiBaseUrl}/estadisticas/docente/${docenteId}`);
      const data = await res.json();

      if (data.success) {
        setDatosDocente(data.data);
        // Auto-seleccionar asignatura si solo tiene una
        if (data.data.asignaturas?.length === 1) {
          setAsignaturaDocenteSeleccionada(data.data.asignaturasDetalle[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error cargando datos del docente:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosDocenteAsignatura = async (docenteId, asignaturaId) => {
    setCargando(true);
    try {
      const res = await fetch(`${config.apiBaseUrl}/estadisticas/docente/${docenteId}/asignatura/${asignaturaId}`);
      const data = await res.json();

      if (data.success) {
        setDatosDocente(prev => ({ ...prev, ...data.data }));
        setAsignaturasProm(data.data.promediosPorCurso || []);
      }
    } catch (err) {
      console.error('Error cargando datos docente/asignatura:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosAsignatura = async (asignaturaId) => {
    setCargando(true);
    try {
      const [asigRes, porCursoRes] = await Promise.all([
        fetch(`${config.apiBaseUrl}/estadisticas/asignatura/${asignaturaId}`),
        fetch(`${config.apiBaseUrl}/estadisticas/asignatura/${asignaturaId}/por-curso`)
      ]);

      const asigData = await asigRes.json();
      const porCursoData = await porCursoRes.json();

      if (asigData.success) setDatosAsignatura(asigData.data);
      if (porCursoData.success) setAsignaturasProm(porCursoData.data || []);
    } catch (err) {
      console.error('Error cargando datos de asignatura:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosAsistencia = async (cursoId) => {
    setCargando(true);
    try {
      const endpoint = cursoId
        ? `${config.apiBaseUrl}/estadisticas/asistencia/curso/${cursoId}`
        : `${config.apiBaseUrl}/estadisticas/asistencia/general`;

      const [asistRes, porCursoRes, rankingRes] = await Promise.all([
        fetch(endpoint),
        fetch(`${config.apiBaseUrl}/estadisticas/asistencia/por-curso`),
        fetch(`${config.apiBaseUrl}/estadisticas/asistencia/ranking`)
      ]);

      const asistData = await asistRes.json();
      const porCursoData = await porCursoRes.json();
      const rankingData = await rankingRes.json();

      if (asistData.success) setDatosAsistencia(asistData.data);
      if (porCursoData.success) setAsistenciaPorCurso(porCursoData.data || []);
      if (rankingData.success) setRankingCursos(rankingData.data || []);
    } catch (err) {
      console.error('Error cargando datos de asistencia:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleVistaChange = (vista) => {
    setVistaActual(vista);
    setCursoSeleccionado('');
    setDocenteSeleccionado('');
    setAsignaturaSeleccionada('');
    setAsignaturaDocenteSeleccionada('');
    setCursoAsistenciaSeleccionado('');
    setDatosCurso(null);
    setDatosDocente(null);
    setDatosAsignatura(null);
    setAsignaturasProm([]);
  };

  const handleDocenteChange = (docenteId) => {
    setDocenteSeleccionado(docenteId);
    setAsignaturaDocenteSeleccionada('');
  };

  // Obtener datos actuales según vista
  const getDatosActuales = () => {
    if (vistaActual === 'curso' && datosCurso) return datosCurso;
    if (vistaActual === 'docente' && datosDocente) return datosDocente;
    if (vistaActual === 'asignatura' && datosAsignatura) return datosAsignatura;
    if (vistaActual === 'asistencia' && datosAsistencia) return datosAsistencia;
    return datosGenerales || {};
  };

  const datos = getDatosActuales();

  // Generadores de datos para gráficos
  const getTendenciaData = () => ({
    labels: datosGenerales?.meses || ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      data: datos.tendencia || datos.tendenciaMensual || [],
      borderColor: '#1e3a5f',
      backgroundColor: 'rgba(30, 58, 95, 0.1)',
      fill: true,
      tension: 0.4
    }]
  });

  const getAsignaturasData = () => {
    if (asignaturasProm.length === 0) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }

    return {
      labels: asignaturasProm.map(a => a.asignatura || a.curso),
      datasets: [{
        data: asignaturasProm.map(a => a.promedio),
        backgroundColor: asignaturasProm.map(a => getColorByValue(a.promedio)),
        borderRadius: 4
      }]
    };
  };

  const getDistribucionData = () => {
    const dest = distribucion.destacados || datos.destacados || 0;
    const reg = distribucion.regulares || 0;
    const riesgo = distribucion.enRiesgo || datos.riesgo || 0;

    return {
      labels: ['Destacados', 'Regulares', 'En Riesgo'],
      datasets: [{
        data: [dest, reg, riesgo],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        borderWidth: 0
      }]
    };
  };

  const getRankingData = () => {
    if (rankingCursos.length === 0) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }

    return {
      labels: rankingCursos.map(c => (c.curso || c.nombre || '').replace(' Basico', 'B').replace(' Medio', 'M')),
      datasets: [{
        data: rankingCursos.map(c => c.promedio || c.promedioAsistencia),
        backgroundColor: rankingCursos.map((c, i) =>
          i === 0 ? '#10b981' : i === 1 ? '#34d399' : i === 2 ? '#6ee7b7' : '#a7f3d0'
        ),
        borderRadius: 4
      }]
    };
  };

  // Datos para gráficos de asistencia
  const getAsistenciaMensualData = () => {
    const mensual = datosAsistencia?.asistenciaMensual || {};
    return {
      labels: Object.keys(mensual),
      datasets: [{
        data: Object.values(mensual),
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  };

  const getDistribucionAsistenciaData = () => {
    const asist100 = datosAsistencia?.asistencia100 || 0;
    const bajo85 = datosAsistencia?.bajoUmbral85 || 0;
    const total = datosAsistencia?.totalAlumnos || 0;
    const regulares = Math.max(0, total - asist100 - bajo85);

    return {
      labels: ['100% Asistencia', 'Asistencia Regular', 'Bajo 85%'],
      datasets: [{
        data: [asist100, regulares, bajo85],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        borderWidth: 0
      }]
    };
  };

  const getAsistenciaPorCursoData = () => {
    if (asistenciaPorCurso.length === 0) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }

    return {
      labels: asistenciaPorCurso.map(c => (c.curso || '').replace(' Basico', 'B').replace(' Medio', 'M')),
      datasets: [{
        data: asistenciaPorCurso.map(c => c.promedioAsistencia),
        backgroundColor: asistenciaPorCurso.map(c => getColorByAsistencia(c.promedioAsistencia)),
        borderRadius: 4
      }]
    };
  };

  const getRankingAsistenciaData = () => {
    if (rankingCursos.length === 0) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }

    return {
      labels: rankingCursos.map(c => (c.curso || '').replace(' Basico', 'B').replace(' Medio', 'M')),
      datasets: [{
        data: rankingCursos.map(c => c.promedioAsistencia),
        backgroundColor: rankingCursos.map((c, i) =>
          cursoAsistenciaSeleccionado && c.curso_id === parseInt(cursoAsistenciaSeleccionado)
            ? '#1e3a5f'
            : i === 0 ? '#10b981' : i === 1 ? '#34d399' : i === 2 ? '#6ee7b7' : '#a7f3d0'
        ),
        borderRadius: 4
      }]
    };
  };

  // Helpers para títulos
  const getTituloAsignaturas = () => {
    if (vistaActual === 'general') return 'Promedio General por Asignatura';
    if (vistaActual === 'curso' && cursoSeleccionado) return 'Promedio por Asignatura';
    if (vistaActual === 'docente' && asignaturaDocenteSeleccionada) {
      const asig = datosDocente?.asignaturasDetalle?.find(a => a.id.toString() === asignaturaDocenteSeleccionada);
      return asig ? `${asig.nombre} en sus Cursos` : 'Promedio por Curso';
    }
    if (vistaActual === 'asignatura' && asignaturaSeleccionada) {
      const asig = listaAsignaturas.find(a => a.id.toString() === asignaturaSeleccionada);
      return asig ? `${asig.nombre} por Curso` : 'Asignatura por Curso';
    }
    return 'Promedio General por Asignatura';
  };

  const getBadgeAsignaturas = () => {
    if (vistaActual === 'general') return 'Establecimiento';
    if (vistaActual === 'curso' && cursoSeleccionado) {
      const curso = listaCursos.find(c => c.id.toString() === cursoSeleccionado);
      return curso?.nombre || cursoSeleccionado;
    }
    if (vistaActual === 'docente' && docenteSeleccionado) {
      const doc = listaDocentes.find(d => d.id.toString() === docenteSeleccionado);
      return doc?.nombre?.split(',')[0] || '';
    }
    if (vistaActual === 'asignatura') return 'Todos los cursos';
    return 'Establecimiento';
  };

  // Preparar datos para FiltrosPanel (formato compatible)
  const datosPorCurso = {};
  listaCursos.forEach(c => { datosPorCurso[c.id] = { nombre: c.nombre }; });

  const datosPorDocente = {};
  listaDocentes.forEach(d => {
    datosPorDocente[d.id] = {
      nombre: d.nombre,
      asignaturas: d.asignaturas ? d.asignaturas.split(', ') : [],
      asignaturasIds: datosDocente?.asignaturasDetalle || []
    };
  });

  const datosPorAsignatura = {};
  listaAsignaturas.forEach(a => { datosPorAsignatura[a.id] = { nombre: a.nombre }; });

  const datosAsistenciaPorCursoMap = {};
  listaCursos.forEach(c => { datosAsistenciaPorCursoMap[c.id] = { nombre: c.nombre }; });

  // Nombre del curso/docente/asignatura seleccionado
  const getNombreCurso = () => listaCursos.find(c => c.id.toString() === cursoSeleccionado)?.nombre || '';
  const getNombreDocente = () => listaDocentes.find(d => d.id.toString() === docenteSeleccionado)?.nombre || '';
  const getNombreAsignatura = () => listaAsignaturas.find(a => a.id.toString() === asignaturaSeleccionada)?.nombre || '';

  return (
    <div className="tab-panel active">
      <div className="estadisticas-dashboard">

        <FiltrosPanel
          vistaActual={vistaActual}
          cursoSeleccionado={cursoSeleccionado}
          docenteSeleccionado={docenteSeleccionado}
          asignaturaSeleccionada={asignaturaSeleccionada}
          asignaturaDocenteSeleccionada={asignaturaDocenteSeleccionada}
          cursoAsistenciaSeleccionado={cursoAsistenciaSeleccionado}
          onVistaChange={handleVistaChange}
          onCursoChange={setCursoSeleccionado}
          onDocenteChange={handleDocenteChange}
          onAsignaturaChange={setAsignaturaSeleccionada}
          onAsignaturaDocenteChange={setAsignaturaDocenteSeleccionada}
          onCursoAsistenciaChange={setCursoAsistenciaSeleccionado}
          datosPorCurso={datosPorCurso}
          datosPorDocente={datosPorDocente}
          datosPorAsignatura={datosPorAsignatura}
          datosAsistenciaPorCurso={datosAsistenciaPorCursoMap}
          isMobile={isMobile}
          dropdownAbierto={dropdownAbierto}
          setDropdownAbierto={setDropdownAbierto}
        />

        {/* Estado de carga */}
        {cargando && (
          <div className="stats-loading">
            <div className="spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="stats-error">
            <p>{error}</p>
          </div>
        )}

        {/* Título de la vista actual */}
        <div className="stats-vista-titulo">
          <h2>
            {vistaActual === 'general' && 'Resumen General del Establecimiento'}
            {vistaActual === 'curso' && (cursoSeleccionado ? `Curso: ${getNombreCurso()}` : 'Seleccione un curso')}
            {vistaActual === 'docente' && (docenteSeleccionado
              ? (asignaturaDocenteSeleccionada
                ? `Docente: ${getNombreDocente()}`
                : `Docente: ${getNombreDocente()} - Seleccione asignatura`)
              : 'Seleccione un docente')}
            {vistaActual === 'asignatura' && (asignaturaSeleccionada ? `Asignatura: ${getNombreAsignatura()}` : 'Seleccione una asignatura')}
            {vistaActual === 'asistencia' && (cursoAsistenciaSeleccionado
              ? `Asistencia: ${listaCursos.find(c => c.id.toString() === cursoAsistenciaSeleccionado)?.nombre || ''}`
              : 'Asistencia General del Establecimiento')}
          </h2>
          {vistaActual === 'docente' && docenteSeleccionado && asignaturaDocenteSeleccionada && (
            <span className="stats-vista-subtitulo">
              {datosDocente?.asignaturas?.find(a => datosDocente?.asignaturasDetalle?.find(d => d.id.toString() === asignaturaDocenteSeleccionada)?.nombre === a) || ''} - {datosDocente?.cursos?.length || 0} cursos asignados
            </span>
          )}
          {vistaActual === 'asignatura' && asignaturaSeleccionada && datosAsignatura && (
            <span className="stats-vista-subtitulo">{datosAsignatura.docentes} docentes imparten esta asignatura</span>
          )}
        </div>

        {/* KPIs */}
        {!cargando && vistaActual !== 'asistencia' && datos && (
          <div className="stats-kpis-row">
            <KPICard
              tipo="promedio"
              className="kpi-principal"
              label="Promedio"
              value={datos.promedio || datos.promedioGeneral || 0}
              sublabel={vistaActual === 'general' ? 'Establecimiento' : (vistaActual === 'curso' ? getNombreCurso() : 'General')}
            />
            <KPICard
              tipo="aprobacion"
              className="kpi-success"
              label="Aprobacion"
              value={`${datos.aprobacion || datos.tasaAprobacion || 0}%`}
              sublabel="Tasa de aprobacion"
            />
            {vistaActual !== 'docente' && (
              <KPICard
                tipo="asistencia"
                className="kpi-asistencia"
                label="% Asistencia"
                value={`${datos.asistencia || datosGenerales?.asistencia || 0}%`}
                sublabel={vistaActual === 'general' ? 'Establecimiento' : (getNombreCurso() || 'Establecimiento')}
              />
            )}
            <KPICard
              tipo="alumnos"
              className="kpi-info"
              label={vistaActual === 'asignatura' ? 'Mejor Curso' : 'Alumnos'}
              value={vistaActual === 'asignatura' ? (datosAsignatura?.mejorCurso || '-') : (datos.alumnos || datos.totalAlumnos || 0)}
              sublabel={vistaActual === 'asignatura' ? 'Mayor promedio' : 'Total'}
            />
            {vistaActual !== 'asignatura' && (
              <>
                <KPICard
                  tipo="destacados"
                  className="kpi-success-light"
                  label="Destacados"
                  value={datos.destacados || datos.alumnosDestacados || 0}
                  sublabel="Sobre 6.0"
                />
                <KPICard
                  tipo="riesgo"
                  className="kpi-danger-light"
                  label="En Riesgo"
                  value={datos.riesgo || datos.alumnosRiesgo || 0}
                  sublabel="Bajo 4.0"
                />
              </>
            )}
            {vistaActual === 'asignatura' && datosAsignatura && (
              <>
                <KPICard
                  tipo="riesgo"
                  className="kpi-danger-light"
                  label="Peor Curso"
                  value={datosAsignatura.peorCurso || '-'}
                  sublabel="Menor promedio"
                />
                <KPICard
                  tipo="docente"
                  className="kpi-info"
                  label="Docentes"
                  value={datosAsignatura.docentes || 0}
                  sublabel="Imparten esta asig."
                />
              </>
            )}
          </div>
        )}

        {/* KPIs de Asistencia */}
        {!cargando && vistaActual === 'asistencia' && datosAsistencia && (
          <div className="stats-kpis-row">
            <KPICard
              tipo="aprobacion"
              className="kpi-principal"
              label="Asistencia Promedio"
              value={`${datosAsistencia.promedioAsistencia || 0}%`}
              sublabel={cursoAsistenciaSeleccionado ? listaCursos.find(c => c.id.toString() === cursoAsistenciaSeleccionado)?.nombre : 'Establecimiento'}
            />
            <KPICard
              tipo="alumnos"
              className="kpi-info"
              label="Total Alumnos"
              value={datosAsistencia.totalAlumnos || 0}
              sublabel={`En el ${cursoAsistenciaSeleccionado ? 'curso' : 'establecimiento'}`}
            />
            <KPICard
              tipo="destacados"
              className="kpi-success-light"
              label="Asistencia 100%"
              value={datosAsistencia.asistencia100 || 0}
              sublabel="Alumnos con asist. perfecta"
            />
            <KPICard
              tipo="riesgo"
              className="kpi-danger-light"
              label="Riesgo Repitencia"
              value={datosAsistencia.bajoUmbral85 || 0}
              sublabel="Bajo 85% asistencia"
            />
          </div>
        )}

        {/* Gráficos - Vista normal */}
        {!cargando && vistaActual !== 'asistencia' && datos && (
          <div className="stats-graficos-grid">
            <GraficoCard titulo={getTituloAsignaturas()} badge={getBadgeAsignaturas()}>
              <Bar data={getAsignaturasData()} options={barOptions} />
            </GraficoCard>

            <GraficoCard
              titulo={vistaActual === 'general' ? 'Distribucion de Alumnos' : `Alumnos ${getNombreCurso() ? `de ${getNombreCurso()}` : ''}`}
              badge={vistaActual === 'general' ? 'Establecimiento' : (getNombreCurso() || 'Establecimiento')}
            >
              <Doughnut data={getDistribucionData()} options={doughnutOptions} />
            </GraficoCard>

            <GraficoCard
              titulo={vistaActual === 'general' ? 'Tendencia del Establecimiento' : `Tendencia ${getNombreCurso() ? `de ${getNombreCurso()}` : ''}`}
              badge="Ultimos meses"
            >
              <Line data={getTendenciaData()} options={tendenciaOptions} plugins={[variacionPlugin]} />
            </GraficoCard>

            <GraficoCard
              titulo={vistaActual === 'curso' && cursoSeleccionado ? 'Promedios por Asignatura' : 'Top 5 Mejores Cursos'}
              badge={vistaActual === 'curso' && cursoSeleccionado ? getNombreCurso() : 'Ranking'}
            >
              <Bar data={getRankingData()} options={horizontalBarOptions} />
            </GraficoCard>
          </div>
        )}

        {/* Gráficos - Vista Asistencia */}
        {!cargando && vistaActual === 'asistencia' && datosAsistencia && (
          <div className="stats-graficos-grid">
            <GraficoCard
              titulo={cursoAsistenciaSeleccionado ? 'Asistencia Mensual' : 'Asistencia por Curso'}
              badge={cursoAsistenciaSeleccionado ? listaCursos.find(c => c.id.toString() === cursoAsistenciaSeleccionado)?.nombre : 'Todos los cursos'}
            >
              <Bar data={getAsistenciaPorCursoData()} options={asistenciaCursoOptions} />
            </GraficoCard>

            <GraficoCard
              titulo="Distribucion de Asistencia"
              badge={cursoAsistenciaSeleccionado ? listaCursos.find(c => c.id.toString() === cursoAsistenciaSeleccionado)?.nombre : 'Establecimiento'}
            >
              <Doughnut data={getDistribucionAsistenciaData()} options={doughnutOptions} />
            </GraficoCard>

            <GraficoCard
              titulo="Asistencia Mes a Mes"
              badge={cursoAsistenciaSeleccionado ? listaCursos.find(c => c.id.toString() === cursoAsistenciaSeleccionado)?.nombre : 'Establecimiento'}
            >
              <Line data={getAsistenciaMensualData()} options={asistenciaMensualOptions} />
            </GraficoCard>

            <GraficoCard
              titulo={cursoAsistenciaSeleccionado ? 'Comparativa con otros cursos' : 'Ranking de Asistencia'}
              badge={cursoAsistenciaSeleccionado ? listaCursos.find(c => c.id.toString() === cursoAsistenciaSeleccionado)?.nombre : 'Por curso'}
            >
              <Bar data={getRankingAsistenciaData()} options={rankingAsistenciaOptions} />
            </GraficoCard>
          </div>
        )}

        {/* Info adicional según vista */}
        {vistaActual === 'docente' && docenteSeleccionado && datosDocente && (
          <div className="stats-info-adicional">
            <div className="stats-info-card">
              <h4>Cursos asignados</h4>
              <div className="stats-cursos-list">
                {datosDocente.cursos?.map(curso => (
                  <span key={curso} className="stats-curso-tag">{curso}</span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default EstadisticasTab;
