import React from 'react';

function TabsNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'alumnos', label: 'Alumnos' },
    { id: 'docentes', label: 'Docentes' },
    { id: 'asignacion-cursos', label: 'Curso/Asignaturas' },
    { id: 'notas-por-curso', label: 'Notas por Curso' },
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'comunicados', label: 'Comunicados' },
    { id: 'estadisticas', label: 'Estadisticas' }
  ];

  return (
    <nav className="tabs-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default TabsNav;
