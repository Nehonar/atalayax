# AtalayaX

Base inicial de AtalayaX con separación explícita entre frontend, backend y servicio de correo.

## Estructura

- `apps/frontend`: interfaz Next.js y cliente API.
- `apps/backend`: API Fastify con módulos por dominio.
- `packages/types`: contratos compartidos entre capas.
- `services/mail`: notas y evolución del servicio de correo.
- `infra/docker`: Dockerfiles de frontend y backend.

## Principios aplicados

- Separación clara de responsabilidades.
- Backend como única capa de lógica de negocio.
- Contratos compartidos para evitar duplicación de tipos.
- Configuración centralizada y validada.
- Estructura modular para evolucionar auth, ingestión, alertas y dashboard sin mezclar capas.

## Arranque

1. Copia `.env.example` a `.env`.
2. Instala dependencias en el workspace.
3. Levanta servicios con `docker compose up --build`.

## SMTP

El compose actual usa `Mailpit` como SMTP local de desarrollo.
Si necesitas envío/recepción real, el siguiente paso natural es migrar a `Mailu` manteniendo el mismo desacoplamiento.
