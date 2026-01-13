import { useEffect, useRef } from 'react';

/**
 * Hook para detectar clics fuera de un elemento
 *
 * @param {Function} callback - Función a ejecutar cuando se hace clic fuera
 * @param {boolean} enabled - Si el hook está activo (default: true)
 * @returns {React.RefObject} Ref para asignar al elemento
 *
 * @example
 * const ref = useClickOutside(() => setIsOpen(false));
 * return <div ref={ref}>...</div>
 *
 * @example con habilitación condicional
 * const ref = useClickOutside(() => setIsOpen(false), isOpen);
 */
function useClickOutside(callback, enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    };

    // Usar mousedown para detectar antes de que el click se complete
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}

export default useClickOutside;
