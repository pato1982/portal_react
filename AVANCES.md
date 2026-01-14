# AVANCES DEL PROYECTO - Portal Estudiantil

**Ultima actualizacion:** 13 de Enero 2026

---

## CONFIGURACION DEL ENTORNO

### Archivo de configuracion: `src/config/env.js`

```javascript
appMode: 'demo' | 'production'
apiBaseUrl: 'http://170.239.87.97:3001/api'
```

- **Modo DEMO** (`VITE_APP_MODE=demo`): Usa datos mock locales
- **Modo PRODUCCION** (`VITE_APP_MODE=production`): Conecta a la API real

---

## CREDENCIALES DE PRUEBA (MODO DEMO)

| Tipo Usuario | Email | Password |
|--------------|-------|----------|
| Administrador | admin@colegio.cl | Admin123 |
| Docente | docente@colegio.cl | Docente123 |
| Apoderado | apoderado@colegio.cl | Apoderado123 |

**Archivo:** `src/mock/authMockData.js`

---

## 1. LOGIN

### Archivos involucrados:
- **Frontend:** `src/components/LoginPage.jsx`
- **Servicio:** `src/services/authService.js`
- **Backend:** `server/routes/auth.js`

### Endpoints:
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesion |
| POST | `/api/auth/logout` | Cerrar sesion |
| GET | `/api/auth/me` | Verificar sesion actual |

### Tablas MySQL utilizadas:
1. `tb_usuarios` - Credenciales y datos de autenticacion
2. `tb_sesiones` - Registro de sesiones JWT activas
3. `tb_administradores` - Datos adicionales de admins
4. `tb_docentes` - Datos adicionales de docentes
5. `tb_apoderados` - Datos adicionales de apoderados
6. `tb_administrador_establecimiento` - Relacion admin-establecimiento
7. `tb_docente_establecimiento` - Relacion docente-establecimiento
8. `tb_apoderado_alumno` - Relacion apoderado-alumno
9. `tb_alumnos` - Datos de alumnos (para pupilos del apoderado)
10. `tb_alumno_establecimiento` - Relacion alumno-establecimiento
11. `tb_cursos` - Cursos de los alumnos
12. `tb_establecimientos` - Datos del establecimiento

### Estado: CONECTADO

---

## 2. REGISTRO

### Archivos involucrados:
- **Frontend:** `src/components/RegistroPage.jsx`
- **Servicio:** `src/services/registroService.js`
- **Backend:** `server/routes/registro.js`
- **Componentes auxiliares:** `src/components/registro/` (FormularioDatos, FormularioAlumnos, etc.)

