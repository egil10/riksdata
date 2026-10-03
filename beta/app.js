// Riksdata 2.0 beta: shows the series exported by `riksdata export` and the source status board.
// Every string that comes from data is inserted with textContent, never as HTML.

const TOPICS = [
  ["prices", "Priser"],
  ["economy", "Økonomi"],
  ["labour", "Arbeid"],
  ["housing", "Bolig"],
  ["wealth", "Formue"],
  ["tax", "Skatt"],
  ["public_finance", "Offentlige finanser"],
  ["population", "Befolkning"],
  ["health", "Helse"],
  ["food", "Mat"],
  ["democracy", "Demokrati"],
  ["crime", "Kriminalitet"],
  ["defence", "Forsvar"],
  ["energy", "Energi"],
  ["climate", "Klima"],
  ["technology", "Teknologi"],
];

const ENTITY_NAMES = {
  NOR: "Norge", SWE: "Sverige", DNK: "Danmark", FIN: "Finland", ISL: "Island",
  DEU: "Tyskland", GBR: "Storbritannia", USA: "USA", WORLD: "Verden",
};

const STATUSES = [
  ["ok", "Svarer med data"],
  ["reachable", "Kan nås"],
  ["needs_key", "Trenger nøkkel"],
  ["blocked", "Blokkert"],
  ["unreachable", "Ingen kontakt"],
  ["failed", "Feil svar"],
  ["skipped", "Ikke spurt"],
];

// 16 x 16 line icons, one per status, so that a status is never shown by colour alone.
const STATUS_ICONS = {
  ok: "M3 8.5l3.2 3.2L13 5",
  reachable: "M8 2.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11z",
  needs_key: "M7.5 8a2.5 2.5 0 1 0-5 0a2.5 2.5 0 0 0 5 0zM7.5 8h6M11 8v2.5M13.5 8v2",
  blocked: "M8 2.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11zM4.2 4.2l7.6 7.6",
  unreachable: "M4 4l8 8M12 4l-8 8",
  failed: "M8 2.5l6 10.5H2zM8 6.5v3.2M8 11.6v.1",
  skipped: "M4 8h8",
};

const SVG_NS = "http://www.w3.org/2000/svg";
const YEAR_MS = 365.25 * 24 * 3600 * 1000;
const dateFormat = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("nb-NO", { month: "short", year: "numeric", timeZone: "UTC" });
const integer = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });

// --- small helpers ---------------------------------------------------------------------

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (name === "class") node.className = value;
    else if (name === "text") node.textContent = value;
    else node.setAttribute(name, value === true ? "" : value);
  }
  for (const child of children) {
    if (child !== null && child !== undefined) node.append(child);
  }
  return node;
}

function svg(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}

// `decimals` is the series' own precision (from the export). Without it, pick by size.
function formatValue(value, decimals) {
  if (value === null || value === undefined) return "–";
  if (Number.isInteger(decimals)) {
    return new Intl.NumberFormat("nb-NO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  }
  const size = Math.abs(value);
  const digits = size >= 1000 ? 0 : size >= 100 ? 1 : 2;
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: digits }).format(value);
}

function formatTick(value) {
  if (Math.abs(value) < 10000) return formatValue(value);
  return new Intl.NumberFormat("nb-NO", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function signed(value, digits) {
  const text = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Math.abs(value));
  if (Number(Math.abs(value).toFixed(digits)) === 0) return text;
  return (value > 0 ? "+" : "−") + text;
}

function isShare(unit) {
  return /prosent|per cent|%/i.test(unit || "");
}

function unitLabel(unit) {
  if (!unit) return "";
  return /^(prosent|per cent)$/i.test(unit) ? "%" : unit;
}

// Canonical periods: 2026, 2026-Q2, 2026-08, 2026-W14, 2026-08-31.
function periodDate(period) {
  const date = new Date(Date.UTC(2000, 0, 1));
  let match;
  if ((match = /^(\d{4})$/.exec(period))) {
    date.setUTCFullYear(Number(match[1]), 0, 1);
  } else if ((match = /^(\d{4})-Q(\d)$/.exec(period))) {
    date.setUTCFullYear(Number(match[1]), (Number(match[2]) - 1) * 3, 1);
  } else if ((match = /^(\d{4})-W(\d{2})$/.exec(period))) {
    // ISO week: the Monday of the week that contains 4 January, plus the week offset.
    date.setUTCFullYear(Number(match[1]), 0, 4);
    const weekday = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() - weekday + 1 + (Number(match[2]) - 1) * 7);
  } else if ((match = /^(\d{4})-(\d{2})$/.exec(period))) {
    date.setUTCFullYear(Number(match[1]), Number(match[2]) - 1, 1);
  } else if ((match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period))) {
    date.setUTCFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return date;
}

