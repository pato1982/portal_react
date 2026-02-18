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

const TutorialGuide = ({ activeTab, isVisible, onClose, onStepChange, steps = STEPS }) => {
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
        const step = steps[currentStep];
        const targetId = step.target;

        // Si la pestaña activa no coincide con el paso, verificar si necesitamos cambiar
        // EXCEPCIÓN: En el menú de apoderado, activeTab es 'menu' pero los targets son botones internos
        const isMenuApoderado = activeTab === 'menu' && ['informacion', 'notas', 'comunicados', 'progreso'].includes(targetId);

        if (activeTab !== targetId && !isMenuApoderado && onStepChange) {
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
            let pjLeft = left - 130; // A la izquierda del globo con más margen (era -100)

            // Lógica especial para el último paso (estadisticas) o si no cabe a la izquierda
            const isLastStep = currentStep === steps.length - 1;

            if (pjLeft < 0) {
                // Si no cabe a la izquierda, lo ponemos a la derecha
                pjLeft = left + 330; // Margen derecho aumentado
            }

            // En el último paso (estadísticas), forzar a la izquierda si hay espacio, o ajustar específicamente
            if (isLastStep && !isMobile) {
                // Mantener a la izquierda pero asegurando margen correcto
                pjLeft = left - 140;
            }

            // En móvil, lógica específica para situarse junto al botón
            if (isMobile) {
                // Intentar poner personaje arriba a la izquierda del elemento
                pjLeft = rect.left;
                if (pjLeft > window.innerWidth - 120) pjLeft = window.innerWidth - 120; // Evitar desborde derecho
                if (pjLeft < 10) pjLeft = 10; // Evitar desborde izquierdo

                pjTop = rect.top - 90; // Justo encima

                // Si está muy arriba y se sale de pantalla, ponerlo abajo
                let bubbleTop = rect.bottom + 10;

                if (pjTop < 50) {
                    pjTop = rect.bottom + 10; // Personaje abajo
                    bubbleTop = pjTop + 100; // Globo más abajo
                } else {
                    // Personaje arriba, globo abajo del elemento (para no tapar personaje)
                    bubbleTop = rect.bottom + 10;
                }

                // Definir posición del globo
                top = bubbleTop;
                left = 10; // Margen izquierdo fijo

                // Ajuste fino si es el último elemento de la grilla
                if (top + 200 > window.innerHeight) {
                    top = rect.top - 200; // Si no cabe abajo, intentar poner globo arriba del todo
                    if (pjTop > top) pjTop = top - 90; // Mover personaje más arriba aun
                }
            }

            setPersonajePos({ top: pjTop, left: pjLeft });
        } else {
            // Fallback al centro si no encuentra elemento
            setPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 - 150 });
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            const nextTarget = steps[nextStep].target;
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
            const prevTarget = steps[prevStep].target;
            if (onStepChange) onStepChange(prevTarget);
        }
    };

    const handleSkip = () => {
        onClose();
        setCurrentStep(0);
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

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
                        {steps.map((_, i) => (
                            <span key={i} className={`tour-dot ${i === currentStep ? 'active' : ''}`} />
                        ))}
                    </div>
                    <div className="tour-actions">
                        {currentStep > 0 && (
                            <button onClick={handlePrev} className="tour-btn secondary">Atrás</button>
                        )}
                        <button onClick={handleNext} className="tour-btn primary">
                            {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
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
