# FinteraUI

Una aplicación web moderna para la gestión financiera de contratos inmobiliarios, desarrollada con React y Vite. Permite administrar proyectos, lotes, contratos, pagos, usuarios y reportes de manera eficiente y segura.

## 🚀 Características Principales

- **Gestión de Usuarios**: Creación, edición y administración de usuarios con roles (admin, seller, user)
- **Proyectos y Lotes**: Creación y gestión de proyectos inmobiliarios con lotes individuales
- **Contratos**: Reserva, aprobación, rechazo y cancelación de contratos con plan de pagos
- **Pagos**: Aplicación de pagos, abonos a capital, pagos extra y edición de moras
- **Reportes**: Generación de reportes financieros y de pagos por fechas
- **Dashboard**: Visualización de estadísticas, gráficos y resúmenes en tiempo real
- **PWA**: Aplicación web progresiva con soporte offline
- **Responsive**: Diseño adaptativo para móviles y desktop
- **Autenticación**: Sistema seguro con JWT y recuperación de contraseña

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19**: Framework principal para la interfaz de usuario
- **Vite 8**: Herramienta de desarrollo rápida y moderna
- **Tailwind CSS 4**: Framework de estilos utilitario
- **React Router**: Navegación y enrutamiento
- **Chart.js**: Gráficos y visualizaciones
- **FontAwesome**: Iconos vectoriales
- **AOS**: Animaciones de scroll
- **Quill**: Editor de texto rico

### Desarrollo y Testing
- **Vitest 5**: Framework de testing moderno
- **Testing Library**: Utilidades para testing de componentes
- **ESLint 10**: Linting y calidad de código
- **PropTypes**: Validación de props en componentes

### PWA y Producción
- **Vite PWA Plugin**: Generación de service workers
- **Workbox**: Estrategias de caching offline
- **Serve**: Servidor estático para producción

### Otras Dependencias
- **JWT Decode**: Decodificación de tokens JWT
- **Date-fns**: Manipulación de fechas
- **Lodash.debounce**: Optimización de funciones
- **Rollbar**: Monitoreo de errores en producción

## 📋 Prerrequisitos

- **Node.js**: `>=26` (LTS; CI usa 26.x; ver `.nvmrc` y `engines` en `package.json`)
- **npm** o **yarn**: Gestor de paquetes
- **Git**: Control de versiones
- **Backend API**: Servidor Fintera API corriendo (normalmente en desarrollo local o staging)

## 🚀 Instalación y Ejecución

### 1. Clonar el Repositorio
```bash
git clone https://github.com/sjperalta/FinteraUI.git
cd FinteraUI
# Usa Node 26 LTS (ver .nvmrc / .node-version)
nvm use
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto (hay una plantilla en
`.env.example`). Todas las variables deben llevar el prefijo `VITE_`.

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | Sí | Origen de FinteraAPI incluyendo `/api/v1` (ej. `http://localhost:8081/api/v1`). |
| `VITE_APP_ENV` | No | Entorno de la app (`development`, `staging`, `production`). |
| `VITE_CUSTOMER_PORTAL_URL` | No | Origen público del portal de clientes. Los usuarios con rol `user` son redirigidos aquí tras iniciar sesión y la pantalla de registro enlaza aquí. Por defecto: `https://omegatech.dev/`. |
| `VITE_DEFAULT_EMAIL` | No | Prellena el correo en el login durante desarrollo/staging. |
| `VITE_DEFAULT_PASSWORD` | No | Prellena la contraseña en el login durante desarrollo/staging. |
| `VITE_ROLLBAR_ACCESS_TOKEN` | No | Token de Rollbar para reporte de errores. |
| `VITE_ROLLBAR_ENVIRONMENT` | No | Etiqueta de entorno para Rollbar. Si falta, usa `VITE_APP_ENV` y luego el modo de Vite. |

```env
VITE_API_URL=http://localhost:8081/api/v1
VITE_APP_ENV=development
VITE_CUSTOMER_PORTAL_URL=https://omegatech.dev/
```

`VITE_CUSTOMER_PORTAL_URL` points customer (`user` role) accounts to the
customer portal at `https://omegatech.dev/` by default; the admin app shows a
redirect notice instead of the customer screens.

### 4. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### 5. Construir para Producción
```bash
npm run build
```

### 6. Vista Previa de Producción
```bash
npm run preview
```

### 7. Ejecutar Tests
```bash
npm run test       # modo watch
npm run test:run   # ejecución única (CI)
```

### 8. Linting y verificación
```bash
npm run lint
npm run verify     # lint + test:run + build
```

## 📁 Estructura del Proyecto