function periodLabel(period) {
  let match;
  if ((match = /^(\d{4})-Q(\d)$/.exec(period))) return `${match[2]}. kv. ${match[1]}`;
  if ((match = /^(\d{4})-W(\d{2})$/.exec(period))) return `uke ${Number(match[2])}, ${match[1]}`;
  if (/^\d{4}-\d{2}$/.test(period)) return monthFormat.format(periodDate(period));
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return dateFormat.format(periodDate(period));
  return String(Number(period));
}

function entityName(code) {
  return ENTITY_NAMES[code] || code;
}

function rowLabel(series) {
  const base = series.dataset_title_no;
  if (base && series.title_no.startsWith(base + ": ")) return series.title_no.slice(base.length + 2);
  return entityName(series.home_entity);
}

function topicLabel(topic) {
  const known = TOPICS.find(([key]) => key === topic);
  return known ? known[1] : topic;
}

// SSB's citation already starts with "Kilde:"; other sources give a bare reference.
function sourceName(series) {
  return (series.citation || series.source_id).replace(/^kilde:\s*/i, "");
}

function tagLabel(tag) {
  return tag === "ESTIMATE" ? "ESTIMAT" : tag;
}

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

// --- KPI row ---------------------------------------------------------------------------

function renderKpis(build, sources) {
  const row = document.getElementById("kpis");
  const tiles = [
    ["Serier", integer.format(build.series), `fra ${build.sources.length} kilder`],
    ["Observasjoner", integer.format(build.observations), "enkelttall i seriene"],
  ];
  if (sources) {
    tiles.push([
      "Kilder i katalogen",
      integer.format(sources.results.length),
      `${integer.format(sources.counts.ok)} svarer med data`,
    ]);
  }
  tiles.push(["Sist oppdatert", dateFormat.format(new Date(build.generated_at)), "tallene hentes på nytt fra kildene"]);
  for (const [label, value, note] of tiles) {
    row.append(
      el("div", { class: "kpi" },
        el("div", { class: "kpi-label", text: label }),
        el("div", { class: "kpi-value", text: value }),
        el("div", { class: "kpi-note", text: note })),
    );
  }
}

// --- the series catalogue --------------------------------------------------------------

function sparkline(values) {
  const width = 104, height = 26, pad = 3;
  const chart = svg("svg", { class: "spark", viewBox: `0 0 ${width} ${height}`, width, height, "aria-hidden": "true" });
  if (values.length < 2) return chart;
  const low = Math.min(...values), high = Math.max(...values);
  const x = (i) => pad + (i * (width - 2 * pad - 2)) / (values.length - 1);
  const y = (v) => (high === low ? height / 2 : height - pad - ((v - low) * (height - 2 * pad)) / (high - low));
  const path = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  chart.append(svg("path", { d: path }));
  chart.append(svg("circle", { cx: x(values.length - 1).toFixed(1), cy: y(values[values.length - 1]).toFixed(1), r: 2.6 }));
  return chart;
}

function changeText(series) {
  const before = series.year_before;
  if (!before || series.is_future) return "";
  const now = series.latest.value;
  if (isShare(series.unit)) return `${signed(now - before.value, 1)} pp`;
  if (before.value === 0) return "";
  return `${signed((now / before.value - 1) * 100, 1)} %`;
}

