# Pos log analyzer

We want to create a pos log analyzer dashboard. We want to consume a simple json model for the transaction logs.

## Features

The dashboard should show item sales over time (both day and weekly). There should be multiple different ways of viewing the data in both charts and tables. We also want to view data based on category as well.

We want to incorporate item margins in the display and suggest when to run promotions.

We may want to incorporate LLM into the product if time allows.

## Transaction log model

each transaction should look something like:

```
{
  transactionTime: "2026-04-30T13:30:45.00Z",
  cashier: {
    name: "Bob Wilson",
    id: 1234
  },
  items: [
    { itemCode: "12334", category: "Beverages", itemDescription: "Mtn Dew 20z", quantity: 2, itemCost: 0.75, itemPrice: 2.35 },
    { itemCode: "78965", category: "Chips", itemDescription: "Lays", quantity: 1, itemCost: 0.35, itemPrice: 1.00 }
  ]
}
```

## Initial designs

The initial design mockups are images is in the `docs/mockups` folder

## Initial planned features

- KPI strip — revenue, transaction count, average basket, and units sold, each with a day-over-day delta so the shift manager sees health at a glance.
- Best selling items — horizontal bar chart ranked by units, making it easy to spot what needs restocking and what drives volume.
- Category breakdown (donut) — beverages and snacks dominate, with tobacco as a high-margin third. Useful for planogram and shelf-space decisions.
- Hourly quantity sold — the line chart reveals your two rush windows (8 AM and noon), which feeds directly into staffing and hot food prep timing.
- Rule-based promotion suggestions — three to five deterministic promos with estimated daily revenue lift. Each is grounded in margin and volume rules plus documented exclusions.
- Recent transactions panel — receipts from the most recent processed batch with a visible `data as of` timestamp.