### Endpoints:
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/registro/validar-codigo` | Validar codigo de admin |
| POST | `/api/registro/validar-docente` | Validar RUT docente en preregistro |
| POST | `/api/registro/validar-apoderado` | Validar RUT apoderado y alumnos |
| POST | `/api/registro/admin` | Registrar administrador |
| POST | `/api/registro/docente` | Registrar docente |
| POST | `/api/registro/apoderado` | Registrar apoderado |

### Tablas MySQL utilizadas:
1. `tb_usuarios` - Crear credenciales del usuario
2. `tb_codigos_validacion` - Validar codigos de admin
3. `tb_preregistro_docentes` - Preregistros de docentes pendientes
4. `tb_preregistro_relaciones` - Preregistros de apoderados/alumnos
5. `tb_preregistro_docente_asignatura` - Asignaturas del preregistro docente
6. `tb_administradores` - Crear registro de admin
7. `tb_docentes` - Crear registro de docente
8. `tb_apoderados` - Crear registro de apoderado
9. `tb_administrador_establecimiento` - Asociar admin a establecimiento
10. `tb_docente_establecimiento` - Asociar docente a establecimiento
11. `tb_apoderado_establecimiento` - Asociar apoderado a establecimiento
12. `tb_docente_asignatura` - Asignaturas del docente
13. `tb_apoderado_alumno` - Relacion apoderado-alumno
14. `tb_alumnos` - Verificar existencia de alumnos
15. `tb_establecimientos` - Datos del establecimiento

### Estado: CONECTADO

---

## 3. PAGINA ADMINISTRADOR

### Archivo principal: `src/components/admin/AdminPage.jsx`

### Pestanas disponibles:

#### 3.1 Gestion de Alumnos (`AlumnosTab`)
**Archivo:** `src/components/AlumnosTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/alumnos` | Listar alumnos |
| GET | `/api/alumnos/:id` | Obtener alumno por ID |
| POST | `/api/alumnos` | Crear alumno |
| POST | `/api/alumnos/con-apoderado` | Crear alumno + preregistro apoderado |
| PUT | `/api/alumnos/:id` | Actualizar alumno |
| DELETE | `/api/alumnos/:id` | Eliminar alumno (soft delete) |

**Tablas:**
1. `tb_alumnos`
2. `tb_alumno_establecimiento`
3. `tb_cursos`
4. `tb_preregistro_relaciones`
5. `tb_log_actividades`

---

#### 3.2 Cuerpo Docente (`DocentesTab`)
**Archivo:** `src/components/DocentesTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/docentes` | Listar docentes |
| POST | `/api/docentes/agregar` | Agregar docente (o preregistro) |
| DELETE | `/api/docentes/:id` | Eliminar docente |

**Tablas:**
1. `tb_docentes`
2. `tb_docente_establecimiento`
3. `tb_usuarios`
4. `tb_preregistro_docentes`
5. `tb_preregistro_docente_asignatura`
6. `tb_docente_asignatura`
7. `tb_asignaturas`

---

#### 3.3 Cargas Academicas / Asignaciones (`AsignacionesTab`)
**Archivo:** `src/components/AsignacionesTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/asignaciones` | Listar asignaciones |
| GET | `/api/asignaciones/docentes-disponibles` | Docentes para asignar |
| POST | `/api/asignaciones` | Crear asignacion |
| DELETE | `/api/asignaciones/:id` | Eliminar asignacion |

**Tablas:**
1. `tb_docente_curso`
2. `tb_docentes`
3. `tb_cursos`
4. `tb_asignaturas`
5. `tb_docente_asignatura`
6. `tb_docente_establecimiento`

---

#### 3.4 Sabana de Notas (`NotasPorCursoTab`)
**Archivo:** `src/components/NotasPorCursoTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/notas/curso/:cursoId` | Notas de un curso |
| GET | `/api/notas/curso/:cursoId/sabana` | Sabana completa de notas |

**Tablas:**
1. `tb_notas`
2. `tb_alumnos`
3. `tb_alumno_establecimiento`
4. `tb_asignaturas`
5. `tb_cursos`

---

#### 3.5 Control Asistencia (`AsistenciaTab` - Admin)
**Archivo:** `src/components/AsistenciaTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/asistencia/curso/:cursoId` | Asistencia por curso |
| GET | `/api/asistencia/curso/:cursoId/mes/:mes` | Asistencia mensual |
| PUT | `/api/asistencia/:id` | Actualizar asistencia |

**Tablas:**
1. `tb_asistencia`
2. `tb_alumnos`
3. `tb_alumno_establecimiento`
4. `tb_cursos`

---

#### 3.6 Central de Avisos / Comunicados (`ComunicadosTab` - Admin)
**Archivo:** `src/components/ComunicadosTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/comunicados` | Listar comunicados |
| POST | `/api/comunicados` | Crear comunicado |
| PUT | `/api/comunicados/:id` | Actualizar comunicado |
| DELETE | `/api/comunicados/:id` | Eliminar comunicado |

**Tablas:**
1. `tb_comunicados`
2. `tb_comunicado_curso`
3. `tb_comunicado_leido`
4. `tb_cursos`

---

#### 3.7 Metricas de Gestion / Estadisticas (`EstadisticasTab`)
**Archivo:** `src/components/EstadisticasTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/estadisticas/generales` | Estadisticas generales |
| GET | `/api/estadisticas/rendimiento` | Rendimiento academico |
| GET | `/api/estadisticas/asistencia` | Estadisticas de asistencia |

**Tablas:**
1. `tb_alumnos`
2. `tb_docentes`
3. `tb_notas`
4. `tb_asistencia`
5. `tb_cursos`
6. `tb_asignaturas`

---

## 4. PAGINA DOCENTE

### Archivo principal: `src/components/docente/DocentePage.jsx`

### Pestanas disponibles:

#### 4.1 Agregar Nota (`AgregarNotaTab`)
**Archivo:** `src/components/docente/AgregarNotaTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/docente/:docenteId/cursos` | Cursos del docente |
| GET | `/api/cursos/:cursoId/alumnos` | Alumnos del curso |
| POST | `/api/notas/registrar` | Registrar nota |

**Tablas:**
1. `tb_notas`
2. `tb_docente_curso`
3. `tb_alumnos`
4. `tb_alumno_establecimiento`
5. `tb_asignaturas`
6. `tb_cursos`

**Campos importantes en tb_notas:**
- `es_pendiente` (TINYINT) - Marca si la nota esta pendiente
- `comentario` (TEXT) - Comentario del docente sobre la nota

---

#### 4.2 Modificar Nota (`ModificarNotaTab`)
**Archivo:** `src/components/docente/ModificarNotaTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/notas/docente/:docenteId/curso/:cursoId` | Notas del docente en curso |
| PUT | `/api/notas/:id` | Actualizar nota |
| DELETE | `/api/notas/:id` | Eliminar nota |

**Tablas:**
1. `tb_notas`
2. `tb_docente_curso`
3. `tb_alumnos`
4. `tb_asignaturas`

---

#### 4.3 Ver Notas (`VerNotasTab`)
**Archivo:** `src/components/docente/VerNotasTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/notas/docente/:docenteId/curso/:cursoId/sabana` | Sabana de notas |

**Tablas:**
1. `tb_notas`
2. `tb_alumnos`
3. `tb_alumno_establecimiento`
4. `tb_asignaturas`
5. `tb_cursos`

---

#### 4.4 Asistencia (`AsistenciaTab` - Docente)
**Archivo:** `src/components/docente/AsistenciaTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/asistencia/curso/:cursoId/fecha/:fecha` | Asistencia del dia |
| POST | `/api/asistencia` | Registrar asistencia individual |
| POST | `/api/asistencia/masiva` | Registrar asistencia masiva |

**Tablas:**
1. `tb_asistencia`
2. `tb_alumnos`
3. `tb_alumno_establecimiento`
4. `tb_cursos`
5. `tb_docente_curso`

---

#### 4.5 Progreso (`ProgresoTab` - Docente)
**Archivo:** `src/components/docente/ProgresoTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/docente/:docenteId/estadisticas` | Estadisticas del docente |

**Tablas:**
1. `tb_notas`
2. `tb_asistencia`
3. `tb_docente_curso`
4. `tb_alumnos`
5. `tb_cursos`
6. `tb_asignaturas`

---

## 5. PAGINA APODERADO

### Archivo principal: `src/components/apoderado/ApoderadoPage.jsx`

### Pestanas disponibles:

#### 5.1 Informacion del Pupilo (`InformacionTab`)
**Archivo:** `src/components/apoderado/InformacionTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/apoderado/pupilo/:alumnoId` | Datos del pupilo |

**Tablas:**
1. `tb_alumnos`
2. `tb_alumno_establecimiento`
3. `tb_cursos`
4. `tb_establecimientos`

### Estado: CONECTADO

---

#### 5.2 Libro de Calificaciones (`NotasTab`)
**Archivo:** `src/components/apoderado/NotasTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/apoderado/pupilo/:alumnoId/notas` | Notas del pupilo |

**Tablas:**
1. `tb_notas`
2. `tb_asignaturas`

**Funcionalidades:**
- Muestra tabla con 8 columnas por trimestre (N1-N8)
- Calcula promedios por trimestre (PT1, PT2, PT3)
- Calcula promedio final por asignatura
- Popup al hacer clic en nota muestra: nota, asignatura, fecha, comentario
- Mensaje "No hay comentarios" si no tiene comentario

### Estado: CONECTADO

---

#### 5.3 Comunicados (`ComunicadosTab` - Apoderado)
**Archivo:** `src/components/apoderado/ComunicadosTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/apoderado/pupilo/:alumnoId/comunicados` | Comunicados del curso |
| POST | `/api/apoderado/comunicado/:comunicadoId/marcar-leido` | Marcar como leido |

**Tablas:**
1. `tb_comunicados`
2. `tb_comunicado_curso`
3. `tb_comunicado_leido`
4. `tb_alumno_establecimiento`

**Funcionalidades:**
- Filtro por fecha desde/hasta
- Filtro por tipo de comunicado
- Vista desktop: dos columnas (mes actual / meses anteriores)
- Vista movil: lista unica ordenada por fecha
- Marca automatica como leido al expandir

### Estado: CONECTADO

---

#### 5.4 Progreso Academico (`ProgresoTab` - Apoderado)
**Archivo:** `src/components/apoderado/ProgresoTab.jsx`

**Endpoints:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/apoderado/pupilo/:alumnoId/progreso` | Estadisticas de progreso |

