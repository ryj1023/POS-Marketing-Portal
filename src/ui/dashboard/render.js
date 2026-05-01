function renderDashboardView(model) {
  const now = new Date().toISOString();
  const panelState = model.panelState || {};
  return {
    kpi_cards: model.kpis,
    trend_views: model.trends,
    best_selling_items: model.bestSellers || [],
    category_breakdown: model.categories,
    recent_transactions: model.recentTransactions || [],
    recommendation_panel: model.recommendations,
    filters: model.filters || null,
    data_as_of: model.dataAsOf || now,
    last_refresh_at: model.lastRefreshAt || model.dataAsOf || now,
    panel_states: {
      loading: Boolean(panelState.loading),
      error: panelState.error || null,
      empty: Boolean(panelState.empty),
      insufficient_data: Boolean(panelState.insufficientData),
      ready: Boolean(panelState.ready)
    }
  };
}

module.exports = {
  renderDashboardView
};
