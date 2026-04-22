# Roadmap Correo Real AtalayaX

Documento de seguimiento para desplegar correo real en `atalayax.com` sin depender de Google Workspace y minimizando el riesgo de acabar en spam.

Uso:
- Marca `[x]` cuando una tarea esté completada.
- Añade fecha, notas o incidencias debajo de cada bloque cuando haga falta.
- No avanzar a la siguiente fase sin validar la anterior.

## Objetivo

Tener un sistema de correo real capaz de:
- enviar emails a clientes desde direcciones como `benito.avar@atalayax.com`
- recibir respuestas reales
- mantener buena entregabilidad
- integrarse después con AtalayaX para bandeja, lectura y envío desde la app

## Decisiones base

- Dominio principal: `atalayax.com`
- Buzón inicial: `benito.avar@atalayax.com`
- Stack recomendado para correo: `Mailu` sobre Docker
- La app AtalayaX no hospeda el correo: consume SMTP/IMAP del servicio mail

---

## Fase 1. Base de infraestructura

### Objetivo

Disponer de dominio, servidor y entorno mínimo estable para desplegar el servicio de correo.

### Checklist

- [ ] Comprar el dominio `atalayax.com`
- [ ] Confirmar quién gestiona el DNS del dominio
- [ ] Contratar un VPS con IP fija pública
- [ ] Confirmar que el proveedor permite tráfico saliente por puerto `25`
- [ ] Confirmar que el proveedor permite configurar `PTR` / reverse DNS
- [ ] Instalar Docker y Docker Compose en el VPS
- [ ] Asegurar acceso SSH con clave y desactivar acceso inseguro
- [ ] Configurar firewall básico del servidor
- [ ] Documentar IP pública, proveedor y credenciales de acceso administrativo

### Validación de salida

- Existe dominio activo
- Existe VPS accesible
- Docker funciona correctamente
- Se puede modificar DNS y reverse DNS

### Notas

-

---

## Fase 2. Despliegue del servidor de correo

### Objetivo

Levantar una plataforma de correo funcional con envío, recepción y administración básica.

### Checklist

- [ ] Elegir versión concreta de `Mailu`
- [ ] Crear estructura de despliegue para el servicio mail
- [ ] Configurar volúmenes persistentes
- [ ] Configurar hostname de correo, por ejemplo `mail.atalayax.com`
- [ ] Configurar certificados TLS
- [ ] Levantar `Mailu` en Docker
- [ ] Crear cuenta admin del sistema de correo
- [ ] Crear buzón `benito.avar@atalayax.com`
- [ ] Verificar acceso al panel admin
- [ ] Verificar acceso al webmail
- [ ] Verificar login IMAP/SMTP del buzón

### Validación de salida

- El sistema de correo arranca sin errores
- Existe al menos un buzón real
- Webmail y autenticación funcionan

### Notas

-

---

## Fase 3. DNS y autenticación del dominio

### Objetivo

Configurar correctamente el dominio para que el correo sea aceptado por otros servidores.

### Checklist

- [ ] Crear registro `A` para `mail.atalayax.com`
- [ ] Crear registro `MX` del dominio apuntando al servidor correcto
- [ ] Configurar `SPF`
- [ ] Configurar `DKIM`
- [ ] Configurar `DMARC`
- [ ] Configurar `PTR` / reverse DNS para la IP
- [ ] Confirmar que `HELO` / hostname del servidor coincide con DNS
- [ ] Verificar que el certificado TLS responde correctamente
- [ ] Verificar que SPF pasa
- [ ] Verificar que DKIM pasa
- [ ] Verificar que DMARC al menos está en modo monitorización

### Validación de salida

- El dominio publica DNS correctos
- Los emails salen autenticados
- La configuración supera validaciones básicas externas

### Notas

-

---

## Fase 4. Pruebas reales de envío y recepción

### Objetivo

Confirmar que el buzón funciona con destinatarios reales fuera de la infraestructura propia.

### Checklist

- [ ] Enviar correo desde `benito.avar@atalayax.com` a una cuenta personal de Gmail
- [ ] Enviar correo desde `benito.avar@atalayax.com` a una cuenta personal de Outlook
- [ ] Comprobar si entra en inbox o spam
- [ ] Responder desde Gmail y verificar recepción
- [ ] Responder desde Outlook y verificar recepción
- [ ] Validar encabezados del mensaje
- [ ] Verificar que SPF, DKIM y DMARC pasan en mensajes reales
- [ ] Revisar logs de entrega y rebote
- [ ] Corregir problemas de reputación o autenticación si aparecen

