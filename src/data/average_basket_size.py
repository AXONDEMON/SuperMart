import pandas as pd
import json

# Load the dataset
file_path = 'public/data/indian_retail_data_audi_2028.csv'
df = pd.read_csv(file_path)

# Ensure date fields are parsed correctly
df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%d-%m-%Y', errors='coerce')
df['signup_date'] = pd.to_datetime(df['signup_date'], format='%d-%m-%Y', errors='coerce')

# Ensure numeric columns are correctly formatted
df['total_sales_per_transaction'] = pd.to_numeric(df['total_sales_per_transaction'], errors='coerce').fillna(0)

# ✅ Step 1: Compute Total Sales Per Customer
customer_sales = df.groupby('customer_id')['total_sales_per_transaction'].sum()

# ✅ Step 2: Count Total Transactions Per Customer
customer_transactions = df.groupby('customer_id')['transaction_id'].nunique()

# ✅ Step 3: Compute AOV Per Customer (Total Sales Per Customer / Total Transactions)
aov_per_customer = customer_sales / customer_transactions

# ✅ Step 4: Compute Average Basket Size (Overall)
average_basket_size = aov_per_customer.mean()  # Mean of AOV across all customers

# ✅ Step 5: Convert to JSON format
abs_data = {
    'average_basket_size': float(average_basket_size)  # Convert to float for JSON compatibility
}

# ✅ Step 6: Save to JSON
json_file_path = 'public/data/average_basket_size.json'
with open(json_file_path, 'w', encoding='utf-8') as f:
    json.dump(abs_data, f, indent=4)

# ✅ Display the results
print(f"✅ The Average Basket Size (AOV per customer) is: ₹{average_basket_size:.2f}")
print(f"✅ Result has been saved to '{json_file_path}'.")
