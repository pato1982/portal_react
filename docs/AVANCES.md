# AVANCES DEL PROYECTO - Portal Estudiantil

> **IMPORTANTE**: Al iniciar una nueva conversacion, indicar a Claude que lea este archivo junto con `estructuras_tb.sql` y `docs/TABLAS_BASE_DATOS.md` para tener contexto completo del proyecto.

---

## CREDENCIALES DE CONEXION A BASE DE DATOS

### Produccion (Servidor Remoto)
```
Host: 170.239.87.97
Puerto: 3306
Usuario: root
Password: EXwCVq87aj0F3f1
Base de datos: portal_estudiantil
```

### Desarrollo Local (Valores por defecto si no hay .env)
```
Host: localhost
Puerto: 3306
Usuario: portal_user
Password: Portal@DB2024
Base de datos: portal_estudiantil
```

### JWT Secret
```
JWT_SECRET: portal_estudiantil_jwt_secret_2024_muy_seguro
```

### Servidor Backend
```
Puerto: 3001
URL Base API: http://localhost:3001/api
```

---

## ARCHIVOS IMPORTANTES A LEER

1. **`estructuras_tb.sql`** - Contiene las 53 tablas de la base de datos MySQL con sus estructuras completas
2. **`docs/TABLAS_BASE_DATOS.md`** - Documentacion de las tablas principales y sus relaciones
3. **`server/index.js`** - Rutas principales del backend (alumnos, docentes, cursos, etc.)
4. **`server/routes/registro.js`** - Rutas de registro de usuarios (admin, docente, apoderado)
5. **`server/routes/auth.js`** - Rutas de autenticacion y login
6. **`server/config/database.js`** - Configuracion de conexion MySQL

---

## HISTORIAL DE AVANCES

### Fecha: 12 de Enero 2026

#### 1. Verificacion de Estructuras de Tablas
- Se reviso que todas las rutas del backend coincidan con las estructuras reales de las tablas en `estructuras_tb.sql`
- Se identificaron discrepancias entre la documentacion y las tablas reales

#### 2. Correcciones en Documentacion (`docs/TABLAS_BASE_DATOS.md`)
- **tb_usuarios**: Corregido - el login es por EMAIL no por RUT, tipo_usuario usa 'administrador' no 'admin'
- **tb_docentes**: Agregado campo `usuario_id` (FK), campos adicionales documentados
- **tb_apoderados**: Agregado campo `usuario_id` (FK), campos adicionales documentados
- **tb_alumnos**: Agregados campos medicos, contactos de emergencia
- **tb_alumno_establecimiento**: Agregados campos de matricula y retiro
- **tb_docente_establecimiento**: Corregido cargo como ENUM, agregado es_profesor_jefe

#### 3. Nueva Tabla Creada: `tb_preregistro_docente_asignatura`
- **Proposito**: Vincular asignaturas a los docentes en el proceso de pre-registro
- **Estructura**:
  ```sql
  CREATE TABLE tb_preregistro_docente_asignatura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    preregistro_docente_id INT NOT NULL,
    asignatura_id INT NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preregistro_docente_id) REFERENCES tb_preregistro_docentes(id),
    FOREIGN KEY (asignatura_id) REFERENCES tb_asignaturas(id)
  );
  ```
- **Razon**: Permite que al pre-registrar un docente, el admin pueda asignarle las asignaturas que impartira, y cuando el docente complete su registro, estas asignaturas se transfieren automaticamente a `tb_docente_asignatura`

#### 4. Adaptacion de Rutas a `tb_log_actividades`
Se descubrio que las rutas usaban `tb_log_modificaciones` (tabla que NO existe). Se adaptaron todas las rutas para usar `tb_log_actividades`:

**Rutas modificadas en `server/index.js`:**

| Ruta | Accion | Modulo | Cambios |
|------|--------|--------|---------|
| `PUT /api/alumnos/:id` | editar | alumnos | Guarda datos_anteriores y datos_nuevos en JSON |
| `DELETE /api/alumnos/:id` | eliminar | alumnos | Guarda datos_anteriores, datos_nuevos = NULL |
| `PUT /api/docentes/:id` | editar | docentes | Guarda datos_anteriores y datos_nuevos en JSON |
| `DELETE /api/docentes/:id` | eliminar | docentes | Guarda datos_anteriores, datos_nuevos = NULL |

