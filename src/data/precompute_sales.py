import pandas as pd
import os


try:
    file_path = "/Users/apple/Desktop/Deloitte_Round_3/react-app/build/data/indian_retail_data_audi_2028.csv"
    df = pd.read_csv(file_path, dtype={"transaction_date": str})
    

    df["transaction_date"] = df["transaction_date"].str.strip()

    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors="coerce", dayfirst=True)
    

    invalid_rows = df["transaction_date"].isna().sum()
    
    df = df.dropna(subset=["transaction_date"])

   
    df = df[df["transaction_date"].dt.year.isin([2021,2022,2023,2024])]
    
    numeric_cols = ["total_sales_per_transaction", "total_profit_per_transaction"]  
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
   
    
    df["Sales"] = df["total_sales_per_transaction"]  
    df["Profit"] = df["total_profit_per_transaction"] 
    

    aggregated_data = df.groupby(df["transaction_date"].dt.date).agg(
        Sales=("Sales", "sum"),
        Profit=("Profit", "sum"),
    ).reset_index()
   
    aggregated_data.rename(columns={"transaction_date": "Date"}, inplace=True)
    
    output_dir = "public/data"
    os.makedirs(output_dir, exist_ok=True)
    output_path_csv = os.path.join(output_dir, "precomputed_sales_data_audi_2028.csv")
    aggregated_data.to_csv(output_path_csv, index=False)
    
except Exception as e:
    print(f"❌ An error occurred: {str(e)}")