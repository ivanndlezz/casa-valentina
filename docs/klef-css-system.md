# Klef CSS Variable-Driven Design System

**Sistema de diseño basado en variables CSS para arquitectura semántica**

---

**Autor:** Sistema Klef  
**Licencia:** Código abierto, filosofía compartida  
**Versión:** 1.1.0 (Patched)  
**Última actualización:** Enero 2026

---

## Índice

1. [Introducción](#introducción)
2. [Filosofía del Sistema](#filosofía-del-sistema)
3. [Principios Rectores](#principios-rectores)
4. [Arquitectura por Capas](#arquitectura-por-capas)
5. [Sistema de Flags](#sistema-de-flags)
6. [Convenciones de Naming](#convenciones-de-naming)
7. [Patrones de Uso](#patrones-de-uso)
8. [Composición y Escalabilidad](#composición-y-escalabilidad)
9. [Anti-Patrones](#anti-patrones)
10. [Migración](#migración)

---

## Introducción

El **Klef CSS Variable-Driven Design System** transforma CSS de un lenguaje de estilos a un **lenguaje arquitectónico de intención**.

### El Problema

```html
<!-- CSS tradicional: Implementación directa -->
<div
  class="d-flex justify-content-center align-items-center gap-3 bg-dark rounded-lg shadow-md"
>
  <!-- Verboso, framework-dependiente, no semántico -->
</div>
```

### La Solución Klef

```html
<!-- CSS Klef: Declaración de intención -->
<div
  style="--flex: 1; --center: 1; --gap: 1rem; --bg: var(--surface); --radius: 12px"
  class="shadow"
>
  <!-- Semántico, agnóstico, legible -->
</div>
```

### Objetivos del Sistema

1. **Semántica intencional:** El HTML declara _qué quiere hacer_
2. **Independencia de frameworks:** Funciona con cualquier stack
3. **CSS como intérprete:** El CSS materializa la intención
4. **Escalabilidad natural:** Las reglas crecen con el sistema
5. **Legibilidad permanente:** Código que se lee como prosa

---

## Filosofía del Sistema

### Axioma Fundacional

> El CSS no estiliza elementos.  
> El CSS interpreta intenciones declaradas.

### Principio de Transformación

```
HTML declara    →    CSS interpreta    →    Browser renderiza
   INTENCIÓN              REGLAS                  VISUAL
```

### Comparación de Paradigmas

| Paradigma          | Ejemplo                        | Problema                |
| ------------------ | ------------------------------ | ----------------------- |
| **Inline directo** | `style="display: flex"`        | Verboso, no escalable   |
| **Clases utility** | `class="d-flex"`               | Framework-dependiente   |
| **BEM/Clases**     | `class="card__header--active"` | Verboso, rígido         |
| **Klef Flags**     | `style="--flex: 1"`            | ✅ Semántico, escalable |

---

## Principios Rectores

### 1. Semántica sobre Abreviación

> Ninguna abreviación es válida si sacrifica claridad.

```css
/* ❌ Prohibido */
--flx
--grd
--fw

/* ✅ Permitido */
--flex /* display: flex */
--grid /* display: grid */
--font-w /* font-width */
--fill /* -webkit-fill-available */
```

**Regla:** Si un desarrollador nuevo no puede inferir el propósito en 3 segundos, la convención es incorrecta.

### 2. Intención sobre Implementación

```html
<!-- ❌ Implementación -->
<div style="display: flex; justify-content: center;align-items: center"></div>

<!-- ✅ Intención -->
<div style="--flex: 1; --justify: center; --align: center;"></div>
```

**Regla:** Declaramos _qué queremos_, no _cómo se hace_.

### 3. Presencia sobre Valor (con Sintaxis Obligatoria)

Las flags booleanas no dependen del valor específico, pero **SIEMPRE deben tener un valor asignado** por compatibilidad con IDEs.

```html
<!-- ✅ CORRECTO: Siempre con valor -->
<div style="--flex: 1"></div>
<div style="--grid: 1"></div>
<div style="--sticky: 1"></div>

<!-- ❌ INCORRECTO: Sin valor (rompe IDEs y formatters) -->
<div style="--flex"></div>
<div style="--grid"></div>
```

**Convención:** Usar `1` como valor para flags booleanas.

**Razón:**

- VSCode y otros IDEs esperan `propiedad: valor`
- Prettier y formatters requieren sintaxis CSS válida
- Consistencia en todo el código
- Las flags **solo funcionan inline** en el atributo `style=""`

**Regla:** La semántica está en la **presencia de la flag**, no en su valor, pero la sintaxis requiere asignar un valor.

### 4. Recursividad como Ventaja

Una sola regla CSS debe cubrir todos los casos:

```css
/* Una regla, infinitas posibilidades */
[style*="--blur"] {
  backdrop-filter: blur(var(--blur));
}
```

```html
<div style="--blur: 4px"></div>
<div style="--blur: 16px"></div>
<div style="--blur: 32px"></div>
```

**Regla:** Diseña reglas que escalen sin crear nuevas reglas.

### 5. Economía de Abstracción

> **Si CSS nativo es igual o más corto, úsalo directo. No crees flags innecesarias.**

```html
<!-- ❌ PROHIBIDO: Flag más larga que CSS nativo -->
<div style="--font-size: var(--text-xl)"></div>

<!-- ✅ CORRECTO: CSS directo -->
<div style="font-size: var(--text-xl)"></div>

<!-- ✅ CORRECTO: Flag que SÍ aporta valor (más corta) -->
<div style="--w: 100%; --h: 100vh"></div>
```

**Corolario:** Si un patrón visual tiene **un valor fijo predecible** (como una sombra estándar), usa una **clase CSS normal**, no una flag.

```html
<!-- ❌ Flag con default fijo (anti-económico) -->
<div style="--shadow: 1"></div>

<!-- ✅ Clase normal para patrones fijos -->
<div class="shadow"></div>

<!-- ✅ Flag recursiva solo si necesitas variaciones -->
<div style="--shadow: 0 8px 24px rgba(0,0,0,0.15)"></div>
```

**Regla:** Las flags existen para mejorar, no para reemplazar todo el CSS.

---

## Arquitectura por Capas

El sistema se divide en 4 capas conceptuales:

```
┌─────────────────────────────────┐
│    CAPA STATE (data-*)          │  ← Estados con data attributes
├─────────────────────────────────┤
│    CAPA SKIN (clases/variables) │  ← Apariencia visual
├─────────────────────────────────┤
│    CAPA BEHAVIOR (--flags)      │  ← Comportamiento
├─────────────────────────────────┤
│    CAPA LAYOUT (--flags)        │  ← Estructura
└─────────────────────────────────┘
```

### Separación Estado vs Estilo

**Principio Fundamental:**

> **Estados usan `data-*` attributes. Estilos usan CSS Variables o flags o clases.**

```html
<!-- ✅ CORRECTO: Estado separado de estilo -->
<div
  data-state="open"
  data-loading="true"
  style="--blur: 16px; --bg: var(--surface); --p: 1rem"
  class="shadow"
>
  <!-- ❌ INCORRECTO: Estado mezclado con estilo -->
  <div style="--state-open: 1; --loading: 1; --blur: 16px"></div>
</div>
```

### Capa 1: Layout

Define **cómo se organizan** los elementos.

```css
/* Flexbox */
[style*="--flex"] {
  display: flex;
}

[style*="--col"] {
  flex-direction: column;
}

[style*="--row"] {
  flex-direction: row;
}

[style*="--gap"] {
  gap: var(--gap);
}

/* Grid */
[style*="--grid"] {
  display: grid;
}

[style*="--grid-cols"] {
  grid-template-columns: var(--grid-cols);
}

/* Spacing */
[style*="--p"] {
  padding: var(--p);
}

[style*="--m"] {
  margin: var(--m);
}
```

**Uso:**

```html
<section style="--flex: 1; --col: 1; --gap: 2rem; --p: 1rem">
  <div>Item 1</div>
  <div>Item 2</div>
</section>
```

### Capa 2: Behavior

Define **comportamiento visual** o estructural.

```css
/* Positioning */
[style*="--sticky"] {
  position: sticky;
}

/* ⚠️ NO incluir valores por defecto fijos como top: 0
   El usuario debe especificar top inline si lo necesita */

[style*="--fixed"] {
  position: fixed;
}

[style*="--absolute"] {
  position: absolute;
}

[style*="--relative"] {
  position: relative;
}

/* Alignment */
[style*="--center"] {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Scroll */
[style*="--scroll"] {
  overflow: auto;
}

[style*="--scroll-x"] {
  overflow-x: auto;
  overflow-y: hidden;
}

/* Overlay */
[style*="--overlay"] {
  position: absolute;
  inset: 0;
  background: var(--overlay, rgba(0, 0, 0, 0.5));
}
```

**Uso:**

```html
<!-- ✅ CORRECTO: Usuario especifica valores inline -->
<header style="--sticky: 1; top: 0">
  <nav style="--flex: 1; --center: 1; --gap: 1rem">
    <!-- Nav items -->
  </nav>
</header>

<!-- ✅ CORRECTO: Sticky con otro valor -->
<aside style="--sticky: 1; top: 64px; left: 0">
  <!-- Sidebar -->
</aside>
```

### Capa 3: Skin

Define **apariencia visual**.

```css
/* Colores */
[style*="--bg"] {
  background: var(--bg);
}

[style*="--fg"] {
  color: var(--fg);
}

/* Bordes */
[style*="--radius"] {
  border-radius: var(--radius);
}

[style*="--border"] {
  border: var(--border);
}

/* Efectos - Solo flags recursivas */
[style*="--blur"] {
  backdrop-filter: blur(var(--blur));
}

/* Tipografía - Solo flags que aportan valor */
[style*="--font-w"] {
  font-weight: var(--font-w);
}

/* NOTA: font-size se usa directo, no necesita flag
   Ejemplo: style="font-size: var(--font-size-xl)"
   Es más corto que: style="--font-size: var(--font-size-xl)"
*/
```

**⚠️ SOMBRAS: Usar clases normales para patrones fijos**

```css
/* ✅ CORRECTO: Clases para sombras estándar */
.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shadow-md {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.shadow-lg {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
}

/* ✅ Flag recursiva solo para valores custom */
[style*="--shadow"] {
  box-shadow: var(--shadow);
}
```

**Uso:**

```html
<!-- ✅ Clase para sombra estándar -->
<div
  style="--bg: var(--surface); --fg: var(--text); --radius: 12px"
  class="shadow"
>
  <h2 style="font-size: 2rem; --font-w: 700">Title</h2>
</div>

<!-- ✅ Flag solo para custom -->
<div style="--shadow: 0 20px 40px rgba(0,0,0,0.3); --radius: 16px">
  Custom shadow
</div>
```

### Capa 4: State (Estados con Data Attributes)

Define **estados del componente** usando `data-*` attributes, NO CSS Variables.

**⚠️ IMPORTANTE:** Los estados booleanos usan `data-state`, NO `style="--estado"`.

```css
/* Estados usando data attributes */
[data-state="active"] {
  opacity: 1;
  pointer-events: auto;
}

[data-state="disabled"] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

[data-loading="true"] {
  position: relative;
  pointer-events: none;
}

[data-loading="true"]::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-error="true"] {
  border-color: var(--color-error);
  color: var(--color-error);
}
```

**Uso:**

```html
<button data-state="disabled">Cannot Click</button>
<div data-loading="true">Processing...</div>
<input data-error="true" />
```

**Razón:** Los data attributes separan semánticamente el **estado** (qué es) del **estilo** (cómo se ve).

---

## Sistema de Flags

### Matriz de Decisión: ¿Qué Usar?

| Tipo                        | Usar                  | Ejemplo                      | Razón                           |
| --------------------------- | --------------------- | ---------------------------- | ------------------------------- |
| **Estado booleano**         | `data-state="value"`  | `data-state="open"`          | Semántica de estado             |
| **Estado con contexto**     | `data-loading="true"` | `data-loading`, `data-error` | Múltiples estados simultáneos   |
| **Valor dinámico visual**   | `--variable: value`   | `--blur: 16px`               | Valor que cambia visualmente    |
| **Composición layout**      | `--flag: 1`           | `--flex: 1; --center: 1`     | Agrupa propiedades              |
| **Patrón visual fijo**      | `class="nombre"`      | `class="shadow"`             | Patrón predecible, reutilizable |
| **Estilo único no común**   | CSS directo           | `font-size: 1rem`            | Más corto que flag              |
| **Componente completo**     | `class="nombre"`      | `class="card"`               | Múltiples props estáticas       |
| **Variación de componente** | Flag + valor          | `--card-size: large`         | Modificadores dinámicos         |

### Tipos de Flags

#### 1. Flags de Presencia (Boolean)

Requieren valor `1` por compatibilidad, pero su semántica es booleana.

```html
<div style="--flex: 1"></div>
<div style="--grid: 1"></div>
<div style="--sticky: 1"></div>
<div style="--center: 1"></div>
```

#### 2. Flags con Valor (Paramétrico)

Requieren un valor para funcionar.

```html
<div style="--gap: 1rem"></div>
<div style="--bg: #ffffff"></div>
<div style="--radius: 8px"></div>
<div style="--blur: 12px"></div>
```

#### 3. Componentes con Clases

Para patrones visuales completos y predecibles, **usa clases CSS normales**.

```css
/* ✅ CORRECTO: Clase para componente con estilo fijo */
.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}
```

```html
<!-- ✅ CORRECTO: Componentes con clases -->
<article class="card shadow">
  <header style="--flex: 1; --row: 1; --gap: 0.5rem">
    <h3 style="font-size: 1.25rem; --font-w: 600">Card Title</h3>
  </header>
  <div style="color: var(--text-secondary); font-size: 0.95rem">
    <p>Card content goes here with semantic styling.</p>
  </div>
  <footer style="--flex: 1; --row: 1; --gap: 0.5rem">
    <button class="btn" style="--bg: var(--primary); --fg: white">
      Action
    </button>
  </footer>
</article>
```

### Composición de Flags

Las flags están diseñadas para **componerse**, pero los estados se separan:

```html
<!-- ✅ CORRECTO: Estado + Clases + Flags -->
<section
  data-state="expanded"
  data-loading="false"
  class="shadow"
  style="
    --flex: 1; 
    --col: 1; 
    --gap: 2rem; 
    --p: 2rem; 
    --bg: var(--surface); 
    --radius: 16px
  "
>
  <header style="--flex: 1; --row: 1; --gap: 1rem">
    <h2>Title</h2>
  </header>
  <div style="--scroll: 1; --p: 1rem">Content</div>
</section>

<!-- ❌ INCORRECTO: Todo mezclado -->
<section
  style="--expanded: 1; --loading: 0; --flex: 1; --col: 1; --gap: 2rem; --shadow: 1"
></section>
```

---

## Convenciones de Naming

### Abreviaturas Aceptadas

| Abreviatura | Significado | Contexto              |
| ----------- | ----------- | --------------------- |
| `bg`        | background  | Color/imagen de fondo |
| `fg`        | foreground  | Color de texto        |
| `p`         | padding     | Espaciado interno     |
| `m`         | margin      | Espaciado externo     |
| `w`         | width       | Ancho (cuando claro)  |
| `h`         | height      | Alto (cuando claro)   |
| `min`       | minimum     | Valor mínimo          |
| `max`       | maximum     | Valor máximo          |
| `pos`       | position    | Posicionamiento       |
| `rel`       | relative    | Posición relativa     |
| `abs`       | absolute    | Posición absoluta     |

### Componentes Semánticos

**⚠️ NOTA:** Estos deben ser **clases CSS normales**, no flags.

| Nombre  | Uso                   |
| ------- | --------------------- |
| `.btn`  | Botones               |
| `.card` | Tarjetas de contenido |
| `.nav`  | Navegación            |
| `.hero` | Sección hero          |
| `.form` | Formularios           |
| `.grid` | Layouts grid          |

### Reglas de Naming

1. **Dos palabras máximo:**
   `--font-size` ✅,
   `--primary-button-background-color` ❌
2. **Contexto claro:** `--font-w` (weight) vs `--full-w` (width)
3. **No inventar:** Usa términos CSS estándar
4. **Semántica sobre brevedad:** `--center` > `--cnt`

---

## Patrones de Uso

### Patrón: Card Component

```html
<article class="card shadow" style="--flex: 1; --col: 1; --gap: 1rem">
  <header style="--flex: 1; --row: 1; --gap: 0.5rem">
    <img src="icon.svg" style="--w: 24px; --h: 24px" alt="" />
    <h3 style="font-size: 1.25rem; --font-w: 600">Card Title</h3>
  </header>

  <div style="color: var(--text-secondary); font-size: 0.95rem">
    <p>Card content goes here with semantic styling.</p>
  </div>

  <footer style="--flex: 1; --row: 1; --gap: 0.5rem">
    <button class="btn" style="--bg: var(--primary); --fg: white">
      Action
    </button>
  </footer>
</article>
```

**CSS:**

```css
.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Patrón: Layout de Página

```html
<div style="--grid: 1; --grid-cols: 250px 1fr; --gap: 2rem; --h: 100vh">
  <!-- Sidebar -->
  <aside
    data-state="expanded"
    style="--flex: 1; --col: 1; --gap: 1rem; --p: 2rem; --bg: var(--surface)"
  >
    <nav style="--flex: 1; --col: 1; --gap: 0.5rem">
      <!-- Nav items -->
    </nav>
  </aside>

  <!-- Main content -->
  <main style="--flex: 1; --col: 1; --gap: 2rem; --p: 2rem; --scroll: 1">
    <header style="--sticky: 1; top: 0; --bg: var(--background); --p: 1rem">
      <h1 style="font-size: 2rem; --font-w: 700">Page Title</h1>
    </header>

    <section
      style="--grid: 1; --grid-cols: repeat(auto-fit, minmax(300px, 1fr)); --gap: 1.5rem"
    >
      <!-- Cards grid -->
    </section>
  </main>
</div>
```

**CSS:**

```css
/* Sidebar states */
[data-state="expanded"] {
  width: 250px;
}

[data-state="collapsed"] {
  width: 60px;
}

aside {
  transition: width 0.3s ease;
}
```

### Patrón: Glassmorphism

```html
<div
  class="glass"
  style="
  --blur: 16px;
  --bg: rgba(255,255,255,0.1);
  --radius: 20px;
  --border: 1px solid rgba(255,255,255,0.2);
  --p: 2rem
"
>
  Glassmorphism effect
</div>
```

```css
/* ✅ Clase para el efecto glass completo */
.glass {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ✅ Flag recursiva solo para blur custom */
[style*="--blur"] {
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
}
```

---

## Composición y Escalabilidad

### Tokens de Diseño

Definir tokens globales:

```css
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-surface: #ffffff;
  --color-background: #f8fafc;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-error: #ef4444;
  --color-success: #10b981;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

**Uso con flags:**

```html
<div
  style="--bg: var(--color-surface); --p: var(--space-lg); --radius: var(--radius-md)"
>
  <h2 style="font-size: var(--font-size-xl); --font-w: 600">Content</h2>
</div>
```

### Dark Mode

```css
[data-theme="dark"] {
  --color-surface: #1e293b;
  --color-background: #0f172a;
  --color-text: #f1f5f9;
  --color-text-secondary: #cbd5e1;
}
```

```javascript
// Desde State-Driven UI
function renderTheme() {
  document.body.setAttribute("data-theme", state.theme);
}
```

---

## Anti-Patrones

### ❌ Flags Verbosas

```html
<!-- Prohibido -->
<div style="--background-color: red; --padding-top: 20px"></div>

<!-- Correcto -->
<div style="--bg: red; padding-top: 20px; margin-rigth: 20px"></div>

<!-- O // Prestado de Tailwind -->
<div style="--bg: red; --pt: 20px; --mr:20px;"></div>
```

### ❌ Duplicar CSS Nativo (Flags Más Largas)

```html
<!-- Prohibido: más largo que CSS nativo -->
<div style="--display-flex-direction-row: 1"></div>
<h2 style="--font-size: var(--text-xl)"></h2>

<!-- Correcto: flag corta O CSS directo -->
<div style="--flex: 1; --row: 1"></div>
<h2 style="font-size: var(--text-xl)"></h2>
```

**Principio de Economía:** Si la flag es más larga que el CSS original, NO la crees.

### ❌ Abreviaciones Arbitrarias

```html
<!-- Prohibido: inventar sin consenso -->
<div style="--flx: 1; --cnt: 1; --grd: 1"></div>

<!-- Correcto: términos estándar -->
<div style="--flex: 1; --center: 1; --grid: 1"></div>
```

### ❌ Valores Hardcodeados

```html
<!-- En lugar de: valores mágicos -->
<div style="--bg: #3b82f6; --p: 24px"></div>

<!-- preferir: usar tokens -->
<div style="--bg: var(--color-primary); --p: var(--space-xl)"></div>
```

### ❌ Flags Redundantes

```html
<!-- Prohibido: redunda con CSS nativo -->
<div style="--width: 100%; --height: 50vh"></div>

<!-- Correcto: usar flags solo cuando aportan -->
<div style="--w: 100%; --h: 50vh"></div>

<!-- O mejor: CSS directo si es un valor único -->
<div style="width: 100%; height: 50vh"></div>
```

### ❌ Estados en CSS Variables

```html
<!-- ❌ PROHIBIDO: Estados como CSS Variables -->
<div style="--state-open: 1; --loading: 1"></div>

<!-- ✅ CORRECTO: Estados en data attributes -->
<div data-state="open" data-loading="true"></div>
```

**Razón:** Los data attributes son semánticamente correctos para estados, se inspeccionan mejor en DevTools, y separan claramente **qué es** (estado) de **cómo se ve** (estilo).

### ❌ Flags con Valores por Defecto Fijos

```html
<!-- ❌ PROHIBIDO: Flag con valor por defecto fijo -->
<div style="--shadow: 1"></div>
```

```css
/* ❌ ANTI-PATRÓN */
[style*="--shadow"] {
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
}
```

```html
<!-- ✅ CORRECTO: Usar clase normal para patrones estáticos -->
<div class="shadow"></div>
```

```css
/* ✅ CORRECTO */
.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shadow-md {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.shadow-lg {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
}
```

```html
<!-- ✅ CORRECTO: Flag recursiva solo si permite variaciones dinámicas -->
<div style="--shadow: 0 4px 16px rgba(0, 0, 0, 0.2)"></div>
```

```css
/* ✅ CORRECTO: Flag sin default, usuario especifica valor */
[style*="--shadow"] {
  box-shadow: var(--shadow);
}
```

**Razón:** Las flags deben ser recursivas y permitir variaciones dinámicas. Si el valor es siempre el mismo, una clase CSS es más eficiente, legible y mantenible. Esto alinea con el Principio de Economía de Abstracción: evita flags innecesarias que no aportan valor sobre CSS nativo o clases. Prioriza clases normales (`.shadow`, `.card`, `.btn`) para patrones predecibles, y reserva flags para composición inline dinámica.

### ❌ Flags con Defaults Fijos en Position

```html
<!-- ❌ PROHIBIDO: Flag que impone valores -->
<div style="--sticky: 1"></div>
```

```css
/* ❌ ANTI-PATRÓN: Default fijo no flexible */
[style*="--sticky"] {
  position: sticky;
  top: var(--sticky-top, 0); /* ❌ No asumas top: 0 */
}
```

```html
<!-- ✅ CORRECTO: Usuario especifica valores inline -->
<div style="--sticky: 1; top: 0"></div>
<div style="--sticky: 1; top: 64px; left: 0"></div>
```

```css
/* ✅ CORRECTO: Flag solo declara position */
[style*="--sticky"] {
  position: sticky;
}
```

**Razón:** La flag `--sticky` solo debe declarar `position: sticky`. El usuario especifica `top`, `bottom`, `left`, `right` directamente en el HTML según su necesidad. No asumas valores por defecto que limiten la flexibilidad.

---

## Migración

### Desde Tailwind/Utility CSS

```html
<!-- Antes: Tailwind -->
<div
  class="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md opacity-50 pointer-events-none"
>
  Content
</div>

<!-- Después: Klef -->
<div
  data-state="disabled"
  class="shadow"
  style="--flex: 1; --col: 1; --gap: 1rem; --p: 1.5rem; --bg: var(--surface); --radius: 12px"
>
  Content
</div>
```

**CSS Klef:**

```css
[data-state="disabled"] {
  opacity: 0.5;
  pointer-events: none;
}

.shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Desde BEM/Clases

```html
<!-- Antes: BEM -->
<div class="card card--featured card--large">
  <div class="card__header">Title</div>
  <div class="card__body">Content</div>
</div>

<!-- Después: Klef -->
<article class="card" style="--gap: var(--space-lg)">
  <header style="font-size: var(--font-size-xl); --font-w: 600">Title</header>
  <div>Content</div>
</article>
```

**CSS:**

```css
.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}
```

---

## Conclusión

El sistema Klef CSS transforma el desarrollo web de:

**Escribir CSS** → **Declarar intenciones**

### Reglas de Oro Klef CSS

1. **Semántica sobre conveniencia:** Nombres claros > abreviaciones oscuras
2. **Intención sobre implementación:** Declarar qué > cómo
3. **Presencia sobre valor:** Flags booleanas con valor `1` para compatibilidad
4. **Recursividad:** Una regla, infinitas posibilidades (sin defaults fijos)
5. **Economía:** Si CSS nativo es igual o más corto, úsalo directo

### Cuándo crear una Flag

✅ **Crear flag SI:**

- Agrupa múltiples propiedades (`--flex`, `--center`)
- Es más corta que el CSS original (`--w` vs `width`)
- Declara intención semántica (`--grid`, `--scroll`)
- Es un patrón repetitivo en tu proyecto
- Permite variaciones dinámicas (`--blur: 4px | 16px | 32px`)

❌ **NO crear flag SI:**

- Es más larga que el CSS original
- Redunda con una propiedad CSS simple
- No aporta claridad semántica
- Solo se usa una vez
- Tiene un valor por defecto fijo (usa clase normal: `.shadow`, `.card`, `.btn`)
- Impone valores que deberían ser especificados por el usuario (ej. `top: 0` en `--sticky`)

### Estados vs Estilos vs Componentes

✅ **Usar `data-*` attributes para:**

- Estados booleanos (`data-state="open"`)
- Estados de aplicación (`data-loading="true"`)
- Flags de contexto (`data-error="true"`)
- Cualquier cosa que represente **qué es** el elemento

✅ **Usar Clases CSS normales para:**

- Componentes completos (`.card`, `.btn`, `.nav`)
- Patrones visuales fijos (`.shadow`, `.glass`)
- Efectos predecibles (`.fade-in`, `.slide-up`)

✅ **Usar CSS Variables para:**

- Valores dinámicos visuales (`--blur: 16px`)
- Tokens de diseño (`--primary`, `--spacing`)
- Valores que calculan o heredan

✅ **Usar Flags para:**

- Composición de layout (`--flex: 1; --center: 1`)
- Comportamientos comunes (`--sticky: 1`, `--scroll: 1`)
- Abreviaciones útiles (`--w`, `--h`, `--p`)

✅ **Usar CSS Directo para:**

- Propiedades únicas (`font-size: 1rem`)
- Valores específicos no reutilizables
- Cuando es más corto que una flag
- Valores de posicionamiento (`top: 64px`, `left: 0`)

### Resultado

Esto resulta en:

- ✅ Código más legible
- ✅ Mantenimiento simplificado
- ✅ Escalabilidad natural
- ✅ Independencia de frameworks
- ✅ Curva de aprendizaje reducida
- ✅ Separación clara: estado | componentes | comportamiento | valores

---

**Este es el estándar Klef para CSS.**

### Cambios en v1.1.0

- ✅ Corregido: Flags de posicionamiento no imponen defaults (`--sticky` sin `top: 0`)
- ✅ Corregido: Sombras usan clases (`.shadow`) en lugar de flags con defaults
- ✅ Mejorado: Ejemplos actualizados con clases para componentes (`.card`, `.btn`)
- ✅ Aclarado: Matriz de decisión expandida (cuándo usar clases vs flags)
- ✅ Reforzado: Principio de Economía de Abstracción con ejemplos corregidos
- ✅ Eliminado: Anti-patrón de `var(--shadow, default_fijo)`
- ✅ Agregado: Sección de clases para componentes completos
