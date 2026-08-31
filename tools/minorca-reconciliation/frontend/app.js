/* ---------------------------------------------------------------------
   i18n
--------------------------------------------------------------------- */
const STRINGS = {
  refresh: { en: "↻ Refresh Data", es: "↻ Actualizar datos" },
  exportAll: { en: "Export All", es: "Exportar todo" },
  exportIssues: { en: "Export Issues", es: "Exportar inconsistencias" },
  issueSummaryTitle: { en: "Inconsistency Summary", es: "Resumen de inconsistencias" },
  issueSummaryHint: { en: "Select one or more categories to see matching records right here", es: "Selecciona una o más categorías para ver los registros aquí mismo" },
  clearSelection: { en: "Clear selection", es: "Limpiar selección" },
  issueSummaryEmptyHint: { en: "No category selected yet — click one of the cards above.", es: "Aún no has seleccionado ninguna categoría — haz clic en una de las tarjetas de arriba." },
  matrixTitle: { en: "Presence Matrix", es: "Matriz de presencia" },
  matrixHint: { en: "IT device state × GLDS status × Salesforce status", es: "Estado del equipo IT × Estado GLDS × Estado Salesforce" },
  detailTitle: { en: "Reconciliation Detail", es: "Detalle de conciliación" },
  searchPlaceholder: { en: "Search Unit Number or Account Number…", es: "Buscar número de unidad o cuenta…" },
  clearFilters: { en: "Clear filters", es: "Limpiar filtros" },
  unassignedTitle: { en: "Records With No Unit Reference", es: "Registros sin unidad asociada" },
  unassignedHint: {
    en: "Kept for auditability — excluded from the unit-level grid above because they carry no unit number in their source file",
    es: "Se conservan para auditoría — no aparecen en la tabla de unidades porque no tienen un número de unidad en su archivo de origen",
  },
  property: { en: "Property", es: "Propiedad" },
  dataSourceDate: { en: "Data source date", es: "Fecha de los datos" },
  generated: { en: "Generated", es: "Generado" },
  pctReconciled: { en: "records reconciled successfully", es: "de los registros se concilian correctamente" },
  requireReview: { en: "record(s) require review", es: "registro(s) requieren revisión" },
  itRows: { en: "rows", es: "filas" },
  units: { en: "units", es: "unidades" },
  unassigned: { en: "unassigned", es: "sin unidad" },
  noUnitOnFile: { en: "no unit on file", es: "sin unidad en archivo" },
  kpiTotalUnits: { en: "Total Units", es: "Total de unidades" },
  kpiItOn: { en: "IT Devices ON", es: "Equipos IT encendidos" },
  kpiGldsActive: { en: "GLDS Active Customers", es: "Clientes activos en GLDS" },
  kpiSfActive: { en: "Salesforce Active Customers", es: "Clientes activos en Salesforce" },
  kpiFullyMatched: { en: "Fully Matched", es: "Totalmente conciliados" },
  kpiIssuesFound: { en: "Issues Found", es: "Inconsistencias encontradas" },
  colUnit: { en: "Unit", es: "Unidad" },
  colItDevice: { en: "IT Device", es: "Equipo IT" },
  colItSpeed: { en: "IT Speed", es: "Velocidad IT" },
  colPkgSpeed: { en: "GLDS Package", es: "Paquete GLDS" },
  colSpeedMatch: { en: "Speed Match", es: "Coincide velocidad" },
  colGldsAccount: { en: "GLDS Account", es: "Cuenta GLDS" },
  colGldsStatus: { en: "GLDS Status", es: "Estado GLDS" },
  colSfAccount: { en: "SF Account", es: "Cuenta SF" },
  colSfStatus: { en: "SF Status", es: "Estado SF" },
  colUnitMatch: { en: "Unit Match", es: "Coincide unidad" },
  colAccountMatch: { en: "Account Match", es: "Coincide cuenta" },
  colOverallStatus: { en: "Overall Status", es: "Estado general" },
  colIssue: { en: "Issue", es: "Inconsistencia" },
  fOverallAll: { en: "Overall Status: All", es: "Estado general: Todos" },
  fIssueAll: { en: "Issue Category: All", es: "Categoría: Todas" },
  fItDeviceAll: { en: "IT Device: All", es: "Equipo IT: Todos" },
  fItOn: { en: "ON", es: "Encendido" },
  fItOff: { en: "OFF", es: "Apagado" },
  fGldsAll: { en: "GLDS Status: All", es: "Estado GLDS: Todos" },
  fSfAll: { en: "Salesforce Status: All", es: "Estado Salesforce: Todos" },
  fAccountAll: { en: "Account Match: All", es: "Coincide cuenta: Todas" },
  fSpeedAll: { en: "Speed Match: All", es: "Coincide velocidad: Todas" },
  fMatch: { en: "Match", es: "Coincide" },
  fMismatch: { en: "Mismatch", es: "No coincide" },
  fNA: { en: "N/A", es: "N/D" },
  resultCount: { en: "of {total} records", es: "de {total} registros" },
  noResults: { en: "No records match the current filters.", es: "Ningún registro coincide con los filtros actuales." },
  unassignedItTitle: { en: "IT devices with no unit assigned", es: "Equipos IT sin unidad asignada" },
  unassignedItDesc: {
    en: "Physical devices found in the Minorca IT sheet whose \"Unit Number\" field is blank (e.g. spares, maintenance MACs). Not matchable to a unit, so excluded from the grid above; full list available in Export All.",
    es: "Equipos físicos en la hoja IT de Minorca sin número de unidad (repuestos, MACs de mantenimiento, etc.). No se pueden asociar a una unidad, por lo que no aparecen en la tabla; el listado completo está disponible en \"Exportar todo\".",
  },
  unassignedGldsTitle: { en: "GLDS accounts with no unit on file", es: "Cuentas GLDS sin unidad en archivo" },
  unassignedGldsDesc: {
    en: "GLDS billing accounts with no address/unit recorded (mostly legacy / collections accounts). {bridged} of these were still linkable to a unit via a matching Salesforce account number.",
    es: "Cuentas de facturación GLDS sin dirección/unidad registrada (mayormente cuentas antiguas o en cobranza). {bridged} de ellas se pudieron vincular a una unidad mediante el número de cuenta en Salesforce.",
  },
  detailOverallStatus: { en: "Overall Status", es: "Estado general" },
  detailIT: { en: "IT", es: "IT" },
  detailGLDS: { en: "GLDS", es: "GLDS" },
  detailSF: { en: "Salesforce", es: "Salesforce" },
  detailReconResult: { en: "Reconciliation Result", es: "Resultado de la conciliación" },
  detailIssueExplanation: { en: "Issue Explanation", es: "Explicación de la inconsistencia" },
  noItRecord: { en: "No IT record found for this unit.", es: "No se encontró registro de IT para esta unidad." },
  noGldsRecord: { en: "No GLDS record found for this unit.", es: "No se encontró registro de GLDS para esta unidad." },
  noSfRecord: { en: "No Salesforce record found for this unit.", es: "No se encontró registro de Salesforce para esta unidad." },
  noIssues: { en: "No inconsistencies detected for this unit.", es: "No se detectaron inconsistencias para esta unidad." },
  row: { en: "Row", es: "Fila" },
  duplicate: { en: "duplicate", es: "duplicado" },
  bridgedNote: { en: "linked via Account Number, GLDS has no unit on file", es: "vinculado por número de cuenta, GLDS no tiene unidad en archivo" },
  reconUnitMatch: { en: "Unit Number Match (GLDS ↔ SF)", es: "Coincidencia de unidad (GLDS ↔ SF)" },
  reconAccountMatch: { en: "GLDS Account", es: "Cuenta GLDS" },
  reconDeviceStatus: { en: "Device Status", es: "Estado del equipo" },
  reconSpeed: { en: "Speed Comparison (IT vs GLDS Package)", es: "Comparación de velocidad (IT vs paquete GLDS)" },
  deviceIssueElsewhere: { en: "OFF — ISSUE (active elsewhere)", es: "APAGADO — INCONSISTENCIA (activo en otra fuente)" },
  speedNoPkg: { en: "N/A - No billed package found in GLDS (Customer_Pk)", es: "N/D - No se encontró paquete facturado en GLDS (Customer_Pk)" },
  pkgName: { en: "Billed package", es: "Paquete facturado" },
  kIt: {
    unit_raw: { en: "Unit Number", es: "Número de unidad" },
    speed_raw: { en: "Speed", es: "Velocidad" },
    mac_onu: { en: "MAC / ONU", es: "MAC / ONU" },
    serial: { en: "Serial", es: "Serie" },
    olt: { en: "OLT", es: "OLT" },
    provider: { en: "Provider", es: "Proveedor" },
    owner: { en: "Owner", es: "Propietario" },
  },
  kGlds: {
    account: { en: "Account No.", es: "No. de cuenta" },
    account_norm: { en: "Account (normalized)", es: "Cuenta (normalizada)" },
    status_raw: { en: "Status (raw)", es: "Estado (crudo)" },
    status_class: { en: "Status (classified)", es: "Estado (clasificado)" },
    name: { en: "Name", es: "Nombre" },
    address: { en: "Address", es: "Dirección" },
  },
  kSf: {
    unit_code: { en: "Unit Code", es: "Código de unidad" },
    account: { en: "GLDS Account Number", es: "Número de cuenta GLDS" },
    account_norm: { en: "Account (normalized)", es: "Cuenta (normalizada)" },
    status_raw: { en: "Status", es: "Estado" },
    building_code: { en: "Building Code", es: "Código de edificio" },
  },
  categorySelectedPrefix: { en: "Showing records for:", es: "Mostrando registros de:" },
};

