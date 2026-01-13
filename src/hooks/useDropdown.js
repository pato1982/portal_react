import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para manejar el estado de dropdowns con cierre automático
 *
 * @param {string|null} initialValue - Valor inicial del dropdown abierto
 * @returns {Object} { dropdownAbierto, abrirDropdown, cerrarDropdown, toggleDropdown, cerrarTodos }
 *
 * @example
 * const { dropdownAbierto, toggleDropdown, cerrarTodos } = useDropdown();
 *
 * // En el componente:
 * <div onClick={() => toggleDropdown('curso')}>
 *   {dropdownAbierto === 'curso' && <DropdownContent />}
 * </div>
 *
 * // Cierre automático al hacer clic fuera
 * useEffect con selector '.custom-select-container' ya no es necesario
 */
function useDropdown(initialValue = null) {
  const [dropdownAbierto, setDropdownAbierto] = useState(initialValue);

  // Abrir un dropdown específico
  const abrirDropdown = useCallback((id) => {
    setDropdownAbierto(id);
  }, []);

  // Cerrar el dropdown actual
  const cerrarDropdown = useCallback(() => {
    setDropdownAbierto(null);
  }, []);

  // Toggle de un dropdown
  const toggleDropdown = useCallback((id) => {
    setDropdownAbierto(current => current === id ? null : id);
  }, []);

  // Cerrar todos los dropdowns (alias de cerrarDropdown)
  const cerrarTodos = cerrarDropdown;

  // Cerrar dropdown al hacer clic fuera de cualquier contenedor de dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Buscar si el clic fue dentro de un contenedor de dropdown
      const isInsideDropdown = event.target.closest('.custom-select-container') ||
                               event.target.closest('.dropdown-container') ||
                               event.target.closest('[data-dropdown]');

      if (!isInsideDropdown) {
        setDropdownAbierto(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    dropdownAbierto,
    setDropdownAbierto, // Para compatibilidad con código existente
    abrirDropdown,
    cerrarDropdown,
    toggleDropdown,
    cerrarTodos,
  };
}

export default useDropdown;
