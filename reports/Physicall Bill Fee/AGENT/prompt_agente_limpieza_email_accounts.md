# Prompt — Agente de limpieza mensual "Email_Accounts"

Úsalo tal cual en Cursor / Claude Code. Está escrito para que el agente **detecte la estructura por patrón, no por número de fila fijo**, porque el archivo cambia de tamaño cada mes.

---

## PROMPT

Vas a limpiar un archivo Excel mensual de reporte de correos electrónicos por cuenta (nombre tipo `Email_Accounts_N_MMDDAAAA.xlsx`, hoja `Report`). La estructura es consistente mes a mes pero el número de filas cambia. Sigue estos pasos:

### 1. Diagnóstico y reparación de estructura (hacer SIEMPRE primero)

- Intenta abrir el archivo con `openpyxl` y con `pandas.ExcelFile`. Si falla con un `TypeError` sobre atributos inesperados (ej. `WindowWidth`, `firstPageNo`, o similares en `workbook.xml` / `worksheets/*.xml`), el archivo tiene XML mal formado (el mismo bug del sistema de billing legacy que afecta también a `Customer_Pk` y `BillForm_Type`).
  - Descomprime el `.xlsx` como ZIP, corrige los atributos con mayúscula inicial incorrecta a camelCase estándar de OOXML (`WindowWidth`→`windowWidth`, `WindowHeight`→`windowHeight`), elimina o corrige elementos `<pageSetup>` con atributos no soportados por la spec, y vuelve a comprimir.
  - No asumas que el error va a ser siempre el mismo — lee el mensaje de `TypeError` y corrige el atributo/elemento que reporte, iterando hasta que cargue.

### 2. Detectar la estructura de datos

- Fila 1 = encabezados: `Account No., Status, Suscriber, Email` y más adelante `ACCTTYPECODE, ACCTTYPENAME`. Identifica las columnas **por nombre de encabezado, nunca por letra de columna fija** — este reporte tiene columnas vacías intercaladas Y una columna con dato real muy al final (`FRNAME`, típicamente por la columna AE) que es fácil pasar por alto si solo revisas hasta donde "parece" terminar la tabla. Escanea **todas** las columnas hasta `ws.max_column` / el límite real de `ws.dimensions`, no te detengas en un número arbitrario como 20 o 30.
- Confirma explícitamente en tu resumen final cuál es la última columna con encabezado y cuál es la última columna con datos, para que quede evidencia de que no se comieron columnas al final.
- A diferencia de `Customer_Pk` y `BillForm_Type`, este reporte **no trae pie de página con resumen al final de las filas** — verifica igual por si acaso (busca patrones tipo `Report Summary:`, `Report Criteria:`, o una fila donde la primera columna no tenga el patrón `NNN-NNNNNN` de número de cuenta), pero no asumas que siempre estará ausente.

### 3. Eliminar columnas redundantes (y NO tocar las que sí traen dato)

- El campo `Email` viene duplicado **6 veces adicionales** como hipervínculo (`http://mailto:...`) idéntico al valor de texto plano. Conserva solo **una** columna de correo (el valor de texto plano, sin el prefijo `http://mailto:`) y elimina las 6 columnas redundantes.
- Elimina columnas que estén 100% vacías en **todo** el rango real de datos — pero antes de descartar una columna por "vacía", confirma que la revisaste en las filas completas, no en una muestra. Una columna con dato disperso (como `FRNAME`, que puede aparecer muy a la derecha, columna AE en el archivo de agosto 2026) se ve vacía si solo miras las primeras columnas o una muestra corta de filas, y NO lo está.
- **`FRNAME` (nombre de franquicia) ya viene incluido de forma nativa en este reporte** — no la derives de otro archivo ni la generes tú, viene poblada por Celerity directamente. Consérvala tal cual (solo recórtale espacios sueltos), no la elimines pensando que es una columna sobrante.

### 4. Código de franquicia

- El `Account No.` viene en formato `NNN-NNNNNN` (código de franquicia - número de suscriptor). Extrae el código de franquicia (los primeros 3 dígitos) a una columna nueva `FRCODE` — permite agrupar por franquicia en la tabla dinámica junto con el `FRNAME` nativo del paso anterior.

