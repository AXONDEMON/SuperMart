import pandas as pd
import json
from datetime import datetime

file_path = '/Users/apple/Desktop/Blazebuilders/Deloitte_Round_3/react-app/public/data/indian_retail_data_audi_2028.csv'
df = pd.read_csv(file_path)


try:
    df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%d-%m-%Y', errors='coerce')
    df['signup_date'] = pd.to_datetime(df['signup_date'], format='%d-%m-%Y', errors='coerce')
except ValueError as e:
    df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='mixed', dayfirst=True, errors='coerce')
    df['signup_date'] = pd.to_datetime(df['signup_date'], format='mixed', dayfirst=True, errors='coerce')

# Check for missing data
if df['transaction_date'].isnull().any() or df['signup_date'].isnull().any():
    df = df.dropna(subset=['transaction_date', 'signup_date'])

numeric_columns = ['total_sales_per_transaction', 'total_profit_per_transaction']
for col in numeric_columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill missing numeric values with 0
for col in numeric_columns:
    if df[col].isnull().any():
        df[col] = df[col].fillna(0)

# Total sales and Total profit
total_sales = df['total_sales_per_transaction'].sum()
total_profit = df['total_profit_per_transaction'].sum()


metrics_data = {
    'total_sales': float(total_sales),  # Convert to float for JSON compatibility
    'total_profit': float(total_profit)  
}

# Save as JSON 
json_file_path = 'public/data/sales_profit_metrics.json'
with open(json_file_path, 'w') as f:
    json.dump(metrics_data, f, indent=4)

print(f"JSON file saved as '{json_file_path}' with total sales: ₹{total_sales:,.2f} and total profit: ₹{total_profit:,.2f}")