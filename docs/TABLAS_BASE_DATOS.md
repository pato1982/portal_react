# Tablas de Base de Datos - Portal Estudiantil

Este documento registra todas las tablas utilizadas en el proyecto y su estructura.

**Base de datos:** `portal_estudiantil`

---

## 1. tb_alumnos
Almacena los datos de los alumnos.

```sql
CREATE TABLE tb_alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    sexo ENUM('Masculino', 'Femenino', 'Otro'),
    nacionalidad VARCHAR(50) DEFAULT 'Chilena',
    direccion VARCHAR(255),
    comuna VARCHAR(100),
    ciudad VARCHAR(100),
    email VARCHAR(255),
    telefono VARCHAR(20),
    alergias TEXT,
    enfermedades_cronicas TEXT,
    medicamentos TEXT,
    grupo_sanguineo VARCHAR(10),
    contacto_emergencia_nombre VARCHAR(200),
    contacto_emergencia_telefono VARCHAR(20),
    foto_url VARCHAR(500),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rut (rut),
    INDEX idx_activo (activo),
    INDEX idx_apellidos (apellidos)
);
```

**Uso:** Datos principales de cada alumno. El campo `activo = 0` indica eliminación lógica (soft delete). Incluye información médica y de contacto de emergencia.

---

## 2. tb_alumno_establecimiento
Relación entre alumnos, establecimientos y cursos.

```sql
CREATE TABLE tb_alumno_establecimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    establecimiento_id INT NOT NULL,
    curso_id INT,
    anio_academico INT NOT NULL,
    numero_matricula VARCHAR(20),
    numero_lista INT,
    fecha_ingreso DATE NOT NULL,
    fecha_retiro DATE,
    motivo_retiro ENUM('transferencia', 'egreso', 'retiro_voluntario', 'expulsion', 'otro'),
    observacion_retiro TEXT,
    establecimiento_destino VARCHAR(255),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_alumno_est_anio (alumno_id, establecimiento_id, anio_academico),
    FOREIGN KEY (alumno_id) REFERENCES tb_alumnos(id) ON DELETE CASCADE,
    FOREIGN KEY (establecimiento_id) REFERENCES tb_establecimientos(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES tb_cursos(id) ON DELETE SET NULL
);
```

**Uso:** Vincula un alumno a un establecimiento y curso por año académico. Incluye información de matrícula y datos de retiro si aplica.

---

## 3. tb_cursos
Catálogo de cursos disponibles.

```sql
CREATE TABLE tb_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    nivel VARCHAR(50),
    grado INT,
    letra VARCHAR(5),
    anio_academico INT,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Uso:** Define los cursos disponibles (ej: "1° Básico A", "8° Básico B").

---

## 4. tb_establecimientos
Establecimientos educativos.

```sql
CREATE TABLE tb_establecimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50),
    direccion VARCHAR(300),
    telefono VARCHAR(50),
    email VARCHAR(100),
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Uso:** Datos de los colegios/establecimientos del sistema.

---

## 5. tb_apoderados
Datos de los apoderados registrados.

```sql
CREATE TABLE tb_apoderados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,  -- FK a tb_usuarios
    rut VARCHAR(12) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    telefono_emergencia VARCHAR(20),
    fecha_nacimiento DATE,
    sexo ENUM('Masculino', 'Femenino', 'Otro'),
    direccion VARCHAR(255),
    comuna VARCHAR(100),
    ciudad VARCHAR(100),
    ocupacion VARCHAR(100),
    lugar_trabajo VARCHAR(200),
    foto_url VARCHAR(500),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_usuario (usuario_id),
    UNIQUE KEY uk_rut (rut),
    FOREIGN KEY (usuario_id) REFERENCES tb_usuarios(id) ON DELETE CASCADE
);
```

**Uso:** Información de los apoderados. La columna `usuario_id` vincula con `tb_usuarios` para autenticación.

---

## 6. tb_apoderado_alumno
Relación entre apoderados y alumnos.

```sql
CREATE TABLE tb_apoderado_alumno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apoderado_id INT NOT NULL,
    alumno_id INT NOT NULL,
    parentesco VARCHAR(50),
    es_apoderado_titular TINYINT(1) DEFAULT 1,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apoderado_id) REFERENCES tb_apoderados(id),
    FOREIGN KEY (alumno_id) REFERENCES tb_alumnos(id),
    UNIQUE INDEX idx_apoderado_alumno (apoderado_id, alumno_id)
);
```

**Uso:** Vincula apoderados con sus pupilos. Un apoderado puede tener varios alumnos.

---

## 7. tb_docentes
Datos de los docentes registrados.

```sql
CREATE TABLE tb_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,  -- FK a tb_usuarios (puede ser NULL si aún no tiene cuenta)
    rut VARCHAR(12) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    sexo ENUM('Masculino', 'Femenino', 'Otro'),
    direccion VARCHAR(255),
    titulo_profesional VARCHAR(200),
    especialidad VARCHAR(200),
    foto_url VARCHAR(500),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rut (rut),
    UNIQUE KEY uk_usuario (usuario_id),
    FOREIGN KEY (usuario_id) REFERENCES tb_usuarios(id) ON DELETE SET NULL
);
```

