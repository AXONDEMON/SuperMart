from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Specify your CSV file
DATA_FILE = 'public/data/indian_retail_data_audi_2028.csv'  # Adjust path as needed

def load_and_validate_data():
    try:
        if not os.path.exists(DATA_FILE):
            raise FileNotFoundError(f"Dataset file {DATA_FILE} not found")
        
        df = pd.read_csv(DATA_FILE)
        
        required_columns = [
            'city', 'store_type', 'total_sales_per_transaction', 'store_profit',
            'daily_footfall', 'average_order_value', 'cumulative_spending',
            'transaction_id', 'customer_id'
        ]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        return df
    except Exception as e:
        raise Exception(f"Error loading data: {str(e)}")

# Define city tiers
tier_cities = {
    'Tier 1': ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad'],
    'Tier 2': ['Jaipur', 'Lucknow', 'Chandigarh', 'Nagpur', 'Surat', 'Visakhapatnam', 'Patna', 'Bhopal', 'Vadodara', 'Coimbatore'],
    'Tier 3': ['Agartala', 'Durgapur', 'Rourkela', 'Korba', 'Gangtok', 'Manali', 'Haridwar', 'Thiruvananthapuram', 'Jorhat', 'Jowai', 
               'Mangalore', 'Gwalior', 'Hubli', 'Tawang', 'Ranchi', 'Jabalpur', 'Udaipur', 'Dhanbad', 'Sambalpur', 'Howrah', 
               'Tirupati', 'Silvassa', 'Ambala', 'Prayagraj', 'Karimnagar', 'Puducherry', 'Bhubaneswar', 'Dehradun', 'Guwahati', 
               'Shillong', 'Shimla', 'Nainital', 'Mysore', 'Kota', 'Srinagar', 'Amritsar', 'Varanasi', 'Ujjain']
}

def assign_tier(city):
    for tier, cities in tier_cities.items():
        if city in cities:
            return tier
    return 'Tier 3'

@app.route('/api/analyze_stores', methods=['GET'])
def analyze_stores():
    try:
        df = load_and_validate_data()

        # Group data by city and store type
        city_store_analysis = df.groupby(['city', 'store_type']).agg({
            'total_sales_per_transaction': 'sum',
            'store_profit': 'sum',
            'daily_footfall': 'mean',
            'average_order_value': 'mean',
            'cumulative_spending': 'sum',
            'transaction_id': 'count',
            'customer_id': pd.Series.nunique
        }).reset_index()

        # Split into Online and Physical
        online_city_data = city_store_analysis[city_store_analysis['store_type'] == 'Online'].copy()
        physical_city_data = city_store_analysis[city_store_analysis['store_type'] == 'Physical'].copy()

        # Add tier column to online data
        online_city_data['tier'] = online_city_data['city'].apply(assign_tier)

        # Cities with only online stores
        recommended_physical_store_cities = online_city_data[~online_city_data['city'].isin(physical_city_data['city'])].copy()
        recommended_physical_store_cities = recommended_physical_store_cities.sort_values(
            by=['total_sales_per_transaction', 'cumulative_spending'], ascending=[False, False]
        )

        # Split recommendations by tier
        tier_1_recommendations = recommended_physical_store_cities[recommended_physical_store_cities['tier'] == 'Tier 1']
        tier_2_recommendations = recommended_physical_store_cities[recommended_physical_store_cities['tier'] == 'Tier 2']
        tier_3_recommendations = recommended_physical_store_cities[recommended_physical_store_cities['tier'] == 'Tier 3']

        # Convert to JSON-friendly format
        response = {
            'tier_1_recommendations': tier_1_recommendations.to_dict(orient='records'),
            'tier_2_recommendations': tier_2_recommendations.to_dict(orient='records'),
            'tier_3_recommendations': tier_3_recommendations.to_dict(orient='records'),
            'physical_store_locations': physical_city_data.to_dict(orient='records')  # All physical stores included here
        }

        return jsonify({
            'status': 'success',
            'data': response
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5008)