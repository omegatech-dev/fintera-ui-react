# Navegación, notificaciones y guía

## Encabezado

El encabezado es común a todas las páginas administrativas:

- **Búsqueda** busca entradas de tu propio menú y navega a ellas.
- **Selector de tema** alterna entre modo claro y oscuro.
- **Campana de notificaciones** muestra las notificaciones recientes.
- **Menú de perfil** abre tu perfil, la configuración de la cuenta, reinicia el recorrido de bienvenida y cierra la sesión.

En pantallas angostas la barra lateral se convierte en un panel; usa el botón de menú del encabezado para abrirlo.

## Notificaciones

Abre la campana para ver las notificaciones. El panel tiene dos pestañas:

- **Todas** — todas las notificaciones.
- **No leídas** — solo las que no has leído.

Cada elemento muestra un título, un mensaje corto y el tiempo relativo. Usa **Leída** en un elemento o **Marcar leídas** para limpiar el contador. La campana carga las últimas notificaciones; si la lista no carga, reintenta desde el panel.

## La guía

La guía vive en `/docs`. Los administradores y los vendedores llegan desde la entrada **Guía** de la barra lateral. Incluye:

- un **buscador** que filtra artículos por título y contenido,
- **secciones** agrupadas por tema,
- un **contador de artículos** para el filtro actual,
- una **tabla de contenido** generada con los encabezados de segundo y tercer nivel del artículo.

La lista de artículos se filtra por rol. Si un vendedor abre la URL de un artículo solo para administradores, el artículo no aparece en la navegación y la guía vuelve al primer artículo disponible.

## Estados vacíos, de carga y de error

Las listas usan esqueletos mientras cargan y mantienen una acción **Reintentar** cuando una solicitud falla. Los resultados vacíos explican si aún no hay datos o si los filtros actuales son demasiado estrechos.

## Relacionado

- [Descripción general y roles](/docs/overview-and-roles)
- [Atajos de teclado](/docs/keyboard-shortcuts)
- [Perfil y seguridad](/docs/profile-and-security)
