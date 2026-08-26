# Prompt — Agente de validación y actualización de "Comment" (hoja CX Activos)

Úsalo tal cual en Cursor / Claude Code. Corre **después** del prompt de ensamblaje (`prompt_agente_ensamblaje_reporte_final.md`), sobre el reporte final ya armado del mes en curso. Reemplaza la herencia ciega de `COMMENT` del mes anterior por una validación real basada en los paquetes que la cuenta tiene *este* mes.

> Nota de nomenclatura: el usuario se refiere a esta hoja como **"Cierres activos"** — es la misma hoja que en la plantilla y en los demás prompts se llama **`CX Activos`**. Usa `CX Activos` (el nombre real de la hoja en el archivo) al ejecutar esto.

---

## PROMPT

Vas a revisar y actualizar la columna `COMMENT` de la hoja `CX Activos` del reporte final del mes en curso (`Physical Bill Fee - [Mes].xlsx`). Columnas relevantes de esa hoja: `SUBS`, `PKNAME`, `PKAMT`, `COMMENT`.

### 0. Alcance — qué filas se tocan y cuáles no

**Solo se revalida y se puede sobrescribir `COMMENT` en filas donde el valor actual (heredado del mes anterior vía el VLOOKUP de `Comments_Ref_[MesAnterior]`) sea:**
- vacío / en blanco, o
- coincida con el patrón "pendiente de Admin Fee" (con o sin sufijo `/ MES`).

> ⚠️ **Variante real encontrada en los datos (verificada contra mayo 2026):** el texto que efectivamente usa el equipo en producción es **`Pdte poner admin fee`** (con "Pdte", no "PDT", y en minúsculas) — no `PDT poner Admin Fee` como se describió originalmente. Haz el match tolerante a ambas formas: acepta tanto `PDT` como `PDTE` (con o sin la "E" final), sin distinguir mayúsculas/minúsculas ni espacios extra. Ejemplos que deben matchear: `Pdte poner admin fee`, `PDT poner Admin Fee`, `Pdte poner Admin fee`, `PDT poner Admin Fee / JULIO`. La salida que este prompt escribe, en cambio, siempre usa el formato canónico limpio `PDT poner Admin Fee / MES` (ver paso 4) — así el formato se va estandarizando mes a mes aunque el dato heredado venga sucio.

**No toques ningún otro comentario ya existente** (ej. `OK DirecTV -BULK`, `OK SPP -Direc TV- ...`, o cualquier nota manual) — esos quedan tal como están, heredados del mes anterior. Este proceso no es una re-escritura completa de la columna, es una revalidación dirigida solo a lo pendiente y a lo vacío.

### 1. Agrupar por SUBS (nivel de cuenta, no de fila)

Un mismo `SUBS` puede tener varias filas (un paquete de internet, un Admin Fee, un Protection Plan, etc. como líneas separadas). **Todas las reglas de abajo se evalúan mirando el conjunto completo de filas de ese `SUBS` en `Customer Pk` / `CX Activos` de este mes — nunca una fila aislada.**

Para cada `SUBS` que tenga al menos una fila en alcance (según el paso 0), reúne:
- La lista de todos los `PKNAME` de todas las filas de ese `SUBS` (sin importar si esa fila individual está en alcance o no — necesitas ver el cuadro completo de la cuenta).
- La lista de todos los `PKAMT` de esas mismas filas.

### 2. Detectar qué paquetes especiales tiene la cuenta

Sobre la lista de `PKNAME` del `SUBS`, busca coincidencia por **substring, sin distinguir mayúsculas/minúsculas** (no uses igualdad exacta — `Protection Plan` en particular aparece con varios sufijos reales: *"Protection Plan (Single Play) / Year"*, *"Protection Plan (Single Play) / Month"*, *"SINGLE PLAY Protection Plan Yearly"*, *"DOUBLE PLAY Protection Plan Yearly"*, *"NEW CUSTOMER Protection Plan Yearly"* — todas cuentan):

- `tiene_premier` = algún PKNAME contiene "premier membership"
- `tiene_physical_bill_fee` = algún PKNAME contiene "physical bill fee"
- `tiene_admin_fee` = algún PKNAME contiene "admin fee"
- `tiene_protection_plan` = algún PKNAME contiene "protection plan"
- `todos_pkamt_cero` = todos los `PKAMT` de las filas del SUBS son 0 (o vacío/None tratado como 0)
- `tiene_cobro` = existe al menos un `PKAMT` > 0 en las filas del SUBS (lo opuesto a `todos_pkamt_cero`)

### 3. Determinar el comentario final del SUBS, en este orden de prioridad

Evalúa en este orden y usa la **primera** condición que aplique (no se combinan comentarios):

1. `tiene_premier` → `OK PM`
2. `tiene_physical_bill_fee` → `OK Physical Bill Fee`
3. `tiene_admin_fee` (y típicamente `tiene_cobro`, ya que Admin Fee es un cargo) → `OK Admin Fee`
4. `tiene_protection_plan` → `OK PPS`
5. `todos_pkamt_cero` (ninguna de las anteriores aplicó) → `OK Bulk`
6. Si nada de lo anterior aplicó y `tiene_cobro` es verdadero (la cuenta tiene cargos pero no tiene Admin Fee ni ningún paquete especial) → la cuenta **sigue pendiente de Admin Fee** (ver paso 4 para el formato exacto).

### 4. Formato del pendiente — conservar el mes original

Cuando el resultado del paso 3 sea "pendiente de Admin Fee", el comentario debe ser:

