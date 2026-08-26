# Prompt — Agente de limpieza mensual "Customer_Pk"

Úsalo tal cual en Cursor / Claude Code. Está escrito para que el agente **detecte la estructura en vez de asumir números fijos de fila**, porque el archivo cambia de tamaño cada mes.

---

## PROMPT

Vas a limpiar un archivo Excel mensual de reporte de paquetes de clientes (nombre tipo `Customer_Pk_MMDDAAAA.xlsx`). La estructura es consistente mes a mes pero el número de filas cambia. Sigue estos pasos:

### 1. Diagnóstico y reparación de estructura (hacer SIEMPRE primero)

- Intenta abrir el archivo con `openpyxl` y con `pandas.ExcelFile`. Si falla con un `TypeError` sobre atributos inesperados (ej. `WindowWidth`, `firstPageNo`, o similares en `workbook.xml` / `worksheets/*.xml`), el archivo tiene XML mal formado (típico de exports de sistemas legacy tipo ISC/billing).
  - Descomprime el `.xlsx` como ZIP, corrige los atributos con mayúscula inicial incorrecta a camelCase estándar de OOXML (`WindowWidth`→`windowWidth`, `WindowHeight`→`windowHeight`), elimina o corrige elementos `<pageSetup>` con atributos no soportados por la spec, y vuelve a comprimir.
  - No asumas que el error va a ser siempre el mismo — lee el mensaje de `TypeError` y corrige el atributo/elemento que reporte, iterando hasta que cargue.

### 2. Detectar la estructura de datos (no hardcodear filas)

- Fila 1 = encabezados. Identifica las columnas reales por nombre, no por posición fija, ya que columnas vacías intermedias pueden variar: `FRCODE, FRNAME, SUBS, FULLNAME, STATUS, PKCODE, PKNAME, PKQTY, PKAMT, EFFECTIVEDATE`.
- Elimina cualquier columna que esté 100% vacía en todo el rango de datos.
- Detecta dónde terminan los datos reales y dónde empieza el **pie de resumen**: busca filas donde la primera columna contenga etiquetas de texto en vez de un código de franquicia — patrones como `PK EFFECTIVE DATE:`, `FR CODE:`, `FR NAME:`, `ACTIVE UNITS:`, `TOTAL AMT:` (u otras etiquetas similares con `:`). Todo desde la primera fila que matchee ese patrón en adelante es pie de página, no data — elimínalo.
- Detecta y elimina filas de prueba/test: cualquier fila donde `FRNAME` o `FULLNAME` contenga la palabra "test" (sin distinguir mayúsculas/minúsculas), o códigos de franquicia claramente de prueba (revisa si el `FRCODE` correspondiente aparece asociado a nombres tipo "Test", "Demo", "ServiceBots", etc.).

### 3. Limpieza de datos

- Recorta espacios en blanco al inicio/final (`.strip()`) de todos los campos de texto: `FRNAME, FULLNAME, PKNAME` y cualquier otro campo string.
- Verifica y reporta duplicados exactos (misma fila completa repetida) — si existen, pregúntame antes de eliminarlos (podrían ser líneas de paquete legítimamente repetidas para el mismo suscriptor).
- La columna `EFFECTIVEDATE` suele venir como texto literal (ej. `"=7/31/2026"` guardado como string, no como fórmula real ni fecha). Conviértela a un valor de fecha real de Excel con formato `MM/DD/YYYY`.
- Verifica el tipo de dato de `PKAMT` (debe ser numérico) y `PKQTY` (entero). Si alguno viene como texto, conviértelo.
- Verifica valores únicos de `STATUS` y repórtalos en el resumen (para detectar si aparece algún status nuevo o inesperado ese mes).

### 4. Formato de salida para tablas dinámicas

- Una sola hoja, encabezados en fila 1, sin celdas combinadas, sin filas ni columnas vacías intercaladas.
- Encabezado con fuente Arial en negrita, fondo de color, alineado al centro.
- Cuerpo con fuente Arial 10.
- `PKAMT` con formato de moneda `$#,##0.00`.
- `EFFECTIVEDATE` con formato de fecha `MM/DD/YYYY`.
- Anchos de columna ajustados a contenido.
- `freeze_panes` en `A2` y `AutoFilter` activado sobre todo el rango de datos.
- Nombra el archivo de salida `Customer_Pk_LIMPIO_[mismo sufijo de fecha del original].xlsx`.

### 5. Resumen que debes darme al final (siempre, en texto plano)

- Cuántas filas de datos había originalmente vs. cuántas quedaron.
- Cuántas filas se eliminaron y por qué categoría (pie de página, filas de prueba, duplicados si aplica).
- Cuántas columnas vacías se eliminaron y cuáles eran.
- Cuántas celdas tenían espacios sueltos y se corrigieron.
- Lista de valores únicos encontrados en `STATUS`.
- Cualquier anomalía nueva que no coincida con el patrón de meses anteriores (columnas nuevas, formato distinto, etc.) — avísame explícitamente en vez de asumir y seguir de largo.

No asumas que la estructura de errores XML, el número de filas del pie de página, o los nombres de prueba serán idénticos cada mes — detecta por patrón, no por posición fija, y avísame si algo no encaja con lo esperado en vez de forzar la limpieza.

---

## Notas para configurar el agente en Cursor/Claude Code

- Guarda este prompt como `CLAUDE.md` o como un skill/comando reutilizable (`/limpiar-customer-pk`) en tu carpeta de proyecto, y pásale la ruta del archivo del mes como argumento.
- Si quieres que corra 100% desatendido cada mes, dile explícitamente que **no** te pregunte por duplicados sino que los reporte solamente (yo lo dejé como pregunta porque depende del caso, pero si nunca has visto duplicados legítimos, puedes quitar esa pausa).
- Si el nombre de columnas cambia de un mes a otro (ej. agregan una columna nueva), pídele que te avise en el resumen en vez de descartarla silenciosamente — así no pierdes data nueva sin darte cuenta.
