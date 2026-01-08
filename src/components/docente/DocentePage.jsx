import React, { useState, useEffect } from 'react';
import AsistenciaTab from './AsistenciaTab';
import AgregarNotaTab from './AgregarNotaTab';
import ModificarNotaTab from './ModificarNotaTab';
import VerNotasTab from './VerNotasTab';
import ProgresoTab from './ProgresoTab';

function DocentePage({ onCambiarVista }) {
  const [tabActual, setTabActual] = useState('asistencia');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('es-CL', options));
    };
    updateDate();
  }, []);

  // Datos del docente (demo)
  const docenteActual = {
    id: 1,
    nombres: 'Maria',
    apellidos: 'Gonzalez',
    iniciales: 'MG'
  };

  // Cursos asignados al docente (demo)
  const cursosDocente = [
    { id: 1, nombre: '1° Basico A' },
    { id: 2, nombre: '2° Basico A' },
    { id: 5, nombre: '1° Medio A' }
  ];

  // Asignaturas asignadas al docente (demo)
  const asignaturasDocente = [
    { id: 1, nombre: 'Matematicas' },
    { id: 2, nombre: 'Lenguaje' }
  ];

  // Asignaciones del docente (curso-asignatura)
  const asignacionesDocente = [
    { curso_id: 1, asignatura_id: 1, curso_nombre: '1° Basico A', asignatura_nombre: 'Matematicas' },
    { curso_id: 1, asignatura_id: 2, curso_nombre: '1° Basico A', asignatura_nombre: 'Lenguaje' },
    { curso_id: 2, asignatura_id: 1, curso_nombre: '2° Basico A', asignatura_nombre: 'Matematicas' },
    { curso_id: 5, asignatura_id: 1, curso_nombre: '1° Medio A', asignatura_nombre: 'Matematicas' }
  ];

  // Alumnos demo por curso
  const alumnosPorCurso = {
    1: [
      { id: 1, nombres: 'Juan Pablo', apellidos: 'Perez Soto', rut: '21.234.567-8' },
      { id: 2, nombres: 'Maria Jose', apellidos: 'Lopez Vera', rut: '21.345.678-9' },
      { id: 3, nombres: 'Pedro Antonio', apellidos: 'Martinez Riquelme', rut: '21.456.789-0' },
      { id: 4, nombres: 'Ana Carolina', apellidos: 'Garcia Fuentes', rut: '21.567.890-1' },
      { id: 5, nombres: 'Carlos Andres', apellidos: 'Rodriguez Meza', rut: '21.678.901-2' }
    ],
    2: [
      { id: 6, nombres: 'Sofia Alejandra', apellidos: 'Hernandez Pino', rut: '21.789.012-3' },
      { id: 7, nombres: 'Diego Ignacio', apellidos: 'Sanchez Bravo', rut: '21.890.123-4' },
      { id: 8, nombres: 'Valentina Paz', apellidos: 'Torres Leiva', rut: '21.901.234-5' },
      { id: 9, nombres: 'Matias Felipe', apellidos: 'Flores Campos', rut: '22.012.345-6' }
    ],
    5: [
      { id: 10, nombres: 'Camila Fernanda', apellidos: 'Rojas Silva', rut: '20.123.456-7' },
      { id: 11, nombres: 'Benjamin Alonso', apellidos: 'Diaz Ortiz', rut: '20.234.567-8' },
      { id: 12, nombres: 'Isidora Belen', apellidos: 'Morales Vega', rut: '20.345.678-9' },
      { id: 13, nombres: 'Sebastian Nicolas', apellidos: 'Munoz Tapia', rut: '20.456.789-0' },
      { id: 14, nombres: 'Antonella Victoria', apellidos: 'Castro Nunez', rut: '20.567.890-1' }
    ]
  };

  // Notas demo - datos completos para todos los alumnos y trimestres
  const [notasRegistradas, setNotasRegistradas] = useState([
    // ============ 1° BASICO A - MATEMATICAS ============
    // Trimestre 1 (Marzo - Mayo)
    { id: 1, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 1, fecha: '2024-03-15', comentario: '' },
    { id: 2, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 1, fecha: '2024-04-10', comentario: '' },
    { id: 3, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 1, fecha: '2024-05-08', comentario: 'Excelente progreso' },
    { id: 4, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.8, trimestre: 1, fecha: '2024-03-15', comentario: '' },
    { id: 5, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.0, trimestre: 1, fecha: '2024-04-10', comentario: '' },
    { id: 6, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.5, trimestre: 1, fecha: '2024-05-08', comentario: '' },
    { id: 7, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 4.5, trimestre: 1, fecha: '2024-03-15', comentario: 'Necesita refuerzo' },
    { id: 8, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 4.8, trimestre: 1, fecha: '2024-04-10', comentario: '' },
    { id: 9, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.0, trimestre: 1, fecha: '2024-05-08', comentario: 'Mejorando' },
    { id: 10, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 1, fecha: '2024-03-15', comentario: '' },
    { id: 11, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 1, fecha: '2024-04-10', comentario: 'Excelente' },
    { id: 12, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 1, fecha: '2024-05-08', comentario: '' },
    { id: 13, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.2, trimestre: 1, fecha: '2024-03-15', comentario: '' },
    { id: 14, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.5, trimestre: 1, fecha: '2024-04-10', comentario: '' },
    { id: 15, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.8, trimestre: 1, fecha: '2024-05-08', comentario: '' },
    // Trimestre 2 (Junio - Agosto)
    { id: 16, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.3, trimestre: 2, fecha: '2024-06-12', comentario: '' },
    { id: 17, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 2, fecha: '2024-07-10', comentario: '' },
    { id: 18, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 2, fecha: '2024-08-14', comentario: '' },
    { id: 19, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.9, trimestre: 2, fecha: '2024-06-12', comentario: '' },
    { id: 20, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 2, fecha: '2024-07-10', comentario: '' },
    { id: 21, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.0, trimestre: 2, fecha: '2024-08-14', comentario: '' },
    { id: 22, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.2, trimestre: 2, fecha: '2024-06-12', comentario: '' },
    { id: 23, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.5, trimestre: 2, fecha: '2024-07-10', comentario: '' },
    { id: 24, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.3, trimestre: 2, fecha: '2024-08-14', comentario: '' },
    { id: 25, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 2, fecha: '2024-06-12', comentario: '' },
    { id: 26, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 2, fecha: '2024-07-10', comentario: '' },
    { id: 27, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 2, fecha: '2024-08-14', comentario: '' },
    { id: 28, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.6, trimestre: 2, fecha: '2024-06-12', comentario: '' },
    { id: 29, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.9, trimestre: 2, fecha: '2024-07-10', comentario: '' },
    { id: 30, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.1, trimestre: 2, fecha: '2024-08-14', comentario: '' },
    // Trimestre 3 (Septiembre - Diciembre)
    { id: 31, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.4, trimestre: 3, fecha: '2024-09-11', comentario: '' },
    { id: 32, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.6, trimestre: 3, fecha: '2024-10-16', comentario: '' },
    { id: 33, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 3, fecha: '2024-11-13', comentario: '' },
    { id: 34, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.1, trimestre: 3, fecha: '2024-09-11', comentario: '' },
    { id: 35, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.3, trimestre: 3, fecha: '2024-10-16', comentario: '' },
    { id: 36, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 3, fecha: '2024-11-13', comentario: '' },
    { id: 37, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.4, trimestre: 3, fecha: '2024-09-11', comentario: '' },
    { id: 38, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.7, trimestre: 3, fecha: '2024-10-16', comentario: '' },
    { id: 39, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.9, trimestre: 3, fecha: '2024-11-13', comentario: '' },
    { id: 40, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 3, fecha: '2024-09-11', comentario: '' },
    { id: 41, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 3, fecha: '2024-10-16', comentario: '' },
    { id: 42, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 3, fecha: '2024-11-13', comentario: '' },
    { id: 43, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.0, trimestre: 3, fecha: '2024-09-11', comentario: '' },
    { id: 44, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 3, fecha: '2024-10-16', comentario: '' },
    { id: 45, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.4, trimestre: 3, fecha: '2024-11-13', comentario: '' },

    // ============ 1° BASICO A - LENGUAJE ============
    // Trimestre 1
    { id: 46, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.8, trimestre: 1, fecha: '2024-03-18', comentario: '' },
    { id: 47, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.0, trimestre: 1, fecha: '2024-04-15', comentario: '' },
    { id: 48, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.2, trimestre: 1, fecha: '2024-05-13', comentario: '' },
    { id: 49, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.5, trimestre: 1, fecha: '2024-03-18', comentario: '' },
    { id: 50, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.7, trimestre: 1, fecha: '2024-04-15', comentario: '' },
    { id: 51, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.8, trimestre: 1, fecha: '2024-05-13', comentario: '' },
    { id: 52, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 4.2, trimestre: 1, fecha: '2024-03-18', comentario: 'Dificultades en lectura' },
    { id: 53, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 4.5, trimestre: 1, fecha: '2024-04-15', comentario: '' },
    { id: 54, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 4.8, trimestre: 1, fecha: '2024-05-13', comentario: '' },
    { id: 55, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.8, trimestre: 1, fecha: '2024-03-18', comentario: '' },
    { id: 56, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 7.0, trimestre: 1, fecha: '2024-04-15', comentario: '' },
    { id: 57, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.9, trimestre: 1, fecha: '2024-05-13', comentario: '' },
    { id: 58, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.0, trimestre: 1, fecha: '2024-03-18', comentario: '' },
    { id: 59, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.3, trimestre: 1, fecha: '2024-04-15', comentario: '' },
    { id: 60, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.5, trimestre: 1, fecha: '2024-05-13', comentario: '' },
    // Trimestre 2
    { id: 61, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.1, trimestre: 2, fecha: '2024-06-17', comentario: '' },
    { id: 62, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.3, trimestre: 2, fecha: '2024-07-15', comentario: '' },
    { id: 63, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.5, trimestre: 2, fecha: '2024-08-19', comentario: '' },
    { id: 64, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.6, trimestre: 2, fecha: '2024-06-17', comentario: '' },
    { id: 65, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.8, trimestre: 2, fecha: '2024-07-15', comentario: '' },
    { id: 66, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 7.0, trimestre: 2, fecha: '2024-08-19', comentario: '' },
    { id: 67, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.0, trimestre: 2, fecha: '2024-06-17', comentario: '' },
    { id: 68, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.2, trimestre: 2, fecha: '2024-07-15', comentario: '' },
    { id: 69, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.4, trimestre: 2, fecha: '2024-08-19', comentario: '' },
    { id: 70, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.7, trimestre: 2, fecha: '2024-06-17', comentario: '' },
    { id: 71, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.9, trimestre: 2, fecha: '2024-07-15', comentario: '' },
    { id: 72, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 7.0, trimestre: 2, fecha: '2024-08-19', comentario: '' },
    { id: 73, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.4, trimestre: 2, fecha: '2024-06-17', comentario: '' },
    { id: 74, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.6, trimestre: 2, fecha: '2024-07-15', comentario: '' },
    { id: 75, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.8, trimestre: 2, fecha: '2024-08-19', comentario: '' },
    // Trimestre 3
    { id: 76, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.4, trimestre: 3, fecha: '2024-09-16', comentario: '' },
    { id: 77, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.6, trimestre: 3, fecha: '2024-10-21', comentario: '' },
    { id: 78, alumno_id: 1, alumno_nombre: 'Juan Pablo Perez Soto', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.8, trimestre: 3, fecha: '2024-11-18', comentario: '' },
    { id: 79, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.9, trimestre: 3, fecha: '2024-09-16', comentario: '' },
    { id: 80, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 7.0, trimestre: 3, fecha: '2024-10-21', comentario: '' },
    { id: 81, alumno_id: 2, alumno_nombre: 'Maria Jose Lopez Vera', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 7.0, trimestre: 3, fecha: '2024-11-18', comentario: '' },
    { id: 82, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.5, trimestre: 3, fecha: '2024-09-16', comentario: '' },
    { id: 83, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.7, trimestre: 3, fecha: '2024-10-21', comentario: '' },
    { id: 84, alumno_id: 3, alumno_nombre: 'Pedro Antonio Martinez Riquelme', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.9, trimestre: 3, fecha: '2024-11-18', comentario: '' },
    { id: 85, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.8, trimestre: 3, fecha: '2024-09-16', comentario: '' },
    { id: 86, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 7.0, trimestre: 3, fecha: '2024-10-21', comentario: '' },
    { id: 87, alumno_id: 4, alumno_nombre: 'Ana Carolina Garcia Fuentes', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 7.0, trimestre: 3, fecha: '2024-11-18', comentario: '' },
    { id: 88, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.7, trimestre: 3, fecha: '2024-09-16', comentario: '' },
    { id: 89, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 5.9, trimestre: 3, fecha: '2024-10-21', comentario: '' },
    { id: 90, alumno_id: 5, alumno_nombre: 'Carlos Andres Rodriguez Meza', curso_id: 1, curso_nombre: '1° Basico A', asignatura_id: 2, asignatura_nombre: 'Lenguaje', nota: 6.1, trimestre: 3, fecha: '2024-11-18', comentario: '' },

    // ============ 2° BASICO A - MATEMATICAS ============
    // Trimestre 1
    { id: 91, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 1, fecha: '2024-03-14', comentario: '' },
    { id: 92, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.4, trimestre: 1, fecha: '2024-04-11', comentario: '' },
    { id: 93, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.6, trimestre: 1, fecha: '2024-05-09', comentario: '' },
    { id: 94, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.5, trimestre: 1, fecha: '2024-03-14', comentario: '' },
    { id: 95, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.7, trimestre: 1, fecha: '2024-04-11', comentario: '' },
    { id: 96, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.9, trimestre: 1, fecha: '2024-05-09', comentario: '' },
    { id: 97, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 1, fecha: '2024-03-14', comentario: '' },
    { id: 98, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 1, fecha: '2024-04-11', comentario: 'Destacada' },
    { id: 99, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 1, fecha: '2024-05-09', comentario: '' },
    { id: 100, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 4.8, trimestre: 1, fecha: '2024-03-14', comentario: '' },
    { id: 101, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.0, trimestre: 1, fecha: '2024-04-11', comentario: '' },
    { id: 102, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.2, trimestre: 1, fecha: '2024-05-09', comentario: '' },
    // Trimestre 2
    { id: 103, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 2, fecha: '2024-06-13', comentario: '' },
    { id: 104, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 2, fecha: '2024-07-11', comentario: '' },
    { id: 105, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 2, fecha: '2024-08-15', comentario: '' },
    { id: 106, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.8, trimestre: 2, fecha: '2024-06-13', comentario: '' },
    { id: 107, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.0, trimestre: 2, fecha: '2024-07-11', comentario: '' },
    { id: 108, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 2, fecha: '2024-08-15', comentario: '' },
    { id: 109, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 2, fecha: '2024-06-13', comentario: '' },
    { id: 110, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 2, fecha: '2024-07-11', comentario: '' },
    { id: 111, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 2, fecha: '2024-08-15', comentario: '' },
    { id: 112, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.3, trimestre: 2, fecha: '2024-06-13', comentario: '' },
    { id: 113, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.5, trimestre: 2, fecha: '2024-07-11', comentario: '' },
    { id: 114, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.7, trimestre: 2, fecha: '2024-08-15', comentario: '' },
    // Trimestre 3
    { id: 115, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.6, trimestre: 3, fecha: '2024-09-12', comentario: '' },
    { id: 116, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 3, fecha: '2024-10-17', comentario: '' },
    { id: 117, alumno_id: 6, alumno_nombre: 'Sofia Alejandra Hernandez Pino', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 3, fecha: '2024-11-14', comentario: '' },
    { id: 118, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.1, trimestre: 3, fecha: '2024-09-12', comentario: '' },
    { id: 119, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.3, trimestre: 3, fecha: '2024-10-17', comentario: '' },
    { id: 120, alumno_id: 7, alumno_nombre: 'Diego Ignacio Sanchez Bravo', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 3, fecha: '2024-11-14', comentario: '' },
    { id: 121, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 3, fecha: '2024-09-12', comentario: '' },
    { id: 122, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 3, fecha: '2024-10-17', comentario: '' },
    { id: 123, alumno_id: 8, alumno_nombre: 'Valentina Paz Torres Leiva', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 3, fecha: '2024-11-14', comentario: '' },
    { id: 124, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.6, trimestre: 3, fecha: '2024-09-12', comentario: '' },
    { id: 125, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.8, trimestre: 3, fecha: '2024-10-17', comentario: '' },
    { id: 126, alumno_id: 9, alumno_nombre: 'Matias Felipe Flores Campos', curso_id: 2, curso_nombre: '2° Basico A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.0, trimestre: 3, fecha: '2024-11-14', comentario: '' },

    // ============ 1° MEDIO A - MATEMATICAS ============
    // Trimestre 1
    { id: 127, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 1, fecha: '2024-03-20', comentario: '' },
    { id: 128, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 1, fecha: '2024-04-17', comentario: '' },
    { id: 129, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 1, fecha: '2024-05-15', comentario: '' },
    { id: 130, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.5, trimestre: 1, fecha: '2024-03-20', comentario: '' },
    { id: 131, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.8, trimestre: 1, fecha: '2024-04-17', comentario: '' },
    { id: 132, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.6, trimestre: 1, fecha: '2024-05-15', comentario: '' },
    { id: 133, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.0, trimestre: 1, fecha: '2024-03-20', comentario: '' },
    { id: 134, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 1, fecha: '2024-04-17', comentario: '' },
    { id: 135, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.4, trimestre: 1, fecha: '2024-05-15', comentario: '' },
    { id: 136, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 4.2, trimestre: 1, fecha: '2024-03-20', comentario: 'Requiere apoyo' },
    { id: 137, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 4.5, trimestre: 1, fecha: '2024-04-17', comentario: '' },
    { id: 138, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 4.8, trimestre: 1, fecha: '2024-05-15', comentario: '' },
    { id: 139, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 1, fecha: '2024-03-20', comentario: 'Excelente' },
    { id: 140, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 1, fecha: '2024-04-17', comentario: '' },
    { id: 141, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 1, fecha: '2024-05-15', comentario: '' },
    // Trimestre 2
    { id: 142, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.6, trimestre: 2, fecha: '2024-06-19', comentario: '' },
    { id: 143, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 2, fecha: '2024-07-17', comentario: '' },
    { id: 144, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 2, fecha: '2024-08-21', comentario: '' },
    { id: 145, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.7, trimestre: 2, fecha: '2024-06-19', comentario: '' },
    { id: 146, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.9, trimestre: 2, fecha: '2024-07-17', comentario: '' },
    { id: 147, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.1, trimestre: 2, fecha: '2024-08-21', comentario: '' },
    { id: 148, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.3, trimestre: 2, fecha: '2024-06-19', comentario: '' },
    { id: 149, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 2, fecha: '2024-07-17', comentario: '' },
    { id: 150, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 2, fecha: '2024-08-21', comentario: '' },
    { id: 151, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.0, trimestre: 2, fecha: '2024-06-19', comentario: '' },
    { id: 152, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.2, trimestre: 2, fecha: '2024-07-17', comentario: '' },
    { id: 153, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.4, trimestre: 2, fecha: '2024-08-21', comentario: '' },
    { id: 154, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 2, fecha: '2024-06-19', comentario: '' },
    { id: 155, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 2, fecha: '2024-07-17', comentario: '' },
    { id: 156, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 2, fecha: '2024-08-21', comentario: '' },
    // Trimestre 3
    { id: 157, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 3, fecha: '2024-09-18', comentario: '' },
    { id: 158, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 3, fecha: '2024-10-23', comentario: '' },
    { id: 159, alumno_id: 10, alumno_nombre: 'Camila Fernanda Rojas Silva', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 3, fecha: '2024-11-20', comentario: '' },
    { id: 160, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.0, trimestre: 3, fecha: '2024-09-18', comentario: '' },
    { id: 161, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.2, trimestre: 3, fecha: '2024-10-23', comentario: '' },
    { id: 162, alumno_id: 11, alumno_nombre: 'Benjamin Alonso Diaz Ortiz', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.4, trimestre: 3, fecha: '2024-11-20', comentario: '' },
    { id: 163, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.5, trimestre: 3, fecha: '2024-09-18', comentario: '' },
    { id: 164, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.7, trimestre: 3, fecha: '2024-10-23', comentario: '' },
    { id: 165, alumno_id: 12, alumno_nombre: 'Isidora Belen Morales Vega', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.9, trimestre: 3, fecha: '2024-11-20', comentario: '' },
    { id: 166, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.3, trimestre: 3, fecha: '2024-09-18', comentario: '' },
    { id: 167, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.5, trimestre: 3, fecha: '2024-10-23', comentario: '' },
    { id: 168, alumno_id: 13, alumno_nombre: 'Sebastian Nicolas Munoz Tapia', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 5.7, trimestre: 3, fecha: '2024-11-20', comentario: '' },
    { id: 169, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 6.8, trimestre: 3, fecha: '2024-09-18', comentario: '' },
    { id: 170, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 3, fecha: '2024-10-23', comentario: '' },
    { id: 171, alumno_id: 14, alumno_nombre: 'Antonella Victoria Castro Nunez', curso_id: 5, curso_nombre: '1° Medio A', asignatura_id: 1, asignatura_nombre: 'Matematicas', nota: 7.0, trimestre: 3, fecha: '2024-11-20', comentario: '' }
  ]);

  const tabs = [
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'agregar-nota', label: 'Agregar Nota' },
    { id: 'modificar-nota', label: 'Modificar Nota' },
    { id: 'ver-notas', label: 'Ver Notas' },
    { id: 'progreso', label: 'Progreso' }
  ];

  const agregarNota = (nuevaNota) => {
    const nota = {
      id: notasRegistradas.length + 1,
      ...nuevaNota
    };
    setNotasRegistradas([nota, ...notasRegistradas]);
  };

  const editarNota = (id, datosActualizados) => {
    setNotasRegistradas(notasRegistradas.map(nota =>
      nota.id === id ? { ...nota, ...datosActualizados } : nota
    ));
  };

  const eliminarNota = (id) => {
    setNotasRegistradas(notasRegistradas.filter(nota => nota.id !== id));
  };

  return (
    <div className="app-container">
      {/* Header igual al admin */}
      <header className="main-header">
        <div className="header-content">
          <div className="brand">
            <div className="logo">
              <span className="logo-icon">E</span>
            </div>
            <div className="brand-text">
              <h1>Portal Docente</h1>
            </div>
          </div>
          <div className="header-info">
            <span className="user-info">{docenteActual.nombres} {docenteActual.apellidos}</span>
            <span className="current-date">{currentDate}</span>
            <button className="btn-logout" onClick={onCambiarVista} title="Cerrar Sesion">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="main-content">
        <section className="control-panel">
          <div className="panel-header">
            <h2>Panel de Control - Docente</h2>
          </div>

          {/* Tabs de navegacion */}
          <div className="tabs-container">
            <nav className="tabs-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${tabActual === tab.id ? 'active' : ''}`}
                  onClick={() => setTabActual(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Contenido de las pestanas */}
            <div className="tabs-content">
              {tabActual === 'asistencia' && (
                <AsistenciaTab
                  cursos={cursosDocente}
                  alumnosPorCurso={alumnosPorCurso}
                />
              )}

              {tabActual === 'agregar-nota' && (
                <AgregarNotaTab
                  cursos={cursosDocente}
                  asignaciones={asignacionesDocente}
                  alumnosPorCurso={alumnosPorCurso}
                  notasRegistradas={notasRegistradas}
                  onAgregarNota={agregarNota}
                />
              )}

              {tabActual === 'modificar-nota' && (
                <ModificarNotaTab
                  cursos={cursosDocente}
                  asignaciones={asignacionesDocente}
                  alumnosPorCurso={alumnosPorCurso}
                  notasRegistradas={notasRegistradas}
                  onEditarNota={editarNota}
                  onEliminarNota={eliminarNota}
                />
              )}

              {tabActual === 'ver-notas' && (
                <VerNotasTab
                  cursos={cursosDocente}
                  asignaciones={asignacionesDocente}
                  alumnosPorCurso={alumnosPorCurso}
                  notasRegistradas={notasRegistradas}
                />
              )}

              {tabActual === 'progreso' && (
                <ProgresoTab
                  cursos={cursosDocente}
                  asignaciones={asignacionesDocente}
                  alumnosPorCurso={alumnosPorCurso}
                  notasRegistradas={notasRegistradas}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>Sistema de Gestion Academica &copy; 2024 | Todos los derechos reservados</p>
        <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
      </footer>
    </div>
  );
}

export default DocentePage;
