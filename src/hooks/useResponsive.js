import { useState, useEffect } from 'react';

/**
 * Hook para detectar el tamaño de pantalla y breakpoints
 *
 * @param {number} breakpoint - Ancho en píxeles para considerar "móvil" (default: 699)
 * @returns {Object} { isMobile, isTablet, isDesktop, width }
 *
 * @example
 * const { isMobile } = useResponsive();
 * // o con breakpoint personalizado
 * const { isMobile } = useResponsive(768);
 */
function useResponsive(breakpoint = 699) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  useEffect(() => {
    // Handler para actualizar el estado
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };

    // Agregar listener
    window.addEventListener('resize', handleResize);

    // Llamar handler inmediatamente para obtener el tamaño inicial
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width <= breakpoint,
    isTablet: windowSize.width > breakpoint && windowSize.width <= 1024,
    isDesktop: windowSize.width > 1024,
    width: windowSize.width,
  };
}

export default useResponsive;