**Uso:** Información de los docentes. La columna `usuario_id` vincula con `tb_usuarios` para autenticación.

---

## 8. tb_usuarios
Usuarios del sistema para autenticación.

```sql
CREATE TABLE tb_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL COMMENT 'Email único para login',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada (bcrypt)',
    tipo_usuario ENUM('administrador', 'docente', 'apoderado') NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    email_verificado TINYINT(1) DEFAULT 0,
    debe_cambiar_password TINYINT(1) DEFAULT 0,
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta DATETIME,
    ultimo_acceso DATETIME,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_email (email),
    INDEX idx_tipo_usuario (tipo_usuario),
    INDEX idx_activo (activo)
);
```

**Uso:** Credenciales para login. La relación con la entidad (administrador/docente/apoderado) se hace via `usuario_id` en las tablas `tb_administradores`, `tb_docentes` y `tb_apoderados`. El login es por EMAIL, no por RUT.

---

## 9. tb_preregistro_relaciones
Pre-registro de relaciones apoderado-alumno (sala de espera).

```sql
CREATE TABLE tb_preregistro_relaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id INT NOT NULL,
    rut_apoderado VARCHAR(20) NOT NULL,
    nombres_apoderado VARCHAR(100),
    apellidos_apoderado VARCHAR(100),
    telefono_apoderado VARCHAR(50),
    email_apoderado VARCHAR(100),
    rut_alumno VARCHAR(20) NOT NULL,
    nombres_alumno VARCHAR(100),
    apellidos_alumno VARCHAR(100),
    parentesco VARCHAR(50),
    es_apoderado_titular TINYINT(1) DEFAULT 1,
    activo TINYINT(1) DEFAULT 1,
    usado TINYINT(1) DEFAULT 0,
    fecha_uso DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (establecimiento_id) REFERENCES tb_establecimientos(id),
    INDEX idx_rut_apoderado (rut_apoderado),
    INDEX idx_rut_alumno (rut_alumno)
);
```

**Uso:**
- El admin crea un alumno y asocia un apoderado aquí.
- Cuando el apoderado se registra, el sistema valida contra esta tabla.
- Cuando el apoderado confirma al pupilo, se marca `usado = 1`.

---

## 10. tb_preregistro_docentes
Pre-registro de docentes autorizados.

```sql
CREATE TABLE tb_preregistro_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id INT NOT NULL,
    rut VARCHAR(12) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    especialidad VARCHAR(200),  -- Nombres de asignaturas en texto
    cargo ENUM('titular','reemplazo','part-time','honorarios') DEFAULT 'titular',
    usado TINYINT(1) DEFAULT 0,
    usuario_creado_id INT,
    fecha_uso DATETIME,
    creado_por INT,
    notas TEXT,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (establecimiento_id) REFERENCES tb_establecimientos(id),
    UNIQUE INDEX uk_preregistro_docente (rut, establecimiento_id)
);
```

**Uso:** Lista de docentes autorizados a registrarse. El sistema valida el RUT del docente contra esta tabla. El campo `especialidad` almacena los nombres de las asignaturas como texto (no como relación).

---

## 11. tb_preregistro_administradores
Códigos de validación para registro de administradores.

```sql
CREATE TABLE tb_preregistro_administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id INT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200),
    activo TINYINT(1) DEFAULT 1,
    usado TINYINT(1) DEFAULT 0,
    fecha_uso DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (establecimiento_id) REFERENCES tb_establecimientos(id),
    UNIQUE INDEX idx_codigo (codigo)
);
```

**Uso:** Códigos que Portal Estudiantil proporciona para que un administrador pueda registrarse.

---

## 12. tb_log_modificaciones
Registro de cambios y auditoría.

```sql
CREATE TABLE tb_log_modificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id INT NOT NULL,
    tipo_operacion ENUM('EDICION', 'ELIMINACION', 'CREACION') NOT NULL,
    descripcion_cambios TEXT,
    usuario_modificacion VARCHAR(100),
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tabla_registro (tabla_afectada, registro_id),
    INDEX idx_fecha (fecha_modificacion),
    INDEX idx_tipo (tipo_operacion)
);
```

**Uso:** Registra todas las modificaciones y eliminaciones de registros para auditoría.

---

## 13. tb_asignaturas
Catálogo de asignaturas por establecimiento.

```sql
CREATE TABLE tb_asignaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    descripcion VARCHAR(300),
    establecimiento_id INT NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (establecimiento_id) REFERENCES tb_establecimientos(id),
    INDEX idx_establecimiento (establecimiento_id)
);
```

**Uso:** Define las asignaturas/materias disponibles en cada establecimiento (Matemáticas, Lenguaje, etc.). Cada establecimiento puede tener su propio catálogo de asignaturas.

---

## 14. tb_docente_establecimiento
Relación entre docentes y establecimientos.

