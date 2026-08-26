# Banner — Creative Prompt / Brief

**Files produced:** `banner-970x250.png` (970×250) y `banner-300x600.png` (300×600).

> **Actualizado 2026-08-20 #2:** feedback fue que el visual anterior (ilustración plana geométrica) "se ve muy IA", y que el copy sonaba muy corporativo/corto. Este método cambia el fondo por una fotografía generada con IA de forma controlada (Canva), y reescribe el copy con tono más humano. Ver también la nota #1 (mensaje demasiado nicho) en `04_topic_research.md` / `01_banner_copy_english.md`.

## Method (actualizado)

1. **Fondo fotográfico vía Canva** (`mcp__claude_ai_Canva__generate-design`, tipo `poster`), con este prompt:

   > "A warm, professional real-estate marketing photograph-style scene: a modern South Florida mid-rise residential apartment building exterior at dusk, softly glowing warm window lights, palm trees silhouetted nearby, a subtle deep purple-to-teal color grade in the sky (like a sunset gradient), with faint glowing fiber-optic light trails/streaks weaving through the scene suggesting connectivity. Photographic, cinematic lighting, high production value, NOT flat vector illustration, NOT clip art, NOT cartoonish. No text, no logos, no people, no readable signage. Horizontal wide composition."

   Se pidió explícitamente **sin texto y sin logo** en la imagen generada — eso se agrega después con precisión, para garantizar cero errores de tipeo y cumplimiento exacto de specs (algo que un generador de imágenes no puede garantizar).

2. **Composición final (Python/Pillow):** se recorta la foto de alta resolución exportada de Canva a cada tamaño de banner, se le agrega un panel de degradado púrpura (scrim) sobre parte de la imagen para que el texto sea legible, y se monta encima: logo real de Celerity Fiber, headline/subhead exactos, botón CTA. Mismo método de precisión que las versiones anteriores — solo cambia el fondo (foto en vez de ilustración plana) y el copy.

## Creative brief

> Titular: **"Tired of Slow Wi-Fi Complaints From Tenants?"** — un dolor real y cotidiano de property managers, no un value-prop genérico. Respuesta: somos un equipo local del sur de la Florida, gente real al teléfono (no un call center) — claim ya validado internamente (`FACT-SHEET.md`: "real people, not bots or online portals"). CTA: **"Discuss Your Property"**.
>
> - 970x250: foto a la derecha, panel púrpura con texto a la izquierda.
> - 300x600: foto arriba, panel púrpura con texto abajo.

## Why this satisfies the spec

- 970×250 y 300×600 exactos, PNG, RGB.
- 109 KB y 143 KB respectivamente — dentro del límite de 200 KB.
- Logo real de Celerity Fiber, tarjeta blanca de alto contraste.
- Sin personas reales/stock (foto generada es de un edificio, sin personas).
- Sin cifras propias inventadas, sin promesas absolutas, sin SLA.
- Texto legible: panel de degradado garantiza contraste sobre la foto en cualquier punto donde cae el texto.

## Brand inputs used

- Logo: `Schedule/celerity-marketing-workspace/client/public/celerity-logo.png`
- Colores: `#582C83` (púrpura primario, usado en el panel/scrim y botón CTA)
- Fondo fotográfico: generado vía Canva (`generate-design` → `create-design-from-candidate` → `export-design`), guardado localmente antes de componer.
- Script de composición: guardado en el historial de esta sesión (Python/Pillow).
