# Validar clientes históricos

Un **cliente histórico** es un cliente y una venta anteriores a que el equipo empezara a usar Fintera. Los vendedores registran estos datos en lugar de crear una reserva, así que no pasan por proyectos, lotes ni el flujo de reservas.

Los registros normalmente empiezan con una **importación CSV**, que no trae respaldo. Después de importar, el vendedor edita cada registro para adjuntar la **foto de respaldo** (contrato, recibo o comprobante de pago). El archivo subido es el documento real: el administrador lo revisa en la cola de validación antes de validar el registro. El respaldo es opcional para migraciones.

Los registros históricos **no crean reserva**, **no bloquean lote**, **no cambian la disponibilidad** y **no afectan el score de aceptación** del vendedor. Sí crean una comisión con la fecha real de la venta.

## Dónde validar

Abre **Comisiones** desde el menú del administrador y selecciona la pestaña **Históricos por validar**. La pestaña muestra el número de registros pendientes.

La pestaña tiene cuatro tarjetas de resumen:

- **Por validar** — registros esperando revisión.
- **Validados** — registros aprobados por un administrador.
- **Rechazados** — registros rechazados por inválidos.
- **Total** — todos los históricos que coinciden con el filtro actual de vendedor/búsqueda.

## Históricos en Usuarios y reservas

Cada cliente histórico queda vinculado a una cuenta de cliente real (`role = user`). Esto significa que:

- El cliente aparece en **Usuarios → Clientes** con un chip **HISTÓRICO**.
- El filtro **Históricos** muestra solo los clientes creados desde ventas migradas.
- El cliente se puede buscar y seleccionar en el asistente de reserva como cliente existente.
- Si el registro histórico no tenía correo, la cuenta usa un correo no entregable. La interfaz muestra **Sin correo** y oculta **Invitar / Reenviar confirmación** hasta que un administrador agregue un correo real desde la edición del usuario.

La cuenta se crea al guardar o importar el registro histórico. Los registros existentes se vinculan con el backfill del despliegue. Validar no crea la cuenta ni la modifica.

## Filtros

- **Buscar** coincide con el nombre del cliente, identidad, teléfono o proyecto.
- **Vendedor** limita la cola a un vendedor.
- **Estado** alterna entre todos, pendientes, validados y rechazados.

Las tarjetas de resumen y la tabla respetan los mismos filtros de vendedor y búsqueda.

## Columnas de la tabla

| Columna | Qué muestra |
| --- | --- |
| **Cliente** | Nombre del cliente y el vendedor que creó el registro. |
| **Fecha de venta** | La fecha real de la venta, no la fecha de carga. |
| **Precio** | El precio registrado por el vendedor. |
| **Tasa** | La tasa de comisión guardada en el registro. |
| **Comisión** | El monto de comisión guardado en el registro. |
| **Respaldo** | Una acción **Ver respaldo** que abre el contrato, recibo o comprobante adjunto, cuando existe. Los registros sin respaldo muestran —. |
| **Estado** | Pendiente, validado o rechazado. |
| **Acciones** | Editar, validar o rechazar. |

## Acciones

### Ver respaldo

Cuando un registro tiene respaldo, la columna **Respaldo** muestra el botón **Ver respaldo**. Abre un panel lateral con el archivo que subió el vendedor:

- Las imágenes se muestran en línea; los PDF se abren en un visor integrado.
- Los registros antiguos con enlace externo abren ese enlace.
- Los registros sin respaldo muestran un estado vacío **Sin respaldo**.
- **Descargar** guarda el archivo como `respaldo-<id>.<extensión>`.

Revisa el respaldo aquí antes de decidir **Validar** o **Rechazar** el registro. El vendedor dueño también puede abrir su respaldo desde la edición del cliente histórico.

### Editar

**Editar** abre el formulario del cliente histórico con los valores guardados. Úsalo para corregir los datos del cliente, la venta, la tasa o el monto de comisión **antes** de validar.

- Los vendedores pueden editar sus propios registros pendientes desde **Mis clientes**.
- Los administradores pueden editar cualquier registro pendiente.
- Los registros validados son de solo lectura para los vendedores.

### Validar

**Validar** marca el registro como **validado** y lo saca de la cola de pendientes después de refrescar.

Validar **no**:

- Crea una reserva.
- Bloquea ni reserva un lote.
- Cambia la disponibilidad de lotes.
- Recalcula la comisión.
- Cambia el score de aceptación del vendedor.

El registro sigue siendo una venta histórica. Su comisión sigue incluida en los KPIs del periodo con la fecha real de la venta.

### Rechazar

**Rechazar** pide confirmación y marca el registro como **rechazado**. Sale de la cola de pendientes y sigue siendo una venta histórica. Los registros rechazados se excluyen de los totales de comisión.

## Cómo se elige la tasa de comisión histórica

Cuando un vendedor registra una venta histórica, Fintera resuelve la tasa así:

1. La **excepción por vendedor**, cuando el administrador configuró una.
2. De lo contrario, la **tasa global por defecto**.

El formulario precarga esa tasa efectiva y permite cambiarla para ese registro. La tasa y el monto se mantienen consistentes:

- Cambiar la **tasa** o el **precio de venta** recalcula el **monto**.
- Cambiar el **monto** recalcula la **tasa** efectiva.
- Corregir la comisión después de crear el registro es posible con **Editar** mientras esté pendiente.

Validar no recalcula la comisión. Si la tasa o el monto están mal, corrígelos con **Editar** antes de validar.

## Permisos y auditoría

- Solo los administradores acceden a la cola de validación y pueden validar o rechazar registros.
- Los vendedores solo ven sus propios registros históricos.
- Crear, editar, validar y rechazar un registro escribe una entrada de auditoría con el actor, la fecha y el registro. Ver [Auditoría](/docs/audits).

## Relacionado

- [Comisiones y pagos de comisión](/docs/commissions-and-payouts)
- [Mis clientes](/docs/seller-clients)
- [Auditoría](/docs/audits)
