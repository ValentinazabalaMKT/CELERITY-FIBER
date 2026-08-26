# Prompt — Agente de ensamblaje mensual "Physical Bill Fee" (reporte final)

Úsalo tal cual en Cursor / Claude Code. Este prompt asume que **ya corriste antes** los tres prompts de limpieza (`Customer_Pk`, `BillForm_Type`, `Email_Accounts`) y tienes los tres archivos `_LIMPIO.xlsx` listos. Este prompt solo arma el reporte final combinando esos tres archivos con la plantilla y el reporte del mes anterior.

---

## PROMPT

Vas a armar el reporte mensual final "Physical Bill Fee" combinando tres archivos ya limpios con una plantilla fija. Necesitas 5 archivos de entrada:

1. `Template_report.xlsx` — la plantilla vacía con las hojas y encabezados ya definidos (no cambia de mes a mes).
2. `Customer_Pk_LIMPIO.xlsx` — salida del prompt de limpieza de Customer_Pk de este mes.
3. `BillForm_Type_LIMPIO.xlsx` — salida del prompt de limpieza de BillForm_Type de este mes.
4. `Email_Accounts_LIMPIO.xlsx` — salida del prompt de limpieza de Email_Accounts de este mes.
5. El reporte final **del mes inmediatamente anterior** (ej. `Physical_Bill_Fee_-_[MesAnterior].xlsx`) — se usa solo para heredar la columna `COMMENT`.

### 1. Verifica la estructura de la plantilla antes de asumir nada

No asumas que las columnas de la plantilla están en el mismo orden o cantidad que el mes pasado. Antes de escribir una sola celda:
- Lee los encabezados reales de las 4 hojas de la plantilla (`Bill Form Type`, `Customer Pk`, `Email Account`, `CX Activos`).
- Compáralos contra los encabezados del reporte final del mes anterior (mismas 4 hojas). Si detectas que a la plantilla le falta una columna que sí existía en el mes anterior (por ejemplo, la hoja `Email Account` de la plantilla puede no traer una columna para el correo en sí, aunque el mes anterior sí la tenía en la posición F) — **avísamelo explícitamente y agrégala en la posición correcta** en vez de forzar los datos donde no caben. No continúes en silencio si la estructura no calza con lo que las fórmulas de más abajo necesitan.

### 2. Hoja "Bill Form Type"

Columnas de la plantilla: `NAME, FRANCHISE, ID_GLDS, GLDS USER NAME, STARTBILL, BILLFORM, LASTBILL, CHANGEDNAME`.

Desde `BillForm_Type_LIMPIO.xlsx` (columnas `FRCODE, FRNAME, ACCTNUM, NAME, STARTBILL, BILLFORM, LASTBILL, CHANGEDBY`):

- `NAME` (plantilla) ← `ACCTNUM` (valor estático).
- `FRANCHISE` ← fórmula `=LEFT(A{fila},3)` (texto, 3 dígitos del código de franquicia).
- `ID_GLDS` ← fórmula `=VALUE(MID(A{fila},5,LEN(A{fila})-4))`. **Importante:** tiene que ir envuelto en `VALUE()` para convertirlo a número — si lo dejas como texto, no va a hacer match con `SUBS` de Customer Pk (que es numérico) cuando lo uses en los VLOOKUP de la hoja CX Activos más adelante.
- `GLDS USER NAME` ← columna `NAME` del archivo limpio (el **nombre del suscriptor**, ej. "SABRINA BENT" — NO la franquicia, aunque el nombre de la columna se preste a confusión).
- `STARTBILL` ← `STARTBILL` (fecha, formato `MM/DD/YYYY`).
- `BILLFORM` ← `BILLFORM`.
- `LASTBILL` ← `LASTBILL` (moneda, formato `$#,##0.00;($#,##0.00)` porque hay valores negativos).
- `CHANGEDNAME` ← `CHANGEDBY`.

### 3. Hoja "Customer Pk"

Copia exacta, columna por columna, de `Customer_Pk_LIMPIO.xlsx` — sin transformar nada. Formato moneda en `PKAMT`, formato fecha en `EFFECTIVEDATE`.

### 4. Hoja "Email Account"

Columnas de la plantilla (verifica que incluya `EMAIL` — ver paso 1): `ACCOUNT NO., FRANCHISE CODE, GLDS ID USER, STATUS, SUBSCRIBER, EMAIL, ACCTTYPECODE, ACCTYPENAME, FRNAME`.

Desde `Email_Accounts_LIMPIO.xlsx` (columnas `FRCODE, FRNAME, ACCTNUM, STATUS, SUBSCRIBER, EMAIL, ACCTTYPECODE, ACCTTYPENAME`):

- `ACCOUNT NO.` ← `ACCTNUM` (valor estático).
- `FRANCHISE CODE` ← fórmula `=LEFT(A{fila},3)`.
- `GLDS ID USER` ← fórmula `=VALUE(MID(A{fila},5,LEN(A{fila})-4))` (mismo motivo que en el punto 2: tiene que ser numérico para que el VLOOKUP de CX Activos funcione).
- `STATUS` ← `STATUS`.
- `SUBSCRIBER` ← `SUBSCRIBER`.
- `EMAIL` ← `EMAIL` (pase directo).
- `ACCTTYPECODE` ← `ACCTTYPECODE`.
- `ACCTYPENAME` ← `ACCTTYPENAME`.
- `FRNAME` ← `FRNAME` (pase directo, sin fórmula).

