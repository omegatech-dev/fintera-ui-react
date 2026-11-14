# Reservas, pago inicial y retenciones

Una **reserva** aparta un lote para un cliente antes de completar la venta.

## Montos

- **Monto de reserva** — se paga para apartar el lote. Se convierte en el primer pago del calendario. El monto mínimo se configura en **Configuración → General**.
- **Pago inicial** — pago inicial después de la reserva (financiamiento directo).
- **Plazo** — cuántos meses se divide el saldo financiado (financiamiento directo).
- **Monto financiado** — lo que queda después de la reserva y el pago inicial.

## El asistente de reserva

Los vendedores y administradores inician una reserva desde un lote o desde **Nueva reserva** en **Mi día** del vendedor.

1. **Cliente** — busca un cliente existente o crea uno con nombre, teléfono, identidad, RTN y correo.
2. **Plan de financiamiento** — elige directo, banco o efectivo; ingresa el plazo, la fecha máxima de pago, el monto de reserva, el pago inicial y las notas según corresponda.
3. **Confirmar** — revisa el resumen y adjunta documentos si es necesario.

Al enviarse, el lote pasa a **reservado** y el contrato inicia en estado **pendiente**.

## La retención de la reserva

Cuando se crea una reserva, el lote queda retenido por tiempo limitado. La retención predeterminada es de **48 horas**, configurable en **Configuración → General** con un rango válido de `1` a `720` horas.

- Cuando el cliente sube el comprobante de reserva, el contrato pasa de **pendiente** a **enviado**.
- Si la retención vence sin comprobante, un proceso en segundo plano libera el lote y vuelve a **disponible**.
- El tiempo restante se muestra como **la retención vence el** en el contrato.

## Fechas de vencimiento

Las fechas de reserva y pago inicial se configuran en ajustes:

- **Días de vencimiento de la reserva** — `7` días después de la aprobación por defecto.
- **Días de vencimiento del pago inicial** — `14` días por defecto.
- **Días de vencimiento del pago inicial con reserva** — `21` días por defecto; no puede ser anterior a la fecha del pago inicial simple.

## Qué hacen los vendedores

Los vendedores crean reservas para sus clientes, suben el comprobante de reserva y dan seguimiento al contrato. No pueden aprobar, rechazar ni cancelar un contrato.

## Qué hacen los administradores

Los administradores pueden cambiar la retención y las fechas de vencimiento, aprobar o rechazar la reserva, o cancelarla cuando haga falta. Ver [Aprobar y rechazar contratos](/docs/approving-contracts).

## Relacionado

- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
- [Cómo se genera el calendario de pagos](/docs/payment-schedule)
- [Configuración general e identidad de marca](/docs/settings-and-branding)