const CATEGORY_LABELS = {
  "Duplicate records": { en: "Duplicate records", es: "Registros duplicados" },
  "Account Number mismatch": { en: "Account Number mismatch", es: "Discrepancia de número de cuenta" },
  "Account associated with different unit": { en: "Account associated with different unit", es: "Cuenta asociada a otra unidad" },
  "Active but device OFF": { en: "Active but device OFF", es: "Activo pero equipo apagado" },
  "Device ON but GLDS inactive": { en: "Device ON but GLDS inactive", es: "Equipo encendido pero GLDS inactivo" },
  "Device ON but Salesforce inactive": { en: "Device ON but Salesforce inactive", es: "Equipo encendido pero Salesforce inactivo" },
  "Device ON but GLDS pending": { en: "Device ON but GLDS pending", es: "Equipo encendido, GLDS pendiente" },
  "Device ON but Salesforce pending": { en: "Device ON but Salesforce pending", es: "Equipo encendido, Salesforce pendiente" },
  "Missing in GLDS": { en: "Missing in GLDS", es: "No existe en GLDS" },
  "Missing in Salesforce": { en: "Missing in Salesforce", es: "No existe en Salesforce" },
  "Only in IT": { en: "Only in IT", es: "Solo en IT" },
  "Only in GLDS": { en: "Only in GLDS", es: "Solo en GLDS" },
  "Only in Salesforce": { en: "Only in Salesforce", es: "Solo en Salesforce" },
  "Speed/package mismatch": { en: "Speed/package mismatch", es: "Discrepancia de velocidad/paquete" },
};

