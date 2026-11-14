# Ciclo de vida y estados del contrato

Un **contrato** es la venta de un lote a un cliente. Su estado sigue un ciclo fijo.

## Estados

| Estado | Significado |
| --- | --- |
| **Pendiente** | La reserva existe pero aún no está en revisión. |
| **Enviado** | Se subió el comprobante de reserva y espera revisión del administrador. |
| **Aprobado** | La venta está aprobada y el calendario de pagos está activo. |
| **Rechazado** | Un administrador lo rechazó; el lote queda disponible. |
| **Cancelado** | La venta se canceló; el lote queda disponible y el monto pagado se registra como reembolso. |
| **Cerrado** | El saldo llegó a cero (pagado totalmente). |

## Transiciones permitidas

- Pendiente o rechazado → **enviado** (al subir el comprobante de reserva).
- Pendiente, enviado o rechazado → **aprobado** (administrador).
- Pendiente o enviado → **rechazado** (administrador).
- Pendiente, enviado o rechazado → **cancelado** (administrador).
- Aprobado o firmado → **cancelado** (administrador).
- Aprobado → **cerrado** automáticamente cuando el saldo es cero.

Los vendedores pueden ver el estado pero no cambiarlo.

## Qué significa el "saldo"

El saldo del contrato es la deuda pendiente. Los pagos se registran como créditos y lo reducen. Los intereses y movimientos de capital se registran en el **libro mayor** del contrato. Cuando el saldo llega a cero en un contrato aprobado, el sistema cierra el contrato y marca el lote como **pagado totalmente**.

## Relacionado

- [Lista, detalle y acciones del contrato](/docs/contract-detail-and-actions)
- [Aprobar y rechazar contratos](/docs/approving-contracts)
- [Tipos y estados de pago](/docs/payment-types-and-statuses)
