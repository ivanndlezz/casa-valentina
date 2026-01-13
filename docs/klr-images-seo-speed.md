# Sistema de Imágenes Klef · SEO & Speed Optimized

**Filosofía:** Estado sobre carga. Intención sobre ejecución. Semántica sobre performance.

---

## 0. Principio Rector

> **Las imágenes no se cargan directamente. El estado decide qué cargar, cuándo y cómo.**

---

## 1. Arquitectura del Sistema

### 1.1 Tres Componentes Fundamentales

```
Registro HTML (Manifiesto)
  ↓
Estado (Control)
  ↓
Renderizado (Ejecución)
```

### 1.2 Ontología

- **Registro HTML** = Definición de intenciones (SEO-friendly)
- **Estado** = Verdad sobre qué se ve y qué se cargó
- **Skeletons** = Placeholders mientras se hidrata
- **Observer** = Mensajero de visibilidad

---

## 2. Estructura HTML: Registro de Imágenes

### 2.1 Manifiesto Oculto (SEO-Crawleable)

```html
<!-- Registro oculto pero semántico -->
<div id="seo-imgs" style="display:none;">
  <!-- Hero -->
  <img
    data-id="img-hero"
    data-section="hero"
    data-target="#hero-container"
    data-src="https://example.com/hero.webp"
    data-alt="Hero principal"
    data-animation="fade-in"
    loading="lazy"
  />

  <!-- Gallery -->
  <img
    data-id="img-gallery-1"
    data-section="gallery"
    data-target=".gallery-item:nth-child(1)"
    data-src="https://example.com/gallery-1.webp"
    data-alt="Producto 1"
    data-animation="zoom"
    loading="lazy"
  />

  <img
    data-id="img-gallery-2"
    data-section="gallery"
    data-target=".gallery-item:nth-child(2)"
    data-src="https://example.com/gallery-2.webp"
    data-alt="Producto 2"
    data-animation="slide-up"
    loading="lazy"
  />
</div>
```

### 2.2 Skeletons en el DOM Real

```html
<!-- Hero section -->
<section id="hero-container">
  <div
    class="skeleton skeleton-image"
    data-skeleton="img-hero"
    style="aspect-ratio: 16/9;"
  ></div>
</section>

<!-- Gallery section -->
<div class="gallery">
  <div
    class="gallery-item skeleton skeleton-image"
    data-skeleton="img-gallery-1"
    style="aspect-ratio: 4/3;"
  ></div>
  <div
    class="gallery-item skeleton skeleton-image"
    data-skeleton="img-gallery-2"
    style="aspect-ratio: 4/3;"
  ></div>
</div>
```

📌 **Los skeletons son el DOM inicial. Las imágenes se hidratan.**

---

## 3. Estado del Sistema de Imágenes

```javascript
// state.js
const state = {
  images: {
    loaded: new Set(), // IDs ya cargadas
    visible: new Set(), // IDs en viewport
    failed: new Set(), // IDs con error
    hydrated: false, // Sistema inicializado
  },
};
```

📌 **El estado no almacena las imágenes, almacena su estado de existencia.**

---

## 4. Mapeo del DOM

```javascript
// dom.js
const DOM = {
  registry: null,
  templates: new Map(),
  skeletons: new Map(),
  observer: null,
};

function mapImageDOM() {
  DOM.registry = document.querySelector("#seo-imgs");

  // Mapear templates
  const templates = DOM.registry.querySelectorAll("img[data-id]");
  templates.forEach((template) => {
    DOM.templates.set(template.dataset.id, template);
  });

  // Mapear skeletons
  const skeletons = document.querySelectorAll("[data-skeleton]");
  skeletons.forEach((skeleton) => {
    DOM.skeletons.set(skeleton.dataset.skeleton, skeleton);
  });
}
```

---

## 5. Configuración

```javascript
// config.js
const config = {
  images: {
    skeletonClass: "skeleton-image",
    pulseAnimation: "pulse",
    transitionMs: 500,
    rootMargin: "100px", // Cargar 100px antes de viewport
    threshold: 0.01,
  },
  animations: {
    "fade-in": "animate-fade-in",
    zoom: "animate-zoom",
    "slide-up": "animate-slide-up",
  },
};
```

---

## 6. Funciones Klef: Acciones

