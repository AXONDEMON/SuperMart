import pandas as pd
import json
from datetime import datetime

# Load the existing dataset
file_path = 'public/data/indian_retail_data_audi_2028.csv'
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"Error: File '{file_path}' not found. Please check the file path.")
    exit()
except pd.errors.EmptyDataError:
    print(f"Error: File '{file_path}' is empty.")
    exit()

# Ensure datetime columns are in the correct format (DD-MM-YYYY), though not needed for this calculation
try:
    df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%d-%m-%Y', errors='coerce')
    df['signup_date'] = pd.to_datetime(df['signup_date'], format='%d-%m-%Y', errors='coerce')
except ValueError as e:
    print(f"Error parsing dates: {e}")
    print("Attempting to infer date format with 'mixed'...")
    df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='mixed', dayfirst=True, errors='coerce')
    df['signup_date'] = pd.to_datetime(df['signup_date'], format='mixed', dayfirst=True, errors='coerce')

# Check for missing or invalid data
if df['transaction_date'].isnull().any() or df['signup_date'].isnull().any():
    print("Warning: Some dates could not be parsed and are set to NaT. Review your data.")
    df = df.dropna(subset=['transaction_date', 'signup_date'])

# Ensure numeric columns are in the correct format
numeric_columns = ['total_sales_per_transaction', 'total_profit_per_transaction']
for col in numeric_columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill missing numeric values with 0
for col in numeric_columns:
    if df[col].isnull().any():
        print(f"Warning: Some {col} values are missing or invalid. Filling with 0.")
        df[col] = df[col].fillna(0)

# Calculate total sales and total profit
total_sales = df['total_sales_per_transaction'].sum()
total_profit = df['total_profit_per_transaction'].sum()

# Create JSON data structure
metrics_data = {
    'total_sales': float(total_sales),  # Convert to float for JSON compatibility
    'total_profit': float(total_profit)  # Convert to float for JSON compatibility
}

# Save to JSON file
json_file_path = 'public/data/sales_profit_metrics.json'
with open(json_file_path, 'w') as f:
    json.dump(metrics_data, f, indent=4)

print(f"JSON file saved as '{json_file_path}' with total sales: ₹{total_sales:,.2f} and total profit: ₹{total_profit:,.2f}")