# Sales Performance Dashboard using Graphical Analysis in R

An interactive sales analytics dashboard built with **R Shiny**, **ggplot2**, and **dplyr**.

## Features
- KPI cards for total sales, total profit, record count, and profit margin
- Filters for order date, region, category, and customer segment
- Monthly sales trend line chart
- Category-wise and region-wise sales charts
- Regional sales vs. profit comparison
- Top 10 products by sales
- Sales vs. profit scatter plot
- Summary table and CSV export
- Upload your own CSV file

## Requirements
Install R and optionally RStudio. Install required packages:

```r
install.packages(c("shiny", "ggplot2", "dplyr", "lubridate", "scales", "tidyr"))
```

## Run the app
1. Download or clone this repository.
2. Open RStudio and set the working directory to this project folder.
3. Run:

```r
shiny::runApp()
```

## CSV format
CSV files should include these columns:

`OrderDate, Region, Category, Product, Segment, Sales, Profit, Quantity`

- `OrderDate`: date in `YYYY-MM-DD` format
- `Sales`, `Profit`, `Quantity`: numeric values
- Other columns: text labels

The included sample data is synthetic and intended for demonstration.
