import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Box } from "@mui/material";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const getBarColor = (conversionRate) => {
  if (conversionRate <= 8) return "rgba(255, 76, 76, 0.8)"; // Red
  if (conversionRate <= 25) return "rgba(110, 168, 254, 0.8)"; // Blue
  return "rgba(76, 175, 80, 0.8)"; // Green
};

const EnhancedChartJSBar = ({ height = 500 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/product_conversion_rate.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="#FFF"
      >
        Loading...
      </Box>
    );
  }

  // Group data by category
  const groupedData = data.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Ensure category appears only at the start of each group
  const labels = Object.entries(groupedData).flatMap(
    ([category, items]) =>
      items.map((item, index) => (index === 0 ? category : "")) // Show category only at the first product
  );

  const conversionRates = Object.values(groupedData).flatMap((items) =>
    items.map((item) => item.conversion_rate)
  );

  const backgroundColors = conversionRates.map((rate) => getBarColor(rate));

  const tooltipsData = Object.values(groupedData).flatMap((items) =>
    items.map((item) => ({
      product_name: item.product_name,
      category: item.category,
    }))
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Conversion Rate (%)",
        data: conversionRates,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map((color) => color.replace("0.8", "1")),
        borderWidth: 1,
        borderRadius: 5,
        barThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#FFFFFF",
          font: { size: 14 },
          generateLabels: () => [
            {
              text: "Low (≤ 8%)",
              fillStyle: "rgba(255, 76, 76, 0.8)",
              strokeStyle: "rgba(255, 76, 76, 1)",
            },
            {
              text: "Medium (9–25%)",
              fillStyle: "rgba(110, 168, 254, 0.8)",
              strokeStyle: "rgba(110, 168, 254, 1)",
            },
            {
              text: "High (> 25%)",
              fillStyle: "rgba(76, 175, 80, 0.8)",
              strokeStyle: "rgba(76, 175, 80, 1)",
            },
          ],
        },
      },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#000",
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10,
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const { product_name, category } = tooltipsData[index];
            return [
              `Product: ${product_name}`,
              `Category: ${category}`,
              `Conversion Rate: ${context.raw.toFixed(2)}%`,
            ];
          },
          title: () => null, // Hide default title to avoid duplication
        },
      },
      title: {
        display: true,
        text: "Product Conversion Rates by Category",
        color: "#FFFFFF",
        font: { size: 20 },
        padding: { top: 20, bottom: 20 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#FFFFFF",
          font: { size: 14, weight: "bold" },
          maxRotation: 0, // Rotate labels slightly to avoid overlap
          minRotation: 0,
          autoSkip: false, // Ensure all labels are displayed
          callback: (value, index) => (labels[index] ? labels[index] : ""), // Show category only at the first occurrence
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#FFFFFF",
          font: { size: 14, weight: "bold" },
          callback: (value) => `${value}%`,
          stepSize: 10,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Conversion Rate (%)",
          color: "#FFFFFF",
          font: { size: 16, weight: "bold" },
        },
        max: 50,
      },
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: "#1E1E1E",
        padding: "20px",
        borderRadius: "8px",
        height,
        color: "#FFF",
      }}
    >
      <h2 style={{ margin: "0 0 20px 0", fontSize: "24px", color: "#FFF" }}>
        Low Conversion Rate
      </h2>
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default EnhancedChartJSBar;
