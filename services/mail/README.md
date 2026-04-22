# Mail Service

AtalayaX mantiene el correo separado del backend principal.

Entorno actual:
- `docker-compose.yml` usa `Mailpit` para desarrollo local.
- Permite probar SMTP y ver mensajes en `http://localhost:8025`.

Evolución recomendada:
- Sustituir `Mailpit` por `Mailu` cuando se necesite envío y recepción completos con IMAP/SMTP real.
- Mantener el backend como consumidor del servicio, nunca como host del correo.
