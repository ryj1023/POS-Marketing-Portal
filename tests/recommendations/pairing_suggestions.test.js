const test = require("node:test");
const assert = require("node:assert/strict");

const { recommendPromotions } = require("../../src/recommendations/rules_engine");

test("recommendations include pairing suggestion for high-volume item", () => {
  const transactions = [
    {
      transactionTime: "2026-05-01T08:10:11.000Z",
      items: [
        {
          itemCode: "COFFEE-M",
          category: "Beverages",
          itemDescription: "Hot Coffee (Any)",
          quantity: 3,
          itemCost: 0.65,
          itemPrice: 2.29
        },
        {
          itemCode: "COOKIE-CH",
          category: "Snacks",
          itemDescription: "Chocolate Cookie",
          quantity: 2,
          itemCost: 0.36,
          itemPrice: 1.49
        }
      ]
    },
    {
      transactionTime: "2026-05-01T09:15:19.000Z",
      items: [
        {
          itemCode: "COFFEE-M",
          category: "Beverages",
          itemDescription: "Hot Coffee (Any)",
          quantity: 2,
          itemCost: 0.65,
          itemPrice: 2.29
        },
        {
          itemCode: "COOKIE-CH",
          category: "Snacks",
          itemDescription: "Chocolate Cookie",
          quantity: 2,
          itemCost: 0.36,
          itemPrice: 1.49
        }
      ]
    },
    {
      transactionTime: "2026-05-01T10:22:30.000Z",
      items: [
        {
          itemCode: "COFFEE-M",
          category: "Beverages",
          itemDescription: "Hot Coffee (Any)",
          quantity: 3,
          itemCost: 0.65,
          itemPrice: 2.29
        }
      ]
    }
  ];

  const result = recommendPromotions(transactions, {
    topN: 3,
    guardrails: { marginFloor: 0.2, minTransactions: 2 }
  });

  assert.equal(result.recommended.length > 0, true);
  assert.equal(result.recommended[0].itemCode, "COFFEE-M");
  assert.equal(Boolean(result.recommended[0].pairingSuggestion), true);
  assert.equal(result.recommended[0].pairingSuggestion.itemCode, "COOKIE-CH");
});
