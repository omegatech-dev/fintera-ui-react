# Clientes y puntaje de crédito

Un **cliente** es un usuario con el rol `user`. En este sistema administrativo buscas clientes existentes y creas uno nuevo cuando hace falta.

## Ficha del cliente

Un cliente guarda nombre completo, correo, teléfono, número de identidad, RTN, dirección e idioma preferido. La identidad y el RTN se validan al crear un cliente.

## Puntaje de crédito

El **puntaje de crédito** resume el comportamiento de pago en una escala de `300` a `850`. Empieza en `500` y un proceso automático lo recalcula **cada 8 horas** a partir de todos los contratos del cliente.

## Cómo se asignan los puntos

Por cada pago **pagado**, el sistema compara la fecha de pago con la fecha de vencimiento:

| Momento | Puntos |
| --- | --- |
| A tiempo o antes | **+5** |
| 1–7 días tarde | **−2** |
| 8–30 días tarde | **−5** |
| Más de 30 días tarde | **−10** |

Luego, por contrato:

| Evento | Puntos |
| --- | --- |
| Contrato **cancelado** | **−20** |
| Contrato **cerrado** (pagado totalmente) | **+50** |

El valor final se limita al rango `300–850`.

## Por qué importa

El puntaje es una señal rápida de qué tan confiable es el pago de un cliente. Un cliente que paga a tiempo y completa contratos sube; uno que paga tarde o abandona contratos baja.

## Relacionado

- [Tipos y estados de pago](/docs/payment-types-and-statuses)
- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
