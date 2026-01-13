# Guía de Estilo de Diseño e Ingeniería Klef

**Sistema:** Klef · State-Driven UI  
**Filosofía:** Diseño consciente, estructura legible, comportamiento predecible.

---

## 0. Principio Rector (No Negociable)

> **El DOM no se controla directamente. El DOM refleja el estado.**

Todo el sistema parte de esta afirmación fundamental.

---

## 1. Ontología del Sistema

### 1.1 El DOM

El DOM es:

- Un **Mega JSON externo**
- **Mutable** y costoso de tocar
- **No confiable** como fuente de verdad

📌 **El DOM nunca es el estado, solo la proyección visual.**

### 1.2 El Estado (State)

El estado es:

- Un **JSON plano o anidado**
- **Declarativo** y central
- **Legible** y predecible

```javascript
const state = {
  menu: {
    open: false,
  },
  user: null,
  theme: "system",
  scrollY: 0,
};
```

📌 **Si algo importa para la UI, vive en el state.**

---

## 2. Modelado Explícito del DOM (Mapa del Mundo)

### 2.1 Regla Klef #1

**Nunca accedas al DOM sin mapearlo primero.**

```javascript
const DOM = {
  header: document.querySelector("header"),
  menu: document.querySelector("#mainMenu"),
  buttons: {
    toggleMenu: document.querySelector("#btnMenu"),
  },
};
```

Esto es:

- **Cartografía** del territorio
- **Contrato** explícito
- **Límite consciente** de alcance

---

## 3. Configuración Declarativa

Todo valor fijo vive en `config`.

```javascript
const config = {
  menu: {
    openClass: "is-open",
    animationMs: 300,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
  },
};
```

📌 **Nada "mágico" en el código.**

---

## 4. Funciones Klef (Una Tarea, Un Nombre)

### 4.1 Regla Klef #2

**Una función = una intención clara.**

❌ **Prohibido:**

- Funciones que mutan estado y DOM a la vez
- Funciones sin nombre semántico
- Lógica oculta en nombres genéricos

✅ **Permitido:**

```javascript
function toggleMenu() {
  state.menu.open = !state.menu.open;
  renderMenu();
}

function openMenu() {
  state.menu.open = true;
  renderMenu();
}

function closeMenu() {
  state.menu.open = false;
  renderMenu();
}
```

---

## 5. Renderizado Explícito (El DOM Obedece)

### 5.1 Regla Klef #3

**Toda mutación visual pasa por una función render.**

```javascript
function renderMenu() {
  DOM.menu.classList.toggle(config.menu.openClass, state.menu.open);
}

function renderTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function renderUser() {
  if (state.user) {
    DOM.userAvatar.src = state.user.avatar;
    DOM.userName.textContent = state.user.name;
  }
}
```

**Principios:**

- El DOM no decide
- El DOM responde
- El estado manda

---

## 6. Flujo Klef (Arquitectura Mínima)

```
Evento
  ↓
Actualiza State
  ↓
Render
  ↓
DOM
```

**Nunca:**

```
Evento → DOM directo ❌
```

---

## 7. Eventos como Mensajeros

```javascript
DOM.buttons.toggleMenu.addEventListener("click", toggleMenu);
DOM.buttons.closeMenu.addEventListener("click", closeMenu);
```

📌 **El evento no contiene lógica, solo dispara intención.**

---

## 8. Estados Derivados (No Duplicar Verdad)

❌ **Mal:**

```javascript
state.menuClass = "is-open"; // ❌ Duplica verdad
state.menuOpen = true; // ❌ Dos fuentes de verdad
```

✅ **Bien:**

```javascript
state.menu.open = true; // ✅ Una sola fuente de verdad
```

**Las clases, estilos, atributos:**

- Se **derivan** del estado
- No se **almacenan** en el estado

---

## 9. Escalabilidad Klef

Cuando el sistema crece:

- Más propiedades en `state`
- Más funciones `renderX()`
- Nunca más caos

**Patrón recomendado:**

```javascript
function render() {
  renderMenu();
  renderTheme();
  renderUser();
  renderNotifications();
}

// Llamar después de cambios de estado
function updateState(changes) {
  Object.assign(state, changes);
  render();
}
```

---

## 10. Errores Prohibidos (Pecados Klef)

🚫 `querySelector` dentro de funciones de lógica  
🚫 Estado implícito en clases CSS  
🚫 Funciones que "hacen de todo"  
🚫 Lógica en eventos  
🚫 DOM como fuente de verdad  
🚫 Mutación directa sin `render()`

---

## 11. Beneficios Buscados (Intencionales)

✅ **Legibilidad** – El código se lee como prosa  
✅ **Previsibilidad** – Siempre sabes qué cambia  
✅ **Refactor seguro** – Cambios localizados  
✅ **Debug visual** – Estado inspeccionable  
✅ **Código que enseña** – Patrones claros

---

## 12. Axioma Klef (Para Cerrar)

> **El estado dice la verdad.**  
> **El DOM la proclama.**  
> **La función la ejecuta.**

---

## 13. Estructura de Archivos Recomendada

```
/js
  ├── state.js       # Define el estado global
  ├── dom.js         # Mapea elementos del DOM
  ├── config.js      # Configuración y constantes
  ├── render.js      # Funciones de renderizado
  ├── actions.js     # Funciones que actualizan estado
  └── init.js        # Inicialización y eventos
```

---

## 14. Ejemplo Completo Mínimo

```javascript
// state.js
const state = {
  menu: { open: false },
};

// dom.js
const DOM = {
  menu: document.querySelector("#menu"),
  btnToggle: document.querySelector("#btnToggle"),
};

// config.js
const config = {
  menu: { openClass: "is-open" },
};

// actions.js
function toggleMenu() {
  state.menu.open = !state.menu.open;
  renderMenu();
}

// render.js
function renderMenu() {
  DOM.menu.classList.toggle(config.menu.openClass, state.menu.open);
}

// init.js
DOM.btnToggle.addEventListener("click", toggleMenu);
```

---

**Firma del sistema:**

**Klef · State-Driven UI**  
Diseño como arquitectura. Código como lenguaje.

---
