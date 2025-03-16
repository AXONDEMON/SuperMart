import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [predictedData, setPredictedData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch actual sales data
  useEffect(() => {
    fetch("http://localhost:5001/api/get_sales_data")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch sales data: ${res.status}`);
        return res.json();
      })
      .then((data) => setSalesData(data))
      .catch((error) => {
        console.error("Error fetching sales data:", error);
        setError(error.message);
      });
  }, []);

  // Fetch predicted sales data
  useEffect(() => {
    fetch("http://localhost:5001/api/predict_sales")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch predictions: ${res.status}`);
        return res.json();
      })
      .then((data) => setPredictedData(data))
      .catch((error) => {
        console.error("Error fetching predictions:", error);
        setError(error.message);
      });
  }, []);

  // Process Data for Chart
  useEffect(() => {
    if (!salesData.length || !predictedData.length) return;

    const allYears = Array.from({ length: 8 }, (_, i) => (2021 + i).toString());
    const actualSalesMap = Object.fromEntries(
      salesData.map((row) => [row.Year.toString(), row.total_amt])
    );
    const predictedSalesMap = Object.fromEntries(
      predictedData.map((row) => [row.year.toString(), row.predicted_sales])
    );

    const actualSales = allYears.map((year) => actualSalesMap[year] || null);
    const predictedSales = allYears.map((year) => predictedSalesMap[year] || null);

    setChartData({
      labels: allYears,
      datasets: [
        {
          label: "Actual Sales (Rs)",
          data: actualSales,
          borderColor: "#f39c12",
          backgroundColor: "rgba(243, 156, 18, 0.2)",
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: "Predicted Sales",
          data: predictedSales,
          borderColor: "#1abc9c",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.3,
        },
      ],
    });
  }, [salesData, predictedData]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Yearly Sales Forecast (2021 - 2028)" },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: "Total Sales (Rs)" },
        min: 80000000,  // Adjust this value to set the lower limit of the Y-axis
      },
      x: {
        title: { display: true, text: "Year" },
      },
    },
  };
  

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : chartData ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default SalesChart;