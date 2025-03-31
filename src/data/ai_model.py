from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  #CORS for Global Implementation

file_path = "/Users/apple/Desktop/Blazebuilders/Deloitte_Round_3/react-app/public/data/indian_retail_data_audi_2030.csv"  
df = pd.read_csv(file_path)
df_products = df[['product_name', 'category']].dropna().drop_duplicates()

# TF-IDF Vectorization
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df_products["product_name"])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Category refinement
category_refinement = {
    "Electronics": {
        "Headphones": ["boAt", "JBL", "Sony", "Bose"],
        "Televisions": ["TV", "LED", "Smart TV", "OLED"],
        "Speakers": ["Speaker", "Soundbar", "Bluetooth Speaker"]
    },
    "Appliances": {
        "Kitchen Appliances": ["Microwave", "Blender", "Toaster"],
        "Home Appliances": ["Washing Machine", "Refrigerator", "Air Conditioner"]
    }
}

def assign_subcategory(product_name, category):
    if category in category_refinement:
        for sub_category, keywords in category_refinement[category].items():
            if any(keyword.lower() in product_name.lower() for keyword in keywords):
                return sub_category
    return category

df_products["sub_category"] = df_products.apply(
    lambda row: assign_subcategory(row["product_name"], row["category"]), axis=1
)

def recommend_similar_products(product_name, df, cosine_sim, num_recommendations=5):
    matching_products = df[df["product_name"].str.contains(product_name, case=False, na=False)]
    if matching_products.empty:
        return {"error": "Product not found in dataset."}

    idx = matching_products.index[0]
    similar_products = sorted(list(enumerate(cosine_sim[idx])), key=lambda x: x[1], reverse=True)
    recommended_product_names = []
    base_sub_category = df.iloc[idx]["sub_category"]

    for i in similar_products:
        product = df.iloc[i[0]]["product_name"]
        product_sub_category = df.iloc[i[0]]["sub_category"]
        if product_sub_category == base_sub_category and product.lower() != product_name.lower():
            recommended_product_names.append(product)
        if len(recommended_product_names) == num_recommendations:
            break

    return {"recommendations": recommended_product_names} if recommended_product_names else {"error": "No relevant recommendations found."}

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    data = request.get_json()
    product_name = data.get('product_name')
    if not product_name:
        return jsonify({"error": "Product name is required"}), 400
    
    result = recommend_similar_products(product_name, df_products, cosine_sim)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5004)