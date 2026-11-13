# Configuración general e identidad de marca

> **Solo administradores.** Los vendedores no pueden abrir el área de Configuración.

El área de Configuración tiene dos secciones de organización, **General** e **Identidad de marca**, más las secciones de cuenta **Perfil**, **Seguridad** y **Términos y condiciones**. Cada sección se guarda de forma independiente con su propia barra de guardado. No hay porcentaje de completado; la página refleja los valores actuales.

## General

### Nombre de la aplicación

El nombre de la aplicación aparece en la barra lateral, la pestaña del navegador y las pantallas de inicio de sesión. Está limitado a 60 caracteres y muestra una vista previa mientras editas.

### Soporte y reservas

- **WhatsApp de soporte** — el número que ven los clientes para recibir ayuda.
- **Correo de soporte** — la dirección que ven los clientes para recibir ayuda.
- **Monto mínimo de reserva** — la reserva más pequeña que acepta el asistente.
- **Horas de retención de reservas** — cuánto tiempo una reserva aparta un lote antes de liberarse. Valor predeterminado `48`, rango válido `1` a `720`.
- **Días de vencimiento de la reserva** — cuándo vence el pago de reserva después de la aprobación. Predeterminado `7`, rango `1` a `365`.
- **Días de vencimiento del pago inicial** — cuándo vence el pago inicial después de la aprobación. Predeterminado `14`.
- **Días de vencimiento del pago inicial con reserva** — la fecha del pago inicial cuando también existe una reserva. Predeterminado `21`, y no puede ser anterior a la fecha del pago inicial simple.

Cambiar la retención afecta a las reservas nuevas; no cambia el tiempo ya transcurrido en reservas existentes.

### Legal

- **Razón social**, **RTN**, **dirección legal**, **sitio web** y **fecha de vigencia de los términos**.
- **Términos y condiciones (Español)** y **Términos y condiciones (English)** — texto personalizado de los términos, de hasta 20,000 caracteres por idioma. Deja un idioma vacío para usar el contenido estándar de ese idioma.

Los datos legales, la fecha de vigencia y los términos personalizados alimentan la página de Términos y condiciones y el modal legal del inicio de sesión. Ver [Términos y condiciones](/docs/terms-and-conditions).

### Notificaciones

- Interruptor de **notificaciones por correo**.
- Interruptor de **recordatorios de mora**.
- **Días de recordatorio anticipado** — cuántos días antes de la fecha de vencimiento se envía el recordatorio. Rango `0` a `30`.

### Regional

- **Moneda predeterminada** — `HNL`, `USD` o `EUR`; también se puede conservar un código personalizado de tres letras.
- **Idioma predeterminado** — español o inglés.
- **Zona horaria** — una de las zonas compatibles o una zona IANA válida.

## Identidad de marca

La sección **Identidad de marca** controla los logotipos:

- **Logo claro** — se usa en superficies claras.
- **Logo oscuro** — opcional; se usa en superficies oscuras.

El tamaño recomendado del logo es `640 × 160` (4:1), mínimo `320 × 80`, tamaño máximo `2 MB`, en PNG, JPEG o WebP. Un logotipo horizontal con fondo transparente funciona mejor. Sin un logo personalizado, la aplicación usa su logo incluido.

## Relacionado

- [Perfil y seguridad](/docs/profile-and-security)
- [Términos y condiciones](/docs/terms-and-conditions)
- [Reservas, pago inicial y retenciones](/docs/reservations-and-holds)
