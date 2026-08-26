# Agente orquestador — Reporte mensual "Physical Bill Fee"

Este documento son las instrucciones para armar, en Cursor + Claude Code, el agente que corre **todo el proceso mensual de punta a punta**: limpia los 3 exports crudos del mes, arma el reporte final, y valida/actualiza la columna `COMMENT` con la información real de cada cuenta — usando los 5 prompts que ya tienes guardados en la carpeta `Agente`.

## 1. Estructura de carpetas que el agente debe conocer

```
Celerity Fiber/
└── Reportes/
    └── Física del Bill Fee/
        ├── Agente/                                 ← este archivo vive aquí
        │   ├── instrucciones_agente_orquestador.md (este documento)
        │   ├── prompt_agente_limpieza_customer_pk.md
        │   ├── prompt_agente_limpieza_billform_type.md
        │   ├── prompt_agente_limpieza_email_accounts.md
        │   ├── prompt_agente_ensamblaje_reporte_final.md
        │   ├── prompt_agente_validacion_comment.md
        │   └── Template_report.xlsx
        ├── Mayo/
        │   └── Physical_Bill_Fee_-_Mayo.xlsx        ← reporte final YA armado
        ├── Junio/
        │   ├── Customer_Pk_MMDDAAAA.xlsx            ← export crudo
        │   ├── BillForm_Type_MMDDAAAA.xlsx          ← export crudo
        │   ├── Email_Accounts_2_MMDDAAAA.xlsx       ← export crudo
        │   └── Physical_Bill_Fee_-_Junio.xlsx       ← reporte final YA armado
        └── Julio/
            ├── Customer_Pk_MMDDAAAA.xlsx
            ├── BillForm_Type_MMDDAAAA.xlsx
            ├── Email_Accounts_2_MMDDAAAA.xlsx
            └── (aún sin reporte final)
```

Reglas para que el agente identifique carpetas sin que tengas que escribir rutas completas cada vez:
- Las carpetas de mes están en español y en el mismo nivel que `Agente` (`Mayo`, `Junio`, `Julio`, etc.).
- El **mes a procesar** es al que le des el nombre explícitamente al invocar el comando (ver sección 3). Si no le das nombre, el agente debe listar las subcarpetas de mes, identificar cuál **tiene los 3 exports crudos pero no tiene un archivo `Physical_Bill_Fee_-_[Mes].xlsx`**, y usar esa — y si hay más de una en esa condición, debe preguntarte cuál en vez de adivinar.
- El **mes anterior** (para heredar `COMMENT`) es la carpeta de mes cronológicamente anterior a la que se está procesando, la que sí tenga ya su `Physical_Bill_Fee_-_[Mes].xlsx` final. Si no encuentra ninguna carpeta anterior con reporte final, debe avisarte en vez de asumir que no hay `COMMENT` que heredar.
- Los 3 exports crudos del mes se identifican por patrón de nombre (`Customer_Pk_*.xlsx`, `BillForm_Type_*.xlsx`, `Email_Accounts*.xlsx`), no por posición ni por asumir que solo hay un archivo de cada tipo — si encuentra más de uno del mismo tipo en la carpeta del mes, debe preguntarte cuál usar.

## 2. Qué debe hacer el agente, paso a paso

1. **Identificar el mes a procesar** y el mes anterior, según la sección 1.
2. **Limpieza (3 pasos, uno por archivo)**: aplicar sobre los exports crudos del mes los tres prompts de limpieza ya existentes (`prompt_agente_limpieza_customer_pk.md`, `prompt_agente_limpieza_billform_type.md`, `prompt_agente_limpieza_email_accounts.md`), en ese orden o en paralelo, sin modificarlos — solo ejecutarlos tal como están escritos. Guardar las 3 salidas `_LIMPIO.xlsx` **dentro de la misma carpeta del mes que se está procesando** (ej. `Julio/Customer_Pk_LIMPIO.xlsx`), para que quede evidencia junto a los archivos crudos de origen.
3. **Ensamblaje**: aplicar el prompt `prompt_agente_ensamblaje_reporte_final.md` usando:
   - `Template_report.xlsx` (de la carpeta `Agente`).
   - Los 3 archivos `_LIMPIO.xlsx` recién generados en el paso 2.
   - El `Physical_Bill_Fee_-_[MesAnterior].xlsx` de la carpeta del mes anterior.
   - Guardar el resultado como `Physical_Bill_Fee_-_[Mes].xlsx` **dentro de la carpeta del mes que se está procesando** (ej. `Julio/Physical_Bill_Fee_-_Julio.xlsx`).
