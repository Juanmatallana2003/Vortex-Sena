# Documento De Cambios - Vortex (Chat Actual)

Fecha de corte: 2026-04-21  
Base del reporte: estado actual del repositorio (`git status`) + cambios solicitados y aplicados durante este chat.

## 1) Resumen ejecutivo

En este ciclo se trabajo en cinco frentes principales:

1. Robustez backend para workspace, columnas, tarjetas y orden persistente.
2. Tiempo real con SSE (stream de eventos + heartbeat + reconexion en frontend).
3. Sistema de notificaciones (backend + frontend + acciones).
4. Mejora de Kanban (DnD con `dnd-kit`, reorder intra/inter columna, soporte touch).
5. UX/UI operativa (asignacion con miembros reales, favoritos consistentes, modal de tarjeta, sidebar/mobile).

## 2) Cambios funcionales implementados

### 2.1 Workspaces: creacion, borrado y defaults

- `POST /api/workspaces` ahora crea columnas por defecto con orden y color:
  - `Por Hacer` (`bg-red-400`) posicion `0`
  - `En Proceso` (`bg-yellow-400`) posicion `1`
  - `Terminadas` (`bg-green-400`) posicion `2`
- `DELETE /api/workspaces/{workspaceId}` se dejo transaccional y robusto:
  - limpieza de favoritos e historial por `workspaceId`
  - luego borrado del workspace
  - respuesta `404` si no existe
  - respuesta `409` por integridad
  - respuesta `500` para fallo interno
  - `204 No Content` en exito
- Se emiten eventos realtime para creacion/actualizacion/eliminacion de workspace.

### 2.2 Columnas y tarjetas

- Se habilito eliminacion de columna desde backend y frontend (`204` en exito).
- Se agrego soporte de posicion para columnas y tarjetas:
  - `BoardColumn.position` (`position_index`)
  - `IssueCard.position` (`position_index`)
  - retorno ordenado estable con `@OrderBy("position ASC, id ASC")`.
- Se mejoro el movimiento manual de tarjetas:
  - soporte `targetIndex` opcional en endpoint de move
  - reorder intra-columna
  - move inter-columna con reindexado en origen y destino
  - persistencia de orden despues de refresh.

### 2.3 Asignacion real de miembros

- Validacion backend para que los assignees pertenezcan al workspace real.
- Si no hay miembros en el workspace, se bloquea asignacion con error claro (`400`).
- Frontend de tarjeta consume miembros reales del espacio y no datos fake.
- Flujo integrado con `View Members`.

### 2.4 Tiempo real (SSE)

- Nuevo endpoint autenticado:
  - `GET /api/events/stream` (`text/event-stream`)
- Servicio de emisores por usuario:
  - suscripcion por usuario OAuth
  - limpieza por `completion`, `timeout`, `error`
  - heartbeat periodico
  - publicacion de eventos para workspace/column/card/favorites/webhook/notificaciones.
- Frontend:
  - `EventSource(..., { withCredentials: true })`
  - listeners por tipo de evento
  - reconexion con backoff exponencial
  - debounce para refresco de datos y evitar tormenta de requests.

### 2.5 Notificaciones premium (backend + frontend)

- Se implemento modulo completo:
  - entidad `Notification`
  - repositorio dedicado
  - DTOs de salida
  - controlador REST (`/api/notifications`)
- Endpoints de notificaciones:
  - listado (`all`/`unread`)
  - foco/prioritarias
  - contador unread
  - marcar leida
  - marcar todas leidas
  - snooze 24h
  - acciones (`open_card`, `assign_me`, `start_now`, `mark_done`, `dismiss`, `snooze_24h`)
- Generacion automatica de notificaciones por eventos reales:
  - invitaciones
  - creacion y actualizacion de tarjetas
  - cambios de estado
  - columna eliminada
  - alertas predictivas programadas.
- Frontend:
  - panel lateral de notificaciones
  - overlay mobile
  - badge unread
  - filtros por scope y acciones de notificacion
  - apertura de tarjeta desde notificacion.

### 2.6 Drag & Drop Kanban (sin rediseño base)

- Migracion tecnica de DnD nativo a `dnd-kit` para robustez touch/mouse:
  - `@dnd-kit/core`
  - `@dnd-kit/sortable`
  - `@dnd-kit/utilities`
- Capacidad implementada:
  - mover entre columnas
  - reordenar dentro de misma columna
  - dropear en columna vacia
  - usar area util de columna (body droppable)
  - mantener scroll interno con comportamiento estable.

### 2.7 UI/UX complementario

- Favoritos con estilo unificado.
- Sidebar y mobile nav ajustados para notificaciones/favoritos.
- Mejoras en modal de detalle de tarjeta y flujo de miembros.
- Correccion de encoding UTF-8 en `KanbanBoard.tsx` (evita error Turbopack por byte invalido).
- Ajuste de `next.config.ts` para fijar `turbopack.root` y reducir warning por lockfiles.

## 3) Inventario exacto de archivos tocados

## 3.1 Archivos creados (nuevos)

