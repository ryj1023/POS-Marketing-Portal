function renderDashboardView(model) {
  const now = new Date().toISOString();
  const panelState = model.panelState || {};
  return {
    kpiCards: model.kpis,
    trendViews: model.trends,
    categoryBreakdown: model.categories,
    recentTransactions: model.recentTransactions || [],
    recommendationPanel: model.recommendations,
    filters: model.filters || null,
    dataAsOf: model.dataAsOf || now,
    lastRefreshAt: model.lastRefreshAt || model.dataAsOf || now,
    states: {
      loading: panelState.loading || false,
      error: panelState.error || null,
      empty: panelState.empty || model.kpis.length === 0,
      insufficientData: panelState.insufficientData || false
    }
  };
}

module.exports = {
  renderDashboardView
};
