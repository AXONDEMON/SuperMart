import pandas as pd
import numpy as np

# Load the existing dataset
file_path = 'public/data/newer.csv'
df = pd.read_csv(file_path)

# Ensure datetime columns are in the correct format (DD-MM-YYYY)
df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%d-%m-%Y')
df['signup_date'] = pd.to_datetime(df['signup_date'], format='%d-%m-%Y')

# Calculate conversion rate for each product
# Conversion rate = (number of unique customers who bought the product / total unique customers) * 100
num_customers = df['customer_id'].nunique()  # Total unique customers in the dataset

product_conversion = df.groupby(['product_id', 'product_name', 'category']).agg({
    'customer_id': 'nunique',  # Number of unique customers who bought the product
    'total_sales_per_transaction': 'sum'
}).reset_index()

# Calculate conversion rate for each product
product_conversion['conversion_rate'] = (product_conversion['customer_id'] / num_customers) * 100

# Categorize conversion rates for visualization (matching your chart)
def categorize_conversion(rate):
    if rate <= 8:
        return 'Low Conversion (≤8%)'
    elif 9 <= rate <= 25:
        return 'Medium Conversion (9%–25%)'
    else:
        return 'High Conversion (>25%)'

# Apply categorization
product_conversion['conversion_category'] = product_conversion['conversion_rate'].apply(categorize_conversion)

# Filter low conversion products (conversion rate ≤ 5%)
low_conversion_products = product_conversion[product_conversion['conversion_rate'] <= 8]

# Prepare data for JSON
conversion_data_json = product_conversion[['product_name', 'category', 'conversion_rate', 'conversion_category']]

# Save to JSON file (ensuring proper array format)
output_file_path = 'public/data/product_conversion_rate.json'
conversion_data_json.to_json(output_file_path, orient='records', lines=False)  # Correct format for a valid JSON array

# Print the saved JSON file path
print(f"Product conversion rates saved to {output_file_path}")

# Optionally, visualize the conversion rates (for debugging purposes)
import matplotlib.pyplot as plt

conversion_data = product_conversion.sort_values('conversion_rate')
colors = ['red' if cat == 'Low Conversion (≤8%)' else 'blue' if cat == 'Medium Conversion (9%–25%)' else 'green' for cat in conversion_data['conversion_category']]

plt.figure(figsize=(12, 6))
plt.bar(conversion_data['product_name'], conversion_data['conversion_rate'], color=colors)
plt.xticks(rotation=45, ha='right')
plt.ylabel('Conversion Rate (%)')
plt.title('Product Conversion Rates')
plt.axhline(y=5, color='gray', linestyle='--', alpha=0.5)
plt.axhline(y=80, color='gray', linestyle='--', alpha=0.5)
plt.legend(['Low Conversion (≤8%)', 'Medium Conversion (9%–25%)', 'High Conversion (>25%)'])

# Add tooltips or labels (simplified for this example)
for i, v in enumerate(conversion_data['conversion_rate']):
    if v <= 8:  # Highlight low conversion products
        plt.text(i, v + 1, f'{v:.1f}%', ha='center', va='bottom', color='red', rotation=45)
    elif 9 <= v <= 25:
        plt.text(i, v + 1, f'{v:.1f}%', ha='center', va='bottom', color='blue', rotation=45)
    else:
        plt.text(i, v + 1, f'{v:.1f}%', ha='center', va='bottom', color='green', rotation=45)

plt.tight_layout()
plt.show()