### 5. Limpieza de datos

- Recorta espacios en blanco al inicio/final (`.strip()`) de todos los campos de texto: `Suscriber, Email, ACCTTYPECODE, ACCTTYPENAME`.
- Detecta y elimina la fila de cuenta de prueba (franquicia de código `993`, típicamente "Samuel Penaloza" / correo `@celerityfiber.com` de prueba interna) — repórtala antes de eliminarla.
- Detecta y elimina duplicados **exactos** por combinación `Account No. + Email + ACCTTYPECODE` — repórtalos antes de eliminarlos. **No elimines** registros donde la misma cuenta tenga el mismo correo pero distinto `ACCTTYPECODE` (ej. un correo puede estar registrado como `EML` y también como `BEM` — eso es legítimo, no duplicado), ni registros donde la misma cuenta tenga correos distintos (una cuenta puede tener varios correos de contacto).
- Verifica los valores únicos de `Status` y `ACCTTYPECODE` y repórtalos (para detectar si aparece un código nuevo ese mes, ej. actualmente solo se ven `ACT` en Status, y `EML`/`BEM`/`CAP` en ACCTTYPECODE).

### 6. Formato de salida para tablas dinámicas

- Una sola hoja, encabezados en fila 1: `FRCODE, FRNAME, ACCTNUM, STATUS, SUBSCRIBER, EMAIL, ACCTTYPECODE, ACCTTYPENAME`.
- Sin celdas combinadas, sin filas ni columnas vacías intercaladas.
- Encabezado con fuente Arial en negrita, fondo de color, alineado al centro.
- Cuerpo con fuente Arial 10.
- Anchos de columna ajustados a contenido.
- `freeze_panes` en `A2` y `AutoFilter` activado sobre todo el rango de datos.
- Nombra el archivo de salida `Email_Accounts_LIMPIO_[mismo sufijo de fecha del original].xlsx`.

### 7. Resumen que debes darme al final (siempre, en texto plano)

- Cuántas filas de datos había originalmente vs. cuántas quedaron.
- **Cuál fue la última columna con datos reales que detectaste (letra y encabezado)** — para verificar que no se te quedó ninguna columna al final sin revisar, como pasó con `FRNAME` la primera vez que se limpió este reporte (estaba en la columna AE y se pasó por alto por no escanear más allá de la columna 30).
- Cuántas columnas de hipervínculo redundante se eliminaron.
- Confirma explícitamente que `FRNAME` se conservó y cuántas filas quedaron sin valor en esa columna (debería ser 0 o muy cercano a 0).
- Fila(s) de prueba eliminadas.
- Duplicados exactos eliminados (y confirma que no se tocaron los casos legítimos de múltiples correos/tipos por cuenta).
- Lista de valores únicos encontrados en `STATUS` y `ACCTTYPECODE`.
- Cualquier anomalía nueva que no coincida con el patrón de meses anteriores (columnas nuevas, formato distinto, un pie de página que antes no existía) — avísame explícitamente en vez de asumir y seguir de largo.

No asumas que la estructura de errores XML, la fila donde termina la data, o el código de franquicia de prueba serán idénticos cada mes — detecta por patrón, no por posición fija, y avísame si algo no encaja con lo esperado en vez de forzar la limpieza.

---

## Notas para configurar el agente en Cursor/Claude Code

- Comparte el paso 1 (reparación de XML) como una función común (`repair_legacy_xlsx.py`) con los prompts de `Customer_Pk` y `BillForm_Type` — los tres reportes vienen del mismo sistema legacy y tienen el mismo bug.
- **`FRNAME` ya viene nativo en este reporte** (verificado contra el diccionario código→nombre de `BillForm_Type`, coinciden al 100%) — no hace falta traerlo de otro archivo. Si en algún mes futuro llegara a faltar o venir vacío, ahí sí recurre al `franquicias_lookup.csv` de `BillForm_Type` como respaldo, pero por defecto úsalo tal cual viene.
- Si el nombre de columnas cambia de un mes a otro (ej. agregan una columna nueva), pídele que te avise en el resumen en vez de descartarla silenciosamente. Esto es especialmente importante en este reporte porque ya se demostró que una columna real puede estar "escondida" muy a la derecha del rango.
