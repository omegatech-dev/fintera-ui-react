# Proyectos, precios y unidades de medida

Un **proyecto** es un desarrollo que contiene muchos **lotes**. Cada proyecto guarda los valores predeterminados que se aplican a sus lotes.

## Campos del proyecto

- **Tipo de proyecto** — residencial, comercial, industrial o uso mixto.
- **Unidad de medida** — `m²` (metros cuadrados), `ft²` (pies cuadrados) o `varas²` (varas cuadradas).
- **Precio por unidad cuadrada** — precio base de una unidad de área del proyecto.
- **Tasa de interés** — tasa anual usada para el financiamiento directo y para el interés por mora. Una tasa de `0` significa que no se cobra interés.
- **Tasas de comisión** — porcentajes separados para financiamiento **directo**, **banco** y **efectivo**.
- **Fecha de entrega**, **ciudad** y **código** — campos descriptivos.

## Cómo se arma el precio de un lote

El precio de un lote se basa en su **área** y en el **precio por unidad cuadrada** del proyecto. El área es `largo × ancho`, salvo que se defina un **área manual**. Un lote también puede tener un **precio manual**, que reemplaza el precio calculado.

> Cambiar la unidad de medida de un proyecto convierte las medidas y los precios por unidad de todos sus lotes. Por eso el sistema pide confirmación.

## Publicación

Un proyecto puede estar **publicado** (visible en el portal de clientes) o ser un **borrador** (no visible). Publicar es una acción de administrador; los vendedores ven el estado actual pero no lo cambian.

## Relacionado

- [Lista y detalle de proyectos](/docs/projects-list-and-detail)
- [Lotes y sus estados](/docs/lots-and-statuses)
- [Tipos de financiamiento](/docs/financing-types)
