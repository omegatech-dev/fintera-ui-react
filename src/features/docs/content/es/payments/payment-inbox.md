# Bandeja de pagos y cola de revisión

> La entrada **Pagos** pertenece al menú del administrador. Los vendedores ven su cola de cobros en **Cobros**.

## Tarjetas de resumen

La bandeja de pagos comienza con tres tarjetas:

- **Cobrado este mes** — pagos aprobados en el mes actual.
- **Por cobrar este mes** — cuotas del mes actual que aún no están pagadas.
- **Mora acumulada** — el monto vencido pendiente.

## Pestañas

Las pestañas incluyen su conteo y funcionan como filtros:

| Pestaña | Qué muestra |
| --- | --- |
| **Todos** | Todos los pagos de la bandeja. |
| **Por aprobar** | Pagos cuyo comprobante espera revisión (`submitted`). |
| **Vencidos** | Cuotas pendientes con fecha de vencimiento pasada. |
| **Aprobados** | Pagos ya marcados como pagados. |

## Búsqueda y fechas

- **Buscar** por cliente, lote o concepto. Las búsquedas de menos de tres caracteres se ignoran.
- **Fecha de inicio** y **fecha de fin** limitan la lista a un rango.
- Haz clic en el encabezado de una columna ordenable para cambiar el orden.

## Filas

Cada fila muestra el cliente, el concepto con proyecto y lote, la fecha de vencimiento, el monto (incluido el interés acumulado o el sobrepago), el estado y las acciones. Las filas vencidas resaltan la fecha y el monto en rojo.

Para un pago **enviado**, los administradores ven **Aprobar** y **Rechazar**. **Aprobar** está deshabilitado para una reserva cuyo contrato aún no se ha aprobado; el botón explica el motivo. Todos ven **Revisar**, que abre el detalle del pago, y las filas pagadas permiten descargar el comprobante cuando existe.

## Relacionado

- [Tipos y estados de pago](/docs/payment-types-and-statuses)
- [Aprobar, rechazar y deshacer pagos](/docs/approving-payments)
- [Subir y revisar comprobantes de pago](/docs/receipts)
