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
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeInOverlay 0.2s ease-out'
                    }}
                >
                    <div
                        className="help-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'scaleInModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {/* Header del Modal */}
                        <div className="help-modal-header">
                            <h3>
                                <span role="img" aria-label="info">ℹ️</span> Información del Módulo
                            </h3>
                            <button
                                onClick={closeModal}
                                className="help-modal-close-btn"
                                aria-label="Cerrar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Body del Modal */}
                        <div className="help-modal-body">
                            <p>
                                {content}
                            </p>
                        </div>

                        {/* Footer Opcional (Brand) */}
                        <div className="help-modal-footer">
                            <button
                                onClick={closeModal}
                                className="help-modal-action-btn"
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
