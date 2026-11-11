# Tipos y estados de pago

Cada pago tiene un **tipo** y un **estado**. El tipo indica para qué es el dinero; el estado indica en qué punto está la revisión.

## Tipos

| Tipo | Significado |
| --- | --- |
| **Reserva** | Se paga para apartar el lote. Primera fila del calendario. |
| **Pago inicial** | Pago inicial después de la reserva (financiamiento directo). |
| **Cuota** | Pago mensual del saldo financiado. |
| **Total** | Un solo pago del saldo restante (banco, efectivo o sin plazo). |
| **Anticipo** | Pago adelantado. |
| **Abono a capital** | Pago aplicado directamente al capital pendiente. |

## Estados

| Estado | Significado |
| --- | --- |
| **Pendiente** | Esperando pago o comprobante. |
| **Enviado** | Se subió un comprobante y espera revisión. |
| **Pagado** | Aprobado y registrado en el libro mayor. |
| **Rechazado** | El comprobante fue rechazado; el cliente puede subir uno nuevo. |
| **Reajuste** | La fila se ajustó después de un abono a capital. |

## Mora

Un pago está **en mora** cuando sigue **pendiente** y su fecha de vencimiento ya pasó. Las cuotas en mora pueden generar [interés por mora](/docs/overdue-interest).

## Sobrepago

Si el monto recibido es mayor que la cuota más el interés, el excedente es un **sobrepago**. El sistema aplica el excedente a las cuotas futuras como abono a capital.

## Relacionado

- [Cómo se genera el calendario de pagos](/docs/payment-schedule)
- [Aprobar, rechazar y deshacer pagos](/docs/approving-payments)
