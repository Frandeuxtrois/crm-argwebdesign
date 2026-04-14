-- ============================================================
-- CRM Argentina Webdesign — Schema completo
-- Pegar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================
-- Arquitectura: multi-tenant desde el día 0
-- Todas las tablas del negocio tienen workspace_id y deleted_at
-- ============================================================


-- ============================================================
-- TABLA: workspaces
-- Unidad de aislamiento de datos. Cada usuario tiene uno.
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre             TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  plan_suscripcion   TEXT NOT NULL DEFAULT 'solo'
                     CHECK (plan_suscripcion IN ('solo', 'pro', 'agency')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ
);

-- ============================================================
-- TABLA: workspace_members
-- Relación entre usuarios de auth.users y workspaces.
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol          TEXT NOT NULL DEFAULT 'owner'
               CHECK (rol IN ('owner', 'admin', 'member')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

-- ============================================================
-- TABLA: audit_log
-- Historial de cambios en el sistema (crear, editar, borrar).
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entidad      TEXT NOT NULL,   -- "cliente", "proyecto", "pago", etc.
  entidad_id   UUID NOT NULL,
  accion       TEXT NOT NULL    -- "create", "update", "delete"
               CHECK (accion IN ('create', 'update', 'delete')),
  cambios      JSONB,           -- diff: { antes: {...}, despues: {...} }
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre              TEXT NOT NULL,
  marca               TEXT NOT NULL,
  email               TEXT NOT NULL,
  whatsapp            TEXT NOT NULL,
  descripcion_negocio TEXT,
  datos_fiscales      TEXT,
  estado              TEXT NOT NULL DEFAULT 'activo'
                      CHECK (estado IN ('activo', 'inactivo', 'archivado')),
  notas               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  UNIQUE (workspace_id, email)  -- email único por workspace, no global
);

-- ============================================================
-- TABLA: proyectos
-- ============================================================
CREATE TABLE IF NOT EXISTS proyectos (
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  plan          TEXT NOT NULL
                CHECK (plan IN ('express', 'landing', 'economica', 'autogestionable', 'ecommerce_basico', 'ecommerce_full', 'personalizada')),
  precio_total  NUMERIC(12, 2) NOT NULL,
  fecha_inicio  DATE,
  fecha_entrega DATE,
  estado        TEXT NOT NULL DEFAULT 'onboarding'
                CHECK (estado IN ('onboarding', 'en_desarrollo', 'revision', 'entregado', 'pausado')),
  progreso      INT NOT NULL DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  url_proyecto  TEXT,
  notas         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- ============================================================
-- TABLA: pagos
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id     UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL
                  CHECK (tipo IN ('seña', 'saldo', 'total', 'extra')),
  monto           NUMERIC(12, 2) NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente', 'pagado', 'vencido')),
  fecha_emision   DATE,
  fecha_pago      DATE,
  metodo_pago     TEXT,
  comprobante_url TEXT,
  notas           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- ============================================================
-- TABLA: checklist_items
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id      UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  titulo           TEXT NOT NULL,
  descripcion      TEXT,
  categoria        TEXT
                   CHECK (categoria IN ('diseño', 'desarrollo', 'contenido', 'deploy')),
  completado       BOOLEAN NOT NULL DEFAULT FALSE,
  orden            INT NOT NULL DEFAULT 0,
  fecha_completado TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ============================================================
-- TABLA: vencimientos
-- ============================================================
CREATE TABLE IF NOT EXISTS vencimientos (
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  proyecto_id       UUID REFERENCES proyectos(id) ON DELETE SET NULL,
  tipo              TEXT NOT NULL
                    CHECK (tipo IN ('hosting', 'dominio', 'mantenimiento', 'ssl')),
  descripcion       TEXT,
  fecha_vencimiento DATE NOT NULL,
  monto             NUMERIC(12, 2),
  estado            TEXT NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo', 'renovado', 'cancelado')),
  notificado        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- ============================================================
-- TABLA: onboarding
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clientes(id) ON DELETE SET NULL,
  respuestas   JSONB NOT NULL,
  procesado    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id    ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws_id      ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_workspace_id       ON audit_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entidad            ON audit_log(entidad, entidad_id);
CREATE INDEX IF NOT EXISTS idx_clientes_workspace_id        ON clientes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_workspace_id       ON proyectos(workspace_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_cliente_id         ON proyectos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_workspace_id           ON pagos(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pagos_proyecto_id            ON pagos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_checklist_workspace_id       ON checklist_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_checklist_proyecto_id        ON checklist_items(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_vencimientos_workspace_id    ON vencimientos(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vencimientos_fecha           ON vencimientos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_onboarding_workspace_id      ON onboarding(workspace_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_procesado         ON onboarding(procesado);

-- ============================================================
-- ROW LEVEL SECURITY — Activar en todas las tablas
-- ============================================================
ALTER TABLE workspaces       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vencimientos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS
-- Helper: workspace_ids accesibles por el usuario actual
-- ============================================================

-- workspaces: solo los workspaces donde el usuario es miembro
CREATE POLICY "Ver workspaces propios" ON workspaces
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Modificar workspaces propios" ON workspaces
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND rol = 'owner'
    )
  );

-- workspace_members: ver los miembros de tus workspaces
CREATE POLICY "Ver miembros de mis workspaces" ON workspace_members
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- audit_log: ver el log de tus workspaces
CREATE POLICY "Ver audit log de mis workspaces" ON audit_log
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Insertar en audit_log (el servidor lo hace en nombre del usuario)
CREATE POLICY "Insertar en audit log" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- Macro para tablas del negocio (clientes, proyectos, etc.)
-- Política: pertenece a mi workspace + no borrado (soft delete)
-- ============================================================

-- clientes
CREATE POLICY "CRUD clientes de mi workspace" ON clientes
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- proyectos
CREATE POLICY "CRUD proyectos de mi workspace" ON proyectos
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- pagos
CREATE POLICY "CRUD pagos de mi workspace" ON pagos
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- checklist_items
CREATE POLICY "CRUD checklist de mi workspace" ON checklist_items
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- vencimientos
CREATE POLICY "CRUD vencimientos de mi workspace" ON vencimientos
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- onboarding
CREATE POLICY "CRUD onboarding de mi workspace" ON onboarding
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGER: crear workspace automáticamente al registrarse
-- Se ejecuta después de cada INSERT en auth.users
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_slug         TEXT;
  v_nombre       TEXT;
BEGIN
  -- Generar slug a partir del email (parte antes del @, sin caracteres especiales)
  v_slug  := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g'));
  v_nombre := split_part(NEW.email, '@', 1);

  -- Si el slug ya existe, agregarle un sufijo único
  WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = v_slug) LOOP
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  END LOOP;

  -- Crear workspace
  INSERT INTO public.workspaces (nombre, slug)
  VALUES (v_nombre, v_slug)
  RETURNING id INTO v_workspace_id;

  -- Asignar al usuario como owner
  INSERT INTO public.workspace_members (workspace_id, user_id, rol)
  VALUES (v_workspace_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

-- Asociar la función al evento de registro
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
