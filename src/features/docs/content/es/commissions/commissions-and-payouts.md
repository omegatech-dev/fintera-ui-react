# Comisiones y pagos de comisión

Una **comisión** es el monto que gana un vendedor cuando se aprueba un contrato. La tasa depende del proyecto y del tipo de financiamiento del contrato.

## Tasas de comisión

Cada proyecto guarda tres tasas:

- **Directo** — financiamiento directo.
- **Banco** — financiamiento bancario.
- **Contado** — financiamiento de contado.

La comisión se calcula cuando se aprueba el contrato y se guarda en el contrato. Los cambios de tasa posteriores solo aplican a contratos nuevos.

Los administradores abren **Configurar tasas** desde la página de Comisiones. La hoja de reglas define la tasa global por defecto, la tasa sin vendedor y las excepciones por vendedor. Una excepción por vendedor reemplaza la tasa del proyecto/global para ese vendedor. Los registros históricos usan la excepción del vendedor si existe; de lo contrario, la tasa global por defecto.

## Página de comisiones del administrador

Abre **Comisiones** desde el menú del administrador. La página tiene:

- Filtros de **rango de fechas** y de **vendedor**.
- Tarjetas de resumen: comisión del periodo, monto por pagar y monto pagado, con leyendas para la tasa promedio y el conteo de pagos.
- Una tabla de detalle con contrato, vendedor, cliente, monto de venta, comisión y tasa, estado, fecha y una acción.
- **Exportar** para descargar el periodo en CSV.

Para una comisión pendiente, **Pagar** primero muestra una vista previa de la comisión bruta, el crédito disponible que se aplicará, el efectivo neto por pagar y el saldo restante. Después de confirmar, el servidor aplica los créditos elegibles del mismo vendedor como parte del pago y devuelve el desglose final. La comisión se registra por su monto bruto; el efectivo neto es lo que realmente se desembolsa. La acción escribe una entrada de auditoría y **no** cambia el saldo del contrato. Si no se puede cargar la vista previa, no se puede confirmar el pago. Cuando la compensación está desactivada en el backend, la vista previa indica claramente que no se aplicará crédito. Las comisiones pagadas muestran **Ver**, que abre un diálogo de detalle en solo lectura.

## Históricos por validar

La página de Comisiones tiene una pestaña **Por validar** con el número de registros históricos pendientes de revisión. Muestra los totales de pendientes, validados y rechazados; filtra por vendedor, estado y texto; y una tabla con cliente, vendedor, fecha de venta, precio, tasa, comisión, respaldo y estado.

Desde cada fila pendiente, el administrador puede:

- **Validar** el registro. Sale de la lista de pendientes y sigue siendo una venta histórica; no crea reserva ni bloquea lote.
- **Rechazar** el registro tras confirmar.
- **Editar** el cliente, la venta, la tasa o el monto de comisión antes de validar.

Los vendedores pueden editar sus propios registros pendientes desde **Mis clientes**; los validados son de solo lectura para ellos.

## Comisiones del vendedor

Los vendedores ven **Comisiones** en su espacio de trabajo, en solo lectura:

- Comisión de este mes.
- Comisión pendiente por pagar.
- Comisión pagada en el periodo.
- Una tabla con contrato, cliente, monto de venta, comisión y tasa, estado y fecha.

Los vendedores no pueden marcar una comisión como pagada ni cambiar tasas.

## Saldo y aplicaciones de créditos de comisión

Cuando se revierte una comisión que ya se pagó, el **crédito de comisión** resultante aparece en el saldo del vendedor. Los créditos se arrastran entre periodos y el servidor los aplica a comisiones futuras del mismo vendedor. La lista muestra el monto original, el aplicado y el restante, su origen y las comisiones a las que se aplicó. Las vistas del administrador y del vendedor son de solo lectura para los créditos; no hay una acción manual que los marque como saldados sin registrar cómo se recuperaron.

Si después se cancela o reasigna un contrato al que se aplicó un crédito, el backend revierte la aplicación correspondiente y actualiza el saldo del vendedor. El saldo del cliente en el contrato se mantiene separado de los créditos de comisión.

## Relacionado

- [Tipos de financiamiento: directo, banco y efectivo](/docs/financing-types)
- [Proyectos, precios y unidades de medida](/docs/projects-and-pricing)
- [Auditoría](/docs/audits)
