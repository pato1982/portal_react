// Datos de demostración para la aplicación
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

export const docentesDB = [
  { id: 1, nombres: 'María José', apellidos: 'González Pérez', rut: '12.345.678-9', email: 'mgonzalez@colegio.cl', nombre_completo: 'González Pérez, María José' },
  { id: 2, nombres: 'Juan Carlos', apellidos: 'Rodríguez Silva', rut: '13.456.789-0', email: 'jrodriguez@colegio.cl', nombre_completo: 'Rodríguez Silva, Juan Carlos' },
  { id: 3, nombres: 'Ana María', apellidos: 'López Muñoz', rut: '14.567.890-1', email: 'alopez@colegio.cl', nombre_completo: 'López Muñoz, Ana María' },
  { id: 4, nombres: 'Pedro Antonio', apellidos: 'Martínez Soto', rut: '15.678.901-2', email: 'pmartinez@colegio.cl', nombre_completo: 'Martínez Soto, Pedro Antonio' },
  { id: 5, nombres: 'Carmen Gloria', apellidos: 'Fernández Castro', rut: '16.789.012-3', email: 'cfernandez@colegio.cl', nombre_completo: 'Fernández Castro, Carmen Gloria' }
];

export const docenteEspecialidadesDB = {
  1: [{ id: 1, nombre: 'Matemáticas' }, { id: 4, nombre: 'Ciencias Naturales' }],
  2: [{ id: 2, nombre: 'Lenguaje y Comunicación' }, { id: 3, nombre: 'Historia' }],
  3: [{ id: 5, nombre: 'Inglés' }],
  4: [{ id: 6, nombre: 'Educación Física' }],
  5: [{ id: 7, nombre: 'Artes Visuales' }, { id: 8, nombre: 'Música' }]
};

export const alumnosPorCursoDB = {
  '1° Básico A': [
    { id: 1, nombres: 'Lucas', apellidos: 'Araya Muñoz', rut: '23.456.789-0', fecha_nacimiento: '2017-03-15', sexo: 'Masculino', nombre_completo: 'Araya Muñoz, Lucas', curso_nombre: '1° Básico A' },
    { id: 2, nombres: 'Sofía', apellidos: 'Bravo Torres', rut: '23.567.890-1', fecha_nacimiento: '2017-05-22', sexo: 'Femenino', nombre_completo: 'Bravo Torres, Sofía', curso_nombre: '1° Básico A' },
    { id: 3, nombres: 'Matías', apellidos: 'Castro Vega', rut: '23.678.901-2', fecha_nacimiento: '2017-01-10', sexo: 'Masculino', nombre_completo: 'Castro Vega, Matías', curso_nombre: '1° Básico A' }
  ],
  '1° Básico B': [
    { id: 4, nombres: 'Valentina', apellidos: 'Díaz Rojas', rut: '23.789.012-3', fecha_nacimiento: '2017-07-08', sexo: 'Femenino', nombre_completo: 'Díaz Rojas, Valentina', curso_nombre: '1° Básico B' },
    { id: 5, nombres: 'Benjamín', apellidos: 'Espinoza Lagos', rut: '23.890.123-4', fecha_nacimiento: '2017-09-14', sexo: 'Masculino', nombre_completo: 'Espinoza Lagos, Benjamín', curso_nombre: '1° Básico B' }
  ],
  '2° Básico A': [
    { id: 6, nombres: 'Isidora', apellidos: 'Fuentes Mora', rut: '22.901.234-5', fecha_nacimiento: '2016-02-28', sexo: 'Femenino', nombre_completo: 'Fuentes Mora, Isidora', curso_nombre: '2° Básico A' },
    { id: 7, nombres: 'Agustín', apellidos: 'García Pino', rut: '22.012.345-6', fecha_nacimiento: '2016-11-05', sexo: 'Masculino', nombre_completo: 'García Pino, Agustín', curso_nombre: '2° Básico A' }
  ]
};

export const asignacionesDB = [
  { id: 1, docente_id: 1, curso_id: 1, asignatura_id: 1, docente: 'González Pérez, María José', curso: '1° Básico A', asignatura: 'Matemáticas' },
  { id: 2, docente_id: 1, curso_id: 2, asignatura_id: 1, docente: 'González Pérez, María José', curso: '1° Básico B', asignatura: 'Matemáticas' },
  { id: 3, docente_id: 2, curso_id: 1, asignatura_id: 2, docente: 'Rodríguez Silva, Juan Carlos', curso: '1° Básico A', asignatura: 'Lenguaje y Comunicación' },
  { id: 4, docente_id: 3, curso_id: 1, asignatura_id: 5, docente: 'López Muñoz, Ana María', curso: '1° Básico A', asignatura: 'Inglés' },
  { id: 5, docente_id: 4, curso_id: 1, asignatura_id: 6, docente: 'Martínez Soto, Pedro Antonio', curso: '1° Básico A', asignatura: 'Educación Física' }
];

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