- `.vscode/settings.json`
- `BackND/BackND/src/main/java/Vortex/BackND/controller/EventsController.java`
- `BackND/BackND/src/main/java/Vortex/BackND/controller/NotificationController.java`
- `BackND/BackND/src/main/java/Vortex/BackND/models/dtos/NotificationDto.java`
- `BackND/BackND/src/main/java/Vortex/BackND/models/dtos/RealtimeEventDto.java`
- `BackND/BackND/src/main/java/Vortex/BackND/models/entities/Notification.java`
- `BackND/BackND/src/main/java/Vortex/BackND/repositories/NotificationRepository.java`
- `BackND/BackND/src/main/java/Vortex/BackND/services/NotificationService.java`
- `BackND/BackND/src/main/java/Vortex/BackND/services/RealtimeEventService.java`
- `hs_err_pid2560.log`
- `replay_pid2560.log`
- `vortexFT/vortex/components/KanbanBoard.tsx.bak_encoding`

## 3.2 Archivos modificados

- `BackND/BackND/src/main/java/Vortex/BackND/BackNdApplication.java`
- `BackND/BackND/src/main/java/Vortex/BackND/controller/BoardCardController.java`
- `BackND/BackND/src/main/java/Vortex/BackND/controller/BoardColumnController.java`
- `BackND/BackND/src/main/java/Vortex/BackND/controller/UserController.java`
- `BackND/BackND/src/main/java/Vortex/BackND/controller/WebhookController.java`
- `BackND/BackND/src/main/java/Vortex/BackND/controller/WorkspaceController.java`
- `BackND/BackND/src/main/java/Vortex/BackND/models/entities/BoardColumn.java`
- `BackND/BackND/src/main/java/Vortex/BackND/models/entities/IssueCard.java`
- `BackND/BackND/src/main/java/Vortex/BackND/models/entities/Workspace.java`
- `BackND/BackND/src/main/java/Vortex/BackND/repositories/BoardColumnRepository.java`
- `BackND/BackND/src/main/java/Vortex/BackND/repositories/ChangeLogRepository.java`
- `BackND/BackND/src/main/java/Vortex/BackND/repositories/FavoriteSpaceRepository.java`
- `BackND/BackND/src/main/java/Vortex/BackND/repositories/IssueCardRepository.java`
- `BackND/BackND/src/main/java/Vortex/BackND/repositories/WorkspaceMemberRepository.java`
- `BackND/BackND/src/main/java/Vortex/BackND/services/BoardColumnService.java`
- `BackND/BackND/src/main/java/Vortex/BackND/services/IssueCardService.java`
- `BackND/BackND/src/main/java/Vortex/BackND/services/WebhookService.java`
- `BackND/BackND/src/main/resources/application.yml`
- `vortexFT/vortex/api.ts`
- `vortexFT/vortex/app/globals.css`
- `vortexFT/vortex/app/page.tsx`
- `vortexFT/vortex/components/Avatar.tsx`
- `vortexFT/vortex/components/CardDetailModal.tsx`
- `vortexFT/vortex/components/EditColumnModal.tsx`
- `vortexFT/vortex/components/FavoritesMobileOverlay.tsx`
- `vortexFT/vortex/components/FilterMenu.tsx`
- `vortexFT/vortex/components/KanbanBoard.tsx`
- `vortexFT/vortex/components/KanbanCard.tsx`
- `vortexFT/vortex/components/KanbanColumn.tsx`
- `vortexFT/vortex/components/MembersModal.tsx`
- `vortexFT/vortex/components/MobileNav.tsx`
- `vortexFT/vortex/components/NotificationsMobileOverlay.tsx`
- `vortexFT/vortex/components/Sidebar.tsx`
- `vortexFT/vortex/next.config.ts`
- `vortexFT/vortex/package-lock.json`
- `vortexFT/vortex/package.json`
- `vortexFT/vortex/types.ts`

## 3.3 Archivos eliminados

- `hs_err_pid10864.log`
- `hs_err_pid13424.log`
- `replay_pid10864.log`
- `replay_pid13424.log`

## 3.4 Archivos movidos o renombrados

- No se detectaron renombres/movimientos (`git status` no reporta estado `R`).

## 4) Paquetes y configuracion ajustada

- Frontend dependencies agregadas:
  - `@dnd-kit/core`
  - `@dnd-kit/sortable`
  - `@dnd-kit/utilities`
- Configuracion Next:
  - `next.config.ts` con `turbopack.root = process.cwd()`.

## 5) Notas operativas y pendientes tecnicos visibles

- Existen artefactos de crash en raiz (`hs_err*`, `replay*`) de distintos ciclos de ejecucion.
- Existe archivo temporal `vortexFT/vortex/components/KanbanBoard.tsx.bak_encoding` creado durante correccion de encoding.
- El proyecto tiene un volumen alto de cambios sin commit; se recomienda:
  - cortar release por bloques (backend realtime/notificaciones, frontend kanban, cleanup),
  - commitear por modulo para trazabilidad,
  - limpiar artefactos temporales antes de merge final.

---

Si quieres, en el siguiente paso te genero la version 2 de este documento en formato:

1. `CHANGELOG` profesional por version (`v0.1.0 -> v0.2.0`), y  
2. `MIGRATION GUIDE` tecnico para que cualquier dev nuevo entienda exactamente que tocar y como desplegar.
