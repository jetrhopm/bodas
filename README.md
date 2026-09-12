# Aurea · Planeación de bodas

MVP en monorepo: `apps/web` (Next.js App Router) y `apps/api` (NestJS REST). MySQL es la única base de datos soportada; Prisma centraliza persistencia y reglas de acceso.

## Decisiones y alcance

- Fechas de evento se guardan como instantes UTC; la boda conserva IANA timezone y moneda (MXN por defecto).
- Roles: ADMIN global; PLANNER/ASSISTANT por asignación a boda; COUPLE sólo por `coupleUserId`; el invitado usa token opaco de alcance único.
- Implementado: login JWT de 15 min, acceso por boda y rol, portal de pareja, bodas, tareas/comentarios/adjuntos, invitados/CSV/RSVP, agenda, finanzas, proveedores y contrataciones, documentos protegidos, invitación configurable, reportes CSV/PDF y auditoría visible.
- Calidad: pruebas E2E para autenticación, tareas, auditoría, reportes, exportaciones y RSVP público. Ejecutar `npm run test:e2e -w @bodas/api`; prepara datos de demostración en la base de desarrollo configurada.

## Arranque

1. Copia `.env.example` a `apps/api/.env` y define `DATABASE_URL` y un secreto JWT aleatorio de al menos 32 caracteres. Copia `apps/web/.env.local.example` a `apps/web/.env.local`.
2. `npm install --workspaces --include-workspace-root`
3. `npm run prisma:generate -w @bodas/api && npm run prisma:migrate -w @bodas/api -- --name init && npm run prisma:seed -w @bodas/api`
4. En dos terminales: `npm run dev:api` y `npm run dev:web`.

La semilla sólo sirve en desarrollo: `admin@local.test` / `password`; cámbiala o elimínala fuera de desarrollo. RSVP de muestra: `/invitacion/demo-invitacion-segura`. Las pruebas E2E deben ejecutarse únicamente contra una base de desarrollo desechable.

## Reglas relevantes

- El avance es `tareas DONE / tareas no CANCELLED`.
- Un pago usa `idempotencyKey`; se rechaza si excede el saldo. `PAYABLE` y `RECEIVABLE` nunca se convierten automáticamente en ingresos de empresa.
- RSVP acepta 1..pases; rechazo siempre 0. El token SHA-256 nunca se devuelve. Consultar el enlace no escribe asistencia.
- Una asignación se verifica en el servidor, no sólo en la interfaz. La pareja no puede ver finanzas porque `WeddingAccess` exige permisos financieros explícitos.

## Despliegue Hostinger (pendiente de validación en la cuenta)

Hostinger documenta soporte para Next.js, NestJS y Node 18/20/22/24 en Business; también documenta MySQL como motor disponible y configuración de variables por hPanel. [Guía Node.js](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) y [conexión MySQL](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/).

Topología propuesta: dos aplicaciones Node separadas (`web` para dominio y `api` para `api.`), ambas desde el mismo repositorio con directorio raíz de cada app. Antes de publicar, confirmar en hPanel que permite dos apps para el plan concreto, puerto proporcionado por plataforma, URL de MySQL y versión MySQL compatible con Prisma. Configurar `NODE_ENV=production`, `WEB_ORIGIN=https://dominio`, `NEXT_PUBLIC_API_URL=https://api.dominio/api/v1`, `DATABASE_URL` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. CORS permite sólo el dominio web y el refresh token se entrega como cookie `HttpOnly`/`Secure`. Ejecute `prisma migrate deploy` durante el build/deploy si hPanel permite el comando; si no, aplíquelo desde una máquina autorizada con acceso a la base. Para documentos configure `STORAGE_DRIVER=s3`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` y, para proveedores S3 compatibles, `S3_ENDPOINT`; el modo `local` sólo es adecuado para desarrollo. Quedan por comprobar límites de conexiones, cron y restauración de backups en la cuenta real.