**Tablas:**
1. `tb_notas`
2. `tb_asistencia`
3. `tb_asignaturas`

**Datos retornados por el endpoint:**
- `estadisticas`: totalNotas, promedio, notaMaxima, notaMinima, aprobadas, reprobadas, porcentajeAprobacion
- `asistencia`: porcentaje, diasPresente, totalDias
- `promediosPorTrimestre`: {1: x.x, 2: x.x, 3: x.x}
- `promediosPorAsignatura`: {asignatura: promedio}
- `promediosMensuales`: {mes: promedio} (para grafico de linea)
- `asignaturas`: lista de asignaturas

**Funcionalidades:**
- Grafico de linea: rendimiento mensual (Mar-Dic)
- Grafico de barras: promedio por asignatura
- KPIs: promedio, asistencia, total notas, tasa aprobacion, nota maxima, nota minima
- Filtro por asignatura

### Estado: CONECTADO

---

## RESUMEN DE TABLAS POR MODULO

### Tablas de Usuarios y Autenticacion:
1. `tb_usuarios`
2. `tb_sesiones`
3. `tb_administradores`
4. `tb_docentes`
5. `tb_apoderados`
6. `tb_alumnos`

### Tablas de Relaciones:
7. `tb_administrador_establecimiento`
8. `tb_docente_establecimiento`
9. `tb_apoderado_establecimiento`
10. `tb_alumno_establecimiento`
11. `tb_apoderado_alumno`
12. `tb_docente_curso`
13. `tb_docente_asignatura`

