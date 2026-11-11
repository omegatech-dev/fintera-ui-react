# Lotes y sus estados

Un **lote** es una pieza vendible de un proyecto. Su estado indica si se puede vender.

## Estados

| Estado | Significado |
| --- | --- |
| **Disponible** | Se puede reservar o vender. |
| **Reservado** | Existe un contrato, pero la venta aún no se completa. |
| **Financiado** | La reserva se aprobó y se están cobrando los pagos. |
| **Pagado totalmente** | El saldo llegó a cero y el contrato se cerró. |

Un lote pasa de **disponible → reservado → financiado → pagado totalmente**. Si una reserva se rechaza o se cancela, el lote vuelve a **disponible**. Reabrir un contrato cerrado lo devuelve a **financiado**.

## Área y precio

- **Área** = `largo × ancho`, salvo que se defina un **área manual**.
- **Precio efectivo** = el **precio manual** del lote cuando existe; si no, el precio base.
- **Reservado por** muestra al cliente; **creado por** muestra al miembro del personal que hizo la reserva.

## Por qué importa

Los estados evitan vender dos veces el mismo lote. Solo los lotes **disponibles** se pueden reservar, y el flujo de reserva deja el lote en **reservado** de inmediato.

## Relacionado

- [Reservas, pago inicial y retenciones](/docs/reservations-and-holds)
- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
