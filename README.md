# ⚡ En Curso

> 🎓 **Proyecto Educativo:** Este repositorio forma parte del material práctico del curso **"Frontend Dinámico con TypeScript y Vite"**, enfocado en el aprendizaje de TypeScript, desarrollo web Vanilla y buenas prácticas de arquitectura frontend asistidas por Inteligencia Artificial.

---

## 📌 Sobre el Proyecto

**EnCurso** es una aplicación web interactiva para la gestión y visualización de cursos en línea y contenido educativo.

El proyecto demuestra cómo construir aplicaciones **Vanilla mantenibles y escalables sin depender de frameworks pesados**, poniendo especial énfasis en:

1. **El valor del tipado fuerte (*Strong Typing*):** Demostrar cómo TypeScript previene errores en tiempo de compilación, garantiza la integridad del dominio (`Course`, `CourseStatus`) y permite refactorizaciones seguras.
2. **Organización por Componentes (*Component Directory Pattern*):** Estructurar el código modularmente en carpetas dedicadas por componente (`CourseCard/`, `FeaturedBanner/`), encapsulando su lógica, HTML declarativo y exportaciones limpias mediante archivos `index.ts`.
3. **Buenas Prácticas de Arquitectura Frontend:** Separación estricta de responsabilidades, desarrollo asistido por **IA**, renderizado resiliente y tooling moderno de alto rendimiento.

---

## 🚀 Tecnologías Utilizadas

- **Core:** TypeScript + Vite 8
- **Estilos & UI:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Iconografía:** Lucide Icons (`lucide`)
- **Arquitectura:** Componentes modulares Vanilla con TypeScript estricto.

---

## 🛠️ Instalación y Ejecución Local

### 1. Clonar el repositorio e instalar dependencias:
```bash
npm install
```

### 2. Ejecutar servidor de desarrollo:
```bash
npm run dev
```

### 3. Compilar para producción y verificar tipos TypeScript:
```bash
npm run build
```