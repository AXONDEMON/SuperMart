import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

filtered_app = Flask(__name__)
CORS(filtered_app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:4000"]}})
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_FILE2 = os.path.abspath("/Users/apple/Desktop/Blazebuilders/Deloitte_Round_3/react-app/public/data/indian_retail_data_audi_2028.csv")

if not os.path.exists(DATA_FILE2):
    raise FileNotFoundError(f"CSV File Not Available: {DATA_FILE2}")

def validate_inputs(min_annual_income, max_annual_income, start_date, end_date):
    if min_annual_income and not min_annual_income.isdigit():
        raise ValueError("min_annual_income must be a valid number")
    if max_annual_income and not max_annual_income.isdigit():
        raise ValueError("max_annual_income must be a valid number")
    if start_date and end_date:
        try:
            pd.to_datetime(start_date)
            pd.to_datetime(end_date)
        except ValueError:
            raise ValueError("Invalid date format for start_date or end_date")

@filtered_app.route("/api/get_filtered_data", methods=["GET"])
def get_filtered_data():
    df = pd.read_csv(DATA_FILE2)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors='coerce')
    required_columns = ["transaction_date", "customer_id", "city", "state", "category", "product_name", "store_type", "payment_method", "loyalty_status", "annual_income"]
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    df = df.dropna(subset=["transaction_date"])
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    customer_id = request.args.get("customer_id")
    city = request.args.get("city")
    state = request.args.get("state")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    category = request.args.get("category")
    product_name = request.args.get("product_name")
    store_type = request.args.get("store_type")
    payment_method = request.args.get("payment_method")
    loyalty_status = request.args.get("loyalty_status")
    min_annual_income = request.args.get("min_annual_income")
    max_annual_income = request.args.get("max_annual_income")
    validate_inputs(min_annual_income, max_annual_income, start_date, end_date)
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
    df = df.sort_values(by="transaction_date", ascending=False)
    total_records = len(df)
    df_paginated = df.iloc[start_idx:end_idx]
    filtered_data = df_paginated.fillna("").to_dict(orient="records")
    return jsonify({"data": filtered_data, "total_records": total_records, "page": page, "per_page": per_page})

@filtered_app.route("/api/get_cities", methods=["GET"])
def get_cities():
    df = pd.read_csv(DATA_FILE2)
    unique_cities = df["city"].dropna().unique().tolist()
    return jsonify(unique_cities)

if __name__ == '__main__':
    filtered_app.run(host='0.0.0.0', port=5002, debug=True)