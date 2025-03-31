import React, { useEffect, useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Papa from "papaparse";
import { Box, TextField, Autocomplete } from "@mui/material";

const clusterColors = {
  "Loyal Customers": "#4CAF50",
  "Big Spenders": "#1976D2",
  "Occasional Shoppers": "#FF9800",
  "At-Risk Customers": "#D32F2F",
};

const CustomTooltip = ({ active, payload, selectedCustomer }) => {
  if (!payload || payload.length === 0) return null;

  const { CustomerID, Segment, PCA1, PCA2 } = payload[0].payload;

  return (
    <div
      style={{
        background: "#FFF",
        padding: "15px",
        borderRadius: "10px",
        border: "2px solid #000",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.4)",
        textAlign: "center",
        fontWeight: "bold",
        width: "260px",
        display: selectedCustomer === CustomerID ? "block" : active ? "block" : "none",
      }}
    >
      <p style={{ margin: 0, fontSize: "18px", color: "#000" }}>
        <strong>Customer ID: {CustomerID}</strong>
      </p>
      <p style={{ margin: "8px 0", color: "#333" }}>Segment: {Segment}</p>
      <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
        PCA1: {PCA1.toFixed(2)}, PCA2: {PCA2.toFixed(2)}
      </p>
    </div>
  );
};

const PCAChart = () => {
  const [data, setData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetch("/data/customer_segments.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            if (!result.data || result.data.length === 0) return;

            const formattedData = result.data
              .filter(d => d.customer_id)
              .map(d => ({
                ...d,
                CustomerID: d.customer_id.toString(),
                Segment: d.Segment,
                PCA1: parseFloat(d.PCA1) || 0,
                PCA2: parseFloat(d.PCA2) || 0,
              }));
            setData(formattedData);
          },
        });
      })
      .catch(error => console.error("Error loading customer data:", error));
  }, []);

  // Handle input change for autocomplete and hover
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    const foundCustomer = data.find(d => d.CustomerID === newInputValue);
    if (foundCustomer) {
      setHoveredData(foundCustomer);
      setSelectedCustomer(newInputValue);
    } else {
      setHoveredData(null);
      setSelectedCustomer(null);
    }
  };

  return (
    <Box 
      height={550} 
      width="100%" 
      sx={{ 
        backgroundColor: "#1A1A1A", 
        padding: "20px", 
        borderRadius: "10px",
      }}
    >
      <Box mb={4} sx={{ textAlign: "center" }}>
        <h2 style={{ color: "#FFF", margin: 0 }}></h2>
      </Box>
      {/* Customer Search & Dropdown */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Autocomplete
          options={data.map(d => d.CustomerID)}
          getOptionLabel={(option) => option ? option.toString() : ""}
          onChange={(event, value) => setSelectedCustomer(value)}
          onInputChange={handleInputChange}
          inputValue={inputValue}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Customer ID"
              variant="outlined"
              sx={{
                width: 340,
                backgroundColor: "#FFF",
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#000',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#333',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#000',
                },
                '& .MuiInputBase-input': {
                  color: '#FFF', // White text inside
                },
              }}
            />
          )}
          sx={{
            '& .MuiAutocomplete-paper': {
              backgroundColor: '#1A1A1A',
              color: '#FFF',
              border: "2px solid #000",
              borderRadius: 2,
            },
            '& .MuiAutocomplete-option': {
              color: '#FFF',
              '&[aria-selected="true"]': {
                backgroundColor: '#000',
                color: '#FFF',
              },
              '&:hover': {
                backgroundColor: '#333',
                color: '#FFF',
              },
            },
          }}
        />
      </Box>

      {/* Scatter Plot */}
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            type="number" 
            dataKey="PCA1" 
            name="PCA Component 1" 
            tick={{ fill: "#FFF", fontSize: 12 }} 
            label={{ value: "", position: "bottom", offset: 0, fill: "#FFF", fontSize: 14 }}
          />
          <YAxis 
            type="number" 
            dataKey="PCA2" 
            name="PCA Component 2" 
            tick={{ fill: "#FFF", fontSize: 12 }} 
            label={{ value: "", position: "left", angle: -90, fill: "#FFF", fontSize: 14 }}
          />
          <Tooltip content={<CustomTooltip selectedCustomer={selectedCustomer} />} />
          <Legend wrapperStyle={{ color: "#FFF", fontSize: 14 }} />
          {data.length > 0 &&
            Object.keys(clusterColors).map((segment, index) => (
              <Scatter
                key={index}
                name={segment}
                data={data.filter(d => d.Segment === segment)}
                fill={clusterColors[segment]}
                shape="circle"
                opacity={0.6}
                r={5}
              />
            ))
          }
          {/* Highlight selected customer with black fill and white outline */}
          {hoveredData && (
            <Scatter
              name="Selected Customer"
              data={[hoveredData]}
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              shape="circle"
              r={8}
              opacity={1}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PCAChart;