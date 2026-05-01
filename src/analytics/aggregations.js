function toDayKey(isoTime) {
  return isoTime.slice(0, 10);
}

function toWeekKey(isoTime) {
  const date = new Date(isoTime);
  const day = date.getUTCDay() || 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

function incrementBucket(map, key, item) {
  const bucket = map.get(key) || { units: 0, revenue: 0, grossMargin: 0 };
  bucket.units += item.quantity;
  bucket.revenue += item.quantity * item.itemPrice;
  bucket.grossMargin += item.quantity * (item.itemPrice - item.itemCost);
  map.set(key, bucket);
}

function aggregateTransactions(transactions) {
  const dailyByItem = new Map();
  const weeklyByItem = new Map();
  const dailyByCategory = new Map();
  const weeklyByCategory = new Map();

  transactions.forEach((transaction) => {
    const day = toDayKey(transaction.transactionTime);
    const week = toWeekKey(transaction.transactionTime);

    transaction.items.forEach((item) => {
      incrementBucket(dailyByItem, `${day}|${item.itemCode}`, item);
      incrementBucket(weeklyByItem, `${week}|${item.itemCode}`, item);
      incrementBucket(dailyByCategory, `${day}|${item.category}`, item);
      incrementBucket(weeklyByCategory, `${week}|${item.category}`, item);
    });
  });

  return {
    dailyByItem,
    weeklyByItem,
    dailyByCategory,
    weeklyByCategory
  };
}

module.exports = {
  aggregateTransactions,
  toDayKey,
  toWeekKey
};