```javascript
// actions.js

function markImageAsVisible(imageId) {
  state.images.visible.add(imageId);
}

function markImageAsLoaded(imageId) {
  state.images.loaded.add(imageId);
  state.images.visible.delete(imageId);
}

function markImageAsFailed(imageId) {
  state.images.failed.add(imageId);
  state.images.visible.delete(imageId);
}

function loadImage(imageId) {
  if (state.images.loaded.has(imageId)) return;
  if (state.images.failed.has(imageId)) return;

  markImageAsVisible(imageId);
  renderImage(imageId);
}
```

---

## 7. Funciones Klef: Renderizado

```javascript
// render.js

function renderImage(imageId) {
  const template = DOM.templates.get(imageId);
  const skeleton = DOM.skeletons.get(imageId);

  if (!template || !skeleton) {
    console.warn(`Imagen ${imageId} no encontrada`);
    return;
  }

  const img = createImageFromTemplate(template);

  img.addEventListener("load", () => {
    markImageAsLoaded(imageId);
    replaceSkeletonWithImage(skeleton, img);
  });

  img.addEventListener("error", () => {
    markImageAsFailed(imageId);
    renderImageError(skeleton);
  });
}

function createImageFromTemplate(template) {
  const img = document.createElement("img");
  img.src = template.dataset.src;
  img.alt = template.dataset.alt;
  img.loading = "lazy";

  const animation = template.dataset.animation;
  if (animation && config.animations[animation]) {
    img.classList.add(config.animations[animation]);
  }

  return img;
}

function replaceSkeletonWithImage(skeleton, img) {
  skeleton.style.animation = `fadeOut ${config.images.transitionMs}ms ease`;

  setTimeout(() => {
    skeleton.replaceWith(img);
  }, config.images.transitionMs);
}

function renderImageError(skeleton) {
  skeleton.classList.add("skeleton-error");
  skeleton.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            stroke="currentColor" stroke-width="2"/>
    </svg>
  `;
}
```

---

## 8. Intersection Observer

```javascript
// observer.js

function initImageObserver() {
  const options = {
    root: null,
    rootMargin: config.images.rootMargin,
    threshold: config.images.threshold,
  };

  DOM.observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const imageId = entry.target.dataset.skeleton;
        loadImage(imageId);
        DOM.observer.unobserve(entry.target);
      }
    });
  }, options);

  // Observar todos los skeletons
  DOM.skeletons.forEach((skeleton) => {
    DOM.observer.observe(skeleton);
  });
}
```

---

## 9. Inicialización

```javascript
// init.js

function initImages() {
  mapImageDOM();
  initImageObserver();
  state.images.hydrated = true;
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initImages);
} else {
  initImages();
}
```

---

## 10. CSS: Skeletons y Animaciones

```css
/* Skeleton base */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--border) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  display: block;
}

/* Animación de pulso */
@keyframes pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Fade out del skeleton */
@keyframes fadeOut {
  to {
    opacity: 0;
  }
}

/* Estado de error */
.skeleton-error {
  background: var(--state-error);
  opacity: 0.1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--state-error);
}

/* Animaciones de entrada de imágenes */
.animate-fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-zoom {
  animation: zoom 0.5s ease;
}

@keyframes zoom {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reducir movimiento si el usuario lo prefiere */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }

  .animate-fade-in,
  .animate-zoom,
  .animate-slide-up {
    animation: none;
  }
}
```

---

## 11. Optimizaciones Avanzadas

### 11.1 Soporte para WebP con Fallback

```html
<img
  data-id="img-hero"
  data-src="https://example.com/hero.webp"
  data-src-fallback="https://example.com/hero.jpg"
  data-alt="Hero"
/>
```

```javascript
function createImageFromTemplate(template) {
  const img = document.createElement("img");
  const webpSrc = template.dataset.src;
  const fallbackSrc = template.dataset.srcFallback;

  // Detectar soporte WebP
  if (supportsWebP()) {
    img.src = webpSrc;
  } else if (fallbackSrc) {
    img.src = fallbackSrc;
  } else {
    img.src = webpSrc; // Intentar de todos modos
  }

  img.alt = template.dataset.alt;
  return img;
}

