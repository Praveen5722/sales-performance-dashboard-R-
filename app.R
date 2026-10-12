library(shiny)
library(ggplot2)
library(dplyr)
library(lubridate)
library(scales)
library(tidyr)

# Sales Performance Dashboard using Graphical Analysis in R
# Run with: shiny::runApp()

sample_path <- file.path(getwd(), "sample_sales.csv")

ui <- fluidPage(
  titlePanel("Sales Performance Dashboard"),
  sidebarLayout(
    sidebarPanel(
      helpText("Explore sales, profit, products, categories, and regions."),
      fileInput("file", "Upload sales CSV (optional)", accept = ".csv"),
      uiOutput("date_ui"),
      selectInput("region", "Region", choices = "All"),
      selectInput("category", "Category", choices = "All"),
      selectInput("segment", "Customer Segment", choices = "All"),
      helpText("Required columns: OrderDate, Region, Category, Product, Segment, Sales, Profit, Quantity")
    ),
    mainPanel(
      fluidRow(
        column(3, wellPanel(h4("Total Sales"), textOutput("total_sales"))),
        column(3, wellPanel(h4("Total Profit"), textOutput("total_profit"))),
        column(3, wellPanel(h4("Records"), textOutput("total_orders"))),
        column(3, wellPanel(h4("Profit Margin"), textOutput("profit_margin")))
      ),
      tabsetPanel(
        tabPanel("Overview", br(), h4("Monthly Sales Trend"),
                 plotOutput("monthly_plot", height = 300),
                 h4("Sales by Category"), plotOutput("category_plot", height = 300)),
        tabPanel("Regional Analysis", br(), plotOutput("region_plot", height = 350),
                 h4("Sales and Profit by Region"), plotOutput("region_profit_plot", height = 300)),
        tabPanel("Products", br(), h4("Top 10 Products by Sales"),
                 plotOutput("product_plot", height = 400), h4("Sales vs. Profit"),
                 plotOutput("scatter_plot", height = 350)),
        tabPanel("Data", br(), tableOutput("summary_table"), br(),
                 downloadButton("download_filtered", "Download filtered data"))
      )
    )
  )
)

