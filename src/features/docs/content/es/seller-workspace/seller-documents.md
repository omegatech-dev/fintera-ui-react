# Documentos del vendedor

**Documentos** lista los contratos del vendedor que tienen documentos disponibles: contratos activos o que aún están en revisión.

## Tarjetas de resumen

- **Contratos con documentos** — contratos activos o en revisión.
- **Contratos activos** — contratos que se están pagando.
- **En revisión** — contratos que esperan aprobación.

## Tabla

Cada fila muestra el número de contrato, el cliente, el proyecto y el lote, el estado y la acción **Descargar estado de cuenta**. La acción descarga directamente; no abre el detalle del contrato.

En móvil la misma acción aparece en la tarjeta del contrato.

## Descargar el estado de cuenta

- **Descargar estado de cuenta** solicita el PDF del estado de cuenta del cliente a `/api/v1/reports/user_balance_pdf?user_id=...` e inicia la descarga en el navegador.
- La descarga es directa: el vendedor permanece en **Documentos** y ve un aviso de confirmación al terminar.
- Si la solicitud falla, un aviso de error explica que no se pudo descargar el estado de cuenta.
- Si el contrato no tiene un cliente vinculado, la página muestra **Este contrato no tiene una cuenta de cliente vinculada** y no inicia la descarga.

## Búsqueda

Busca por número de contrato, cliente, proyecto o lote. La lista está paginada y muestra solo los contratos del vendedor.

## Relacionado

- [Lista, detalle y acciones del contrato](/docs/contract-detail-and-actions)
- [Cobros y comprobantes](/docs/seller-collections)
- [Mis clientes](/docs/seller-clients)
