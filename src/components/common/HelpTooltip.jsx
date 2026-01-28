import React, { useState, useEffect } from 'react';

const HelpTooltip = ({ content, isVisible = true }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Cerrar al presionar ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Evitar scroll del body cuando el modal esta abierto
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isVisible) return null;

    const toggleModal = (e) => {
        e.stopPropagation(); // Evitar que el click active la pestaña
        e.preventDefault();
        setIsOpen(true);
    };

    const closeModal = (e) => {
        if (e) e.stopPropagation();
        setIsOpen(false);
    };

    return (
        <>
            {/* Icono activador (Solo Click) */}
            <div
                className="help-icon-trigger"
                onClick={toggleModal}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '8px',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 50,
                    verticalAlign: 'middle',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Ver ayuda"
                title="Clic para ver información"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))' }}
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </div>

            {/* Modal Centrado */}
            {isOpen && (
                <div
                    className="help-modal-overlay"
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)', // Fondo oscuro semitransparente
                        backdropFilter: 'blur(4px)', // Efecto blur moderno
                        zIndex: 99999, // Super alto
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeInOverlay 0.2s ease-out'
                    }}
                >
                    <div
                        className="help-modal-content"
                        onClick={(e) => e.stopPropagation()} // Evitar cierre al clickear dentro
                        style={{
                            backgroundColor: '#ffffff',
                            width: '90%',
                            maxWidth: '500px',
                            borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            overflow: 'hidden',
                            position: 'relative',
                            animation: 'scaleInModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {/* Header del Modal */}
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8fafc'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span role="img" aria-label="info">ℹ️</span> Información del Módulo
                            </h3>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748b',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e2e8f0';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#64748b';
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Body del Modal */}
                        <div style={{ padding: '24px', color: '#334155', lineHeight: '1.6', fontSize: '15px', textAlign: 'justify', textTransform: 'none' }}>
                            <p style={{ margin: 0 }}>
                                {content}
                            </p>
                        </div>

                        {/* Footer Opcional (Brand) */}
                        <div style={{
                            padding: '12px 24px',
                            backgroundColor: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            textAlign: 'right'
                        }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleInModal {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </>
    );
};

export default HelpTooltip;
