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

  const ultimasNotasFiltradas = useMemo(() => {
    let notas = [...notasRegistradas].slice(0, maxNotas);

    if (filtroUltCurso) {
      notas = notas.filter(n => n.curso_id === parseInt(filtroUltCurso));
    }
    if (filtroUltAlumno) {
      const busqueda = filtroUltAlumno.toLowerCase();
      notas = notas.filter(n => n.alumno_nombre.toLowerCase().includes(busqueda));
    }

    return notas;
  }, [notasRegistradas, filtroUltCurso, filtroUltAlumno, maxNotas]);

  const handleCursoChange = (id, nombre) => {
    setFiltroUltCurso(id);
    setFiltroUltCursoNombre(nombre);
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
                <th>Alumno</th>
                <th>Curso</th>
                <th>Asignatura</th>
                <th>Fecha</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {ultimasNotasFiltradas.length > 0 ? (
                ultimasNotasFiltradas.map(nota => (
                  <tr key={nota.id}>
                    <td>{formatearNombreCompleto(nota.alumno_nombre)}</td>
                    <td>{nota.curso_nombre}</td>
                    <td>{nota.asignatura_nombre}</td>
                    <td>{formatearFecha(nota.fecha)}</td>
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
