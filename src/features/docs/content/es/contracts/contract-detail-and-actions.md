# Lista, detalle y acciones del contrato

## Lista de contratos

Abre **Contratos** para ver todas las ventas y reservas. La página incluye:

- Una línea de resumen con el total, los aprobados y los pendientes.
- Cuatro tarjetas: total de contratos, pendientes, aprobados y rechazados.
- **Búsqueda** por cliente, contrato o lote; un GUID completo también funciona.
- Chips de estado con conteos para **Todos**, **Aprobados**, **Pendientes** y **Rechazados**.
- Un botón **Filtro** que muestra las fechas de inicio y fin.
- Columnas ordenables, paginación y una acción **Actualizar**.

Cada fila muestra el número de contrato, el cliente y su identidad, el lote y el proyecto, el tipo de financiamiento, el saldo, el estado y la fecha del próximo pago cuando existe.

El menú de la fila ofrece **Ver**. Para contratos aprobados o cerrados también ofrece **Cronograma de pagos** (administradores y personal, no vendedores). Los administradores ven **Aprobar** y **Rechazar** para contratos elegibles, y **Eliminar** para contratos rechazados.

## Detalle del contrato

Selecciona un contrato para abrir su detalle. El encabezado muestra el número de contrato, el chip de estado, el lote, el proyecto, el cliente, **Descargar PDF**, **Registrar pago** (administradores) y un menú de acciones.

Cuatro tarjetas resumen el **valor total**, lo **pagado**, el **saldo** (o crédito a favor) y el **próximo pago**.

El detalle tiene cinco pestañas:

### Resumen

- Aviso de estado con el próximo pago y un resumen corto.
- **Próximos pagos** con fecha, monto y estado.
- **Historial reciente** del libro mayor.
- Tarjetas laterales con el contacto y puntaje de crédito del cliente, las condiciones y los documentos.

### Cronograma

El calendario completo con descripción, fecha de vencimiento, monto y estado. Las cuotas pendientes se cuentan en el encabezado.

### Pagos

El libro mayor del contrato con fecha, descripción, monto, saldo acumulado y una tarjeta de totales (cargos, pagos, saldo). A un lado se muestra un resumen de notas.

### Documentos

Descarga la ficha del cliente, el contrato de promesa (para financiamiento directo, banco o efectivo), el contrato de rescisión cuando el contrato está cancelado o rechazado, y el estado de cuenta. Abajo se listan los comprobantes subidos al calendario.

### Notas

La nota general del contrato. Los administradores pueden editarla cuando el contrato tiene proyecto y lote; los demás roles solo la leen.

## Menú de acciones

- **Ver solicitante** (administrador) — abre el cliente en Usuarios.
- **Ver lote** — abre la lista de lotes del proyecto con el lote actual resaltado.
- **Descargar PDF** — descarga el PDF del contrato.
- **Enviar recordatorio** (administrador, no cancelado ni cerrado) — envía un recordatorio de pago al cliente.
- **Cancelar contrato** (administrador, aprobado o firmado) — pide confirmación, marca las cuotas futuras como canceladas, registra el reembolso, libera el lote y, si la comisión estaba pagada, genera un crédito de comisión.

Los vendedores solo ven las acciones de lectura: ver lote, descargar PDF y las descargas de documentos.

## Relacionado

- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
- [Aprobar y rechazar contratos](/docs/approving-contracts)
- [Tipos y estados de pago](/docs/payment-types-and-statuses)
