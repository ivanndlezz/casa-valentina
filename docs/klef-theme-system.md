# Sistema de Temas Klef · Variable-Driven

**Filosofía:** Semántica sobre utilidad. Estado sobre clases. Variables sobre valores.

---

## 0. Principio Rector

> **El tema no se aplica directamente. El estado define el tema, las variables lo expresan, el CSS lo proclama.**

---

## 1. Arquitectura del Sistema de Temas

### 1.1 Tres Modos, Un Sistema

```
light   → Tema claro explícito
dark    → Tema oscuro explícito
system  → Respeta preferencia del sistema operativo
```

### 1.2 Flujo de Decisión

```
Usuario elige tema
  ↓
State actualizado
  ↓
Atributo data-theme actualizado
  ↓
Variables CSS reaccionan
  ↓
Estilos aplicados
```

---

## 2. Implementación: Estado y DOM

### 2.1 Estado del Tema

```javascript
const state = {
  theme: "system", // "light" | "dark" | "system"
};
```

### 2.2 Atributo Semántico

```html
<html data-theme="system">
  <!-- Todo el contenido -->
</html>
```

📌 **El atributo `data-theme` es la interfaz entre JS y CSS.**

---

## 3. CSS: Design Tokens con Variables

### 3.1 Variables Base (Valores por Defecto)

```css
:root {
  /* Colores base (light por defecto) */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #0b0b0b;
  --text-secondary: #666666;
  --border: #e0e0e0;
  --accent: #0066cc;

  /* Espaciado */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;

  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
}
```

### 3.2 Tema Explícito: Light

```css
html[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #0b0b0b;
  --text-secondary: #666666;
  --border: #e0e0e0;
  --accent: #0066cc;
}
```

### 3.3 Tema Explícito: Dark

```css
html[data-theme="dark"] {
  --bg-primary: #0b0b0b;
  --bg-secondary: #1a1a1a;
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --border: #333333;
  --accent: #3399ff;
}
```

### 3.4 Tema System (Usa Media Query)

```css
@media (prefers-color-scheme: dark) {
  html[data-theme="system"] {
    --bg-primary: #0b0b0b;
    --bg-secondary: #1a1a1a;
    --text-primary: #f5f5f5;
    --text-secondary: #a0a0a0;
    --border: #333333;
    --accent: #3399ff;
  }
}

@media (prefers-color-scheme: light) {
  html[data-theme="system"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #0b0b0b;
    --text-secondary: #666666;
    --border: #e0e0e0;
    --accent: #0066cc;
  }
}
```

📌 **`@media (prefers-color-scheme)` solo se usa para el modo `system`.**

---

## 4. Uso de Variables en Componentes

### 4.1 Nunca Valores Directos

❌ **Mal:**

```css
body {
  background: white;
  color: black;
}
```

✅ **Bien:**

```css
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background var(--transition-base), color var(--transition-base);
}
```

### 4.2 Componentes Consistentes

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: var(--space-lg);
  color: var(--text-primary);
}

.button-primary {
  background: var(--accent);
  color: var(--bg-primary);
  padding: var(--space-sm) var(--space-md);
  transition: all var(--transition-fast);
}

.button-primary:hover {
  opacity: 0.9;
}
```

---

## 5. JavaScript: Control de Estado

### 5.1 Funciones Klef para Temas

```javascript
// state.js
const state = {
  theme: localStorage.getItem("theme") || "system",
};

// dom.js
const DOM = {
  html: document.documentElement,
  themeToggle: document.querySelector("#themeToggle"),
  themeButtons: {
    light: document.querySelector("[data-theme-btn='light']"),
    dark: document.querySelector("[data-theme-btn='dark']"),
    system: document.querySelector("[data-theme-btn='system']"),
  },
};

// config.js
const config = {
  theme: {
    storageKey: "theme",
    validThemes: ["light", "dark", "system"],
  },
};

// actions.js
function setTheme(newTheme) {
  if (!config.theme.validThemes.includes(newTheme)) {
    console.warn(`Tema inválido: ${newTheme}`);
    return;
  }

  state.theme = newTheme;
  localStorage.setItem(config.theme.storageKey, newTheme);
  renderTheme();
}

