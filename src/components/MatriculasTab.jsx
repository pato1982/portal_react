import React, { useState, useEffect } from 'react';
import config from '../config/env';

const MatriculasTab = ({ mostrarMensaje }) => {
    // Estados de datos
    const [cursos, setCursos] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [apoderados, setApoderados] = useState([]);

    // Estados de selección
    const [busquedaAlumno, setBusquedaAlumno] = useState('');
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [anioAcademico, setAnioAcademico] = useState(new Date().getFullYear());

    // Estados de UI
    const [cargando, setCargando] = useState(false);
    const [matriculando, setMatriculando] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        cargarCursos();
        cargarAlumnos();
    }, []);

    const cargarCursos = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/cursos`);
            const data = await res.json();
            if (data.success) setCursos(data.data);
        } catch (e) {
            console.error(e);
        }
    };

    const cargarAlumnos = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/alumnos`);
            const data = await res.json();
            if (data.success) setAlumnos(data.data);
        } catch (e) {
            console.error(e);
        }
    };

    // Filtro de alumnos
    const alumnosFiltrados = busquedaAlumno
        ? alumnos.filter(a =>
            a.nombre_completo.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
            a.rut.includes(busquedaAlumno)
        ).slice(0, 10)
        : [];

    const seleccionarAlumno = (alumno) => {
        setAlumnoSeleccionado(alumno);
        setBusquedaAlumno('');
        // Intentar pre-seleccionar el apoderado si viene en la data (necesitaríamos que /alumnos traiga apoderado_id)
        // Por ahora lo dejamos manual
    };

    const handleMatricular = async () => {
        if (!alumnoSeleccionado || !cursoSeleccionado) {
            alert('Seleccione alumno y curso');
            return;
        }

        setMatriculando(true);
        try {
            const payload = {
                establecimiento_id: 1, // TODO: Dinamico
                alumno_id: alumnoSeleccionado.id,
                rut_alumno: alumnoSeleccionado.rut,
                nombres_alumno: alumnoSeleccionado.nombres,
                apellidos_alumno: alumnoSeleccionado.apellidos,
                anio_academico: anioAcademico,
                curso_asignado_id: cursoSeleccionado,
                apoderado_id: 1 // TODO: Necesitamos seleccionar apoderado real. Hardcodeado temporalmente para test
            };

            const res = await fetch(`${config.apiBaseUrl}/matriculas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                if (mostrarMensaje) mostrarMensaje('Éxito', 'Alumno matriculado correctamente', 'success');
                else alert('Matriculado con éxito');

                setAlumnoSeleccionado(null);
                setCursoSeleccionado('');
            } else {
                alert('Error: ' + data.error);
            }

        } catch (e) {
            console.error(e);
            alert('Error de conexión');
        } finally {
            setMatriculando(false);
        }
    };

    return (
        <div className="tab-panel active">
            <div className="card">
                <div className="card-header">
                    <h3>Nueva Matrícula {anioAcademico}</h3>
                </div>
                <div className="card-body">

                    {/* Paso 1: Buscar Alumno */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Buscar Alumno (RUT o Nombre)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={alumnoSeleccionado ? alumnoSeleccionado.nombre_completo : busquedaAlumno}
                            onChange={e => {
                                setBusquedaAlumno(e.target.value);
                                setAlumnoSeleccionado(null);
                            }}
                            placeholder="Ej: Agus..."
                        />
                        {busquedaAlumno && !alumnoSeleccionado && (
                            <div className="dropdown-results" style={{
                                border: '1px solid #ddd',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                position: 'absolute',
                                background: 'white',
                                width: '95%',
                                zIndex: 100
                            }}>
                                {alumnosFiltrados.map(a => (
                                    <div
                                        key={a.id}
                                        onClick={() => seleccionarAlumno(a)}
                                        style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    >
                                        <strong>{a.nombre_completo}</strong> <br />
                                        <small>{a.rut}</small>
                                    </div>
                                ))}
                                {alumnosFiltrados.length === 0 && (
                                    <div style={{ padding: '10px' }}>No encontrado. Ir a "Gestión de Alumnos" para crear.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {alumnoSeleccionado && (
                        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>Alumno Seleccionado</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div><strong>RUT:</strong> {alumnoSeleccionado.rut}</div>
                                <div><strong>Nombre:</strong> {alumnoSeleccionado.nombre_completo}</div>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Seleccionar Curso */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Curso a Asignar</label>
                        <select
                            className="form-control"
                            value={cursoSeleccionado}
                            onChange={e => setCursoSeleccionado(e.target.value)}
                        >
                            <option value="">Seleccione Curso...</option>
                            {cursos.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleMatricular}
                            disabled={matriculando || !alumnoSeleccionado || !cursoSeleccionado}
                        >
                            {matriculando ? 'Procesando...' : 'Confirmar Matrícula'}
                        </button>
                    </div>

                </div>
            </div>

            <div className="alert alert-info" style={{ marginTop: '20px' }}>
                <strong>Nota:</strong> Esta acción habilitará al apoderado para ver los profesores de este curso en el chat.
            </div>
        </div>
    );
};

export default MatriculasTab;