function seriesRow(series, shared) {
  const name = el("button", { class: "series-name", type: "button", text: rowLabel(series) });
  const nameCell = el("td", { class: "col-name" }, name);
  if (series.tag !== "DATA") nameCell.append(" ", el("span", { class: "tag", text: tagLabel(series.tag) }));
  // Period and unit are shown once in the card header when every row shares them.
  const own = [shared.period ? null : periodLabel(series.latest.period), shared.unit ? null : unitLabel(series.unit)]
    .filter(Boolean).join(" · ");
  if (own) nameCell.append(el("div", { class: "row-context", text: own }));
  const row = el("tr", {},
    nameCell,
    el("td", { class: "col-value", text: formatValue(series.latest.value, series.decimals) }),
    el("td", { class: "col-change", text: changeText(series), title: "Endring fra samme periode året før" }),
    el("td", { class: "col-spark" }, sparkline(series.spark.values)),
  );
  row.addEventListener("click", () => openDetail(series));
  return row;
}

function datasetCard(group) {
  const first = group[0];
  const source = el("p", { class: "card-source" },
    el("a", { href: first.source_url, text: `Kilde: ${sourceName(first)}`, rel: "noopener" }),
    ` · ${first.licence}`,
    first.source_updated ? ` · oppdatert ${dateFormat.format(new Date(first.source_updated))}` : "",
  );
  const head = el("thead", { class: "visually-hidden" },
    el("tr", {},
      el("th", { text: "Serie" }), el("th", { text: "Siste verdi" }),
      el("th", { text: "Endring fra året før" }), el("th", { text: "Siste 20 år" })));
  const same = (pick) => group.every((series) => pick(series) === pick(first));
  const shared = { period: same((series) => series.latest.period), unit: same((series) => series.unit) };
  const context = [shared.period ? `Siste tall: ${periodLabel(first.latest.period)}` : null,
    shared.unit && first.unit ? `Enhet: ${unitLabel(first.unit)}` : null].filter(Boolean).join(" · ");
  const body = el("tbody");
  const rows = group.map((series) => {
    const row = seriesRow(series, shared);
    body.append(row);
    return { series, row };
  });
  const card = el("article", { class: "card" },
    el("h4", { class: "card-title", text: first.dataset_title_no || first.title_no }),
    source,
    context ? el("p", { class: "card-context", text: context }) : null,
    el("table", { class: "series-table" },
      // Column widths come from here: with a fixed table layout the first row decides them.
      el("colgroup", {}, el("col"), el("col", { class: "w-value" }), el("col", { class: "w-change" }), el("col", { class: "w-spark" })),
      head, body));
  return { card, rows };
}

function renderCatalog(catalog) {
  const container = document.getElementById("datasets");
  const byTopic = new Map();
  for (const series of catalog.series) {
    if (!byTopic.has(series.topic)) byTopic.set(series.topic, new Map());
    const datasets = byTopic.get(series.topic);
    const key = `${series.source_id}/${series.dataset_id}`;
    if (!datasets.has(key)) datasets.set(key, []);
    datasets.get(key).push(series);
  }
  const order = [...TOPICS.map(([key]) => key).filter((key) => byTopic.has(key)),
    ...[...byTopic.keys()].filter((key) => !TOPICS.some(([known]) => known === key))];

  const sections = [];
  for (const topic of order) {
    const heading = el("h3", { text: topicLabel(topic) });
    const cards = el("div", { class: "cards" });
    const entries = [...byTopic.get(topic).values()].map(datasetCard);
    for (const entry of entries) cards.append(entry.card);
    container.append(heading, cards);
    sections.push({ topic, heading, cards, entries });
  }

  const datasetCount = sections.reduce((sum, section) => sum + section.entries.length, 0);
  document.getElementById("tallene-note").textContent =
    `${integer.format(catalog.series.length)} serier fra ${datasetCount} datasett. Trykk på en serie for å se hele historien, kilden og lisensen.`;

  let activeTopic = null;
  const search = document.getElementById("series-search");
  const chips = document.getElementById("topic-chips");
  const chipFor = (topic, label) => {
    const count = topic ? [...byTopic.get(topic).values()].reduce((n, g) => n + g.length, 0) : catalog.series.length;
    const chip = el("button", { class: "chip", type: "button", "aria-pressed": String(topic === activeTopic) },
      label, el("span", { class: "count", text: integer.format(count) }));
    chip.addEventListener("click", () => {
      activeTopic = topic;
      for (const other of chips.children) other.setAttribute("aria-pressed", String(other === chip));
      apply();
    });
    return chip;
  };
  chips.append(chipFor(null, "Alle"));
  for (const topic of order) chips.append(chipFor(topic, topicLabel(topic)));

  function apply() {
    const needle = search.value.trim().toLowerCase();
    let visible = 0;
    for (const section of sections) {
      let sectionVisible = 0;
      for (const entry of section.entries) {
        let cardVisible = 0;
        for (const { series, row } of entry.rows) {
          const haystack = `${series.title_no} ${series.title_en || ""} ${series.series_id}`.toLowerCase();
          const show = (!activeTopic || activeTopic === section.topic) && (!needle || haystack.includes(needle));
          row.hidden = !show;
          if (show) cardVisible += 1;
        }
        entry.card.hidden = cardVisible === 0;
        sectionVisible += cardVisible;
      }
      section.heading.hidden = section.cards.hidden = sectionVisible === 0;
      visible += sectionVisible;
    }
    document.getElementById("datasets-empty").hidden = visible > 0;
  }
  search.addEventListener("input", apply);
}

