from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from lifetimes import GammaGammaFitter
from lifetimes.utils import summary_data_from_transaction_data

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4000"}})  # Specify origin for React app

# Load and preprocess data
df = pd.read_csv('public/data/indian_retail_data_audi_2028.csv')  # Replace with your actual file path
df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%d-%m-%Y')
current_date = pd.to_datetime('2024-12-31')

# Prepare summary data
summary = summary_data_from_transaction_data(
    df,
    customer_id_col='customer_id',
    datetime_col='transaction_date',
    monetary_value_col='total_sales_per_transaction',
    observation_period_end=current_date
)

# Reset index to include customer_id as a column
summary = summary.reset_index().rename(columns={'index': 'customer_id'})

# Add base metrics
# Improved logic for average_order_value: Use weighted average by transaction count
customer_transactions = df.groupby('customer_id')['total_sales_per_transaction'].agg(['mean', 'count', 'sum'])
customer_transactions['weighted_avg_order'] = customer_transactions['sum'] / customer_transactions['count']
summary = summary.merge(customer_transactions['weighted_avg_order'], left_on='customer_id', right_index=True, how='left')
summary['average_order_value'] = summary['weighted_avg_order'].fillna(summary['monetary_value'].mean())  # Fallback
summary['purchase_freq'] = summary['frequency']
summary['lifespan'] = summary['T'] / 365

# Train Gamma-Gamma model
returning_customers = summary[summary['frequency'] > 0]
ggf = GammaGammaFitter(penalizer_coef=0.001)
ggf.fit(returning_customers['frequency'], returning_customers['monetary_value'])

@app.route('/api/future_cltv', methods=['GET'])
def get_future_cltv():
    days = request.args.get('days', default=365, type=int)
    if days <= 0:
        return jsonify({'error': 'Days must be positive'}), 400

    avg_order_value = request.args.get('avg_order_value', type=float)
    if avg_order_value is not None and avg_order_value <= 0:
        return jsonify({'error': 'Average order value must be positive'}), 400

    purchase_freq = request.args.get('purchase_freq', type=float)
    if purchase_freq is not None and purchase_freq < 0:
        return jsonify({'error': 'Purchase frequency cannot be negative'}), 400

    lifespan = request.args.get('lifespan', type=float)
    if lifespan is not None and lifespan <= 0:
        return jsonify({'error': 'Lifespan must be positive'}), 400

    profit_margin = request.args.get('profit_margin', default=0.35, type=float)
    if not 0 <= profit_margin <= 1:
        return jsonify({'error': 'Profit margin must be between 0 and 1'}), 400

    customer_id = request.args.get('customer_id', type=str)  # Optional customer_id parameter

    # Use provided values or dataset averages
    avg_order_value = avg_order_value or summary['average_order_value'].mean()
    purchase_freq = purchase_freq or summary['purchase_freq'].mean()
    lifespan = lifespan or (days / 365)  # Convert days to years

    # Predict CLTV
    summary['expected_avg_order_value'] = ggf.conditional_expected_average_profit(
        summary['frequency'], summary['monetary_value']
    )
    summary['ltv'] = (summary['expected_avg_order_value'].fillna(avg_order_value) * 
                     purchase_freq * lifespan)
    summary['future_cltv'] = summary['ltv'] * profit_margin
    
    # Filter by customer_id if provided and valid
    if customer_id and customer_id.lower() != 'null':
        filtered_summary = summary[summary['customer_id'] == customer_id]  # Correct filtering
        if filtered_summary.empty:
            return jsonify({'error': 'Customer ID not found'}), 404
        cltv_data = filtered_summary[['customer_id', 'future_cltv', 'ltv', 'expected_avg_order_value']].rename(
            columns={'future_cltv': 'cltv', 'expected_avg_order_value': 'avg_order_value'}
        ).to_dict(orient='records')
    else:
        cltv_data = summary[['customer_id', 'future_cltv', 'ltv', 'expected_avg_order_value']].rename(
            columns={'future_cltv': 'cltv', 'expected_avg_order_value': 'avg_order_value'}
        ).to_dict(orient='records')
    
    return jsonify({
        'days': days,
        'avg_order_value': avg_order_value,
        'purchase_freq': purchase_freq,
        'lifespan': lifespan,
        'profit_margin': profit_margin,
        'customer_id': customer_id,
        'data': cltv_data
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)