# Comisiones y pagos de comisión

Una **comisión** es el monto que gana un vendedor cuando se aprueba un contrato. La tasa depende del proyecto y del tipo de financiamiento del contrato.

## Tasas de comisión

Cada proyecto guarda tres tasas:

- **Directo** — financiamiento directo.
- **Banco** — financiamiento bancario.
- **Contado** — financiamiento de contado.

La comisión se calcula cuando se aprueba el contrato y se guarda en el contrato. Los cambios de tasa posteriores solo aplican a contratos nuevos.

Los administradores abren **Configurar tasas** desde la página de Comisiones. La hoja de reglas explica que la tasa viene del proyecto, que la comisión se calcula al aprobar y que las excepciones por vendedor no están disponibles en esta versión: las tasas del proyecto aplican a todos los vendedores.

## Página de comisiones del administrador

Abre **Comisiones** desde el menú del administrador. La página tiene:

- Filtros de **rango de fechas** y de **vendedor**.
- Tarjetas de resumen: comisión del periodo, monto por pagar y monto pagado, con leyendas para la tasa promedio y el conteo de pagos.
- Una tabla de detalle con contrato, vendedor, cliente, monto de venta, comisión y tasa, estado, fecha y una acción.
- **Exportar** para descargar el periodo en CSV.

Para una comisión pendiente, **Pagar** pide confirmación y marca la comisión como pagada. Escribe una entrada de auditoría y **no** cambia el saldo del contrato. Las comisiones pagadas muestran **Ver**, que abre un diálogo de detalle en solo lectura.

## Comisiones del vendedor

Los vendedores ven **Comisiones** en su espacio de trabajo, en solo lectura:

- Comisión de este mes.
- Comisión pendiente por pagar.
- Comisión pagada en el periodo.
- Una tabla con contrato, cliente, monto de venta, comisión y tasa, estado y fecha.

Los vendedores no pueden marcar una comisión como pagada ni cambiar tasas.

## Crédito de comisión por cancelación

Si cancelas un contrato cuya comisión ya se pagó, se genera un **crédito de comisión** a favor de Fintera para ese vendedor. Aparece en Comisiones como un crédito pendiente. El administrador puede **aplicarlo** (marcarlo como saldado) cuando corresponda. Si la comisión no se pagó, no se crea ningún crédito: la comisión simplemente deja de aparecer.

## Relacionado

- [Tipos de financiamiento: directo, banco y efectivo](/docs/financing-types)
- [Proyectos, precios y unidades de medida](/docs/projects-and-pricing)
- [Auditoría](/docs/audits)
