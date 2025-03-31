import React, { useState } from "react";
import { Box, InputBase, IconButton, List, ListItem, ListItemButton, ListItemText, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { tokens } from "../theme";

const searchData = [
  { label: "Dashboard", path: "/"},
  { label: "Product Recommender", path: "/hybrid" },
  { label: "Store Exapansion", path: "/geography" },
  { label: "Geographic Store", path: "/geography" },
  { label: "Low Selling Products", path: "/bar" },
  { label: "PCA Chart", path: "/line" },
  { label: "Customer Lifetime Value", path: "/clv" },
  { label: "Yearly Sales Forecast", path: "/SalesForcast" },
];

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const colors = tokens("dark");

  
  const handleSearch = () => {
    if (filteredResults.length > 0) {
      navigate(filteredResults[0].path); 
    }
  };

  const updateSearchResults = (value) => {
    setQuery(value);
    if (value.trim() === "") {
      setFilteredResults([]);
      return;
    }

    const results = searchData.filter((item) =>
      item.label.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredResults(results);
    setSelectedIndex(-1); // Reset selection index
  };

  
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        prevIndex < filteredResults.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      navigate(filteredResults[selectedIndex].path);
    }
  };

  return (
    <Box display="flex" position="relative">
      <Box
        display="flex"
        backgroundColor="black"
        borderRadius="8px"
        sx={{
          "&:hover": { backgroundColor: colors.primary[300] },
          transition: "background-color 0.3s ease-in-out",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        <InputBase
          sx={{
            ml: 2,
            flex: 1,
            color: colors.grey[100],
            "::placeholder": { opacity: 0.8, color: colors.grey[300] },
          }}
          placeholder="Search..."
          value={query}
          onChange={(e) => updateSearchResults(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton type="button" sx={{ p: 1, color: colors.grey[200] }} onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>

      
      {filteredResults.length > 0 && (
        <Paper
          sx={{
            position: "absolute",
            top: "40px",
            left: 0,
            width: "100%",
            maxWidth: "300px",
            backgroundColor: colors.primary[400],
            zIndex: 10,
          }}
        >
          <List>
            {filteredResults.map((item, index) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={index === selectedIndex}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default GlobalSearch;
