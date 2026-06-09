# 🎓 UniIncubadora - Sistema de Incubación Universitaria

Un prototipo avanzado de plataforma web diseñada para la simulación, gestión y escalamiento de proyectos universitarios de emprendimiento e innovación. 

Construido con un enfoque obsesivo en la **Experiencia de Usuario (UX)** y una **Interfaz Premium (UI)**, esta aplicación emula un robusto portal institucional que divide sus funcionalidades dependiendo del rol jerárquico del usuario conectado.

## ✨ Características Principales

- **Enrutamiento Sensible al Rol:** El sistema lee la estructuración del correo electrónico para determinar el tipo de sesión (`Emprendedor`, `Administrador` o `Mentor`).
- **Navegación de Una Sola Página (SPA):** Transiciones suaves, micro-animaciones y renderizado condicional inteligente sin recargas del navegador.
- **Micro-Interacciones:** Efectos de _hover_, transformaciones CSS interactuando con la posición del mouse y menús despegables inteligentes en las áreas de perfil y notificaciones.
- **Diseños Estrictamente Tematizados:**
   - 🟢 **Emprendedores:** Tonos verdes (Esperanza, crecimiento e innovación).
   - 🔵 **Administradores:** Azul Marino/Navy Blue (Control, elegancia y autoridad corporativa).
   - 🧪 **Mentores:** Cerceta/Teal (Conocimiento, ciencia y madurez técnica).

---

## 🔑 Credenciales de Prueba (Demo)

El sistema de autenticación actualmente se encuentra en modo prototipo (intercepta el formulario para simular la lógica de enrutamiento). Usa estos correos para viajar entre las diferentes interfaces:

| Rol | Correo a ingresar | Contraseña | ¿Qué vas a ver? |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@universidad.edu.ec` | `(Cualquiera)` | **Portal de Coordinación** para aprobar proyectos y asignar mentores. |
| **Mentor / Experto** | `mentor@universidad.edu.ec` | `(Cualquiera)` | **Panel de Evaluador** para calificar startups y revisar asignaciones. |
| **Emprendedor / Alumno** | `emprendedor@universidad...` | `(Cualquiera)` | **Hoja de Ruta** para interactuar con los steppers, crear proyectos y alertas. |

---

## 🛠️ Stack Tecnológico

La aplicación está íntegramente construida sobre ecosistemas modernos de desarrollo front-end:

- **Framework:** [React 19](https://react.dev/)
- **Lenguaje:** TypeScript (Para un tipado estricto y prevención de errores).
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (Clases utilitarias puras).
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Bundler:** [Vite](https://vitejs.dev/)

---

## 🚀 Instrucciones para Despliegue Local

Sigue estos pasos para correr el prototipo en tu máquina local:

1. Clona el repositorio e ingresa a la carpeta del frontend:
```bash
cd webUniversidad/frontend
```

2. Instala las dependencias principales del proyecto de Node.js:
```bash
npm install
```

3. Levanta el servidor local de desarrollo (Vite):
```bash
npm run dev
```

4. Abre tu navegador web e ingresa usualmente a la URL arrojada por la consola (por lo general `http://localhost:5173`).

---

## 📂 Arquitectura de Componentes

La raíz de componentes de React se divide principalmente en:

*   `App.tsx` 👉 El enrutador central y contenedor de estados globales como el `UserRole`.
*   `Login.tsx` 👉 Pantalla de carga, validación e inicio interactivo.
*   `Dashboard.tsx` 👉 La estación principal del Emprendedor. Incluye los controles de _stepper_ dinámicos.
*   `AdminDashboard.tsx` 👉 Panel estructurado en Azul super corporativo con funciones de aprobación.
*   `MentorDashboard.tsx` 👉 Área de evaluación de Pitch Decks y revisión de portafolio para expertos.
*   `ProjectRegistrationForm.tsx` 👉 Componente reutilizable e inteligente para la creación de encuestas pre-construidas.

Desarrollado con altos estándares de desarrollo de software para el equipo de Innovación.
