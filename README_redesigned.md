# Sales Performance Dashboard using Graphical Analysis in R

This project includes the original dashboard and a redesigned, multi-page Shiny dashboard inspired by the layout and navigation approach of [Marcin59/DV_Dashboard](https://github.com/Marcin59/DV_Dashboard). The implementation and styling here are original and use the sales dataset included in this repository.

## Redesigned version

The new dashboard lives in `dashboard_v2/` and includes:
- Dark navy sidebar with navigation tabs and filters
- KPI cards for sales, profit, record count, and profit margin
- Monthly sales trend and sales/profit comparisons
- Category, region, and top-product analysis
- Sales vs. profit scatter plot
- Filterable data table and CSV download
- CSV upload for compatible datasets

## Requirements

Install R, then run:

```r
install.packages(c(
  "shiny", "shinydashboard", "ggplot2", "dplyr",
  "lubridate", "scales", "DT", "tidyr"
))
```

## Run the redesigned dashboard

From the repository root in RStudio:

```r
shiny::runApp("dashboard_v2")
```

Or set your working directory to `dashboard_v2` and run `shiny::runApp()`.

## CSV columns

Uploaded CSV files should contain: `OrderDate, Region, Category, Product, Segment, Sales, Profit, Quantity`.

The included sample data is synthetic and for demonstration only.
