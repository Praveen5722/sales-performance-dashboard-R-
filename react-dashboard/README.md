# Sales Performance Dashboard — React Frontend

A modern, responsive sales analytics dashboard built with **React, Vite, Recharts, and Lucide icons**. This frontend is designed as a polished web UI companion to the R Shiny sales analytics project.

## Preview

The interface includes a dark workspace sidebar, KPI cards, revenue/profit trends, region distribution, category analysis, and a searchable product table.

## Features

- Responsive desktop, tablet, and mobile layout
- Revenue and net profit charts
- KPI cards with trend indicators
- Region and product category filters
- Product search
- Date-period selector
- Export chart data to CSV
- Vercel-ready Vite configuration

> **Demo data:** This version uses sample values defined in `src/App.jsx`. It is a frontend prototype and is not connected to the R Shiny app or a live database.

## Run locally

Requires Node.js 18 or later.

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Production build

```bash
npm run build
npm run preview
```

## Deploy on Vercel

1. Open [Vercel](https://vercel.com/) and sign in with GitHub.
2. Select **Add New → Project** and import this repository.
3. Set **Root Directory** to `react-dashboard`.
4. Vercel should detect Vite automatically. Use build command `npm run build` and output directory `dist`.
5. Click **Deploy**. The generated `.vercel.app` URL will be shown when deployment completes.

The `vercel.json` file includes a single-page-app rewrite. Official guide: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

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
