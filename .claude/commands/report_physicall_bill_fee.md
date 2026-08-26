---
description: Corre el proceso mensual completo del reporte "Physical Bill Fee" (limpieza de los 3 exports crudos + ensamblaje del reporte final + validación de COMMENT)
---

# /report_physicall_bill_fee

Argumento opcional recibido en `$ARGUMENTS`: nombre/carpeta del mes a procesar (ej. `July2026`). Si viene vacío, sigue la lógica de detección automática del paso 0.

Fuente de verdad de todo este proceso — **léela primero, siempre, en cada corrida** (no confíes en un resumen cacheado de una corrida anterior, porque estos archivos son la fuente de verdad y pueden cambiar):
- `reports/Physicall Bill Fee/AGENT/instrucciones_agente_orquestador.md`
- `reports/Physicall Bill Fee/AGENT/prompt_agente_limpieza_customer_pk.md`
- `reports/Physicall Bill Fee/AGENT/prompt_agente_limpieza_billform_type.md`
- `reports/Physicall Bill Fee/AGENT/prompt_agente_limpieza_email_accounts.md`
- `reports/Physicall Bill Fee/AGENT/prompt_agente_ensamblaje_reporte_final.md`
- `reports/Physicall Bill Fee/AGENT/prompt_agente_validacion_comment.md`
- Plantilla: `reports/Physicall Bill Fee/AGENT/Template_report.xlsx`

Este comando **nunca corre solo** — solo se ejecuta cuando el usuario lo invoca explícitamente escribiendo `/report_physicall_bill_fee`. No lo dispares por tu cuenta en ningún otro contexto (apertura de proyecto, background, archivo detectado, etc.).

> Nota: la ruta real de este proyecto es `reports/Physicall Bill Fee/` (con la carpeta `AGENT` en mayúsculas y las carpetas de mes en formato `Mes+Año` en inglés, ej. `May2026`, `June2026`, `July2026` — **no** `Reportes/Física del Bill Fee/Agente/` con meses en español como describe una versión anterior de `instrucciones_agente_orquestador.md`). Verifica igual al correr, por si la estructura cambió otra vez desde la última vez que este comando se ejecutó — si la ruta de arriba no existe, busca una carpeta bajo `reports/` cuyo nombre se parezca a "Physical/Physicall Bill Fee" antes de rendirte, y avisa al usuario del nombre exacto que encontraste.

## Paso 0 — Identificar el mes a procesar y el mes anterior

1. Lista las subcarpetas de mes dentro de `reports/Physicall Bill Fee/` (todo lo que no sea `AGENT`).
2. Si `$ARGUMENTS` trae un nombre de mes/carpeta, úsalo como mes a procesar — pero igual verifica que esa carpeta tenga los 3 exports crudos antes de seguir; si no los tiene, avisa y detente.
3. Si `$ARGUMENTS` viene vacío, identifica qué carpeta(s) de mes tienen **los 3 exports crudos** (`Customer_Pk_*.xlsx`, `BillForm_Type_*.xlsx`, `Email_Accounts*.xlsx`) pero **no** tienen todavía un reporte final ya armado en esa misma carpeta (el reporte final es el `.xlsx` que NO matchea ninguno de esos 3 patrones crudos ni termina en `_LIMPIO.xlsx` — típicamente algo como `Physical Bill Fee - [Mes].xlsx` o `Physical_Bill_Fee_-_[Mes].xlsx`, el nombre exacto puede variar, detéctalo por descarte, no por match exacto de un patrón fijo).
   - Si encuentras exactamente **una** carpeta en esa condición, úsala.
   - Si encuentras **más de una**, muéstraselas al usuario y pregúntale cuál procesar — no asumas ni tomes la más reciente por defecto.
   - Si no encuentras ninguna, avisa y detente (no hay nada pendiente por procesar).
4. Identifica el **mes anterior** = la carpeta de mes cronológicamente anterior a la que se va a procesar que **sí tenga** ya su reporte final armado. Si no encuentras ninguna carpeta anterior con reporte final, avisa explícitamente al usuario ("no encontré un mes anterior con reporte final para heredar COMMENT — ¿confirmas que este es el primer mes del proceso, o me falta algo?") en vez de asumir que no hay `COMMENT` que heredar y seguir de largo.
5. Si algún archivo de los 3 crudos aparece duplicado (más de uno matcheando el mismo patrón, ej. dos `Customer_Pk_*.xlsx`) en la carpeta del mes, pregunta al usuario cuál usar — no asumas por fecha de modificación ni por orden alfabético.
6. Confirma al usuario, antes de seguir, qué mes vas a procesar y qué mes anterior vas a usar como referencia de `COMMENT` — es la única confirmación previa; de ahí en adelante corre los pasos sin pausas intermedias salvo que algo no calce con lo esperado (ver notas de cada prompt sobre cuándo preguntar vs. solo reportar).

## Paso 1 — Limpieza (3 pasos)

