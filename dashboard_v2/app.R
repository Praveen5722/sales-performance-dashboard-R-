library(shiny)
library(shinydashboard)
library(ggplot2)
library(dplyr)
library(lubridate)
library(scales)
library(DT)

# Redesigned dashboard inspired by the layout approach of DV_Dashboard.
# Uses the project's own sales dataset and original styling.

find_sample_data <- function() {
  candidates <- c("sample_sales.csv", "../sample_sales.csv")
  found <- candidates[file.exists(candidates)]
  if (length(found)) found[1] else NULL
}

ui <- dashboardPage(
  skin = "blue",
  dashboardHeader(title = span("SALES", span(" INSIGHTS", class = "brand-accent"))),
  dashboardSidebar(
    width = 245,
    sidebarMenu(
      menuItem("Overview", tabName = "overview", icon = icon("chart-pie")),
      menuItem("Sales Analysis", tabName = "sales", icon = icon("chart-line")),
      menuItem("Products", tabName = "products", icon = icon("box")),
      menuItem("Data Explorer", tabName = "data", icon = icon("table"))
    ),
    div(class = "sidebar-heading", "DASHBOARD FILTERS"),
    fileInput("upload", "Upload sales CSV", accept = ".csv"),
    dateRangeInput("dates", "Order date range", start = NA, end = NA),
    selectInput("region", "Region", choices = "All"),
    selectInput("category", "Category", choices = "All"),
    selectInput("segment", "Customer segment", choices = "All"),
    div(class = "sidebar-note", "Use the filters to update all charts and summary metrics.")
  ),
  dashboardBody(
    tags$head(tags$link(rel = "stylesheet", type = "text/css", href = "styles.css")),
    tabItems(
      tabItem(tabName = "overview",
        fluidRow(
          valueBoxOutput("sales_box", width = 3),
          valueBoxOutput("profit_box", width = 3),
          valueBoxOutput("records_box", width = 3),
          valueBoxOutput("margin_box", width = 3)
        ),
        fluidRow(
          box(title = "Sales over time", status = "primary", solidHeader = TRUE,
              width = 8, plotOutput("trend", height = 280)),
          box(title = "Sales by category", status = "primary", solidHeader = TRUE,
              width = 4, plotOutput("category", height = 280))
        ),
        fluidRow(
          box(title = "Sales by region", status = "primary", solidHeader = TRUE,
              width = 6, plotOutput("region", height = 280)),
          box(title = "Sales and profit comparison", status = "primary", solidHeader = TRUE,
              width = 6, plotOutput("region_metrics", height = 280))
        )
      ),
      tabItem(tabName = "sales",
        fluidRow(
          box(title = "Monthly performance", status = "primary", solidHeader = TRUE,
              width = 12, plotOutput("monthly", height = 380))
        ),
        fluidRow(
          box(title = "Sales vs profit", status = "primary", solidHeader = TRUE,
              width = 12, plotOutput("scatter", height = 350))
        )
      ),
      tabItem(tabName = "products",
        fluidRow(
          box(title = "Top 10 products by sales", status = "primary", solidHeader = TRUE,
              width = 8, plotOutput("top_products", height = 430)),
          box(title = "Category contribution", status = "primary", solidHeader = TRUE,
              width = 4, plotOutput("category_share", height = 430))
        )
      ),
      tabItem(tabName = "data",
        fluidRow(
          box(title = "Filtered sales records", status = "primary", solidHeader = TRUE,
              width = 12, DTOutput("table"),
              br(), downloadButton("download", "Download filtered CSV", class = "btn-primary"))
        )
      )
    )
  )
)

