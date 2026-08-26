# Banner — Creative Prompt / Brief (v2 — general intro angle)

**File produced:** `banner.png` — 600×300px, PNG, 144 PPI, RGB, ~27KB (limit 600KB)

**Revision note (2026-08-13):** Tagline updated from the original storm/redundancy-specific line ("Dual-Path Fiber. Built for South Florida.") to a general brand-intro line ("Future-Proof Your Property. / Fiber + Managed Wi-Fi"), per Juan José Flores' feedback that this first-touch Business Journal email should be general, not tied to one technical topic. The visual composition (crane = Greenfield, skyline = Brownfield, connecting glow lines, logo card) was kept — it already matches "for new developments, but brownfield too," which is exactly what was requested.

## Method

No photorealistic AI image generation was used. The banner was composed programmatically (Python/Pillow) as a clean vector-style graphic — deliberately avoiding stock photography or AI-generated "people," per the spec's explicit restriction ("NO uses personas genéricas. NO uses imágenes irreales."). This also guarantees exact compliance with the pixel/DPI/file-size specs instead of approximating them.

## Creative brief used to build it

> Design a premium, editorial-style banner (600×300px) for a Celerity Fiber Announcement email — a first-touch introduction to South Florida commercial real estate decision-makers. The banner must visually represent **both** Greenfield and Brownfield audiences without favoring either:
>
> - **Left side (Greenfield):** an under-construction scene — a tower crane and a rising steel structural frame over a blueprint/grid pattern, signaling new development and ground-up planning.
> - **Right side (Brownfield):** a finished mid-rise skyline (multiple buildings of varying height with lit windows), signaling existing commercial/multifamily properties.
> - **Connecting motif:** two glowing parallel lines running the width of the image at ground level, linking the crane and every building — a general "connected properties" visual, not tied to any one specific technical concept. Small "node" dots mark where the line reaches each structure.
> - **Background:** a smooth gradient from Celerity teal (`#0087AD`) on the left to Celerity purple (`#582C83`) on the right, tying the two halves together as one continuous property portfolio.
> - **Branding:** the real Celerity Fiber logo (`celerity-logo.png`, official asset from the workspace/site) placed on a white rounded card, top-left, for maximum contrast and unmistakable, "clear and intentional" client branding as required by spec.
> - **Copy on image:** a short two-line tagline only ("Future-Proof Your Property." / "Fiber + Managed Wi-Fi") — general brand introduction, not a specific seasonal/technical hook. No body copy on the image, since body copy must remain as real text for accessibility per spec.
> - **Tone:** premium, welcoming, architecture/infrastructure-forward — introductory, not niche-technical.

## Why this satisfies the spec

- 600px wide × 300px high → within the required 250–350px height range.
- PNG, RGB, 144 PPI, well under the 600KB limit.
- "Client branding must be clear & intentional... required in the image" → real logo on a high-contrast card.
- No body copy embedded in the image (kept as accessible text field).
- No generic/stock people, no unreal/AI-photoreal imagery.
- Visually represents "new developments, but brownfield too" and general connectivity — matches the intro-level, non-technical brief for this first-touch audience.

## Brand inputs used

- Logo asset: `Schedule/celerity-marketing-workspace/client/public/celerity-logo.png` (real Celerity Fiber logo, already used in the internal workspace app).
- Colors: `#582C83` (primary purple) and `#0087AD` (secondary teal), taken from confirmed design tokens in `Schedule/celerity-marketing-workspace/client/tailwind.config.ts` — the same palette used for the CTA Button Color in the form.
