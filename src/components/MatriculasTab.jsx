import React, { useState, useEffect } from 'react';
import config from '../config/env';

const MatriculasTab = ({ mostrarMensaje }) => {
    // ----------------------------------------------------
    // ESTADOS
    // ----------------------------------------------------
    const [seccionActual, setSeccionActual] = useState(1);
    const [matriculando, setMatriculando] = useState(false);

    // Checkbox UI para dirección
    const [mismaDireccion, setMismaDireccion] = useState(true);

    // Datos maestros
    const [cursos, setCursos] = useState([]);
    const [alumnosExistentes, setAlumnosExistentes] = useState([]);

    // Buscador
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState([]);

    // FORMULARIO UNIFICADO
    const [form, setForm] = useState({
        // Paso 1: Académico
        anio_academico: new Date().getFullYear(),
        curso_asignado_id: '',

        // Paso 2: Personal Alumno
        rut_alumno: '', nombres_alumno: '', apellidos_alumno: '',
        fecha_nacimiento_alumno: '', sexo_alumno: '', nacionalidad_alumno: 'Chilena',
        direccion_alumno: '', comuna_alumno: '', ciudad_alumno: '', telefono_alumno: '', email_alumno: '',

        // Paso 3: APODERADO 
        rut_apoderado: '', nombres_apoderado: '', apellidos_apoderado: '',
        email_apoderado: '', telefono_apoderado: '', direccion_apoderado: '',
        parentezco: '', // NUEVO CAMPO

        // Paso 4: Salud
        contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
        tiene_nee: false, detalle_nee: '', alergias: '', enfermedades_cronicas: '',

        // Paso 5: Antecedentes
        colegio_procedencia: '', ultimo_curso_aprobado: '', promedio_notas_anterior: '',
        observaciones_apoderado: '',

        alumno_id_existente: null
    });

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

    // Buscador Logic
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
        }));
        setBusqueda(''); setSugerencias([]); setSeccionActual(2);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const siguientePaso = () => {
        if (seccionActual === 1 && !form.curso_asignado_id) { alert('Debe seleccionar curso y año'); return; }
        if (seccionActual === 2 && (!form.rut_alumno || !form.nombres_alumno)) { alert('Rut y Nombre Alumno obligatorios'); return; }
        if (seccionActual === 3 && (!form.rut_apoderado || !form.nombres_apoderado || !form.parentezco)) {
            alert('Rut, Nombre y Parentezco del Apoderado son obligatorios'); return;
        }

        setSeccionActual(prev => prev + 1);
    };
    const anteriorPaso = () => setSeccionActual(prev => prev - 1);

    const llenarDatosPrueba = () => {
        setForm(prev => ({
            ...prev,
            rut_alumno: '26.111.222-3', nombres_alumno: 'Agustín Ignacio', apellidos_alumno: 'Soto Muñoz',
            fecha_nacimiento_alumno: '2016-05-15', sexo_alumno: 'Masculino',
            direccion_alumno: 'Calle Falsa 123', comuna_alumno: 'Santiago',

            rut_apoderado: '15.222.333-4', nombres_apoderado: 'Héctor', apellidos_apoderado: 'Soto Pérez',
            email_apoderado: 'apoderado.demo@example.com', telefono_apoderado: '+56987654321',
            parentezco: 'Padre', // DEMO
            direccion_apoderado: '',

            tiene_nee: false, alergias: 'Ninguna',
            contacto_emergencia_nombre: 'María Muñoz (Madre)', contacto_emergencia_telefono: '+56911112222',
            colegio_procedencia: 'Jardín Infantil Solcito',
            observaciones_apoderado: 'Alumno entusiasta.'
        }));
        setMismaDireccion(true);
        alert('Datos cargados (Incluye Parentezco).');
    };

    const handleSubmit = async () => {
        if (!window.confirm('¿Confirmar matrícula?')) return;
        setMatriculando(true);
        try {
            const dirApoderadoFinal = mismaDireccion ? form.direccion_alumno : form.direccion_apoderado;

            const payload = {
                establecimiento_id: 1,
                ...form,
                direccion_apoderado: dirApoderadoFinal
            };

            const res = await fetch(`${config.apiBaseUrl}/matriculas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                if (mostrarMensaje) mostrarMensaje('Éxito', 'Alumno y Apoderado registrados correctamente', 'success');
                else alert('Matrícula guardada exitosamente');

                // Reset
                setForm({
                    anio_academico: new Date().getFullYear(), curso_asignado_id: '',
                    rut_alumno: '', nombres_alumno: '', apellidos_alumno: '',
                    rut_apoderado: '', nombres_apoderado: '', apellidos_apoderado: '', email_apoderado: '', parentezco: '',
                    tiene_nee: false, detalle_nee: '', contacto_emergencia_nombre: '',
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

    return (
        <div className="tab-panel active" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3>Ficha de Matrícula {form.anio_academico}</h3>
                        <button onClick={llenarDatosPrueba} className="btn-demo" style={{ cursor: 'pointer', background: '#ecc94b', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.85em', fontWeight: 'bold' }}>⚡ Demo</button>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Paso {seccionActual} de 5</div>
                </div>

                <div className="card-body">
                    {/* Barra de progreso */}
                    <div style={{ display: 'flex', marginBottom: '20px', background: '#eee', height: '4px', borderRadius: '2px' }}>
                        <div style={{ width: `${(seccionActual / 5) * 100}%`, background: '#3182ce', transition: 'width 0.3s' }}></div>
                    </div>

                    {seccionActual === 1 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>1. Selección Académica</h4>
                            <div className="form-group" style={{ position: 'relative', marginBottom: '30px' }}>
                                <label>Autocargar Alumno Existente (Opcional)</label>
                                <input type="text" className="form-control" placeholder="Buscar RUT o Nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                {sugerencias.length > 0 && (
                                    <div className="lista-flotante-sugerencias">
                                        {sugerencias.map(a => (
                                            <div key={a.id} className="item-sugerencia" onClick={() => seleccionarAlumnoExistente(a)}>{a.nombre_completo} ({a.rut})</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Curso a Asignar <span className="text-danger">*</span></label>
                                    <select name="curso_asignado_id" className="form-control" value={form.curso_asignado_id} onChange={handleChange}>
                                        <option value="">Seleccione...</option>
                                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Año</label><input type="number" name="anio_academico" className="form-control" value={form.anio_academico} onChange={handleChange} /></div>
                            </div>
                        </div>
                    )}

                    {seccionActual === 2 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>2. Datos del Alumno</h4>
                            <div className="form-row">
                                <div className="form-group"><label>RUT <span className="text-danger">*</span></label><input type="text" name="rut_alumno" className="form-control" value={form.rut_alumno} onChange={handleChange} /></div>
                                <div className="form-group"><label>Nombres <span className="text-danger">*</span></label><input type="text" name="nombres_alumno" className="form-control" value={form.nombres_alumno} onChange={handleChange} /></div>
                                <div className="form-group"><label>Apellidos</label><input type="text" name="apellidos_alumno" className="form-control" value={form.apellidos_alumno} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Fecha Nac.</label><input type="date" name="fecha_nacimiento_alumno" className="form-control" value={form.fecha_nacimiento_alumno} onChange={handleChange} /></div>
                                <div className="form-group"><label>Sexo</label>
                                    <select name="sexo_alumno" className="form-control" value={form.sexo_alumno} onChange={handleChange}>
                                        <option value="">Seleccione...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group"><label>Dirección</label><input type="text" name="direccion_alumno" className="form-control" value={form.direccion_alumno} onChange={handleChange} /></div>
                        </div>
                    )}

                    {/* SECCION 3: APODERADO */}
                    {seccionActual === 3 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#dd6b20' }}>3. Datos del Apoderado</h4>
                            <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                                Si el apoderado ya existe (mismo RUT), se vinculará automáticamente.
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>RUT Apoderado <span className="text-danger">*</span></label><input type="text" name="rut_apoderado" className="form-control" value={form.rut_apoderado} onChange={handleChange} placeholder="Ej: 15.222.333-4" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Nombres <span className="text-danger">*</span></label><input type="text" name="nombres_apoderado" className="form-control" value={form.nombres_apoderado} onChange={handleChange} /></div>
                                <div className="form-group"><label>Apellidos</label><input type="text" name="apellidos_apoderado" className="form-control" value={form.apellidos_apoderado} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Email</label><input type="email" name="email_apoderado" className="form-control" value={form.email_apoderado} onChange={handleChange} /></div>
                                <div className="form-group"><label>Teléfono</label><input type="text" name="telefono_apoderado" className="form-control" value={form.telefono_apoderado} onChange={handleChange} /></div>
                            </div>

                            {/* NUEVO ITEM: PARENTEZCO */}
                            <div className="form-group">
                                <label>Parentezco con el Alumno <span className="text-danger">*</span></label>
                                <select name="parentezco" className="form-control" value={form.parentezco} onChange={handleChange} required>
                                    <option value="">Seleccione relación...</option>
                                    <option value="Padre">Padre</option>
                                    <option value="Madre">Madre</option>
                                    <option value="Abuelo/a">Abuelo/a</option>
                                    <option value="Tío/a">Tío/a</option>
                                    <option value="Tutor Legal">Tutor Legal</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div style={{ marginTop: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '6px', background: '#fafafa' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>¿Vive en la misma dirección del alumno?</label>

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="radio"
                                            name="mismaDireccion"
                                            checked={mismaDireccion === true}
                                            onChange={() => setMismaDireccion(true)}
                                        /> ⚠️ Sí, usar misma dirección
                                    </label>
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="radio"
                                            name="mismaDireccion"
                                            checked={mismaDireccion === false}
                                            onChange={() => setMismaDireccion(false)}
                                        /> 🏠 No, ingresar otra
                                    </label>
                                </div>

                                {mismaDireccion ? (
                                    <div className="form-group">
                                        <input type="text" className="form-control" value={form.direccion_alumno || '(Ingrese dirección en paso anterior)'} disabled style={{ backgroundColor: '#e2e8f0', color: '#4a5568' }} />
                                        <small className="text-muted">Se usará la dirección del Paso 2.</small>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Ingrese Dirección del Apoderado:</label>
                                        <input type="text" name="direccion_apoderado" className="form-control" value={form.direccion_apoderado} onChange={handleChange} placeholder="Calle, Número, Comuna..." />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {seccionActual === 4 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>4. Salud y Emergencias</h4>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" name="tiene_nee" checked={form.tiene_nee} onChange={handleChange} /> <span>¿Necesidades Educativas Especiales?</span>
                                </label>
                            </div>
                            {form.tiene_nee && (<div className="form-group"><label>Detalle</label><textarea name="detalle_nee" className="form-control" value={form.detalle_nee} onChange={handleChange} /></div>)}
                            <div className="form-row">
                                <div className="form-group"><label>Alergias</label><input type="text" name="alergias" className="form-control" value={form.alergias} onChange={handleChange} /></div>
                            </div>
                            <h5 style={{ marginTop: '20px' }}>Emergencia</h5>
                            <div className="form-row">
                                <div className="form-group"><label>Contacto</label><input type="text" name="contacto_emergencia_nombre" className="form-control" value={form.contacto_emergencia_nombre} onChange={handleChange} /></div>
                                <div className="form-group"><label>Teléfono</label><input type="text" name="contacto_emergencia_telefono" className="form-control" value={form.contacto_emergencia_telefono} onChange={handleChange} /></div>
                            </div>
                        </div>
                    )}

                    {seccionActual === 5 && (
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#2b6cb0' }}>5. Resumen Final</h4>
                            <div className="form-group"><label>Observaciones</label><textarea name="observaciones_apoderado" className="form-control" value={form.observaciones_apoderado} onChange={handleChange} /></div>

                            <div style={{ marginTop: '30px', padding: '15px', background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px' }}>
                                <p><strong>Resumen:</strong></p>
                                <ul>
                                    <li><strong>Alumno:</strong> {form.nombres_alumno} {form.apellidos_alumno}</li>
                                    <li><strong>Apoderado:</strong> {form.nombres_apoderado} {form.apellidos_apoderado} ({form.parentezco})</li>
                                    <li>
                                        <strong>Dirección Apoderado:</strong><br />
                                        {mismaDireccion ? (
                                            <span style={{ color: '#2b6cb0' }}>⚠️ Misma del alumno: {form.direccion_alumno}</span>
                                        ) : (
                                            <span style={{ color: '#2f855a' }}>🏠 Ppia: {form.direccion_apoderado}</span>
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="form-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        {seccionActual > 1 ? <button className="btn btn-secondary" onClick={anteriorPaso}>Atrás</button> : <div></div>}
                        {seccionActual < 5 ? <button className="btn btn-primary" onClick={siguientePaso}>Siguiente &rarr;</button> :
                            <button className="btn btn-success" onClick={handleSubmit} disabled={matriculando} style={{ background: '#38a169', borderColor: '#38a169' }}>
                                {matriculando ? 'Procesando...' : 'CONFIRMAR MATRÍCULA'}
                            </button>
                        }
                    </div>

                </div>
            </div>
            <style>{`
                .lista-flotante-sugerencias { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; z-index: 100; max-height: 200px; overflow-y: auto; }
                .item-sugerencia { padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee; }
                .item-sugerencia:hover { background-color: #f7fafc; }
            `}</style>
        </div>
    );
};
export default MatriculasTab;
