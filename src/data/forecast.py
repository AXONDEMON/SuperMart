import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

try:
    file_path = "/Users/apple/Desktop/Blazebuilders/Deloitte_Round_3/react-app/public/data/indian_retail_data_audi_2028.csv"
    df = pd.read_csv(file_path)
    df['transaction_date'] = pd.to_datetime(df['transaction_date'], errors='coerce', dayfirst=True)
    df = df.dropna(subset=['transaction_date'])
    df = df[df['transaction_date'].dt.year >= 2021]
    df_yearly_sales = df.groupby(df['transaction_date'].dt.year)['total_sales_per_transaction'].sum().reset_index()
    df_yearly_sales.columns = ['Year', 'Total_Sales']
except Exception as e:
    print(f"Error loading data: {e}")
    raise

# Train ARIMA model
try:
    arima_model = ARIMA(df_yearly_sales['Total_Sales'], order=(3, 2, 2))
    arima_fit = arima_model.fit()
except Exception as e:
    print(f"Error training ARIMA: {e}")
    raise

# Compute ARIMA forecast and residuals
forecast_years = list(range(2025, 2029))
arima_forecast = arima_fit.forecast(steps=4)
df_yearly_sales['ARIMA_Predictions'] = arima_fit.fittedvalues
df_yearly_sales['Residuals'] = df_yearly_sales['Total_Sales'] - df_yearly_sales['ARIMA_Predictions']

#features for XGBoost
df_yearly_sales['Year_lag1'] = df_yearly_sales['Total_Sales'].shift(1)
df_yearly_sales['Year_lag2'] = df_yearly_sales['Total_Sales'].shift(2)
df_xgb = df_yearly_sales.dropna()

# Split data and train XGBoost
X = df_xgb[['Year_lag1', 'Year_lag2']]
y = df_xgb['Residuals']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1, objective='reg:squarederror')
xgb_model.fit(X_train, y_train)

#Generate Forcast
def generate_forecast():
    future_xgb_data = pd.DataFrame({
        'Year_lag1': [df_yearly_sales['Total_Sales'].iloc[-1], *arima_forecast[:-1]],
        'Year_lag2': [df_yearly_sales['Total_Sales'].iloc[-2], df_yearly_sales['Total_Sales'].iloc[-1], *arima_forecast[:-2]]
    }).dropna()
    xgb_forecast_residuals = xgb_model.predict(future_xgb_data)
    hybrid_forecast = arima_forecast + xgb_forecast_residuals
    return pd.DataFrame({
        'year': forecast_years,
        'predicted_sales': hybrid_forecast
    })

@app.route('/api/get_sales_data', methods=['GET'])
def get_sales_data():
    try:
        sales_json = df_yearly_sales[['Year', 'Total_Sales']].rename(columns={'Total_Sales': 'total_amt'}).to_dict(orient='records')
        return jsonify(sales_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict_sales', methods=['GET'])
def predict_sales():
    try:
        forecast_df = generate_forecast()
        forecast_json = forecast_df[['year', 'predicted_sales']].to_dict(orient='records')
        return jsonify(forecast_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')  