### Validación de salida

- El buzón envía y recibe con proveedores externos
- Se dispone de evidencia real de entregabilidad inicial

### Notas

-

---

## Fase 5. Calentamiento y reputación

### Objetivo

Reducir la probabilidad de caer en spam antes de usar el sistema con clientes reales.

### Checklist

- [ ] Definir volumen inicial bajo de envíos
- [ ] Evitar envíos masivos durante las primeras semanas
- [ ] Mantener consistencia entre dominio, remitente y contenido
- [ ] Preparar firmas claras y profesionales
- [ ] Evitar enlaces sospechosos y adjuntos innecesarios en la fase inicial
- [ ] Monitorizar spam, rebotes y bloqueos
- [ ] Ajustar política DMARC cuando el dominio esté estable
- [ ] Registrar incidencias de entregabilidad

### Validación de salida

- El dominio mantiene entregabilidad razonable
- No aparecen problemas graves de reputación

### Notas

-

---

## Fase 6. Integración backend con AtalayaX

### Objetivo

Permitir que la app use el correo real mediante SMTP para enviar e IMAP para leer.

### Checklist

- [ ] Definir módulo `mail` en backend
- [ ] Implementar envío por SMTP autenticado
- [ ] Implementar lectura por IMAP
- [ ] Modelar mensajes, carpetas y estados
- [ ] Guardar metadatos relevantes en base de datos
- [ ] Definir permisos por rol
- [ ] Separar correo interno y correo cliente según rol
- [ ] Añadir manejo de errores de envío
- [ ] Añadir logs y trazabilidad
- [ ] Añadir pruebas de integración del módulo mail

### Validación de salida

- El backend puede enviar correos reales
- El backend puede leer bandejas reales
- La lógica de permisos queda centralizada

### Notas

-

---

## Fase 7. UI de correo dentro de AtalayaX

### Objetivo

Crear una experiencia tipo cliente de correo dentro del dashboard.

### Checklist

- [ ] Diseñar ruta dedicada, por ejemplo `/dashboard/mail`
- [ ] Implementar listado de carpetas: `Inbox`, `Sent`, `Drafts`
- [ ] Implementar listado de mensajes
- [ ] Implementar vista de lectura de mensaje
- [ ] Implementar composición de nuevo correo
- [ ] Implementar responder y reenviar
- [ ] Implementar búsqueda y filtros
- [ ] Implementar indicadores de leído/no leído
- [ ] Implementar soporte básico para adjuntos
- [ ] Ajustar UI según permisos de rol

### Validación de salida

- Existe una bandeja usable desde la app
- El usuario puede leer y enviar correos desde AtalayaX

### Notas

-

---

## Fase 8. Hardening y operación

### Objetivo

Mantener el sistema en producción de forma segura y estable.

### Checklist

- [ ] Configurar backups
- [ ] Configurar rotación de logs
- [ ] Configurar alertas de servicio caído
- [ ] Configurar alertas de espacio en disco
- [ ] Configurar alertas de certificados
- [ ] Configurar alertas de colas o rebotes anómalos
- [ ] Revisar políticas anti-spam y anti-abuso
- [ ] Documentar recuperación ante fallo
- [ ] Documentar proceso de alta de nuevos buzones
- [ ] Documentar proceso de rotación de credenciales

### Validación de salida

- El sistema se puede operar sin improvisación
- Hay procedimientos mínimos de mantenimiento y recuperación

### Notas

-

---

## Riesgos principales

- El proveedor VPS puede bloquear correo saliente o limitarlo
- Mala configuración DNS puede romper entregabilidad
- Sin `PTR`, `SPF`, `DKIM` o `DMARC`, la reputación caerá rápido
- Un dominio nuevo necesita calentamiento
- Montar UI de correo antes de validar entregabilidad puede hacer perder tiempo

---

## Prioridad recomendada

Orden estricto de trabajo:

1. Fase 1
2. Fase 2
3. Fase 3
4. Fase 4
5. Fase 5
6. Fase 6
7. Fase 7
8. Fase 8

---

## Estado actual

- [ ] Fase 1 iniciada
- [ ] Fase 2 iniciada
- [ ] Fase 3 iniciada
- [ ] Fase 4 iniciada
- [ ] Fase 5 iniciada
- [ ] Fase 6 iniciada
- [ ] Fase 7 iniciada
- [ ] Fase 8 iniciada

## Registro de avances

### YYYY-MM-DD

- 

