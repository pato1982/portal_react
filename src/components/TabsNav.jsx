import React from 'react';
import HelpTooltip from './common/HelpTooltip';

function TabsNav({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: 'alumnos',
      label: 'Alumnos',
      desc: 'En esta sección podrá gestionar la base de datos completa de estudiantes. Permite crear nuevos alumnos, editar sus fichas personales, modificar datos de apoderados y revisar el estado actual de cada estudiante en el establecimiento.'
    },
    {
      id: 'matriculas',
      label: 'Matrículas',
      desc: 'Módulo central para el proceso de admisión anual. Aquí puede formalizar la matrícula de alumnos antiguos y nuevos, asignarles su curso correspondiente para el año académico y generar la documentación oficial de ingreso.'
    },
    {
      id: 'docentes',
      label: 'Docentes',
      desc: 'Administración del cuerpo docente y funcionarios. Permite registrar nuevos profesores, editar su información de contacto, asignar jefaturas de curso y gestionar sus credenciales de acceso al sistema.'
    },
    {
      id: 'asignacion-cursos',
      label: 'Curso/Asignaturas',
      desc: 'Herramienta de planificación académica. Utilícelo para definir qué asignaturas se imparten en cada curso y asignar al docente responsable de dictarlas. Es fundamental para habilitar el libro de clases digital.'
    },
    {
      id: 'notas-por-curso',
      label: 'Notas por Curso',
      desc: 'Vista panorámica del rendimiento académico. Le permite visualizar y descargar la sábana de notas completa de un curso, facilitando la detección de casos de riesgo y el cierre de semestres o trimestres.'
    },
    {
      id: 'asistencia',
      label: 'Asistencia',
      desc: 'Control de asistencia centralizado. Puede revisar los registros diarios de asistencia por curso, justificar inasistencias y obtener estadísticas de ausentismo para reportes oficiales (SIGE/Ministerio).'
    },
    {
      id: 'comunicados',
      label: 'Comunicados',
      desc: 'Canal de comunicación oficial. Redacte y envíe mensajes masivos o específicos a apoderados y docentes. Ideal para citaciones, avisos de reuniones, emergencias o boletines informativos.'
    },
    {
      id: 'estadisticas',
      label: 'Estadisticas',
      desc: 'Panel de inteligencia de datos. Ofrece gráficos y métricas clave sobre matrícula total, asistencia promedio, rendimiento por nivel y otros indicadores vitales para la toma de decisiones directivas.'
    }
  ];

  return (
    <nav className="tabs-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          {tab.label}
          <HelpTooltip content={tab.desc} isVisible={true} />
        </button>
      ))}
    </nav>
  );
}

export default TabsNav;
