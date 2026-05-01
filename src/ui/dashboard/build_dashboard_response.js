const { renderDashboardView } = require("./render");
const { recommendPromotions } = require("../../recommendations/rules_engine");

const DEFAULT_FILTERS = {
  date_start: null,
  date_end: null,
  granularity: "day",
  categories: [],
  items: []
};

function toCanonicalFilters(query = {}) {
  const dateStart = query.date_start || null;
  const dateEnd = query.date_end || null;
  const granularity = ["hour", "day", "week"].includes(query.granularity)
    ? query.granularity
    : DEFAULT_FILTERS.granularity;

  return {
    date_start: dateStart,
    date_end: dateEnd,
    granularity,
    categories: listFromQuery(query.categories),
    items: listFromQuery(query.items)
  };
}

function listFromQuery(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function filterTransactions(transactions, filters) {
  return transactions
    .filter((transaction) => {
      const dayKey = transaction.transactionTime.slice(0, 10);
      if (filters.date_start && dayKey < filters.date_start) {
        return false;
      }
      if (filters.date_end && dayKey > filters.date_end) {
        return false;
      }
      return true;
    })
    .map((transaction) => {
      const items = transaction.items.filter((item) => {
        const categoryOk =
          filters.categories.length === 0 || filters.categories.includes(item.category);
        const itemOk = filters.items.length === 0 || filters.items.includes(item.itemCode);
        return categoryOk && itemOk;
      });
      return {
        ...transaction,
        items
      };
    })
    .filter((transaction) => transaction.items.length > 0);
}

function buildKpis(transactions) {
  const totals = transactions.reduce(
    (acc, transaction) => {
      transaction.items.forEach((item) => {
        acc.revenue += item.quantity * item.itemPrice;
        acc.units_sold += item.quantity;
      });
      return acc;
    },
    { revenue: 0, units_sold: 0 }
  );

  return [
    { metric_id: "revenue", value: Number(totals.revenue.toFixed(2)) },
    { metric_id: "transaction_count", value: transactions.length },
    {
      metric_id: "average_basket",
      value: transactions.length === 0 ? 0 : Number((totals.revenue / transactions.length).toFixed(2))
    },
    { metric_id: "units_sold", value: totals.units_sold }
  ];
}

function buildTrend(transactions, granularity) {
  const buckets = new Map();
  transactions.forEach((transaction) => {
    const key = bucketKey(transaction.transactionTime, granularity);
    const bucket = buckets.get(key) || { units_sold: 0 };
    transaction.items.forEach((item) => {
      bucket.units_sold += item.quantity;
    });
    buckets.set(key, bucket);
  });
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ bucket: key, ...value }));
}

function bucketKey(isoTime, granularity) {
  if (granularity === "hour") {
    return isoTime.slice(0, 13) + ":00";
  }
  if (granularity === "week") {
    const date = new Date(isoTime);
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() - day + 1);
    return date.toISOString().slice(0, 10);
  }
  return isoTime.slice(0, 10);
}

function buildCategoryBreakdown(transactions) {
  const byCategory = new Map();
  let totalUnits = 0;
  transactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      totalUnits += item.quantity;
      const bucket = byCategory.get(item.category) || { category: item.category, units_sold: 0 };
      bucket.units_sold += item.quantity;
      byCategory.set(item.category, bucket);
    });
  });
  return Array.from(byCategory.values()).map((entry) => ({
    ...entry,
    percent_of_total: totalUnits === 0 ? 0 : Number(((entry.units_sold / totalUnits) * 100).toFixed(2))
  }));
}

function buildBestSellers(transactions, limit = 8) {
  const byItem = new Map();
  transactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      const bucket = byItem.get(item.itemCode) || {
        item_code: item.itemCode,
        item_description: item.itemDescription,
        units_sold: 0,
        revenue: 0
      };
      bucket.units_sold += item.quantity;
      bucket.revenue += item.quantity * item.itemPrice;
      byItem.set(item.itemCode, bucket);
    });
  });

  return Array.from(byItem.values())
    .sort((a, b) => {
      if (b.units_sold !== a.units_sold) {
        return b.units_sold - a.units_sold;
      }
      if (b.revenue !== a.revenue) {
        return b.revenue - a.revenue;
      }
      return a.item_code.localeCompare(b.item_code);
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2))
    }));
}

function buildDashboardResponse(transactions, query = {}, nowIso = new Date().toISOString()) {
  const filters = toCanonicalFilters(query);
  const filteredTransactions = filterTransactions(transactions, filters);
  const recommendations = recommendPromotions(filteredTransactions, {
    topN: 3,
    guardrails: { marginFloor: 0.2, minTransactions: 3 }
  });

  const hasTransactions = filteredTransactions.length > 0;
  const panelState = {
    loading: false,
    error: null,
    empty: !hasTransactions,
    insufficientData: hasTransactions && recommendations.recommended.length === 0,
    ready: hasTransactions && recommendations.recommended.length > 0
  };

  return renderDashboardView({
    kpis: buildKpis(filteredTransactions),
    trends: buildTrend(filteredTransactions, filters.granularity),
    bestSellers: buildBestSellers(filteredTransactions),
    categories: buildCategoryBreakdown(filteredTransactions),
    recentTransactions: filteredTransactions.slice(-10).reverse().map((transaction) => ({
      receipt_id: `${transaction.sourceFileId}:${transaction.transactionTime}`,
      transaction_time_local: transaction.transactionTime,
      items: transaction.items,
      basket_total: Number(
        transaction.items.reduce((sum, item) => sum + item.quantity * item.itemPrice, 0).toFixed(2)
      )
    })),
    recommendations: {
      label: "Rule-based promotion suggestions",
      recommended: recommendations.recommended,
      excluded: recommendations.excluded
    },
    filters,
    dataAsOf: nowIso,
    lastRefreshAt: nowIso,
    panelState
  });
}

module.exports = {
  buildDashboardResponse,
  toCanonicalFilters
};
