import React, { useState } from 'react';
import '../styles/registro.css';

function RegistroPage({ tipoUsuario, onVolver, onRegistroExitoso }) {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    nombres: '',
    rut: '',
    telefono: '',
    correo: '',
    establecimiento: ''
  });
  const [alumnos, setAlumnos] = useState([
    { nombres: '', apellidos: '', rut: '', curso: '' }
  ]);
  const [agregarOtroAlumno, setAgregarOtroAlumno] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codigoPortal, setCodigoPortal] = useState('');
  const [error, setError] = useState('');
  const [modalResultado, setModalResultado] = useState({ visible: false, exito: false, mensaje: '' });

  // Lista de establecimientos de ejemplo
  const establecimientos = [
    'Colegio San Agustin',
    'Liceo Bicentenario',
    'Escuela Republica de Chile',
    'Colegio Santa Maria',
    'Instituto Nacional',
    'Liceo Manuel Barros Borgono',
    'Colegio San Ignacio',
    'Escuela Basica Los Andes',
    'Colegio Aleman',
    'Liceo de Aplicacion'
  ];

  // DATOS DE EJEMPLO: Simulacion de pre-registro en base de datos
  const preRegistroApoderadosDB = [
    {
      rutApoderado: '12.345.678-9',
      alumnosAsociados: ['23.456.789-0', '24.567.890-1']
    },
    {
      rutApoderado: '11.222.333-4',
      alumnosAsociados: ['21.333.444-5']
    },
    {
      rutApoderado: '15.666.777-8',
      alumnosAsociados: ['25.777.888-9', '26.888.999-0', '27.999.000-1']
    }
  ];

  // DATOS DE EJEMPLO: Docentes pre-registrados por el administrador
  const preRegistroDocentesDB = [
    '12.345.678-9',
    '10.111.222-3',
    '14.555.666-7',
    '16.777.888-9'
  ];

  // DATOS DE EJEMPLO: Codigos validos de Portal Estudiantil para administradores
  const codigosPortalDB = [
    'PORTAL2024',
    'ADMIN001',
    'EDU12345',
    'COLEGIO99'
  ];

  // Lista de cursos
  const cursos = [
    'Pre-Kinder', 'Kinder',
    '1° Basico', '2° Basico', '3° Basico', '4° Basico',
    '5° Basico', '6° Basico', '7° Basico', '8° Basico',
    '1° Medio', '2° Medio', '3° Medio', '4° Medio'
  ];

  const getTituloRol = () => {
    switch (tipoUsuario) {
      case 'admin': return 'Administrador';
      case 'docente': return 'Docente';
      case 'apoderado': return 'Apoderado';
      default: return 'Usuario';
    }
  };

  const getSubtituloPaso = () => {
    if (tipoUsuario === 'admin') {
      switch (paso) {
        case 1: return 'Paso 1: Datos del administrador';
        case 2: return 'Paso 2: Verificacion y contrasena';
        default: return '';
      }
    }
    if (tipoUsuario === 'docente') {
      switch (paso) {
        case 1: return 'Paso 1: Datos del docente';
        case 2: return 'Paso 2: Crear contrasena';
        default: return '';
      }
    }
    if (tipoUsuario === 'apoderado') {
      switch (paso) {
        case 1: return 'Paso 1: Datos del apoderado';
        case 2: return 'Paso 2: Datos del alumno';
        case 3: return 'Paso 3: Crear contrasena';
        default: return '';
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const formatRut = (value) => {
    let rut = value.replace(/[^0-9kK]/g, '');
    if (rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
    }
    if (rut.length > 5) {
      rut = rut.slice(0, -5) + '.' + rut.slice(-5);
    }
    if (rut.length > 9) {
      rut = rut.slice(0, -9) + '.' + rut.slice(-9);
    }
    return rut;
  };

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setFormData(prev => ({ ...prev, rut: formatted }));
    setError('');
  };

  const handleAlumnoChange = (index, field, value) => {
    const nuevosAlumnos = [...alumnos];
    if (field === 'rut') {
      nuevosAlumnos[index][field] = formatRut(value);
    } else {
      nuevosAlumnos[index][field] = value;
    }
    setAlumnos(nuevosAlumnos);
    setError('');
  };

  const handleAgregarAlumno = () => {
    setAlumnos([...alumnos, { nombres: '', apellidos: '', rut: '', curso: '' }]);
    setAgregarOtroAlumno(false);
  };

  const handleEliminarAlumno = (index) => {
    const nuevosAlumnos = alumnos.filter((_, i) => i !== index);
    setAlumnos(nuevosAlumnos);
  };

  // Funciones de auto-llenado
  const autoLlenarPaso1 = () => {
    setFormData({
      nombres: 'Maria Gonzalez Soto',
      rut: '12.345.678-9',
      telefono: '+56 9 8765 4321',
      correo: 'maria.gonzalez@correo.cl',
      establecimiento: 'Colegio San Agustin'
    });
  };

  const autoLlenarPaso2 = () => {
    setAlumnos([
      { nombres: 'Pedro', apellidos: 'Gonzalez Martinez', rut: '23.456.789-0', curso: '5° Basico' }
    ]);
    setAgregarOtroAlumno(false);
  };

  const autoLlenarPaso3 = () => {
    setPassword('Demo123');
    setConfirmPassword('Demo123');
  };

  const validarPaso1 = () => {
    if (!formData.nombres || !formData.rut || !formData.telefono || !formData.correo) {
      setError('Por favor complete todos los campos');
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      if (!alumno.nombres || !alumno.apellidos || !alumno.rut || !alumno.curso) {
        setError(`Por favor complete todos los datos del alumno ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const validarPassword = () => {
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contrasena debe tener al menos una letra mayuscula');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return false;
    }
    return true;
  };

  const validarPaso1Admin = () => {
    if (!formData.nombres || !formData.rut || !formData.telefono || !formData.correo || !formData.establecimiento) {
      setError('Por favor complete todos los campos');
      return false;
    }
    return true;
  };

  const handleSiguiente = () => {
    setError('');
    if (tipoUsuario === 'admin') {
      if (paso === 1 && validarPaso1Admin()) {
        setPaso(2);
      }
    } else if (tipoUsuario === 'docente') {
      if (paso === 1 && validarPaso1()) {
        setPaso(2);
      }
    } else if (tipoUsuario === 'apoderado') {
      if (paso === 1 && validarPaso1()) {
        setPaso(2);
      } else if (paso === 2 && validarPaso2()) {
        setPaso(3);
      }
    }
  };

  const handleVolver = () => {
    setError('');
    if (paso > 1) {
      setPaso(paso - 1);
    } else {
      onVolver();
    }
  };

  // Validar codigo de Portal Estudiantil para admin
  const validarCodigoPortal = () => {
    if (!codigoPortal) {
      setError('Por favor ingrese el codigo de Portal Estudiantil');
      return false;
    }
    if (!codigosPortalDB.includes(codigoPortal.toUpperCase())) {
      setModalResultado({
        visible: true,
        exito: false,
        mensaje: 'El codigo ingresado no es valido. Por favor verifique el codigo proporcionado por Portal Estudiantil o comuniquese con soporte.'
      });
      return false;
    }
    return true;
  };

  // Validar pre-registro del docente
  const validarPreRegistroDocente = () => {
    const rutDocente = formData.rut;

    if (!preRegistroDocentesDB.includes(rutDocente)) {
      setModalResultado({
        visible: true,
        exito: false,
        mensaje: 'El RUT ingresado no coincide con el registrado por el establecimiento. Por favor, comuniquese con ellos para verificar o corregir sus datos.'
      });
      return false;
    }
    return true;
  };

  // Validar pre-registro del apoderado
  const validarPreRegistroApoderado = () => {
    const rutApoderado = formData.rut;

    // Buscar el apoderado en el pre-registro
    const preRegistro = preRegistroApoderadosDB.find(pr => pr.rutApoderado === rutApoderado);

    if (!preRegistro) {
      setModalResultado({
        visible: true,
        exito: false,
        mensaje: 'El RUT del apoderado ingresado no coincide con el registrado en el establecimiento. Por favor, comuniquese con el establecimiento para verificar sus datos.'
      });
      return false;
    }

    // Validar cada alumno
    const alumnosNoCoinciden = [];
    alumnos.forEach((alumno, index) => {
      if (!preRegistro.alumnosAsociados.includes(alumno.rut)) {
        alumnosNoCoinciden.push(index + 1);
      }
    });

    if (alumnosNoCoinciden.length > 0) {
      const alumnoTexto = alumnosNoCoinciden.length === 1
        ? `El RUT del Alumno ${alumnosNoCoinciden[0]}`
        : `Los RUT de los Alumnos ${alumnosNoCoinciden.join(', ')}`;

      setModalResultado({
        visible: true,
        exito: false,
        mensaje: `${alumnoTexto} no coincide con los registrados en el establecimiento para este apoderado. Por favor, comuniquese con el establecimiento para verificar los datos.`
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (tipoUsuario === 'admin') {
      if (paso === 2 && validarPassword()) {
        // Validar codigo de Portal Estudiantil
        if (validarCodigoPortal()) {
          setModalResultado({
            visible: true,
            exito: true,
            mensaje: 'Cuenta de administrador creada con exito. Ya puede iniciar sesion con su RUT y la contrasena que acaba de crear.'
          });
        }
      }
      return;
    }

    if (tipoUsuario === 'docente') {
      if (paso === 2 && validarPassword()) {
        // Validar contra pre-registro de docentes
        if (validarPreRegistroDocente()) {
          setModalResultado({
            visible: true,
            exito: true,
            mensaje: 'Cuenta creada con exito. Ya puede iniciar sesion con su RUT y la contrasena que acaba de crear.'
          });
        }
      }
      return;
    }

    if (tipoUsuario === 'apoderado') {
      if (paso === 3 && validarPassword()) {
        // Validar contra pre-registro de apoderados
        if (validarPreRegistroApoderado()) {
          setModalResultado({
            visible: true,
            exito: true,
            mensaje: 'Registro realizado con exito. Ya puede iniciar sesion con su RUT y la contrasena que acaba de crear.'
          });
        }
      }
      return;
    }
  };

  const cerrarModalResultado = () => {
    if (modalResultado.exito) {
      onRegistroExitoso();
    }
    setModalResultado({ visible: false, exito: false, mensaje: '' });
  };

  // Renderizar formulario de datos personales (Paso 1 para apoderado, unico para otros)
  const renderFormularioDatos = () => (
    <>
      <button type="button" className="btn-autollenar" onClick={autoLlenarPaso1}>
        Auto-llenar
      </button>
      <div className="form-group form-group-full">
        <label htmlFor="nombres">Nombres y Apellidos *</label>
        <input
          type="text"
          id="nombres"
          name="nombres"
          value={formData.nombres}
          onChange={handleChange}
          placeholder="Ej: Juan Perez Lopez"
        />
      </div>

      <div className="form-row form-row-rut-tel">
        <div className="form-group">
          <label htmlFor="rut">RUT *</label>
          <input
            type="text"
            id="rut"
            name="rut"
            value={formData.rut}
            onChange={handleRutChange}
            placeholder="12.345.678-9"
            maxLength="12"
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Telefono *</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      <div className="form-group form-group-full">
        <label htmlFor="correo">Correo electronico *</label>
        <input
          type="email"
          id="correo"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          placeholder="ejemplo@correo.cl"
        />
      </div>

      {tipoUsuario === 'admin' && (
        <div className="form-group">
          <label htmlFor="establecimiento">Establecimiento *</label>
          <select
            id="establecimiento"
            name="establecimiento"
            value={formData.establecimiento}
            onChange={handleChange}
          >
            <option value="">Seleccione un establecimiento</option>
            {establecimientos.map((est, index) => (
              <option key={index} value={est}>{est}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );

  // Renderizar formulario de alumnos (Paso 2 para apoderado)
  const renderFormularioAlumnos = () => (
    <>
      <button type="button" className="btn-autollenar" onClick={autoLlenarPaso2}>
        Auto-llenar
      </button>
      {alumnos.map((alumno, index) => (
        <div key={index} className={`alumno-seccion ${index > 0 ? 'alumno-nuevo' : ''}`}>
          <div className="alumno-header">
            <div className="alumno-titulo">Alumno {index + 1}</div>
            {index > 0 && (
              <button
                type="button"
                className="btn-eliminar-alumno"
                onClick={() => handleEliminarAlumno(index)}
              >
                ×
              </button>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nombres *</label>
              <input
                type="text"
                value={alumno.nombres}
                onChange={(e) => handleAlumnoChange(index, 'nombres', e.target.value)}
                placeholder="Nombres del alumno"
              />
            </div>
            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                value={alumno.apellidos}
                onChange={(e) => handleAlumnoChange(index, 'apellidos', e.target.value)}
                placeholder="Apellidos del alumno"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>RUT *</label>
              <input
                type="text"
                value={alumno.rut}
                onChange={(e) => handleAlumnoChange(index, 'rut', e.target.value)}
                placeholder="12.345.678-9"
                maxLength="12"
              />
            </div>
            <div className="form-group">
              <label>Curso *</label>
              <select
                value={alumno.curso}
                onChange={(e) => handleAlumnoChange(index, 'curso', e.target.value)}
              >
                <option value="">Seleccione curso</option>
                {cursos.map((curso, i) => (
                  <option key={i} value={curso}>{curso}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <div className="agregar-alumno-container">
        <button type="button" className="btn-agregar-alumno" onClick={handleAgregarAlumno}>
          <span className="btn-agregar-icon">+</span>
          <span>Agregar alumno</span>
        </button>
      </div>
    </>
  );

  // Auto-llenar paso 2 admin
  const autoLlenarPaso2Admin = () => {
    setCodigoPortal('PORTAL2024');
    setPassword('Demo123');
    setConfirmPassword('Demo123');
  };

  // Renderizar formulario de codigo y contrasena (Paso 2 para admin)
  const renderFormularioCodigoPassword = () => (
    <>
      <button type="button" className="btn-autollenar" onClick={autoLlenarPaso2Admin}>
        Auto-llenar
      </button>
      <div className="form-group">
        <label htmlFor="codigoPortal">Codigo dado por Portal Estudiantil *</label>
        <input
          type="text"
          id="codigoPortal"
          value={codigoPortal}
          onChange={(e) => { setCodigoPortal(e.target.value.toUpperCase()); setError(''); }}
          placeholder="Ingrese el codigo"
          style={{ textTransform: 'uppercase' }}
        />
      </div>
      <div className="password-info">
        <p>La contrasena debe tener:</p>
        <ul>
          <li>Al menos 6 caracteres</li>
          <li>Al menos una letra mayuscula</li>
        </ul>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Contrasena *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Ingrese contrasena"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contrasena *</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Confirme contrasena"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Renderizar formulario de contrasena (Paso 3 para apoderado, Paso 2 para docente)
  const renderFormularioPassword = () => (
    <>
      <button type="button" className="btn-autollenar" onClick={autoLlenarPaso3}>
        Auto-llenar
      </button>
      <div className="password-info">
        <p>La contrasena debe tener:</p>
        <ul>
          <li>Al menos 6 caracteres</li>
          <li>Al menos una letra mayuscula</li>
        </ul>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Contrasena *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Ingrese contrasena"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contrasena *</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Confirme contrasena"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-box">
          {/* Header */}
          <div className="registro-header">
            <div className="registro-logo">
              <span>E</span>
            </div>
            <h1>Registro de {getTituloRol()}</h1>
            <p>{getSubtituloPaso()}</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="registro-form">
            {error && (
              <div className="registro-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            {tipoUsuario === 'apoderado' ? (
              <>
                {paso === 1 && renderFormularioDatos()}
                {paso === 2 && renderFormularioAlumnos()}
                {paso === 3 && renderFormularioPassword()}
              </>
            ) : tipoUsuario === 'docente' ? (
              <>
                {paso === 1 && renderFormularioDatos()}
                {paso === 2 && renderFormularioPassword()}
              </>
            ) : tipoUsuario === 'admin' ? (
              <>
                {paso === 1 && renderFormularioDatos()}
                {paso === 2 && renderFormularioCodigoPassword()}
              </>
            ) : (
              renderFormularioDatos()
            )}

            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={(tipoUsuario === 'apoderado' || tipoUsuario === 'docente' || tipoUsuario === 'admin') ? handleVolver : onVolver}>
                {(tipoUsuario === 'apoderado' || tipoUsuario === 'docente' || tipoUsuario === 'admin') && paso > 1 ? 'Volver' : 'Cancelar'}
              </button>
              {tipoUsuario === 'apoderado' ? (
                paso < 3 ? (
                  <button type="button" className="btn-registrar" onClick={handleSiguiente}>
                    Siguiente
                  </button>
                ) : (
                  <button type="submit" className="btn-registrar">
                    Crear cuenta
                  </button>
                )
              ) : tipoUsuario === 'docente' ? (
                paso < 2 ? (
                  <button type="button" className="btn-registrar" onClick={handleSiguiente}>
                    Siguiente
                  </button>
                ) : (
                  <button type="submit" className="btn-registrar">
                    Crear cuenta
                  </button>
                )
              ) : tipoUsuario === 'admin' ? (
                paso < 2 ? (
                  <button type="button" className="btn-registrar" onClick={handleSiguiente}>
                    Siguiente
                  </button>
                ) : (
                  <button type="submit" className="btn-registrar">
                    Crear cuenta
                  </button>
                )
              ) : (
                <button type="submit" className="btn-registrar">
                  Enviar solicitud
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="registro-footer">
            <p>Al registrarse, acepta nuestros terminos y condiciones</p>
          </div>
        </div>
      </div>

      {/* Modal de resultado */}
      {modalResultado.visible && (
        <div className="modal-resultado-overlay">
          <div className={`modal-resultado ${modalResultado.exito ? 'exito' : 'error'}`}>
            <div className="modal-resultado-icon">
              {modalResultado.exito ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              )}
            </div>
            <h3>{modalResultado.exito ? 'Registro Exitoso' : 'Error en el Registro'}</h3>
            <p>{modalResultado.mensaje}</p>
            <button className="btn-modal-resultado" onClick={cerrarModalResultado}>
              {modalResultado.exito ? 'Continuar' : 'Entendido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroPage;
