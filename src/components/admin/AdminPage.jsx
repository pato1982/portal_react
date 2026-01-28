import React, { useState } from 'react';
import Header from '../Header';
import HelpTooltip from '../common/HelpTooltip';
import AlumnosTab from '../AlumnosTab';
import MatriculasTab from '../MatriculasTab';
import DocentesTab from '../DocentesTab';
import AsignacionesTab from '../AsignacionesTab';
import NotasPorCursoTab from '../NotasPorCursoTab';
import AsistenciaTab from '../AsistenciaTab';
import ComunicadosTab from '../ComunicadosTab';
import EstadisticasTab from '../EstadisticasTab';

function AdminPage({ usuario, onCerrarSesion, mostrarMensaje }) {
    const [tabActual, setTabActual] = useState('alumnos');
    const [vistaModo, setVistaModo] = useState('tarjetas');

    // Lógica de visibilidad de ayuda (Solo establecimiento ID 1)
    const mostrarAyuda = (usuario?.establecimiento_id === 1) || true;

    const tabs = [
        { id: 'alumnos', label: 'Gestión de Alumnos', desc: 'Matrículas, expedientes y base de datos de estudiantes.', icon: 'group', color: 'blue', img: '/assets/navigation/info.png', badge: 'Estudiantes', size: 'tall' },
        { id: 'matriculas', label: 'Matrículas', desc: 'Asignar cursos anuales a alumnos existentes.', icon: 'badge', color: 'orange', img: '/assets/navigation/info.png', badge: 'Admisión', size: 'small' },
        { id: 'docentes', label: 'Cuerpo Docente', desc: 'Administración de profesores y personal.', icon: 'school', color: 'pink', img: '/assets/navigation/info.png', badge: 'Personal', size: 'small' },
        { id: 'asignacion-cursos', label: 'Cargas Académicas', desc: 'Asignar docentes a cursos y materias.', icon: 'assignment_ind', color: 'green', img: '/assets/navigation/progreso.png', badge: 'Cursos', size: 'small' },
        { id: 'notas-por-curso', label: 'Sábana de Notas', desc: 'Reportes académicos consolidados por nivel.', icon: 'menu_book', color: 'purple', img: '/assets/navigation/notas.png', badge: 'Calificaciones', size: 'tall' },
        { id: 'asistencia', label: 'Control Asistencia', desc: 'Monitoreo global de asistencia diaria.', icon: 'event_available', color: 'blue', img: '/assets/navigation/info.png', badge: 'Presencia', size: 'small' },
        { id: 'comunicados', label: 'Central de Avisos', desc: 'Envío masivo de comunicados oficiales.', icon: 'campaign', color: 'green', img: '/assets/navigation/comunicados.png', badge: 'Difusión', size: 'small' },
        { id: 'estadisticas', label: 'Métricas de Gestión', desc: 'Análisis de rendimiento y kpis del colegio.', icon: 'monitoring', color: 'yellow', img: '/assets/navigation/progreso.png', badge: 'Director', size: 'tall' }
    ];

    const seleccionarVista = (tabId) => {
        setTabActual(tabId);
        setVistaModo('contenido');
    };

    const volverAMenu = () => {
        setVistaModo('tarjetas');
    };

    const renderTabContent = () => {
        switch (tabActual) {
            case 'alumnos': return <AlumnosTab mostrarMensaje={mostrarMensaje} />;
            case 'matriculas': return <MatriculasTab mostrarMensaje={mostrarMensaje} />;
            case 'docentes': return <DocentesTab mostrarMensaje={mostrarMensaje} />;
            case 'asignacion-cursos': return <AsignacionesTab mostrarMensaje={mostrarMensaje} />;
            case 'notas-por-curso': return <NotasPorCursoTab mostrarMensaje={mostrarMensaje} />;
            case 'asistencia': return <AsistenciaTab mostrarMensaje={mostrarMensaje} />;
            case 'comunicados': return <ComunicadosTab mostrarMensaje={mostrarMensaje} />;
            case 'estadisticas': return <EstadisticasTab />;
            default: return <AlumnosTab mostrarMensaje={mostrarMensaje} />;
        }
    };

    return (
        <div className="apoderado-container">
            <Header usuario={usuario} onCerrarSesion={onCerrarSesion} />

            <main className="apoderado-main">
                <div className="notebook-header" style={{ marginBottom: '40px' }}>
                    <h2 className="section-title-notebook">Panel de Administración</h2>
                    <p>Módulo central de gestión educativa y operativa del establecimiento.</p>
                </div>

                {vistaModo === 'tarjetas' ? (
                    <div className="notebook-grid-admin">
                        {tabs.map((tab, index) => (
                            <div
                                key={tab.id}
                                className={`notebook-card card-${tab.id} card-${tab.color} ${tab.size === 'tall' ? 'card-tall' : 'card-small'}`}
                                onClick={() => seleccionarVista(tab.id)}
                            >
                                {/* Visual binds */}
                                {tab.size === 'tall' && (index === 0 || index === 3 || index === 6) && <div className="spiral-bind"></div>}
                                {tab.size === 'small' && <div className="folder-tab"></div>}

                                <div className="notebook-card-content">
                                    {tab.size === 'tall' && (
                                        <div className="notebook-label-box">
                                            <img src={tab.img} alt={tab.label} />
                                        </div>
                                    )}
                                    <div className="mt-auto">
                                        <h3 className="notebook-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {tab.label}
                                            <HelpTooltip content={tab.desc} isVisible={mostrarAyuda} />
                                        </h3>
                                        <p className="notebook-desc">{tab.desc}</p>
                                        <div className="notebook-footer">
                                            <span className="notebook-badge">{tab.badge}</span>
                                            <div className="notebook-icon-circle">
                                                <span className="material-symbols-outlined">{tab.icon}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="notebook-content-view">
                        <div className="notebook-content-header">
                            <button className="btn-volver-notebook" onClick={volverAMenu}>
                                <span className="material-symbols-outlined">arrow_back</span>
                                Volver al Menú
                            </button>
                            <h3 className="section-title-notebook" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {tabs.find(t => t.id === tabActual)?.label}
                                <HelpTooltip content={tabs.find(t => t.id === tabActual)?.desc} isVisible={mostrarAyuda} />
                            </h3>
                        </div>
                        <div className="notebook-content-body">
                            {renderTabContent()}
                        </div>
                    </div>
                )}
            </main>

            <footer className="main-footer">
                <p>Sistema de Gestión Académica &copy; 2024 | Todos los derechos reservados</p>
                <p className="footer-creditos">Sistema escolar desarrollado por <span className="ch-naranja">CH</span>system</p>
            </footer>
        </div>
    );
}

export default AdminPage;