const CATEGORY_DESCRIPTIONS = {
  "Duplicate records": {
    en: "This unit has more than one row in a source, and the pattern needs review: either one side has zero or more than one Active row, or GLDS and Salesforce disagree on which account is the active one. (Having exactly one Active row + the rest Inactive/Disconnected on both platforms, pointing to the same account, is normal history and is NOT flagged.) Every row stays visible in the detail panel either way.",
    es: "Esta unidad tiene más de una fila en alguna fuente, y el patrón necesita revisión: o algún lado tiene cero o más de una fila Activa, o GLDS y Salesforce no coinciden en cuál es la cuenta activa. (Tener exactamente una fila Activa + el resto Inactiva/Desconectada en ambas plataformas, apuntando a la misma cuenta, es historial normal y NO se marca.) Todas las filas quedan visibles en el panel de detalle de todas formas.",
  },
  "Account Number mismatch": {
    en: "For the same unit, the GLDS account number and the Salesforce \"GLDS Account Number\" field don't match — one of the two systems likely has the wrong account linked to this unit.",
    es: "Para la misma unidad, el número de cuenta de GLDS y el campo \"GLDS Account Number\" de Salesforce no coinciden — probablemente uno de los dos sistemas tiene la cuenta incorrecta vinculada a esta unidad.",
  },
  "Account associated with different unit": {
    en: "This account number is also linked, in the other system, to a different unit than the one shown here — a sign the account was reassigned or migrated in one system without updating the other.",
    es: "Este número de cuenta también está vinculado, en el otro sistema, a una unidad distinta de la que se muestra aquí — indica que la cuenta se reasignó o migró en un sistema sin actualizar el otro.",
  },
  "Active but device OFF": {
    en: "GLDS and/or Salesforce show this customer as Active, but no active device was found for this unit in the IT equipment database — the customer may be billed for service that isn't actually connected.",
    es: "GLDS y/o Salesforce muestran a este cliente como Activo, pero no se encontró un equipo activo para esta unidad en la base de IT — el cliente podría estar facturado por un servicio que en realidad no está conectado.",
  },
  "Device ON but GLDS inactive": {
    en: "An active device was found in IT for this unit, but GLDS shows the account as inactive/disconnected/other — possible unbilled or unauthorized service.",
    es: "Se encontró un equipo activo en IT para esta unidad, pero GLDS muestra la cuenta como inactiva/desconectada/otro — posible servicio no facturado o no autorizado.",
  },
  "Device ON but Salesforce inactive": {
    en: "An active device was found in IT for this unit, but Salesforce shows the customer as inactive/disconnected/cancelled/other — possible unbilled or unauthorized service.",
    es: "Se encontró un equipo activo en IT para esta unidad, pero Salesforce muestra al cliente como inactivo/desconectado/cancelado/otro — posible servicio no facturado o no autorizado.",
  },
  "Device ON but GLDS pending": {
    en: "The device is active in IT while GLDS shows this account with a pending status — worth confirming the install/activation was fully closed out.",
    es: "El equipo está activo en IT mientras GLDS muestra esta cuenta con estado pendiente — conviene confirmar que la instalación/activación quedó cerrada.",
  },
  "Device ON but Salesforce pending": {
    en: "The device is active in IT while Salesforce shows this customer with a pending/on-hold status — worth confirming the install/activation was fully closed out.",
    es: "El equipo está activo en IT mientras Salesforce muestra a este cliente con estado pendiente/en espera — conviene confirmar que la instalación/activación quedó cerrada.",
  },
  "Missing in GLDS": {
    en: "There's an active device in IT for this unit, but no matching record exists in GLDS billing at all.",
    es: "Hay un equipo activo en IT para esta unidad, pero no existe ningún registro correspondiente en la facturación de GLDS.",
  },
  "Missing in Salesforce": {
    en: "There's an active device in IT for this unit, but no matching record exists in Salesforce at all.",
    es: "Hay un equipo activo en IT para esta unidad, pero no existe ningún registro correspondiente en Salesforce.",
  },
  "Only in IT": {
    en: "This unit exists only in the IT equipment database; no matching record was found in either GLDS or Salesforce.",
    es: "Esta unidad existe solo en la base de equipos de IT; no se encontró un registro correspondiente en GLDS ni en Salesforce.",
  },
  "Only in GLDS": {
    en: "This unit exists only in GLDS billing; no matching record was found in either IT or Salesforce.",
    es: "Esta unidad existe solo en la facturación de GLDS; no se encontró un registro correspondiente en IT ni en Salesforce.",
  },
  "Only in Salesforce": {
    en: "This unit exists only in Salesforce; no matching record was found in either IT or GLDS.",
    es: "Esta unidad existe solo en Salesforce; no se encontró un registro correspondiente en IT ni en GLDS.",
  },
  "Speed/package mismatch": {
    en: "IT has the device provisioned at a different speed than the package billed in GLDS (Customer_Pk) for this account — could mean an upgrade/downgrade that wasn't reflected on the other side.",
    es: "IT tiene el equipo aprovisionado a una velocidad distinta a la del paquete facturado en GLDS (Customer_Pk) para esta cuenta — puede indicar un upgrade/downgrade que no se reflejó del otro lado.",
  },
};