// --- the detail dialog and its chart ---------------------------------------------------

const seriesCache = new Map();
let detailState = null;

function niceStep(span, target) {
  const raw = span / target;
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit = raw / power;
  return (unit >= 5 ? 10 : unit >= 2 ? 5 : unit >= 1 ? 2 : 1) * power;
}

function yTicks(low, high) {
  if (low === high) { low -= 1; high += 1; }
  const step = niceStep(high - low, 5);
  const start = Math.floor(low / step) * step;
  const ticks = [];
  for (let value = start; value <= high + step * 0.5; value += step) ticks.push(Number(value.toPrecision(12)));
  return ticks;
}

function xTicks(from, to) {
  const years = (to - from) / YEAR_MS;
  const ticks = [];
  if (years >= 3) {
    const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500].find((size) => years / size <= 8) || 1000;
    const first = Math.ceil(new Date(from).getUTCFullYear() / step) * step;
    for (let year = first; ; year += step) {
      const date = new Date(Date.UTC(2000, 0, 1));
      date.setUTCFullYear(year, 0, 1);
      if (date.getTime() > to) break;
      if (date.getTime() >= from) ticks.push({ time: date.getTime(), label: String(year) });
    }
  } else {
    const months = Math.max(1, Math.round(years * 12));
    const step = [1, 2, 3, 6].find((size) => months / size <= 7) || 12;
    const start = new Date(from);
    const date = new Date(Date.UTC(start.getUTCFullYear(), Math.ceil(start.getUTCMonth() / step) * step, 1));
    while (date.getTime() <= to) {
      if (date.getTime() >= from) ticks.push({ time: date.getTime(), label: monthFormat.format(date) });
      date.setUTCMonth(date.getUTCMonth() + step);
    }
  }
  return ticks;
}

