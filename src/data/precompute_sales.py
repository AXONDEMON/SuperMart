import pandas as pd
import os

# Function to log messages
def log(message):
    print(f"[LOG] {message}")

try:
    # Load dataset
    file_path = "public/data/indian_retail_data_audi_2028.csv"
    df = pd.read_csv(file_path, dtype={"transaction_date": str})
    log("✅ Dataset loaded successfully.")

    # Remove leading/trailing spaces from the transaction_date column
    df["transaction_date"] = df["transaction_date"].str.strip()

    # Ensure correct datetime format (handling various formats)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors="coerce", dayfirst=True)
    log("✅ Date conversion completed.")

    # Check how many rows have invalid dates (NaT = Not a Time)
    invalid_rows = df["transaction_date"].isna().sum()
    log(f"✅ Removed {invalid_rows} invalid rows with invalid dates.")

    # Inspect the first few invalid rows to understand the issue
    invalid_data = df[df["transaction_date"].isna()].head(10)
    log(f"✅ Sample of invalid date rows: \n{invalid_data[['transaction_date']]}")

    # Remove rows with invalid transaction_date
    df = df.dropna(subset=["transaction_date"])

    # Filter for relevant years (2020 & 2021)
    df = df[df["transaction_date"].dt.year.isin([2021,2022,2023,2024])]
    log(f"✅ Filtered data for years 2020 and 2021. Remaining rows: {len(df)}.")

    # Convert necessary columns to numeric (handling potential errors)
    numeric_cols = ["total_sales_per_transaction", "total_profit_per_transaction"]  # Updated to match your dataset columns
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    log(f"✅ Converted columns {numeric_cols} to numeric values.")

    # Sales Calculation (New Logic)
    df["Sales"] = df["total_sales_per_transaction"]  # Using total_sales column from your dataset
    df["Profit"] = df["total_profit_per_transaction"]  # Using total_profit column from your dataset
    log("✅ Sales and Profit columns calculated.")

    # Aggregate Data by Date
    aggregated_data = df.groupby(df["transaction_date"].dt.date).agg(
        Sales=("Sales", "sum"),
        Profit=("Profit", "sum"),
    ).reset_index()
    log(f"✅ Data aggregated by date. Aggregated rows: {len(aggregated_data)}.")

    # Rename Date Column
    aggregated_data.rename(columns={"transaction_date": "Date"}, inplace=True)
    log("✅ Date column renamed to 'Date'.")

    # Save precomputed data for faster frontend loading
    output_dir = "public/data"
    os.makedirs(output_dir, exist_ok=True)
    output_path_csv = os.path.join(output_dir, "precomputed_sales_data_audi_2028.csv")
    aggregated_data.to_csv(output_path_csv, index=False)
    log(f"✅ Precomputed sales data saved successfully at {output_path_csv}!")

except Exception as e:
    log(f"❌ An error occurred: {str(e)}")