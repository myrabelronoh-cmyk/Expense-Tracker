# Expense Tracker

A lightweight browser app for recording expenses in different currencies and viewing them together in a chosen home currency. It is designed to make day-to-day spending easier to understand, especially when traveling across countries.

## Why It Helps Travelers

Travelers often pay in unfamiliar currencies, while their budgets and income are measured in a home currency. Mental conversion can make prices difficult to compare and can hide how quickly small purchases accumulate. This tracker lets you record an amount in the currency you paid, then converts expenses and category-filtered totals into your selected home currency using live exchange rates.

That clearer view can help travelers:

- Compare purchases across destinations without doing conversions by hand
- Keep track of spending by category, such as food, transport, or shopping
- Notice how exchange-rate movements affect the home-currency cost of a trip
- Make more informed choices when working within a travel budget

### Example

If your home currency is USD and you record a meal costing KES 1,300, the app keeps the original KES amount visible and shows an approximate USD amount beside it using the latest rate it loaded. The running total updates in USD as well. The exact converted amount changes with exchange rates; in a browser check, KES 1,300 displayed as about $10.02.

Currency conversion does not remove exchange-rate volatility, inflation, bank fees, or differences in local prices. The app supports better awareness of those costs; it cannot control them or replace official rates shown by a bank, card provider, or merchant.

## Features

- Record an expense description, amount, currency, and category
- Convert between USD, EUR, GBP, KES, JPY, CAD, and AUD
- Select a home currency and view the filtered running total in that currency
- Filter expenses by category
- Load exchange rates from the public Open ER API endpoint
- Show loading and error states, with an option to retry rate loading
- Escape expense descriptions before rendering them in the page

## Run Locally

The app uses browser ES modules, so serve the project from a local web server instead of opening the HTML file directly. With Python installed, run this from the project root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Tests

The project uses Node.js's built-in test runner and requires no test dependencies:

```bash
npm test
```

## Project Structure

```text
index.html          App page
styles.css          Responsive page styling
src/api.js          Exchange-rate API request
src/main.js         Browser event handling and application flow
src/state.js        Expense and app-state updates
src/ui.js           DOM rendering and form controls
src/utilis.js       Currency, totals, filtering, and formatting helpers
tests/              Utility and state tests
```

## Current Limitations

- Expenses are held in memory and are cleared when the page is reloaded.
- Live rate retrieval requires an internet connection.
- Rates are informational and may differ from the final rate or fees applied by a bank, card network, or cash exchange provider.
- The app does not provide historical rates, trip budgets, or financial advice.