const STATUS_LABELS = {
  "Active": { en: "Active", es: "Activo" },
  "Inactive": { en: "Inactive", es: "Inactivo" },
  "Disconnected": { en: "Disconnected", es: "Desconectado" },
  "Pending": { en: "Pending", es: "Pendiente" },
  "Cancelled": { en: "Cancelled", es: "Cancelado" },
  "Other": { en: "Other", es: "Otro" },
  "Missing": { en: "Missing", es: "Sin registro" },
};

const OVERALL_LABELS = {
  "OK": { en: "OK", es: "OK" },
  "WARNING": { en: "WARNING", es: "ADVERTENCIA" },
  "CRITICAL": { en: "CRITICAL", es: "CRÍTICO" },
  "NOT FOUND": { en: "NOT FOUND", es: "NO ENCONTRADO" },
  "DUPLICATE": { en: "DUPLICATE", es: "DUPLICADO" },
};

const MATCH_LABELS = {
  "MATCH": { en: "Match", es: "Coincide" },
  "MISMATCH": { en: "Mismatch", es: "No coincide" },
  "N/A": { en: "N/A", es: "N/D" },
};

/* ---------------------------------------------------------------------
   State
--------------------------------------------------------------------- */
let STATE = {
  lang: localStorage.getItem("minorca_lang") || "en",
  summary: null,
  records: [],
  unassigned: { it: [], glds: [] },
  selectedCategories: new Set(),
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[STATE.lang] || entry.en;
}
function tFmt(key, vars) {
  let s = t(key);
  Object.entries(vars || {}).forEach(([k, v]) => { s = s.replace(`{${k}}`, v); });
  return s;
}
function tCat(cat) { return (CATEGORY_LABELS[cat] || { en: cat, es: cat })[STATE.lang]; }
function tCatDesc(cat) {
  const entry = CATEGORY_DESCRIPTIONS[cat];
  if (!entry) return "";
  return entry[STATE.lang] || entry.en;
}
function tStatus(cls) { if (!cls) return "—"; return (STATUS_LABELS[cls] || { en: cls, es: cls })[STATE.lang]; }
function tOverall(v) { return (OVERALL_LABELS[v] || { en: v, es: v })[STATE.lang]; }
function tMatch(v) { return (MATCH_LABELS[v] || { en: v, es: v })[STATE.lang]; }
function tDevice(on) { return on ? t("fItOn") : t("fItOff"); }
function tField(group, key) {
  const g = STRINGS[group];
  if (!g || !g[key]) return key;
  return g[key][STATE.lang] || g[key].en;
}

function applyStaticTranslations() {
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.title = STATE.lang === "es" ? "Conciliación de Datos Minorca" : "Minorca Data Reconciliation";
  $("#propertyChip").textContent = `${t("property")}: Minorca`;
  $("#langEnBtn").classList.toggle("active", STATE.lang === "en");
  $("#langEsBtn").classList.toggle("active", STATE.lang === "es");
}

function badgeClassFromValue(value) {
  if (value === null || value === undefined) return "NA";
  return String(value).toUpperCase().replace(/[^A-Z]/g, "");
}

function badge(rawValue, label) {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return `<span class="badge badge-NA">${t("fNA")}</span>`;
  }
  return `<span class="badge badge-${badgeClassFromValue(rawValue)}">${label}</span>`;
}

function overallBadge(status) { return badge(status, tOverall(status)); }
function deviceBadge(on) { return badge(on ? "ON" : "OFF", tDevice(on)); }
function matchBadge(v) { return badge(v === "N/A" ? "NA" : v, tMatch(v)); }
function statusBadge(cls, rawText) {
  if (!cls) return badge("MISSING", tStatus("Missing"));
  const label = rawText ? `${rawText} (${tStatus(cls)})` : tStatus(cls);
  return badge(cls, label);
}

/* ---------------------------------------------------------------------
   Data fetch
--------------------------------------------------------------------- */
async function fetchData() {
  const res = await fetch("/api/data");
  const data = await res.json();
  if (data.error) {
    document.getElementById("app").innerHTML =
      `<div class="panel"><h2>Source file missing</h2><p>${data.error}</p></div>`;
    throw new Error(data.error);
  }
  STATE.summary = data.summary;
  STATE.records = data.records;
  STATE.unassigned = data.unassigned;
  STATE._generatedAt = data.generated_at;
  return data;
}

/* ---------------------------------------------------------------------
   Renderers
--------------------------------------------------------------------- */
function renderHeader() {
  const it = STATE.summary.sources.it;
  const glds = STATE.summary.sources.glds;
  const sf = STATE.summary.sources.salesforce;
  const pk = STATE.summary.sources.pk;
  const dates = [it.modified, glds.modified, sf.modified, pk.modified].sort().reverse()[0];
  $("#dataSourceDate").textContent = `${t("dataSourceDate")}: ${dates.split(" ")[0]}`;
  $("#generatedAt").textContent = `${t("generated")}: ${STATE._generatedAt}`;
}

