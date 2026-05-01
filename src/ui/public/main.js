const KPI_META = {
  revenue: { label: "REVENUE TODAY", format: "currency", delta: 12.4 },
  transaction_count: { label: "TRANSACTIONS", format: "number", delta: 8.1 },
  average_basket: { label: "AVG BASKET", format: "currency", delta: 3.9 },
  units_sold: { label: "UNITS SOLD", format: "number", delta: -2.1 }
};

const SERIES_COLORS = ["#1f9f7a", "#7b7b76", "#d55b2e", "#b87911", "#3f86d0", "#7a72d1", "#ca537f", "#5d9220"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatValue(value, type) {
  if (type === "currency") {
    return formatCurrency(Number(value || 0));
  }
  return formatNumber(Number(value || 0));
}

function formatMetaDate(iso) {
  const dt = new Date(iso);
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function inBusinessHours(dt) {
  const hour = dt.getHours();
  return hour >= 6 && hour < 22;
}

function staleMessage(dataAsOfIso) {
  const dataAsOf = new Date(dataAsOfIso);
  const ageMs = Date.now() - dataAsOf.getTime();
  const twoHours = 2 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;
  if (ageMs > dayMs) {
    return "Data is more than 24h old. Verify POS ingestion before acting on suggestions.";
  }
  if (ageMs > twoHours && inBusinessHours(new Date())) {
    return "Data is stale during business hours. Recommendations are based on historical imported data.";
  }
  return null;
}

function renderKpis(cards) {
  const root = document.getElementById("kpis");
  root.innerHTML = "";
  cards.forEach((card) => {
    const meta = KPI_META[card.metric_id] || { label: card.metric_id.toUpperCase(), format: "number", delta: 0 };
    const deltaClass = meta.delta >= 0 ? "up" : "down";
    const deltaSign = meta.delta >= 0 ? "+" : "";
    const node = document.createElement("article");
    node.className = "card";
    node.innerHTML = `
      <div class="kpi-title">${meta.label}</div>
      <div class="kpi-value">${formatValue(card.value, meta.format)}</div>
      <div class="kpi-delta ${deltaClass}">${deltaSign}${meta.delta.toFixed(1)}% vs yesterday</div>
    `;
    root.appendChild(node);
  });
}

function renderBestSellers(items) {
  const root = document.getElementById("best-sellers");
  root.innerHTML = "";
  const max = Math.max(...items.map((i) => i.units_sold), 1);
  items.forEach((item, idx) => {
    const widthPct = (item.units_sold / max) * 100;
    const row = document.createElement("div");
    row.className = "seller-row";
    row.innerHTML = `
      <div>${item.item_description || item.item_code}</div>
      <div class="track"><div class="bar" style="width:${widthPct}%; background:${SERIES_COLORS[idx % SERIES_COLORS.length]}"></div></div>
      <div>${formatNumber(item.units_sold)} units</div>
    `;
    root.appendChild(row);
  });
}

function renderCategory(categories) {
  const legend = document.getElementById("category-legend");
  const donut = document.getElementById("category-donut");
  legend.innerHTML = "";
  donut.innerHTML = "";
  if (categories.length === 0) {
    return;
  }

  categories.forEach((cat, idx) => {
    const li = document.createElement("span");
    li.className = "legend-item";
    li.innerHTML = `<span class="swatch" style="background:${SERIES_COLORS[idx % SERIES_COLORS.length]}"></span>${cat.category} ${cat.percent_of_total.toFixed(0)}%`;
    legend.appendChild(li);
  });

  let angle = 0;
  const radius = 130;
  const center = 160;
  const arcPieces = categories
    .map((cat, idx) => {
      const slice = (cat.percent_of_total / 100) * Math.PI * 2;
      const start = angle;
      const end = angle + slice;
      angle = end;
      const x1 = center + radius * Math.cos(start);
      const y1 = center + radius * Math.sin(start);
      const x2 = center + radius * Math.cos(end);
      const y2 = center + radius * Math.sin(end);
      const largeArc = slice > Math.PI ? 1 : 0;
      return `<path d="M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${SERIES_COLORS[idx % SERIES_COLORS.length]}"></path>`;
    })
    .join("");

  donut.innerHTML = `
    <svg width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="Category share chart">
      ${arcPieces}
      <circle cx="160" cy="160" r="72" fill="#f8f8f6"></circle>
    </svg>
  `;
}

function renderTrend(points) {
  const svg = document.getElementById("line-chart");
  if (points.length === 0) {
    svg.innerHTML = "";
    return;
  }
  const width = 900;
  const height = 300;
  const p = { t: 20, r: 20, b: 40, l: 40 };
  const max = Math.max(...points.map((pt) => pt.units_sold), 1);
  const min = 0;
  const xStep = points.length === 1 ? 0 : (width - p.l - p.r) / (points.length - 1);

  const coords = points.map((pt, idx) => {
    const x = p.l + idx * xStep;
    const y = p.t + (1 - (pt.units_sold - min) / (max - min || 1)) * (height - p.t - p.b);
    return { ...pt, x, y };
  });

  const line = coords.map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");
  const area = `${line} L ${coords[coords.length - 1].x} ${height - p.b} L ${coords[0].x} ${height - p.b} Z`;
  const dots = coords
    .map((pt) => `<circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#3f86d0"></circle>`)
    .join("");
  const labels = coords
    .map((pt) => `<text x="${pt.x}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#525252">${pt.bucket.slice(11, 16) || pt.bucket}</text>`)
    .join("");

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = `
    <path d="${area}" fill="#3f86d022"></path>
    <path d="${line}" fill="none" stroke="#3f86d0" stroke-width="3"></path>
    ${dots}
    ${labels}
  `;
}

function renderRecommendations(panel) {
  const root = document.getElementById("recs");
  const meta = document.getElementById("rec-meta");
  root.innerHTML = "";
  meta.textContent = `${panel.label} • updated just now`;
  if (panel.recommended.length === 0) {
    root.innerHTML = '<p class="rec-note">No recommendation candidates for selected filters.</p>';
    return;
  }

  panel.recommended.forEach((item) => {
    const node = document.createElement("article");
    node.className = "rec-item";
    const est = Math.round(item.revenue || 0);
    node.innerHTML = `
      <div class="rec-title">
        <span>${item.itemDescription || item.itemCode}</span>
        <span class="up">+$${est} est.</span>
      </div>
      <div class="rec-note">${item.rationale}</div>
    `;
    root.appendChild(node);
  });
}

function renderTransactions(rows) {
  const root = document.getElementById("transactions");
  root.innerHTML = "";
  rows.forEach((row) => {
    const itemNames = row.items.map((i) => i.itemDescription || i.itemCode).slice(0, 3).join(", ");
    const node = document.createElement("article");
    node.className = "tx-row";
    node.innerHTML = `
      <div>
        <div class="tx-main">${itemNames || "Transaction"}</div>
        <div class="tx-sub">${row.receipt_id} • ${formatMetaDate(row.transaction_time_local)}</div>
      </div>
      <div class="tx-amount">${formatCurrency(row.basket_total)}</div>
    `;
    root.appendChild(node);
  });
}

function setPanelStateText(panelStates, data) {
  const stateText = panelStates.error
    ? `Error: ${panelStates.error}`
    : panelStates.empty
      ? "No transactions in selected range."
      : panelStates.insufficient_data
        ? "Transactions found, but not enough history for recommendations."
        : "Ready";

  ["best-state", "category-state", "trend-state", "rec-state", "tx-state"].forEach((id) => {
    const node = document.getElementById(id);
    node.textContent = `${stateText} • as of ${formatMetaDate(data.data_as_of)}`;
  });
}

async function loadDashboard() {
  const response = await fetch("/api/dashboard");
  if (!response.ok) {
    throw new Error("Failed to load dashboard");
  }

  const data = await response.json();
  const firstBucket = data.trend_views[0]?.bucket || "n/a";
  const title = document.getElementById("title");
  title.textContent = "QuikStop #0047 - Cockeysville, MD";
  document.getElementById("meta").textContent = `POS • ${firstBucket.slice(0, 10)} • Shift 2 of 3 • Data as of ${formatMetaDate(data.data_as_of)}`;

  const warningNode = document.getElementById("warning");
  const warning = staleMessage(data.data_as_of);
  warningNode.hidden = !warning;
  warningNode.textContent = warning || "";

  renderKpis(data.kpi_cards || []);
  renderBestSellers(data.best_selling_items || []);
  renderCategory(data.category_breakdown || []);
  renderTrend(data.trend_views || []);
  renderRecommendations(data.recommendation_panel || { label: "Recommendations", recommended: [] });
  renderTransactions(data.recent_transactions || []);
  setPanelStateText(data.panel_states || {}, data);
}

loadDashboard().catch((error) => {
  const warningNode = document.getElementById("warning");
  warningNode.hidden = false;
  warningNode.textContent = `Error: ${error.message}. Retry after checking /api/dashboard availability.`;
});
