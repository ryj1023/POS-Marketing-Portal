const express = require("express");

const { buildDashboardResponse } = require("./ui/dashboard/build_dashboard_response");

const app = express();
const port = Number(process.env.PORT || 3000);

const DEMO_TRANSACTIONS = [
  {
    transactionTime: "2026-04-29T10:00:00.000Z",
    sourceFileId: "seed",
    items: [
      { itemCode: "SODA-1", category: "Beverages", itemDescription: "Soda 20oz", quantity: 3, itemCost: 0.7, itemPrice: 2.1 },
      { itemCode: "CHIP-1", category: "Snacks", itemDescription: "Classic Chips", quantity: 1, itemCost: 0.3, itemPrice: 1.2 }
    ]
  },
  {
    transactionTime: "2026-04-30T11:00:00.000Z",
    sourceFileId: "seed",
    items: [
      { itemCode: "SODA-1", category: "Beverages", itemDescription: "Soda 20oz", quantity: 2, itemCost: 0.7, itemPrice: 2.1 },
      { itemCode: "WATR-1", category: "Beverages", itemDescription: "Spring Water", quantity: 2, itemCost: 0.4, itemPrice: 1.7 }
    ]
  },
  {
    transactionTime: "2026-05-01T09:00:00.000Z",
    sourceFileId: "seed",
    items: [
      { itemCode: "SODA-1", category: "Beverages", itemDescription: "Soda 20oz", quantity: 4, itemCost: 0.7, itemPrice: 2.1 },
      { itemCode: "CHIP-1", category: "Snacks", itemDescription: "Classic Chips", quantity: 2, itemCost: 0.3, itemPrice: 1.2 }
    ]
  }
];

app.use(express.static("src/ui/public"));

app.get("/api/dashboard", (req, res) => {
  const payload = buildDashboardResponse(DEMO_TRANSACTIONS, req.query);
  res.json(payload);
});

if (require.main === module) {
  app.listen(port, () => {
    process.stdout.write(`Dashboard server running on http://localhost:${port}\n`);
  });
}

module.exports = { app };
