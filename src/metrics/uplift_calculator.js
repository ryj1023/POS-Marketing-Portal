function calculatePromoUplift(params) {
  const baselineRevenue = params.baselineRevenue;
  const comparisonRevenue = params.comparisonRevenue;
  const recommendations = params.recommendations || [];
  const actions = params.actions || new Map();
  const includeOnlyAccepted = params.includeOnlyAccepted ?? true;

  const eligibleItems = recommendations.filter((item) => {
    if (!includeOnlyAccepted) {
      return true;
    }
    const action = actions.get(item.itemCode);
    return action && action.actionType === "accept";
  });

  if (baselineRevenue <= 0) {
    return {
      upliftPercent: 0,
      eligibleItemsCount: eligibleItems.length
    };
  }

  const upliftPercent = ((comparisonRevenue - baselineRevenue) / baselineRevenue) * 100;
  return {
    upliftPercent: Number(upliftPercent.toFixed(2)),
    eligibleItemsCount: eligibleItems.length
  };
}

module.exports = {
  calculatePromoUplift
};
