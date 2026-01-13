// Opciones base para graficos
export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
};

// Opciones para grafico de linea
export const lineChartOptions = {
  ...baseChartOptions,
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

// Opciones para grafico de barras horizontal
export const horizontalBarOptions = {
  ...baseChartOptions,
  indexAxis: 'y',
  scales: {
    x: { beginAtZero: true, max: 7 }
  }
};

// Opciones para grafico de dona con leyenda
export const doughnutWithLegendOptions = {
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

// Plugin para dibujar barras de fin de trimestre
export const trimestrePlugin = {
  id: 'trimestreBars',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;

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

// Colores para graficos
export const chartColors = {
  distribucion: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
  aprobacion: ['#10b981', '#ef4444'],
  top5: ['#1e3a5f', '#2d4a6f', '#4a6a8f', '#6a8aaf', '#8aaacf'],
  primary: '#1e3a5f',
  primaryLight: 'rgba(30, 58, 95, 0.1)'
};

// Formatear nombre: "Apellido1 Apellido2 P."
export const formatearNombreCompleto = (nombreCompleto) => {
  if (!nombreCompleto) return '';
  const partes = nombreCompleto.trim().split(' ');

  if (partes.length >= 4) {
    const apellido1 = partes[2];
    const apellido2 = partes[3];
    const inicialNombre = partes[0].charAt(0) + '.';
    return `${apellido1} ${apellido2} ${inicialNombre}`;
  } else if (partes.length === 3) {
    const apellido1 = partes[1];
    const apellido2 = partes[2];
    const inicialNombre = partes[0].charAt(0) + '.';
    return `${apellido1} ${apellido2} ${inicialNombre}`;
  }
  return nombreCompleto;
};

// Formatear fecha a formato chileno
export const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL');
};

// Clase CSS segun valor de nota
export const getNotaClass = (nota) => {
  if (nota === null) return 'nota-pendiente';
  if (nota >= 6.0) return 'nota-excelente';
  if (nota >= 5.0) return 'nota-buena';
  if (nota >= 4.0) return 'nota-suficiente';
  return 'nota-insuficiente';
};
