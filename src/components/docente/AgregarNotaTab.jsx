import React, { useState, useMemo } from 'react';
import { useResponsive, useDropdown } from '../../hooks';
import {
  SelectNativo,
  SelectMovil,
  AutocompleteAlumno,
  TablaUltimasNotas
} from './shared';

function AgregarNotaTab({ cursos, asignaciones, alumnosPorCurso, notasRegistradas, onAgregarNota }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [trimestre, setTrimestre] = useState('');
  const [trimestreNombre, setTrimestreNombre] = useState('');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [comentario, setComentario] = useState('');
  const [notaPendiente, setNotaPendiente] = useState(false);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [pestanaActiva, setPestanaActiva] = useState('registro');

  const { isMobile } = useResponsive();
  const { dropdownAbierto, setDropdownAbierto } = useDropdown();

  const trimestres = [
    { id: '1', nombre: '1er Trimestre' },
    { id: '2', nombre: '2do Trimestre' },
    { id: '3', nombre: '3er Trimestre' }
  ];

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

  const handleCursoChange = (cursoId, nombre = '') => {
    setCursoSeleccionado(cursoId);
    setCursoNombre(nombre);
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setAlumnoSeleccionado('');
    setBusquedaAlumno('');
  };

  const handleSeleccionarAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno.id);
    setBusquedaAlumno(`${alumno.nombres} ${alumno.apellidos}`);
  };

  const limpiarFormulario = () => {
    setCursoSeleccionado('');
    setCursoNombre('');
    setAsignaturaSeleccionada('');
    setAsignaturaNombre('');
    setAlumnoSeleccionado('');
    setTrimestre('');
    setTrimestreNombre('');
    setNota('');
    setFecha(new Date().toISOString().split('T')[0]);
    setComentario('');
    setNotaPendiente(false);
    setBusquedaAlumno('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cursoSeleccionado || !asignaturaSeleccionada || !alumnoSeleccionado || !trimestre || (!nota && !notaPendiente)) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const alumno = alumnosDelCurso.find(a => a.id === parseInt(alumnoSeleccionado));
    const curso = cursos.find(c => c.id === parseInt(cursoSeleccionado));
    const asignatura = asignaturasDisponibles.find(a => a.id === parseInt(asignaturaSeleccionada));

    const nuevaNota = {
      alumno_id: parseInt(alumnoSeleccionado),
      alumno_nombre: `${alumno.nombres} ${alumno.apellidos}`,
      curso_id: parseInt(cursoSeleccionado),
      curso_nombre: curso.nombre,
      asignatura_id: parseInt(asignaturaSeleccionada),
      asignatura_nombre: asignatura.nombre,
      nota: notaPendiente ? null : parseFloat(nota),
      trimestre: parseInt(trimestre),
      fecha: fecha,
      comentario: comentario,
      pendiente: notaPendiente
    };

    onAgregarNota(nuevaNota);
    limpiarFormulario();
    alert('Nota registrada exitosamente');
  };

  // Formulario movil
  const FormularioMovil = () => (
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
      <div className="form-row-movil">
        <AutocompleteAlumno
          alumnos={alumnosDelCurso}
          alumnoSeleccionado={alumnoSeleccionado}
          busqueda={busquedaAlumno}
          onBusquedaChange={(val) => { setBusquedaAlumno(val); setAlumnoSeleccionado(''); }}
          onSeleccionar={handleSeleccionarAlumno}
          disabled={!cursoSeleccionado}
          placeholder="Buscar..."
          onDropdownOpen={() => setDropdownAbierto(null)}
        />
        <SelectMovil
          label="Trimestre"
          value={trimestre}
          valueName={trimestreNombre}
          onChange={(id, nombre) => { setTrimestre(id); setTrimestreNombre(nombre); }}
          options={trimestres}
          placeholder="Seleccionar..."
          isOpen={dropdownAbierto === 'trimestre'}
          onToggle={() => setDropdownAbierto(dropdownAbierto === 'trimestre' ? null : 'trimestre')}
          onClose={() => setDropdownAbierto(null)}
        />
      </div>
      <div className="form-row-movil">
        <div className="form-group">
          <label>Fecha</label>
          <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Nota (1.0 - 7.0)</label>
          <input
            type="number"
            className="form-control"
            min="1.0"
            max="7.0"
            step="0.1"
            placeholder="Ej: 6.5"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            disabled={notaPendiente}
            required={!notaPendiente}
          />
        </div>
      </div>
    </>
  );

  // Formulario desktop
  const FormularioDesktop = () => (
    <>
      <div className="form-row form-row-tres">
        <SelectNativo
          label="Curso"
          value={cursoSeleccionado}
          onChange={(e) => {
            const curso = cursos.find(c => c.id.toString() === e.target.value);
            handleCursoChange(e.target.value, curso?.nombre || '');
          }}
          options={cursos}
          placeholder="Seleccionar curso"
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
          placeholder={cursoSeleccionado ? 'Seleccionar' : 'Primero seleccione curso'}
          disabled={!cursoSeleccionado}
        />
        <AutocompleteAlumno
          alumnos={alumnosDelCurso}
          alumnoSeleccionado={alumnoSeleccionado}
          busqueda={busquedaAlumno}
          onBusquedaChange={(val) => { setBusquedaAlumno(val); setAlumnoSeleccionado(''); }}
          onSeleccionar={handleSeleccionarAlumno}
          disabled={!cursoSeleccionado}
        />
      </div>
      <div className="form-row form-row-tres">
        <SelectNativo
          label="Trimestre"
          value={trimestre}
          onChange={(e) => {
            setTrimestre(e.target.value);
            const nombres = { '1': 'Primer Trimestre', '2': 'Segundo Trimestre', '3': 'Tercer Trimestre' };
            setTrimestreNombre(nombres[e.target.value] || '');
          }}
          options={[
            { id: '1', nombre: 'Primer Trimestre' },
            { id: '2', nombre: 'Segundo Trimestre' },
            { id: '3', nombre: 'Tercer Trimestre' }
          ]}
          placeholder="Seleccionar trimestre"
        />
        <div className="form-group">
          <label htmlFor="fechaNuevaNota">Fecha</label>
          <input
            type="date"
            id="fechaNuevaNota"
            className="form-control"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="notaNueva">Nota (1.0 - 7.0)</label>
          <input
            type="number"
            id="notaNueva"
            className="form-control"
            min="1.0"
            max="7.0"
            step="0.1"
            placeholder="Ej: 6.5"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            disabled={notaPendiente}
            required={!notaPendiente}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="tab-panel active">
      {isMobile && (
        <div className="mobile-subtabs">
          <button
            className={`mobile-subtab ${pestanaActiva === 'registro' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('registro')}
          >
            Registro de Calificaciones
          </button>
          <button
            className={`mobile-subtab ${pestanaActiva === 'ultimas' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('ultimas')}
          >
            Ultimas Notas
          </button>
        </div>
      )}

      <div className="two-columns">
        {(!isMobile || pestanaActiva === 'registro') && (
          <div className="column">
            <div className="card">
              <div className="card-header">
                <h3>Registro de Calificacion</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {isMobile ? <FormularioMovil /> : <FormularioDesktop />}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={notaPendiente}
                        onChange={(e) => {
                          setNotaPendiente(e.target.checked);
                          if (e.target.checked) setNota('');
                        }}
                      />
                      <span style={{ fontSize: '13px', color: '#475569' }}>Nota pendiente</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comentarioNuevaNota">Comentario (Opcional)</label>
                    <textarea
                      id="comentarioNuevaNota"
                      className="form-control"
                      rows="3"
                      placeholder="Ingrese alguna observacion..."
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                    ></textarea>
                  </div>

                  <div className={`form-actions ${isMobile ? 'form-actions-movil' : ''}`}>
                    <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>
                      Limpiar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isMobile ? 'Registrar' : 'Registrar Nota'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {(!isMobile || pestanaActiva === 'ultimas') && (
          <div className="column">
            <TablaUltimasNotas
              notasRegistradas={notasRegistradas}
              cursos={cursos}
              isMobile={isMobile}
              dropdownAbierto={dropdownAbierto}
              setDropdownAbierto={setDropdownAbierto}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AgregarNotaTab;
