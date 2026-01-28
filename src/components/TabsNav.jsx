import React, { useEffect } from 'react';
import HelpTooltip from './common/HelpTooltip';

function TabsNav({ activeTab, setActiveTab, tutorialActive }) {
  // Auto-scroll al cambiar de pestaña
  useEffect(() => {
    const activeBtn = document.querySelector(`button[data-tab-id="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab]);

  const tabs = [
    {
      id: 'alumnos',
      label: 'Alumnos',
      desc: 'En esta sección podrá modificar los datos del alumno y del apoderado registrados en la matrícula, así como eliminar a aquellos alumnos que ya no pertenecen al establecimiento.'
    },
    {
      id: 'matriculas',
      label: 'Matrículas',
      desc: 'En esta sección podrá registrar la matrícula del alumno, ingresando y gestionando la información requerida para su incorporación al establecimiento.'
    },
    {
      id: 'docentes',
      label: 'Docentes',
      desc: 'En esta sección podrá incorporar nuevos docentes y gestionar a los docentes en ejercicio, permitiendo modificar sus datos, actualizar sus funciones académicas o darlos de baja.'
    },
    {
      id: 'asignacion-cursos',
      label: 'Curso/Asignaturas',
      desc: 'En esta sección podrá asignar cursos a los docentes según sus asignaturas, así como modificar o eliminar dichas asignaciones en caso de cambios.'
    },
    {
      id: 'notas-por-curso',
      label: 'Notas por Curso',
      desc: 'En esta sección podrá visualizar las notas de cada curso del establecimiento, organizadas por asignatura y con opción de filtrar por trimestre.'
    },
    {
      id: 'asistencia',
      label: 'Asistencia',
      desc: 'En esta sección podrá visualizar la asistencia mensual de cada curso mediante indicadores, incluyendo el total de registros, el porcentaje de asistencia y la cantidad de alumnos bajo el mínimo exigido para la promoción.'
    },
    {
      id: 'comunicados',
      label: 'Comunicados',
      desc: 'En esta sección el administrador podrá enviar comunicados a cursos específicos o a todo el establecimiento, con el fin de informar oportunamente sobre urgencias, avisos, reuniones o eventos dirigidos a los apoderados en tiempo real.'
    },
    {
      id: 'estadisticas',
      label: 'Estadisticas',
      desc: 'En esta sección podrá analizar el rendimiento académico, la asistencia y el desempeño docente en los cursos asignados, mediante indicadores clave, gráficos y filtros por curso, docente, asignatura o período, obteniendo una visión integral para la toma de decisiones.'
    }
  ];

  return (
    <nav
      className="tabs-nav"
      style={tutorialActive ? {
        position: 'relative',
        zIndex: 100001,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '4px', // Un poco de padding extra para que no quede muy pegado
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      } : {}}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          data-tab-id={tab.id}
        >
          {tab.label}
          <HelpTooltip content={tab.desc} isVisible={true} />
        </button>
      ))}
    </nav>
  );
}

export default TabsNav;
