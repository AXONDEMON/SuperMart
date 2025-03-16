import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Initialize Flask App for Filtered Data
filtered_app = Flask(__name__)
CORS(filtered_app, resources={r"/api/*": {"origins": "http://localhost:4000"}})  # Specify origin for React app

# Load Data File
DATA_FILE2 = os.path.abspath("public/data/indian_retail_data_audi_2028.csv")  # Updated to your dataset

# Ensure CSV File Exists
if not os.path.exists(DATA_FILE2):
    raise FileNotFoundError(f"❌ CSV File Not Found: {DATA_FILE2}")

@filtered_app.route("/api/get_filtered_data", methods=["GET"])
def get_filtered_data():
    """ Fetch filtered sales data based on demographics, time period, and product categories """
    try:
        print("📢 API /api/get_filtered_data Called!")

        # Load Data
        df = pd.read_csv(DATA_FILE2)
        df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors='coerce')
        print(f"📂 Loaded {len(df)} records")

        # Drop rows with NaT in transaction_date to avoid errors
        df = df.dropna(subset=["transaction_date"])

        # Get Filters from query params
        customer_id = request.args.get("customer_id")  # Optional customer_id parameter
        city = request.args.get("city")  # Maps to customer_city in your dataset
        state = request.args.get("state")  # Maps to state in your dataset
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        category = request.args.get("category")  # Maps to product_category
        product_name = request.args.get("product_name")  # Maps to product_name
        store_type = request.args.get("store_type")  # Maps to store_type
        payment_method = request.args.get("payment_method")  # Maps to payment_method
        loyalty_status = request.args.get("loyalty_status")  # Maps to loyalty_status
        min_annual_income = request.args.get("min_annual_income")  # Maps to annual_income
        max_annual_income = request.args.get("max_annual_income")  # Maps to annual_income
        transaction_type = request.args.get("transaction_type")  # Maps to payment_method or store_type (adjust as needed)

        # Apply Filters
        if customer_id:
            df = df[df["customer_id"] == customer_id]
        if city:
            df = df[df["city"].str.lower() == city.lower()]
        if state:
            df = df[df["state"].str.lower() == state.lower()]
        if start_date and end_date:
            df = df[(df["transaction_date"] >= start_date) & (df["transaction_date"] <= end_date)]
        if category:
            df = df[df["category"].str.lower() == category.lower()]
        if product_name:
            df = df[df["product_name"].str.lower() == product_name.lower()]
        if store_type:
            df = df[df["store_type"].str.lower() == store_type.lower()]
        if payment_method:
            df = df[df["payment_method"].str.lower() == payment_method.lower()]
        if loyalty_status:
            df = df[df["loyalty_status"].str.lower() == loyalty_status.lower()]
        if min_annual_income:
            df = df[df["annual_income"] >= float(min_annual_income)]
        if max_annual_income:
            df = df[df["annual_income"] <= float(max_annual_income)]
        if transaction_type:
            # Assuming transaction_type maps to payment_method (adjust if it should map to store_type or another column)
            df = df[df["payment_method"].str.lower() == transaction_type.lower()]

        # Sort by transaction_date (Most recent first)
        df = df.sort_values(by="transaction_date", ascending=False)

        # Ensure no NaN values are included in the final output
        filtered_data = df.fillna("").to_dict(orient="records")

        print(f"✅ Filtered Data Count: {len(filtered_data)}")
        return jsonify(filtered_data)

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

# Run API on port 5002
if __name__ == '__main__':
    filtered_app.run(host='0.0.0.0', port=5002, debug=True)