// Cache del resultado
let webpSupport = null;
function supportsWebP() {
  if (webpSupport !== null) return webpSupport;

  const canvas = document.createElement("canvas");
  if (canvas.getContext && canvas.getContext("2d")) {
    webpSupport =
      canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  } else {
    webpSupport = false;
  }

  return webpSupport;
}
```

### 11.2 Prioridad de Carga

```html
<img data-id="img-hero" data-priority="high" data-src="hero.webp" />
```

```javascript
function loadImage(imageId) {
  const template = DOM.templates.get(imageId);
  const priority = template.dataset.priority;

  if (priority === "high") {
    // Cargar inmediatamente sin esperar viewport
    markImageAsVisible(imageId);
    renderImage(imageId);
    return;
  }

  // Lógica normal para prioridad media/baja
  // ...
}
```

### 11.3 Srcset para Imágenes Responsive

```html
<img
  data-id="img-hero"
  data-src="hero-800w.webp"
  data-srcset="hero-400w.webp 400w, hero-800w.webp 800w, hero-1200w.webp 1200w"
  data-sizes="(max-width: 768px) 100vw, 50vw"
/>
```

```javascript
function createImageFromTemplate(template) {
  const img = document.createElement("img");
  img.src = template.dataset.src;

  if (template.dataset.srcset) {
    img.srcset = template.dataset.srcset;
  }

  if (template.dataset.sizes) {
    img.sizes = template.dataset.sizes;
  }

  img.alt = template.dataset.alt;
  return img;
}
```

---

## 12. SEO: JSON-LD para Imágenes

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": "https://example.com/hero.webp",
    "description": "Hero principal",
    "name": "Hero",
    "uploadDate": "2024-01-01"
  }
</script>
```

---

## 13. Métricas de Performance

### 13.1 Core Web Vitals

```javascript
// Monitorear LCP (Largest Contentful Paint)
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("LCP:", entry.renderTime || entry.loadTime);
  }
}).observe({ entryTypes: ["largest-contentful-paint"] });

// Monitorear CLS (Cumulative Layout Shift)
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log("CLS:", entry.value);
    }
  }
}).observe({ entryTypes: ["layout-shift"] });
```

---

## 14. Fallback sin JavaScript

```html
<noscript>
  <style>
    .skeleton {
      display: none;
    }
    #seo-imgs {
      display: block !important;
    }
    #seo-imgs img {
      display: block;
    }
  </style>
</noscript>
```

📌 **Si JS falla, las imágenes del registro se muestran directamente.**

---

## 15. Ventajas del Sistema

✅ **SEO-Friendly** – Imágenes crawleables en HTML inicial  
✅ **Performance** – Lazy loading + Intersection Observer  
✅ **UX** – Skeletons mejoran percepción de carga  
✅ **Escalable** – Agregar imágenes = agregar plantilla  
✅ **Mantenible** – Estado centralizado  
✅ **Semántico** – Data attributes describen intenciones  
✅ **Accesible** – Atributos `alt`, `loading`, soporte sin JS

---

## 16. Errores Comunes a Evitar

🚫 **NO cargar** todas las imágenes al inicio  
🚫 **NO usar** `display:none` en imágenes reales (afecta SEO)  
🚫 **NO olvidar** atributos `alt`  
🚫 **NO hardcodear** URLs en JS  
🚫 **NO ignorar** estados de error  
🚫 **NO omitir** skeletons (causan CLS)

---

## 17. Checklist de Implementación

- [ ] Crear registro `#seo-imgs` con todas las imágenes
- [ ] Agregar skeletons en posiciones reales
- [ ] Definir `aspect-ratio` para evitar CLS
- [ ] Implementar funciones Klef (state, render, actions)
- [ ] Inicializar Intersection Observer
- [ ] Agregar CSS para skeletons y animaciones
- [ ] Probar con Lighthouse (LCP, CLS)
- [ ] Validar con Google Search Console
- [ ] Agregar fallback `<noscript>`
- [ ] Documentar animaciones disponibles

---

## 18. Axioma del Sistema de Imágenes

> **El registro define.**  
> **El estado controla.**  
> **El observer notifica.**  
> **El render ejecuta.**

---

**Klef · Image Loading System**  
Velocidad sin sacrificar SEO. Experiencia sin sacrificar accesibilidad.
