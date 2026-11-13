# Cómo se genera el calendario de pagos

El calendario se genera cuando un administrador **aprueba** un contrato. Depende del tipo de financiamiento y de los días de vencimiento configurados en **Configuración → General**.

## Financiamiento directo

1. **Reserva** — si el monto de reserva es mayor que cero, vence los **días de vencimiento de la reserva** configurados después de la aprobación (`7` por defecto).
2. **Pago inicial** — si el pago inicial es mayor que cero, vence los **días de vencimiento del pago inicial** después de la aprobación (`14` por defecto), o el valor **con reserva** cuando también hay reserva (`21` por defecto).
3. **Cuotas** — el saldo restante es `monto − reserva − pago inicial`.
   - Cuota base = `floor(restante ÷ plazo)`.
   - La **primera cuota absorbe el residuo**, así que `primera = restante − base × (plazo − 1)`.
   - La primera cuota vence **1 mes** después de la aprobación y luego una por mes.
   - Si el plazo es cero, el saldo restante se convierte en un solo pago **total** con vencimiento en 1 mes.

### Ejemplo

Monto `120,000`, reserva `5,000`, pago inicial `15,000`, plazo `10`:

- Restante = `100,000`.
- Base = `floor(100,000 ÷ 10)` = `10,000`.
- Primera cuota = `100,000 − 10,000 × 9` = `10,000`.

Si la división no es exacta, solo cambia la primera cuota. Por ejemplo, restante `100,000` en `7` meses: base `14,285`, primera `14,290`.

## Financiamiento banco o efectivo

1. **Reserva** — vence los días de vencimiento de la reserva configurados después de la aprobación, cuando el monto es mayor que cero.
2. **Saldo total** — `monto − reserva`, con vencimiento en la **fecha máxima de pago** del contrato.

## Editar el calendario

Los administradores pueden abrir el calendario de pagos desde un contrato aprobado o cerrado. El modal muestra el calendario, las filas de pago y el libro mayor, y permite registrar pagos, editar el interés por mora y deshacer una aprobación.

## Relacionado

- [Tipos de financiamiento: directo, banco y efectivo](/docs/financing-types)
- [Reservas, pago inicial y retenciones](/docs/reservations-and-holds)
- [Interés por mora](/docs/overdue-interest)
