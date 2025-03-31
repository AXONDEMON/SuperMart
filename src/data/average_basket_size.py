import pandas as pd
import json

file_path = '/Users/apple/Desktop/Blazebuilders/Deloitte_Round_3/react-app/public/data/indian_retail_data_audi_2028.csv'
df = pd.read_csv(file_path)

df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%d-%m-%Y', errors='coerce')
df['signup_date'] = pd.to_datetime(df['signup_date'], format='%d-%m-%Y', errors='coerce')

df['total_sales_per_transaction'] = pd.to_numeric(df['total_sales_per_transaction'], errors='coerce').fillna(0)

#Total Sales Per Customer
customer_sales = df.groupby('customer_id')['total_sales_per_transaction'].sum()

#Count Total Transactions Per Customer
customer_transactions = df.groupby('customer_id')['transaction_id'].nunique()

#Compute AOV Per Customer (Total Sales Per Customer / Total Transactions)
aov_per_customer = customer_sales / customer_transactions

#Compute Average Basket Size (Overall)
average_basket_size = aov_per_customer.mean()  # Mean of AOV across all customers

#Convert to JSON format
abs_data = {
    'average_basket_size': float(average_basket_size)  
}

#Save to JSON
json_file_path = 'public/data/average_basket_size.json'
with open(json_file_path, 'w', encoding='utf-8') as f:
    json.dump(abs_data, f, indent=4)

# Results
print(f"✅ The Average Basket Size (AOV per customer) is: ₹{average_basket_size:.2f}")
print(f"✅ Result has been saved to '{json_file_path}'.")
