import React, { useState, useMemo } from 'react';
import { useResponsive, useDropdown } from '../../hooks';
import { SelectNativo, SelectMovil, AutocompleteAlumno, getNotaClass } from './shared';

// Renderizar celdas de notas para un trimestre
const renderNotasCeldas = (notas) => {
  const celdas = [];
  for (let i = 0; i < 8; i++) {
    const nota = notas[i];
    celdas.push(
      <td key={i} className={nota !== undefined ? getNotaClass(nota) : ''}>
        {nota !== undefined ? (nota !== null ? nota.toFixed(1) : 'P') : '-'}
      </td>
    );
  }
  return celdas;
};

// Encabezados de notas para un trimestre
const NotasHeaders = () => (
  <>
    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
      <th key={n} className="th-sub">N{n}</th>
    ))}
    <th className="th-sub th-prom">Prom</th>
  </>
);

function VerNotasTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroAlumnoId, setFiltroAlumnoId] = useState('');
  const [consultado, setConsultado] = useState(false);

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  const asignaturasDisponibles = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return asignaciones
      .filter(a => a.curso_id === parseInt(cursoSeleccionado))
      .map(a => ({ id: a.asignatura_id, nombre: a.asignatura_nombre }));
  }, [cursoSeleccionado, asignaciones]);

  const alumnosDelCurso = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return alumnosPorCurso[cursoSeleccionado] || [];
  }, [cursoSeleccionado, alumnosPorCurso]);

  const datosTabla = useMemo(() => {
    if (!consultado || !cursoSeleccionado || !asignaturaSeleccionada) return [];

    const alumnos = alumnosPorCurso[cursoSeleccionado] || [];
    const cursoId = parseInt(cursoSeleccionado);
    const asignaturaId = parseInt(asignaturaSeleccionada);

    return alumnos.map(alumno => {
      const notasAlumno = notasRegistradas.filter(n =>
        n.alumno_id === alumno.id && n.curso_id === cursoId && n.asignatura_id === asignaturaId
      );

      const notasPorTrimestre = { 1: [], 2: [], 3: [] };
      notasAlumno.forEach(nota => {
        if (notasPorTrimestre[nota.trimestre] && notasPorTrimestre[nota.trimestre].length < 8) {
          notasPorTrimestre[nota.trimestre].push(nota.nota);
        }
      });

      const calcularPromedio = (notas) => {
        const notasValidas = notas.filter(n => n !== null);
        return notasValidas.length === 0 ? null : notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
      };

      const promedioT1 = calcularPromedio(notasPorTrimestre[1]);
      const promedioT2 = calcularPromedio(notasPorTrimestre[2]);
      const promedioT3 = calcularPromedio(notasPorTrimestre[3]);
      const promediosTrimestre = [promedioT1, promedioT2, promedioT3].filter(p => p !== null);
      const promedioFinal = promediosTrimestre.length > 0
        ? promediosTrimestre.reduce((a, b) => a + b, 0) / promediosTrimestre.length : null;

      return {
        alumno,
        notasT1: notasPorTrimestre[1],
        notasT2: notasPorTrimestre[2],
        notasT3: notasPorTrimestre[3],
        promedioT1, promedioT2, promedioT3, promedioFinal,
        estado: promedioFinal !== null ? (promedioFinal >= 4.0 ? 'Aprobado' : 'Reprobado') : '-'
      };
    }).filter(row => !filtroAlumnoId || row.alumno.id === parseInt(filtroAlumnoId));
  }, [consultado, cursoSeleccionado, asignaturaSeleccionada, alumnosPorCurso, notasRegistradas, filtroAlumnoId]);

  const handleCursoChange = (cursoId, nombre = '') => {
    setCursoSeleccionado(cursoId);
    setCursoNombre(nombre);
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setFiltroAlumno('');
    setFiltroAlumnoId('');
    setConsultado(false);
  };

  const handleSeleccionarAlumno = (alumno) => {
    if (alumno) {
      setFiltroAlumnoId(alumno.id);
      setFiltroAlumno(`${alumno.nombres} ${alumno.apellidos}`);
    } else {
      setFiltroAlumnoId('');
      setFiltroAlumno('');
    }
  };

  const consultar = () => {
    if (!cursoSeleccionado || !asignaturaSeleccionada) {
      alert('Seleccione curso y asignatura');
      return;
    }
    setConsultado(true);
  };

  const limpiarFiltros = () => {
    setCursoSeleccionado('');
    setCursoNombre('');
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setFiltroAlumno('');
    setFiltroAlumnoId('');
    setConsultado(false);
  };

  const formatearNota = (nota) => (nota === null || nota === undefined) ? '-' : nota.toFixed(1);

  const formatearNombreAlumno = (alumno) => {
    const nombresArr = alumno.nombres.split(' ');
    const apellidosArr = alumno.apellidos.split(' ');
    const primerApellido = apellidosArr[0] || '';
    const segundoApellido = apellidosArr[1] || '';
    const inicialPrimerNombre = nombresArr[0] ? `${nombresArr[0].charAt(0)}.` : '';
    return `${primerApellido} ${segundoApellido} ${inicialPrimerNombre}`.replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header"><h3>Filtros</h3></div>
        <div className="card-body">
          {isMobile ? (
            <>
              <div className="form-row-movil">
                <SelectMovil
                  label="Curso"
                  value={cursoSeleccionado}
                  valueName={cursoNombre}
                  onChange={handleCursoChange}
                  options={cursos}
                  placeholder="Seleccionar..."
                  isOpen={dropdownAbierto === 'curso'}
                  onToggle={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
                  onClose={() => setDropdownAbierto(null)}
                />
                <SelectMovil
                  label="Asignatura"
                  value={asignaturaSeleccionada}
                  valueName={asignaturaNombre}
                  onChange={(id, nombre) => { setAsignaturaSeleccionada(id); setAsignaturaNombre(nombre); }}
                  options={asignaturasDisponibles}
                  placeholder={cursoSeleccionado ? 'Seleccionar...' : 'Seleccione curso'}
                  disabled={!cursoSeleccionado}
                  isOpen={dropdownAbierto === 'asignatura'}
                  onToggle={() => setDropdownAbierto(dropdownAbierto === 'asignatura' ? null : 'asignatura')}
                  onClose={() => setDropdownAbierto(null)}
                />
              </div>
              <AutocompleteAlumno
                alumnos={alumnosDelCurso}
                alumnoSeleccionado={filtroAlumnoId}
                busqueda={filtroAlumno}
                onBusquedaChange={(val) => { setFiltroAlumno(val); setFiltroAlumnoId(''); }}
                onSeleccionar={handleSeleccionarAlumno}
                disabled={!cursoSeleccionado}
                placeholder="Todos"
                onDropdownOpen={() => setDropdownAbierto(null)}
              />
              <div className="form-actions form-actions-movil">
                <button className="btn btn-secondary" onClick={limpiarFiltros}>Limpiar</button>
                <button className="btn btn-primary" onClick={consultar}>Consultar</button>
              </div>
            </>
          ) : (
            <div className="docente-filtros-row" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
              <SelectNativo
                label="Curso"
                value={cursoSeleccionado}
                onChange={(e) => {
                  const curso = cursos.find(c => c.id.toString() === e.target.value);
                  handleCursoChange(e.target.value, curso?.nombre || '');
                }}
                options={cursos}
                placeholder="Seleccionar"
              />
              <SelectNativo
                label="Asignatura"
                value={asignaturaSeleccionada}
                onChange={(e) => {
                  const asig = asignaturasDisponibles.find(a => a.id.toString() === e.target.value);
                  setAsignaturaSeleccionada(e.target.value);
                  setAsignaturaNombre(asig?.nombre || '');
                }}
                options={asignaturasDisponibles}
                placeholder={cursoSeleccionado ? 'Seleccionar' : 'Primero seleccione un curso'}
                disabled={!cursoSeleccionado}
              />
              <AutocompleteAlumno
                alumnos={alumnosDelCurso}
                alumnoSeleccionado={filtroAlumnoId}
                busqueda={filtroAlumno}
                onBusquedaChange={(val) => { setFiltroAlumno(val); setFiltroAlumnoId(''); }}
                onSeleccionar={handleSeleccionarAlumno}
                disabled={!cursoSeleccionado}
                placeholder={cursoSeleccionado ? "Todos los alumnos" : "Primero seleccione un curso"}
              />
              <div className="docente-filtros-actions">
                <button className="btn btn-secondary" onClick={limpiarFiltros}>Limpiar</button>
                <button className="btn btn-primary" onClick={consultar}>Consultar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header"><h3>Calificaciones del Curso</h3></div>
        <div className="card-body">
          <div className="docente-tabla-trimestres-container">
            <table className="docente-tabla docente-tabla-trimestres">
              <thead>
                <tr>
                  <th rowSpan="2" className="th-fixed">N</th>
                  <th rowSpan="2" className="th-fixed th-alumno">Alumno</th>
                  <th colSpan="9" className="th-trimestre">Trimestre 1</th>
                  <th colSpan="9" className="th-trimestre">Trimestre 2</th>
                  <th colSpan="9" className="th-trimestre">Trimestre 3</th>
                  <th rowSpan="2" className="th-fixed th-final" style={{ width: '45px' }}>PROM</th>
                  <th rowSpan="2" className="th-fixed" style={{ width: '40px' }}>APR</th>
                </tr>
                <tr>
                  <NotasHeaders />
                  <NotasHeaders />
                  <NotasHeaders />
                </tr>
              </thead>
              <tbody>
                {datosTabla.length > 0 ? (
                  datosTabla.map((row, index) => (
                    <tr key={row.alumno.id}>
                      <td>{index + 1}</td>
                      <td className="td-alumno">{formatearNombreAlumno(row.alumno)}</td>
                      {renderNotasCeldas(row.notasT1)}
                      <td className={`td-prom ${getNotaClass(row.promedioT1)}`}>{formatearNota(row.promedioT1)}</td>
                      {renderNotasCeldas(row.notasT2)}
                      <td className={`td-prom ${getNotaClass(row.promedioT2)}`}>{formatearNota(row.promedioT2)}</td>
                      {renderNotasCeldas(row.notasT3)}
                      <td className={`td-prom ${getNotaClass(row.promedioT3)}`}>{formatearNota(row.promedioT3)}</td>
                      <td className={`td-final ${getNotaClass(row.promedioFinal)}`}>{formatearNota(row.promedioFinal)}</td>
                      <td className={row.estado === 'Aprobado' ? 'estado-aprobado' : row.estado === 'Reprobado' ? 'estado-reprobado' : ''} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '600' }}>
                        {row.estado === 'Aprobado' ? 'APR' : row.estado === 'Reprobado' ? 'REP' : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="31" className="text-center text-muted">
                      {consultado ? 'No hay datos para mostrar' : 'Seleccione curso y asignatura'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerNotasTab;
