const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { app } = require("../../src/server");

function requestJson(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "127.0.0.1", port, path, method: "GET" },
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
