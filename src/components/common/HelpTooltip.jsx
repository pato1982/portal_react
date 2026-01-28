import React, { useState } from 'react';

const HelpTooltip = ({ content, isVisible = true }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Verificación simple
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
                marginLeft: '8px',
                cursor: 'help',
                position: 'relative',
                zIndex: 50,
                verticalAlign: 'middle' // Asegura alineación vertical
            }}
            aria-label="Información de ayuda"
        >
            {/* SVG Directo para garantizar visualización sin dependencias externas */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#f59e0b" // Color amarillo relleno
                stroke="#ffffff" // Borde blanco sutil para contraste
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))' }}
            >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>

            {isOpen && (
                <div
                    className="help-tooltip-popup"
                    style={{
                        position: 'absolute',
                        bottom: '135%', // Un poco más arriba
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(15, 23, 42, 0.98)', // Slate-900 casi sólido
                        color: '#fff',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        width: 'max-content',
                        maxWidth: '240px',
                        minWidth: '160px',
                        fontSize: '13px',
                        fontWeight: '400',
                        textAlign: 'center',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)', // Sombra más pronunciada
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        zIndex: 9999, // Z-index muy alto
                        whiteSpace: 'normal',
                        lineHeight: '1.5',
                        animation: 'fadeIn 0.2s ease-out',
                        pointerEvents: 'none' // Evita que el tooltip interfiera con el mouse
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
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid rgba(15, 23, 42, 0.98)'
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
