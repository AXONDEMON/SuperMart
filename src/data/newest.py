import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from tabulate import tabulate
import os

# Set Seaborn style with a custom palette
sns.set(style="whitegrid", palette="muted")

# Define output directory
output_dir = "public/data"
os.makedirs(output_dir, exist_ok=True)

# Load the dataset
try:
    df = pd.read_csv("public/data/indian_retail_data_audi_2028.csv")
except FileNotFoundError:
    print("Error: 'indian_retail_data_audi_2028.csv' not found. Please ensure the file exists.")
    exit()

# Step 1: Aggregate data to customer level
customer_data = df.groupby('customer_id').agg({
    'days_since_last_purchase': 'min',  # Most recent purchase
    'purchase_frequency': 'mean',       # Number of transactions
    'cumulative_spending': 'mean',      # Total spending
    'annual_income': 'mean',            # Customer income
    'days_since_signup': 'mean'         # Tenure
}).reset_index()

# Check for missing values
print("Missing Values in customer_data:\n", customer_data.isnull().sum())
customer_data = customer_data.dropna()

# Step 2: Select features for clustering (RFM + extras)
features = customer_data[['days_since_last_purchase', 'purchase_frequency', 
                         'cumulative_spending', 'annual_income', 'days_since_signup']]

# Step 3: Standardize the features
scaler = StandardScaler()
scaled_features = scaler.fit_transform(features)

# Step 4: Apply PCA for Dimensionality Reduction (2D)
pca = PCA(n_components=2)
pca_features = pca.fit_transform(scaled_features)

customer_data['PCA1'] = pca_features[:, 0]
customer_data['PCA2'] = pca_features[:, 1]

# Step 5: Apply K-means clustering with k=4
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
customer_data['Cluster'] = kmeans.fit_predict(scaled_features)

# Step 6: Analyze cluster characteristics
cluster_summary = customer_data.groupby('Cluster').agg({
    'days_since_last_purchase': 'mean',
    'purchase_frequency': 'mean',
    'cumulative_spending': 'mean',
    'annual_income': 'mean',
    'days_since_signup': 'mean',
    'customer_id': 'count'
}).rename(columns={'customer_id': 'count'})
print("\nCluster Summary:\n", tabulate(cluster_summary, headers='keys', tablefmt='pretty', showindex=True))

# Step 7: Assign predefined labels based on cluster characteristics
def label_clusters(summary):
    labels = {}
    available_clusters = set(summary.index)

    # 1. Loyal Customers: High frequency, low recency
    loyal_score = summary['purchase_frequency'] - summary['days_since_last_purchase']
    loyal_idx = loyal_score.idxmax()
    labels[loyal_idx] = 'Loyal Customers'
    available_clusters.remove(loyal_idx)

    # 2. Big Spenders: Highest cumulative spending
    big_spender_idx = summary.loc[list(available_clusters), 'cumulative_spending'].idxmax()
    labels[big_spender_idx] = 'Big Spenders'
    available_clusters.remove(big_spender_idx)

    # 3. At-Risk Customers: High recency, low frequency
    at_risk_score = summary['days_since_last_purchase'] - summary['purchase_frequency']
    at_risk_idx = at_risk_score[list(available_clusters)].idxmax()
    labels[at_risk_idx] = 'At-Risk Customers'
    available_clusters.remove(at_risk_idx)

    # 4. Occasional Shoppers: Remaining cluster
    occasional_idx = available_clusters.pop()
    labels[occasional_idx] = 'Occasional Shoppers'

    return labels

# Apply labeling
cluster_labels = label_clusters(cluster_summary)
customer_data['Segment'] = customer_data['Cluster'].map(cluster_labels)  # Kept as 'Segment' to match first script

# Print labeled cluster summary
labeled_summary = cluster_summary.assign(label=cluster_labels.values())
print("\nCluster Summary with Labels:\n", tabulate(labeled_summary, headers='keys', tablefmt='pretty', showindex=True))
print("\nCustomer Count by Segment:\n", customer_data['Segment'].value_counts().to_string())

# Step 8: Calculate Silhouette Score
silhouette_avg = silhouette_score(scaled_features, customer_data['Cluster'])
print(f"\nSilhouette Score: {silhouette_avg:.3f}")

# Step 9: Visualize clusters in 2D using PCA with enhanced styling and custom colors
cluster_colors = {
    'Loyal Customers': '#4CAF50',    # Green
    'Big Spenders': '#2196F3',       # Blue
    'Occasional Shoppers': '#FF9800', # Orange
    'At-Risk Customers': '#F44336'    # Red
}


# Save customer segmentation data
customer_segments_path = os.path.join(output_dir, "customer_segments.csv")
customer_data.to_csv(customer_segments_path, index=False)
print(f"✅ Customer segmentation data saved at: {customer_segments_path}")