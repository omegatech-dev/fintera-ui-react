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

**Importar CSV** crea o actualiza proyectos desde un archivo CSV:

1. Descarga la plantilla para que los encabezados coincidan con el importador.
2. Suelta el CSV en el diálogo. Los encabezados se reconocen por nombre, incluidos alias en español.
3. Revisa las filas detectadas y el mapeo de columnas. El botón queda deshabilitado mientras falte una columna requerida.
4. Elige **Actualizar existentes** y **Omitir duplicados** según necesites.
5. Confirma la importación y revisa el resumen (importados, actualizados, omitidos) y los errores por fila.

### Columnas

| Columna | Requerida | Notas |
| --- | --- | --- |
| `name` | Sí | Nombre del proyecto |
| `code` | No | Se usa para detectar duplicados |
| `address` | Sí | Dirección del proyecto |
| `city` | No | Ciudad o zona |
| `price_per_square_unit` | Sí | Número no negativo |
| `lot_count` | No | Entero. Solo se aplica a proyectos nuevos |
| `measurement_unit` | No | `m2` (por defecto), `ft2` o `vara2` |
| `project_type` | No | Por defecto `residential` |
| `delivery_date` | No | `YYYY-MM-DD` |
| `description` | No | Texto libre. Se admiten campos entre comillas y saltos de línea |
| `interest_rate` | No | Porcentaje, por defecto `0` |
| `commission_rate_direct` | No | Porcentaje, por defecto `0` |
| `commission_rate_bank` | No | Porcentaje, por defecto `0` |
| `commission_rate_cash` | No | Porcentaje, por defecto `0` |

También se aceptan alias en español como `nombre`, `codigo`, `direccion`, `ciudad`, `precio_m2`, `lotes`, `unidad`, `tipo`, `fecha_entrega`, `descripcion`, `interes`, `comision_directa`, `comision_banco` y `comision_contado`. El archivo puede ser UTF-8 con o sin BOM.

### Ejemplo

```csv
name,code,address,city,price_per_square_unit,lot_count,measurement_unit,project_type,delivery_date,description,interest_rate,commission_rate_direct,commission_rate_bank,commission_rate_cash
Proyecto Ejemplo,EJ-001,"Calle 50, Ciudad de Panamá",Ciudad de Panamá,1200,10,m2,residential,2027-06-30,Proyecto de ejemplo,0,0,0,0
```

### Duplicados y opciones

- **Omitir duplicados** omite las filas cuyo `code` o `guid` ya existe. Tiene prioridad sobre **Actualizar existentes**.
- **Actualizar existentes** actualiza el proyecto encontrado en lugar de crearlo. Las columnas requeridas siempre se sobrescriben; las opcionales solo cuando su encabezado está presente, y se conserva la cantidad de lotes existente.
- Con ambas opciones desactivadas, un código duplicado crea otro proyecto.

### Resultados y errores

El diálogo muestra cuántos proyectos se importaron, actualizaron y omitieron. Las filas que fallan la validación (nombre o dirección vacíos, número inválido, unidad no admitida, fecha inválida) se listan con el número de fila del archivo y no se ignoran en silencio; las filas válidas sí se importan.

## Eliminar

Eliminar un proyecto es permanente y solo lo puede hacer un administrador. Un proyecto con contratos activos no debería eliminarse; primero cancela o resuelve esos contratos.

## Relacionado

- [Lista y detalle de proyectos](/docs/projects-list-and-detail)
- [Lotes y sus estados](/docs/lots-and-statuses)
- [Reservas, pago inicial y retenciones](/docs/reservations-and-holds)
