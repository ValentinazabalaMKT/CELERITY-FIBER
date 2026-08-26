# Weekly Active Users — Guía del reporte

**Archivo:** `Weekly Active Users.xlsx`
**Origen:** SharePoint de Sofía Rodríguez (Celerity Fiber), descargado el 19-ago-2026.
**Cobertura de datos:** 10-oct-2025 → 15-abr-2026 (15 cortes, nominalmente semanales).
**Qué es:** el registro maestro de suscriptores activos de Celerity Fiber por propiedad ("FR"), semana a semana, más varias pestañas derivadas para calcular penetración de mercado.

> Nota de vocabulario: "FR" (FRCODE/FRNAME) = **Franchise / Property Record**, es decir cada comunidad o propiedad donde Celerity Fiber presta servicio (apartamentos, HOAs, vivienda pública). Cada propiedad tiene una **Categoría**:
> - **BULK**: la propiedad tiene un contrato de bulk — el servicio va incluido/negociado para (en teoría) todas las unidades.
> - **EMA** (Exclusive Marketing Agreement): Celerity Fiber tiene derecho exclusivo de mercadeo en la propiedad, pero cada residente decide individualmente si contrata el servicio (opt-in).
> Esta distinción es clave para interpretar los KPIs: en BULK se espera penetración cercana al 100%; en EMA la penetración mide efectividad comercial y suele ser baja.

---

## 1. Números clave (calculados a partir del corte más reciente, ABR - W3)

| Métrica | Valor |
|---|---|
| Propiedades (FR) monitoreadas | 105 (59 BULK / 45 EMA / 1 sin categorizar — ver Errores §1) |
| Unidades totales cubiertas | ~28,101 (BULK 12,987 + EMA 15,114) |
| Clientes distintos (SUBS) en todo el período | 3,248 |
| Usuarios activos — primer corte (10-oct-2025) | 3,007 |
| Usuarios activos — pico (fines oct-2025) | 3,132 |
| Usuarios activos — último corte (15-abr-2026) | 2,955 (**-5.7% vs. el pico**) |
| Penetración BULK (calculada, ver §Errores) | ~21% |
| Penetración EMA (calculada, ver §Errores) | ~1.3% |

La tendencia de usuarios activos crece en octubre-noviembre y luego **cae de forma sostenida** desde diciembre hasta abril. Vale la pena investigar la causa (churn, propiedades que salieron de servicio, etc.) — el archivo no explica el porqué, sólo el qué.

---

## 2. Cómo funciona cada pestaña

### Raw Data (45,769 filas × 13 columnas) — la fuente de verdad
Una fila = un (suscriptor × paquete × corte semanal). Es el detalle transaccional del que derivan (o deberían derivar) todas las demás pestañas.

| Columna | Significado |
|---|---|
| FRCODE / FRNAME | Código y nombre de la propiedad |
| SUBS | ID del suscriptor |
| FULLNAME | Nombre del cliente (dato personal) |
| STATUS | `Active`, `Staging`, `InActive`, `Direct TV Active (INA)` |
| PKCODE / PKNAME | Código y nombre del paquete/plan (velocidad, admin fee, DirecTV, etc.) |
| PKQTY / PKAMT | Cantidad y monto cobrado del paquete |
| EFFECTIVEDATE | Fecha del corte |
| WEEK | Etiqueta de semana (ej. `OCT - W2`) — **ver inconsistencias en Errores §4** |
| FR UNITS | Unidades totales de la propiedad, traído por fórmula `XLOOKUP` desde *Units per FR* |
| Category | BULK/EMA, también por `XLOOKUP` desde *Units per FR* |

### Dixie Data (1,319 filas)
Mismo esquema exacto que Raw Data, pero **filtrado a una sola propiedad**: "DIXIE COURT (Fortlauderdale Housing Authority)". Parece un extracto de trabajo para un análisis puntual de esa propiedad (posiblemente vivienda pública/Sección 8), no una pestaña de reporte general de la compañía.

### Units per FR (105 filas) — catálogo maestro de propiedades
La tabla de referencia: por cada propiedad indica **Unidades totales** (inventario habitacional/comercial pasible de servicio) y **Categoría** (BULK/EMA). Casi todas las demás pestañas hacen `XLOOKUP` contra esta tabla para saber "de cuántas unidades dispone la propiedad".

### Active Users per FR (110 filas × 15 semanas)
Tabla pivote de usuarios activos por propiedad y por semana (columnas D→R = semanas OCT-W2 … ABR-W3), con fila `Grand Total` al final — **este total semanal es el KPI de cabecera de la compañía**.
⚠️ Son **valores pegados (estáticos)**, no fórmulas en vivo — ver Errores §5.

### % Market Penetration (220 filas)
KPI = **Usuarios Activos ÷ Unidades Totales**, por propiedad y por semana, más una columna `Percent Change` (variación de penetración entre las dos últimas semanas calculadas). Título de la hoja: *"Just 2 weeks comparisson"* (con typo).
⚠️ Sólo cubre 4 semanas de octubre — ver Errores §2.

### Dash
Pretende ser el dashboard ejecutivo, pero **hoy es una tabla dinámica pequeña filtrada a una sola propiedad** (Dixie Court) y 3 semanas — ver Errores §3.

### Table (pestaña oculta)
Restos de tablas dinámicas de trabajo (dos fragmentos sin terminar). Está oculta de la vista normal; no forma parte del reporte pulido.

---

