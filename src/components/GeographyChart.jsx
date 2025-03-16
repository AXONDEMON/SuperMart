import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const GeographyChart = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState({ physical: [], recommended: [] });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Google Maps API Key (replace with your own)
  const GOOGLE_MAPS_API_KEY = "AIzaSyDmpH-050yAmHIlYEDH792Vv4ae7UKYaTA";

  // Map container style
  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  // Center of India (approximate)
  const center = {
    lat: 20.5937,
    lng: 78.9629,
  };

  // Table style
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5008/api/analyze_stores"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log("Fetched Data:", result); // Debug log
        if (result.status === "success") {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Error fetching data: " + err.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (mapLoaded && data) {
      processLocations(data);
    }
  }, [mapLoaded, data]);

  const processLocations = async (storeData) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not loaded");
      setError("Google Maps API not loaded");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    const geocodeCity = (city) => {
      return new Promise((resolve) => {
        geocoder.geocode({ address: `${city}, India` }, (results, status) => {
          if (status === "OK" && results[0]) {
            const { lat, lng } = results[0].geometry.location;
            resolve({ lat: lat(), lng: lng() });
          } else {
            console.warn(`Geocoding failed for ${city}: ${status}`);
            resolve({ lat: 20.5937, lng: 78.9629 }); // Fallback to center of India
          }
        });
      });
    };

    // Process all physical stores
    const physicalPromises = storeData.physical_store_locations.map(
      async (store) => {
        const coords = await geocodeCity(store.city);
        return coords ? { ...store, ...coords } : null;
      }
    );

    // Process top 5 recommended stores for each tier
    const getTop5 = (tierData) => {
      return tierData
        .sort(
          (a, b) =>
            b.total_sales_per_transaction - a.total_sales_per_transaction
        )
        .slice(0, 5);
    };

    const tier1Top5 = getTop5(storeData.tier_1_recommendations);
    const tier2Top5 = getTop5(storeData.tier_2_recommendations);
    const tier3Top5 = getTop5(storeData.tier_3_recommendations);
    const recommendedCities = [...tier1Top5, ...tier2Top5, ...tier3Top5];

    const recommendedPromises = recommendedCities.map(async (store) => {
      const coords = await geocodeCity(store.city);
      return coords ? { ...store, ...coords } : null;
    });

    const [physicalResults, recommendedResults] = await Promise.all([
      Promise.all(physicalPromises),
      Promise.all(recommendedPromises),
    ]);

    const physicalLocations = physicalResults.filter((loc) => loc !== null);
    const recommendedLocations = recommendedResults.filter(
      (loc) => loc !== null
    );

    setLocations({
      physical: physicalLocations,
      recommended: recommendedLocations,
    });
  };

  const renderTable = (title, tableData, limit = false) => (
    <div>
      <h2>{title}</h2>
      {tableData && tableData.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>City</th>
              <th>Total Sales</th>
              <th>Cumulative Spending</th>
              <th>Transactions</th>
              <th>Unique Customers</th>
            </tr>
          </thead>
          <tbody>
            {(limit ? tableData.slice(0, 5) : tableData).map((item, index) => (
              <tr key={index}>
                <td>{item.city}</td>
                <td>
                  {item.total_sales_per_transaction
                    ? item.total_sales_per_transaction.toFixed(2)
                    : "N/A"}
                </td>
                <td>
                  {item.cumulative_spending
                    ? item.cumulative_spending.toFixed(2)
                    : "N/A"}
                </td>
                <td>{item.transaction_id || "N/A"}</td>
                <td>{item.customer_id || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h1>Retail Store Location Analysis</h1>

      {/* Legend */}
      <div style={{ marginBottom: "10px" }}>
        <span style={{ marginRight: "20px" }}>
          <span style={{ color: "blue", marginRight: "5px" }}>●</span> Existing
          Stores
        </span>
        <span>
          <span style={{ color: "green", marginRight: "5px" }}>●</span>{" "}
          Predicted Stores
        </span>
      </div>

      {/* Google Map */}
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => {
          console.log("Google Maps API Loaded");
          setMapLoaded(true);
        }}
        onError={(err) => {
          console.error("Google Maps API Load Error:", err);
          setError("Failed to load Google Maps API");
        }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={5}
        >
          {locations.physical.map((store, index) => (
            <Marker
              key={`physical-${index}`}
              position={{ lat: store.lat, lng: store.lng }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              onClick={() => setSelectedStore({ ...store, type: "physical" })}
            />
          ))}
          {locations.recommended.map((store, index) => (
            <Marker
              key={`recommended-${index}`}
              position={{ lat: store.lat, lng: store.lng }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              onClick={() =>
                setSelectedStore({ ...store, type: "recommended" })
              }
            />
          ))}
          {selectedStore && (
            <InfoWindow
              position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
              onCloseClick={() => setSelectedStore(null)}
            >
              <div
                style={{
                  maxWidth: "250px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "black",
                }}
              >
                <h3 style={{ margin: "0 0 5px 0", color: "black" }}>
                  {selectedStore.city}
                </h3>
                <p style={{ margin: "2px 0", color: "black" }}>
                  {selectedStore.type === "physical"
                    ? "Existing Store"
                    : "Predicted Store"}
                </p>
                <p style={{ margin: "2px 0", color: "black" }}>
                  <strong>Total Sales:</strong>{" "}
                  {selectedStore.total_sales_per_transaction
                    ? selectedStore.total_sales_per_transaction.toFixed(2)
                    : "N/A"}
                </p>
                <p style={{ margin: "2px 0", color: "black" }}>
                  <strong>Cumulative Spending:</strong>{" "}
                  {selectedStore.cumulative_spending
                    ? selectedStore.cumulative_spending.toFixed(2)
                    : "N/A"}
                </p>
                <p style={{ margin: "2px 0", color: "black" }}>
                  <strong>Transactions:</strong>{" "}
                  {selectedStore.transaction_id || "N/A"}
                </p>
                <p style={{ margin: "2px 0", color: "black" }}>
                  <strong>Unique Customers:</strong>{" "}
                  {selectedStore.customer_id || "N/A"}
                </p>
                {selectedStore.store_profit && (
                  <p style={{ margin: "2px 0", color: "black" }}>
                    <strong>Store Profit:</strong>{" "}
                    {selectedStore.store_profit.toFixed(2)}
                  </p>
                )}
                {selectedStore.daily_footfall && (
                  <p style={{ margin: "2px 0", color: "black" }}>
                    <strong>Daily Footfall:</strong>{" "}
                    {selectedStore.daily_footfall.toFixed(0)}
                  </p>
                )}
                {selectedStore.average_order_value && (
                  <p style={{ margin: "2px 0", color: "black" }}>
                    <strong>Avg Order Value:</strong>{" "}
                    {selectedStore.average_order_value.toFixed(2)}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

// Apply styles directly to thead and tbody elements
const styles = `
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  h2 {
    color: #333;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default GeographyChart;
