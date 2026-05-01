class RecommendationActionStore {
  constructor() {
    this.actionsByDate = new Map();
  }

  setAction(businessDate, itemCode, actionType) {
    if (!["accept", "reject", "defer"].includes(actionType)) {
      throw new Error("Invalid action type");
    }

    const actions = this.actionsByDate.get(businessDate) || new Map();
    actions.set(itemCode, {
      actionType,
      actionedAt: new Date().toISOString()
    });
    this.actionsByDate.set(businessDate, actions);
  }

  getActionsForDate(businessDate) {
    return this.actionsByDate.get(businessDate) || new Map();
  }
}

module.exports = {
  RecommendationActionStore
};
