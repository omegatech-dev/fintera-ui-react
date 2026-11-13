# Interés por mora

El **interés por mora** es el cargo adicional que se agrega a una cuota pagada tarde. Un proceso automático lo recalcula **cada 12 horas**.

## La fórmula

```
interés = monto de la cuota × (días de mora ÷ 365) × (tasa de interés del proyecto ÷ 100)
```

- `días de mora` es el número entero de días entre la fecha de vencimiento y hoy. Debe ser mayor que cero.
- La **tasa de interés del proyecto** es la tasa anual guardada en el proyecto, en porcentaje. Se divide entre `100` para convertirla a decimal.
- Si la tasa de interés del proyecto es `0`, **no se cobra interés**.

## Cuándo aplica

El cálculo solo se ejecuta para pagos que:

- son de tipo **cuota**,
- están **pendientes** y con fecha de vencimiento pasada,
- pertenecen a un contrato **aprobado** y **activo**.

Los pagos de reserva, pago inicial y pago total no generan interés por mora.

## Ejemplo

Una cuota de `5,000` tiene `10` días de mora y la tasa del proyecto es `10%`:

```
5,000 × (10 ÷ 365) × (10 ÷ 100) = 13.70
```

El interés (`13.70`) se suma al monto de interés del pago y se registra como un **asiento negativo en el libro mayor**, lo que aumenta la deuda. Cuando el cliente paga, el total a pagar es la cuota más el interés acumulado.

## Editar el cargo

Los administradores pueden ajustar el monto de mora de un pago específico desde el calendario de pagos cuando el valor automático necesite una corrección. El calendario está disponible desde un contrato aprobado o cerrado.

## Relacionado

- [Cómo se genera el calendario de pagos](/docs/payment-schedule)
- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
- [Bandeja de pagos y cola de revisión](/docs/payment-inbox)
