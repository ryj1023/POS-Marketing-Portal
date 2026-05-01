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

function buildPairingStats(transactions) {
  const pairCounts = new Map();
  const itemStats = new Map();

  transactions.forEach((transaction) => {
    const uniqueCodes = Array.from(new Set(transaction.items.map((item) => item.itemCode)));
    transaction.items.forEach((item) => {
      const current = itemStats.get(item.itemCode) || {
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        category: item.category,
        marginRate: 0,
        revenue: 0,
        grossMargin: 0
      };
      current.revenue += item.quantity * item.itemPrice;
      current.grossMargin += item.quantity * (item.itemPrice - item.itemCost);
      current.marginRate = current.revenue > 0 ? current.grossMargin / current.revenue : 0;
      itemStats.set(item.itemCode, current);
    });

    uniqueCodes.forEach((baseCode) => {
      uniqueCodes.forEach((pairCode) => {
        if (baseCode === pairCode) {
          return;
        }
        const key = `${baseCode}->${pairCode}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      });
    });
  });

  return { pairCounts, itemStats };
}

function attachPairingSuggestions(recommended, transactions) {
  const { pairCounts, itemStats } = buildPairingStats(transactions);

  return recommended.map((item) => {
    const candidates = [];
    pairCounts.forEach((count, key) => {
      const [baseCode, pairCode] = key.split("->");
      if (baseCode !== item.itemCode || count < 2) {
        return;
      }
      const pairItem = itemStats.get(pairCode);
      if (!pairItem || pairItem.marginRate < 0.28) {
        return;
      }
      candidates.push({
        ...pairItem,
        pairCount: count,
        score: count * pairItem.marginRate
      });
    });

    candidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.itemCode.localeCompare(b.itemCode);
    });

    const best = candidates[0] || null;
    return {
      ...item,
      pairingSuggestion: best
        ? {
            itemCode: best.itemCode,
            itemDescription: best.itemDescription,
            category: best.category,
            marginRate: Number((best.marginRate * 100).toFixed(1)),
            coPurchaseCount: best.pairCount,
            rationale: `Pair with ${best.itemDescription} (${best.marginRate * 100 >= 35 ? "high" : "good"} margin) bought together ${best.pairCount} times.`
          }
        : null
    };
  });
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
  const enriched = attachPairingSuggestions(allowed.slice(0, topN), transactions);
  return {
    recommended: enriched,
    excluded
  };
}

module.exports = {
  recommendPromotions
};
