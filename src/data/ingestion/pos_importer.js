const { createImportReport } = require("./import_report");

function parseInput(input, format) {
  if (format === "json") {
    if (typeof input === "string") {
      return JSON.parse(input);
    }
    return input;
  }

  if (format === "csv") {
    if (typeof input !== "string") {
      throw new Error("CSV input must be a string");
    }
    return parseCsvRows(input);
  }

  throw new Error(`Unsupported format: ${format}`);
}

function parseCsvRows(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((v) => v.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return {
      transactionTime: row.transactionTime,
      cashier: {
        name: row.cashierName,
        id: Number(row.cashierId)
      },
      items: [
        {
          itemCode: row.itemCode,
          category: row.category,
          itemDescription: row.itemDescription,
          quantity: Number(row.quantity),
          itemCost: Number(row.itemCost),
          itemPrice: Number(row.itemPrice)
        }
      ]
    };
  });
}

function normalizeTransaction(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Transaction must be an object");
  }

  const transactionTime = new Date(raw.transactionTime);
  if (Number.isNaN(transactionTime.getTime())) {
    throw new Error("Invalid transactionTime");
  }

  if (!raw.cashier || typeof raw.cashier !== "object") {
    throw new Error("Missing cashier");
  }

  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    throw new Error("Transaction requires at least one item");
  }

  const cashierId = Number(raw.cashier.id);
  const cashierName = String(raw.cashier.name || "").trim();
  if (!cashierName) {
    throw new Error("Missing cashier.name");
  }
  if (!Number.isFinite(cashierId)) {
    throw new Error("Invalid cashier.id");
  }

  const items = raw.items.map((item) => normalizeItem(item));
  return {
    transactionTime: transactionTime.toISOString(),
    cashier: {
      id: cashierId,
      name: cashierName
    },
    items
  };
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") {
    throw new Error("Invalid item");
  }

  const quantity = Number(item.quantity);
  const itemCost = Number(item.itemCost);
  const itemPrice = Number(item.itemPrice);

  if (!item.itemCode) {
    throw new Error("Missing itemCode");
  }
  if (!item.category) {
    throw new Error("Missing category");
  }
  if (!item.itemDescription) {
    throw new Error("Missing itemDescription");
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Invalid quantity");
  }
  if (!Number.isFinite(itemCost) || itemCost < 0) {
    throw new Error("Invalid itemCost");
  }
  if (!Number.isFinite(itemPrice) || itemPrice < 0) {
    throw new Error("Invalid itemPrice");
  }

  return {
    itemCode: String(item.itemCode),
    category: String(item.category),
    itemDescription: String(item.itemDescription),
    quantity,
    itemCost,
    itemPrice
  };
}

function importPosLogs(input, options = {}) {
  const format = options.format || "json";
  const sourceFileId = options.sourceFileId || "manual-import";
  const parsed = parseInput(input, format);

  if (!Array.isArray(parsed)) {
    throw new Error("Input must be an array of transactions");
  }

  const seenSignatures = new Set();
  const transactions = [];
  const rowErrors = [];
  let duplicateCount = 0;

  parsed.forEach((raw, index) => {
    try {
      const transaction = normalizeTransaction(raw);
      const signature = buildTransactionSignature(transaction);
      if (seenSignatures.has(signature)) {
        duplicateCount += 1;
        return;
      }
      seenSignatures.add(signature);
      transactions.push({
        ...transaction,
        sourceFileId
      });
    } catch (error) {
      rowErrors.push({
        rowNumber: index + 1,
        reason: error.message
      });
    }
  });

  const importedDateRange = buildDateRange(transactions);

  return {
    transactions,
    report: createImportReport({
      processedCount: transactions.length,
      rejectedCount: rowErrors.length,
      duplicateCount,
      importedDateRange,
      rowErrors
    })
  };
}

function buildTransactionSignature(transaction) {
  return JSON.stringify({
    transactionTime: transaction.transactionTime,
    cashierId: transaction.cashier.id,
    items: transaction.items
      .map((item) => `${item.itemCode}:${item.quantity}:${item.itemPrice}`)
      .sort()
  });
}

function buildDateRange(transactions) {
  if (transactions.length === 0) {
    return null;
  }

  const dates = transactions.map((transaction) => new Date(transaction.transactionTime));
  dates.sort((a, b) => a - b);
  return {
    from: dates[0].toISOString(),
    to: dates[dates.length - 1].toISOString()
  };
}

module.exports = {
  importPosLogs
};
