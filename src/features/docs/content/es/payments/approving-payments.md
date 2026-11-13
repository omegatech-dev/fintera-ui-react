# Aprobar, rechazar y deshacer pagos

> **Solo administradores.** Estas acciones mueven dinero en el libro mayor del contrato.

## Aprobar

Cuando apruebas un pago:

1. El pago pasa a **pagado** con la fecha de pago de hoy.
2. Se registra un **crédito** en el libro mayor del contrato, reduciendo el saldo.
3. Si el monto recibido es mayor que la cuota más el interés, el **excedente se aplica a las cuotas futuras** (ver [Abonos a capital y reajustes](/docs/capital-repayments)).
4. Si el saldo del contrato llega a cero, el contrato se **cierra automáticamente**.

Por defecto, el monto aprobado es la cuota más su interés. Puedes bajarlo o subirlo; cualquier excedente sobre la obligación se trata como abono a capital. Aprobar un pago de tipo **abono a capital** aplica el monto completo a las cuotas pendientes.

Un pago de **reserva** no se puede aprobar hasta que el contrato esté aprobado. En ese caso, el botón Aprobar permanece deshabilitado.

## Rechazar

Solo se pueden rechazar pagos **enviados**. Ingresa un motivo para que el cliente sepa qué corregir. El cliente puede subir un nuevo comprobante.

## Deshacer

Deshacer un pago aprobado:

- lo devuelve a **enviado**,
- registra una **reversión** en el libro mayor,
- borra el monto pagado y la fecha de pago.

Úsalo para corregir una aprobación accidental y luego vuelve a aprobar o rechazar.

## Relacionado

- [Bandeja de pagos y cola de revisión](/docs/payment-inbox)
- [Abonos a capital y reajustes](/docs/capital-repayments)
- [Tipos y estados de pago](/docs/payment-types-and-statuses)