**Nuevos parametros que aceptan estas rutas:**
```javascript
{
  establecimiento_id: 1,        // ID del establecimiento (default: 1)
  usuario_id: null,             // ID del usuario que hace la accion
  tipo_usuario: 'sistema',      // ENUM: 'administrador', 'docente', 'apoderado', 'sistema'
  nombre_usuario: 'Sistema'     // Nombre legible del usuario
}
```

**Estructura de `tb_log_actividades` (referencia):**
```sql
CREATE TABLE tb_log_actividades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  tipo_usuario ENUM('administrador','docente','apoderado','sistema') NOT NULL,
  nombre_usuario VARCHAR(200) NOT NULL,
  accion ENUM('crear','editar','eliminar','login','logout',...) NOT NULL,
  modulo ENUM('auth','usuarios','alumnos','docentes','apoderados',...) NOT NULL,
  descripcion TEXT NOT NULL,
  entidad_tipo VARCHAR(50),
  entidad_id INT,
  datos_anteriores JSON,
  datos_nuevos JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  establecimiento_id INT NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Correccion en Rutas de Registro (`server/routes/registro.js`)
- Se agrego transferencia de asignaturas desde `tb_preregistro_docente_asignatura` a `tb_docente_asignatura` cuando un docente completa su registro
- **Flujo**:
  1. Admin pre-registra docente con asignaturas en `tb_preregistro_docente_asignatura`
  2. Docente se registra usando su RUT
  3. Sistema transfiere automaticamente las asignaturas a `tb_docente_asignatura`

#### 6. Modelo de Datos para Docentes Multi-Establecimiento
- Un docente puede pertenecer a varios establecimientos
- Las asignaturas se filtran por establecimiento usando JOIN con `tb_asignaturas.establecimiento_id`
- `tb_docente_asignatura` NO tiene `establecimiento_id` directo, se obtiene via `tb_asignaturas`

---

### Fecha: 13 de Enero 2026

#### 1. Mejoras en Seccion "Listado de Docentes" (AdminPage)

**Archivo modificado:** `src/components/DocentesTab.jsx`

**Cambios realizados:**

1. **Filtros Dropdown Independientes**
   - Filtro Docente: dropdown con todos los docentes del establecimiento
   - Filtro Asignatura: dropdown con solo asignaturas que tienen docentes asignados
   - Primera opcion de cada filtro: "Todos los docentes" / "Todas las asignaturas"
   - Ambos filtros funcionan de forma independiente o combinada (AND)

2. **Logica de Filtrado Mejorada**
   ```javascript
   // Obtener asignaturas que tienen al menos un docente asignado
   const asignaturasConDocentes = useMemo(() => {
     const asignaturasIds = new Set();
     docentesDB.forEach(docente => {
       (docente.asignaturas || []).forEach(asig => {
         asignaturasIds.add(asig.id);
       });
     });
     return asignaturasDB.filter(asig => asignaturasIds.has(asig.id));
   }, [docentesDB, asignaturasDB]);
   ```

3. **Mejora en Registro de Logs**
   - Edicion y eliminacion de docentes ahora envian datos completos para logging:
   ```javascript
   {
     usuario_id: null,
     tipo_usuario: 'administrador',
     nombre_usuario: 'Administrador del Sistema'
   }
   ```

4. **Modal de Edicion**
   - Campos: Nombres, Apellidos, RUT, Email
   - Asignaturas: checkboxes para marcar/desmarcar especialidades
   - Cambios se registran en tb_log_actividades

5. **Eliminacion (Soft Delete)**
   - Confirmacion con mensaje descriptivo
   - Desactiva tb_docente_establecimiento
   - Desactiva asignaturas en tb_docente_asignatura
   - Registra en tb_log_actividades

#### 2. Seccion "Asignar Docente a Curso" (AdminPage > AsignacionesTab)

**Archivos modificados:**
- `src/components/AsignacionesTab.jsx` - Componente completo reescrito
- `server/index.js` - Nuevas rutas de asignaciones

**Backend - Nuevas Rutas Creadas:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/asignaciones` | Lista asignaciones del establecimiento (año actual) |
| POST | `/api/asignaciones` | Crear asignacion(es) docente-curso-asignatura |
| DELETE | `/api/asignaciones/:id` | Eliminar asignacion (soft delete) |

**Frontend - Cambios Realizados:**

1. **Conexion a BD Real**
   - Eliminado uso de `demoData.js`
   - Implementado useEffect para cargar docentes, cursos y asignaciones desde API