Aplica, en este orden (o en paralelo si el entorno lo permite), los tres prompts de limpieza tal como están escritos en sus archivos — no los reescribas ni los resumas, síguelos al pie de la letra:

1. `prompt_agente_limpieza_customer_pk.md` sobre el `Customer_Pk_*.xlsx` del mes a procesar.
2. `prompt_agente_limpieza_billform_type.md` sobre el `BillForm_Type_*.xlsx` del mes a procesar.
3. `prompt_agente_limpieza_email_accounts.md` sobre el `Email_Accounts*.xlsx` del mes a procesar.

Guarda las 3 salidas `_LIMPIO.xlsx` **dentro de la misma carpeta del mes que se está procesando**, junto a los crudos de origen.

Guarda también, en memoria de esta corrida, el resumen en texto plano que cada uno de estos 3 prompts pide al final — los vas a necesitar para el resumen consolidado del paso 4.

## Paso 2 — Ensamblaje

Aplica `prompt_agente_ensamblaje_reporte_final.md` tal como está escrito, usando:
- `Template_report.xlsx` (carpeta `AGENT`).
- Los 3 archivos `_LIMPIO.xlsx` que acabas de generar en el paso 1.
- El reporte final del mes anterior identificado en el paso 0 (para heredar `COMMENT`).

Guarda el resultado dentro de la carpeta del mes que se está procesando, con un nombre consistente con el patrón que ya usan los reportes finales anteriores de este mismo proyecto (revisa cómo se llama el del mes anterior y sigue el mismo patrón, en vez de inventar un formato de nombre nuevo).

Este paso incluye recalcular las fórmulas del archivo resultante antes de entregarlo (el prompt de ensamblaje lo pide explícitamente en su sección 6 — "Recalcular y validar"). Si no tienes disponible el "script de recálculo del skill de xlsx" que menciona la nota original, usa el mejor método disponible en este entorno (por ejemplo recalcular vía LibreOffice headless, o el método que uses normalmente para forzar recálculo de fórmulas en `.xlsx` generados con `openpyxl`) y dilo explícitamente en el resumen — no entregues el archivo con fórmulas sin recalcular ni sin haber verificado 0 errores.

## Paso 3 — Validación y actualización de `COMMENT`

Aplica `prompt_agente_validacion_comment.md` tal como está escrito, sobre la hoja `CX Activos` del reporte final que acabas de generar en el paso 2. Este paso necesita el `COMMENT` heredado ya **calculado** (valor real de la fórmula VLOOKUP, no la fórmula sin resolver) para poder distinguir qué filas están vacías o en `PDT poner Admin Fee...` — asegúrate de que el recálculo del paso 2 ya se haya aplicado antes de correr este paso.

Recuerda el alcance: **solo se tocan filas cuyo `COMMENT` heredado esté vacío o sea `PDT poner Admin Fee` (con o sin mes)** — cualquier otro comentario existente se deja intacto. Las reglas se evalúan agrupando por `SUBS` (todas las filas de una misma cuenta), no por fila individual.

## Paso 4 — Resumen final (un solo mensaje, texto plano, al terminar todo)

Repórtale al usuario, en un solo mensaje al final de todo el proceso:

1. Qué mes procesó y qué mes usó como referencia anterior (y si tuvo que preguntar algo en el paso 0, recuérdalo aquí también).
2. El resumen de cada uno de los 5 pasos, tal como cada prompt individual lo pide:
   - Customer_Pk: filas antes/después, columnas eliminadas, valores únicos de `STATUS`, anomalías.
   - BillForm_Type: filas antes/después, franquicias en el diccionario, filas de prueba eliminadas, valores únicos de `BILLFORM`, anomalías.
   - Email_Accounts: filas antes/después, última columna con datos reales, confirmación de que `FRNAME` se conservó, duplicados eliminados, valores únicos de `STATUS`/`ACCTTYPECODE`, anomalías.
   - Ensamblaje: filas totales por hoja, fórmulas recalculadas y errores (debe ser 0), tasas de match de `BILL FORM` / `EMAIL` / `COMMENT` (número y %), anomalías.
   - Validación de `COMMENT`: cuántas cuentas entraron en alcance, desglose por tipo de `OK` resuelto, cuántas quedaron pendientes (nuevas vs. ya existentes con su mes original), cuántas cuentas se "solucionaron" este mes (pasaron de pendiente a `OK`), y cualquier `PKNAME` ambiguo sin categorizar.
3. Ruta final exacta de dónde quedó guardado el reporte terminado.

Si en cualquier paso alguno de los prompts dice explícitamente que hay que preguntarle al usuario antes de seguir (duplicados en Customer_Pk, `FRCODE` sin match en BillForm_Type, tasa de match anormalmente baja en el ensamblaje, `PKNAME` ambiguo en la validación de `COMMENT`, etc.), detente ahí y pregunta — no acumules esas preguntas para el final ni las conviertas en una asunción silenciosa.
