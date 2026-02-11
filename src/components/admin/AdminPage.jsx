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
                    <>
                        <style>{`
                            .octagonal-system-container {
                                display: flex;
                                justify-content: center;
                                padding: 20px 0;
                            }
                            .octagonal-grid {
                                display: grid;
                                grid-template-areas:
                                    "pos0 pos1 pos2"
                                    "pos3 center pos4"
                                    "pos5 pos6 pos7";
                                gap: 20px;
                                max-width: 800px;
                                width: 100%;
                            }
                            .octagon-btn {
                                position: relative;
                                background: linear-gradient(145deg, #1e3a5f, #152e4d);
                                color: white;
                                border: none;
                                cursor: pointer;
                                aspect-ratio: 1;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                padding: 15px;
                                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                                clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
                                text-align: center;
                                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                            }
                            .octagon-btn:hover {
                                transform: scale(1.05) translateY(-5px);
                                background: linear-gradient(145deg, #3b82f6, #1d4ed8);
                                z-index: 10;
                                box-shadow: 0 15px 30px rgba(0,0,0,0.3);
                            }
                            .octagon-btn .material-symbols-outlined {
                                font-size: 42px;
                                margin-bottom: 10px;
                                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            }
                            .octagon-btn .btn-label {
                                font-weight: 700;
                                font-size: 1rem;
                                line-height: 1.2;
                                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                            }
                            .center-brand {
                                grid-area: center;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-direction: column;
                            }
                            
                            /* Tablet & Mobile responsive adjustments */
                            @media (max-width: 900px) {
                                .octagonal-grid {
                                    gap: 15px;
                                    max-width: 600px;
                                }
                                .octagon-btn .material-symbols-outlined { font-size: 32px; }
                                .octagon-btn .btn-label { font-size: 0.9rem; }
                            }

                            @media (max-width: 600px) {
                                .octagonal-grid {
                                    grid-template-areas:
                                        "pos0 pos1"
                                        "pos2 pos3"
                                        "pos4 pos5"
                                        "pos6 pos7";
                                    max-width: 100%;
                                    gap: 10px;
                                }
                                .center-brand { display: none; }
                                .octagon-btn {
                                    clip-path: none; /* En móvil, volver a cuadrados redondeados para mejor uso del espacio */
                                    border-radius: 12px;
                                    aspect-ratio: auto;
                                    padding: 20px 10px;
                                }
                                .octagon-btn .material-symbols-outlined { font-size: 32px; margin-bottom: 5px; }
                            }
                        `}</style>
                        <div className="octagonal-system-container">
                            <div className="octagonal-grid">
                                {tabs.map((tab, index) => (
                                    <button
                                        key={tab.id}
                                        className="octagon-btn"
                                        onClick={() => seleccionarVista(tab.id)}
                                        style={{ gridArea: `pos${index}` }}
                                    >
                                        <span className="material-symbols-outlined">{tab.icon}</span>
                                        <span className="btn-label">{tab.label}</span>
                                    </button>
                                ))}
                                <div className="center-brand">
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#64748b' }}>admin_panel_settings</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
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