function toggleTheme() {
  const themes = config.theme.validThemes;
  const currentIndex = themes.indexOf(state.theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
}

// render.js
function renderTheme() {
  DOM.html.dataset.theme = state.theme;
}

function renderThemeButtons() {
  Object.entries(DOM.themeButtons).forEach(([theme, button]) => {
    if (button) {
      button.classList.toggle("active", state.theme === theme);
      button.setAttribute("aria-pressed", state.theme === theme);
    }
  });
}

// init.js
function initTheme() {
  renderTheme();
  renderThemeButtons();

  // Eventos
  DOM.themeToggle?.addEventListener("click", toggleTheme);

  Object.entries(DOM.themeButtons).forEach(([theme, button]) => {
    button?.addEventListener("click", () => setTheme(theme));
  });
}

// Ejecutar al cargar
initTheme();
```

---

## 6. HTML: Interfaz de Usuario

```html
<!-- Toggle simple -->
<button id="themeToggle" aria-label="Cambiar tema">🌓</button>

<!-- Selector de tres opciones -->
<div class="theme-selector" role="group" aria-label="Selector de tema">
  <button data-theme-btn="light" aria-label="Tema claro">☀️ Claro</button>
  <button data-theme-btn="dark" aria-label="Tema oscuro">🌙 Oscuro</button>
  <button data-theme-btn="system" aria-label="Tema del sistema">
    💻 Sistema
  </button>
</div>
```

---

## 7. Variantes Avanzadas

### 7.1 Variables Semánticas por Contexto

```css
:root {
  /* Superficie */
  --surface-1: var(--bg-primary);
  --surface-2: var(--bg-secondary);
  --surface-3: var(--border);

  /* Texto */
  --text-loud: var(--text-primary);
  --text-soft: var(--text-secondary);

  /* Estados */
  --state-success: #10b981;
  --state-warning: #f59e0b;
  --state-error: #ef4444;
  --state-info: var(--accent);
}
```

### 7.2 Temas Adicionales (Opcional)

```css
html[data-theme="sepia"] {
  --bg-primary: #f4ecd8;
  --bg-secondary: #e8dcc0;
  --text-primary: #5b4636;
  --text-secondary: #8b7355;
}

html[data-theme="high-contrast"] {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --border: #ffffff;
}
```

---

## 8. SSR y Hydration (Sin Flash)

### 8.1 Script Inline en `<head>`

```html
<script>
  (function () {
    const theme = localStorage.getItem("theme") || "system";
    document.documentElement.dataset.theme = theme;
  })();
</script>
```

📌 **Ejecuta antes de renderizar para evitar flash de tema incorrecto.**

---

## 9. Accesibilidad

### 9.1 Contraste Garantizado

```css
/* Asegurar ratios WCAG AA */
html[data-theme="light"] {
  --text-primary: #0b0b0b; /* 16.94:1 con blanco */
}

html[data-theme="dark"] {
  --text-primary: #f5f5f5; /* 16.11:1 con negro */
}
```

### 9.2 Respeto a Preferencias del Usuario

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-base: 0ms;
  }
}
```

---

## 10. Ventajas del Sistema

✅ **Escalable** – Agregar temas = agregar un selector CSS  
✅ **Mantenible** – Cambiar colores = editar variables  
✅ **Predecible** – Flujo claro: estado → atributo → variables  
✅ **Semántico** – `data-theme` > clases utilitarias  
✅ **Performante** – Variables CSS son nativas y rápidas  
✅ **Accesible** – Respeta `prefers-color-scheme`

---

## 11. Errores Comunes a Evitar

🚫 **NO usar clases** como `.dark-mode`, `.light-mode`  
🚫 **NO escribir estilos** dentro de cada `@media`  
🚫 **NO duplicar** CSS para cada tema  
🚫 **NO mezclar** valores directos con variables  
🚫 **NO controlar** tema solo con CSS (sin JS para persistencia)

---

## 12. Axioma del Sistema de Temas

> **El usuario elige.**  
> **El estado persiste.**  
> **Las variables expresan.**  
> **El CSS proclama.**

---

**Klef · Variable-Driven Theming**  
Un tema, infinitas posibilidades. Cero duplicación.