function drawChart() {
  const { series, lines, years } = detailState;
  const area = document.getElementById("detail-chart");
  area.replaceChildren();

  const home = lines.find((line) => line.entity === series.home_entity) || lines[0];
  const lastTime = Math.max(...lines.map((line) => line.points[line.points.length - 1].time));
  const from = years ? lastTime - years * YEAR_MS : -Infinity;
  const visible = lines
    .map((line) => ({ ...line, points: line.points.filter((point) => point.time >= from) }))
    .filter((line) => line.points.some((point) => point.value !== null));
  const homeLine = visible.find((line) => line.entity === home.entity) || visible[0];
  const values = visible.flatMap((line) => line.points.map((point) => point.value).filter((value) => value !== null));
  const times = visible.flatMap((line) => line.points.map((point) => point.time));
  let low = Math.min(...values), high = Math.max(...values);
  if (low >= 0 && low < high * 0.5) low = 0; // start at zero unless that would flatten the line
  const ticks = yTicks(low, high);
  low = Math.min(low, ticks[0]);
  high = Math.max(high, ticks[ticks.length - 1]);
  const t0 = Math.min(...times), t1 = Math.max(...times);

  const width = Math.max(320, area.clientWidth);
  const height = width < 520 ? 260 : 340;
  const margin = { top: 16, right: visible.length > 1 ? 58 : 66, bottom: 28, left: 54 };
  const x = (time) => margin.left + (t1 === t0 ? 0 : ((time - t0) / (t1 - t0)) * (width - margin.left - margin.right));
  const y = (value) => height - margin.bottom - ((value - low) / (high - low)) * (height - margin.top - margin.bottom);

  const chart = svg("svg", { viewBox: `0 0 ${width} ${height}`, width, height });
  const grid = svg("g", { class: "grid" });
  for (const tick of ticks) {
    grid.append(svg("line", { x1: margin.left, x2: width - margin.right, y1: y(tick), y2: y(tick) }));
    const label = svg("text", { x: margin.left - 8, y: y(tick) + 4, "text-anchor": "end" });
    label.textContent = formatTick(tick);
    grid.append(label);
  }
  chart.append(grid);
  const axis = svg("g", { class: "axis" });
  axis.append(svg("line", { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom }));
  for (const tick of xTicks(t0, t1)) {
    const label = svg("text", { x: x(tick.time), y: height - margin.bottom + 18, "text-anchor": "middle" });
    label.textContent = tick.label;
    axis.append(label);
  }
  chart.append(axis);

  const pathFor = (points) => {
    let path = "", pen = false;
    for (const point of points) {
      if (point.value === null) { pen = false; continue; }
      path += `${pen ? "L" : "M"}${x(point.time).toFixed(1)} ${y(point.value).toFixed(1)}`;
      pen = true;
    }
    return path;
  };
  for (const line of visible) {
    if (line !== homeLine) chart.append(svg("path", { class: "line context", d: pathFor(line.points) }));
  }
  chart.append(svg("path", { class: "line home", d: pathFor(homeLine.points) }));

  const lastPoint = [...homeLine.points].reverse().find((point) => point.value !== null);
  chart.append(svg("circle", { class: "end-dot", cx: x(lastPoint.time), cy: y(lastPoint.value), r: 4 }));
  const endLabel = svg("text", { class: "end-label", x: x(lastPoint.time) + 9, y: y(lastPoint.value) + 4 });
  endLabel.textContent = visible.length > 1 ? entityName(homeLine.entity) : formatValue(lastPoint.value, series.decimals);
  chart.append(endLabel);

  const crosshair = svg("line", { class: "crosshair", y1: margin.top, y2: height - margin.bottom, visibility: "hidden" });
  const dots = svg("g", {});
  chart.append(crosshair, dots);
  area.append(chart);

  const tooltip = el("div", { class: "tooltip", hidden: true });
  area.append(tooltip);

  // The crosshair snaps to the home line's periods; the tooltip lists every line there.
  const stops = homeLine.points.filter((point) => point.value !== null);
  let index = stops.length - 1;
  function show(position) {
    index = Math.max(0, Math.min(stops.length - 1, position));
    const stop = stops[index];
    crosshair.setAttribute("x1", x(stop.time));
    crosshair.setAttribute("x2", x(stop.time));
    crosshair.setAttribute("visibility", "visible");
    dots.replaceChildren();
    const rows = [];
    for (const line of visible) {
      const point = line.byPeriod.get(stop.period);
      if (!point || point.value === null) continue;
      dots.append(svg("circle", {
        class: line === homeLine ? "hover-dot" : "hover-dot context",
        cx: x(point.time), cy: y(point.value), r: line === homeLine ? 4 : 3,
      }));
      rows.push({ line, value: point.value });
    }
    rows.sort((a, b) => b.value - a.value);
    tooltip.replaceChildren(el("div", { class: "tt-period", text: periodLabel(stop.period) }));
    for (const { line, value } of rows) {
      tooltip.append(el("div", { class: line === homeLine ? "tt-row home" : "tt-row" },
        el("span", { class: "tt-key" }),
        el("span", { class: "tt-value", text: `${formatValue(value, series.decimals)} ${unitLabel(series.unit)}`.trim() }),
        visible.length > 1 ? el("span", { class: "tt-name", text: entityName(line.entity) }) : null));
    }
    tooltip.hidden = false;
    const scale = area.clientWidth / width;
    const left = x(stop.time) * scale;
    const flip = left + 16 + tooltip.offsetWidth > area.clientWidth;
    tooltip.style.left = `${flip ? left - 12 - tooltip.offsetWidth : left + 12}px`;
  }
  function hide() {
    crosshair.setAttribute("visibility", "hidden");
    dots.replaceChildren();
    tooltip.hidden = true;
  }
  area.onpointermove = (event) => {
    const box = chart.getBoundingClientRect();
    const time = t0 + ((event.clientX - box.left) / box.width * width - margin.left) / (width - margin.left - margin.right) * (t1 - t0);
    let nearest = 0;
    for (let i = 1; i < stops.length; i += 1) {
      if (Math.abs(stops[i].time - time) < Math.abs(stops[nearest].time - time)) nearest = i;
    }
    show(nearest);
  };
  area.onpointerleave = hide;
  area.onfocus = () => show(stops.length - 1);
  area.onblur = hide;
  area.onkeydown = (event) => {
    const moves = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: stops.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      show(moves[event.key]);
    }
  };
}

