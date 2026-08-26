# Prompt — Agente de limpieza mensual "BillForm_Type"

Úsalo tal cual en Cursor / Claude Code. Está escrito para que el agente **detecte la estructura por patrón, no por número de fila fijo**, porque el archivo cambia de tamaño cada mes (miles de cuentas nuevas o dadas de baja).

---

## PROMPT

Vas a limpiar un archivo Excel mensual de reporte de tipo de facturación por cuenta (nombre tipo `BillForm_Type_MMDDAAAA.xlsx`, hoja `Report`). La estructura es consistente mes a mes pero el número de filas cambia. Sigue estos pasos:

### 1. Diagnóstico y reparación de estructura (hacer SIEMPRE primero)

- Intenta abrir el archivo con `openpyxl` y con `pandas.ExcelFile`. Si falla con un `TypeError` sobre atributos inesperados (ej. `WindowWidth`, `firstPageNo`, o similares en `workbook.xml` / `worksheets/*.xml`), el archivo tiene XML mal formado (típico de exports del sistema de billing legacy).
  - Descomprime el `.xlsx` como ZIP, corrige los atributos con mayúscula inicial incorrecta a camelCase estándar de OOXML (`WindowWidth`→`windowWidth`, `WindowHeight`→`windowHeight`), elimina o corrige elementos `<pageSetup>` con atributos no soportados por la spec, y vuelve a comprimir.
  - No asumas que el error va a ser siempre el mismo — lee el mensaje de `TypeError` y corrige el atributo/elemento que reporte, iterando hasta que cargue.

### 2. Detectar la estructura de datos (no hardcodear filas)

Este reporte trae un bloque de encabezado de 6 filas (Date, Time, USR code, título del reporte, número de página, versión, luego la fila de nombres de columna) antes de que empiecen los datos reales. **No asumas que siempre serán exactamente 6 filas** — busca la primera fila donde la columna de número de cuenta tenga un patrón `NNN-NNNNNN` (3 dígitos, guion, dígitos) para ubicar el inicio real de los datos.

Columnas reales a extraer (ubícalas por contenido, no por letra fija, ya que hay columnas vacías intercaladas que varían):
- **Acct #** — patrón `NNN-NNNNNN` (los primeros 3 dígitos antes del guion son el código de franquicia).
- **Name** — nombre del suscriptor.
- **STARTBILL** — fecha.
- **BillForm** — código corto (ej. F3M, EMB, NBF).
- **LASTBILL** — monto (puede ser negativo).
- **CHANGEDNAME** — usuario que hizo el último cambio (ej. SUPERVISOR, o iniciales de un agente).

### 3. Detectar y separar el pie de página / resumen (NO son datos)

Al final del archivo hay un bloque largo de metadata y resumen que **debes eliminar de la tabla de datos**, pero que **debes usar como fuente para enriquecer los datos** antes de descartarlo:

- Busca el patrón `Report Criteria:` o `Report Summary:` en cualquier columna — todo desde la primera fila que matchee ese patrón (o la primera fila vacía inmediatamente después del último registro con patrón de cuenta válido) en adelante es pie de página.
- Dentro de ese pie de página hay una **tabla resumen por franquicia** (columnas: código de franquicia, nombre de franquicia, cantidad de Subs, cantidad de Equip) que sirve como diccionario código→nombre de franquicia. Extráela ANTES de eliminar el pie de página.
- Usa ese diccionario para agregar dos columnas nuevas a los datos limpios: `FRCODE` (los primeros 3 dígitos del número de cuenta) y `FRNAME` (nombre de franquicia correspondiente, vía el diccionario extraído). Esto evita tener que hacer VLOOKUP manual después en la tabla dinámica.
- Si algún `FRCODE` de los datos no aparece en el diccionario, repórtalo — no lo dejes en blanco silenciosamente.

### 4. Limpieza de datos

- Recorta espacios en blanco al inicio/final (`.strip()`) de todos los campos de texto: `Name, BillForm, CHANGEDNAME`.
- Detecta y elimina la fila de cuenta de prueba (franquicia de código `993`, típicamente nombre "Test - ServiceBots" o similar) — repórtala antes de eliminarla.
- Verifica duplicados exactos por combinación `Acct# + BillForm` — si existen, repórtalos y pregúntame antes de eliminarlos.
- Reporta cuántas filas quedaron con `Name` vacío (dato faltante en el origen, no error tuyo) — consérvalas, solo avísame el conteo.
- Verifica los valores únicos de `BillForm` y repórtalos (para detectar si aparece un código nuevo ese mes).

### 5. Formato de salida para tablas dinámicas

- Una sola hoja, encabezados en fila 1: `FRCODE, FRNAME, ACCTNUM, NAME, STARTBILL, BILLFORM, LASTBILL, CHANGEDBY`.
- Sin celdas combinadas, sin filas ni columnas vacías intercaladas.
- Encabezado con fuente Arial en negrita, fondo de color, alineado al centro.
- Cuerpo con fuente Arial 10.
- `STARTBILL` con formato de fecha `MM/DD/YYYY`.
- `LASTBILL` con formato de moneda que muestre negativos entre paréntesis: `$#,##0.00;($#,##0.00)`.
- Anchos de columna ajustados a contenido.
- `freeze_panes` en `A2` y `AutoFilter` activado sobre todo el rango de datos.
- Nombra el archivo de salida `BillForm_Type_LIMPIO_[mismo sufijo de fecha del original].xlsx`.

### 6. Resumen que debes darme al final (siempre, en texto plano)

- Cuántas filas de datos reales había vs. cuántas quedaron en el archivo limpio.
- En qué fila detectó que empezaban los datos reales y en qué fila detectó que empezaba el pie de página (para que puedas verificar rápido que no se comió ni dejó de comer nada).
- Cuántas franquicias entraron en el diccionario código→nombre y si hubo algún `FRCODE` sin match.
- Fila(s) de prueba eliminadas.
- Cuántas filas quedaron con `Name` vacío.
- Lista de valores únicos encontrados en `BILLFORM`.
- Cualquier anomalía nueva que no coincida con el patrón de meses anteriores (columnas nuevas, formato distinto, franquicias nuevas no vistas antes) — avísame explícitamente en vez de asumir y seguir de largo.

No asumas que la estructura de errores XML, la fila exacta donde empieza el pie de página, o el código de franquicia de prueba serán idénticos cada mes — detecta por patrón, no por posición fija, y avísame si algo no encaja con lo esperado en vez de forzar la limpieza.

---

## Notas para configurar el agente en Cursor/Claude Code

- Guarda este prompt junto con el de `Customer_Pk` en el mismo proyecto — ambos reportes vienen del mismo sistema legacy y comparten el bug de XML corrupto, así que el paso 1 se puede factorizar en una función común (`repair_legacy_xlsx.py`) que ambos prompts invoquen.
- El diccionario franquicia código→nombre que este reporte genera es reutilizable: si quieres, pídele al agente que lo guarde aparte como `franquicias_lookup.csv` para usarlo también al limpiar `Customer_Pk` u otros reportes del mismo sistema, en vez de mantenerlo dentro de este archivo únicamente.
- Si el nombre de columnas cambia de un mes a otro (ej. agregan una columna nueva), pídele que te avise en el resumen en vez de descartarla silenciosamente.
