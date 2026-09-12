# Validación antes de producción

## Móvil y navegador

- Abrir inicio de sesión, panel, invitación y portal de pareja en 375 px, 768 px y 1440 px.
- Confirmar RSVP, carga/descarga de documento, pago y envío de invitación.
- Verificar que una cuenta de pareja no abra Finanzas, Documentos ni Reportes.

## Apache/XAMPP

- Iniciar API y Next.js, reiniciar Apache y ejecutar `powershell -ExecutionPolicy Bypass -File scripts/check-production.ps1`.
- Repetir desde un teléfono en la misma red con la IP local; comprobar que `/bodas/api/v1/health/ready` responda 200.

## Hostinger y respaldos

- Configurar MySQL, secretos, SMTP/Twilio y almacenamiento S3 antes de desplegar.
- Ejecutar `prisma migrate deploy` una vez por publicación.
- Programar respaldo diario de MySQL desde hPanel y retenerlo fuera de la cuenta de producción.
- Monitorizar `GET /api/v1/health` y `GET /api/v1/health/ready`; una respuesta distinta de 200 debe alertar al equipo.