function renderDQBanner() {
  const dq = STATE.summary.data_quality;
  const c = STATE.summary.counts;
  $("#dqBanner").innerHTML = `
    <span class="big">${dq.pct_reconciled}% ${t("pctReconciled")}</span>
    <span class="sub">${dq.records_requiring_review} ${t("requireReview")}</span>
    <span class="sub" style="margin-left:auto;">
      IT: ${c.it_rows} ${t("itRows")} (${c.it_units} ${t("units")}, ${c.it_unassigned_devices} ${t("unassigned")}) ·
      GLDS: ${c.glds_rows} ${t("itRows")} (${c.glds_units} ${t("units")}, ${c.glds_unassigned_accounts} ${t("noUnitOnFile")}) ·
      Salesforce: ${c.sf_rows} ${t("itRows")} (${c.sf_units} ${t("units")}) ·
      Customer_Pk: ${c.pk_rows} ${t("itRows")} (${c.pk_speed_packages} ${t("colPkgSpeed")})
    </span>
  `;
}

function renderKpis() {
  const k = STATE.summary.kpis;
  const cards = [
    { label: t("kpiTotalUnits"), value: k.total_units, cls: "" },
    { label: t("kpiItOn"), value: k.it_devices_on, cls: "" },
    { label: t("kpiGldsActive"), value: k.glds_active, cls: "" },
    { label: t("kpiSfActive"), value: k.sf_active, cls: "" },
    { label: t("kpiFullyMatched"), value: k.fully_matched, cls: "ok" },
    { label: t("kpiIssuesFound"), value: k.issues_found, cls: "attn" },
  ];
  $("#kpiGrid").innerHTML = cards.map(c => `
    <div class="kpi-card ${c.cls}">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value">${c.value}</div>
    </div>
  `).join("");
}

const CATEGORY_SEVERITY = {
  "Duplicate records": "DUPLICATE",
  "Account Number mismatch": "CRITICAL",
  "Account associated with different unit": "CRITICAL",
  "Active but device OFF": "CRITICAL",
  "Device ON but GLDS inactive": "CRITICAL",
  "Device ON but Salesforce inactive": "CRITICAL",
  "Missing in GLDS": "CRITICAL",
  "Missing in Salesforce": "CRITICAL",
  "Device ON but GLDS pending": "WARNING",
  "Device ON but Salesforce pending": "WARNING",
  "Speed/package mismatch": "WARNING",
};
function issueSeverity(cat) {
  if (CATEGORY_SEVERITY[cat]) return CATEGORY_SEVERITY[cat];
  if (cat.startsWith("Only in")) return "NOT FOUND";
  return "WARNING";
}

function renderIssueGrid() {
  const cats = STATE.summary.issue_categories;
  const keys = Object.keys(cats);
  if (keys.length === 0) {
    $("#issueGrid").innerHTML = `<div class="empty-note">${STATE.lang === "es" ? "No se encontraron inconsistencias." : "No inconsistencies found."}</div>`;
    return;
  }
  $("#issueGrid").innerHTML = keys.map(cat => `
    <div class="issue-card ${STATE.selectedCategories.has(cat) ? "selected" : ""}" data-cat="${cat}" data-sev="${issueSeverity(cat)}">
      <span class="name"><span class="check">✓</span>${tCat(cat)}</span>
      <span class="count">${cats[cat]}</span>
      ${tCatDesc(cat) ? `<div class="issue-tooltip">${tCatDesc(cat)}</div>` : ""}
    </div>
  `).join("");
  $$(".issue-card").forEach(el => el.addEventListener("click", () => {
    const cat = el.dataset.cat;
    if (STATE.selectedCategories.has(cat)) STATE.selectedCategories.delete(cat);
    else STATE.selectedCategories.add(cat);
    renderIssueGrid();
    renderCategoryTable();
    applyFilters();
  }));
}

function renderCategoryTable() {
  const wrap = $("#categoryTableWrap");
  const hint = $("#categoryTableHint");
  if (STATE.selectedCategories.size === 0) {
    wrap.classList.remove("show");
    hint.style.display = "block";
    return;
  }
  hint.style.display = "none";
  wrap.classList.add("show");

  const cats = Array.from(STATE.selectedCategories);
  $("#categorySelectionLabel").innerHTML =
    `${t("categorySelectedPrefix")} ` + cats.map(c => `<span class="tag">${tCat(c)}</span>`).join(" ");

  const matching = STATE.records.filter(r => cats.some(c => r.issue_categories.includes(c)));

  const cols = [
    ["colUnit", r => `<strong>${r.unit}</strong>`],
    ["colItDevice", r => deviceBadge(r.it_exists)],
    ["colItSpeed", r => r.it_speed || "—"],
    ["colPkgSpeed", r => r.pkg_speed || "—"],
    ["colSpeedMatch", r => matchBadge(r.speed_match)],
    ["colGldsStatus", r => statusBadge(r.glds_status_class, r.glds_status_raw)],
    ["colSfStatus", r => statusBadge(r.sf_status_class, r.sf_status_raw)],
    ["colOverallStatus", r => overallBadge(r.overall_status)],
    ["colIssue", r => r.issue_categories.map(tCat).join(", ")],
  ];

  $("#categoryTable").querySelector("thead").innerHTML =
    `<tr>${cols.map(([k]) => `<th>${t(k)}</th>`).join("")}</tr>`;
  $("#categoryTable").querySelector("tbody").innerHTML = matching.map(r => `
    <tr data-unit="${r.unit}">${cols.map(([, fn]) => `<td>${fn(r)}</td>`).join("")}</tr>
  `).join("") || `<tr><td colspan="${cols.length}" style="text-align:center;color:var(--text-muted);padding:16px;">${t("noResults")}</td></tr>`;

  $$("#categoryTable tbody tr[data-unit]").forEach(tr => {
    tr.addEventListener("click", () => openDetail(tr.dataset.unit));
  });
}

