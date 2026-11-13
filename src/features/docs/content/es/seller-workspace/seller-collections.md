# Cobros y comprobantes

**Cobros** es la cola de cobros del vendedor. Lista los contratos activos del vendedor que todavía tienen saldo.

## Tarjetas de resumen

- **Por cobrar este mes** — cuotas del mes actual.
- **Vencido** — saldo vencido pendiente.
- **Cobrado este mes** — pagos aprobados en el mes actual.

## Tabla

Cada fila muestra el cliente y el contrato, el proyecto y el lote, el monto pendiente, el estado del contrato y la acción **Cobrar**. El enlace del contrato abre la pestaña **Pagos** del contrato.

Busca por cliente, proyecto o lote. El encabezado muestra la cantidad de contratos con saldo y el total pendiente.

## Registrar un cobro

1. Selecciona **Cobrar** en una fila.
2. El sistema abre el contrato y busca la cuota más antigua que esté **pendiente**, **vencida** o **enviada** y que no tenga comprobante.
3. Revisa el cliente, el contrato, la cuota, la fecha de vencimiento, el monto y el saldo actual.
4. Sube el comprobante (imagen o PDF).
5. Confirma **Registrar cobro**.

El diálogo explica que el pago pasa a revisión y que el saldo cambia solo cuando un administrador lo aprueba.

Después de enviar el comprobante, la fila muestra **Comprobante enviado** y el chip de estado muestra **En revisión**. El vendedor no aprueba el pago; lo hace un administrador desde **Pagos**.

Si el contrato no tiene una cuota pendiente por cobrar, el diálogo muestra una advertencia y la acción de envío permanece deshabilitada.

## Quién puede hacer qué

- **Vendedores** suben el comprobante de sus propios contratos. No pueden aprobar, rechazar ni deshacer un pago.
- **Administradores** aprueban o rechazan el pago en la bandeja de pagos.

## Relacionado

- [Subir y revisar comprobantes de pago](/docs/receipts)
- [Bandeja de pagos y cola de revisión](/docs/payment-inbox)
- [Tipos y estados de pago](/docs/payment-types-and-statuses)
