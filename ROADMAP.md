# AtalayaX Roadmap

Documento de seguimiento por fases para construir AtalayaX con separación estricta entre frontend, backend y servicio de correo.

## Cómo usar este archivo

- Marca una tarea completada cambiando `- [ ]` por `- [x]`.
- Si una tarea cambia de alcance, edita su texto en lugar de duplicarla.
- Añade nuevas tareas dentro de la fase correcta para mantener trazabilidad.
- Mantén este archivo como referencia de avance técnico, no como documento comercial.

## Estado global

- [x] Base monorepo creada
- [x] Separación inicial entre frontend, backend y correo
- [x] Docker Compose de desarrollo inicial
- [ ] Autenticación segura implementada
- [ ] RBAC real implementado
- [ ] Persistencia real implementada
- [ ] Ingesta XLS/CSV implementada
- [ ] Dashboard funcional conectado a datos reales
- [ ] Correo integrado con flujos reales
- [ ] Despliegue endurecido para producción

## Fase 0. Fundaciones del proyecto

Objetivo: dejar una base limpia, mantenible y preparada para crecer sin acoplamientos.

- [x] Crear estructura monorepo
- [x] Separar `apps/frontend`, `apps/backend`, `packages/types` y `services/mail`
- [x] Añadir configuración TypeScript base compartida
- [x] Definir contratos compartidos iniciales
- [x] Crear documentación mínima de arranque
- [ ] Definir convención de nombres y estructura de módulos
- [ ] Añadir estrategia de linting y formateo
- [ ] Añadir estrategia de testing por capa

## Fase 1. Frontend base

Objetivo: dejar una aplicación web limpia, escalable y desacoplada del dominio interno del backend.

- [x] Crear base Next.js
- [x] Añadir layout global y estilos base
- [x] Separar componentes de presentación
- [x] Crear cliente API independiente
- [ ] Crear sistema de diseño base reutilizable
- [ ] Definir estructura de rutas públicas y privadas
- [ ] Crear página de login real
- [ ] Crear shell de dashboard autenticado
- [ ] Crear manejo de estado de sesión en frontend
- [ ] Añadir gestión uniforme de errores y estados de carga

## Fase 2. Backend base

Objetivo: concentrar la lógica de negocio en una API modular, validada y preparada para evolucionar por dominios.

- [x] Crear base Fastify modular
- [x] Añadir configuración validada por entorno
- [x] Crear módulo de health
- [x] Crear módulo inicial de auth
- [x] Crear módulo inicial de dashboard
- [ ] Añadir capa de servicios de dominio real
- [ ] Añadir repositorios y acceso a datos
- [ ] Añadir middleware de errores consistente
- [ ] Añadir logging estructurado por contexto
- [ ] Añadir versionado de API

## Fase 3. Seguridad y autenticación

Objetivo: implementar un login robusto con buenas prácticas reales, sin simplificaciones inseguras.

- [ ] Implementar almacenamiento de usuarios en base de datos
- [ ] Implementar hash de contraseñas con Argon2id
- [ ] Implementar login real contra persistencia
- [ ] Elegir estrategia de sesión segura
- [ ] Configurar cookies `HttpOnly`, `Secure` y `SameSite` si aplica
- [ ] Añadir expiración y rotación de sesión
- [ ] Añadir protección CSRF si se usan cookies
- [ ] Añadir rate limiting para login
- [ ] Añadir auditoría de autenticación y eventos críticos
- [ ] Añadir política de secretos por entorno

## Fase 4. Roles y permisos

Objetivo: aplicar autorización real por recurso y por acción.

- [ ] Definir matriz de permisos por rol
- [ ] Implementar roles iniciales `admin`, `analyst`, `operator`
- [ ] Añadir guards o middleware RBAC en backend
- [ ] Restringir endpoints por permiso
- [ ] Adaptar navegación y vistas en frontend según rol
- [ ] Añadir trazabilidad de cambios de rol

## Fase 5. Persistencia y modelo de datos

