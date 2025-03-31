import pandas as pd
import numpy as np

file_path = '/Users/apple/Desktop/Blazebuilders/Deloitte_Round_3/react-app/public/data/indian_retail_data_audi_2028.csv'
df = pd.read_csv(file_path)

# Ensure datetime columns are in the correct format (DD-MM-YYYY)
df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%d-%m-%Y')
df['signup_date'] = pd.to_datetime(df['signup_date'], format='%d-%m-%Y')


# Conversion rate = (number of unique customers who bought the product / total unique customers) * 100

num_customers = df['customer_id'].nunique()  # Total unique customers in the dataset

product_conversion = df.groupby(['product_id', 'product_name', 'category']).agg({
    'customer_id': 'nunique',  # Number of unique customers who bought the product
    'total_sales_per_transaction': 'sum'
}).reset_index()

# Calculate conversion rate for each product
product_conversion['conversion_rate'] = (product_conversion['customer_id'] / num_customers) * 100

# Map acc to values
def categorize_conversion(rate):
    if rate <= 8:
        return 'Low Conversion (≤8%)'
    elif 9 <= rate <= 25:
        return 'Medium Conversion (9%–25%)'
    else:
        return 'High Conversion (>25%)'

# Apply categorization acc to our values
product_conversion['conversion_category'] = product_conversion['conversion_rate'].apply(categorize_conversion)

# Filter low conversion products (conversion rate ≤ 8%)
low_conversion_products = product_conversion[product_conversion['conversion_rate'] <= 8]

# Prepare data for JSON format
conversion_data_json = product_conversion[['product_name', 'category', 'conversion_rate', 'conversion_category']]


output_file_path = 'public/data/product_conversion_rates.json'
conversion_data_json.to_json(output_file_path, orient='records', lines=False)  


print(f"Product conversion rates saved to {output_file_path}")

