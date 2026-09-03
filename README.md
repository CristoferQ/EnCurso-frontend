# EnCurso Frontend

Aplicación frontend para gestionar y visualizar un catálogo de cursos, con autenticación, inscripciones, administración del contenido y soporte multilenguaje.

Este proyecto consume la API REST del backend de EnCurso y representa la capa visual de la experiencia educativa.

---

## Tecnologías

- TypeScript
- Vite
- Tailwind CSS v4
- Vanilla JS modular con componentes nativos
- Lucide Icons
- Fetch API para comunicación con el backend

---

## Funcionalidades principales

- Catálogo de cursos con tarjetas visuales
- Banner del curso destacado
- Modal de detalle de curso con descripción y video opcional
- Registro e inicio de sesión de usuarios
- Inscripción y cancelación de cursos
- CRUD de cursos para administradores
- Gestión del estado de carga, vacío y error
- Selector de idioma ES / EN
- Persistencia de sesión y usuario en localStorage

---

## Estructura del proyecto

```text
src/
├── components/
│   ├── AuthModal/
│   ├── ConfirmModal/
│   ├── CourseCard/
│   ├── CourseDetailModal/
│   ├── CourseForm/
│   ├── CourseModal/
│   ├── FeaturedBanner/
│   ├── LanguageSelector/
│   ├── LoadingSkeleton/
│   ├── StateViews/
│   └── UserModal/
├── config/
│   └── app.config.ts
├── i18n/
│   ├── i18n.service.ts
│   └── translations.ts
├── models/
│   ├── auth.model.ts
│   ├── course.model.ts
│   ├── index.ts
│   └── user.model.ts
├── services/
│   ├── auth.service.ts
│   ├── course.service.ts
│   └── user.service.ts
├── styles/
│   └── global.css
├── utils/
│   └── icon.utils.ts
├── views/
│   └── courseBoard.view.ts
├── main.ts
└── index.html
```

---

## Requisitos

- Node.js 18 o superior
- npm
- Backend EnCurso corriendo en local

---

## Instalación

1. Clona el proyecto
2. Entra a la carpeta raíz
3. Instala dependencias:

```bash
npm install
```

---

## Ejecución local

### Modo desarrollo

```bash
npm run dev
```

La aplicación queda disponible normalmente en:

```text
http://localhost:5173
```

### Build de producción

```bash
npm run build
```

### Ejecutar tests

```bash
npm test
```

### Cobertura de tests

```bash
npm run coverage
```

---

## Variables de entorno

La configuración base se encuentra en `src/config/app.config.ts`.

Por defecto usa:

```text
http://localhost:8080/api/v1
```

Puedes sobreescribirlo con una variable de entorno:

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

En ese caso, el frontend usará esa URL para:

- cursos
- usuarios
- autenticación

---

## Autenticación y roles

La sesión se guarda en `localStorage` con los siguientes datos:

- token JWT
- usuario autenticado

El servicio `AuthService` valida si el usuario está autenticado y si tiene rol administrador para permitir acciones de administración.

---

## Internacionalización

La app soporta español e inglés con `I18nService` y el archivo `src/i18n/translations.ts`.

Se puede cambiar el idioma desde el selector de la interfaz y el texto se re-renderiza dinámicamente sin recargar la página.

---

## Estado de la UI

La interfaz maneja estos estados:

- carga (`showLoading`)
- vacío (`showEmpty`)
- error (`showError`)
- cursos renderizados (`renderCourses`)

Esto mejora la experiencia cuando la API tarda o cuando no hay cursos disponibles.

---

## Nota de desarrollo

Este proyecto está pensado como una SPA moderna para la gestión educativa, con separación clara entre:

- modelos
- servicios
- vistas
- componentes
- configuración global

Esto facilita extender la lógica de negocio y mantener la UI organizada.

---

## Scripts disponibles

```bash
npm run dev     # desarrollo local
npm run build   # compilación de producción
npm run test    # ejecución de tests
npm run coverage # cobertura de tests
```

---