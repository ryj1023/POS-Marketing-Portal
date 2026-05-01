const CATEGORY_CATALOG = {
  Beverages: [
    { itemCode: "SODA-20", itemDescription: "Coca-Cola 20oz", itemCost: 0.72, itemPrice: 2.49 },
    { itemCode: "ENERGY-16", itemDescription: "Monster Energy 16oz", itemCost: 1.35, itemPrice: 3.69 },
    { itemCode: "WATER-1L", itemDescription: "Dasani Water 1L", itemCost: 0.48, itemPrice: 1.99 },
    { itemCode: "COFFEE-M", itemDescription: "Hot Coffee (Any)", itemCost: 0.65, itemPrice: 2.29 }
  ],
  Snacks: [
    { itemCode: "CHIPS-CL", itemDescription: "Lay's Classic 2.75oz", itemCost: 0.58, itemPrice: 2.19 },
    { itemCode: "COOKIE-CH", itemDescription: "Chocolate Cookie", itemCost: 0.36, itemPrice: 1.49 },
    { itemCode: "CANDY-MX", itemDescription: "Mixed Candy", itemCost: 0.42, itemPrice: 1.79 }
  ],
  Tobacco: [
    { itemCode: "MARL-RED", itemDescription: "Marlboro Red Pack", itemCost: 7.1, itemPrice: 10.49 },
    { itemCode: "VAPE-MNT", itemDescription: "Mint Vape Pod", itemCost: 4.8, itemPrice: 8.99 }
  ],
  Dairy: [
    { itemCode: "MILK-1G", itemDescription: "Whole Milk 1 Gallon", itemCost: 2.45, itemPrice: 4.29 },
    { itemCode: "YOG-PAR", itemDescription: "Greek Yogurt Parfait", itemCost: 1.15, itemPrice: 2.99 }
  ],
  Frozen: [
    { itemCode: "PIZZA-SL", itemDescription: "Pizza Slice", itemCost: 1.2, itemPrice: 3.49 },
    { itemCode: "ICE-CRM", itemDescription: "Ice Cream Bar", itemCost: 0.95, itemPrice: 2.49 }
  ],
  Other: [
    { itemCode: "HOTDOG-RG", itemDescription: "Roller Grill Hot Dog", itemCost: 0.88, itemPrice: 2.79 },
    { itemCode: "SAND-HAM", itemDescription: "Ham Sandwich", itemCost: 2.2, itemPrice: 5.99 },
    { itemCode: "LIGHTER", itemDescription: "Pocket Lighter", itemCost: 0.65, itemPrice: 1.99 }
  ]
};

const HOUR_TRAFFIC = {
  6: 7, 7: 12, 8: 18, 9: 16, 10: 13, 11: 15,
  12: 20, 13: 17, 14: 15, 15: 12, 16: 14, 17: 18,
  18: 21, 19: 16, 20: 11, 21: 8
};

function hashSeed(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickOne(items, seed) {
  return items[seed % items.length];
}

function categoryWeightsByHour(hour) {
  if (hour >= 6 && hour <= 10) {
    return ["Beverages", "Snacks", "Other", "Dairy", "Tobacco", "Frozen"];
  }
  if (hour >= 11 && hour <= 14) {
    return ["Other", "Beverages", "Snacks", "Dairy", "Frozen", "Tobacco"];
  }
  if (hour >= 15 && hour <= 18) {
    return ["Beverages", "Snacks", "Tobacco", "Other", "Frozen", "Dairy"];
  }
  return ["Beverages", "Tobacco", "Snacks", "Other", "Frozen", "Dairy"];
}

function pickCategory(hour, seed) {
  const weighted = categoryWeightsByHour(hour);
  const slots = [
    weighted[0], weighted[0], weighted[0],
    weighted[1], weighted[1],
    weighted[2], weighted[2],
    weighted[3],
    weighted[4],
    weighted[5]
  ];
  return slots[seed % slots.length];
}

function toIsoAtSecond(baseDate, hour, minute, second) {
  const date = new Date(Date.UTC(
    baseDate.getUTCFullYear(),
    baseDate.getUTCMonth(),
    baseDate.getUTCDate(),
    hour,
    minute,
    second,
    0
  ));
  return date.toISOString();
}

function cashierForSeed(seed) {
  const names = ["Alex", "Casey", "Jordan", "Morgan", "Taylor", "Riley", "Avery", "Parker"];
  const id = 100 + (seed % names.length);
  return {
    id,
    name: names[seed % names.length]
  };
}

function generateMockTransactions(options = {}) {
  const days = Number(options.days || 10);
  const seedPrefix = String(options.seed || "pos-demo-v2");
  const anchorDate = new Date(options.anchorDate || "2026-05-01T00:00:00.000Z");
  const transactions = [];

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset -= 1) {
    const dayDate = new Date(anchorDate);
    dayDate.setUTCDate(anchorDate.getUTCDate() - dayOffset);
    const weekday = dayDate.getUTCDay();
    const weekendBoost = weekday === 5 || weekday === 6 ? 1.2 : 1;

    for (let hour = 6; hour <= 21; hour += 1) {
      const base = HOUR_TRAFFIC[hour] || 6;
      const targetTransactions = Math.max(3, Math.round(base * weekendBoost));

      for (let tx = 0; tx < targetTransactions; tx += 1) {
        const txSeed = hashSeed(`${seedPrefix}-${dayOffset}-${hour}-${tx}`);
        const basketSize = 1 + (txSeed % 3);
        const minute = (txSeed >>> 3) % 60;
        const second = (txSeed >>> 9) % 60;
        const items = [];

        for (let idx = 0; idx < basketSize; idx += 1) {
          const itemSeed = hashSeed(`${seedPrefix}-${dayOffset}-${hour}-${tx}-${idx}`);
          const category = pickCategory(hour, itemSeed);
          const catalog = CATEGORY_CATALOG[category];
          const picked = pickOne(catalog, itemSeed >>> 5);
          const quantity = 1 + ((itemSeed >>> 11) % (category === "Beverages" ? 3 : 2));
          items.push({
            itemCode: picked.itemCode,
            category,
            itemDescription: picked.itemDescription,
            quantity,
            itemCost: picked.itemCost,
            itemPrice: picked.itemPrice
          });
        }

        transactions.push({
          transactionTime: toIsoAtSecond(dayDate, hour, minute, second),
          sourceFileId: `mock-${dayDate.toISOString().slice(0, 10)}`,
          cashier: cashierForSeed(txSeed >>> 4),
          items
        });
      }
    }
  }

  transactions.sort((a, b) => a.transactionTime.localeCompare(b.transactionTime));
  return transactions;
}

module.exports = {
  generateMockTransactions
};
