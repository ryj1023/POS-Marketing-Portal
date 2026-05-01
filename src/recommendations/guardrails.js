function applyGuardrails(candidates, options = {}) {
  const marginFloor = options.marginFloor ?? 0.2;
  const minTransactions = options.minTransactions ?? 3;

  const allowed = [];
  const excluded = [];

  candidates.forEach((candidate) => {
    const reasons = [];
    if (candidate.marginRate < marginFloor) {
      reasons.push(`Below margin floor (${(marginFloor * 100).toFixed(0)}%)`);
    }
    if (candidate.transactionCount < minTransactions) {
      reasons.push(`Sparse data (< ${minTransactions} transactions)`);
    }

    if (reasons.length > 0) {
      excluded.push({
        ...candidate,
        exclusionReasons: reasons
      });
    } else {
      allowed.push(candidate);
    }
  });

  return { allowed, excluded };
}

module.exports = {
  applyGuardrails
};
