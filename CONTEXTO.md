# CRM Argentina Webdesign — Contexto del Proyecto

## Visión

CRM personal para el negocio de diseño web freelance "Argentina Webdesign".
Construido como single-tenant en uso (solo el dueño) pero multi-tenant en estructura,
para poder convertirlo a SaaS vendible a otros freelancers hispanohablantes
sin reescribir la arquitectura base.

URL final: https://admin.argentinawebdesign.com.ar

## Stack tecnológico

- **Frontend:** Next.js 16 + TypeScript + App Router
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password, un solo usuario admin por ahora)
- **Email:** Resend (Sprint 6)
- **Deploy:** Vercel
- **Dominio:** admin.argentinawebdesign.com.ar

## Decisión arquitectónica: Multi-tenant desde el día 0

Aunque hoy hay un único usuario, todas las tablas del negocio tienen `workspace_id`.
Todas las queries filtran por workspace. Toda eliminación es soft delete.
Esto evita reescribir la base de datos cuando el producto evolucione a SaaS.

**Regla de oro:** nunca asumir que existe un único workspace. Siempre obtener
el workspace_id del usuario autenticado en el servidor.

## Principios de código (siempre respetar)

1. **Filtrar por workspace:** toda query a tablas del negocio DEBE filtrar por
   `workspace_id`. El RLS lo garantiza en Supabase, pero también hacerlo explícito
   en el código del servidor.

2. **Soft delete:** toda eliminación es `UPDATE deleted_at = NOW()`, nunca `DELETE`.
   Las queries normales filtran `WHERE deleted_at IS NULL`.

3. **Audit log:** todo cambio importante (create, update, delete) se registra
   en la tabla `audit_log` con el diff de qué cambió.

4. **Sin hardcodeo de IDs:** nunca hardcodear un workspace_id. Siempre obtenerlo
   del usuario autenticado (`auth.uid()` → `workspace_members` → `workspace_id`).

## Estructura de carpetas (App Router)

```
app/
  (auth)/
    login/           → Página de login
  (admin)/
    layout.tsx       → Layout del panel (sidebar + header), protegido por auth
    dashboard/       → Página principal con métricas
    clientes/        → Listado y detalle de clientes
    proyectos/       → Listado y detalle de proyectos
    pagos/           → Gestión de cobros
    vencimientos/    → Alertas de hosting, dominios, etc.
    onboarding/      → Procesamiento de formularios de nuevos clientes
lib/
  supabase/
    client.ts        → Cliente Supabase para el browser
    server.ts        → Cliente Supabase para Server Components
  workspace.ts       → Helper para obtener workspace_id del usuario actual
components/
  ui/               → Componentes shadcn/ui
  layout/           → Sidebar, Header, etc.
```

## Base de datos — Tablas actuales (9 tablas)

### workspaces
Unidad de aislamiento de datos. Cada usuario tiene un workspace propio.
En el futuro, podrá haber workspaces con múltiples miembros (plan agencia).
- id, nombre, slug (unique), plan_suscripcion (solo/pro/agency)
- created_at, deleted_at (soft delete)

### workspace_members
Relación entre usuarios de Supabase Auth y workspaces.
- id, workspace_id (FK), user_id (FK → auth.users), rol (owner/admin/member)
- created_at | UNIQUE (workspace_id, user_id)
- Trigger: al registrarse un usuario, se crea workspace + member automáticamente

### audit_log
Historial de cambios en el sistema.
- id, workspace_id (FK), user_id (FK → auth.users)
- entidad (texto: "cliente", "proyecto", etc.), entidad_id
- accion ("create", "update", "delete"), cambios (jsonb con el diff)
- created_at

### clientes
Datos de cada cliente del negocio.
- workspace_id (FK), id, nombre, marca, email, whatsapp
- descripcion_negocio, datos_fiscales
- estado (activo/inactivo/archivado), notas
- created_at, deleted_at

### proyectos
Un cliente puede tener múltiples proyectos.
- workspace_id (FK), id, cliente_id (FK)
- nombre, plan (express/basico/pro), precio_total
- fecha_inicio, fecha_entrega
- estado (onboarding/en_desarrollo/revision/entregado/pausado)
- progreso (0-100), url_proyecto, notas
- created_at, deleted_at

### pagos
Pagos asociados a cada proyecto.
- workspace_id (FK), id, proyecto_id (FK)
- tipo (seña/saldo/total/extra), monto
- estado (pendiente/pagado/vencido)
- fecha_emision, fecha_pago, metodo_pago, comprobante_url, notas
- created_at, deleted_at

### checklist_items
Tareas de producción para cada proyecto.
- workspace_id (FK), id, proyecto_id (FK)
- titulo, descripcion, categoria (diseño/desarrollo/contenido/deploy)
- completado (boolean), orden, fecha_completado
- created_at, deleted_at

### vencimientos
Fechas de renovación de servicios por cliente.
- workspace_id (FK), id, cliente_id (FK), proyecto_id (FK, opcional)
- tipo (hosting/dominio/mantenimiento/ssl)
- descripcion, fecha_vencimiento, monto
- estado (activo/renovado/cancelado), notificado
- created_at, deleted_at

### onboarding
Respuestas de formularios de nuevos prospectos.
- workspace_id (FK), id, cliente_id (FK, nullable)
- respuestas (jsonb), procesado (boolean)
- created_at, deleted_at

## Roadmap completo — 3 fases / 14 sprints

### FASE 1 — CRM para mí (meses 1-2)

| Sprint | Qué construimos |
|--------|----------------|
| Sprint 0 | Setup + multi-tenant base ✅ |
| Sprint 1 | Auth + Layout admin |
| Sprint 2 | Clientes (CRUD completo) |
| Sprint 3 | Proyectos + Checklist |
| Sprint 4 | Pagos + Vencimientos |
| Sprint 5 | Formulario público de onboarding |
| Sprint 6 | Automatizaciones (cron, alertas, Resend) |
| Sprint 7 | Dashboard con métricas reales |

### FASE 2 — Expansión (meses 3-4)

| Sprint | Qué construimos |
|--------|----------------|
| Sprint 8 | Plantillas PDF (propuestas, contratos, facturas) |
| Sprint 9 | WhatsApp automatizado (Twilio) |
| Sprint 10 | Módulo de redes sociales (IG/FB/LI/TikTok) |

### FASE 3 — Conversión a SaaS (meses 5-6)

| Sprint | Qué construimos |
|--------|----------------|
| Sprint 11 | Registro público + onboarding de nuevos usuarios |
| Sprint 12 | Planes de suscripción + pasarela de pago |
| Sprint 13 | Landing page de ventas |
| Sprint 14 | Modo agencia (múltiples miembros por workspace) |

## Tablas futuras (documentadas, NO crear todavía)

### Sprint 8 — Documentos
- `templates_documentos` — plantillas de propuestas/contratos/facturas (con variables)
- `documentos_generados` — historial de PDFs generados por workspace

### Sprint 9 — Comunicación
- `mensajes_whatsapp` — log de mensajes enviados via Twilio
- `templates_mensajes` — plantillas reutilizables por tipo de evento

### Sprint 10 — Redes Sociales
- `social_accounts` — cuentas de IG/FB/LI/TikTok vinculadas al workspace
- `social_posts` — posts creados, agendados y publicados
- `social_media_library` — imágenes y videos reutilizables
- `social_analytics` — métricas post-publicación

### Sprint 12 — SaaS
- `subscriptions` — suscripciones activas por workspace (plan, estado, fechas)
- `invoices_saas` — facturas del SaaS hacia el cliente final (distintas a pagos de proyectos)
