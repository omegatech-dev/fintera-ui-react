# Aprobar y rechazar contratos

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

Cancelar detiene la venta. Puedes cancelar un contrato **aprobado** o **firmado**, además de los pendientes, enviados o rechazados. Al cancelar:

- las cuotas futuras pasan a **canceladas** y dejan de enviarse recordatorios de cobro,
- el monto pagado se registra como **reembolso** en el libro mayor,
- el lote vuelve a **disponible**,
- si la comisión ya se pagó, se genera un **crédito de comisión** que puedes aplicar después.

La cancelación se registra en la auditoría y en las notas del contrato.

## Eliminar un contrato rechazado

Un contrato rechazado se puede eliminar para que el lote se pueda reservar de nuevo. Es distinto de cancelar: eliminar borra el registro. El menú de la fila muestra **Eliminar** solo para contratos rechazados.

## Relacionado

- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
- [Lista, detalle y acciones del contrato](/docs/contract-detail-and-actions)
- [Cómo se genera el calendario de pagos](/docs/payment-schedule)