function renderRanges() {
  const row = document.getElementById("detail-ranges");
  row.replaceChildren();
  const span = detailState.spanYears;
  const options = [[null, "Hele perioden"], [50, "50 år"], [20, "20 år"], [5, "5 år"]]
    .filter(([years]) => years === null || span > years * 1.2);
  if (options.length < 2) return;
  for (const [years, label] of options) {
    const chip = el("button", { class: "chip", type: "button", text: label, "aria-pressed": String(years === detailState.years) });
    chip.addEventListener("click", () => {
      detailState.years = years;
      for (const other of row.children) other.setAttribute("aria-pressed", String(other === chip));
      drawChart();
    });
    row.append(chip);
  }
}

function renderTable(lines, decimals) {
  const periods = new Map();
  for (const line of lines) for (const point of line.points) periods.set(point.period, point.time);
  const ordered = [...periods.entries()].sort((a, b) => b[1] - a[1]).map(([period]) => period);
  const head = el("tr", {}, el("th", { text: "Periode", scope: "col" }));
  for (const line of lines) head.append(el("th", { text: entityName(line.entity), scope: "col" }));
  const body = el("tbody");
  for (const period of ordered) {
    const row = el("tr", {}, el("td", { text: periodLabel(period) }));
    for (const line of lines) {
      const point = line.byPeriod.get(period);
      row.append(el("td", { text: point && point.value !== null ? formatValue(point.value, decimals) : "" }));
    }
    body.append(row);
  }
  document.getElementById("detail-table").replaceChildren(el("table", { class: "data-table" }, el("thead", {}, head), body));
}

function renderMeta(series) {
  const meta = document.getElementById("detail-meta");
  meta.replaceChildren();
  const frequency = { A: "Årlig", Q: "Kvartalsvis", M: "Månedlig", W: "Ukentlig", D: "Daglig" }[series.frequency] || series.frequency;
  const items = [
    ["Kilde", el("a", { href: series.source_url, text: sourceName(series), rel: "noopener" })],
    // A terms note records the conditions for data whose upstream licence is not an open one.
    ["Lisens", series.terms_note ? el("span", {}, series.licence, el("span", { class: "terms", text: series.terms_note })) : series.licence],
    ["Type", series.tag === "ESTIMATE" ? "ESTIMAT: framskrivning eller beregning fra kilden, ikke observerte tall" : "DATA: observert statistikk fra kilden"],
    ["Enhet", series.unit],
    ["Frekvens", frequency],
    ["Periode", `${periodLabel(series.first_period)} til ${periodLabel(series.last_period)}`],
    ["Kilden oppdatert", series.source_updated ? dateFormat.format(new Date(series.source_updated)) : "ukjent"],
    ["Hentet", dateFormat.format(new Date(series.retrieved_at))],
    ["Serie-ID", series.series_id],
  ];
  for (const [term, value] of items) meta.append(el("dt", { text: term }), el("dd", {}, value));
}

function downloadCsv() {
  const { series, lines } = detailState;
  const periods = new Map();
  for (const line of lines) for (const point of line.points) periods.set(point.period, point.time);
  const ordered = [...periods.entries()].sort((a, b) => a[1] - b[1]).map(([period]) => period);
  const rows = [["period", ...lines.map((line) => line.entity)].join(",")];
  for (const period of ordered) {
    rows.push([period, ...lines.map((line) => {
      const point = line.byPeriod.get(period);
      return point && point.value !== null ? point.value : "";
    })].join(","));
  }
  // The last row carries the source, licence and terms, padded so every row has the same columns.
  const credit = `# Kilde: ${sourceName(series)}. Lisens: ${series.licence}.${series.terms_note ? ` ${series.terms_note}` : ""}`;
  rows.push([`"${credit.replaceAll('"', '""')}"`, ...lines.map(() => "")].join(","));
  const link = el("a", { href: URL.createObjectURL(new Blob([rows.join("\n") + "\n"], { type: "text/csv" })), download: `${series.series_id}.csv` });
  link.click();
  URL.revokeObjectURL(link.href);
}

