// Datos de demostración para la aplicación
// Listas vacías - la estructura se mantiene para los selectores

export const cursosDB = [
  { id: 1, nombre: '1° Básico A', nivel: 'Básico' },
  { id: 2, nombre: '1° Básico B', nivel: 'Básico' },
  { id: 3, nombre: '2° Básico A', nivel: 'Básico' },
  { id: 4, nombre: '3° Básico A', nivel: 'Básico' },
  { id: 5, nombre: '4° Básico A', nivel: 'Básico' },
  { id: 6, nombre: '5° Básico A', nivel: 'Básico' },
  { id: 7, nombre: '6° Básico A', nivel: 'Básico' },
  { id: 8, nombre: '7° Básico A', nivel: 'Básico' },
  { id: 9, nombre: '8° Básico A', nivel: 'Básico' },
  { id: 10, nombre: '1° Medio A', nivel: 'Medio' },
  { id: 11, nombre: '2° Medio A', nivel: 'Medio' },
  { id: 12, nombre: '3° Medio A', nivel: 'Medio' },
  { id: 13, nombre: '4° Medio A', nivel: 'Medio' }
];

export const asignaturasDB = [
  { id: 1, nombre: 'Matemáticas', codigo: 'MAT' },
  { id: 2, nombre: 'Lenguaje y Comunicación', codigo: 'LEN' },
  { id: 3, nombre: 'Historia', codigo: 'HIS' },
  { id: 4, nombre: 'Ciencias Naturales', codigo: 'CIE' },
  { id: 5, nombre: 'Inglés', codigo: 'ING' },
  { id: 6, nombre: 'Educación Física', codigo: 'EFI' },
  { id: 7, nombre: 'Artes Visuales', codigo: 'ART' },
  { id: 8, nombre: 'Música', codigo: 'MUS' },
  { id: 9, nombre: 'Tecnología', codigo: 'TEC' },
  { id: 10, nombre: 'Filosofía', codigo: 'FIL' }
];

// Sin docentes registrados
export const docentesDB = [];

// Sin especialidades de docentes
export const docenteEspecialidadesDB = {};

// Sin alumnos registrados
export const alumnosPorCursoDB = {};

// Sin asignaciones de cursos
export const asignacionesDB = [];

export const trimestresDB = [
  { id: 1, nombre: 'Primer Trimestre' },
  { id: 2, nombre: 'Segundo Trimestre' },
  { id: 3, nombre: 'Tercer Trimestre' }
];

export const usuarioDemo = {
  id: 1,
  nombres: 'Administrador',
  apellidos: 'Sistema',
  tipo_usuario: 'administrador',
  establecimiento_id: 1,
  nombre_establecimiento: 'Colegio Demo'
};
