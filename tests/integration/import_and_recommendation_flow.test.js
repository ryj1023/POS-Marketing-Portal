const test = require("node:test");
const assert = require("node:assert/strict");

const { importPosLogs } = require("../../src/data/ingestion/pos_importer");
const { aggregateTransactions } = require("../../src/analytics/aggregations");
const { recommendPromotions } = require("../../src/recommendations/rules_engine");
const { RecommendationActionStore } = require("../../src/ui/recommendation_actions/store");
const { calculatePromoUplift } = require("../../src/metrics/uplift_calculator");

test("end-to-end import -> aggregate -> recommend -> action -> uplift", () => {
  const dataset = [
    {
      transactionTime: "2026-04-28T10:00:00.000Z",
      cashier: { name: "Bob", id: 101 },
      items: [
        { itemCode: "SODA-1", category: "Beverages", itemDescription: "Soda 20oz", quantity: 2, itemCost: 0.7, itemPrice: 2.1 },
        { itemCode: "CHIP-1", category: "Snacks", itemDescription: "Classic Chips", quantity: 1, itemCost: 0.3, itemPrice: 1.2 }
      ]
    },
    {
      transactionTime: "2026-04-29T10:00:00.000Z",
      cashier: { name: "Bob", id: 101 },
      items: [
        { itemCode: "SODA-1", category: "Beverages", itemDescription: "Soda 20oz", quantity: 3, itemCost: 0.7, itemPrice: 2.1 }
      ]
    },
    {
      transactionTime: "2026-04-30T10:00:00.000Z",
      cashier: { name: "Bob", id: 101 },
      items: [
        { itemCode: "SODA-1", category: "Beverages", itemDescription: "Soda 20oz", quantity: 1, itemCost: 0.7, itemPrice: 2.1 }
      ]
    },
    {
      transactionTime: "2026-04-28T10:00:00.000Z",
      cashier: { name: "Bob", id: 101 },
      items: [
        { itemCode: "SODA-1", category: "Beverages", itemDescription: "Soda 20oz", quantity: 2, itemCost: 0.7, itemPrice: 2.1 },
        { itemCode: "CHIP-1", category: "Snacks", itemDescription: "Classic Chips", quantity: 1, itemCost: 0.3, itemPrice: 1.2 }
      ]
    },
    {
      transactionTime: "bad-date",
      cashier: { name: "Bob", id: 101 },
      items: [
        { itemCode: "BAD-1", category: "Misc", itemDescription: "Bad", quantity: 1, itemCost: 0.1, itemPrice: 1.0 }
      ]
    }
  ];

  const imported = importPosLogs(dataset, { format: "json", sourceFileId: "store-1" });
  assert.equal(imported.report.processedCount, 3);
  assert.equal(imported.report.duplicateCount, 1);
  assert.equal(imported.report.rejectedCount, 1);

  const aggregations = aggregateTransactions(imported.transactions);
  assert.ok(aggregations.dailyByItem.size > 0);
  assert.ok(aggregations.weeklyByCategory.size > 0);

  const recommendations = recommendPromotions(imported.transactions, {
    topN: 5,
    guardrails: { marginFloor: 0.2, minTransactions: 3 }
  });

  assert.equal(recommendations.recommended.length, 1);
  assert.equal(recommendations.recommended[0].itemCode, "SODA-1");
  assert.equal(recommendations.excluded.length, 1);

  const actionStore = new RecommendationActionStore();
  actionStore.setAction("2026-05-01", "SODA-1", "accept");
  const actions = actionStore.getActionsForDate("2026-05-01");

  const uplift = calculatePromoUplift({
    baselineRevenue: 1000,
    comparisonRevenue: 1130,
    recommendations: recommendations.recommended,
    actions,
    includeOnlyAccepted: true
  });

  assert.equal(uplift.upliftPercent, 13);
  assert.equal(uplift.eligibleItemsCount, 1);
});
