import React from 'react';
import HelpTooltip from './common/HelpTooltip';

function TabsNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'alumnos', label: 'Alumnos', desc: 'Gestión completa de fichas de estudiantes y apoderados.' },
    { id: 'matriculas', label: 'Matrículas', desc: 'Proceso de admisión y asignación formal de cursos.' },
    { id: 'docentes', label: 'Docentes', desc: 'Directorio de personal docente y administrativo.' },
    { id: 'asignacion-cursos', label: 'Curso/Asignaturas', desc: 'Configuración de niveles, letras y cargas académicas.' },
    { id: 'notas-por-curso', label: 'Notas por Curso', desc: 'Consolidado de calificaciones anuales por nivel.' },
    { id: 'asistencia', label: 'Asistencia', desc: 'Registro histórico y monitoreo de asistencia.' },
    { id: 'comunicados', label: 'Comunicados', desc: 'Difusión de noticias y avisos oficiales.' },
    { id: 'estadisticas', label: 'Estadisticas', desc: 'Tableros de control y métricas de rendimiento.' }
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
