import React, { useState, useMemo } from 'react';
import { SelectMovil, SelectNativo } from './FiltrosDocente';
import { formatearNombreCompleto, formatearFecha, getNotaClass } from './chartConfigs';

function TablaUltimasNotas({
  notasRegistradas,
  cursos,
  isMobile,
  dropdownAbierto,
  setDropdownAbierto,
  maxNotas = 20
}) {
  const [filtroUltCurso, setFiltroUltCurso] = useState('');
  const [filtroUltCursoNombre, setFiltroUltCursoNombre] = useState('');
  const [filtroUltAlumno, setFiltroUltAlumno] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_creacion', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const ultimasNotasFiltradas = useMemo(() => {
    // Primero filtramos
    let notas = [...notasRegistradas];

    if (filtroUltCurso) {
      notas = notas.filter(n => n.curso_id === parseInt(filtroUltCurso));
    }
    if (filtroUltAlumno) {
      const busqueda = filtroUltAlumno.toLowerCase();
      notas = notas.filter(n => n.alumno_nombre.toLowerCase().includes(busqueda));
    }

    // Luego ordenamos
    if (sortConfig.key) {
      notas.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Manejo especial para nombres (formateados o crudos)
        if (sortConfig.key === 'alumno_nombre') {
          valA = (a.alumno_nombre || '').toLowerCase();
          valB = (b.alumno_nombre || '').toLowerCase();
        }

        // Manejo para notas (tratar el null/pendientes como 0 o valor bajo)
        if (sortConfig.key === 'nota') {
          valA = a.nota === null ? -1 : a.nota;
          valB = b.nota === null ? -1 : b.nota;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return notas.slice(0, maxNotas);
  }, [notasRegistradas, filtroUltCurso, filtroUltAlumno, maxNotas, sortConfig]);

  const handleCursoChange = (id, nombre) => {
    setFiltroUltCurso(id);
    setFiltroUltCursoNombre(nombre);
  };

  // Helper para renderizar las flechitas
  const SortIcon = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <span className="sort-icons-container" style={{ display: 'inline-flex', marginLeft: '8px', gap: '2px', cursor: 'pointer' }}>
        <span
          onClick={() => setSortConfig({ key: columnKey, direction: 'asc' })}
          style={{
            color: isActive && sortConfig.direction === 'asc' ? '#3b82f6' : '#cbd5e1',
            fontSize: '10px',
            transform: 'scale(1.2)'
          }}
        >▲</span>
        <span
          onClick={() => setSortConfig({ key: columnKey, direction: 'desc' })}
          style={{
            color: isActive && sortConfig.direction === 'desc' ? '#3b82f6' : '#cbd5e1',
            fontSize: '10px',
            transform: 'scale(1.2)'
          }}
        >▼</span>
      </span>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Ultimas Notas Registradas</h3>
      </div>
      <div className="card-body">
        {/* Filtros */}
        <div className="filtros-alumnos">
          <div className={isMobile ? 'form-row-movil' : 'form-row'}>
            {isMobile ? (
              <SelectMovil
                label="Curso"
                value={filtroUltCurso}
                valueName={filtroUltCursoNombre}
                onChange={handleCursoChange}
                options={cursos}
                placeholder="Todos"
                isOpen={dropdownAbierto === 'filtroUltCurso'}
                onToggle={() => setDropdownAbierto(dropdownAbierto === 'filtroUltCurso' ? null : 'filtroUltCurso')}
                onClose={() => setDropdownAbierto(null)}
              />
            ) : (
              <SelectNativo
                label="Curso"
                value={filtroUltCurso}
                onChange={(e) => {
                  const curso = cursos.find(c => c.id.toString() === e.target.value);
                  handleCursoChange(e.target.value, curso?.nombre || '');
                }}
                options={cursos}
                placeholder="Todos"
              />
            )}
            <div className="form-group">
              <label>Alumno</label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar alumno..."
                value={filtroUltAlumno}
                onChange={(e) => setFiltroUltAlumno(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>
                  Alumno <SortIcon columnKey="alumno_nombre" />
                </th>
                <th>Curso</th>
                <th>Asignatura</th>
                <th style={{ whiteSpace: 'nowrap' }}>
                  Fecha <SortIcon columnKey="fecha_creacion" />
                </th>
                <th style={{ whiteSpace: 'nowrap' }}>
                  Nota <SortIcon columnKey="nota" />
                </th>
              </tr>
            </thead>
            <tbody>
              {ultimasNotasFiltradas.length > 0 ? (
                ultimasNotasFiltradas.map(nota => (
                  <tr key={nota.id}>
                    <td>{formatearNombreCompleto(nota.alumno_nombre)}</td>
                    <td>{nota.curso_nombre}</td>
                    <td>{nota.asignatura_nombre}</td>
                    <td>{formatearFecha(nota.fecha_creacion || nota.fecha)}</td>
                    <td>
                      <span className={`docente-nota-badge ${getNotaClass(nota.nota)}`}>
                        {nota.nota !== null ? nota.nota.toFixed(1) : 'P'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No hay notas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TablaUltimasNotas;
