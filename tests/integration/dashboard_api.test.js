const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { app } = require("../../src/server");

function requestJson(port, path, options = {}) {
  return new Promise((resolve, reject) => {
    const body = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method: options.method || "GET",
        headers: body
          ? {
              "content-type": "application/json",
              "content-length": Buffer.byteLength(body)
            }
          : undefined
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        });
      }
    );
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

test("dashboard api returns canonical filters and unified panel states", async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const result = await requestJson(port, "/api/dashboard?granularity=week&categories=Beverages");
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.filters.granularity, "week");
    assert.deepEqual(result.body.filters.categories, ["Beverages"]);

    assert.equal(typeof result.body.data_as_of, "string");
    assert.equal(typeof result.body.last_refresh_at, "string");

    const states = result.body.panel_states;
    assert.equal(typeof states.loading, "boolean");
    assert.equal(typeof states.empty, "boolean");
    assert.equal(typeof states.insufficient_data, "boolean");
    assert.equal(typeof states.ready, "boolean");
    assert.ok(!(states.empty && states.ready));
  } finally {
    server.close();
  }
});

test("dashboard api empty filter result preserves context", async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const result = await requestJson(port, "/api/dashboard?date_start=2026-06-01&date_end=2026-06-03");
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.filters.date_start, "2026-06-01");
    assert.equal(result.body.filters.date_end, "2026-06-03");
    assert.equal(result.body.panel_states.empty, true);
    assert.equal(result.body.panel_states.ready, false);
  } finally {
    server.close();
  }
});

test("dashboard api accepts JSON import payload and updates active dataset", async () => {
  const server = app.listen(0);
  const port = server.address().port;

  const uploadPayload = {
    sourceFileId: "uploaded-test.json",
    transactions: [
      {
        transactionTime: "2026-05-02T08:13:27.000Z",
        cashier: { id: 101, name: "Casey" },
        items: [
          {
            itemCode: "COFFEE-M",
            category: "Beverages",
            itemDescription: "Hot Coffee (Any)",
            quantity: 2,
            itemCost: 0.65,
            itemPrice: 2.29
          }
        ]
      },
      {
        transactionTime: "2026-05-02T12:44:09.000Z",
        cashier: { id: 102, name: "Morgan" },
        items: [
          {
            itemCode: "SAND-HAM",
            category: "Other",
            itemDescription: "Ham Sandwich",
            quantity: 1,
            itemCost: 2.2,
            itemPrice: 5.99
          }
        ]
      }
    ]
  };

  try {
    const importResult = await requestJson(port, "/api/import-json", {
      method: "POST",
      body: uploadPayload
    });
    assert.equal(importResult.statusCode, 200);
    assert.equal(importResult.body.report.processedCount, 2);
    assert.equal(importResult.body.report.rejectedCount, 0);

    const dashboardResult = await requestJson(port, "/api/dashboard?date_start=2026-05-02&date_end=2026-05-02");
    assert.equal(dashboardResult.statusCode, 200);
    assert.equal(dashboardResult.body.panel_states.empty, false);
    assert.equal(dashboardResult.body.kpi_cards.find((k) => k.metric_id === "transaction_count").value, 2);
  } finally {
    server.close();
  }
});
