const fs = require("node:fs");
const path = require("node:path");

const { generateMockTransactions } = require("../src/data/ingestion/mock_transactions");

function chunkByDay(transactions) {
  const map = new Map();
  transactions.forEach((tx) => {
    const day = tx.transactionTime.slice(0, 10);
    if (!map.has(day)) {
      map.set(day, []);
    }
    map.get(day).push(tx);
  });
  return map;
}

function main() {
  const days = Number(process.env.MOCK_DAYS || 14);
  const weeks = Number(process.env.MOCK_WEEKS || 0);
  const seed = process.env.MOCK_SEED || "pos-demo-v2";
  const seedListRaw = process.env.MOCK_SEEDS || "";
  const seedList = seedListRaw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const anchorDate = process.env.MOCK_ANCHOR_DATE || "2026-05-01T00:00:00.000Z";
  const outputDir = path.resolve(process.cwd(), "data/mock-pos-logs");
  const splitByDay = String(process.env.MOCK_SPLIT_BY_DAY || "true") !== "false";

  fs.mkdirSync(outputDir, { recursive: true });

  const effectiveDays = weeks > 0 ? weeks * 7 : days;
  const seeds = seedList.length > 0 ? seedList : [seed];
  let fileCount = 0;
  let transactionCount = 0;

  seeds.forEach((seedValue) => {
    const transactions = generateMockTransactions({ days: effectiveDays, seed: seedValue, anchorDate });
    transactionCount += transactions.length;

    if (!splitByDay) {
      const filePath = path.join(
        outputDir,
        `pos-log-${seedValue}-${effectiveDays}d-${anchorDate.slice(0, 10)}.json`
      );
      const payload = {
        sourceFileId: `generated-${seedValue}-${anchorDate.slice(0, 10)}`,
        transactions
      };
      fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
      fileCount += 1;
      return;
    }

    const byDay = chunkByDay(transactions);

    Array.from(byDay.entries()).forEach(([day, rows]) => {
      const filePath = path.join(outputDir, `pos-log-${seedValue}-${day}.json`);
      const payload = {
        sourceFileId: `generated-${seedValue}-${day}`,
        transactions: rows
      };
      fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
      fileCount += 1;
    });
  });

  process.stdout.write(
    `Generated ${fileCount} files in data/mock-pos-logs from ${transactionCount} transactions across ${seeds.length} seed(s).\n`
  );
}

main();