### Tablas de Preregistro:
14. `tb_codigos_validacion`
15. `tb_preregistro_docentes`
16. `tb_preregistro_docente_asignatura`
17. `tb_preregistro_relaciones`

### Tablas Academicas:
18. `tb_establecimientos`
19. `tb_cursos`
20. `tb_asignaturas`
21. `tb_notas`
22. `tb_asistencia`

### Tablas de Comunicacion:
23. `tb_comunicados`
24. `tb_comunicado_curso`
25. `tb_comunicado_leido`

### Tablas de Auditoria:
26. `tb_log_actividades`

### Tablas de Chat:
27. `tb_chat_conversaciones`
28. `tb_chat_mensajes`

### Tablas de Contacto:
29. `tb_consultas_contacto`

---

## ENDPOINTS DEL SERVIDOR

### Ubicacion: `server/index.js` y `server/routes/`

**Rutas principales:**
- `/api/auth/*` - Autenticacion (auth.js)
- `/api/registro/*` - Registro de usuarios (registro.js)
- `/api/alumnos/*` - Gestion de alumnos
- `/api/docentes/*` - Gestion de docentes
- `/api/cursos/*` - Gestion de cursos
- `/api/asignaturas/*` - Gestion de asignaturas
- `/api/notas/*` - Gestion de notas
- `/api/asistencia/*` - Gestion de asistencia
- `/api/comunicados/*` - Gestion de comunicados
- `/api/apoderado/*` - Endpoints para apoderados
- `/api/asignaciones/*` - Asignaciones docente-curso
- `/api/estadisticas/*` - Estadisticas generales
- `/api/chat/*` - Chat interno (chat.js)
- `/api/contacto/*` - Consultas de contacto (contacto.js)

---

## ESTADO GENERAL DEL PROYECTO

| Modulo | Estado | Observaciones |
|--------|--------|---------------|
| Login | CONECTADO | Funcional con JWT |
| Registro | CONECTADO | Admin, Docente, Apoderado |
| Admin - Alumnos | CONECTADO | CRUD completo |
| Admin - Docentes | CONECTADO | Con preregistro |
| Admin - Asignaciones | CONECTADO | Docente-Curso |
| Admin - Notas por Curso | CONECTADO | Sabana de notas |
| Admin - Asistencia | CONECTADO | Vista mensual |
| Admin - Comunicados | CONECTADO | CRUD + envio |
| Admin - Estadisticas | CONECTADO | Dashboard |
| Docente - Agregar Nota | CONECTADO | Con pendiente y comentario |
| Docente - Modificar Nota | CONECTADO | Edicion y eliminacion |
| Docente - Ver Notas | CONECTADO | Sabana por curso |
| Docente - Asistencia | CONECTADO | Registro diario |
| Docente - Progreso | CONECTADO | Estadisticas propias |
| Apoderado - Informacion | CONECTADO | Datos del pupilo |
| Apoderado - Notas | CONECTADO | Libro de calificaciones |
| Apoderado - Comunicados | CONECTADO | Con filtros |
| Apoderado - Progreso | CONECTADO | Graficos y KPIs |
| Chat Interno | CONECTADO | Docentes y Admin con polling |
| Formulario Contacto | CONECTADO | Desde landing page |

