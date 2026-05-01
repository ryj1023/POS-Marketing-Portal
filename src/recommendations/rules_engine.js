const { applyGuardrails } = require("./guardrails");

function buildItemStats(transactions) {
  const stats = new Map();
  transactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      const current = stats.get(item.itemCode) || {
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        category: item.category,
        units: 0,
        revenue: 0,
        grossMargin: 0,
        transactionCount: 0
      };
      current.units += item.quantity;
      current.revenue += item.quantity * item.itemPrice;
      current.grossMargin += item.quantity * (item.itemPrice - item.itemCost);
      current.transactionCount += 1;
      stats.set(item.itemCode, current);
    });
  });

  return Array.from(stats.values()).map((item) => ({
    ...item,
    marginRate: item.revenue > 0 ? item.grossMargin / item.revenue : 0
  }));
}

function scoreCandidate(item) {
  const volumeScore = Math.min(item.units / 20, 1);
  const marginScore = item.marginRate;
  const blended = 0.6 * volumeScore + 0.4 * marginScore;
  return Number(blended.toFixed(4));
}

function rationale(item) {
  return `Strong volume (${item.units} units) with margin ${(item.marginRate * 100).toFixed(1)}% in ${item.category}.`;
}

function recommendPromotions(transactions, options = {}) {
  const topN = options.topN ?? 5;
  const itemStats = buildItemStats(transactions);
  const scored = itemStats.map((item) => ({
    ...item,
    score: scoreCandidate(item),
    rationale: rationale(item)
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.marginRate !== a.marginRate) {
      return b.marginRate - a.marginRate;
    }
    return a.itemCode.localeCompare(b.itemCode);
  });

  const { allowed, excluded } = applyGuardrails(scored, options.guardrails);
  return {
    recommended: allowed.slice(0, topN),
    excluded
  };
}

module.exports = {
  recommendPromotions
};
