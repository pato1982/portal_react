import React, { useState } from 'react';
import Header from '../Header';
import TutorialGuide from '../common/TutorialGuide';

function AdminPage({ usuario, onCerrarSesion, mostrarMensaje }) {
    const [tabActual, setTabActual] = useState('alumnos');
    const [vistaModo, setVistaModo] = useState('tarjetas');

    // Estado para el tutorial (se muestra si no existe la marca en localStorage)
    const [showTutorial, setShowTutorial] = useState(() => {
        return !localStorage.getItem('hasSeenAdminTour');
    });

    // Lógica de visibilidad de ayuda (Solo establecimiento ID 1)
    const mostrarAyuda = (usuario?.establecimiento_id === 1) || true;

    const tabs = [
        { id: 'alumnos', label: 'Gestión de Alumnos', desc: 'En esta sección podrá modificar los datos del alumno y del apoderado registrados en la matrícula, así como eliminar a aquellos alumnos que ya no pertenecen al establecimiento.', icon: 'group', color: 'blue', img: '/assets/navigation/info.png', badge: 'Estudiantes', size: 'tall' },
        { id: 'matriculas', label: 'Matrículas', desc: 'En esta sección podrá registrar la matrícula del alumno, ingresando y gestionando la información requerida para su incorporación al establecimiento.', icon: 'badge', color: 'orange', img: '/assets/navigation/info.png', badge: 'Admisión', size: 'small' },
        { id: 'docentes', label: 'Cuerpo Docente', desc: 'En esta sección podrá incorporar nuevos docentes y gestionar a los docentes en ejercicio, permitiendo modificar sus datos, actualizar sus funciones académicas o darlos de baja.', icon: 'school', color: 'pink', img: '/assets/navigation/info.png', badge: 'Personal', size: 'small' },
        { id: 'asignacion-cursos', label: 'Cargas Académicas', desc: 'En esta sección podrá asignar cursos a los docentes según sus asignaturas, así como modificar o eliminar dichas asignaciones en caso de cambios.', icon: 'assignment_ind', color: 'green', img: '/assets/navigation/progreso.png', badge: 'Cursos', size: 'small' },
        { id: 'notas-por-curso', label: 'Sábana de Notas', desc: 'En esta sección podrá visualizar las notas de cada curso del establecimiento, organizadas por asignatura y con opción de filtrar por trimestre.', icon: 'menu_book', color: 'purple', img: '/assets/navigation/notas.png', badge: 'Calificaciones', size: 'tall' },
        { id: 'asistencia', label: 'Control Asistencia', desc: 'En esta sección podrá visualizar la asistencia mensual de cada curso mediante indicadores, incluyendo el total de registros, el porcentaje de asistencia y la cantidad de alumnos bajo el mínimo exigido para la promoción.', icon: 'event_available', color: 'blue', img: '/assets/navigation/info.png', badge: 'Presencia', size: 'small' },
        { id: 'comunicados', label: 'Central de Avisos', desc: 'En esta sección el administrador podrá enviar comunicados a cursos específicos o a todo el establecimiento, con el fin de informar oportunamente sobre urgencias, avisos, reuniones o eventos dirigidos a los apoderados en tiempo real.', icon: 'campaign', color: 'green', img: '/assets/navigation/comunicados.png', badge: 'Difusión', size: 'small' },
        { id: 'estadisticas', label: 'Métricas de Gestión', desc: 'En esta sección podrá analizar el rendimiento académico, la asistencia y el desempeño docente en los cursos asignados, mediante indicadores clave, gráficos y filtros por curso, docente, asignatura o período, obteniendo una visión integral para la toma de decisiones.', icon: 'monitoring', color: 'yellow', img: '/assets/navigation/progreso.png', badge: 'Director', size: 'tall' }
    ];

    const seleccionarVista = (tabId) => {
        setTabActual(tabId);
        setVistaModo('contenido');
    };

    const volverAMenu = () => {
        setVistaModo('tarjetas');
    };

    // Reiniciar tutorial para ver cambios (Temporal para debug)
    React.useEffect(() => {
        localStorage.removeItem('hasSeenAdminTour');
        setShowTutorial(true);
    }, []);

    const cerrarTutorial = () => {
        setShowTutorial(false);
        // localStorage.setItem('hasSeenAdminTour', 'true'); // Comentado para obligar a ver
    };

    const handleTutorialStepChange = (tabId) => {
        // En el tutorial, queremos ver las TARJETAS
        if (vistaModo !== 'tarjetas') {
            setVistaModo('tarjetas');
        }
        setTabActual(tabId);
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

            {/* Botón flotante para reactivar tutorial */}
            {!showTutorial && (
                <button
                    onClick={() => setShowTutorial(true)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        zIndex: 90,
                        background: '#1e3a5f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        title: 'Ver Tutorial'
                    }}
                >
                    <span className="material-symbols-outlined">help</span>
                </button>
            )}

            <TutorialGuide
                isVisible={showTutorial}
                onClose={cerrarTutorial}
                activeTab={tabActual}
                onStepChange={handleTutorialStepChange}
            />

            <main className="apoderado-main">
                <div className="notebook-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="section-title-notebook">Panel de Administración</h2>
                        <p>Módulo central de gestión educativa y operativa del establecimiento.</p>
                    </div>
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#f59e0b',
                            border: 'none'
                        }}
                    >
                        <span className="material-symbols-outlined">help</span>
                        Ver Tutorial Interactivo
                    </button>
                </div>

                {vistaModo === 'tarjetas' ? (
                    <div className="notebook-grid-admin">
                        {tabs.map((tab, index) => (
                            <div
                                key={tab.id}
                                data-tab-id={tab.id}
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
                        <div className="notebook-content-header" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button className="btn-volver-notebook" onClick={volverAMenu}>
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    Volver al Menú
                                </button>
                                <h3 className="section-title-notebook" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                    {tabs.find(t => t.id === tabActual)?.label}
                                    <HelpTooltip content={tabs.find(t => t.id === tabActual)?.desc} isVisible={mostrarAyuda} />
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowTutorial(true)}
                                className="btn-primary"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#f59e0b',
                                    border: '2px solid red', /* TEMPORAL PARA QUE LO VEAS */
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <span className="material-symbols-outlined">help</span>
                                Ver Tutorial
                            </button>
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