## 3. Cómo se miden los KPIs

- **Usuario Activo**: fila de *Raw Data* con `STATUS = Active`, contada una vez por (suscriptor, semana). *(Sin confirmar si `Staging`, `InActive` y `Direct TV Active (INA)` se excluyen a propósito del conteo — ver Errores §7.)*
- **Unidades Totales**: inventario manual por propiedad en *Units per FR* (no viene de Raw Data; alguien lo actualiza a mano).
- **% Market Penetration** = Usuarios Activos ÷ Unidades Totales, por propiedad/semana. Interpretar distinto según categoría:
  - **BULK** → se espera cercano a 100% (el servicio va con la unidad). Hoy promedia ~21%, lo cual es una señal de alerta a validar (ver Errores §8).
  - **EMA** → mide efectividad de venta puerta a puerta / marketing. Hoy ronda 1.3% a nivel de portafolio.
- **Percent Change**: diferencia de penetración entre semana actual y la anterior calculada (sólo existe para las 4 semanas de octubre cubiertas).
- **Grand Total semanal** (fila 110, *Active Users per FR*): usuarios activos totales de la compañía, semana a semana — la serie usada para la tendencia en §1.

---

## 4. Errores y hallazgos encontrados

1. **#N/A en cascada por una propiedad sin categorizar.** En *Units per FR*, fila 56, la propiedad **"P1O Banyan Trace Condominium" (FRCODE 203)** no tiene Unidades ni Categoría cargadas (celdas D56/E56 con `#N/A`). Esto propaga error a:
   - *Raw Data*: columnas FR UNITS/Category, 15 semanas × 1 suscriptor (Tracy Guard) = 30 celdas.
   - *Active Users per FR*: fila 57.
   - *% Market Penetration*: fila 105 (6 celdas).
   **Solución:** completar manualmente Unidades y Categoría (BULK/EMA) de esa propiedad en *Units per FR* fila 56.

2. **"% Market Penetration" desactualizada.** Sólo calcula 4 semanas (OCT-W2 a OCT-W5), aunque *Active Users per FR* ya tiene datos hasta ABR-W3 (15 semanas). El título literal de la hoja ("Just 2 weeks comparisson") sugiere que fue una vista de prueba que nunca se amplió. **El % de penetración que muestra el archivo hoy no refleja los últimos ~6 meses.**

3. **"Dash" no funciona como dashboard general.** Está filtrado (tabla dinámica con slicer/filtro activo) a una sola propiedad, Dixie Court, y sólo 3 semanas. No sirve como resumen ejecutivo de la compañía en su estado actual.

4. **Inconsistencias de texto en las etiquetas de semana (columna WEEK):**
   - `APR- W3` (sin espacio) convive con `APR - W1` (con espacio) en *Raw Data* / *Active Users per FR*.
   - En *Dixie Data* aparece **`ABR - W1`** (abreviatura en **español** de abril) en vez de `APR - W1`.
   Estas variantes de texto pueden romper cualquier `XLOOKUP`/filtro por coincidencia exacta y hacer que una semana "desaparezca" de un resumen futuro.

5. **"Active Users per FR" y "Units per FR" son valores pegados, no fórmulas vivas.** Si se agrega una semana o propiedad nueva a *Raw Data*, estas dos pestañas —y todo lo que depende de ellas (% Market Penetration, Dash)— **no se actualizan solas**; alguien debe reconstruir y volver a pegar la tabla dinámica manualmente. Esto ya generó el desfase del punto 2.

6. **La cadencia real ya no es "semanal".** El archivo se llama *Weekly* Active Users y en oct-nov efectivamente se actualizaba cada semana, pero desde diciembre el ritmo bajó a ~1 corte por mes (DEC-W2, JAN-W1, JAN-W3, FEB-W3, MAR-W3, ABR-W1, ABR-W3). Vale la pena confirmar si fue un cambio de proceso intencional.

7. **Estados de suscripción fuera de "Active" sin tratamiento claro.** Además de `Active` (45,686 filas), hay `Staging` (71), `InActive` (1, nota: con mayúscula distinta a "Inactive") y `Direct TV Active (INA)` (10 filas — el mismo suscriptor "Adam Kinkler" en Marquis Residence, repetido cada semana con $0 cobrado). No es evidente, sin ver el proceso de armado de *Active Users per FR*, si estos casos se excluyen correctamente del conteo de "usuarios activos".

8. **Penetración BULK sorprendentemente baja (~21%).** En un contrato bulk se esperaría un % cercano a 100% (el servicio va incluido con la unidad). Vale la pena validar con el equipo si "Unidades Totales" en *Units per FR* incluye unidades vacantes/modelo/no residenciales, o si "Usuarios Activos" está subcontando suscriptores bulk que no requieren "activarse" individualmente.

9. **Muchas propiedades EMA muestran "1" usuario activo fijo durante 15 semanas seguidas** (ej. Atelier at University Par, Bungalows-McMillian Mesa, Copper Stone, Elevation, entre otras). Vale la pena confirmar si ese "1" es un cliente real o una cuenta de referencia/demo de la oficina de arrendamiento — de ser lo segundo, la penetración real de EMA sería aún más baja que el 1.3% calculado.

---

## 5. Nota sobre datos personales

*Raw Data* y *Dixie Data* contienen nombres completos de clientes. Se recomienda tratar este archivo como información sensible (no compartir fuera del equipo sin necesidad) y evitar publicarlo en herramientas externas.