---

## 6. CHAT INTERNO (Docentes y Administradores)

### Archivos involucrados:
- **Frontend:** `src/components/ChatFlotante.jsx`
- **Servicio:** `src/services/chatService.js`
- **Backend:** `server/routes/chat.js`
- **Estilos:** `src/styles/colegio.css`

### Endpoints:
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/chat/contactos` | Lista de contactos (admins primero) |
| GET | `/api/chat/conversaciones` | Conversaciones del usuario |
| GET | `/api/chat/conversacion/:id/mensajes` | Mensajes de una conversacion |
| POST | `/api/chat/conversacion` | Crear o recuperar conversacion |
| POST | `/api/chat/mensaje` | Enviar mensaje |
| PUT | `/api/chat/mensaje/:id/leido` | Marcar mensaje como leido |
| PUT | `/api/chat/conversacion/:id/leer-todos` | Marcar todos como leidos |
| GET | `/api/chat/no-leidos` | Total de mensajes no leidos |
| GET | `/api/chat/nuevos-mensajes` | Polling para tiempo real |

### Tablas MySQL utilizadas:
1. `tb_chat_conversaciones` - Conversaciones entre usuarios
2. `tb_chat_mensajes` - Mensajes de las conversaciones
3. `tb_usuarios` - Identificar tipo de usuario
4. `tb_docentes` - Datos de docentes
5. `tb_administradores` - Datos de administradores
6. `tb_docente_establecimiento` - Docentes del establecimiento
7. `tb_administrador_establecimiento` - Admins del establecimiento

### Reglas del chat:
- Docentes pueden chatear con otros docentes
- Docentes pueden chatear con administradores
- Administradores pueden chatear con docentes
- Apoderados NO tienen acceso al chat
- El administrador siempre aparece primero en la lista de contactos

### Funcionalidades:
- Lista de contactos con foto/inicial
- Indicador de mensajes no leidos
- Polling cada 5 segundos para nuevos mensajes
- Envio optimista de mensajes
- Separadores de fecha (Hoy, Ayer, dd/mm)
- Indicadores de mensaje enviando/error/leido
- Badge de "Admin" en contactos administradores

### Estado: CONECTADO

---

## 7. FORMULARIO DE CONTACTO (Landing Page)

### Archivos involucrados:
- **Frontend:** `src/components/LandingPage.jsx`
- **Componente:** `src/components/landing/ModalContacto.jsx`
- **Boton flotante:** `src/components/landing/FloatingContactButton.jsx`
- **Servicio:** `src/services/contactoService.js`
- **Backend:** `server/routes/contacto.js`
- **Estilos:** `src/styles/landing.css`

### Endpoints:
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/contacto` | Enviar consulta de contacto |
| GET | `/api/contacto` | Obtener consultas (para admin) |
| PUT | `/api/contacto/:id/responder` | Responder consulta |
| PUT | `/api/contacto/:id/estado` | Cambiar estado de consulta |

### Tablas MySQL utilizadas:
1. `tb_consultas_contacto` - Consultas enviadas desde la landing

### Campos de la tabla:
- `nombre_solicitante` - Nombre del solicitante
- `establecimiento` - Nombre del establecimiento
- `telefono` - Telefono de contacto
- `correo` - Correo electronico
- `consulta` - Texto de la consulta
- `estado` - pendiente, en_proceso, respondida, cerrada
- `respuesta` - Respuesta del admin
- `respondido_por` - ID del usuario que respondio
- `fecha_respuesta` - Fecha de respuesta
- `ip_address` - IP del solicitante
- `user_agent` - Navegador del solicitante
- `fecha_envio` - Fecha de envio
- `activo` - Soft delete

### Funcionalidades:
- Modal de contacto accesible desde boton flotante
- Modal de contacto accesible desde modal de planes
- Validacion de campos requeridos
- Estado de "enviando" mientras se procesa
- Mensajes de exito/error visuales
- Cierre automatico tras envio exitoso

### Estado: CONECTADO

---

## PROXIMOS PASOS SUGERIDOS

1. Verificar funcionamiento en modo produccion
2. Pruebas de integracion completas
3. Optimizacion de consultas SQL
4. Implementar cache donde sea necesario
5. Mejorar manejo de errores

---

*Documento generado para tracking de avances del proyecto Portal Estudiantil*
