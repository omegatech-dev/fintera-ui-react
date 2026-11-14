# Vendedores, asignaciones, score y migración de históricos

Resumen de los cambios hechos en el diseño y de la lógica a implementar.
Complementa `./implementation-map.md`; no reemplaza el spec funcional.

- **Documento de diseño:** `./fintera-redesign.pen` (back office admin/vendedor)
  y `fintera-landing.pen` (portal del cliente, en `.pencil/documents`).
- Tokens: primario `#15803D`, acento verde `#16A34A`, tinta `#0F172A`,
  texto secundario `#64748B`, borde `#E5E9F0`, tipografía Inter.
- Chips existentes: success (`#DCFCE7`), warning (`#FEF3C7`), danger (`#FEE2E2`),
  info (`#DBEAFE`), neutral (`#E2E8F0`).

---

## 1. Actores

| Actor | Puede |
| --- | --- |
| Cliente | Reservar, indicar si lo atendió un vendedor (o pedir asignación automática). **Nunca ve comisión, score ni origin.** |
| Vendedor | Compartir su enlace, aceptar/rechazar asignaciones, dar seguimiento, cargar clientes históricos, ver su score y comisiones. |
| Admin | Configurar reglas (tasa, plazo de aceptación), editar score de un vendedor, validar registros históricos, ver todo. |

---

## 2. Modelo de datos propuesto

**Seller (extiende el usuario con rol `seller`)**
- `referral_guid` (UUID opaco) → URL `{CUSTOMER_PORTAL_URL}/r/{referral_guid}` + QR.
- `commission_rate` (default 5%, con excepción por vendedor).
- `score` (0–100, derivado) y `score_level` (`high|medium|low`).
- `score_override` + `score_override_reason/by/at` (ajuste manual del admin).
- `score_metrics`: `accepted_count`, `expired_count`, `window_days` (90).

**Reservation (campos nuevos)**
- `seller_id` (nullable), `assignment_origin` (`referral|manual|automatic|historical|none`).
- `assignment_status` (`pending|accepted|rejected|expired|none`),
  `assigned_at`, `accept_deadline_at`, `responded_at`.
- `attribution`: `referral_slug`, `first_visit_at`, `last_visit_at`.

**Commission (campos nuevos)**
- `origin` (`referral|direct|historical`), `accrual_date` (= fecha de la venta,
  no la de captura), `seller_id`, `rate`, `amount`, `status`.

**HistoricalSale (nuevo)**
- Cliente: `full_name`, `identity`, `phone`, `email`.
- Venta: `project_name` (texto libre), `lot_label`, `area_m2`, `sale_price`,
  `sale_date`, `payment_mode` (cash|financed), `sale_status`
  (deeded|paid|installments), `installments_paid`.
- Comisión: `rate`, `amount`, `commission_status` (paid|pending).
- `evidence_file` (opcional), `is_historical = true`,
  `validation_status` (`pending|validated|rejected`), `created_by`, timestamps.

---

## 3. Reglas de negocio

### 3.1 Enlace de referido
1. Cada vendedor tiene una URL pública y un QR descargable (copiar / compartir).
2. Toda visita a `/r/{slug}` se registra (`referral.visit`), con ventana de
   atribución configurable (propuesta: 30 días, última interacción gana).
3. Si la reserva se crea con atribución vigente → `seller_id` = dueño del enlace,
   `assignment_origin = referral` y **se autoasigna** (sin paso de aceptación).
4. La comisión se calcula al crear la reserva: `rate × precio del lote`.

### 3.2 Asignación de vendedor (cliente sin enlace)
1. En el paso de reserva se pregunta **“¿Un vendedor te atendió?”** con la lista
   de vendedores y la opción **“No me atendió nadie → asignar automáticamente”**.
   El cliente puede omitir la pregunta.
2. Eligió vendedor → `assignment_origin = manual`, `assignment_status = pending`.
3. Omitió → `assignment_origin = automatic`, `assignment_status = pending`.
   Selección automática: candidatos con `score_level != low`, priorizando verde
   y menor carga de asignaciones pendientes (round-robin ponderado por score).
4. Toda asignación `pending` genera notificación al vendedor y fija
   `accept_deadline_at = now + assignment_window` (configurable; default 2 h).
5. **Aceptar** → `accepted`; la reserva entra a su cartera, habilita seguimiento
   y la comisión queda comprometida.
6. **Rechazar** o **no responder** al vencer → `expired`; el vendedor pierde la
   comisión de esa venta, el evento cuenta negativo en su score y la reserva
   continúa su curso (reasignar al siguiente candidato o quedar sin vendedor,
   ver decisiones abiertas).
7. La reserva nunca se bloquea ni se invalida por una asignación expirada.

### 3.3 Score de aceptación (0–100%)
- Cálculo: `accepted / (accepted + expired)` en ventana de 90 días.
- Niveles: **verde ≥ 85**, **amarillo 60–84** (no está aceptando ciertas reservas
  para seguimiento → recibe menos asignaciones automáticas),
  **rojo < 60** (no recibe automáticas; requiere revisión del admin).
- Se recalcula cada noche; una asignación expirada baja el score.
- El admin puede sobrescribir el valor (queda auditado con motivo y fecha).
- **Nunca visible para el cliente**; visible en `07b`, `07c`, `22` y como KPI en
  el panel del vendedor (`21d`).

### 3.4 Clientes históricos (migración)
1. El vendedor registra clientes/ventas antiguas sin pasar por proyectos,
   lotes ni reservas.
2. Un registro histórico **no crea reserva, no bloquea lote, no altera
   disponibilidad y no afecta el score**.
