import React, { useState } from 'react';

const HelpTooltip = ({ content, isVisible = true }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Verificación de seguridad extra (aunque se maneje por prop)
    if (!isVisible) return null;

    return (
        <div
            className="help-tooltip-wrapper"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
            }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '6px',
                cursor: 'help',
                position: 'relative',
                zIndex: 50
            }}
            aria-label="Información de ayuda"
        >
            <span
                className="material-symbols-outlined"
                style={{
                    fontSize: '18px',
                    color: '#f59e0b', // Amber-500 (Amarillo visible)
                    fontWeight: 'normal',
                    transition: 'transform 0.2s',
                }}
            >
                help
            </span>

            {isOpen && (
                <div
                    className="help-tooltip-popup"
                    style={{
                        position: 'absolute',
                        bottom: '125%', // Un poco más arriba del icono
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(30, 41, 59, 0.95)', // Slate-800 con transparencia
                        color: '#fff',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        width: 'max-content',
                        maxWidth: '220px',
                        minWidth: '150px',
                        fontSize: '13px',
                        fontWeight: '400',
                        textAlign: 'center',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 1000,
                        whiteSpace: 'normal',
                        lineHeight: '1.5',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    {content}

                    {/* Triángulo indicador (flecha) */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0',
                        height: '0',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid rgba(30, 41, 59, 0.95)'
                    }}></div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
        </div>
    );
};

export default HelpTooltip;
