# Arquitectura y permisos

NestJS es la autoridad de negocio, Prisma sólo vive en API y Next.js consume REST. Todas las rutas llevan `/api/v1`; Swagger queda en `/api/docs`.

| Recurso | Admin | Planner asignado | Asistente asignado | Pareja | Invitado |
|---|---|---|---|---|---|
| Boda/tareas | total | lectura/escritura | según asignación (pendiente granular) | sólo contenido publicado | no |
| Finanzas | total | sólo `canViewFinance` | no | no | no |
| Invitados | total | asignado | pendiente granular | no | sólo su grupo/token |
| RSVP | administra | administra | no | consulta futura | sólo su invitación |

Estados: lead `PROSPECT→QUOTED→CONTRACTED` o `DISCARDED`; boda `PLANNING→CONFIRMED→COMPLETED` o `CANCELLED`. No se debe contratar una boda descartada. Invitación `DRAFT→PUBLISHED→CLOSED`, o `REVOKED` desde cualquier estado. Las transiciones administrativas restantes se implementarán con endpoints auditados.

Endpoints MVP: `POST /auth/login`; `GET|POST /weddings`; `GET /weddings/:id`; `POST /weddings/:id/tasks|groups|obligations`; `POST /weddings/:id/obligations/:obligationId/payments`; `GET /public/invitations/:token`; `POST /public/invitations/:token/rsvp`.
