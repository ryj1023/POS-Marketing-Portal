const express = require("express");

const { importPosLogs } = require("./data/ingestion/pos_importer");
const { buildDashboardResponse } = require("./ui/dashboard/build_dashboard_response");
const { generateMockTransactions } = require("./data/ingestion/mock_transactions");

const app = express();
const port = Number(process.env.PORT || 3000);

const DEMO_TRANSACTIONS = generateMockTransactions({
  days: Number(process.env.MOCK_DAYS || 10),
  anchorDate: process.env.MOCK_ANCHOR_DATE || "2026-05-01T00:00:00.000Z",
  seed: process.env.MOCK_SEED || "pos-demo-v2"
});
let activeTransactions = DEMO_TRANSACTIONS;

app.use(express.static("src/ui/public"));
app.use(express.json({ limit: "10mb" }));

app.get("/api/dashboard", (req, res) => {
  const payload = buildDashboardResponse(activeTransactions, req.query);
  res.json(payload);
});

app.post("/api/import-json", (req, res) => {
  try {
    const payload = req.body;
    const input = Array.isArray(payload) ? payload : payload.transactions;
    if (!Array.isArray(input)) {
      res.status(400).json({
        error: "Request body must be a JSON array or an object with a transactions array"
      });
      return;
    }

    const sourceFileId =
      (typeof payload === "object" && payload && payload.sourceFileId) ||
      `upload-${new Date().toISOString()}`;
    const imported = importPosLogs(input, { format: "json", sourceFileId });
    if (imported.transactions.length > 0) {
      activeTransactions = imported.transactions;
    }

    res.json({
      report: imported.report,
      activeTransactionCount: activeTransactions.length
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Invalid JSON import payload"
    });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    process.stdout.write(`Dashboard server running on http://localhost:${port}\n`);
  });
}

module.exports = { app };
