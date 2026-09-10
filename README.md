# 🤖 Groq Chat Console

Una interfaz de chat con inteligencia artificial que se comunica con el modelo **Qwen 3.8-27b** a través de la API de [Groq](https://groq.com). Este proyecto es un **prueba de concepto** (proof of concept) que demuestra cómo integrar un LLM en una aplicación web con **Next.js**, incluyendo métricas detalladas de uso de tokens, latencia y velocidad de generación.

---

## ✨ Funcionalidades

- **Chat en tiempo real** con un modelo de lenguaje de última generación (Qwen 3.8-27b).
- **Panel de métricas** con seguimiento acumulado de:
  - Tokens de prompt, completado y totales.
  - Latencia media por respuesta (redondeo servidor → cliente).
  - Velocidad de generación (tokens por segundo).
  - Desglose visual prompt vs. completado.
- **Persistencia de sesión**: el historial de conversación sobrevive a recargas de página gracias a `localStorage`.
- **Interfaz responsive** que se adapta a escritorio y móvil.
- **UI moderna** construida con Tailwind CSS y componentes accesibles.

---

## 📋 Requisitos previos

- **Node.js** 18 o superior
- **pnpm** (recomendado) o npm / yarn
- Una **cuenta gratuita en Groq** y una **API Key**

---

## 🚀 Configuración e instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/groq-chat-console.git
cd groq-chat-console
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa tu API Key de Groq:

```bash
cp .env.example .env
```

Luego edita `.env` y reemplaza el valor de `GROQ_API_KEY` con tu llave real.

> ⚠️ **Importante**: el archivo `.env` contiene credenciales reales y **no debe subirse al repositorio**. El `.gitignore` ya lo excluye automáticamente.

### 4. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador. 🎉

---

## 🔑 Cómo obtener una API Key de Groq

1. Ve a [console.groq.com](https://console.groq.com) y regístrate (o inicia sesión si ya tienes cuenta).
2. Una vez dentro, navega a la sección **API Keys**: [console.groq.com/keys](https://console.groq.com/keys)
3. Haz clic en **"Create API Key"**.
4. Dale un nombre descriptivo (ej. "Chat Console") y pulsa **"Create"**.
5. **Copia la llave generada** inmediatamente. No podrás volver a verla después.
6. Pega esa llave como valor de `GROQ_API_KEY` en tu archivo `.env`.

> 💡 **Nota**: Groq ofrece un **tier gratuito** generoso que permite cientos de consultas diarias sin costo. Con la llave creada podrás usar el modelo `qwen/qwen3.8-27b` sin problemas.

---

## 🏗️ Estructura del proyecto

```
├── .env.example          # Plantilla de variables de entorno
├── app/
│   ├── api/chat/
│   │   └── route.ts      # API route — proxy hacia Groq
│   ├── globals.css       # Estilos globales (Tailwind)
│   ├── layout.tsx        # Layout raíz de la aplicación
│   └── page.tsx          # Página principal
├── components/
│   ├── chat-console.tsx  # Componente principal (estado, lógica, persistencia)
│   ├── chat-header.tsx   # Barra superior con modelo e indicador de estado
│   ├── chat-input.tsx    # Área de texto y botón de envío
│   ├── message-list.tsx  # Lista de mensajes con métricas por respuesta
│   ├── metrics-panel.tsx # Panel lateral de métricas acumuladas
│   └── ui/
│       └── button.tsx    # Componente Button (shadcn/ui)
├── lib/
│   ├── types.ts          # Tipos TypeScript compartidos
│   └── utils.ts          # Utilidades (cn, etc.)
├── public/               # Archivos estáticos
├── next.config.mjs       # Configuración de Next.js
├── package.json          # Dependencias y scripts
├── postcss.config.mjs    # Configuración de PostCSS
├── prompt.md             # Brief original del proyecto
├── tsconfig.json         # Configuración de TypeScript
└── components.json       # Configuración de shadcn/ui
```

---

## 🔍 Cómo funciona

### Flujo de datos

1. **El usuario escribe un mensaje** en el `ChatInput`.
2. `ChatConsole` envía el mensaje al **endpoint** `POST /api/chat` con el historial completo de la conversación.
3. La **API Route** (`app/api/chat/route.ts`) construye la petición a Groq:
   - Agrega un `system prompt` en español.
   - Envía los mensajes del usuario formateados según la especificación de OpenAI (compatible con Groq).
   - Incluye tu API Key en el header `Authorization: Bearer`.
4. **Groq responde** con el contenido generado más un objeto `usage` con métricas:
   - `prompt_tokens`, `completion_tokens`, `total_tokens`
   - `prompt_time`, `completion_time`, `total_time`
5. La API Route mide la **latencia del lado del servidor** y calcula los **tokens por segundo**.
6. El frontend recibe la respuesta, la muestra en el `MessageList` y actualiza el `MetricsPanel`.
7. Todo el estado se **persiste en `localStorage`** automáticamente.

### Modelo utilizado

El proyecto usa `qwen/qwen3.8-27b`, un modelo gratuito disponible en Groq. Es un modelo de razonamiento que puede devolver cadenas de pensamiento internas (con etiquetas `...`), las cuales se filtran automáticamente para mostrar solo la respuesta final.

---

## 🧪 Scripts disponibles

| Comando           | Descripción                             |
|-------------------|-----------------------------------------|
| `pnpm dev`        | Inicia el servidor de desarrollo        |
| `pnpm build`      | Compila la aplicación para producción   |
| `pnpm start`      | Inicia el servidor de producción        |

---

## 📊 Métricas visibles en la UI

### Por mensaje (en cada burbuja del asistente)

| Métrica           | Descripción                                      |
|-------------------|--------------------------------------------------|
| Tokens de prompt  | Tokens consumidos por la entrada del usuario     |
| Tokens completado | Tokens generados en la respuesta                 |
| Tokens totales    | Suma de prompt + completado                      |
| Tokens / segundo  | Velocidad de generación del modelo               |
| Latencia          | Tiempo total de ida y vuelta (ms)                |
| Modelo            | Nombre del modelo utilizado                      |

### Acumuladas (panel lateral)

- **Total acumulado** de tokens con desglose visual prompt vs. completado.
- **Promedios**: latencia media, velocidad media, número de respuestas.
- **Última respuesta**: métricas detalladas del mensaje más reciente.

---

## 🛠️ Tecnologías utilizadas

| Tecnología            | Propósito                                 |
|-----------------------|-------------------------------------------|
| [Next.js 16](https://nextjs.org/) | Framework React con App Router    |
| [React 19](https://react.dev/) | Librería de interfaz de usuario    |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático                |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos utilitarios             |
| [shadcn/ui](https://ui.shadcn.com/) | Componentes de UI accesibles    |
| [Groq API](https://console.groq.com) | Inferencia de LLM ultrarrápida  |
| [Lucide](https://lucide.dev/) | Iconos SVG ligeros                      |

---

## 📄 Licencia

Este proyecto es de uso educativo y demostrativo.

---

Hecho con ❤️ como prueba de concepto para explorar interfaces de IA observables.