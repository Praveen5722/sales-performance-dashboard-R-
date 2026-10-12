# Sales Performance Dashboard — React + CSV + INR

A responsive, dark-mode sales analytics dashboard built with **React, Vite, Recharts, and Lucide icons**. The existing React app has been upgraded with a dark executive UI and date-range filters while keeping the R Shiny app untouched. Upload a CSV file to generate charts, financial KPIs, product summaries, and an exportable report. All monetary values are displayed in **Indian Rupees (₹ / INR)**.

## Features

- **Upload your own CSV:** reads CSV files locally in your browser; no file is sent to a backend by this demo.
- **Automatic column detection:** guesses columns for sales/revenue, profit, date, category, region/state, product/item, and quantity.
- **Editable column mapping:** correct the detected fields when your CSV uses different column names.
- **INR financial formatting:** totals use Indian number grouping and ₹, with lakh (L) and crore (Cr) labels on charts.
- **Live analytics:** total sales, profit, profit margin, transaction count, product count, monthly trends, region breakdown, category chart, and top products.
- **Filters and search:** filter by date range, region, and category, and search products/items. All KPIs and charts recalculate immediately.
- **CSV export:** download filtered report rows as `sales-report-INR.csv`.
- **Dark modern UI:** midnight navy surfaces, violet accents, responsive panels, and readable charts.
- **Responsive layout:** desktop, tablet, and mobile friendly.
- **Privacy-minded demo:** CSV parsing and analysis happen in the browser; there is no upload API.

## Expected CSV format

Your column names can be different; use the mapping panel after uploading. The app tries to detect common variants.

| Field | Required? | Example column names |
|---|---|---|
| Sales / revenue | Yes for financial totals | `Sales`, `Revenue`, `Amount`, `Total`, `Turnover` |
| Profit | Optional | `Profit`, `Net Income`, `Margin Amount` |
| Date | Optional | `Order Date`, `Date`, `Invoice Date`, `Transaction Date` |
| Category | Optional | `Category`, `Product Group`, `Type` |
| Region | Optional | `Region`, `State`, `Territory`, `Zone`, `City` |
| Product / item | Optional | `Product Name`, `Product`, `Item`, `Description`, `SKU` |
| Quantity | Optional | `Quantity`, `Qty`, `Units`, `Units Sold` |

- Use a CSV with a header row.
- Comma-separated values are supported, including quoted values with commas.
- Amounts such as `12500`, `₹12,500` (when correctly quoted), and `12,500` are interpreted as numeric amounts.
- The dashboard **formats amounts as INR**; it does not convert foreign currencies. If your source file is in USD or another currency, convert it to INR before importing if you want the values to be financially accurate.
- If the profit column is absent, profit is shown as ₹0; the app does not invent profit estimates.
- Without a date field, the trend chart groups rows into batches instead of actual calendar months.

## Run locally

Requires Node.js 18 or later.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Deploy on Vercel

1. Open [Vercel](https://vercel.com/new) and sign in with GitHub.
2. Import this repository.
3. Set **Root Directory** to `react-dashboard`.
4. Use build command `npm run build` and output directory `dist` (Vite framework preset).
5. Click **Deploy** and open the generated `.vercel.app` URL.

See the [official Vite on Vercel guide](https://vercel.com/docs/frameworks/frontend/vite).

## Folder structure

```text
react-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```

## Notes

This frontend is independent of the R Shiny app and currently performs CSV analysis in the browser. It is a dashboard/reporting prototype, not a financial accounting system. Validate your CSV and currency before relying on the totals.
