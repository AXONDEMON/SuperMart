import React, { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Papa from "papaparse";
import { Box } from "@mui/material";

// Define cluster colors matching your CSV segments
const clusterColors = {
  "Loyal Customers": "#4CAF50",
  "Big Spenders": "#1976D2",
  "Occasional Shoppers": "#FF9800",
  "At-Risk Customers": "#D32F2F",
};

// Tooltip Customization
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const { CustomerID, Segment, PCA1, PCA2 } = payload[0].payload;

  return (
    <div
      style={{
        background: "#FFF",
        padding: "10px",
        borderRadius: "8px",
        border: "2px solid #000",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        fontWeight: "bold",
        width: "220px",
      }}
    >
      <p style={{ margin: 0, fontSize: "14px", color: "#000" }}>
        <strong>Customer ID: {CustomerID}</strong>
      </p>
      <p style={{ margin: "5px 0", color: "#555" }}>Segment: {Segment}</p>
      <p style={{ margin: 0, fontSize: "12px", color: "#777" }}>
        PCA1: {PCA1.toFixed(2)}, PCA2: {PCA2.toFixed(2)}
      </p>
    </div>
  );
};

const LineChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/data/customer_segments.csv")
      .then((response) => response.text())
      .then((csvText) => {
        console.log("📌 CSV Raw Data Loaded:", csvText);

        if (!csvText || csvText.length < 10) {
          console.error("❌ CSV file is empty or not loaded properly!");
          return;
        }

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            console.log("✅ Parsed Data Array:", result.data);
            if (!result.data || result.data.length === 0) {
              console.error("❌ CSV Parsed but No Data Found!");
              return;
            }

            const formattedData = result.data.map(d => ({
              ...d,
              CustomerID: d.customer_id,  // Map customer_id to CustomerID
              Segment: d.Segment,         // Use Segment directly as per your CSV
              PCA1: parseFloat(d.PCA1) || 0,
              PCA2: parseFloat(d.PCA2) || 0,
            }));
            setData(formattedData);
          },
        });
      })
      .catch(error => console.error("❌ Error loading CSV:", error));
  }, []);

  return (
    <Box height={500} width="100%" sx={{ border: "none", backgroundColor: "transparent" }}>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 30, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis type="number" dataKey="PCA1" name="PCA Component 1" tick={{ fill: "#FFF" }} />
          <YAxis type="number" dataKey="PCA2" name="PCA Component 2" tick={{ fill: "#FFF" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {data.length > 0 && Object.keys(clusterColors).map((segment, index) => (
            <Scatter
              key={index}
              name={segment}
              data={data.filter(d => d.Segment === segment)}
              fill={clusterColors[segment]}
              shape="circle"
              opacity={0.7}
              lineWidth={0.5}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;
