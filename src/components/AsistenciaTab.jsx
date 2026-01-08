import React, { useState, useMemo, useEffect } from 'react';
import { cursosDB, alumnosPorCursoDB } from '../data/demoData';

function AsistenciaTab({ mostrarMensaje }) {
  const [filtros, setFiltros] = useState({
    curso: '',
    cursoId: null
  });
  // Año escolar: marzo (2) a diciembre (11)
  const [mesSeleccionado, setMesSeleccionado] = useState(2); // Marzo por defecto
  const [mesNombre, setMesNombre] = useState('Marzo');
  const anioActual = 2024;
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-select-container')) {
        setDropdownAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Estado para almacenar modificaciones de asistencia
  // Incluye ausencias predefinidas para demostrar el KPI de bajo 85%
  const [asistenciasModificadas, setAsistenciasModificadas] = useState({
    // Alumno ID 1 de 1° Basico A en Marzo (mes 2) - ausencias para tener ~82%
    // Marzo tiene aprox 21 días hábiles, 82% = 17 presentes, 4 ausentes
    '2-1': { 4: 'ausente', 7: 'ausente', 14: 'ausente', 21: 'ausente' },
    // Otro alumno con más ausencias para tener ~78%
    '2-3': { 5: 'ausente', 8: 'ausente', 12: 'ausente', 15: 'ausente', 19: 'ausente' }
  });

  // Estado para el popup de edición
  const [popup, setPopup] = useState({
    visible: false,
    alumno: null,
    diaInfo: null,
    estadoActual: '',
    estadoNuevo: ''
  });

  // Estado para el popup de alumnos bajo 85%
  const [popupBajoUmbral, setPopupBajoUmbral] = useState({
    visible: false,
    alumnos: []
  });

  // Meses del año escolar chileno (marzo a diciembre)
  const mesesEscolares = [
    { indice: 2, nombre: 'Marzo' },
    { indice: 3, nombre: 'Abril' },
    { indice: 4, nombre: 'Mayo' },
    { indice: 5, nombre: 'Junio' },
    { indice: 6, nombre: 'Julio' },
    { indice: 7, nombre: 'Agosto' },
    { indice: 8, nombre: 'Septiembre' },
    { indice: 9, nombre: 'Octubre' },
    { indice: 10, nombre: 'Noviembre' },
    { indice: 11, nombre: 'Diciembre' }
  ];

  // Nombres de los meses
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Nombres completos de los días
  const nombresDias = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes'
  };

  // Feriados Chile 2024 que caen en días de semana (lunes a viernes)
  const feriadosChile2024 = [
    '2-29',  // 29 marzo - Viernes Santo
    '4-1',   // 1 mayo - Día del Trabajo
    '4-21',  // 21 mayo - Glorias Navales
    '5-20',  // 20 junio - Día Nacional de los Pueblos Indígenas
    '6-16',  // 16 julio - Virgen del Carmen
    '7-15',  // 15 agosto - Asunción de la Virgen
    '8-18',  // 18 septiembre - Independencia Nacional
    '8-19',  // 19 septiembre - Glorias del Ejército
    '8-20',  // 20 septiembre - Feriado adicional Fiestas Patrias
    '9-31',  // 31 octubre - Día Iglesias Evangélicas
    '10-1',  // 1 noviembre - Todos los Santos
    '11-25', // 25 diciembre - Navidad
  ];

  // Verificar si una fecha es feriado
  const esFeriado = (mes, dia) => {
    return feriadosChile2024.includes(`${mes}-${dia}`);
  };

  // Iniciales de los días de la semana
  const inicialesDias = {
    1: 'L',
    2: 'M',
    3: 'Mi',
    4: 'J',
    5: 'V'
  };

  // Generar días del mes seleccionado (excluyendo solo fines de semana)
  const diasDelMes = useMemo(() => {
    const dias = [];
    const ultimoDiaMes = new Date(anioActual, mesSeleccionado + 1, 0).getDate();
    // En diciembre las clases terminan el 20
    const ultimoDiaClases = mesSeleccionado === 11 ? 20 : ultimoDiaMes;

    for (let d = 1; d <= ultimoDiaClases; d++) {
      const fecha = new Date(anioActual, mesSeleccionado, d);
      const diaSemana = fecha.getDay();
      // Excluir solo sábados (6) y domingos (0)
      if (diaSemana !== 0 && diaSemana !== 6) {
        dias.push({
          dia: d,
          fecha: fecha,
          diaSemana: diaSemana,
          inicial: inicialesDias[diaSemana],
          nombreDia: nombresDias[diaSemana],
          esFeriado: esFeriado(mesSeleccionado, d)
        });
      }
    }
    return dias;
  }, [mesSeleccionado]);

  // Generar datos de asistencia demo para cada alumno y día
  const generarAsistenciaDemo = (alumnoId, dias) => {
    const asistencia = {};
    dias.forEach(diaInfo => {
      const seed = alumnoId * 100 + diaInfo.dia + mesSeleccionado;
      const random = Math.sin(seed) * 10000;
      const valor = random - Math.floor(random);

      if (valor < 0.85) {
        asistencia[diaInfo.dia] = 'presente';
      } else if (valor < 0.92) {
        asistencia[diaInfo.dia] = 'ausente';
      } else if (valor < 0.96) {
        asistencia[diaInfo.dia] = 'tardanza';
      } else {
        asistencia[diaInfo.dia] = 'justificado';
      }
    });
    return asistencia;
  };

  // Obtener asistencia de un alumno (considerando modificaciones)
  const getAsistenciaAlumno = (alumnoId) => {
    const asistenciaBase = generarAsistenciaDemo(alumnoId, diasDelMes);
    const key = `${mesSeleccionado}-${alumnoId}`;
    const modificaciones = asistenciasModificadas[key] || {};
    return { ...asistenciaBase, ...modificaciones };
  };

  const handleCursoChange = (cursoId) => {
    const curso = cursosDB.find(c => c.id === parseInt(cursoId));
    setFiltros({
      ...filtros,
      curso: curso?.nombre || '',
      cursoId: cursoId ? parseInt(cursoId) : null
    });
  };

  const getAlumnosCurso = () => {
    if (!filtros.curso) return [];
    return alumnosPorCursoDB[filtros.curso] || [];
  };

  // Formatear nombre
  const formatearNombre = (nombreCompleto) => {
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length >= 4) {
      const nombre1 = partes[0];
      const nombre2Inicial = partes[1].charAt(0) + '.';
      const apellido1 = partes[2];
      const apellido2Inicial = partes[3].charAt(0) + '.';
      return `${nombre1} ${nombre2Inicial} ${apellido1} ${apellido2Inicial}`;
    } else if (partes.length === 3) {
      const nombre = partes[0];
      const apellido1 = partes[1];
      const apellido2Inicial = partes[2].charAt(0) + '.';
      return `${nombre} ${apellido1} ${apellido2Inicial}`;
    }
    return nombreCompleto;
  };

  // Abrir popup para editar asistencia
  const abrirPopup = (alumno, diaInfo, estadoActual) => {
    setPopup({
      visible: true,
      alumno: alumno,
      diaInfo: diaInfo,
      estadoActual: estadoActual,
      estadoNuevo: estadoActual
    });
  };

  // Cerrar popup
  const cerrarPopup = () => {
    setPopup({
      visible: false,
      alumno: null,
      diaInfo: null,
      estadoActual: '',
      estadoNuevo: ''
    });
  };

  // Guardar cambio de asistencia
  const guardarAsistencia = () => {
    if (popup.estadoNuevo !== popup.estadoActual) {
      const key = `${mesSeleccionado}-${popup.alumno.id}`;
      setAsistenciasModificadas(prev => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          [popup.diaInfo.dia]: popup.estadoNuevo
        }
      }));
      mostrarMensaje('Exito', 'Asistencia actualizada correctamente', 'success');
    }
    cerrarPopup();
  };

  // Renderizar icono de asistencia
  const renderIconoAsistencia = (estado) => {
    switch (estado) {
      case 'presente':
        return <span className="asistencia-icono asistencia-presente">✓</span>;
      case 'ausente':
        return <span className="asistencia-icono asistencia-ausente">✗</span>;
      case 'tardanza':
        return <span className="asistencia-icono asistencia-tardanza">T</span>;
      case 'justificado':
        return <span className="asistencia-icono asistencia-justificado">Just</span>;
      default:
        return <span className="asistencia-icono asistencia-vacio">-</span>;
    }
  };

  // Obtener etiqueta del estado
  const getEtiquetaEstado = (estado) => {
    switch (estado) {
      case 'presente': return 'Presente';
      case 'ausente': return 'Ausente';
      case 'tardanza': return 'Tardanza';
      case 'justificado': return 'Justificado';
      default: return '-';
    }
  };

  // Calcular estadísticas del mes
  const getEstadisticasMes = () => {
    const alumnos = getAlumnosCurso();
    let presentes = 0, ausentes = 0, tardanzas = 0, justificados = 0;
    let alumnosBajoUmbral = 0;
    let listaBajoUmbral = [];

    // Contar días hábiles (sin feriados)
    const diasHabiles = diasDelMes.filter(d => !d.esFeriado).length;

    alumnos.forEach(alumno => {
      const asistencia = getAsistenciaAlumno(alumno.id);
      let presentesAlumno = 0;
      let totalDiasAlumno = 0;

      Object.entries(asistencia).forEach(([dia, estado]) => {
        // Solo contar días que no son feriados
        const diaInfo = diasDelMes.find(d => d.dia === parseInt(dia));
        if (diaInfo && !diaInfo.esFeriado) {
          totalDiasAlumno++;
          if (estado === 'presente') {
            presentes++;
            presentesAlumno++;
          } else if (estado === 'ausente') ausentes++;
          else if (estado === 'tardanza') {
            tardanzas++;
            presentesAlumno++; // Tardanza cuenta como asistencia
          } else if (estado === 'justificado') justificados++;
        }
      });

      // Calcular porcentaje de asistencia del alumno
      if (totalDiasAlumno > 0) {
        const porcentajeAsistencia = (presentesAlumno / totalDiasAlumno) * 100;
        if (porcentajeAsistencia < 85) {
          alumnosBajoUmbral++;
          listaBajoUmbral.push({
            id: alumno.id,
            nombre: alumno.nombre_completo,
            porcentaje: porcentajeAsistencia.toFixed(1)
          });
        }
      }
    });

    const total = presentes + ausentes + tardanzas + justificados;
    const porcentajeAsistencia = total > 0 ? ((presentes + tardanzas) / total * 100).toFixed(1) : '0.0';
    return { total, presentes, ausentes, tardanzas, justificados, alumnosBajoUmbral, listaBajoUmbral, porcentajeAsistencia };
  };

  const stats = filtros.cursoId ? getEstadisticasMes() : { total: 0, presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0, alumnosBajoUmbral: 0, listaBajoUmbral: [], porcentajeAsistencia: '0.0' };

  // Abrir popup de alumnos bajo 85%
  const abrirPopupBajoUmbral = () => {
    if (stats.alumnosBajoUmbral > 0) {
      setPopupBajoUmbral({
        visible: true,
        alumnos: stats.listaBajoUmbral
      });
    }
  };

  // Cerrar popup de alumnos bajo 85%
  const cerrarPopupBajoUmbral = () => {
    setPopupBajoUmbral({
      visible: false,
      alumnos: []
    });
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-header">
          <h3>Control de Asistencia</h3>
        </div>
        <div className="card-body">
          {/* Filtros */}
          <div className="filtros-asistencia">
            <div className="form-row form-row-filtros">
              <div className="form-group">
                <label>Curso</label>
                <div className="custom-select-container">
                  <div
                    className="custom-select-trigger"
                    onClick={() => setDropdownAbierto(dropdownAbierto === 'curso' ? null : 'curso')}
                  >
                    <span>{filtros.curso || 'Seleccionar curso...'}</span>
                    <span className="custom-select-arrow">{dropdownAbierto === 'curso' ? '▲' : '▼'}</span>
                  </div>
                  {dropdownAbierto === 'curso' && (
                    <div className="custom-select-options custom-select-scroll">
                      <div
                        className="custom-select-option"
                        onClick={() => {
                          handleCursoChange('');
                          setDropdownAbierto(null);
                        }}
                      >
                        Seleccionar curso...
                      </div>
                      {cursosDB.map(curso => (
                        <div
                          key={curso.id}
                          className={`custom-select-option ${filtros.cursoId === curso.id ? 'selected' : ''}`}
                          onClick={() => {
                            handleCursoChange(curso.id);
                            setDropdownAbierto(null);
                          }}
                        >
                          {curso.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                  <label>Mes</label>
                  <div className="custom-select-container">
                    <div
                      className="custom-select-trigger"
                      onClick={() => setDropdownAbierto(dropdownAbierto === 'mes' ? null : 'mes')}
                    >
                      <span>{mesNombre}</span>
                      <span className="custom-select-arrow">{dropdownAbierto === 'mes' ? '▲' : '▼'}</span>
                    </div>
                    {dropdownAbierto === 'mes' && (
                      <div className="custom-select-options custom-select-scroll">
                        {mesesEscolares.map((mes) => (
                          <div
                            key={mes.indice}
                            className={`custom-select-option ${mesSeleccionado === mes.indice ? 'selected' : ''}`}
                            onClick={() => {
                              setMesSeleccionado(mes.indice);
                              setMesNombre(mes.nombre);
                              setDropdownAbierto(null);
                            }}
                          >
                            {mes.nombre}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>

          {/* Leyenda */}
          {filtros.cursoId && (
            <div className="asistencia-leyenda">
              <div className="leyenda-item">
                <span className="asistencia-icono asistencia-presente">✓</span>
                <span>Presente</span>
              </div>
              <div className="leyenda-item">
                <span className="asistencia-icono asistencia-ausente">✗</span>
                <span>Ausente</span>
              </div>
              <div className="leyenda-item">
                <span className="asistencia-icono asistencia-tardanza">T</span>
                <span>Tardanza</span>
              </div>
              <div className="leyenda-item">
                <span className="asistencia-icono asistencia-justificado">Just</span>
                <span>Justificado</span>
              </div>
            </div>
          )}

          {/* Estadisticas del mes */}
          {filtros.cursoId && (
            <div className="asistencia-stats">
              <div className="stat-item stat-total">
                <span className="stat-numero">{stats.total}</span>
                <span className="stat-label">Total Registros</span>
              </div>
              <div className="stat-item stat-presentes">
                <span className="stat-numero">{stats.presentes}</span>
                <span className="stat-label">Presentes</span>
              </div>
              <div className="stat-item stat-porcentaje">
                <span className="stat-numero">{stats.porcentajeAsistencia}%</span>
                <span className="stat-label">% Asistencia</span>
              </div>
              <div className="stat-item stat-ausentes">
                <span className="stat-numero">{stats.ausentes}</span>
                <span className="stat-label">Ausentes</span>
              </div>
              <div className="stat-item stat-justificados">
                <span className="stat-numero">{stats.justificados}</span>
                <span className="stat-label">Justificados</span>
              </div>
              <div
                className={`stat-item stat-bajo-umbral ${stats.alumnosBajoUmbral > 0 ? 'clickable' : ''}`}
                onClick={abrirPopupBajoUmbral}
              >
                <span className="stat-numero">{stats.alumnosBajoUmbral}</span>
                <span className="stat-label">Bajo 85%</span>
              </div>
            </div>
          )}

          {/* Tabla de asistencia con scroll */}
          {filtros.cursoId ? (
            <div className="tabla-asistencia-calendario">
              <div className="tabla-asistencia-wrapper">
                {/* Columnas fijas (N° y Alumno) */}
                <div className="columnas-fijas">
                  <table className="tabla-fija">
                    <thead>
                      <tr className="fila-mes">
                        <th className="th-espaciador" colSpan="2"></th>
                      </tr>
                      <tr className="fila-dias">
                        <th className="th-numero">N°</th>
                        <th className="th-alumno">Alumno</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAlumnosCurso().length > 0 ? (
                        getAlumnosCurso().map((alumno, index) => (
                          <tr key={alumno.id}>
                            <td className="td-numero">{index + 1}</td>
                            <td className="td-alumno">{formatearNombre(alumno.nombre_completo)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center text-muted">
                            No hay alumnos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Columnas scrolleables (días) */}
                <div className="columnas-scroll">
                  <table className="tabla-dias">
                    <thead>
                      <tr className="fila-mes">
                        <th colSpan={diasDelMes.length} className="th-mes">
                          {nombresMeses[mesSeleccionado]} {anioActual}
                        </th>
                      </tr>
                      <tr className="fila-dias">
                        {diasDelMes.map((diaInfo, index) => (
                          <th
                            key={diaInfo.dia}
                            className={`th-dia ${diaInfo.diaSemana === 1 && index > 0 ? 'inicio-semana' : ''} ${diaInfo.esFeriado ? 'dia-feriado' : ''}`}
                          >
                            <span className="dia-inicial">{diaInfo.inicial}</span>
                            <span className="dia-numero">{diaInfo.dia}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getAlumnosCurso().length > 0 ? (
                        getAlumnosCurso().map((alumno) => {
                          const asistenciaAlumno = getAsistenciaAlumno(alumno.id);
                          return (
                            <tr key={alumno.id}>
                              {diasDelMes.map((diaInfo, index) => (
                                <td
                                  key={diaInfo.dia}
                                  className={`td-dia ${diaInfo.esFeriado ? 'dia-feriado' : 'td-dia-clickable'} ${diaInfo.diaSemana === 1 && index > 0 ? 'inicio-semana' : ''}`}
                                  onClick={() => !diaInfo.esFeriado && abrirPopup(alumno, diaInfo, asistenciaAlumno[diaInfo.dia])}
                                >
                                  {diaInfo.esFeriado ? <span className="asistencia-feriado">Fer</span> : renderIconoAsistencia(asistenciaAlumno[diaInfo.dia])}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={diasDelMes.length} className="text-center text-muted">
                            No hay datos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: '40px' }}>
              Seleccione un curso para ver la asistencia
            </div>
          )}
        </div>
      </div>

      {/* Popup de edición de asistencia */}
      {popup.visible && (
        <div className="popup-overlay" onClick={cerrarPopup}>
          <div className="popup-asistencia" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h4>Editar Asistencia</h4>
              <button className="popup-close" onClick={cerrarPopup}>&times;</button>
            </div>
            <div className="popup-body">
              <div className="popup-info">
                <div className="popup-alumno">{popup.alumno?.nombre_completo}</div>
                <div className="popup-fecha">
                  <span className="popup-dia">{popup.diaInfo?.nombreDia}</span>
                  <span className="popup-fecha-completa">
                    {popup.diaInfo?.dia} de {nombresMeses[mesSeleccionado]} {anioActual}
                  </span>
                </div>
              </div>

              <div className="popup-estado-actual">
                <span className="popup-label">Estado actual:</span>
                {renderIconoAsistencia(popup.estadoActual)}
                <span>{getEtiquetaEstado(popup.estadoActual)}</span>
              </div>

              <div className="popup-opciones">
                <span className="popup-label">Cambiar a:</span>
                <div className="popup-estados">
                  <button
                    type="button"
                    className={`btn-estado btn-presente ${popup.estadoNuevo === 'presente' ? 'activo' : ''}`}
                    onClick={() => setPopup({ ...popup, estadoNuevo: 'presente' })}
                  >
                    <span className="asistencia-icono asistencia-presente">✓</span>
                    Presente
                  </button>
                  <button
                    type="button"
                    className={`btn-estado btn-ausente ${popup.estadoNuevo === 'ausente' ? 'activo' : ''}`}
                    onClick={() => setPopup({ ...popup, estadoNuevo: 'ausente' })}
                  >
                    <span className="asistencia-icono asistencia-ausente">✗</span>
                    Ausente
                  </button>
                  <button
                    type="button"
                    className={`btn-estado btn-tardanza ${popup.estadoNuevo === 'tardanza' ? 'activo' : ''}`}
                    onClick={() => setPopup({ ...popup, estadoNuevo: 'tardanza' })}
                  >
                    <span className="asistencia-icono asistencia-tardanza">T</span>
                    Tardanza
                  </button>
                  <button
                    type="button"
                    className={`btn-estado btn-justificado ${popup.estadoNuevo === 'justificado' ? 'activo' : ''}`}
                    onClick={() => setPopup({ ...popup, estadoNuevo: 'justificado' })}
                  >
                    <span className="asistencia-icono asistencia-justificado">Just</span>
                    Justificado
                  </button>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button type="button" className="btn btn-secondary" onClick={cerrarPopup}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={guardarAsistencia}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de alumnos bajo 85% */}
      {popupBajoUmbral.visible && (
        <div className="popup-overlay" onClick={cerrarPopupBajoUmbral}>
          <div className="popup-bajo-umbral" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h4>Alumnos con asistencia bajo 85%</h4>
              <button className="popup-close" onClick={cerrarPopupBajoUmbral}>&times;</button>
            </div>
            <div className="popup-body">
              <div className="popup-curso-info">
                {filtros.curso} - {nombresMeses[mesSeleccionado]} {anioActual}
              </div>
              <ul className="lista-bajo-umbral">
                {popupBajoUmbral.alumnos.map((alumno, index) => (
                  <li key={alumno.id} className="alumno-bajo-umbral">
                    <span className="alumno-numero">{index + 1}.</span>
                    <span className="alumno-nombre">{alumno.nombre}</span>
                    <span className="alumno-porcentaje">{alumno.porcentaje}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="popup-footer">
              <button type="button" className="btn btn-secondary" onClick={cerrarPopupBajoUmbral}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsistenciaTab;
