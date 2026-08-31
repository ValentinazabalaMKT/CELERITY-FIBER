# My Celerity

*[Read this in English](README.md)*

**Tu internet. Tu cuenta. Todo en un solo lugar.**

Un portal de autogestión para residentes de **Celerity Fiber** — ver el estado del servicio, administrar el plan, pagar facturas, correr un test de velocidad, gestionar dispositivos conectados y pedir soporte, todo desde una sola app. Conceptualmente inspirado en apps de operadores como Mi Claro, pero pensado para sentirse como un producto SaaS moderno (nivel Stripe / Linear / Apple), y construido 100% sobre la identidad real de Celerity Fiber (colores, gradiente, isotipo, tono — ver [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) para la investigación de marca sobre la que se construyó).

Esta primera versión corre enteramente sobre **datos simulados (mock)** — sin backend, sin credenciales necesarias. Cada función que trae datos vive detrás de una capa de API chica (`src/lib/api.ts`) con la misma forma que tendrán las llamadas reales el día de mañana, así que reemplazar los mocks por un backend real no debería tocar ninguna página ni componente.

## Deploy en vivo

**https://my-celerity.vercel.app** — desplegado en Vercel, se redespliega automáticamente con cada push a `main` (vía la integración de Vercel con GitHub sobre el repo CELERITY-FIBER, con `my-celerity/` configurado como el Root Directory del proyecto). No requiere variables de entorno — ver la nota en "Variables de entorno" más abajo.

## Cómo correrlo

```bash
cd my-celerity
npm install   # ya está corrido si acabás de clonar este repo
npm run dev -- -p 3200
```

Abrí **http://localhost:3200** — carga primero la pantalla de inicio de sesión.

### Login demo

```
Email:    demo@celerityfiber.com
Password: Celerity123!
```

Hacé clic en **"Use demo credentials"** en la pantalla de login para completarlos automáticamente. Esto es una **verificación de autenticación simulada, solo del lado del cliente**, pensada para desarrollo — ver [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) para cómo se reemplaza esto por autenticación real (Supabase Auth es la propuesta).

El cliente demo (Michael Anderson) tiene **dos cuentas** entre las que se puede cambiar desde el selector de cuenta en el sidebar/header:
- **Apartment** — The Grande Condo, Unit 1204 — Activa, plan 1 Gig, al día con la facturación.
- **Vacation property** — The Wave, Unit 512 — Con saldo vencido (Past Due), plan 500 Mbps, y con un banner de outage activo — útil para ver los estados "no ideales" (banner de saldo vencido, banner de outage, quick actions degradadas) sin tocar código.

## Estructura del proyecto

```
src/
  app/
    login/                 Ruta pública de login
    (portal)/              Todo lo que está detrás del login, dentro de un shell compartido
      layout.tsx            Guard de autenticación + sidebar/header/nav mobile/chat
      dashboard/            Home
      internet/             Detalle del servicio, speed test, dispositivos conectados
      plans/                Plan actual + upgrades disponibles + comparador
      billing/               Factura actual, AutoPay, métodos de pago
      billing/history/       Historial de pagos
      support/               Quick actions, troubleshooting, tickets
      profile/               Datos de cuenta/contacto/propiedad
      notifications/         Centro de notificaciones
      settings/              Seguridad, preferencias de notificación, facturación, privacidad
      outages/[id]/          Detalle de un outage
  components/
    ui/                     Kit de componentes interno (estilo shadcn/ui):
                             Button, Card, Dialog, Tabs, Select, Switch, etc.
    layout/                 AppSidebar, MobileNav, TopHeader, AccountSwitcher,
                             NotificationBell
    dashboard/ internet/ plans/ billing/ support/ outages/
                             Componentes de cada feature, usados por las páginas de arriba
  data/                     Mock data centralizado (mockCustomer.ts, mockInternet.ts,
                             mockBilling.ts, mockSupport.ts, mockNotifications.ts,
                             mockOutages.ts) -- el único lugar donde vive data falsa
  lib/
    api.ts                  La capa de API -- todas las llamadas de datos de la app,
                             hoy resueltas contra mocks (ver docs/INTEGRATIONS.md)
    auth.tsx                AuthProvider demo / useAuth()
    utils.ts, nav.ts, status-meta.ts, notification-meta.ts, greeting.ts
  types/index.ts             Tipos de dominio compartidos (reflejan docs/DATA_MODEL.md)
  hooks/useAccountContext.ts  Carga cuenta+propiedad+unidad para la cuenta activa
```

