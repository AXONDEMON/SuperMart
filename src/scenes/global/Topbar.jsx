import React, { useState, useEffect } from "react";
import { 
  Box, IconButton, Tooltip, useTheme, Button, 
  Menu, MenuItem, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { isAuthenticated, storeCredentials, logout } from "../../user"; 
import GlobalSearch from "../../components/GlobalSearch"; // Import the existing GlobalSearch component

const Topbar = ({ setIsSidebar }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [auth, setAuth] = useState(isAuthenticated());
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  const handleLoginOpen = () => setOpenLogin(true);
  const handleLoginClose = () => setOpenLogin(false);

  const handleLoginSubmit = () => {
    if (!credentials.username || !credentials.password) {
      alert("Username and password cannot be empty!");  
      return;
    }

    const isValid = storeCredentials(credentials.username, credentials.password);
    if (isValid) {
      setAuth(true);
      setOpenLogin(false);
      navigate("/dashboard", { replace: true }); 
    } else {
      alert("Invalid username or password!");
      setCredentials({ username: "", password: "" });
    }
  };

  const handleLogout = () => {
    logout();
    setAuth(false);
    setAnchorEl(null);
    navigate("/login", { replace: true }); // Redirect without reload
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box display="flex" justifyContent="space-between" p={2} bgcolor={theme.palette.background.paper}>
      {/* Add GlobalSearch component in place of the removed IconButton */}
      <GlobalSearch />

      <Box display="flex" alignItems="center">
        <Tooltip title="Notifications">
          <IconButton>
            <NotificationsOutlinedIcon sx={{ color: theme.palette.text.primary }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton>
            <SettingsOutlinedIcon sx={{ color: theme.palette.text.primary }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Profile">
          <IconButton onClick={handleMenuOpen}>
            <PersonOutlinedIcon sx={{ color: theme.palette.text.primary }} />
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {auth ? (
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          ) : (
            <MenuItem onClick={handleLoginOpen}>Login</MenuItem>
          )}
        </Menu>
      </Box>

      {/* ✅ Login Dialog */}
      <Dialog open={openLogin} onClose={handleLoginClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginClose} color="secondary">Cancel</Button>
          <Button onClick={handleLoginSubmit} color="primary">Login</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Topbar;