3. La comisión se registra con la fecha real de la venta y `origin = historical`.
4. El cliente aparece en “Mis clientes” con la etiqueta **HISTÓRICO** y el estado
   `Histórico · por validar` hasta que el admin lo valide.
5. Carga masiva por CSV con validación previa: filas inválidas se omiten y se
   reportan; duplicados por identidad se omiten si el toggle está activo.

---

## 4. Estados

**Asignación:** `none → pending → accepted | rejected | expired`
(`accepted` es final; `expired` puede generar una nueva asignación).

**Registro histórico:** `pending → validated | rejected`.

**Comisión:** `accrued → pending → paid` (o `cancelled` si la reserva cae).

**Notificaciones (campanita):** asignación pendiente con contador, asignación
expirada, cobro registrado. La campanita muestra badge de no leídas.

---

## 5. Pantallas (fintera-redesign.pen)

| Frame | Ubicación (x, y) | Contenido |
| --- | --- | --- |
| `05d - Reserva` | 6167, 3502 | Reserva con bloque “¿Un vendedor te atendió?” (3 opciones + buscar + hint), cliente, notas y rail con resumen, lote y **vendedor asignado**. Consolidó el antiguo `05h`. |
| `05f - Recorrido reserva` | 8386, 3502 | Recorrido de 3 pasos con fila de vendedor asignado. |
| `05i - Estados de asignación` | 6167, 5810 | Pendiente (contador `01:59:12` + Aceptar/Rechazar), Aceptada (comisión), Expirada (sin comisión). |
| `07b - Usuario formulario` | 1520, 4907 | Tarjeta **Score de aceptación** en el rail: badge + input editable + reglas de color. |
| `07c - Usuario detalle` | 4593, 4907 | Score de solo lectura: badge, barra, “12 de 13 aceptadas · 90 días”, autor del ajuste + Editar. |
| `21 - Vendedor` | 0, 9785 | Mi día (sin cambios de asignaciones) + tarjeta de enlace y reservas atribuidas. |
| `21b - Vendedor clientes` | 1537, 9785 | Botones **Importar CSV** / **Agregar cliente** y fila con chip **HISTÓRICO**. |
| `21d - Vendedor comisiones` | 4577, 9785 | Tabla con columna **ORIGEN** (Enlace / Directo / Histórico) y KPI **Score de aceptación**. |
| `21f - Vendedor enlace de referido` | 3057, 10918 | URL, copiar/WhatsApp, QR, métricas, cómo funciona, reglas y tabla de reservas atribuidas. |
| `21g - Notificación de asignación` | 4657, 10918 | Campanita con badge + dropdown: asignación con contador y Aceptar/Rechazar, notificación expirada, cobro. |
| `21h - Vendedor cliente histórico` | 5257, 10918 | Formulario de migración manual (cliente, venta, comisión, respaldo) + “qué pasa al guardar”. |
| `21i - Importar clientes históricos` | 6837, 10918 | Panel CSV: dropzone/plantilla, toggles, mapeo de columnas, resumen de filas válidas/errores. |
| `22 - Admin comisiones` | 0, 10918 | Tabla con badge de score junto al vendedor. |
| `22b - Reglas de comisión` | 1537, 10918 | Tasa por defecto, regla de pago, **“Tiempo para aceptar la asignación = 2 horas”**, excepciones. |
| `22c - Score de vendedor` | 1537, 11690 | Especificación de los 3 niveles, umbrales, cálculo y componentes `Score / Alto · Medio · Bajo`. |

En `fintera-landing.pen` (portal del cliente): landing, `Proyectos · Directorio`,
`Proyecto · Detalle y plano`, `Reserva · 1 Financiamiento`, `Reserva · 2
Solicitante`, `Reserva · 3 Pago`, `Reserva · Seguimiento`.

---

## 6. Configuración (admin, `22b`)

- Tasa por defecto (5%), excepciones por vendedor, regla de pago.
- **Ventana para aceptar la asignación** (default 2 h).
- Umbrales del score (85 / 60) — actualmente fijos en el diseño.
- Ventana de atribución del enlace (propuesta 30 días).

---

## 7. Eventos / notificaciones

`referral.visit`, `assignment.created`, `assignment.accepted`,
`assignment.rejected`, `assignment.expired`, `historical.created`,
`historical.validated`, `commission.accrued`.

Canales: in-app (campanita) siempre; email/WhatsApp a definir.

---

## 8. Visibilidad de datos sensibles

| Dato | Cliente | Vendedor | Admin |
| --- | --- | --- | --- |
| Score del vendedor | ✗ | ✓ (propio) | ✓ (editable) |
| % y monto de comisión | ✗ (se muestra “Tasa 0% · Sin cargos adicionales”) | ✓ | ✓ |
| Origen de la asignación | ✗ | ✓ | ✓ |
| Históricos por validar | ✗ | ✓ | ✓ |

---

## 9. Decisiones resueltas e implementación

Resueltas con el usuario:

1. Al expirar una asignación, **se reasigna** al siguiente candidato en una tarea de background; la reserva nunca se bloquea.
2. Selección automática: **verde → amarillo → rojo excluido**, menor carga, rotación por nivel y desempate aleatorio.
3. Vendedor sin historial: **100% / verde**, etiquetado "Nuevo".
4. Ventana de atribución: **30 días**, última interacción gana.
5. Comisiones históricas **suman a los KPIs** con su fecha real.
6. Estados de asignación: **`pending → accepted | expired`** ("Rechazar" es expiración inmediata).

Implementación: cambio OpenSpec `seller-referrals-and-assignments` en FinteraUI y
FinteraAPI. La ventana de aceptación es configurable (`22b`) y se persiste; la
comisión se recalcula al asignar; el cliente no recibe comisión/origen/estado de
asignación; la cartera del vendedor incluye solo asignaciones aceptadas.

