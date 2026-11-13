# Aprobar, rechazar y reabrir contratos

> **Solo administradores.** Estas acciones cambian dinero y disponibilidad de lotes.

## Aprobar

Aprobar un contrato confirma la venta y **genera el calendario de pagos**. Solo se pueden aprobar contratos en estado **pendiente**, **enviado** o **rechazado**.

Antes de aprobar, confirma:

- que el cliente y el lote sean correctos,
- que los montos de reserva y pago inicial coincidan con el acuerdo,
- que el tipo de financiamiento y el plazo sean correctos,
- que, para financiamiento bancario o de contado, la fecha máxima de pago esté definida.

## Rechazar

Rechazar requiere un motivo. Se notifica al cliente y el lote vuelve a **disponible**. Un contrato rechazado se puede corregir y enviar de nuevo, o eliminar.

## Cancelar

Cancelar detiene la venta antes de la aprobación. Igual que el rechazo, libera el lote. Úsalo cuando el cliente desiste. La cancelación se registra en las notas del contrato.

## Reabrir

Un contrato **cancelado** o **cerrado** se puede reabrir. Vuelve a **aprobado** y los pagos pueden continuar. Reabre solo cuando el cierre o la cancelación hayan sido un error o se necesite un reembolso o reversión.

## Eliminar un contrato rechazado

Un contrato rechazado se puede eliminar para que el lote se pueda reservar de nuevo. Es distinto de cancelar: eliminar borra el registro. El menú de la fila muestra **Eliminar** solo para contratos rechazados.

## Relacionado

- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
- [Lista, detalle y acciones del contrato](/docs/contract-detail-and-actions)
- [Cómo se genera el calendario de pagos](/docs/payment-schedule)
