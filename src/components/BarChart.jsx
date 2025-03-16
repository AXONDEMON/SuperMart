import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Box } from "@mui/material";

// Function to determine bar colors based on conversion rate
const getBarColor = (conversionRate) => {
  if (conversionRate <= 8) return "#FF4C4C"; // Red for Low Conversion (≤ 8%)
  if (conversionRate <= 25) return "#6ea8fe"; // Blue for Medium Conversion (9%–25%)
  return "#4CAF50"; // Green for High Conversion (> 25%)
};

// Custom Tooltip to include product name inside the block
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const { conversion_rate, category, product_name } = payload[0].payload;

  return (
    <div
      style={{
        background: "#FFF",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
        color: "#333",
        textAlign: "center",
        fontWeight: "bold",
        width: "220px",
      }}
    >
      <p style={{ margin: 0, fontSize: "14px", color: "#000" }}>
        <strong>{product_name}</strong>
      </p>
      <p style={{ margin: "5px 0", color: "#555" }}>Category: {category}</p>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: getBarColor(conversion_rate) }}>
        Conversion Rate: {conversion_rate}%
      </p>
    </div>
  );
};

const renderLegend = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px", color: "#FFF", fontSize: "14px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: "15px", height: "15px", backgroundColor: "#FF4C4C", marginRight: "5px" }}></div>
        Low Conversion (≤ 8%)
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: "15px", height: "15px", backgroundColor: "#6ea8fe", marginRight: "5px" }}></div>
        Medium Conversion (9%–25%)
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: "15px", height: "15px", backgroundColor: "#4CAF50", marginRight: "5px" }}></div>
        High Conversion (> 25%)
      </div>
    </div>
  );
};

const BarChartComponent = ({ height = 400 }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/data/product_conversion_rate.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((error) => console.error("❌ Error loading the conversion rate data:", error));
  }, []);

  // Group products by category for better X-axis labeling
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const formattedData = Object.entries(groupedData).flatMap(([category, items]) =>
    items.map((item, index) => ({
      ...item,
      categoryLabel: index === Math.floor(items.length / 2) ? category : "",
      spacingLabel: index === 0 ? category : ""
    }))
  );

  return (
    <Box height={height} width="100%">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 40, right: 20, left: 20, bottom: 100 }}>
          <XAxis
            dataKey="spacingLabel"
            interval={0}
            tick={{ fill: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}
            axisLine={{ stroke: "#FFFFFF" }}
            padding={{ left: 40, right: 40 }}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "#FFFFFF", fontSize: 12 }}
            axisLine={{ stroke: "#FFFFFF" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          <Bar dataKey="conversion_rate" barSize={40}>
            {formattedData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.conversion_rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChartComponent;