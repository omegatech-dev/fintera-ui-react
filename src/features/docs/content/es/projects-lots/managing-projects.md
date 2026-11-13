# Crear y administrar proyectos y lotes

> **Solo administradores.** Los vendedores pueden consultar proyectos y lotes y crear reservas, pero no crear, editar, eliminar ni publicar proyectos.

## Crear un proyecto

1. Abre **Proyectos** y selecciona **Nuevo proyecto**.
2. Sección **Información**: nombre, código e identificador público opcional.
3. Sección **Precios y comisiones**: precio por unidad cuadrada, moneda, cantidad de lotes, tasa de interés y las tasas de comisión para financiamiento directo, banco y efectivo.
4. Sección **Ubicación**: dirección, ciudad o zona, tipo de proyecto, fecha de entrega y unidad de medida.
5. Sección **Descripción**: el texto que se muestra en el detalle y en el portal de clientes.

La barra de guardado permanece deshabilitada hasta que los campos obligatorios sean válidos. Los proyectos nuevos se crean como **borrador**; publícalos desde el detalle o la edición.

## Editar un proyecto

- El panel **Publicación** controla si el proyecto es visible en el portal de clientes. Despublicar lo oculta sin borrar datos.
- Cambiar la **unidad de medida** pide confirmación porque convierte las medidas y el precio por unidad de todos los lotes.
- La **cantidad de lotes** no se puede cambiar cuando el proyecto ya tiene lotes reservados o vendidos.
- Los planos y las fotos se gestionan desde la pestaña **Medios** del detalle del proyecto.

## Administrar lotes

- Abre un proyecto, selecciona **Ver lotes** y luego **Nuevo lote**.
- Un lote guarda su nombre, dirección y número de registro opcionales, dimensiones, unidad de medida, área manual opcional, precio manual opcional, descripciones de linderos y notas.
- El **área calculada** es `largo × ancho`; el **precio estimado** es el área multiplicada por el precio por unidad del proyecto.
- Usa **área manual** o **precio manual** solo cuando el valor calculado no sea el deseado.
- Desde la lista de lotes, los administradores pueden editar lotes; cualquier usuario con acceso puede abrir un lote e iniciar una reserva cuando está disponible.

## Importar CSV

**Importar CSV** crea o actualiza proyectos desde un archivo:

1. Descarga la plantilla o usa tus propios encabezados.
2. Suelta el CSV en el diálogo. El sistema reconoce encabezados, incluidos alias en español.
3. Revisa las filas detectadas y el mapeo de columnas.
4. Elige **Actualizar existentes** y **Omitir duplicados** según necesites.
5. Confirma la importación.

Las columnas de la plantilla son `name`, `code`, `address`, `city`, `price_per_square_unit`, `lot_count`, `measurement_unit`, `project_type`, `delivery_date` y `description`.

## Eliminar

Eliminar un proyecto es permanente y solo lo puede hacer un administrador. Un proyecto con contratos activos no debería eliminarse; primero cancela o resuelve esos contratos.

## Relacionado

- [Lista y detalle de proyectos](/docs/projects-list-and-detail)
- [Lotes y sus estados](/docs/lots-and-statuses)
- [Reservas, pago inicial y retenciones](/docs/reservations-and-holds)