async function openDetail(series) {
  const dialog = document.getElementById("detail");
  const path = `data/series/${series.series_id}.json`;
  history.replaceState(null, "", `#serie=${encodeURIComponent(series.series_id)}`);
  document.getElementById("detail-title").textContent = series.title_no;
  const sub = document.getElementById("detail-sub");
  sub.replaceChildren(el("span", { class: "tag", text: tagLabel(series.tag) }), ` ${series.title_en || ""} · ${unitLabel(series.unit)}`);
  document.getElementById("detail-json").href = path;
  document.getElementById("detail-chart").replaceChildren();
  if (!dialog.open) dialog.showModal();

  if (!seriesCache.has(series.series_id)) seriesCache.set(series.series_id, await getJson(path));
  const data = seriesCache.get(series.series_id);
  const lines = Object.entries(data.entities).map(([entity, columns]) => {
    const points = columns.period.map((period, i) => ({ period, time: periodDate(period).getTime(), value: columns.value[i] }));
    return { entity, points, byPeriod: new Map(points.map((point) => [point.period, point])) };
  });
  // Norway first, then the others by name.
  lines.sort((a, b) => (b.entity === series.home_entity) - (a.entity === series.home_entity) || entityName(a.entity).localeCompare(entityName(b.entity), "nb"));
  const times = lines.flatMap((line) => line.points.map((point) => point.time));
  detailState = { series, lines, years: null, spanYears: (Math.max(...times) - Math.min(...times)) / YEAR_MS };

  const legend = document.getElementById("detail-legend");
  legend.replaceChildren();
  if (lines.length > 1) {
    legend.append(
      el("span", { class: "legend-item home" }, el("span", { class: "legend-key" }), entityName(series.home_entity)),
      el("span", { class: "legend-item" }, el("span", { class: "legend-key" }),
        lines.filter((line) => line.entity !== series.home_entity).map((line) => entityName(line.entity)).join(", ")));
  }
  document.getElementById("detail-caption").textContent =
    `Kilde: ${sourceName(series)}. Lisens: ${series.licence}.` +
    (series.tag === "ESTIMATE" ? " Dette er en framskrivning fra kilden, ikke observerte tall." : "");
  document.getElementById("detail-chart").setAttribute("aria-label",
    `Linjediagram: ${series.title_no}, ${periodLabel(series.first_period)} til ${periodLabel(series.last_period)}. Bruk piltastene for å lese verdier. Tallene finnes også i tabellen under.`);

  renderRanges();
  drawChart();
  renderTable(lines, series.decimals);
  renderMeta(series);
}

// --- the source status board -----------------------------------------------------------

function statusBadge(status) {
  const label = STATUSES.find(([key]) => key === status)?.[1] || status;
  const icon = svg("svg", { viewBox: "0 0 16 16", "aria-hidden": "true" });
  icon.append(svg("path", { d: STATUS_ICONS[status] || STATUS_ICONS.skipped }));
  return el("span", { class: "status", "data-status": status }, el("span", { class: "icon" }, icon), label);
}

function sourceDetail(result) {
  if (result.status === "ok" || result.status === "reachable") return "";
  if (result.status === "needs_key") return `HTTP ${result.http_status} uten nøkkel`;
  if (result.status === "blocked") return `HTTP ${result.http_status}`;
  return result.detail || "";
}

