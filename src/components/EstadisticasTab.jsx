import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { cursosDB, docentesDB, asignaturasDB } from '../data/demoData';

// Plugin para mostrar porcentajes de variación en el gráfico de tendencia
const variacionPlugin = {
  id: 'variacionPlugin',
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    if (!meta.data || meta.data.length < 2) return;

    const data = dataset.data;

    ctx.save();
    ctx.font = 'bold 7px Arial';
    ctx.textAlign = 'center';

    for (let i = 1; i < meta.data.length; i++) {
      const prev = meta.data[i - 1];
      const curr = meta.data[i];

      const variacion = ((data[i] - data[i-1]) / data[i-1]) * 100;
      const texto = variacion >= 0 ? `+${variacion.toFixed(1)}%` : `${variacion.toFixed(1)}%`;

      // Posición entre los dos puntos
      const x = (prev.x + curr.x) / 2;
      const y = (prev.y + curr.y) / 2 - 10;

      // Color según variación
      ctx.fillStyle = variacion >= 0 ? '#10b981' : '#ef4444';
      ctx.fillText(texto, x, y);
    }

    ctx.restore();
  }
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function EstadisticasTab() {
  const [vistaActual, setVistaActual] = useState('general');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaDocenteSeleccionada, setAsignaturaDocenteSeleccionada] = useState('');
  const [cursoAsistenciaSeleccionado, setCursoAsistenciaSeleccionado] = useState('');
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

  // Datos demo generales
  const datosGenerales = {
    promedioGeneral: 5.8,
    tasaAprobacion: 87,
    totalAlumnos: 450,
    totalDocentes: 25,
    alumnosDestacados: 45,
    alumnosRiesgo: 28,
    asistencia: 92,
    tendenciaMensual: [5.2, 5.3, 5.4, 5.5, 5.5, 5.6, 5.6, 5.7, 5.7, 5.8],
    meses: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  };

  // Datos por curso
  const datosPorCurso = {
    '1° Basico A': { promedio: 5.4, aprobacion: 85, alumnos: 32, destacados: 4, riesgo: 3, asistencia: 91, asignaturas: { 'Matematicas': 4.8, 'Lenguaje': 5.5, 'Historia': 5.6, 'Ciencias': 5.2, 'Ingles': 5.1, 'Ed. Fisica': 6.0 } },
    '2° Basico A': { promedio: 5.6, aprobacion: 88, alumnos: 30, destacados: 5, riesgo: 2, asistencia: 93, asignaturas: { 'Matematicas': 5.0, 'Lenguaje': 5.7, 'Historia': 5.8, 'Ciencias': 5.4, 'Ingles': 5.3, 'Ed. Fisica': 6.2 } },
    '7° Basico A': { promedio: 4.8, aprobacion: 75, alumnos: 33, destacados: 2, riesgo: 8, asistencia: 85, asignaturas: { 'Matematicas': 4.2, 'Lenguaje': 4.9, 'Historia': 5.0, 'Ciencias': 4.6, 'Ingles': 4.5, 'Ed. Fisica': 5.6 } },
    '1° Medio A': { promedio: 5.7, aprobacion: 87, alumnos: 38, destacados: 6, riesgo: 3, asistencia: 90, asignaturas: { 'Matematicas': 5.2, 'Lenguaje': 5.8, 'Historia': 6.0, 'Ciencias': 5.5, 'Ingles': 5.6, 'Ed. Fisica': 6.1 } },
    '2° Medio A': { promedio: 5.9, aprobacion: 91, alumnos: 36, destacados: 8, riesgo: 2, asistencia: 92, asignaturas: { 'Matematicas': 5.4, 'Lenguaje': 6.0, 'Historia': 6.1, 'Ciencias': 5.7, 'Ingles': 5.8, 'Ed. Fisica': 6.3 } },
    '4° Medio A': { promedio: 6.2, aprobacion: 94, alumnos: 36, destacados: 12, riesgo: 1, asistencia: 95, asignaturas: { 'Matematicas': 5.8, 'Lenguaje': 6.3, 'Historia': 6.4, 'Ciencias': 6.0, 'Ingles': 6.1, 'Ed. Fisica': 6.5 } }
  };

  // Datos por docente (asignaturas es un array, puede tener más de una)
  const datosPorDocente = {
    'Martinez Soto, Pedro': {
      asignaturas: ['Ed. Fisica', 'Ciencias'],
      cursos: ['1° Basico A', '2° Basico A', '1° Medio A', '2° Medio A', '4° Medio A'],
      alumnos: 172,
      datosPorAsignatura: {
        'Ed. Fisica': { promedio: 6.1, aprobacion: 98, tendencia: [5.6, 5.7, 5.8, 5.9, 5.9, 6.0, 6.0, 6.0, 6.1, 6.1] },
        'Ciencias': { promedio: 5.4, aprobacion: 82, tendencia: [4.9, 5.0, 5.1, 5.1, 5.2, 5.2, 5.3, 5.3, 5.4, 5.4] }
      }
    },
    'Gonzalez Perez, Maria': {
      asignaturas: ['Matematicas', 'Ciencias'],
      cursos: ['7° Basico A', '1° Medio A', '2° Medio A'],
      alumnos: 107,
      datosPorAsignatura: {
        'Matematicas': { promedio: 5.2, aprobacion: 78, tendencia: [4.8, 4.9, 4.9, 5.0, 5.0, 5.1, 5.1, 5.1, 5.2, 5.2] },
        'Ciencias': { promedio: 5.3, aprobacion: 80, tendencia: [4.8, 4.9, 5.0, 5.1, 5.1, 5.2, 5.2, 5.2, 5.3, 5.3] }
      }
    },
    'Rodriguez Silva, Juan': {
      asignaturas: ['Lenguaje', 'Historia'],
      cursos: ['1° Basico A', '2° Basico A', '7° Basico A', '1° Medio A'],
      alumnos: 133,
      datosPorAsignatura: {
        'Lenguaje': { promedio: 5.8, aprobacion: 88, tendencia: [5.3, 5.4, 5.5, 5.5, 5.6, 5.6, 5.7, 5.7, 5.8, 5.8] },
        'Historia': { promedio: 5.7, aprobacion: 86, tendencia: [5.2, 5.3, 5.4, 5.4, 5.5, 5.5, 5.6, 5.6, 5.7, 5.7] }
      }
    },
    'Lopez Muñoz, Ana': {
      asignaturas: ['Ingles'],
      cursos: ['1° Medio A', '2° Medio A', '4° Medio A'],
      alumnos: 110,
      datosPorAsignatura: {
        'Ingles': { promedio: 5.6, aprobacion: 85, tendencia: [5.1, 5.2, 5.3, 5.3, 5.4, 5.4, 5.5, 5.5, 5.6, 5.6] }
      }
    },
    'Fernandez Castro, Carmen': {
      asignaturas: ['Historia'],
      cursos: ['7° Basico A', '1° Medio A', '2° Medio A', '4° Medio A'],
      alumnos: 143,
      datosPorAsignatura: {
        'Historia': { promedio: 5.9, aprobacion: 90, tendencia: [5.4, 5.5, 5.6, 5.6, 5.7, 5.7, 5.8, 5.8, 5.9, 5.9] }
      }
    }
  };

  // Datos por asignatura (promedio general del colegio)
  const datosPorAsignatura = {
    'Matematicas': { promedio: 4.9, aprobacion: 78, mejorCurso: '4° Medio A', peorCurso: '7° Basico A', docentes: 3, tendencia: [4.4, 4.5, 4.6, 4.6, 4.7, 4.7, 4.8, 4.8, 4.9, 4.9] },
    'Lenguaje': { promedio: 5.7, aprobacion: 86, mejorCurso: '4° Medio A', peorCurso: '7° Basico A', docentes: 3, tendencia: [5.2, 5.3, 5.4, 5.4, 5.5, 5.5, 5.6, 5.6, 5.7, 5.7] },
    'Historia': { promedio: 5.8, aprobacion: 88, mejorCurso: '4° Medio A', peorCurso: '7° Basico A', docentes: 2, tendencia: [5.3, 5.4, 5.5, 5.5, 5.6, 5.6, 5.7, 5.7, 5.8, 5.8] },
    'Ciencias': { promedio: 5.4, aprobacion: 82, mejorCurso: '4° Medio A', peorCurso: '7° Basico A', docentes: 2, tendencia: [4.9, 5.0, 5.1, 5.1, 5.2, 5.2, 5.3, 5.3, 5.4, 5.4] },
    'Ingles': { promedio: 5.5, aprobacion: 84, mejorCurso: '4° Medio A', peorCurso: '1° Basico A', docentes: 2, tendencia: [5.0, 5.1, 5.2, 5.2, 5.3, 5.3, 5.4, 5.4, 5.5, 5.5] },
    'Ed. Fisica': { promedio: 6.1, aprobacion: 96, mejorCurso: '4° Medio A', peorCurso: '7° Basico A', docentes: 2, tendencia: [5.6, 5.7, 5.8, 5.8, 5.9, 5.9, 6.0, 6.0, 6.1, 6.1] }
  };

  // Datos de asistencia por curso (para vista de Asistencia)
  const datosAsistenciaPorCurso = {
    '1° Basico A': {
      totalAlumnos: 32,
      asistencia100: 8,
      bajoUmbral85: 3,
      promedioAsistencia: 91,
      asistenciaMensual: { Mar: 93, Abr: 92, May: 90, Jun: 89, Jul: 91, Ago: 92 }
    },
    '2° Basico A': {
      totalAlumnos: 30,
      asistencia100: 10,
      bajoUmbral85: 2,
      promedioAsistencia: 93,
      asistenciaMensual: { Mar: 94, Abr: 93, May: 92, Jun: 93, Jul: 94, Ago: 93 }
    },
    '7° Basico A': {
      totalAlumnos: 33,
      asistencia100: 4,
      bajoUmbral85: 6,
      promedioAsistencia: 85,
      asistenciaMensual: { Mar: 88, Abr: 86, May: 84, Jun: 83, Jul: 85, Ago: 86 }
    },
    '1° Medio A': {
      totalAlumnos: 38,
      asistencia100: 9,
      bajoUmbral85: 4,
      promedioAsistencia: 90,
      asistenciaMensual: { Mar: 92, Abr: 91, May: 89, Jun: 88, Jul: 90, Ago: 91 }
    },
    '2° Medio A': {
      totalAlumnos: 36,
      asistencia100: 12,
      bajoUmbral85: 2,
      promedioAsistencia: 92,
      asistenciaMensual: { Mar: 93, Abr: 92, May: 91, Jun: 92, Jul: 93, Ago: 92 }
    },
    '4° Medio A': {
      totalAlumnos: 36,
      asistencia100: 15,
      bajoUmbral85: 1,
      promedioAsistencia: 95,
      asistenciaMensual: { Mar: 96, Abr: 95, May: 94, Jun: 95, Jul: 96, Ago: 95 }
    }
  };

  // Datos generales de asistencia del establecimiento
  const datosAsistenciaGeneral = {
    totalAlumnos: 205,
    asistencia100: 58,
    bajoUmbral85: 18,
    promedioAsistencia: 91,
    asistenciaMensual: { Mar: 93, Abr: 92, May: 90, Jun: 90, Jul: 92, Ago: 92 }
  };

  const handleVistaChange = (vista) => {
    setVistaActual(vista);
    setCursoSeleccionado('');
    setDocenteSeleccionado('');
    setAsignaturaSeleccionada('');
    setAsignaturaDocenteSeleccionada('');
    setCursoAsistenciaSeleccionado('');
  };

  const handleDocenteChange = (docente) => {
    setDocenteSeleccionado(docente);
    setAsignaturaDocenteSeleccionada('');
    // Si el docente tiene solo una asignatura, seleccionarla automáticamente
    if (docente && datosPorDocente[docente]?.asignaturas.length === 1) {
      setAsignaturaDocenteSeleccionada(datosPorDocente[docente].asignaturas[0]);
    }
  };

  // Obtener la asignatura actual del docente (la seleccionada o la primera si solo tiene una)
  const getAsignaturaDocente = () => {
    if (!docenteSeleccionado) return null;
    const docente = datosPorDocente[docenteSeleccionado];
    if (!docente) return null;
    return asignaturaDocenteSeleccionada || (docente.asignaturas.length === 1 ? docente.asignaturas[0] : null);
  };

  // Obtener datos según la vista actual
  const getDatosActuales = () => {
    if (vistaActual === 'curso' && cursoSeleccionado) {
      return datosPorCurso[cursoSeleccionado];
    }
    if (vistaActual === 'docente' && docenteSeleccionado) {
      const docente = datosPorDocente[docenteSeleccionado];
      const asigActual = getAsignaturaDocente();
      if (asigActual && docente.datosPorAsignatura[asigActual]) {
        return {
          ...docente,
          asignatura: asigActual,
          promedio: docente.datosPorAsignatura[asigActual].promedio,
          aprobacion: docente.datosPorAsignatura[asigActual].aprobacion,
          tendencia: docente.datosPorAsignatura[asigActual].tendencia
        };
      }
      return { ...docente, asignatura: null };
    }
    if (vistaActual === 'asignatura' && asignaturaSeleccionada) {
      return datosPorAsignatura[asignaturaSeleccionada];
    }
    return datosGenerales;
  };

  const datos = getDatosActuales();
  const asignaturaDocente = getAsignaturaDocente();

  // Configuración de gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: false, min: 4, max: 7 }
    }
  };

  // Opciones específicas para gráfico de tendencia con variaciones
  const tendenciaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: false, min: 4, max: 7 }
    }
  };

  // Gráfico de tendencia
  const getTendenciaData = () => ({
    labels: datosGenerales.meses,
    datasets: [{
      data: datos.tendencia || datos.tendenciaMensual || [5.5, 5.5, 5.6, 5.6, 5.7, 5.7],
      borderColor: '#1e3a5f',
      backgroundColor: 'rgba(30, 58, 95, 0.1)',
      fill: true,
      tension: 0.4
    }]
  });

  // Gráfico de asignaturas (dinámico según vista)
  const getAsignaturasData = () => {
    // Vista Curso: promedios de todas las asignaturas del curso seleccionado
    if (vistaActual === 'curso' && cursoSeleccionado && datos.asignaturas) {
      return {
        labels: Object.keys(datos.asignaturas),
        datasets: [{
          data: Object.values(datos.asignaturas),
          backgroundColor: Object.values(datos.asignaturas).map(v =>
            v >= 5.5 ? '#10b981' : v >= 5.0 ? '#f59e0b' : '#ef4444'
          ),
          borderRadius: 4
        }]
      };
    }

    // Vista Docente: promedio de su asignatura en los cursos que imparte
    if (vistaActual === 'docente' && docenteSeleccionado && asignaturaDocente) {
      const cursosDocente = datos.cursos || [];
      const cursosConPromedio = cursosDocente
        .map(curso => ({
          nombre: curso,
          promedio: datosPorCurso[curso]?.asignaturas[asignaturaDocente] || 0
        }))
        .filter(c => c.promedio > 0);

      return {
        labels: cursosConPromedio.map(c => c.nombre.replace(' Basico', 'B').replace(' Medio', 'M')),
        datasets: [{
          data: cursosConPromedio.map(c => c.promedio),
          backgroundColor: cursosConPromedio.map(c =>
            c.promedio >= 5.5 ? '#10b981' : c.promedio >= 5.0 ? '#f59e0b' : '#ef4444'
          ),
          borderRadius: 4
        }]
      };
    }

    // Vista Asignatura: promedio de esa asignatura en cada curso del establecimiento
    if (vistaActual === 'asignatura' && asignaturaSeleccionada) {
      const cursos = Object.keys(datosPorCurso);
      const promedios = cursos.map(curso =>
        datosPorCurso[curso].asignaturas[asignaturaSeleccionada] || 0
      );
      return {
        labels: cursos.map(c => c.replace(' Basico', 'B').replace(' Medio', 'M')),
        datasets: [{
          data: promedios,
          backgroundColor: promedios.map(v =>
            v >= 5.5 ? '#10b981' : v >= 5.0 ? '#f59e0b' : '#ef4444'
          ),
          borderRadius: 4
        }]
      };
    }

    // Vista General: promedios generales por asignatura
    return {
      labels: Object.keys(datosPorAsignatura),
      datasets: [{
        data: Object.values(datosPorAsignatura).map(a => a.promedio),
        backgroundColor: Object.values(datosPorAsignatura).map(a =>
          a.promedio >= 5.5 ? '#10b981' : a.promedio >= 5.0 ? '#f59e0b' : '#ef4444'
        ),
        borderRadius: 4
      }]
    };
  };

  // Gráfico de distribución
  const getDistribucionData = () => {
    const destacados = datos.destacados || datos.alumnosDestacados || 45;
    const riesgo = datos.riesgo || datos.alumnosRiesgo || 28;
    const regulares = (datos.alumnos || datos.totalAlumnos || 450) - destacados - riesgo;

    return {
      labels: ['Destacados', 'Regulares', 'En Riesgo'],
      datasets: [{
        data: [destacados, regulares, riesgo],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        borderWidth: 0
      }]
    };
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11 },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => ({
              text: `${label}: ${datasets[0].data[i]}`,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].backgroundColor[i],
              lineWidth: 0,
              hidden: false,
              index: i
            }));
          }
        }
      }
    },
    cutout: '65%'
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: false, min: 4, max: 7 },
      x: { ticks: { font: { size: 10 } } }
    }
  };

  // Opciones para gráfico de barras horizontal
  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { beginAtZero: false, min: 4, max: 7, ticks: { font: { size: 10 } } },
      y: { ticks: { font: { size: 10 } } }
    }
  };

  // Datos para el gráfico de ranking/comparativa
  const getRankingData = () => {
    // Vista General o sin selección: Top 5 mejores cursos
    if (vistaActual === 'general' || vistaActual === 'asignatura' ||
        (vistaActual === 'curso' && !cursoSeleccionado) ||
        (vistaActual === 'docente' && !docenteSeleccionado)) {
      const cursosConPromedio = Object.entries(datosPorCurso)
        .map(([nombre, data]) => ({ nombre, promedio: data.promedio }))
        .sort((a, b) => b.promedio - a.promedio)
        .slice(0, 5);

      return {
        labels: cursosConPromedio.map(c => c.nombre.replace(' Basico', 'B').replace(' Medio', 'M')),
        datasets: [{
          data: cursosConPromedio.map(c => c.promedio),
          backgroundColor: cursosConPromedio.map((c, i) =>
            i === 0 ? '#10b981' : i === 1 ? '#34d399' : i === 2 ? '#6ee7b7' : '#a7f3d0'
          ),
          borderRadius: 4
        }]
      };
    }

    // Vista Curso: Promedios de asignaturas del curso seleccionado (horizontal)
    if (vistaActual === 'curso' && cursoSeleccionado) {
      const asignaturas = datosPorCurso[cursoSeleccionado]?.asignaturas || {};
      const asignaturasOrdenadas = Object.entries(asignaturas)
        .map(([nombre, promedio]) => ({ nombre, promedio }))
        .sort((a, b) => b.promedio - a.promedio);

      return {
        labels: asignaturasOrdenadas.map(a => a.nombre),
        datasets: [{
          data: asignaturasOrdenadas.map(a => a.promedio),
          backgroundColor: asignaturasOrdenadas.map(a =>
            a.promedio >= 5.5 ? '#10b981' : a.promedio >= 5.0 ? '#f59e0b' : '#ef4444'
          ),
          borderRadius: 4
        }]
      };
    }

    // Vista Docente: Promedios de cursos en la asignatura del docente
    if (vistaActual === 'docente' && docenteSeleccionado && datos.asignatura) {
      const asigDocente = datos.asignatura;
      const cursosDocente = datos.cursos || [];

      const cursosConPromedio = cursosDocente
        .map(curso => ({
          nombre: curso,
          promedio: datosPorCurso[curso]?.asignaturas[asigDocente] || 0
        }))
        .filter(c => c.promedio > 0)
        .sort((a, b) => b.promedio - a.promedio);

      return {
        labels: cursosConPromedio.map(c => c.nombre.replace(' Basico', 'B').replace(' Medio', 'M')),
        datasets: [{
          data: cursosConPromedio.map(c => c.promedio),
          backgroundColor: cursosConPromedio.map(c =>
            c.promedio >= 5.5 ? '#10b981' : c.promedio >= 5.0 ? '#f59e0b' : '#ef4444'
          ),
          borderRadius: 4
        }]
      };
    }

    // Default
    return {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
    };
  };

  // Datos para gráfico de asistencia mensual
  const getAsistenciaMensualData = () => {
    const datosAsistencia = cursoAsistenciaSeleccionado
      ? datosAsistenciaPorCurso[cursoAsistenciaSeleccionado]?.asistenciaMensual
      : datosAsistenciaGeneral.asistenciaMensual;

    return {
      labels: Object.keys(datosAsistencia || {}),
      datasets: [{
        data: Object.values(datosAsistencia || {}),
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  };

  // Opciones para gráfico de asistencia mensual (escala de 0-100%)
  const asistenciaMensualOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Asistencia: ${context.raw}%`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, min: 70, max: 100, ticks: { callback: (value) => value + '%' } }
    }
  };

  // Datos para distribución de asistencia (Doughnut)
  const getDistribucionAsistenciaData = () => {
    const datosAsistencia = cursoAsistenciaSeleccionado
      ? datosAsistenciaPorCurso[cursoAsistenciaSeleccionado]
      : datosAsistenciaGeneral;

    const asistencia100 = datosAsistencia?.asistencia100 || 0;
    const bajoUmbral = datosAsistencia?.bajoUmbral85 || 0;
    const regulares = (datosAsistencia?.totalAlumnos || 0) - asistencia100 - bajoUmbral;

    return {
      labels: ['100% Asistencia', 'Asistencia Regular', 'Bajo 85%'],
      datasets: [{
        data: [asistencia100, regulares, bajoUmbral],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        borderWidth: 0
      }]
    };
  };

  // Datos para gráfico de asistencia por curso
  const getAsistenciaPorCursoData = () => {
    // Si hay un curso seleccionado, mostrar asistencia mensual de ese curso
    if (cursoAsistenciaSeleccionado) {
      const asistenciaMensual = datosAsistenciaPorCurso[cursoAsistenciaSeleccionado]?.asistenciaMensual || {};
      const valores = Object.values(asistenciaMensual);
      return {
        labels: Object.keys(asistenciaMensual),
        datasets: [{
          data: valores,
          backgroundColor: valores.map(a =>
            a >= 90 ? '#10b981' : a >= 85 ? '#f59e0b' : '#ef4444'
          ),
          borderRadius: 4
        }]
      };
    }

    // Sin curso seleccionado: mostrar todos los cursos
    const cursos = Object.keys(datosAsistenciaPorCurso);
    const asistencias = cursos.map(curso => datosAsistenciaPorCurso[curso].promedioAsistencia);

    return {
      labels: cursos.map(c => c.replace(' Basico', 'B').replace(' Medio', 'M')),
      datasets: [{
        data: asistencias,
        backgroundColor: asistencias.map(a =>
          a >= 90 ? '#10b981' : a >= 85 ? '#f59e0b' : '#ef4444'
        ),
        borderRadius: 4
      }]
    };
  };

  // Opciones para gráfico de asistencia por curso
  const asistenciaCursoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Asistencia: ${context.raw}%`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, min: 70, max: 100, ticks: { callback: (value) => value + '%' } },
      x: { ticks: { font: { size: 10 } } }
    }
  };

  // Datos para ranking de asistencia por curso
  const getRankingAsistenciaData = () => {
    const cursosConAsistencia = Object.entries(datosAsistenciaPorCurso)
      .map(([nombre, data]) => ({ nombre, asistencia: data.promedioAsistencia }))
      .sort((a, b) => b.asistencia - a.asistencia);

    // Si hay un curso seleccionado, destacarlo en el ranking
    if (cursoAsistenciaSeleccionado) {
      return {
        labels: cursosConAsistencia.map(c => c.nombre.replace(' Basico', 'B').replace(' Medio', 'M')),
        datasets: [{
          data: cursosConAsistencia.map(c => c.asistencia),
          backgroundColor: cursosConAsistencia.map(c =>
            c.nombre === cursoAsistenciaSeleccionado ? '#1e3a5f' : '#cbd5e1'
          ),
          borderRadius: 4
        }]
      };
    }

    return {
      labels: cursosConAsistencia.map(c => c.nombre.replace(' Basico', 'B').replace(' Medio', 'M')),
      datasets: [{
        data: cursosConAsistencia.map(c => c.asistencia),
        backgroundColor: cursosConAsistencia.map((c, i) =>
          i === 0 ? '#10b981' : i === 1 ? '#34d399' : i === 2 ? '#6ee7b7' : '#a7f3d0'
        ),
        borderRadius: 4
      }]
    };
  };

  // Opciones para ranking horizontal de asistencia
  const rankingAsistenciaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Asistencia: ${context.raw}%`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: false,
        min: 70,
        max: 100,
        ticks: {
          font: { size: 10 },
          callback: (value) => value + '%'
        }
      },
      y: { ticks: { font: { size: 10 } } }
    }
  };

  return (
    <div className="tab-panel active">
      <div className="estadisticas-dashboard">

        {/* Panel de Filtros */}
        <div className="stats-filtros-panel">
          <div className="stats-filtros-header">
            <h3>Panel de Estadisticas</h3>
            <p>Seleccione una vista para explorar los datos</p>
          </div>

          <div className="stats-filtros-grid">
            {/* Fila 1: Vista + segundo filtro */}
            <div className="stats-filtros-row">
              <div className="stats-filtro-grupo">
                <label>Vista</label>
                {isMobile ? (
                  <div className="custom-select-container">
                    <div
                      className="custom-select-trigger"
                      onClick={() => setDropdownAbierto(dropdownAbierto === 'vista' ? null : 'vista')}
                    >
                      <span>
                        {vistaActual === 'general' && 'General del Establecimiento'}
                        {vistaActual === 'curso' && 'Por Curso'}
                        {vistaActual === 'docente' && 'Por Docente'}
                        {vistaActual === 'asignatura' && 'Por Asignatura'}
                        {vistaActual === 'asistencia' && 'Asistencia'}
                      </span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'vista' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'vista' && (
                      <div className="custom-select-options">
                        <div className={`custom-select-option ${vistaActual === 'general' ? 'selected' : ''}`} onClick={() => { handleVistaChange('general'); setDropdownAbierto(null); }}>General del Establecimiento</div>
                        <div className={`custom-select-option ${vistaActual === 'curso' ? 'selected' : ''}`} onClick={() => { handleVistaChange('curso'); setDropdownAbierto(null); }}>Por Curso</div>
                        <div className={`custom-select-option ${vistaActual === 'docente' ? 'selected' : ''}`} onClick={() => { handleVistaChange('docente'); setDropdownAbierto(null); }}>Por Docente</div>
                        <div className={`custom-select-option ${vistaActual === 'asignatura' ? 'selected' : ''}`} onClick={() => { handleVistaChange('asignatura'); setDropdownAbierto(null); }}>Por Asignatura</div>
                        <div className={`custom-select-option ${vistaActual === 'asistencia' ? 'selected' : ''}`} onClick={() => { handleVistaChange('asistencia'); setDropdownAbierto(null); }}>Asistencia</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={vistaActual}
                    onChange={(e) => handleVistaChange(e.target.value)}
                  >
                    <option value="general">General del Establecimiento</option>
                    <option value="curso">Por Curso</option>
                    <option value="docente">Por Docente</option>
                    <option value="asignatura">Por Asignatura</option>
                    <option value="asistencia">Asistencia</option>
                  </select>
                )}
              </div>

              {vistaActual === 'curso' && (
                <div className="stats-filtro-grupo">
                  <label>Curso</label>
                  {isMobile ? (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
                      >
                        <span>{cursoSeleccionado || 'Seleccionar curso...'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'curso' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'curso' && (
                        <div className="custom-select-options">
                          <div className="custom-select-option" onClick={() => { setCursoSeleccionado(''); setDropdownAbierto(null); }}>Seleccionar curso...</div>
                          {Object.keys(datosPorCurso).map(curso => (
                            <div key={curso} className={`custom-select-option ${cursoSeleccionado === curso ? 'selected' : ''}`} onClick={() => { setCursoSeleccionado(curso); setDropdownAbierto(null); }}>{curso}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      value={cursoSeleccionado}
                      onChange={(e) => setCursoSeleccionado(e.target.value)}
                    >
                      <option value="">Seleccionar curso...</option>
                      {Object.keys(datosPorCurso).map(curso => (
                        <option key={curso} value={curso}>{curso}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {vistaActual === 'docente' && (
                <div className="stats-filtro-grupo">
                  <label>Docente</label>
                  {isMobile ? (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'docente' ? null : 'docente')}
                      >
                        <span>{docenteSeleccionado || 'Seleccionar docente...'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'docente' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'docente' && (
                        <div className="custom-select-options">
                          <div className="custom-select-option" onClick={() => { handleDocenteChange(''); setDropdownAbierto(null); }}>Seleccionar docente...</div>
                          {Object.keys(datosPorDocente).map(docente => (
                            <div key={docente} className={`custom-select-option ${docenteSeleccionado === docente ? 'selected' : ''}`} onClick={() => { handleDocenteChange(docente); setDropdownAbierto(null); }}>{docente}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      value={docenteSeleccionado}
                      onChange={(e) => handleDocenteChange(e.target.value)}
                    >
                      <option value="">Seleccionar docente...</option>
                      {Object.keys(datosPorDocente).map(docente => (
                        <option key={docente} value={docente}>{docente}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {vistaActual === 'asignatura' && (
                <div className="stats-filtro-grupo">
                  <label>Asignatura</label>
                  {isMobile ? (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'asignatura' ? null : 'asignatura')}
                      >
                        <span>{asignaturaSeleccionada || 'Seleccionar asignatura...'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'asignatura' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'asignatura' && (
                        <div className="custom-select-options">
                          <div className="custom-select-option" onClick={() => { setAsignaturaSeleccionada(''); setDropdownAbierto(null); }}>Seleccionar asignatura...</div>
                          {Object.keys(datosPorAsignatura).map(asig => (
                            <div key={asig} className={`custom-select-option ${asignaturaSeleccionada === asig ? 'selected' : ''}`} onClick={() => { setAsignaturaSeleccionada(asig); setDropdownAbierto(null); }}>{asig}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      value={asignaturaSeleccionada}
                      onChange={(e) => setAsignaturaSeleccionada(e.target.value)}
                    >
                      <option value="">Seleccionar asignatura...</option>
                      {Object.keys(datosPorAsignatura).map(asig => (
                        <option key={asig} value={asig}>{asig}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {vistaActual === 'asistencia' && (
                <div className="stats-filtro-grupo">
                  <label>Curso</label>
                  {isMobile ? (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => setDropdownAbierto(dropdownAbierto === 'cursoAsist' ? null : 'cursoAsist')}
                      >
                        <span>{cursoAsistenciaSeleccionado || 'Todos los cursos'}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'cursoAsist' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'cursoAsist' && (
                        <div className="custom-select-options">
                          <div className="custom-select-option" onClick={() => { setCursoAsistenciaSeleccionado(''); setDropdownAbierto(null); }}>Todos los cursos</div>
                          {Object.keys(datosAsistenciaPorCurso).map(curso => (
                            <div key={curso} className={`custom-select-option ${cursoAsistenciaSeleccionado === curso ? 'selected' : ''}`} onClick={() => { setCursoAsistenciaSeleccionado(curso); setDropdownAbierto(null); }}>{curso}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      value={cursoAsistenciaSeleccionado}
                      onChange={(e) => setCursoAsistenciaSeleccionado(e.target.value)}
                    >
                      <option value="">Todos los cursos</option>
                      {Object.keys(datosAsistenciaPorCurso).map(curso => (
                        <option key={curso} value={curso}>{curso}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Fila 2: Tercer filtro (solo para docente) */}
            {vistaActual === 'docente' && docenteSeleccionado && (
              <div className="stats-filtros-row stats-filtros-row-segundo">
                <div className="stats-filtro-grupo">
                  <label>Asignatura</label>
                  {isMobile ? (
                    <div className="custom-select-container">
                      <div
                        className="custom-select-trigger"
                        onClick={() => {
                          if (datosPorDocente[docenteSeleccionado]?.asignaturas.length > 1) {
                            setDropdownAbierto(dropdownAbierto === 'asigDocente' ? null : 'asigDocente');
                          }
                        }}
                      >
                        <span>{asignaturaDocenteSeleccionada || (datosPorDocente[docenteSeleccionado]?.asignaturas.length === 1 ? datosPorDocente[docenteSeleccionado].asignaturas[0] : 'Seleccionar asignatura...')}</span>
                        <span className="custom-select-arrow">{dropdownAbierto === 'asigDocente' ? '▲' : '▼'}</span>
                      </div>
                      {dropdownAbierto === 'asigDocente' && (
                        <div className="custom-select-options">
                          <div className="custom-select-option" onClick={() => { setAsignaturaDocenteSeleccionada(''); setDropdownAbierto(null); }}>Seleccionar asignatura...</div>
                          {datosPorDocente[docenteSeleccionado]?.asignaturas.map(asig => (
                            <div key={asig} className={`custom-select-option ${asignaturaDocenteSeleccionada === asig ? 'selected' : ''}`} onClick={() => { setAsignaturaDocenteSeleccionada(asig); setDropdownAbierto(null); }}>{asig}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-control"
                      value={asignaturaDocenteSeleccionada || (datosPorDocente[docenteSeleccionado]?.asignaturas.length === 1 ? datosPorDocente[docenteSeleccionado].asignaturas[0] : '')}
                      onChange={(e) => setAsignaturaDocenteSeleccionada(e.target.value)}
                      disabled={datosPorDocente[docenteSeleccionado]?.asignaturas.length === 1}
                    >
                      {datosPorDocente[docenteSeleccionado]?.asignaturas.length > 1 && (
                        <option value="">Seleccionar asignatura...</option>
                      )}
                      {datosPorDocente[docenteSeleccionado]?.asignaturas.map(asig => (
                        <option key={asig} value={asig}>{asig}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Titulo de la vista actual */}
        <div className="stats-vista-titulo">
          <h2>
            {vistaActual === 'general' && 'Resumen General del Establecimiento'}
            {vistaActual === 'curso' && (cursoSeleccionado ? `Curso: ${cursoSeleccionado}` : 'Seleccione un curso')}
            {vistaActual === 'docente' && (docenteSeleccionado
              ? (asignaturaDocente
                ? `Docente: ${docenteSeleccionado}`
                : `Docente: ${docenteSeleccionado} - Seleccione asignatura`)
              : 'Seleccione un docente')}
            {vistaActual === 'asignatura' && (asignaturaSeleccionada ? `Asignatura: ${asignaturaSeleccionada}` : 'Seleccione una asignatura')}
            {vistaActual === 'asistencia' && (cursoAsistenciaSeleccionado ? `Asistencia: ${cursoAsistenciaSeleccionado}` : 'Asistencia General del Establecimiento')}
          </h2>
          {vistaActual === 'docente' && docenteSeleccionado && asignaturaDocente && (
            <span className="stats-vista-subtitulo">{asignaturaDocente} - {datos.cursos?.length || 0} cursos asignados</span>
          )}
          {vistaActual === 'asignatura' && asignaturaSeleccionada && (
            <span className="stats-vista-subtitulo">{datos.docentes} docentes imparten esta asignatura</span>
          )}
        </div>

        {/* KPIs Principales */}
        {vistaActual !== 'asistencia' ? (
        <div className="stats-kpis-row">
          <div className="stats-kpi-card kpi-principal">
            <div className="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Promedio</span>
              <span className="kpi-value">{datos.promedio || datos.promedioGeneral}</span>
              <span className="kpi-sublabel">
                {vistaActual === 'general' && 'Establecimiento'}
                {vistaActual === 'curso' && cursoSeleccionado}
                {vistaActual === 'docente' && datos.asignatura}
                {vistaActual === 'asignatura' && 'General'}
              </span>
            </div>
          </div>

          <div className="stats-kpi-card kpi-success">
            <div className="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Aprobacion</span>
              <span className="kpi-value">{datos.aprobacion || datos.tasaAprobacion}%</span>
              <span className="kpi-sublabel">Tasa de aprobacion</span>
            </div>
          </div>

          {vistaActual !== 'docente' && vistaActual !== 'asistencia' && (
            <div className="stats-kpi-card kpi-asistencia">
              <div className="kpi-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M9 16l2 2 4-4"/>
                </svg>
              </div>
              <div className="kpi-content">
                <span className="kpi-label">
                  {vistaActual === 'general' && '% Asistencia'}
                  {vistaActual === 'curso' && (cursoSeleccionado ? '% Asist. Curso' : '% Asistencia')}
                  {vistaActual === 'asignatura' && '% Asistencia'}
                </span>
                <span className="kpi-value">{datos.asistencia || datosGenerales.asistencia}%</span>
                <span className="kpi-sublabel">
                  {vistaActual === 'general' && 'Establecimiento'}
                  {vistaActual === 'curso' && (cursoSeleccionado || 'Establecimiento')}
                  {vistaActual === 'asignatura' && 'Establecimiento'}
                </span>
              </div>
            </div>
          )}

          <div className="stats-kpi-card kpi-info">
            <div className="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">
                {vistaActual === 'asignatura' ? 'Mejor Curso' : 'Alumnos'}
              </span>
              <span className="kpi-value">
                {vistaActual === 'asignatura' ? datos.mejorCurso : (datos.alumnos || datos.totalAlumnos)}
              </span>
              <span className="kpi-sublabel">
                {vistaActual === 'asignatura' ? 'Mayor promedio' : 'Total'}
              </span>
            </div>
          </div>

          {vistaActual !== 'asignatura' && (
            <>
              <div className="stats-kpi-card kpi-success-light">
                <div className="kpi-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Destacados</span>
                  <span className="kpi-value">{datos.destacados || datos.alumnosDestacados}</span>
                  <span className="kpi-sublabel">Sobre 6.0</span>
                </div>
              </div>

              <div className="stats-kpi-card kpi-danger-light">
                <div className="kpi-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">En Riesgo</span>
                  <span className="kpi-value">{datos.riesgo || datos.alumnosRiesgo}</span>
                  <span className="kpi-sublabel">Bajo 4.0</span>
                </div>
              </div>
            </>
          )}

          {vistaActual === 'asignatura' && (
            <>
              <div className="stats-kpi-card kpi-danger-light">
                <div className="kpi-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Peor Curso</span>
                  <span className="kpi-value">{datos.peorCurso}</span>
                  <span className="kpi-sublabel">Menor promedio</span>
                </div>
              </div>

              <div className="stats-kpi-card kpi-info">
                <div className="kpi-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Docentes</span>
                  <span className="kpi-value">{datos.docentes}</span>
                  <span className="kpi-sublabel">Imparten esta asig.</span>
                </div>
              </div>
            </>
          )}
        </div>
        ) : (
        <div className="stats-kpis-row">
          {/* KPI Asistencia Promedio */}
          <div className="stats-kpi-card kpi-principal">
            <div className="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Asistencia Promedio</span>
              <span className="kpi-value">
                {cursoAsistenciaSeleccionado
                  ? datosAsistenciaPorCurso[cursoAsistenciaSeleccionado]?.promedioAsistencia
                  : datosAsistenciaGeneral.promedioAsistencia}%
              </span>
              <span className="kpi-sublabel">
                {cursoAsistenciaSeleccionado || 'Establecimiento'}
              </span>
            </div>
          </div>

          {/* KPI Total Alumnos */}
          <div className="stats-kpi-card kpi-info">
            <div className="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total Alumnos</span>
              <span className="kpi-value">
                {cursoAsistenciaSeleccionado
                  ? datosAsistenciaPorCurso[cursoAsistenciaSeleccionado]?.totalAlumnos
                  : datosAsistenciaGeneral.totalAlumnos}
              </span>
              <span className="kpi-sublabel">En el {cursoAsistenciaSeleccionado ? 'curso' : 'establecimiento'}</span>
            </div>
          </div>

          {/* KPI Asistencia 100% */}
          <div className="stats-kpi-card kpi-success-light">
            <div className="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Asistencia 100%</span>
              <span className="kpi-value">
                {cursoAsistenciaSeleccionado
                  ? datosAsistenciaPorCurso[cursoAsistenciaSeleccionado]?.asistencia100
                  : datosAsistenciaGeneral.asistencia100}
              </span>
              <span className="kpi-sublabel">Alumnos con asist. perfecta</span>
            </div>
          </div>

          {/* KPI Bajo 85% - Riesgo Repitencia */}
          <div className="stats-kpi-card kpi-danger-light">
            <div className="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Riesgo Repitencia</span>
              <span className="kpi-value">
                {cursoAsistenciaSeleccionado
                  ? datosAsistenciaPorCurso[cursoAsistenciaSeleccionado]?.bajoUmbral85
                  : datosAsistenciaGeneral.bajoUmbral85}
              </span>
              <span className="kpi-sublabel">Bajo 85% asistencia</span>
            </div>
          </div>
        </div>
        )}

        {/* Graficos */}
        {vistaActual !== 'asistencia' ? (
        <div className="stats-graficos-grid">
          {/* Grafico de Asignaturas */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>
                {vistaActual === 'general' && 'Promedio General por Asignatura'}
                {vistaActual === 'curso' && cursoSeleccionado && 'Promedio por Asignatura'}
                {vistaActual === 'curso' && !cursoSeleccionado && 'Promedio General por Asignatura'}
                {vistaActual === 'docente' && asignaturaDocente && `${asignaturaDocente} en sus Cursos`}
                {vistaActual === 'docente' && !asignaturaDocente && 'Seleccione asignatura'}
                {vistaActual === 'asignatura' && asignaturaSeleccionada && `${asignaturaSeleccionada} por Curso`}
                {vistaActual === 'asignatura' && !asignaturaSeleccionada && 'Promedio General por Asignatura'}
              </h4>
              <span className="stats-grafico-badge">
                {vistaActual === 'general' && 'Establecimiento'}
                {vistaActual === 'curso' && cursoSeleccionado && cursoSeleccionado}
                {vistaActual === 'curso' && !cursoSeleccionado && 'Establecimiento'}
                {vistaActual === 'docente' && asignaturaDocente && docenteSeleccionado.split(',')[0]}
                {vistaActual === 'docente' && !asignaturaDocente && '-'}
                {vistaActual === 'asignatura' && asignaturaSeleccionada && 'Todos los cursos'}
                {vistaActual === 'asignatura' && !asignaturaSeleccionada && 'Establecimiento'}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Bar data={getAsignaturasData()} options={barOptions} />
            </div>
          </div>

          {/* Grafico de Distribucion */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>
                {vistaActual === 'general' && 'Distribucion de Alumnos'}
                {vistaActual === 'curso' && cursoSeleccionado && `Alumnos de ${cursoSeleccionado}`}
                {vistaActual === 'curso' && !cursoSeleccionado && 'Distribucion de Alumnos'}
                {vistaActual === 'docente' && asignaturaDocente && `Alumnos en ${asignaturaDocente}`}
                {vistaActual === 'docente' && !asignaturaDocente && 'Distribucion de Alumnos'}
                {vistaActual === 'asignatura' && asignaturaSeleccionada && `Alumnos en ${asignaturaSeleccionada}`}
                {vistaActual === 'asignatura' && !asignaturaSeleccionada && 'Distribucion de Alumnos'}
              </h4>
              <span className="stats-grafico-badge">
                {vistaActual === 'general' && 'Establecimiento'}
                {vistaActual === 'curso' && (cursoSeleccionado || 'Establecimiento')}
                {vistaActual === 'docente' && (asignaturaDocente ? docenteSeleccionado.split(',')[0] : 'Establecimiento')}
                {vistaActual === 'asignatura' && (asignaturaSeleccionada ? 'Por rendimiento' : 'Establecimiento')}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Doughnut data={getDistribucionData()} options={doughnutOptions} />
            </div>
          </div>

          {/* Grafico de Tendencia */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>
                {vistaActual === 'general' && 'Tendencia del Establecimiento'}
                {vistaActual === 'curso' && cursoSeleccionado && `Tendencia de ${cursoSeleccionado}`}
                {vistaActual === 'curso' && !cursoSeleccionado && 'Tendencia del Establecimiento'}
                {vistaActual === 'docente' && asignaturaDocente && `Tendencia en ${asignaturaDocente}`}
                {vistaActual === 'docente' && !asignaturaDocente && 'Tendencia del Establecimiento'}
                {vistaActual === 'asignatura' && asignaturaSeleccionada && `Tendencia de ${asignaturaSeleccionada}`}
                {vistaActual === 'asignatura' && !asignaturaSeleccionada && 'Tendencia del Establecimiento'}
              </h4>
              <span className="stats-grafico-badge">
                {vistaActual === 'general' && 'Ultimos 6 meses'}
                {vistaActual === 'curso' && 'Ultimos 6 meses'}
                {vistaActual === 'docente' && (asignaturaDocente ? docenteSeleccionado.split(',')[0] : 'Ultimos 6 meses')}
                {vistaActual === 'asignatura' && 'Ultimos 6 meses'}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Line data={getTendenciaData()} options={tendenciaOptions} plugins={[variacionPlugin]} />
            </div>
          </div>

          {/* Grafico Ranking/Comparativa */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>
                {vistaActual === 'general' && 'Top 5 Mejores Cursos'}
                {vistaActual === 'curso' && cursoSeleccionado && 'Promedios por Asignatura'}
                {vistaActual === 'curso' && !cursoSeleccionado && 'Top 5 Mejores Cursos'}
                {vistaActual === 'docente' && docenteSeleccionado && asignaturaDocente && `Cursos en ${asignaturaDocente}`}
                {vistaActual === 'docente' && docenteSeleccionado && !asignaturaDocente && 'Seleccione asignatura'}
                {vistaActual === 'docente' && !docenteSeleccionado && 'Top 5 Mejores Cursos'}
                {vistaActual === 'asignatura' && 'Top 5 Mejores Cursos'}
              </h4>
              <span className="stats-grafico-badge">
                {vistaActual === 'curso' && cursoSeleccionado ? cursoSeleccionado :
                 vistaActual === 'docente' && asignaturaDocente ? asignaturaDocente : 'Ranking'}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Bar data={getRankingData()} options={horizontalBarOptions} />
            </div>
          </div>

        </div>
        ) : (
        <div className="stats-graficos-grid">
          {/* Grafico de Asistencia por Curso */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>{cursoAsistenciaSeleccionado ? 'Asistencia Mensual' : 'Asistencia por Curso'}</h4>
              <span className="stats-grafico-badge">
                {cursoAsistenciaSeleccionado || 'Todos los cursos'}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Bar data={getAsistenciaPorCursoData()} options={asistenciaCursoOptions} />
            </div>
          </div>

          {/* Grafico de Distribucion de Asistencia */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>Distribucion de Asistencia</h4>
              <span className="stats-grafico-badge">
                {cursoAsistenciaSeleccionado || 'Establecimiento'}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Doughnut data={getDistribucionAsistenciaData()} options={doughnutOptions} />
            </div>
          </div>

          {/* Grafico de Asistencia Mensual */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>Asistencia Mes a Mes</h4>
              <span className="stats-grafico-badge">
                {cursoAsistenciaSeleccionado || 'Establecimiento'}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Line data={getAsistenciaMensualData()} options={asistenciaMensualOptions} />
            </div>
          </div>

          {/* Ranking de Asistencia por Curso */}
          <div className="stats-grafico-card">
            <div className="stats-grafico-header">
              <h4>{cursoAsistenciaSeleccionado ? 'Comparativa con otros cursos' : 'Ranking de Asistencia'}</h4>
              <span className="stats-grafico-badge">
                {cursoAsistenciaSeleccionado ? cursoAsistenciaSeleccionado : 'Por curso'}
              </span>
            </div>
            <div className="stats-grafico-body">
              <Bar data={getRankingAsistenciaData()} options={rankingAsistenciaOptions} />
            </div>
          </div>
        </div>
        )}

        {/* Info adicional segun vista */}
        {vistaActual === 'docente' && docenteSeleccionado && asignaturaDocente && (
          <div className="stats-info-adicional">
            <div className="stats-info-card">
              <h4>Cursos donde imparte {asignaturaDocente}</h4>
              <div className="stats-cursos-list">
                {datos.cursos?.map(curso => (
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