## Sistema de diseño

- **Colores**: violeta Celerity (`#582C83`) y teal de fibra (`#0087AD`), incluyendo el gradiente exacto `linear-gradient(129deg, #0087AD 0%, #582C83 72%)` que usan los CTA principales en celerityfiber.com — confirmado inspeccionando el sitio en vivo, no inventado. Paleta completa en `src/app/globals.css`, coincidiendo con la paleta ya establecida en la otra herramienta de Celerity en este repo (`Schedule/celerity-marketing-workspace`).
- **Logo**: el isotipo real de Celerity Fiber (`public/brand/celerity-logo.png`, copiado de esa misma herramienta existente en este repo).
- **Tipografía**: el sitio en vivo usa una fuente con licencia ("D-Din Regular") para los títulos, que no está disponible en este repo ni como fuente libre/redistribuible. En lugar de inventar una identidad distinta, esta app usa **Inter** en todos lados (ya es la fuente sans establecida en la otra herramienta de Celerity de esta organización), con tracking más ajustado y mayor peso en los textos grandes como reemplazo temporal. Cuando haya licencia disponible, basta con cambiar el import de `Inter` en `src/app/layout.tsx` por una webfont de D-DIN Pro — no hace falta tocar ningún otro token de diseño.
- **Cards / UI clara**: cards blancas, bordes sutiles, mucho whitespace, sombras discretas — sin glassmorphism, sin gradientes neón excesivos. Los gradientes se usan poco y con intención (CTAs principales, el hero oscuro del Login y la tarjeta de estado de Internet), no en todas partes.
- **Íconos**: exclusivamente [Lucide](https://lucide.dev) — sin emojis en la UI.

## Qué está implementado

Cada página/flujo mencionado en el brief del producto es real e interactivo contra datos mock — no son mockups estáticos:

- Login (auth demo, sesión persistente, rutas protegidas)
- Dashboard (hero de estado, tarjeta de internet, salud de red, resumen de facturación, quick actions, actividad reciente)
- My Internet (detalle del servicio, speed test animado, dispositivos conectados con pausar/renombrar/priorizar)
- Plans (plan actual, upgrades disponibles, comparador de planes + flujo de solicitud de upgrade)
- Billing (desglose de la factura actual, toggle de AutoPay, métodos de pago) + Historial de pagos (filtrable, con recibos)
- Flujo de pago completo: monto → método → revisión → confirmación → procesando → éxito
- Support (quick actions, troubleshooting guiado con reinicio de gateway simulado, creación de tickets + línea de tiempo de estado, chat flotante)
- Profile, Notifications (centro + dropdown de campana), Settings (seguridad, preferencias de notificación, preferencias de facturación, privacidad)
- Banner de outage (visible en todo el portal) + página de detalle del outage
- Cambio entre múltiples cuentas (con noción de propiedad/unidad), cada una con su propio estado de facturación/servicio/dispositivos
- Estados de cliente (Activo / Con saldo vencido / Suspendido / Desconectado / Activación pendiente) que realmente cambian lo que muestra el dashboard

## Variables de entorno

No se necesita ninguna para correr esta versión — todo está mockeado. Cuando se agreguen integraciones reales (ver [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)), se espera un `.env.local` con entradas como:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
PAYMENT_GATEWAY_SECRET_KEY=
GLDS_API_BASE_URL=
SALESFORCE_CLIENT_ID=
```

## Para seguir leyendo

- [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) — visión, usuarios, investigación de marca, features, arquitectura
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — entidades y relaciones
- [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) — propuesta de integración con GLDS / Salesforce / pagos / red
- [docs/ROADMAP.md](docs/ROADMAP.md) — MVP / Fase 2 / Fase 3

*Nota: los documentos en `docs/` todavía están solo en inglés.*
