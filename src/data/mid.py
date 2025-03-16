from flask import Flask, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Specify your CSV file
DATA_FILE = 'indian_retail_data_audi_2029.csv'

def load_and_validate_data():
    try:
        # Check if file exists
        if not os.path.exists(DATA_FILE):
            raise FileNotFoundError(f"Dataset file {DATA_FILE} not found")

        # Read CSV file
        df = pd.read_csv(DATA_FILE)
        
        # Validate required columns
        required_columns = ['customer_city', 'sales_per_transaction', 'store_type']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")

        return df
    except Exception as e:
        raise Exception(f"Error loading data: {str(e)}")

# API Endpoint for USP analysis
@app.route('/api/analyze_usp', methods=['GET'])
def analyze_usp():
    try:
        # Load data
        df = load_and_validate_data()

        # Filter for online purchases only
        online_df = df[df['store_type'].str.lower() == 'online'].copy()

        if online_df.empty:
            return jsonify({
                'status': 'error',
                'message': 'No online sales data found in the dataset'
            }), 404

        # Group by city and calculate sum of sales_per_transaction
        city_analysis = (online_df
                        .groupby('customer_city')
                        .agg({
                            'sales_per_transaction': 'sum'
                        })
                        .reset_index())
        
        # Rename columns
        city_analysis.columns = ['city', 'total_sales']

        # Convert to list of dictionaries
        usp_data = city_analysis.to_dict('records')
        
        # Find city with maximum total sales
        max_sales_city = max(usp_data, key=lambda x: x['total_sales'])

        return jsonify({
            'status': 'success',
            'all_cities': usp_data,
            'recommended_city': {
                'city': max_sales_city['city'],
                'total_sales': float(max_sales_city['total_sales'])
            }
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

if __name__ == '__main__':
    # Start server
    app.run(debug=True, host='0.0.0.0', port=5004)