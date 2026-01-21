import React, { useState, useEffect } from 'react';
import config from '../config/env';

const MatriculasTab = ({ mostrarMensaje }) => {
    // ----------------------------------------------------
    // ESTADOS
    // ----------------------------------------------------
    const [seccionActual, setSeccionActual] = useState(1);
    const [matriculando, setMatriculando] = useState(false);

    // Datos maestros
    const [cursos, setCursos] = useState([]);
    const [alumnosExistentes, setAlumnosExistentes] = useState([]); // Para buscador

    // Buscador
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState([]);

    // FORMULARIO UNIFICADO
    const [form, setForm] = useState({
        // Paso 1: Académico
        anio_academico: new Date().getFullYear(),
        curso_asignado_id: '',

        // Paso 2: Personal Alumno
        rut_alumno: '',
        nombres_alumno: '',
        apellidos_alumno: '',
        fecha_nacimiento_alumno: '',
        sexo_alumno: '',
        nacionalidad_alumno: 'Chilena',
        direccion_alumno: '',
        comuna_alumno: '',
        ciudad_alumno: '',
        telefono_alumno: '',
        email_alumno: '',

        // Paso 3: Salud y Emergencia
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '', // +569...
        tiene_nee: false,
        detalle_nee: '',
        alergias: '',
        enfermedades_cronicas: '',

        // Paso 4: Antecedentes
        colegio_procedencia: '',
        ultimo_curso_aprobado: '',
        promedio_notas_anterior: '',
        observaciones_apoderado: '',

        // Metadata interna
        alumno_id_existente: null // Si seleccionamos uno del buscador
    });

    // ----------------------------------------------------
    // CARGA INICIAL
    // ----------------------------------------------------
    useEffect(() => {
        cargarCursos();
        cargarAlumnos();
    }, []);

    const cargarCursos = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/cursos`);
            const d = await res.json();
            if (d.success) setCursos(d.data);
        } catch (e) { console.error(e); }
    };

    const cargarAlumnos = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/alumnos`);
            const d = await res.json();
            if (d.success) setAlumnosExistentes(d.data);
        } catch (e) { console.error(e); }
    };

    // ----------------------------------------------------
    // LOGICA BUSCADOR
    // ----------------------------------------------------
    useEffect(() => {
        if (busqueda.length > 2) {
            const term = busqueda.toLowerCase();
            const filtrados = alumnosExistentes.filter(a =>
                a.nombre_completo.toLowerCase().includes(term) || a.rut.includes(term)
            );
            setSugerencias(filtrados.slice(0, 5));
        } else {
            setSugerencias([]);
        }
    }, [busqueda, alumnosExistentes]);

    const seleccionarAlumnoExistente = (alumno) => {
        setForm(prev => ({
            ...prev,
            alumno_id_existente: alumno.id,
            rut_alumno: alumno.rut,
            nombres_alumno: alumno.nombres,
            apellidos_alumno: alumno.apellidos,
            // Pre-llenar otros si tuvieramos la data completa en /alumnos
        }));
        setBusqueda('');
        setSugerencias([]);
        setSeccionActual(2); // Saltar directo a completar ficha
    };

    // ----------------------------------------------------
    // MANEJO FORMULARIO
    // ----------------------------------------------------
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const siguientePaso = () => {
        // Validaciones simples por paso
        if (seccionActual === 1 && !form.curso_asignado_id) {
            alert('Debe seleccionar curso y año');
            return;
        }
        if (seccionActual === 2 && (!form.rut_alumno || !form.nombres_alumno)) {
            alert('Rut y Nombre son obligatorios');
            return;
        }
        setSeccionActual(prev => prev + 1);
    };

    const anteriorPaso = () => setSeccionActual(prev => prev - 1);

    const handleSubmit = async () => {
        if (!window.confirm('¿Confirmar matrícula?')) return;

        setMatriculando(true);
        try {
            const payload = {
                establecimiento_id: 1, // TODO: Contexto
                apoderado_id: 1, // TODO: Contexto de admin o selector de apoderado
                alumno_id: form.alumno_id_existente, // null si es nuevo

                ...form
            };

            const res = await fetch(`${config.apiBaseUrl}/matriculas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                if (mostrarMensaje) mostrarMensaje('Éxito', 'Alumno matriculado correctamente', 'success');
                else alert('Matrícula guardada exitosamente');

                // Reset
                setForm({
                    anio_academico: new Date().getFullYear(),
                    curso_asignado_id: '',
                    rut_alumno: '', nombres_alumno: '', apellidos_alumno: '',
                    fecha_nacimiento_alumno: '', sexo_alumno: '', nacionalidad_alumno: 'Chilena',
                    direccion_alumno: '', comuna_alumno: '', ciudad_alumno: '', telefono_alumno: '', email_alumno: '',
                    contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
                    tiene_nee: false, detalle_nee: '', alergias: '', enfermedades_cronicas: '',
                    colegio_procedencia: '', ultimo_curso_aprobado: '', promedio_notas_anterior: '',
                    observaciones_apoderado: '',
                    alumno_id_existente: null
                });
                setSeccionActual(1);
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

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------
    return (
        <div className="tab-panel active" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Ficha de Matrícula {form.anio_academico}</h3>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        Paso {seccionActual} de 4
                    </div>
                </div>

                <div className="card-body">
                    {/* Barra de progreso */}
                    <div style={{ display: 'flex', marginBottom: '20px', background: '#eee', height: '4px', borderRadius: '2px' }}>
                        <div style={{ width: `${(seccionActual / 4) * 100}%`, background: '#3182ce', transition: 'width 0.3s' }}></div>
                    </div>

                    {/* SECCION 1: ASIGNACIÓN ACADÉMICA Y BÚSQUEDA */}
                    {seccionActual === 1 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>1. Selección Académica</h4>

                            <div className="form-group" style={{ position: 'relative', marginBottom: '30px' }}>
                                <label><strong>¿El alumno ya existe? (Opcional)</strong></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por RUT o Nombre para autocompletar..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                />
                                {sugerencias.length > 0 && (
                                    <div className="lista-flotante-sugerencias">
                                        {sugerencias.map(a => (
                                            <div key={a.id} className="item-sugerencia" onClick={() => seleccionarAlumnoExistente(a)}>
                                                {a.nombre_completo} ({a.rut})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Curso a Asignar <span className="text-danger">*</span></label>
                                    <select
                                        name="curso_asignado_id"
                                        className="form-control"
                                        value={form.curso_asignado_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione...</option>
                                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Año Académico</label>
                                    <input type="number" name="anio_academico" className="form-control" value={form.anio_academico} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCION 2: DATOS PERSONALES */}
                    {seccionActual === 2 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>2. Datos del Alumno</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>RUT <span className="text-danger">*</span></label>
                                    <input type="text" name="rut_alumno" className="form-control" value={form.rut_alumno} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Nombres <span className="text-danger">*</span></label>
                                    <input type="text" name="nombres_alumno" className="form-control" value={form.nombres_alumno} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Apellidos <span className="text-danger">*</span></label>
                                    <input type="text" name="apellidos_alumno" className="form-control" value={form.apellidos_alumno} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha Nacimiento</label>
                                    <input type="date" name="fecha_nacimiento_alumno" className="form-control" value={form.fecha_nacimiento_alumno} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Sexo</label>
                                    <select name="sexo_alumno" className="form-control" value={form.sexo_alumno} onChange={handleChange}>
                                        <option value="">Seleccione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nacionalidad</label>
                                    <input type="text" name="nacionalidad_alumno" className="form-control" value={form.nacionalidad_alumno} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Dirección Completa</label>
                                <input type="text" name="direccion_alumno" className="form-control" placeholder="Calle, número, depto..." value={form.direccion_alumno} onChange={handleChange} />
                            </div>

                            <div className="form-row">
                                <div className="form-group"><label>Comuna</label><input type="text" name="comuna_alumno" className="form-control" value={form.comuna_alumno} onChange={handleChange} /></div>
                                <div className="form-group"><label>Ciudad</label><input type="text" name="ciudad_alumno" className="form-control" value={form.ciudad_alumno} onChange={handleChange} /></div>
                            </div>
                        </div>
                    )}

                    {/* SECCION 3: SALUD Y EMERGENCIA */}
                    {seccionActual === 3 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>3. Salud y Emergencias</h4>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" name="tiene_nee" checked={form.tiene_nee} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                                    <span>¿Presenta Necesidades Educativas Especiales (NEE)?</span>
                                </label>
                            </div>

                            {form.tiene_nee && (
                                <div className="form-group">
                                    <label>Detalle NEE</label>
                                    <textarea name="detalle_nee" className="form-control" value={form.detalle_nee} onChange={handleChange} />
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Alergias</label>
                                    <input type="text" name="alergias" className="form-control" value={form.alergias} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Enfermedades Crónicas</label>
                                    <input type="text" name="enfermedades_cronicas" className="form-control" value={form.enfermedades_cronicas} onChange={handleChange} />
                                </div>
                            </div>

                            <h5 style={{ marginTop: '20px', color: '#e53e3e' }}>Contacto de Emergencia</h5>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre Contacto</label>
                                    <input type="text" name="contacto_emergencia_nombre" className="form-control" value={form.contacto_emergencia_nombre} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono Contacto</label>
                                    <input type="text" name="contacto_emergencia_telefono" className="form-control" value={form.contacto_emergencia_telefono} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCION 4: ANTECEDENTES Y CONFIRMACIÓN */}
                    {seccionActual === 4 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>4. Antecedentes y Confirmación</h4>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Colegio de Procedencia</label>
                                    <input type="text" name="colegio_procedencia" className="form-control" value={form.colegio_procedencia} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Último curso aprobado</label>
                                    <input type="text" name="ultimo_curso_aprobado" className="form-control" value={form.ultimo_curso_aprobado} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Observaciones Generales</label>
                                <textarea name="observaciones_apoderado" className="form-control" rows="3" value={form.observaciones_apoderado} onChange={handleChange}></textarea>
                            </div>

                            <div style={{ marginTop: '30px', padding: '15px', background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px' }}>
                                <p><strong>Resumen de Matrícula:</strong></p>
                                <ul>
                                    <li><strong>Alumno:</strong> {form.nombres_alumno} {form.apellidos_alumno}</li>
                                    <li><strong>RUT:</strong> {form.rut_alumno}</li>
                                    <li><strong>Curso a Asignar:</strong> {cursos.find(c => c.id == form.curso_asignado_id)?.nombre || 'No seleccionado'}</li>
                                    <li><strong>Año:</strong> {form.anio_academico}</li>
                                </ul>
                                <p style={{ fontSize: '0.9em', color: '#666' }}>
                                    Al guardar, el alumno quedará habilitado en el sistema y se generará su ficha digital.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* BOTONES DE NAVEGACIÓN */}
                    <div className="form-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        {seccionActual > 1 ? (
                            <button className="btn btn-secondary" onClick={anteriorPaso}> Atrás</button>
                        ) : (
                            <div></div> // Espaciador
                        )}

                        {seccionActual < 4 ? (
                            <button className="btn btn-primary" onClick={siguientePaso}>Siguiente &rarr;</button>
                        ) : (
                            <button className="btn btn-success" onClick={handleSubmit} disabled={matriculando} style={{ background: '#38a169', borderColor: '#38a169' }}>
                                {matriculando ? 'Guardando...' : 'FINALIZAR MATRÍCULA'}
                            </button>
                        )}
                    </div>

                </div>
            </div>

            <style>{`
                .lista-flotante-sugerencias {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 100;
                    max-height: 200px;
                    overflow-y: auto;
                    border-radius: 0 0 4px 4px;
                }
                .item-sugerencia {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                }
                .item-sugerencia:hover {
                    background-color: #f7fafc;
                }
            `}</style>
        </div>
    );
};

export default MatriculasTab;
