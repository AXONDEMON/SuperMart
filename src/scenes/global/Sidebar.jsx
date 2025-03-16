import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, useMediaQuery, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import FilterListIcon from "@mui/icons-material/FilterList"; // ✅ Unique Icon for Filters

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Tooltip title={title} arrow>
      <MenuItem
        active={selected === title}
        style={{
          color: colors.grey[100],
          transition: "0.3s",
        }}
        onClick={() => setSelected(title)}
        icon={icon}
      >
        <Typography>{title}</Typography>
        <Link to={to} />
      </MenuItem>
    </Tooltip>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box
      sx={{
        backgroundColor: "#38B68E", // Changed background color
        "& .pro-sidebar-inner": {
          background: "#08392D", // Sidebar background
          transition: "all 0.3s ease-in-out",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
          transform: "scale(1.05)",
          transition: "0.3s ease-in-out",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isMobile ? true : isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                {/* RetailPro Logo with Custom Icon */}
                <Box display="flex" alignItems="center">
                  <StorefrontIcon sx={{ fontSize: 20, mr: 1, color: colors.greenAccent[500] }} /> {/* Small Icon */}
                  <Typography variant="h4" color={colors.grey[100]}>
                    SuperMart
                  </Typography>
                </Box>

                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item title="Dashboard" to="/" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Filters" to="/filter" icon={<PeopleOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Yearly Sales Forecast" to="/SalesForcast" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Product Recommend" to="/hybrid" icon={<ReceiptOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Calendar" to="/calendar" icon={<CalendarTodayOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Low Selling Products" to="/bar" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Customer Lifetime Value Prediction" to="/clv" icon={<PieChartOutlineOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Customer Behaviour" to="/line" icon={<TimelineOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Geography " to="/geography" icon={<MapOutlinedIcon />} selected={selected} setSelected={setSelected} />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;