2. **Filtros Dropdown**
   - Filtro Docente: dropdown con "Todos los docentes" como primera opcion
   - Filtro Curso: dropdown con "Todos los cursos" como primera opcion
   - Asignaturas del Docente: se cargan dinamicamente al seleccionar docente

3. **Formulario Asignar Docente a Curso**
   - Seleccionar docente → muestra sus asignaturas (de tb_docente_asignatura)
   - Seleccionar curso
   - Marcar asignaturas a asignar
   - Al guardar → crea registros en tb_asignaciones

4. **Listado Asignaciones Actuales**
   - Muestra: Docente, Curso, Asignatura, Acciones
   - Filtros independientes por curso y docente
   - Boton eliminar con confirmacion y soft delete

#### 3. Seccion "Notas por Curso" (AdminPage > NotasPorCursoTab)

**Archivos modificados:**
- `src/components/NotasPorCursoTab.jsx` - Componente completo reescrito
- `server/index.js` - Nuevas rutas de notas
- `src/styles/colegio.css` - Nuevos estilos para estados aprobado/reprobado

**Backend - Nuevas Rutas Creadas:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/asignaturas/por-curso/:cursoId` | Obtener asignaturas asignadas a un curso |
| GET | `/api/alumnos/por-curso/:cursoId` | Obtener alumnos de un curso especifico |
| GET | `/api/notas/por-curso` | Obtener notas filtradas por curso, asignatura y trimestre |
| POST | `/api/notas` | Guardar o actualizar una nota |

**Frontend - Cambios Realizados:**

1. **Filtros Dependientes (Cascada)**
   - Filtro Curso: al seleccionar, carga las asignaturas asignadas a ese curso
   - Filtro Asignatura: deshabilitado hasta seleccionar curso
   - Filtro Trimestre: deshabilitado hasta seleccionar asignatura
   - Primera opcion de cada filtro: "Todos los cursos" / "Todas las asignaturas" / "Todos los trimestres"

2. **Opcion "Todas (Ver todos)"**
   - Muestra tabla completa con los 3 trimestres
   - Incluye promedios por trimestre (P) y promedio final (P.F.)

3. **Indicadores de Aprobado/Reprobado**
   - Notas >= 4.0: color verde (aprobado)
   - Notas < 4.0: color rojo (reprobado)
   - Columna "Estado" muestra "Aprobado" o "Reprobado" segun promedio

4. **Estilos CSS Agregados:**
   ```css
   .nota-aprobada { color: #166534; }
   .nota-reprobada { color: #b91c1c; }
   .estado-aprobado { background-color: #dcfce7; color: #166534; }
   .estado-reprobado { background-color: #fee2e2; color: #b91c1c; }
   ```

5. **Tabla de Notas**
   - Vista por trimestre: Alumno | Nota1-8 | Promedio | Estado
   - Vista todas: Alumno | T1 (notas + P) | T2 (notas + P) | T3 (notas + P) | P.F.
   - Leyenda explicativa al pie de la tabla

#### 4. Verificacion y Correccion de Estructuras de Tablas

Se verifico que todas las rutas del backend coincidan con las estructuras reales de las tablas en `estructuras_tb.sql`.

**Correccion Realizada:**

| Ruta | Problema | Solucion |
|------|----------|----------|
| `GET /api/cursos` | No filtraba por establecimiento ni año | Agregado filtro por `establecimiento_id` y `anio_academico` |

**Codigo corregido:**
```javascript
// ANTES (incorrecto)
SELECT ... FROM tb_cursos WHERE activo = 1

// DESPUES (correcto)
SELECT ... FROM tb_cursos
WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1
```

**Verificacion Completa de Tablas:**

| Tabla | Campos NOT NULL | Como se maneja |
|-------|-----------------|----------------|
| `tb_docente_establecimiento` | fecha_ingreso | `CURDATE()` al insertar |
| `tb_log_actividades` | establecimiento_id | Default = 1 |
| `tb_log_actividades` | tipo_usuario | Default = 'sistema' |
| `tb_log_actividades` | nombre_usuario | Default = 'Sistema' |
| `tb_asignaciones` | anio_academico | `new Date().getFullYear()` |
| `tb_cursos` | anio_academico | Filtro por año actual |

**ENUMs Verificados en tb_log_actividades:**
- `accion`: incluye 'crear', 'editar', 'eliminar' ✓
- `modulo`: incluye 'docentes', 'asignaciones' ✓
- `tipo_usuario`: incluye 'administrador', 'sistema' ✓

---

## TABLAS UTILIZADAS POR MODULO

> Esta seccion registra las tablas de la BD utilizadas en cada modulo/seccion del sistema.

### Modulo: Listado de Docentes (AdminPage > DocentesTab)

| Tabla | Operacion | Descripcion |
|-------|-----------|-------------|
| `tb_docentes` | SELECT, UPDATE | Datos basicos del docente |
| `tb_asignaturas` | SELECT | Lista de asignaturas disponibles |
| `tb_docente_asignatura` | SELECT, INSERT, UPDATE | Relacion docente-asignatura |
| `tb_docente_establecimiento` | SELECT, UPDATE | Relacion docente-establecimiento |
| `tb_log_actividades` | INSERT | Registro de cambios (editar/eliminar) |

### Modulo: Asignar Docente a Curso (AdminPage > AsignacionesTab)

| Tabla | Operacion | Descripcion |
|-------|-----------|-------------|
| `tb_docentes` | SELECT | Lista de docentes para seleccionar |
| `tb_cursos` | SELECT | Lista de cursos del establecimiento |
| `tb_asignaturas` | SELECT | Asignaturas (via join con docente) |
| `tb_docente_asignatura` | SELECT | Asignaturas que imparte cada docente |
| `tb_asignaciones` | SELECT, INSERT, UPDATE | Asignaciones docente-curso-asignatura |
| `tb_log_actividades` | INSERT | Registro de cambios (crear/eliminar) |

### Modulo: Registro de Usuarios

| Tabla | Operacion | Descripcion |
|-------|-----------|-------------|
| `tb_usuarios` | SELECT, INSERT | Credenciales de acceso |
| `tb_administradores` | SELECT, INSERT | Datos de administradores |
| `tb_docentes` | SELECT, INSERT | Datos de docentes |
| `tb_apoderados` | SELECT, INSERT | Datos de apoderados |
| `tb_preregistro_docentes` | SELECT, UPDATE | Pre-registro de docentes |
| `tb_preregistro_docente_asignatura` | SELECT | Asignaturas pre-asignadas |
| `tb_preregistro_relaciones` | SELECT, UPDATE | Pre-registro apoderado-alumno |
| `tb_codigos_validacion` | SELECT, UPDATE | Codigos de validacion admin |

### Modulo: Autenticacion

| Tabla | Operacion | Descripcion |
|-------|-----------|-------------|
| `tb_usuarios` | SELECT, UPDATE | Verificar credenciales, ultimo acceso |
| `tb_administradores` | SELECT | Obtener datos del admin |
| `tb_docentes` | SELECT | Obtener datos del docente |
| `tb_apoderados` | SELECT | Obtener datos del apoderado |
| `tb_sesiones` | INSERT | Registrar sesion |
| `tb_log_actividades` | INSERT | Registrar login |

### Modulo: Notas por Curso (AdminPage > NotasPorCursoTab)

| Tabla | Operacion | Descripcion |
|-------|-----------|-------------|
| `tb_cursos` | SELECT | Lista de cursos del establecimiento |
| `tb_asignaciones` | SELECT | Obtener asignaturas asignadas a cada curso |
| `tb_asignaturas` | SELECT | Datos de asignaturas |
| `tb_alumnos` | SELECT | Lista de alumnos |
| `tb_alumno_establecimiento` | SELECT | Vinculo alumno-curso del año academico |
| `tb_notas` | SELECT, INSERT, UPDATE | Notas por alumno/asignatura/trimestre |
| `tb_tipos_evaluacion` | SELECT | Tipos de evaluacion (para contexto) |
| `tb_log_actividades` | INSERT | Registro de cambios en notas |

---

## RUTAS API IMPLEMENTADAS

### Alumnos (`/api/alumnos`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/alumnos?establecimiento_id=X` | Lista alumnos del establecimiento |
| POST | `/api/alumnos` | Crear nuevo alumno |
| PUT | `/api/alumnos/:id` | Actualizar alumno (con log) |
| DELETE | `/api/alumnos/:id` | Eliminar alumno - soft delete (con log) |

### Docentes (`/api/docentes`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/docentes?establecimiento_id=X` | Lista docentes del establecimiento |
| POST | `/api/docentes` | Crear nuevo docente |
| PUT | `/api/docentes/:id` | Actualizar docente (con log) |
| DELETE | `/api/docentes/:id` | Eliminar docente - soft delete (con log) |

### Cursos (`/api/cursos`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/cursos?establecimiento_id=X&anio_academico=Y` | Lista cursos del establecimiento (año actual por defecto) |

### Asignaturas (`/api/asignaturas`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/asignaturas?establecimiento_id=X` | Lista asignaturas del establecimiento |
| GET | `/api/asignaturas/por-curso/:cursoId` | Lista asignaturas asignadas a un curso |

### Alumnos por Curso
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/alumnos/por-curso/:cursoId` | Lista alumnos de un curso especifico |

### Notas (`/api/notas`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/notas/por-curso?curso_id=X&asignatura_id=Y&trimestre=Z` | Obtener notas con filtros |
| POST | `/api/notas` | Guardar o actualizar nota (con log) |

### Asignaciones (`/api/asignaciones`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/asignaciones?establecimiento_id=X&anio_academico=Y` | Lista asignaciones docente-curso-asignatura |
| POST | `/api/asignaciones` | Crear asignacion(es) - recibe array de asignaturas |
| DELETE | `/api/asignaciones/:id` | Eliminar asignacion - soft delete (con log) |

### Autenticacion (`/api/auth`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/login` | Login por email y password |

### Registro (`/api/registro`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/registro/validar-codigo` | Validar codigo Portal Estudiantil (admin) |
| POST | `/api/registro/validar-docente` | Validar pre-registro de docente |
| POST | `/api/registro/validar-apoderado` | Validar pre-registro de apoderado |
| POST | `/api/registro/admin` | Registrar administrador |
| POST | `/api/registro/docente` | Registrar docente |
| POST | `/api/registro/apoderado` | Registrar apoderado |

---

## PENDIENTES / PROXIMOS PASOS

### Completados (13 Enero 2026)
- [x] Filtros dropdown en Listado de Docentes (DocentesTab)
- [x] Seccion "Asignar Docente a Curso" conectada a BD real (AsignacionesTab)
- [x] Rutas CRUD para asignaciones docente-curso-asignatura
- [x] Verificacion de estructuras de tablas vs rutas backend
- [x] Correccion de GET /api/cursos (filtro por establecimiento y año)
- [x] Seccion "Notas por Curso" con filtros dependientes (Curso → Asignatura → Trimestre)
- [x] Rutas para obtener asignaturas por curso y notas filtradas
- [x] Visualizacion de notas con indicadores aprobado/reprobado (>= 4.0 / < 4.0)
- [x] Vista "Todas" que muestra los 3 trimestres con promedios

### Pendientes
1. [ ] Implementar rutas CRUD completas para apoderados
2. [ ] Implementar rutas para gestionar pre-registros desde el panel admin
3. [ ] Crear rutas CRUD completas para asignaturas (POST, PUT, DELETE con log)
4. [ ] Crear rutas CRUD completas para cursos (POST, PUT, DELETE con log)
5. [ ] Implementar edicion de notas inline en NotasPorCursoTab
6. [ ] Implementar sistema de asistencia (tb_asistencia)
7. [ ] Agregar validacion de permisos por rol en cada ruta
8. [ ] Crear rutas para consultar `tb_log_actividades`
9. [ ] Completar otras secciones de AsignacionesTab (Asignaciones Actuales - edicion)

---

## NOTAS TECNICAS

### Patron Soft Delete
- Todas las tablas usan `activo = 1/0` en lugar de eliminar registros
- DELETE realmente hace UPDATE SET activo = 0

### Comparacion de RUT
- Siempre usar `UPPER()` para comparaciones case-insensitive
- Ejemplo: `WHERE UPPER(rut) = UPPER(?)`

### Transacciones
- Operaciones que modifican multiples tablas usan transacciones
- Patron: `beginTransaction()` -> operaciones -> `commit()` o `rollback()`

### ENUMs Importantes
- `tipo_usuario`: 'administrador', 'docente', 'apoderado', 'sistema'
- `parentesco`: 'padre', 'madre', 'abuelo', 'abuela', 'tio', 'tia', 'tutor_legal', 'otro'
- `cargo` (docente): 'titular', 'reemplazo', 'part-time', 'honorarios'
- `accion` (log): 'crear', 'editar', 'eliminar', 'login', 'logout', etc.
- `modulo` (log): 'auth', 'usuarios', 'alumnos', 'docentes', 'apoderados', etc.

---

*Ultima actualizacion: 13 de Enero 2026 (Notas por Curso)*