Objetivo: soportar datos operativos, usuarios, auditoría e histórico de forma consistente.

- [ ] Elegir ORM o estrategia SQL explícita
- [ ] Crear esquema inicial de PostgreSQL
- [ ] Crear migraciones
- [ ] Modelar usuarios, sesiones y roles
- [ ] Modelar alertas y eventos
- [ ] Modelar activos, sensores y series temporales
- [ ] Modelar auditoría y logs de negocio
- [ ] Crear seeds de desarrollo

## Fase 6. Ingesta de datos industriales

Objetivo: permitir carga de históricos y preparar la unificación de datos batch y tiempo real.

- [ ] Diseñar flujo de importación de XLS/CSV
- [ ] Implementar validación de formato de entrada
- [ ] Implementar parsing robusto
- [ ] Normalizar columnas y unidades
- [ ] Registrar errores de importación
- [ ] Guardar metadatos de ficheros importados
- [ ] Crear vista de histórico de importaciones
- [ ] Diseñar contrato para futura ingesta en tiempo real

## Fase 7. Analítica, deriva y anomalías

Objetivo: convertir datos industriales en señales accionables.

- [ ] Definir reglas iniciales de desviación
- [ ] Definir baseline o comportamiento esperado por activo
- [ ] Implementar cálculo de tendencia y deriva
- [ ] Implementar detección básica de anomalías
- [ ] Asignar severidad y prioridad a eventos
- [ ] Exponer resultados analíticos en API
- [ ] Registrar explicaciones mínimas del porqué de una alerta

## Fase 8. Dashboard funcional

Objetivo: ofrecer valor operativo real tras autenticación.

- [ ] Crear vista de resumen global
- [ ] Crear vista por rol `admin`
- [ ] Crear vista por rol `analyst`
- [ ] Crear vista por rol `operator`
- [ ] Mostrar métricas principales
- [ ] Mostrar alertas activas
- [ ] Mostrar tendencias e históricos
- [ ] Mostrar estados anómalos y deriva detectada
- [ ] Añadir filtros por activo, planta y rango temporal

## Fase 9. Correo desacoplado

Objetivo: tener un servicio de correo separado del backend principal, pero integrado funcionalmente con el producto.

- [x] Añadir SMTP de desarrollo en Docker Compose
- [ ] Decidir paso a Mailu para entorno completo
- [ ] Diseñar integración backend <-> servicio de correo
- [ ] Implementar envío de alertas por correo
- [ ] Implementar recepción o sincronización de mensajes
- [ ] Crear bandeja básica en dashboard
- [ ] Definir permisos de acceso al buzón
- [ ] Registrar trazabilidad de envíos críticos

## Fase 10. Calidad y observabilidad interna

Objetivo: asegurar mantenibilidad, testabilidad y capacidad de diagnóstico.

- [ ] Añadir tests unitarios de frontend
- [ ] Añadir tests unitarios de backend
- [ ] Añadir tests de integración de API
- [ ] Añadir tests de flujos de auth
- [ ] Añadir tests de importación XLS/CSV
- [ ] Añadir métricas y healthchecks ampliados
- [ ] Añadir logging correlacionado por request
- [ ] Añadir tracing básico entre servicios

## Fase 11. Despliegue y endurecimiento

Objetivo: preparar el paso de entorno local a entorno serio.

- [ ] Separar configuración `dev`, `staging` y `prod`
- [ ] Añadir reverse proxy
- [ ] Forzar HTTPS en despliegue
- [ ] Aislar secretos fuera del repositorio
- [ ] Añadir backups y política de restauración
- [ ] Añadir política de rotación de credenciales
- [ ] Añadir pipeline CI/CD
- [ ] Definir estrategia de despliegue de correo

## Próximas tareas recomendadas

- [ ] Implementar persistencia real en backend
- [ ] Implementar login seguro con Argon2id y sesión
- [ ] Crear pantalla de login en frontend
- [ ] Crear modelo RBAC inicial
- [ ] Sustituir mocks de dashboard por datos persistidos