function renderMatrix() {
  const rows = STATE.summary.presence_matrix;
  const total = rows.reduce((s, r) => s + r.count, 0);
  const headLabels = [t("colItDevice"), t("colGldsStatus"), t("colSfStatus"),
    STATE.lang === "es" ? "Registros" : "Records", "%"];
  let html = `<thead><tr>${headLabels.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>`;
  rows.forEach(r => {
    html += `<tr>
      <td>${deviceBadge(r.it === "ON")}</td>
      <td>${badge(r.glds === "Missing" ? "MISSING" : r.glds, tStatus(r.glds))}</td>
      <td>${badge(r.salesforce === "Missing" ? "MISSING" : r.salesforce, tStatus(r.salesforce))}</td>
      <td class="num">${r.count}</td>
      <td class="num">${((r.count / total) * 100).toFixed(1)}%</td>
    </tr>`;
  });
  html += "</tbody>";
  $("#matrixTable").innerHTML = html;
}

function fillSelect(el, values, current, allLabel) {
  el.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = ""; optAll.textContent = allLabel;
  el.appendChild(optAll);
  values.forEach(({ value, label }) => {
    const o = document.createElement("option");
    o.value = value; o.textContent = label;
    el.appendChild(o);
  });
  el.value = current || "";
}

function populateFilterOptions() {
  const cur = currentFilters();

  const statusValues = Array.from(new Set(STATE.records.map(r => r.overall_status)))
    .sort().map(v => ({ value: v, label: tOverall(v) }));
  fillSelect($("#fStatus"), statusValues, cur.status, t("fOverallAll"));

  const issueValues = Array.from(new Set(STATE.records.flatMap(r => r.issue_categories)))
    .sort().map(v => ({ value: v, label: tCat(v) }));
  fillSelect($("#fIssue"), issueValues, cur.issue, t("fIssueAll"));

  fillSelect($("#fItDevice"), [{ value: "ON", label: t("fItOn") }, { value: "OFF", label: t("fItOff") }],
    cur.itDevice, t("fItDeviceAll"));

  const gldsValues = Array.from(new Set(STATE.records.map(r => r.glds_status_class).filter(Boolean)))
    .sort().map(v => ({ value: v, label: tStatus(v) }));
  fillSelect($("#fGldsStatus"), gldsValues, cur.gldsStatus, t("fGldsAll"));

  const sfValues = Array.from(new Set(STATE.records.map(r => r.sf_status_class).filter(Boolean)))
    .sort().map(v => ({ value: v, label: tStatus(v) }));
  fillSelect($("#fSfStatus"), sfValues, cur.sfStatus, t("fSfAll"));

  fillSelect($("#fAccountMatch"), [
    { value: "MATCH", label: t("fMatch") },
    { value: "MISMATCH", label: t("fMismatch") },
    { value: "N/A", label: t("fNA") },
  ], cur.accountMatch, t("fAccountAll"));

  fillSelect($("#fSpeedMatch"), [
    { value: "MATCH", label: t("fMatch") },
    { value: "MISMATCH", label: t("fMismatch") },
    { value: "N/A", label: t("fNA") },
  ], cur.speedMatch, t("fSpeedAll"));
}

function currentFilters() {
  return {
    q: ($("#searchBox").value || "").trim().toLowerCase(),
    status: $("#fStatus") ? $("#fStatus").value : "",
    issue: $("#fIssue") ? $("#fIssue").value : "",
    itDevice: $("#fItDevice") ? $("#fItDevice").value : "",
    gldsStatus: $("#fGldsStatus") ? $("#fGldsStatus").value : "",
    sfStatus: $("#fSfStatus") ? $("#fSfStatus").value : "",
    accountMatch: $("#fAccountMatch") ? $("#fAccountMatch").value : "",
    speedMatch: $("#fSpeedMatch") ? $("#fSpeedMatch").value : "",
  };
}

function recordMatches(r, f) {
  if (f.status && r.overall_status !== f.status) return false;
  if (f.issue && !r.issue_categories.includes(f.issue)) return false;
  if (STATE.selectedCategories.size > 0 && !Array.from(STATE.selectedCategories).some(c => r.issue_categories.includes(c))) return false;
  if (f.itDevice && (r.it_exists ? "ON" : "OFF") !== f.itDevice) return false;
  if (f.gldsStatus && r.glds_status_class !== f.gldsStatus) return false;
  if (f.sfStatus && r.sf_status_class !== f.sfStatus) return false;
  if (f.accountMatch && r.account_match !== f.accountMatch) return false;
  if (f.speedMatch && r.speed_match !== f.speedMatch) return false;
  if (f.q) {
    const hay = [r.unit, r.glds_account_norm, r.sf_account_norm, r.glds_account_full, r.sf_account_raw]
      .filter(Boolean).join(" ").toLowerCase();
    if (!hay.includes(f.q)) return false;
  }
  return true;
}