4. **Validación y actualización de `COMMENT`**: aplicar el prompt `prompt_agente_validacion_comment.md` sobre la hoja `CX Activos` del reporte recién ensamblado en el paso 3 — revalida (y actualiza si corresponde) únicamente las filas cuyo `COMMENT` heredado esté vacío o diga `PDT poner Admin Fee` (con o sin mes), agrupando por `SUBS`. No toca ningún otro comentario ya existente.
5. **Resumen final en el chat**: el agente debe reportarte, en texto plano y en un solo mensaje al terminar todo el proceso:
   - Qué mes procesó y qué mes usó como referencia anterior.
   - El resumen de cada uno de los 5 pasos (los que ya piden los prompts individuales: filas antes/después, columnas eliminadas, anomalías, tasas de match de `BILL FORM`/`EMAIL`/`COMMENT`, y el desglose de cuentas resueltas/pendientes de `COMMENT`).
   - Ruta final de dónde quedó guardado el reporte terminado.

## 3. Cómo debe dispararse (solo cuando tú lo pidas explícitamente)

El agente **nunca debe correr automáticamente** — ni al abrir el proyecto, ni en background, ni por un cambio de archivo detectado. Solo corre cuando tú lo invocas a propósito.

La forma más limpia de lograr esto en Claude Code es como un **comando personalizado** (slash command), no como instrucciones sueltas en un `CLAUDE.md` que el agente podría interpretar como "hazlo ahora". Así:

1. Dentro de tu proyecto (la raíz donde tengas `Celerity Fiber/`), crea la carpeta `.claude/commands/` si no existe.
2. Guarda ahí un archivo `report_physicall_bill_fee.md` con el contenido de la sección 2 de este documento (los 4 pasos), más una línea inicial que le diga al agente que **argumento opcional recibido = nombre del mes a procesar**, y que si no se lo dan, siga la lógica de detección automática de la sección 1.
3. A partir de ahí, para correrlo tú simplemente escribes en Claude Code:
   ```
   /report_physicall_bill_fee Julio
   ```
   o, si quieres que detecte solo cuál mes falta:
   ```
   /report_physicall_bill_fee
   ```
4. El agente solo actúa cuando escribes ese comando — el resto del tiempo puedes usar Claude Code para cualquier otra cosa en el proyecto sin riesgo de que dispare el proceso por accidente.

## 4. Qué le debes copiar y pegar a Claude Code para armar esto

Cuando abras Claude Code en tu proyecto, dale esta instrucción una sola vez (es un trabajo de configuración, no de ejecución del reporte):

> "Crea el comando `/report_physicall_bill_fee` en `.claude/commands/report_physicall_bill_fee.md`. El comando debe seguir exactamente la lógica descrita en `Celerity Fiber/Reportes/Física del Bill Fee/Agente/instrucciones_agente_orquestador.md` (secciones 1 y 2 de ese archivo): identificar el mes a procesar y el mes anterior según la estructura de carpetas, correr en orden los prompts `prompt_agente_limpieza_customer_pk.md`, `prompt_agente_limpieza_billform_type.md`, `prompt_agente_limpieza_email_accounts.md`, `prompt_agente_ensamblaje_reporte_final.md` y `prompt_agente_validacion_comment.md` (todos en la carpeta `Agente`, sin modificarlos), y guardar todos los archivos generados dentro de la carpeta del mes que se está procesando. El comando no debe ejecutar nada por sí solo al crearlo — solo debe quedar disponible para cuando yo lo invoque escribiendo `/report_physicall_bill_fee`."

Con eso, Claude Code te deja el comando listo, y de ahí en adelante cada mes solo necesitas escribir `/report_physicall_bill_fee [mes]` cuando ya tengas los 3 exports crudos del mes en su carpeta correspondiente.

## 5. Notas

- Todos los archivos intermedios (`_LIMPIO.xlsx`, y cualquier log que el agente genere) quedan guardados junto a los crudos, dentro de la carpeta del mes — así cada mes queda con su rastro completo: qué entró, qué se limpió, y qué salió.
- Si algún mes cambias el nombre de las carpetas o el patrón de nombres de los exports, avísale al agente la próxima vez que lo corras — la detección por patrón asume que el formato de nombres se mantiene igual al de `Junio`/`Julio`.
- Este documento y los 4 prompts de la carpeta `Agente` son la única fuente de verdad del proceso — si necesitas cambiar algo del pipeline (una columna nueva, una regla distinta), edítalos ahí, no le des instrucciones nuevas sueltas al agente en el chat que no queden documentadas, porque la próxima vez que corras `/report_physicall_bill_fee` el agente va a volver a leer estos archivos, no lo que le dijiste una vez de pasada.