```sql
CREATE TABLE tb_docente_establecimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    establecimiento_id INT NOT NULL,
    cargo ENUM('titular', 'reemplazo', 'part-time', 'honorarios') DEFAULT 'titular',
    horas_contrato INT,
    es_profesor_jefe TINYINT(1) DEFAULT 0,
    curso_jefatura_id INT,  -- FK a tb_cursos (si es profesor jefe)
    fecha_ingreso DATE NOT NULL,
    fecha_termino DATE,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_docente_est (docente_id, establecimiento_id),
    FOREIGN KEY (docente_id) REFERENCES tb_docentes(id) ON DELETE CASCADE,
    FOREIGN KEY (establecimiento_id) REFERENCES tb_establecimientos(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_jefatura_id) REFERENCES tb_cursos(id) ON DELETE SET NULL
);
```

**Uso:** Permite que un docente trabaje en múltiples establecimientos. Incluye información del tipo de contrato y si es profesor jefe de algún curso.

---

## 15. tb_docente_asignatura
Relación entre docentes y asignaturas (especialidades).

```sql
CREATE TABLE tb_docente_asignatura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    asignatura_id INT NOT NULL,
    es_especialidad_principal TINYINT(1) DEFAULT 0,
    certificado TINYINT(1) DEFAULT 0,
    anios_experiencia INT DEFAULT 0,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES tb_docentes(id) ON DELETE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES tb_asignaturas(id) ON DELETE CASCADE,
    UNIQUE INDEX uk_docente_asig (docente_id, asignatura_id),
    INDEX idx_asignatura (asignatura_id)
);
```

**Uso:** Define qué asignaturas puede impartir cada docente. La relación con establecimiento se obtiene a través de `tb_asignaturas.establecimiento_id`. IMPORTANTE: Esta tabla NO tiene columna `establecimiento_id`.

---

## 16. tb_preregistro_docente_asignatura
Asignaturas pendientes para docentes en preregistro.

```sql
CREATE TABLE tb_preregistro_docente_asignatura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    preregistro_docente_id INT NOT NULL,
    asignatura_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preregistro_docente_id) REFERENCES tb_preregistro_docentes(id) ON DELETE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES tb_asignaturas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_preregistro_asig (preregistro_docente_id, asignatura_id)
);
```

**Uso:** Almacena las asignaturas que se asignarán al docente cuando complete su registro. Al registrarse, estas asignaturas se mueven a `tb_docente_asignatura`. Esta tabla complementa el campo `especialidad` de `tb_preregistro_docentes` que guarda los nombres como texto informativo.

---

## Diagrama de Relaciones

```
tb_establecimientos
       |
       +---> tb_cursos
       |
       +---> tb_asignaturas <----------------------------------+
       |         |                                             |
       |         +---> tb_preregistro_docente_asignatura       |
       |                        |                              |
       +---> tb_alumno_establecimiento <--- tb_alumnos         |
       |            |                                          |
       |            +---> tb_cursos                            |
       |                                                       |
       +---> tb_docente_establecimiento <--- tb_docentes       |
       |                                          |            |
       |                                          +---> tb_docente_asignatura
       |
       +---> tb_preregistro_relaciones
       |
       +---> tb_preregistro_docentes ---> tb_preregistro_docente_asignatura
       |
       +---> tb_preregistro_administradores
       |
       +---> tb_usuarios

tb_apoderados <---> tb_apoderado_alumno <---> tb_alumnos

tb_log_modificaciones (auditoría independiente)
```

---

## Notas Importantes

1. **Comparación de RUT:** Todas las comparaciones de RUT son case-insensitive usando `UPPER()`.

2. **Soft Delete:** Las eliminaciones son lógicas (`activo = 0`), nunca físicas.

3. **Pre-registro:** Las tablas `tb_preregistro_*` actúan como "sala de espera" para validar registros.

4. **Logging:** Todas las ediciones y eliminaciones de alumnos y docentes quedan registradas en `tb_log_modificaciones`.

5. **Múltiples Establecimientos:** Un docente puede trabajar en varios establecimientos. Al agregar un docente:
   - Si NO existe en `tb_docentes`: va a `tb_preregistro_docentes` + `tb_preregistro_docente_asignatura`
   - Si YA existe en `tb_docentes`: se crea relación en `tb_docente_establecimiento` + `tb_docente_asignatura`

6. **Asignaturas por Establecimiento:** Cada establecimiento tiene su propio catálogo de asignaturas. La tabla `tb_docente_asignatura` NO tiene `establecimiento_id`, la relación se obtiene vía `tb_asignaturas.establecimiento_id`.

7. **Flujo de asignaturas en preregistro:**
   - Al agregar docente: se guardan en `tb_preregistro_docente_asignatura` (IDs) + `tb_preregistro_docentes.especialidad` (texto)
   - Al registrarse: se transfieren de `tb_preregistro_docente_asignatura` a `tb_docente_asignatura`

---

*Última actualización: Enero 2026*
