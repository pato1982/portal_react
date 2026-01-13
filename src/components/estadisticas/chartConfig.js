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

// Registrar componentes de ChartJS
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

// Plugin para mostrar porcentajes de variacion en el grafico de tendencia
export const variacionPlugin = {
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

      const x = (prev.x + curr.x) / 2;
      const y = (prev.y + curr.y) / 2 - 10;

      ctx.fillStyle = variacion >= 0 ? '#10b981' : '#ef4444';
      ctx.fillText(texto, x, y);
    }

    ctx.restore();
  }
};

// Opciones base para graficos
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: false, min: 4, max: 7 }
  }
};

// Opciones para grafico de tendencia
export const tendenciaOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: false, min: 4, max: 7 }
  }
};

// Opciones para grafico de barras
export const barOptions = {
  ...chartOptions,
  scales: {
    y: { beginAtZero: false, min: 4, max: 7 },
    x: { ticks: { font: { size: 10 } } }
  }
};

// Opciones para grafico de barras horizontal
export const horizontalBarOptions = {
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

// Opciones para grafico de dona (doughnut)
export const doughnutOptions = {
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

// Opciones para grafico de asistencia mensual
export const asistenciaMensualOptions = {
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

// Opciones para grafico de asistencia por curso
export const asistenciaCursoOptions = {
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

// Opciones para ranking horizontal de asistencia
export const rankingAsistenciaOptions = {
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

// Funcion helper para obtener color segun valor
export const getColorByValue = (value, thresholdHigh = 5.5, thresholdLow = 5.0) => {
  if (value >= thresholdHigh) return '#10b981';
  if (value >= thresholdLow) return '#f59e0b';
  return '#ef4444';
};

// Funcion helper para obtener color de asistencia
export const getColorByAsistencia = (value) => {
  if (value >= 90) return '#10b981';
  if (value >= 85) return '#f59e0b';
  return '#ef4444';
};
