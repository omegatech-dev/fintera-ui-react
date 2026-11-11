# Cómo se genera el calendario de pagos

El calendario se genera cuando un administrador **aprueba** un contrato. Depende del tipo de financiamiento.

## Financiamiento directo

1. **Reserva** — si el monto de reserva es mayor que cero, vence **7 días** después de la aprobación.
2. **Pago inicial** — si el pago inicial es mayor que cero, vence **14 días** después de la aprobación, o **21 días** cuando también hay reserva.
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

1. **Reserva** — vence **7 días** después de la aprobación, cuando el monto es mayor que cero.
2. **Saldo total** — `monto − reserva`, con vencimiento en la **fecha máxima de pago** del contrato.

## Relacionado

- [Tipos de financiamiento: directo, banco y efectivo](/docs/financing-types)
- [Interés por mora](/docs/overdue-interest)
