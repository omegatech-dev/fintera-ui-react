# Términos y condiciones

La página de **Términos y condiciones** está disponible en **Configuración → Términos y condiciones** y en los enlaces legales del flujo de inicio de sesión.

## Qué muestra la página

- Una insignia de **Última actualización**. Usa la **fecha de vigencia de los términos** configurada cuando existe; si no, muestra la fecha de hoy.
- Si el administrador escribió términos para el idioma activo, la página muestra ese texto personalizado en lugar de las secciones estándar. Las líneas en blanco separan párrafos y los saltos de línea dentro de un párrafo se conservan.
- Si el texto personalizado del idioma activo está vacío, la página usa los términos estándar localizados: aceptación, descripción de servicios, registro de cuenta, uso de la plataforma, tarifas y pagos, notificaciones, privacidad, limitación de responsabilidad, suspensión de cuenta, modificaciones e información de contacto.
- En ambos casos la página agrega una sección de información de contacto desde la configuración de la organización: razón social, correo de soporte, WhatsApp o teléfono de soporte, dirección legal y sitio web. Los valores opcionales vacíos se omiten en lugar de mostrar un valor roto.

El modal legal del inicio de sesión sigue la misma regla: términos personalizados del idioma activo cuando existen; si no, el texto estándar localizado.

## Qué configura el administrador

Los administradores editan los datos legales en **Configuración → General → Legal**:

- **Razón social** y **RTN**.
- **Dirección legal**.
- **Sitio web**.
- **Fecha de vigencia de los términos**.
- **Términos y condiciones (Español)** y **Términos y condiciones (English)** — dos áreas de texto de hasta 20,000 caracteres cada una. Deja un idioma vacío para usar el contenido estándar de ese idioma.
- **Correo de soporte** y **WhatsApp de soporte** en **Soporte y reservas** alimentan el bloque de contacto del contenido de respaldo.

Los términos se guardan con la barra de guardado de la sección **Legal** y se persisten a través de la API de configuración. Aplican a toda la instalación.

## Relacionado

- [Configuración general e identidad de marca](/docs/settings-and-branding)
- [Perfil y seguridad](/docs/profile-and-security)
- [Descripción general y roles](/docs/overview-and-roles)