```
FinteraUI/
├── public/                    # Archivos estáticos (íconos, logo, manifest)
├── src/
│   ├── assets/                # CSS, imágenes y fuentes
│   ├── features/<dominio>/    # Código por dominio
│   │   ├── api.js             # Llamadas API del dominio (apiClient)
│   │   ├── pages/             # Páginas de ruta (lazy-loaded)
│   │   ├── components/        # Componentes del dominio
│   │   └── hooks/             # Hooks del dominio
│   ├── shared/                # Código reutilizable
│   │   ├── ui/                # Componentes UI (exportados en index.js)
│   │   ├── auth/              # ProtectedRoute, AdminRoute, AdminOrOwnerRoute
│   │   ├── layout/            # Shell de la aplicación
│   │   ├── api/               # Helpers API compartidos
│   │   └── utils/             # Formatters y helpers
│   ├── contexts/              # Auth, Locale, Theme, Toast, Onboarding
│   ├── hooks/                 # Hooks compartidos
│   ├── lib/apiClient.js       # Wrapper fetch para todas las llamadas HTTP
│   ├── locales/               # en.json, es.json
│   ├── App.jsx                # Composición de providers
│   ├── main.jsx               # Punto de entrada
│   └── Router.jsx             # Tabla de rutas
├── documentation/             # Arquitectura, guías, features y QA
├── openspec/                  # Especificaciones de comportamiento (OpenSpec)
├── AGENTS.md                  # Instrucciones para agentes de IA
├── opencode.json              # Configuración de opencode
├── config.js                  # Configuración de API
├── auth.js                    # Utilidades de autenticación
├── package.json               # Dependencias y scripts
├── vite.config.js             # Configuración de Vite
├── tailwind.config.js         # Configuración de Tailwind
├── Dockerfile                 # Imagen de producción (Vite build + Nginx)
├── .docker/nginx.conf.template # Configuración de Nginx para SPA y PWA
└── Procfile                   # Configuración para Heroku
```

> La documentación técnica en `documentation/` está en inglés. El índice está
> en [`documentation/README.md`](documentation/README.md). Los contratos de
> comportamiento viven en [`openspec/`](openspec/).

## 🔄 Flujo de Trabajo de Desarrollo

### 1. Ramas y Versionado
- **main**: Rama principal de producción
- **develop**: Rama de desarrollo con últimas features
- **feature/***: Ramas para nuevas funcionalidades
- **bugfix/***: Ramas para corrección de bugs
- **hotfix/***: Ramas para correcciones urgentes en producción

### 2. Proceso de Desarrollo
1. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Implementar cambios siguiendo las guías de código
3. **Testing**: Ejecutar tests locales y QA
4. **Commit**: Mensajes descriptivos siguiendo conventional commits
5. **Pull Request**: Crear PR hacia develop con descripción detallada
6. **Code Review**: Revisión por al menos un desarrollador
7. **Merge**: Integración a develop tras aprobación
8. **Deploy**: Despliegue automático a staging

### 3. Conventional Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: cambios en herramientas
```

### 4. Code Quality
- **ESLint**: Configurado para React y hooks
- **ESLint**: Configuración flat para React y hooks
- **Testing**: Vitest + Testing Library (tests colocados junto al código)
- **Type Checking**: Uso de PropTypes para validación

### 5. Testing Strategy
- **Unit Tests**: Componentes individuales con Testing Library
- **Integration Tests**: Flujos completos de usuario
- **E2E Tests**: Con Playwright (planeado)
- **QA Manual**: Escenarios documentados en [`documentation/qa/`](documentation/qa/)

## 🚀 Despliegue

### Railway (Producción)
1. Push a rama main
2. Railway detecta cambios en el codigo y hace el autodeploy
3. Build optimizado con Vite
4. Despliegue con Docker (`Dockerfile`) usando Nginx para servir el bundle estático

La imagen se puede construir y ejecutar localmente:

```bash
docker build -t fintera-ui --build-arg VITE_API_URL=https://api.example.com/api/v1 .
docker run --rm -p 8080:8080 -e PORT=8080 fintera-ui
```

Railway inyecta la variable `PORT`; la imagen escucha en ese puerto. Las
variables `VITE_*` se embeben en tiempo de build, así que deben pasarse como
`--build-arg` (o configurarse como build args en Railway) y reconstruir al
cambiarlas. Ver [`documentation/guides/deployment.md`](documentation/guides/deployment.md).

### Configuración PWA
- Assets generados automáticamente con `@vite-pwa/assets-generator`
- Service worker para caching offline
- Manifest para instalación como app

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios siguiendo Conventional Commits (`git commit -m 'feat: agregar AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Contribución
- Seguir el estilo de código establecido
- Agregar tests para nuevas funcionalidades
- Actualizar `documentation/` y `openspec/specs/` según los cambios
- Ejecutar `npm run verify` antes de abrir el PR
- Mantener compatibilidad con versiones anteriores

### Agentes de IA
- Instrucciones: [`AGENTS.md`](AGENTS.md)
- Configuración de opencode: [`opencode.json`](opencode.json)
- Comandos (`/verify`, `/new-feature`, `/new-component`, `/docs-sync`, `/opsx-*`): `.opencode/commands/`
- Especificaciones de comportamiento: [`openspec/`](openspec/)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación en [`documentation/README.md`](documentation/README.md)

## 🔄 Versiones

- **v1.0.0**: Versión inicial con funcionalidades básicas
- Próximas versiones: Mejoras en UX, nuevos reportes, integración con APIs externas

---

Desarrollado con ❤️ por el equipo de Fintera