```
PDT poner Admin Fee / MES
```

Donde `MES` es el mes **original** desde el que la cuenta está pendiente, no el mes del reporte actual. Para determinarlo:

- **Si el comentario heredado de este SUBS ya tenía el formato `PDT poner Admin Fee / MES`** (con un mes explícito): conserva ese mismo `MES` sin importar cuántos meses lleve pendiente. No lo actualices al mes actual.
- **Si el comentario heredado era `PDT poner Admin Fee` sin mes** (formato usado antes de que existiera esta validación) **o si la fila tenía `COMMENT` vacío y este es el primer mes en que se detecta la novedad**: usa como `MES` el mes del reporte que se está procesando **ahora** (ej. si estás armando el reporte de agosto, `MES = AGOSTO`). A partir de ese momento, ese mes queda "fijado" como el origen y los meses siguientes deben conservarlo tal como indica el punto anterior.
- Escribe `MES` en mayúsculas, en español, sin acentos (ej. `JULIO`, `AGOSTO`, `SEPTIEMBRE`).

Ejemplo de continuidad: si en julio se detectó por primera vez y quedó `PDT poner Admin Fee / JULIO`, en agosto y septiembre —mientras siga sin resolverse— debe seguir diciendo `PDT poner Admin Fee / JULIO`. El mes cambia únicamente cuando la cuenta pasa a un `OK` (ya no hay comentario pendiente que arrastrar).

### 5. Aplicar el resultado a TODAS las filas del SUBS que estén en alcance

El comentario final calculado en el paso 3 (o el pendiente con su mes, del paso 4) se escribe en la columna `COMMENT` de **todas** las filas de ese `SUBS` que estaban en alcance según el paso 0 (vacías o con `PDT poner Admin Fee...`) — no solo en la fila donde vive el paquete que determinó la condición. Si una fila de ese `SUBS` ya tenía un comentario manual distinto (fuera de alcance), esa fila específica no se toca aunque comparta `SUBS` con filas que sí se actualizan.

### 6. Resumen que debes darme al final (siempre, en texto plano)

- Cuántos `SUBS` distintos entraron en alcance (comentario vacío o `PDT poner Admin Fee...` heredado).
- De esos, cuántos quedaron resueltos a cada tipo de `OK` (`OK PM`, `OK Physical Bill Fee`, `OK Admin Fee`, `OK PPS`, `OK Bulk`) — desglosado por tipo.
- Cuántos siguieron pendientes (`PDT poner Admin Fee / MES`), separando cuántos son pendientes que **ya existían** (conservaron su mes original) vs. cuántos son pendientes **nuevos** detectados este mes (mes = el del reporte actual).
- Lista de los `SUBS` que pasaron de `PDT poner Admin Fee` (sin resolver) a un `OK` este mes — esas son las cuentas que "se solucionaron", útil para que el equipo lo confirme.
- Cuántas filas totales de la hoja `CX Activos` se actualizaron.
- Cualquier `PKNAME` que no calzó claramente con ninguna de las 4 categorías especiales pero que se parece a una de ellas (posible variante nueva de nombre de paquete que el patrón de substring no capturó) — avísame en vez de ignorarlo silenciosamente.

No asumas que el comentario heredado siempre viene en un formato limpio — puede traer espacios extra, mayúsculas/minúsculas distintas, o variantes del texto `PDT poner Admin Fee`. Normaliza (trim + case-insensitive) antes de comparar, pero si encuentras algo ambiguo que no calza claramente ni como "vacío" ni como "PDT poner Admin Fee" ni como un `OK` reconocible, trátalo como fuera de alcance (no lo toques) y repórtalo en el resumen en vez de decidir por tu cuenta.

---

## Notas para configurar el agente en Cursor/Claude Code

- Este paso corre sobre el archivo final ya ensamblado (después de `prompt_agente_ensamblaje_reporte_final.md`), no sobre los archivos `_LIMPIO.xlsx` sueltos — necesita `PKNAME`/`PKAMT` ya combinados por `SUBS` en `CX Activos`.
- Como el ensamblaje deja `COMMENT` como fórmula (`VLOOKUP` contra `Comments_Ref_[MesAnterior]`), este paso necesita **leer el valor calculado** de esa fórmula (requiere que el archivo se haya abierto/recalculado en Excel al menos una vez, o recalcularlo tú mismo) antes de decidir qué está "vacío" y qué es `PDT poner Admin Fee`. Las celdas que este prompt actualiza pasan a ser valores estáticos (ya no fórmula) — eso es intencional, porque el comentario validado es información nueva de este mes, no algo que deba seguir heredándose automáticamente el mes siguiente sin revisión.
- El mes "original" de un pendiente (`PDT poner Admin Fee / MES`) vive únicamente en el texto del comentario mismo — no hay una columna separada que lo registre. Por diseño, cada mes hereda ese texto tal cual (vía el mismo mecanismo de `Comments_Ref`) y este prompt solo lo reescribe si la cuenta cambia de estado.
- Patrón de match usado en la corrida de junio 2026 (referencia de implementación): `^pdte?\s+poner\s+admin\s+fee(\s*/\s*(?P<mes>\S+))?\s*$`, aplicado sobre el texto ya recortado (trim) y sin distinguir mayúsculas/minúsculas. Si en un mes futuro aparece una tercera variante de escritura (ej. con tilde, con "cargo" en vez de "fee", etc.), amplía el patrón y anótalo aquí para que quede como registro de las variantes reales vistas en producción.
