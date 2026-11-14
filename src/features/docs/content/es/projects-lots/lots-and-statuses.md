# Lotes y sus estados

Un **lote** es una pieza vendible de un proyecto. Su estado indica si se puede vender.

## Estados

| Estado | Significado |
| --- | --- |
| **Disponible** | Se puede reservar o vender. |
| **Reservado** | Existe un contrato, pero la venta aún no se completa. |
| **Financiado** | La reserva se aprobó y se están cobrando los pagos. |
| **Pagado totalmente** | El saldo llegó a cero y el contrato se cerró. |

Un lote pasa de **disponible → reservado → financiado → pagado totalmente**. Si una reserva se rechaza o se cancela, el lote vuelve a **disponible**.

## La lista de lotes

Abre un proyecto y selecciona **Ver lotes** para ver el inventario completo. La lista incluye:

- **Búsqueda** por nombre del lote, dirección o número de registro.
- Chips de estado con conteos para **Todos**, **Disponibles**, **Reservados**, **Financiados** y **Pagados totalmente**.
- Ordenamiento por última actualización, nombre del lote, dimensiones, precio o estado.
- Una línea de resumen con el total, los disponibles y el precio por lote.

Cada tarjeta de lote muestra dimensiones, área, precio, estado y el cliente que lo reservó. **Reservar** inicia una reserva para un lote disponible. Para lotes reservados, financiados y pagados, la acción abre el detalle del lote.

## Área y precio

- **Área** = `largo × ancho`, salvo que se defina un **área manual**.
- **Precio efectivo** = el **precio manual** del lote cuando existe; si no, el precio base calculado a partir del proyecto.
- **Reservado por** muestra al cliente; el registro de la reserva muestra qué miembro del personal la creó.

## Por qué importa

Los estados evitan vender dos veces el mismo lote. Solo los lotes **disponibles** se pueden reservar, y el flujo de reserva deja el lote en **reservado** de inmediato.

## Relacionado

- [Reservas, pago inicial y retenciones](/docs/reservations-and-holds)
- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
- [Lista y detalle de proyectos](/docs/projects-list-and-detail)
