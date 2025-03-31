import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LineChart from "../../components/PCAChart";
import StatBox from "../../components/StatBox";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import React, { useState, useEffect, useRef } from "react";


const Dashboard = () => {
  const handleRedirect = () => {
    window.location.href = "http://127.0.0.1:8000/docs";
};
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery("(max-width: 1200px)");

  const [totalSales, setTotalSales] = useState(null);
  const [totalProfit, setTotalProfit] = useState(null);
  const [averageBasketSize, setAverageBasketSize] = useState(null);
  const [lowConversionProducts, setLowConversionProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 

  const scrollRef = useRef(null); 

  // Fetch all data together for render loading
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [salesProfitRes, basketSizeRes, conversionRes] = await Promise.all([
          fetch("/data/sales_profit_metrics.json").then((res) => res.json()),
          fetch("/data/average_basket_size.json").then((res) => res.json()),
          fetch("/data/product_conversion_rate.json").then((res) => res.json()),
        ]);

        setTotalSales(salesProfitRes.total_sales?.toLocaleString() || "N/A");
        setTotalProfit(salesProfitRes.total_profit?.toLocaleString() || "N/A");
        setAverageBasketSize(basketSizeRes.average_basket_size?.toLocaleString() || "N/A");
        setLowConversionProducts(
          conversionRes.filter((item) => item.conversion_rate <= 8) || []
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setTotalSales("Error");
        setTotalProfit("Error");
        setAverageBasketSize("Error");
        setLowConversionProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Automatic Scrolling Automation for Low Insights Products
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || lowConversionProducts.length <= 5) return;
  
    let scrollAmount = 0;
    const scrollSpeed = 0.8; 
    let isPaused = false;
    let animationFrameId = null;
  
    const scrollContent = () => {
      if (!container) return;
  
      if (!isPaused) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        scrollAmount += scrollSpeed;
  
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0; // Reset to top when reached the end
          container.scrollTop = 0;
        } else {
          container.scrollTop = scrollAmount; // Smoothly scroll down if req
        }
      }
  
      animationFrameId = requestAnimationFrame(scrollContent);
    };
  
    const pauseScroll = () => {
      isPaused = true;
    };
  
    const resumeScroll = () => {
      isPaused = false;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(scrollContent);
      }
    };
  
    // event listeners for hover pause/resume
    container.addEventListener("mouseenter", pauseScroll);
    container.addEventListener("mouseleave", resumeScroll);
  
    animationFrameId = requestAnimationFrame(scrollContent);
  
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); 
      }
      container.removeEventListener("mouseenter", pauseScroll);
      container.removeEventListener("mouseleave", resumeScroll);
    };
  }, [lowConversionProducts]);
  
  

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
      >
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="minmax(150px, auto)" // Ensures even row heights
        gap="20px"
      >
        {/* STATISTICS BOXES */}
        {[
          {
            title: isLoading ? "Loading..." : `₹${totalSales}`,
            subtitle: "Total Sales",
            icon: <PointOfSaleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />,
          },
          {
            title: isLoading ? "Loading..." : `₹${totalProfit}`,
            subtitle: "Total Profit",
            icon: <PointOfSaleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />,
          },
          {
            title: isLoading ? "Loading..." : "1500", 
            subtitle: "Current Clients",
            icon: <PersonAddIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />,
          },
          {
            title: isLoading ? "Loading..." : `₹${averageBasketSize}`,
            subtitle: "Average Basket Size",
            icon: <ShoppingBasketIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />,
          },
        ].map((stat, index) => (
          <Box
            key={index}
            gridColumn={isSmallScreen ? "span 6" : "span 3"}
            backgroundColor="#212121"
            borderRadius="10px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="20px"
            height="150px" 
          >
            <StatBox
              title={stat.title}
              subtitle={stat.subtitle}
              icon={stat.icon}
            />
          </Box>
        ))}

        {/*PCA Chart */}
        <Box
          gridColumn={isSmallScreen ? "span 12" : "span 8"}
          gridRow="span 3"
          backgroundColor="#212121"
          borderRadius="10px"
          p="20px"
          height="600px" 
        >
          <LineChart isDashboard={true} />
        </Box>

        {/* LOW CONVERSION PRODUCTS */}
        <Box
  gridColumn={isSmallScreen ? "span 12" : "span 4"}
  gridRow="span 3"
  backgroundColor="#212121"
  borderRadius="10px"
  p="20px"
  height="400px" 
  display="flex"
  flexDirection="column"
>
  <Typography
    variant="h5"
    fontWeight="800"
    sx={{ mb: "15px", color: "#FF4C4C" }}
  >
    ⚠️ Low Conversion Products
  </Typography>

  {/* Scrollable Box with Better Styling */}
  <Box
  ref={scrollRef}
  maxHeight="310px"
  overflow="auto"
  flexGrow={1}
  sx={{
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#333",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#777",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#999",
    },
  }}
>


    {isLoading ? (
      <Typography color="#AAAAAA">Loading...</Typography>
    ) : lowConversionProducts.length > 0 ? (
      <ul
        style={{
          textAlign: "left",
          paddingLeft: "20px",
          color: "#FFFFFF",
          fontSize: "16px",
          margin: 0,
        }}
      >
        {lowConversionProducts.map((item, index) => (
          <li
            key={index}
            style={{ fontSize: "18px", marginBottom: "10px", padding: "5px 0" }}
          >
            <b>{item.product_name}</b> ({item.category}) -{" "}
            <span style={{ color: "#FF4C4C" }}>
              {item.conversion_rate.toFixed(2)}%
            </span>
            <br />
            <Typography
              variant="body2"
              sx={{
                fontSize: "15px",
                color: "#FFA07A",
                fontStyle: "italic",
                mt: "5px",
              }}
            >
              Consider rebranding, discounts, or promotions.
            </Typography>
          </li>
        ))}
      </ul>
    ) : (
      <Typography color="#AAAAAA">
        No low conversion products detected
      </Typography>
    )}
  </Box>
</Box>


        
      </Box>
    </Box>
  );
};

export default Dashboard;