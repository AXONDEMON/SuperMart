import React, { useState } from 'react';
import axios from 'axios';
import '../../App.css';

function App() {
  const [productName, setProductName] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRecommendations([]);

    try {
      const response = await axios.post('http://localhost:5004/api/recommend', {
        product_name: productName
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setRecommendations(response.data.recommendations);
      }
    } catch (err) {
      setError('An error occurred while fetching recommendations.');
    }
  };

  return (
    <div className="App">
      <h1>Product Recommender</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
          required
        />
        <button type="submit">Get Recommendations</button>
      </form>

      {error && <p className="error">{error}</p>}
      
      {recommendations.length > 0 && (
        <div className="recommendations">
          <h2>Recommended Products:</h2>
          <ul>
            {recommendations.map((product, index) => (
              <li key={index}>{product}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;