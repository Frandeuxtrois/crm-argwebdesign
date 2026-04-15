@AGENTS.md

---

## Technical Log - Supabase RLS Fix (Redirect Loop Issue)
Se resolvió el error de `ERR_TOO_MANY_REDIRECTS` (redirección infinita de `/login` al `/dashboard` y viceversa).
**Causa:**
El código de Next.js estaba sano (`lib/workspace.ts` y `middleware.ts`). El problema nacía en la base de datos: la política RLS original de la tabla `workspace_members` consultaba recursivamente sobre la misma tabla, generando un *Infinite Recursion error* en Postgres:
`[workspace] Error al obtener workspace: infinite recursion detected in policy for relation "workspace_members"`
Al fallar silenciosamente la autenticación por esto, Next.js consideraba la sesión como nula y enviaba de vuelta al inicio.

**Solución aplicada directamente en Supabase (SQL Editor):**
Se reescribió la política defectuosa para que efectúe una lectura lineal comparando el ID del usuario directamente en la fila:
```sql
DROP POLICY IF EXISTS "Ver miembros de mis workspaces" ON workspace_members;
CREATE POLICY "Ver mi propia membresia" ON workspace_members FOR SELECT TO authenticated USING ( user_id = auth.uid() );
```
Con esto, Next.js se conectó con éxito y el Loop desapareció. No revertir este cambio SQL.