### 5. Hoja "CX Activos"

- Columnas `FRCODE` hasta `EFFECTIVEDATE` (A–J): copia exacta de lo que ya pusiste en la hoja `Customer Pk` (mismos valores, mismo orden).
- `BILL FORM` (columna K): fórmula `=+IFERROR(VLOOKUP(C{fila},'Bill Form Type'!C:F,4,FALSE),0)` — busca el `SUBS` (columna C de CX Activos) contra `ID_GLDS` (columna C de Bill Form Type) y trae `BILLFORM` (columna F, cuarta columna del rango C:F).
- `EMAIL` (columna L): fórmula `=+IFERROR(VLOOKUP(C{fila},'Email Account'!C:F,4,FALSE),0)` — mismo patrón, contra `GLDS ID USER` (columna C de Email Account) trayendo `EMAIL` (columna F, cuarta columna del rango C:F — por eso el paso 1 es crítico, si `EMAIL` no está exactamente en la columna F de esa hoja, esta fórmula trae el dato equivocado).
- `COMMENT` (columna M): **no lo hagas a mano ni con una fórmula que apunte a un archivo externo** (los links externos se rompen si alguien mueve el archivo). En vez de eso:
  1. Del reporte final del mes anterior, lee la hoja `CX Activos`, columnas `SUBS` y `COMMENT`.
  2. Arma un diccionario `SUBS → Comentario`, quedándote con la **primera aparición** de cada `SUBS` si hay repetidos (así replica el comportamiento natural de un VLOOKUP).
  3. Crea una hoja nueva **oculta** en el archivo de salida, ej. `Comments_Ref_[MesAnterior]`, con esas dos columnas.
  4. En la columna `COMMENT` de CX Activos, usa una fórmula `=+IFERROR(VLOOKUP(C{fila},Comments_Ref_[MesAnterior]!A:B,2,FALSE),"")` contra esa hoja de referencia — así queda igual de auditable y editable que las otras dos columnas, sin depender de un archivo externo.
  5. Es normal y esperado que las cuentas nuevas de este mes (que no existían el mes pasado) queden con `COMMENT` vacío — no es un error, avísamelo solo como dato informativo en el resumen.

### 6. Recalcular y validar (obligatorio, no es opcional)

- Como el archivo queda con fórmulas reales (no valores fijos), tienes que recalcularlo con el script de recálculo del skill de xlsx antes de entregarlo — si no lo haces, Excel muestra las fórmulas como texto crudo o valores viejos hasta que el usuario las recalcule manualmente.
- Después de recalcular, valida contra errores: 0 errores de fórmula esperado.
- Además del chequeo de errores, valida las **tasas de match** de las tres columnas cruzadas y repórtalas:
  - `BILL FORM`: debería resolverse en prácticamente el 100% de las filas (todo suscriptor activo tiene un tipo de facturación).
  - `EMAIL`: normal que no llegue al 100% — no todos los suscriptores tienen correo registrado.
  - `COMMENT`: normal que sea cercano al 100% pero no exacto — el faltante son las cuentas nuevas del mes.
- Si alguna de estas tasas se ve anormalmente baja (ej. `BILL FORM` resolviendo menos del 90%), es señal de que algo se desalineó (formato de tipo texto vs número en las columnas de cruce, columna corrida de posición, etc.) — no entregues el archivo así, avísame primero.

### 7. Resumen que debes darme al final (siempre, en texto plano)

- Confirmación de que la estructura de la plantilla calzó con lo esperado, o qué tuviste que ajustar y por qué (ej. columna faltante agregada).
- Filas totales por hoja.
- Total de fórmulas recalculadas y errores encontrados (debe ser 0).
- Tasa de match de `BILL FORM`, `EMAIL` y `COMMENT` (número y porcentaje).
- Cualquier anomalía que no coincida con el patrón de meses anteriores.

No asumas que la plantilla o el reporte del mes anterior van a tener exactamente la misma estructura que el mes pasado — verifica encabezados y posiciones de columna antes de escribir fórmulas de cruce, porque un VLOOKUP con el rango corrido de columna falla en silencio (trae el dato de la columna equivocada) en vez de dar un error visible.

---

## Notas para configurar el agente en Cursor/Claude Code

- Este prompt depende de que los tres prompts de limpieza (`Customer_Pk`, `BillForm_Type`, `Email_Accounts`) ya se hayan corrido este mes — considera encadenarlos en un solo comando (`/reporte-mensual-completo`) que corra los 4 prompts en secuencia: limpieza ×3 → ensamblaje.
- Guarda este prompt en la misma carpeta que los otros tres (`Celerity Fiber/Reports/Physical Bill Fee/`), ya que es el paso final de la misma cadena mensual.
- El nombre de la hoja oculta de referencia de comentarios (`Comments_Ref_[Mes]`) cambia cada mes — si prefieres que siempre se llame igual (ej. `Comments_Ref`) y solo se sobreescriba, dímelo y ajusta el prompt; tal como está, cada mes queda su propia hoja de referencia con el nombre del mes anterior, lo cual deja trazabilidad de qué mes se usó como fuente pero acumula una hoja oculta más cada vez.
