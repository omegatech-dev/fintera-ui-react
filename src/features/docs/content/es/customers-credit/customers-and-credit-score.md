# Clientes y puntaje de crédito

Un **cliente** es un usuario con rol `user`. Los clientes inician sesión en el portal de clientes; el personal trabaja con sus registros desde el sistema administrativo.

## Dónde aparecen los clientes

- **Reservas** — busca un cliente existente o crea uno durante el asistente de reserva.
- **Usuarios** — los administradores pueden buscar clientes, abrir el panel del usuario y editar su perfil.
- **Contratos** — el detalle del contrato muestra los datos de contacto y el puntaje de crédito del cliente.
- **Mis clientes** — los vendedores ven los clientes que provienen de sus contratos.

## Ficha del cliente

Un cliente guarda nombre completo, correo, teléfono, número de identidad, RTN, dirección y el idioma preferido. La identidad se valida con 13 dígitos y el RTN con 14 dígitos al crear o editar un cliente.

## Puntaje de crédito

El **puntaje de crédito** resume el comportamiento de pago en una escala de `300` a `850`. Inicia en `500` y un proceso en segundo plano lo recalcula **cada 8 horas** a partir de todos los contratos del cliente.

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

## Documentos del cliente

Los administradores pueden abrir el panel del cliente y descargar el PDF del estado de cuenta. La pestaña **Documentos** del contrato también ofrece la ficha del cliente, el contrato de promesa, el contrato de rescisión y el estado de cuenta.

## Relacionado

- [Usuarios y roles](/docs/users-management)
- [Tipos y estados de pago](/docs/payment-types-and-statuses)
- [Ciclo de vida y estados del contrato](/docs/contract-lifecycle)