function renderSources(sources) {
  const container = document.getElementById("sources");
  const checked = sources.results.map((result) => result.checked_at).filter(Boolean).sort().pop();
  document.getElementById("kildene-note").textContent =
    `${integer.format(sources.results.length)} kilder i katalogen. Hver er spurt én gang` +
    (checked ? `, sist ${dateFormat.format(new Date(checked))}.` : ".");

  const groups = [];
  const bySection = new Map();
  for (const result of sources.results) {
    if (!bySection.has(result.section)) bySection.set(result.section, []);
    bySection.get(result.section).push(result);
  }
  for (const [section, results] of bySection) {
    const body = el("tbody");
    const rows = results.map((result) => {
      const row = el("tr", {},
        el("td", { class: "src-name", text: result.name }),
        el("td", { class: "src-pri", text: result.priority === "-" ? "" : result.priority, title: "Prioritet i katalogen" }),
        el("td", { class: "src-status" }, statusBadge(result.status)),
        el("td", { class: "src-detail", text: sourceDetail(result) }));
      body.append(row);
      return { result, row };
    });
    const counts = el("span", { class: "group-counts" });
    const group = el("details", { class: "source-group" },
      el("summary", {}, el("span", { class: "group-title", text: `${section}. ${sources.sections[section] || ""}`.trim() }), counts),
      el("table", { class: "source-table" },
        el("colgroup", {}, el("col"), el("col", { class: "w-pri" }), el("col", { class: "w-status" }), el("col", { class: "w-detail" })),
        el("thead", { class: "visually-hidden" }, el("tr", {},
          el("th", { text: "Kilde" }), el("th", { text: "Prioritet" }), el("th", { text: "Status" }), el("th", { text: "Detaljer" }))),
        body));
    container.append(group);
    groups.push({ group, rows, counts });
  }

  let activeStatus = null;
  const search = document.getElementById("source-search");
  const chips = document.getElementById("status-chips");
  const addChip = (status, label, count) => {
    const chip = el("button", { class: "chip", type: "button", "aria-pressed": String(status === activeStatus) });
    if (status) chip.append(statusBadge(status)); else chip.append(label);
    chip.append(el("span", { class: "count", text: integer.format(count) }));
    chip.addEventListener("click", () => {
      activeStatus = status;
      for (const other of chips.children) other.setAttribute("aria-pressed", String(other === chip));
      apply();
    });
    chips.append(chip);
  };
  addChip(null, "Alle", sources.results.length);
  for (const [status, label] of STATUSES) {
    if (sources.counts[status]) addChip(status, label, sources.counts[status]);
  }

  function apply() {
    const needle = search.value.trim().toLowerCase();
    const filtering = Boolean(needle || activeStatus);
    let visible = 0;
    for (const { group, rows, counts } of groups) {
      let shown = 0;
      for (const { result, row } of rows) {
        const show = (!activeStatus || result.status === activeStatus) && (!needle || result.name.toLowerCase().includes(needle));
        row.hidden = !show;
        if (show) shown += 1;
      }
      const ok = rows.filter(({ result }) => result.status === "ok").length;
      counts.textContent = filtering ? `${shown} av ${rows.length} vises` : `${rows.length} kilder · ${ok} svarer med data`;
      group.hidden = shown === 0;
      group.open = filtering && shown > 0;
      visible += shown;
    }
    document.getElementById("sources-empty").hidden = visible > 0;
  }
  search.addEventListener("input", apply);
  apply();
}

// --- start -----------------------------------------------------------------------------

async function start() {
  const dialog = document.getElementById("detail");
  document.getElementById("detail-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  document.getElementById("detail-csv").addEventListener("click", downloadCsv);
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (dialog.open && detailState) drawChart(); }, 150);
  });

  try {
    const [build, catalog, sources] = await Promise.all([
      getJson("data/build.json"),
      getJson("data/catalog.json"),
      getJson("data/sources.json").catch(() => null),
    ]);
    renderKpis(build, sources);
    renderCatalog(catalog);
    const linked = /^#serie=(.+)$/.exec(location.hash);
    const wanted = linked && catalog.series.find((series) => series.series_id === decodeURIComponent(linked[1]));
    if (wanted) openDetail(wanted);
    if (sources) renderSources(sources);
    else document.getElementById("kildene").hidden = true;
    const quality = { pass: "alle kontroller bestått", warn: "ingen feil, men noen serier har ikke fått nye tall på lenge", fail: "kontrollen fant feil" }[build.validation] || "ikke kontrollert";
    document.getElementById("build-note").textContent =
      `Sist bygget ${dateFormat.format(new Date(build.generated_at))}. Datakontroll: ${quality}.`;
  } catch (error) {
    document.getElementById("kpis").replaceChildren(el("p", { class: "empty", text: `Kunne ikke laste tallene: ${error.message}` }));
  }
}

start();