server <- function(input, output, session) {
  raw_data <- reactive({
    df <- if (!is.null(input$file)) {
      read.csv(input$file$datapath, stringsAsFactors = FALSE)
    } else if (file.exists(sample_path)) {
      read.csv(sample_path, stringsAsFactors = FALSE)
    } else {
      validate(need(FALSE, "sample_sales.csv was not found. Set the working directory to the project folder or upload a CSV."))
    }
    required <- c("OrderDate", "Region", "Category", "Product", "Segment", "Sales", "Profit", "Quantity")
    missing_cols <- setdiff(required, names(df))
    validate(need(length(missing_cols) == 0,
                  paste("Missing required columns:", paste(missing_cols, collapse = ", "))))
    df$OrderDate <- as.Date(df$OrderDate)
    df$Sales <- as.numeric(df$Sales)
    df$Profit <- as.numeric(df$Profit)
    df$Quantity <- as.numeric(df$Quantity)
    df <- df %>% filter(!is.na(OrderDate), !is.na(Sales), !is.na(Profit))
    df
  })

  output$date_ui <- renderUI({
    df <- raw_data()
    dateRangeInput("dates", "Order date range",
      start = min(df$OrderDate, na.rm = TRUE), end = max(df$OrderDate, na.rm = TRUE),
      min = min(df$OrderDate, na.rm = TRUE), max = max(df$OrderDate, na.rm = TRUE))
  })

  observeEvent(raw_data(), {
    df <- raw_data()
    updateSelectInput(session, "region", choices = c("All", sort(unique(df$Region))), selected = "All")
    updateSelectInput(session, "category", choices = c("All", sort(unique(df$Category))), selected = "All")
    updateSelectInput(session, "segment", choices = c("All", sort(unique(df$Segment))), selected = "All")
  })

  filtered_data <- reactive({
    df <- raw_data()
    if (!is.null(input$dates) && length(input$dates) == 2)
      df <- df %>% filter(OrderDate >= input$dates[1], OrderDate <= input$dates[2])
    if (!is.null(input$region) && input$region != "All") df <- df %>% filter(Region == input$region)
    if (!is.null(input$category) && input$category != "All") df <- df %>% filter(Category == input$category)
    if (!is.null(input$segment) && input$segment != "All") df <- df %>% filter(Segment == input$segment)
    df
  })

  output$total_sales <- renderText(dollar(sum(filtered_data()$Sales, na.rm = TRUE), accuracy = 1))
  output$total_profit <- renderText(dollar(sum(filtered_data()$Profit, na.rm = TRUE), accuracy = 1))
  output$total_orders <- renderText(format(nrow(filtered_data()), big.mark = ","))
  output$profit_margin <- renderText({
    df <- filtered_data()
    sales <- sum(df$Sales, na.rm = TRUE)
    if (sales == 0) "0%" else percent(sum(df$Profit, na.rm = TRUE) / sales, accuracy = 0.1)
  })

  output$monthly_plot <- renderPlot({
    df <- filtered_data() %>% mutate(Month = floor_date(OrderDate, "month")) %>%
      group_by(Month) %>% summarise(Sales = sum(Sales, na.rm = TRUE), .groups = "drop")
    ggplot(df, aes(Month, Sales)) + geom_line(color = "#1769aa", linewidth = 1) +
      geom_point(color = "#1769aa", size = 2) + scale_y_continuous(labels = label_dollar()) +
      labs(x = "Month", y = "Sales", title = "Sales over time") + theme_minimal(base_size = 12)
  })

  output$category_plot <- renderPlot({
    df <- filtered_data() %>% group_by(Category) %>% summarise(Sales = sum(Sales, na.rm = TRUE), .groups = "drop")
    ggplot(df, aes(reorder(Category, Sales), Sales, fill = Category)) + geom_col(show.legend = FALSE) +
      coord_flip() + scale_y_continuous(labels = label_dollar()) +
      labs(x = "Category", y = "Sales") + theme_minimal(base_size = 12)
  })

  output$region_plot <- renderPlot({
    df <- filtered_data() %>% group_by(Region) %>% summarise(Sales = sum(Sales, na.rm = TRUE), .groups = "drop")
    ggplot(df, aes(reorder(Region, Sales), Sales, fill = Region)) + geom_col(show.legend = FALSE) +
      coord_flip() + scale_y_continuous(labels = label_dollar()) +
      labs(x = "Region", y = "Sales") + theme_minimal(base_size = 12)
  })

  output$region_profit_plot <- renderPlot({
    df <- filtered_data() %>% group_by(Region) %>%
      summarise(Sales = sum(Sales, na.rm = TRUE), Profit = sum(Profit, na.rm = TRUE), .groups = "drop") %>%
      pivot_longer(cols = c(Sales, Profit), names_to = "Metric", values_to = "Amount")
    ggplot(df, aes(Region, Amount, fill = Metric)) + geom_col(position = "dodge") +
      scale_y_continuous(labels = label_dollar()) + labs(x = "Region", y = "Amount", fill = "Metric") +
      theme_minimal(base_size = 12)
  })

  output$product_plot <- renderPlot({
    df <- filtered_data() %>% group_by(Product) %>%
      summarise(Sales = sum(Sales, na.rm = TRUE), .groups = "drop") %>%
      slice_max(order_by = Sales, n = 10, with_ties = FALSE)
    ggplot(df, aes(reorder(Product, Sales), Sales)) + geom_col(fill = "#2e8b57") + coord_flip() +
      scale_y_continuous(labels = label_dollar()) + labs(x = "Product", y = "Sales") +
      theme_minimal(base_size = 12)
  })

  output$scatter_plot <- renderPlot({
    ggplot(filtered_data(), aes(Sales, Profit, color = Category)) + geom_point(alpha = 0.7, size = 2) +
      geom_hline(yintercept = 0, linetype = "dashed", color = "grey50") +
      scale_x_continuous(labels = label_dollar()) + scale_y_continuous(labels = label_dollar()) +
      labs(x = "Sales", y = "Profit", color = "Category") + theme_minimal(base_size = 12)
  })

  output$summary_table <- renderTable({
    filtered_data() %>% group_by(Region, Category) %>%
      summarise(Records = n(), Sales = sum(Sales, na.rm = TRUE), Profit = sum(Profit, na.rm = TRUE),
                Quantity = sum(Quantity, na.rm = TRUE), .groups = "drop") %>% arrange(desc(Sales))
  }, digits = 2)

  output$download_filtered <- downloadHandler(
    filename = function() paste0("filtered_sales_", Sys.Date(), ".csv"),
    content = function(file) write.csv(filtered_data(), file, row.names = FALSE)
  )
}

shinyApp(ui = ui, server = server)