server <- function(input, output, session) {
  data_raw <- reactive({
    if (!is.null(input$upload)) {
      df <- read.csv(input$upload$datapath, stringsAsFactors = FALSE)
    } else {
      sample_path <- find_sample_data()
      validate(need(!is.null(sample_path),
        "Could not find sample_sales.csv. Run the app from the repository or upload a CSV."))
      df <- read.csv(sample_path, stringsAsFactors = FALSE)
    }

    required <- c("OrderDate", "Region", "Category", "Product", "Segment", "Sales", "Profit", "Quantity")
    missing <- setdiff(required, names(df))
    validate(need(length(missing) == 0,
      paste("Missing required columns:", paste(missing, collapse = ", "))))
    df$OrderDate <- as.Date(df$OrderDate)
    for (nm in c("Sales", "Profit", "Quantity")) df[[nm]] <- as.numeric(df[[nm]])
    df %>% filter(!is.na(OrderDate), !is.na(Sales), !is.na(Profit))
  })

  observeEvent(data_raw(), {
    df <- data_raw()
    updateDateRangeInput(session, "dates",
      start = min(df$OrderDate, na.rm = TRUE), end = max(df$OrderDate, na.rm = TRUE),
      min = min(df$OrderDate, na.rm = TRUE), max = max(df$OrderDate, na.rm = TRUE))
    updateSelectInput(session, "region", choices = c("All", sort(unique(df$Region))), selected = "All")
    updateSelectInput(session, "category", choices = c("All", sort(unique(df$Category))), selected = "All")
    updateSelectInput(session, "segment", choices = c("All", sort(unique(df$Segment))), selected = "All")
  })

  dat <- reactive({
    df <- data_raw()
    if (!is.null(input$dates) && length(input$dates) == 2 && all(!is.na(input$dates)))
      df <- df %>% filter(OrderDate >= input$dates[1], OrderDate <= input$dates[2])
    if (!is.null(input$region) && input$region != "All") df <- df %>% filter(Region == input$region)
    if (!is.null(input$category) && input$category != "All") df <- df %>% filter(Category == input$category)
    if (!is.null(input$segment) && input$segment != "All") df <- df %>% filter(Segment == input$segment)
    df
  })

  output$sales_box <- renderValueBox({
    valueBox(dollar(sum(dat()$Sales, na.rm = TRUE), accuracy = 1),
      "Total sales", icon = icon("dollar-sign"), color = "aqua")
  })
  output$profit_box <- renderValueBox({
    valueBox(dollar(sum(dat()$Profit, na.rm = TRUE), accuracy = 1),
      "Total profit", icon = icon("chart-line"), color = "green")
  })
  output$records_box <- renderValueBox({
    valueBox(format(nrow(dat()), big.mark = ","), "Sales records",
      icon = icon("receipt"), color = "purple")
  })
  output$margin_box <- renderValueBox({
    df <- dat(); s <- sum(df$Sales, na.rm = TRUE)
    m <- if (s == 0) 0 else sum(df$Profit, na.rm = TRUE) / s
    valueBox(percent(m, accuracy = 0.1), "Profit margin",
      icon = icon("percent"), color = "yellow")
  })

  output$trend <- renderPlot({
    df <- dat() %>% mutate(Month = floor_date(OrderDate, "month")) %>%
      group_by(Month) %>% summarise(Sales = sum(Sales), .groups = "drop")
    ggplot(df, aes(Month, Sales)) + geom_area(fill = "#dceeff", alpha = .9) +
      geom_line(color = "#1777b8", linewidth = 1.2) +
      geom_point(color = "#1777b8", size = 2.5) +
      scale_y_continuous(labels = label_dollar()) +
      labs(x = NULL, y = NULL) + theme_minimal(base_size = 12) +
      theme(panel.grid.minor = element_blank())
  })

  output$category <- renderPlot({
    df <- dat() %>% group_by(Category) %>% summarise(Sales = sum(Sales), .groups = "drop")
    ggplot(df, aes(reorder(Category, Sales), Sales, fill = Category)) +
      geom_col(show.legend = FALSE, width = .72) + coord_flip() +
      scale_y_continuous(labels = label_dollar()) +
      labs(x = NULL, y = NULL) + theme_minimal(base_size = 11)
  })

  output$region <- renderPlot({
    df <- dat() %>% group_by(Region) %>% summarise(Sales = sum(Sales), .groups = "drop")
    ggplot(df, aes(reorder(Region, Sales), Sales)) +
      geom_col(fill = "#1777b8", width = .68) + coord_flip() +
      scale_y_continuous(labels = label_dollar()) +
      labs(x = NULL, y = NULL) + theme_minimal(base_size = 12)
  })

  output$region_metrics <- renderPlot({
    df <- dat() %>% group_by(Region) %>%
      summarise(Sales = sum(Sales), Profit = sum(Profit), .groups = "drop") %>%
      tidyr::pivot_longer(c(Sales, Profit), names_to = "Metric", values_to = "Amount")
    ggplot(df, aes(Region, Amount, fill = Metric)) +
      geom_col(position = "dodge", width = .7) +
      scale_fill_manual(values = c(Sales = "#1777b8", Profit = "#2da889")) +
      scale_y_continuous(labels = label_dollar()) +
      labs(x = NULL, y = NULL, fill = NULL) + theme_minimal(base_size = 12)
  })

  output$monthly <- renderPlot({
    df <- dat() %>% mutate(Month = floor_date(OrderDate, "month")) %>%
      group_by(Month) %>% summarise(Sales = sum(Sales), Profit = sum(Profit), .groups = "drop") %>%
      tidyr::pivot_longer(c(Sales, Profit), names_to = "Metric", values_to = "Amount")
    ggplot(df, aes(Month, Amount, color = Metric)) +
      geom_line(linewidth = 1.2) + geom_point(size = 2) +
      scale_color_manual(values = c(Sales = "#1777b8", Profit = "#2da889")) +
      scale_y_continuous(labels = label_dollar()) +
      labs(x = NULL, y = NULL, color = NULL) + theme_minimal(base_size = 12)
  })

  output$scatter <- renderPlot({
    ggplot(dat(), aes(Sales, Profit, color = Category)) +
      geom_hline(yintercept = 0, linetype = "dashed", color = "grey65") +
      geom_point(alpha = .8, size = 3) +
      scale_x_continuous(labels = label_dollar()) +
      scale_y_continuous(labels = label_dollar()) +
      labs(x = "Sales", y = "Profit", color = "Category") +
      theme_minimal(base_size = 12)
  })

  output$top_products <- renderPlot({
    df <- dat() %>% group_by(Product) %>% summarise(Sales = sum(Sales), .groups = "drop") %>%
      slice_max(Sales, n = 10, with_ties = FALSE)
    ggplot(df, aes(reorder(Product, Sales), Sales)) +
      geom_col(fill = "#1777b8", width = .72) + coord_flip() +
      scale_y_continuous(labels = label_dollar()) +
      labs(x = NULL, y = "Sales") + theme_minimal(base_size = 12)
  })

  output$category_share <- renderPlot({
    df <- dat() %>% group_by(Category) %>% summarise(Sales = sum(Sales), .groups = "drop")
    ggplot(df, aes(x = 2, y = Sales, fill = Category)) +
      geom_col(width = 1, color = "white") + coord_polar(theta = "y") +
      xlim(.5, 2.5) + theme_void() + labs(fill = NULL)
  })

  output$table <- renderDT({
    datatable(dat(), options = list(pageLength = 10, scrollX = TRUE),
      rownames = FALSE, filter = "top")
  })

  output$download <- downloadHandler(
    filename = function() paste0("sales_filtered_", Sys.Date(), ".csv"),
    content = function(file) write.csv(dat(), file, row.names = FALSE)
  )
}

shinyApp(ui, server)
