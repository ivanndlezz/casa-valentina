# Arquitectura para Carga Dinámica de Imágenes con Skeleton Loading y Hydration

## Introducción

Esta arquitectura propone un sistema híbrido para servir imágenes de forma "divertida" (dinámica con JavaScript) en sitios web, equilibrando **arquitectura semántica intencional**, **SEO** y **optimización de carga**. Inspirado en patrones modernos como lazy loading, hydration y skeleton screens, permite renderizar imágenes solo cuando son visibles en el viewport, con animaciones CSS para una experiencia fluida.

El enfoque se basa en un "registro" de imágenes en HTML oculto, que se "hidrata" con JavaScript para activar carga y efectos, minimizando impactos en SEO y rendimiento.

## Arquitectura General

### Componentes Principales

1. **Registro de Imágenes (HTML Skeleton)**: Un `<div>` oculto (`display:none`) que contiene plantillas de `<img>` con data attributes para definir secciones, queries DOM, URLs, animaciones, etc.
2. **Hydration con JavaScript**: Proceso que "hidrata" las plantillas al DOM real, aplicando lazy loading basado en viewport.
3. **Skeleton Loading**: Placeholders CSS que simulan la imagen mientras carga, con animación de pulso.
4. **Viewport Rendering**: Solo renderiza imágenes cuando entran en el viewport usando Intersection Observer.

### Estructura en HTML

```html
<!-- Registro oculto de imágenes -->
<div id="seo-imgs" style="display:none;">
  <img
    data-section="hero"
    data-query="#hero .hero-content"
    data-src="https://example.com/hero.webp"
    data-alt="Hero"
    data-animation="fade-in"
    loading="lazy"
  />
  <img
    data-section="gallery"
    data-query=".gallery img:nth-child(1)"
    data-src="https://example.com/img1.webp"
    data-alt="Gallery 1"
    data-animation="zoom"
    loading="lazy"
  />
  <!-- Más plantillas -->
</div>

<!-- En el DOM real: Skeleton placeholders -->
<div id="hero" class="hero">
  <div class="skeleton skeleton-image"></div>
  <!-- Placeholder mientras carga -->
</div>
```

### JavaScript para Hydration y Lazy Loading

```javascript
function hydrateImages() {
  const templates = document.querySelectorAll("#seo-imgs img");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const skeleton = entry.target;
        const template = [...templates].find(
          (t) =>
            t.dataset.query === `#${skeleton.id}` ||
            t.dataset.query === `.${skeleton.className.split(" ").join(".")}`
        );
        if (template) {
          const img = template.cloneNode(true);
          img.src = template.dataset.src;
          img.alt = template.dataset.alt;
          img.classList.add("animate-" + template.dataset.animation);
          skeleton.replaceWith(img); // Reemplaza skeleton con img
        }
        observer.unobserve(skeleton);
      }
    });
  });

  // Observa skeletons
  document
    .querySelectorAll(".skeleton-image")
    .forEach((skel) => observer.observe(skel));
}

document.addEventListener("DOMContentLoaded", hydrateImages);
```

### CSS para Skeleton y Animaciones

```css
/* Skeleton base */
.skeleton {
  background: #e0e0e0;
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  height: 250px; /* Ajusta según imagen */
}

/* Animación de pulso */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* Animaciones de imagen */
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
    transform: scale(0.9);
  }
  to {
    transform: scale(1);
  }
}
```

## Beneficios

- **SEO Amigable**: Imágenes definidas en HTML inicial, crawlable por Googlebot. Evita problemas de indexación al usar JS puro.
- **Arquitectura Semántica Intencional**: Define intenciones (sección, animación) en data attributes, facilitando mantenimiento y escalabilidad.
- **Optimización de Carga**: Lazy loading reduce LCP/CLS. Skeleton mejora UX percibida (no blank spaces).
- **Rendimiento**: Hydration diferida evita bloqueo de render. Solo carga visibles.
- **Accesibilidad**: `<img>` nativos con `alt`, compatibles con screen readers.
- **Flexibilidad**: Fácil agregar animaciones, fallbacks (ej. WebP), o integrar con frameworks como React.

## Implementación Paso a Paso

1. **Define el Registro**: Agrega `#seo-imgs` con plantillas en HTML.
2. **Crea Skeletons**: En secciones reales, usa `<div class="skeleton-image">`.
3. **Implementa JS**: Copia el código de hydration.
4. **Agrega CSS**: Incluye skeletons y animaciones.
5. **Pruebas**: Verifica con Lighthouse (Core Web Vitals) y Search Console (indexación).

## Consideraciones Adicionales

- **Fallbacks**: Si JS falla, skeletons permanecen (puedes agregar `<noscript>` con imgs estáticas).
- **SEO Extra**: Agrega JSON-LD para metadatos de imágenes.
- **Escalabilidad**: Para muchos imgs, carga el registro desde JSON externo.
- **Compatibilidad**: Intersection Observer tiene buen soporte; polyfill si necesario.

Esta arquitectura es ideal para sitios como Casa Valentina, donde imágenes son críticas pero el rendimiento importa.
