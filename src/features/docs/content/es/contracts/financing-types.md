# Tipos de financiamiento: directo, banco y efectivo

Cada contrato tiene un **tipo de financiamiento** que decide cómo paga el cliente y cómo se genera el calendario.

## Directo

La empresa financia la compra.

- Requiere un **pago inicial** y un **plazo** en meses.
- El saldo restante se divide en **cuotas** mensuales.
- La **tasa de interés** del proyecto se aplica a las cuotas vencidas (ver [Interés por mora](/docs/overdue-interest)).
- La comisión usa la tasa **directa**.

## Banco

El cliente paga con un préstamo bancario.

- Requiere una **fecha máxima de pago**: la fecha en que el cliente espera pagar el saldo restante.
- Puedes registrar el **nombre del banco** y el **estado del crédito bancario**.
- El calendario es un pago de **reserva** más el saldo restante con vencimiento en la fecha máxima de pago.
- La comisión usa la tasa **bancaria**.

## Efectivo

El cliente paga el saldo directamente en una fecha acordada.

- Requiere una **fecha máxima de pago**.
- El calendario es un pago de **reserva** más el saldo restante con vencimiento en esa fecha.
- La comisión usa la tasa de **contado**.

## Estado del crédito bancario

Cuando el financiamiento es bancario, el estado del crédito describe en qué punto está el préstamo:

| Estado | Significado |
| --- | --- |
| No iniciado | El cliente aún no ha aplicado. |
| Precalificado | El banco revisó el perfil del cliente. |
| Preaprobado | El banco indicó que el préstamo es probable. |
| Aprobado | El préstamo está aprobado. |

## Relacionado

- [Reservas, pago inicial y retenciones](/docs/reservations-and-holds)
- [Cómo se genera el calendario de pagos](/docs/payment-schedule)
- [Comisiones y pagos de comisión](/docs/commissions-and-payouts)
