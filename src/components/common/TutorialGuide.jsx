import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/tour_guia.css';

const STEPS = [
    {
        target: 'alumnos',
        title: 'Gestión de Alumnos',
        content: 'Aquí podrás modificar los datos del alumno y del apoderado registrados en la matrícula, así como eliminar a aquellos alumnos que ya no pertenecen al establecimiento.'
    },
    {
        target: 'matriculas',
        title: 'Matrículas',
        content: 'En esta sección podrá registrar la matrícula del alumno, ingresando y gestionando la información requerida para su incorporación al establecimiento.'
    },
    {
        target: 'docentes',
        title: 'Cuerpo Docente',
        content: 'Aquí podrás incorporar nuevos docentes y gestionar a los docentes en ejercicio: modificar datos, actualizar funciones académicas o darlos de baja.'
    },
    {
        target: 'asignacion-cursos',
        title: 'Cargas Académicas',
        content: 'Asigna cursos a los docentes según sus asignaturas. También puedes modificar o eliminar dichas asignaciones si hay cambios en la planificación.'
    },
    {
        target: 'notas-por-curso',
        title: 'Sábana de Notas',
        content: 'Visualiza las notas de cada curso del establecimiento. Están organizadas por asignatura y puedes filtrar por trimestre para ver el detalle.'
    },
    {
        target: 'asistencia',
        title: 'Control de Asistencia',
        content: 'Revisa la asistencia mensual de cada curso con indicadores visuales: total de registros, % de asistencia y alumnos en riesgo de repitencia.'
    },
    {
        target: 'comunicados',
        title: 'Central de Avisos',
        content: 'Envía comunicados a cursos específicos o a todo el colegio. Ideal para informar urgencias, avisos, reuniones o eventos a los apoderados en tiempo real.'
    },
    {
        target: 'estadisticas',
        title: 'Métricas de Gestión',
        content: 'Analiza el rendimiento académico, la asistencia y el desempeño docente con gráficos y filtros avanzados. Una visión integral para tomar mejores decisiones.'
    }
];

const TutorialGuide = ({ activeTab, isVisible, onClose, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [personajePos, setPersonajePos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
            // Bloquear scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isVisible, currentStep, activeTab]);

    const calculatePosition = () => {
        // Buscar el botón de la pestaña actual en el DOM
        // Asumimos que los botones tienen un atributo o clase identificable, ej: data-tab-id="alumnos"
        // O buscamos por texto. Para ser más robustos, añadiremos data-tour-target a los botones en TabsNav.
        const step = STEPS[currentStep];
        const targetId = step.target;

        // Si la pestaña activa no coincide con el paso, forzamos el cambio de pestaña
        if (activeTab !== targetId && onStepChange) {
            onStepChange(targetId);
            return;
        }

        // Encontrar el elemento en el DOM
        // Buscamos el botón en TabsNav
        const element = document.querySelector(`[data-tab-id="${targetId}"]`);

        if (element) {
            const rect = element.getBoundingClientRect();
            const isMobile = window.innerWidth <= 768;

            // Calcular posición del globo de texto (Nube)
            // Lo ponemos debajo del botón
            let top = rect.bottom + 20;
            let left = rect.left + (rect.width / 2) - 150; // Centrado aprox (ancho globo 300)

            // Ajustes de bordes
            if (left < 10) left = 10;
            if (left + 300 > window.innerWidth) left = window.innerWidth - 310;

            setPosition({ top, left });

            // Calcular posición del Personaje (Libro)
            // Lo ponemos flotando al lado o encima
            let pjTop = rect.bottom + 20; // Alineado con el globo
            let pjLeft = left - 100; // A la izquierda del globo (era -120, movido 20px derecha)

            if (pjLeft < 0) {
                // Si no cabe a la izquierda, lo ponemos a la derecha
                pjLeft = left + 310;
            }

            // En móvil, el personaje arriba del globo
            if (isMobile) {
                pjTop = rect.bottom + 10;
                pjLeft = window.innerWidth / 2 - 60; // Centrado

                top = pjTop + 200; // Globo más abajo
            }

            setPersonajePos({ top: pjTop, left: pjLeft });
        } else {
            // Fallback al centro si no encuentra elemento
            setPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 - 150 });
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            const nextTarget = STEPS[nextStep].target;
            if (onStepChange) onStepChange(nextTarget);
        } else {
            onClose(); // Fin del tour
            setCurrentStep(0);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            const prevTarget = STEPS[prevStep].target;
            if (onStepChange) onStepChange(prevTarget);
        }
    };

    const handleSkip = () => {
        onClose();
        setCurrentStep(0);
    };

    if (!isVisible) return null;

    const step = STEPS[currentStep];

    return createPortal(
        <div className="tour-overlay">
            {/* Fondo oscuro */}
            <div className="tour-backdrop" />

            {/* Personaje Animado */}
            <div
                className="tour-character"
                style={{
                    top: personajePos.top,
                    left: personajePos.left
                }}
            >
                <img src="/assets/mascota_guia.png" alt="Guía" className="tour-character-img" />
            </div>

            {/* Globo de Texto */}
            <div
                className="tour-bubble"
                style={{
                    top: position.top,
                    left: position.left
                }}
            >
                <div className="tour-content">
                    <h3>{step.title}</h3>
                    <p>{step.content}</p>
                </div>

                <div className="tour-footer">
                    <div className="tour-dots">
                        {STEPS.map((_, i) => (
                            <span key={i} className={`tour-dot ${i === currentStep ? 'active' : ''}`} />
                        ))}
                    </div>
                    <div className="tour-actions">
                        {currentStep > 0 && (
                            <button onClick={handlePrev} className="tour-btn secondary">Atrás</button>
                        )}
                        <button onClick={handleNext} className="tour-btn primary">
                            {currentStep === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                        </button>
                    </div>
                </div>

                <button className="tour-close-btn" onClick={handleSkip} title="Cerrar tutorial">
                    ✕
                </button>
            </div>
        </div>,
        document.body
    );
};

export default TutorialGuide;