function renderTableHead() {
  const cols = ["colUnit", "colItDevice", "colItSpeed", "colPkgSpeed", "colSpeedMatch", "colGldsAccount", "colGldsStatus",
    "colSfAccount", "colSfStatus", "colUnitMatch", "colAccountMatch", "colOverallStatus", "colIssue"];
  $("#mainTableHeadRow").innerHTML = cols.map(k => `<th>${t(k)}</th>`).join("");
}

function renderTable(records) {
  $("#resultCount").textContent = `${records.length} ${tFmt("resultCount", { total: STATE.records.length })}`;
  const tbody = $("#mainTableBody");
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" style="text-align:center;color:var(--text-muted);padding:24px;">${t("noResults")}</td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr data-unit="${r.unit}">
      <td><strong>${r.unit}</strong></td>
      <td>${deviceBadge(r.it_exists)}</td>
      <td>${r.it_speed || "—"}</td>
      <td>${r.pkg_speed || "—"}</td>
      <td>${matchBadge(r.speed_match)}</td>
      <td>${r.glds_account_full || "—"}</td>
      <td>${statusBadge(r.glds_status_class, r.glds_status_raw)}</td>
      <td>${r.sf_account_raw ?? "—"}</td>
      <td>${statusBadge(r.sf_status_class, r.sf_status_raw)}</td>
      <td>${matchBadge(r.unit_match_glds_sf)}</td>
      <td>${matchBadge(r.account_match)}</td>
      <td>${overallBadge(r.overall_status)}</td>
      <td>${r.issue_categories.map(tCat).join(", ") || "—"}</td>
    </tr>
  `).join("");

  $$("#mainTableBody tr[data-unit]").forEach(tr => {
    tr.addEventListener("click", () => openDetail(tr.dataset.unit));
  });
}

function applyFilters() {
  const f = currentFilters();
  const filtered = STATE.records.filter(r => recordMatches(r, f));
  renderTable(filtered);
}

function renderUnassigned() {
  const it = STATE.unassigned.it || [];
  const glds = STATE.unassigned.glds || [];
  $("#unassignedGrid").innerHTML = `
    <div class="unassigned-card">
      <h3>${t("unassignedItTitle")}</h3>
      <div class="value">${it.length}</div>
      <p>${t("unassignedItDesc")}</p>
    </div>
    <div class="unassigned-card">
      <h3>${t("unassignedGldsTitle")}</h3>
      <div class="value">${glds.length}</div>
      <p>${tFmt("unassignedGldsDesc", { bridged: STATE.summary.counts.glds_sf_bridged_via_account })}</p>
    </div>
  `;
}

function fieldRow(k, v) {
  return `<div class="kv-row"><span class="k">${k}</span><span class="v">${v ?? "—"}</span></div>`;
}

function openDetail(unit) {
  const r = STATE.records.find(x => x.unit === unit);
  if (!r) return;

  const itSection = r.it_detail.length
    ? r.it_detail.map((d, i) => `
        ${r.it_detail.length > 1 ? `<div class="dup-row"><strong>${t("row")} ${i + 1}${r.duplicate ? ` (${t("duplicate")})` : ""}</strong></div>` : ""}
        ${fieldRow(tField("kIt", "unit_raw"), d.unit_raw)}
        ${fieldRow(tField("kIt", "speed_raw"), d.speed_raw)}
        ${fieldRow(tField("kIt", "mac_onu"), d.mac_onu)}
        ${fieldRow(tField("kIt", "serial"), d.serial)}
        ${fieldRow(tField("kIt", "olt"), d.olt)}
        ${fieldRow(tField("kIt", "provider"), d.provider)}
        ${fieldRow(tField("kIt", "owner"), d.owner)}
      `).join("")
    : `<p class="empty-note">${t("noItRecord")}</p>`;

  const pkgLine = r.pkg_exists ? fieldRow(t("pkgName"), `${r.pkg_name} (${r.pkg_speed})`) : "";
  const gldsSection = pkgLine + (r.glds_detail.length
    ? r.glds_detail.map((d, i) => `
        ${r.glds_detail.length > 1 ? `<div class="dup-row"><strong>${t("row")} ${i + 1}${r.duplicate ? ` (${t("duplicate")})` : ""}${d.bridged_via_account ? ` — ${t("bridgedNote")}` : ""}</strong></div>` : ""}
        ${fieldRow(tField("kGlds", "account"), d.account)}
        ${fieldRow(tField("kGlds", "account_norm"), d.account_norm)}
        ${fieldRow(tField("kGlds", "status_raw"), d.status_raw)}
        ${fieldRow(tField("kGlds", "status_class"), tStatus(d.status_class))}
        ${fieldRow(tField("kGlds", "name"), d.name)}
        ${fieldRow(tField("kGlds", "address"), d.address)}
      `).join("")
    : (r.pkg_exists ? "" : `<p class="empty-note">${t("noGldsRecord")}</p>`));

  const sfSection = r.sf_detail.length
    ? r.sf_detail.map((d, i) => `
        ${r.sf_detail.length > 1 ? `<div class="dup-row"><strong>${t("row")} ${i + 1}${r.duplicate ? ` (${t("duplicate")})` : ""}</strong></div>` : ""}
        ${fieldRow(tField("kSf", "unit_code"), d.unit_code)}
        ${fieldRow(tField("kSf", "account"), d.account)}
        ${fieldRow(tField("kSf", "account_norm"), d.account_norm)}
        ${fieldRow(tField("kSf", "status_raw"), d.status_raw)}
        ${fieldRow(tField("kSf", "building_code"), d.building_code)}
      `).join("")
    : `<p class="empty-note">${t("noSfRecord")}</p>`;

  const deviceOffIsIssue = !r.it_exists && r.issues.some(i => i.category === "Active but device OFF");
  const speedLine = r.pkg_exists
    ? `${tMatch(r.speed_match)} (${t("colItSpeed")}: ${r.it_speed || "—"} · ${t("pkgName")}: ${r.pkg_speed || "—"})`
    : t("speedNoPkg");
  const reconLines = [
    [t("reconUnitMatch"), tMatch(r.unit_match_glds_sf)],
    [t("reconAccountMatch"), tMatch(r.account_match)],
    [t("reconDeviceStatus"), r.it_exists ? tDevice(true) : (deviceOffIsIssue ? t("deviceIssueElsewhere") : tDevice(false))],
    [t("reconSpeed"), speedLine],
  ].map(([k, v]) => `<div class="recon-line"><span>${k}</span><span>${v}</span></div>`).join("");

  const issuesHtml = r.issues.length
    ? r.issues.map(i => `<div class="issue-line ${i.severity === "DUPLICATE" ? "dup" : (i.severity === "NOT FOUND" ? "notfound" : "")}">${i.description}</div>`).join("")
    : `<div class="issue-line" style="background:var(--green-bg);color:var(--green);">${t("noIssues")}</div>`;

  $("#detailPanelTitle").textContent = `${t("colUnit")} ${r.unit}`;
  $("#detailBody").innerHTML = `
    <div class="detail-section">
      <h3>${t("detailOverallStatus")}</h3>
      ${overallBadge(r.overall_status)}
    </div>
    <div class="detail-section"><h3>${t("detailIT")}</h3>${itSection}</div>
    <div class="detail-section"><h3>${t("detailGLDS")}</h3>${gldsSection}</div>
    <div class="detail-section"><h3>${t("detailSF")}</h3>${sfSection}</div>
    <div class="detail-section"><h3>${t("detailReconResult")}</h3>${reconLines}</div>
    <div class="detail-section"><h3>${t("detailIssueExplanation")}</h3>${issuesHtml}</div>
  `;

  $("#overlay").classList.add("show");
  $("#detailPanel").classList.add("show");
}

function closeDetail() {
  $("#overlay").classList.remove("show");
  $("#detailPanel").classList.remove("show");
}

/* ---------------------------------------------------------------------
   Wiring
--------------------------------------------------------------------- */
function wireEvents() {
  $("#overlay").addEventListener("click", closeDetail);
  $("#detailClose").addEventListener("click", closeDetail);

  ["input", "change"].forEach(evt => {
    $("#searchBox").addEventListener(evt, applyFilters);
    $("#fStatus").addEventListener(evt, applyFilters);
    $("#fIssue").addEventListener(evt, applyFilters);
    $("#fItDevice").addEventListener(evt, applyFilters);
    $("#fGldsStatus").addEventListener(evt, applyFilters);
    $("#fSfStatus").addEventListener(evt, applyFilters);
    $("#fAccountMatch").addEventListener(evt, applyFilters);
    $("#fSpeedMatch").addEventListener(evt, applyFilters);
  });

  $("#clearFiltersBtn").addEventListener("click", () => {
    $("#searchBox").value = "";
    ["#fStatus", "#fIssue", "#fItDevice", "#fGldsStatus", "#fSfStatus", "#fAccountMatch", "#fSpeedMatch"]
      .forEach(sel => { $(sel).value = ""; });
    applyFilters();
  });

  $("#clearCategorySelectionBtn").addEventListener("click", () => {
    STATE.selectedCategories.clear();
    renderIssueGrid();
    renderCategoryTable();
    applyFilters();
  });

  $("#exportAllBtn").addEventListener("click", () => window.location = "/api/export/all");
  $("#exportIssuesBtn").addEventListener("click", () => window.location = "/api/export/issues");

  $("#refreshBtn").addEventListener("click", async () => {
    $("#refreshBtn").textContent = STATE.lang === "es" ? "Actualizando…" : "Refreshing…";
    await fetch("/api/refresh", { method: "POST" });
    await boot();
  });

  $("#langEnBtn").addEventListener("click", () => setLang("en"));
  $("#langEsBtn").addEventListener("click", () => setLang("es"));
}

function setLang(lang) {
  STATE.lang = lang;
  localStorage.setItem("minorca_lang", lang);
  renderAll();
}

function renderAll() {
  applyStaticTranslations();
  renderHeader();
  renderDQBanner();
  renderKpis();
  renderIssueGrid();
  renderCategoryTable();
  renderMatrix();
  renderTableHead();
  populateFilterOptions();
  renderUnassigned();
  applyFilters();
}

async function boot() {
  await fetchData();
  renderAll();
}

wireEvents();
boot();
