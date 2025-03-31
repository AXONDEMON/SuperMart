import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";

const DatabaseCrud = () => {
  // Function to open the API Docs link
  const handleOpenDocs = () => {
    window.open("http://127.0.0.1:8000/docs", "_blank");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#1f1f1f"
      sx={{
        background: "linear-gradient(135deg, #1f1f1f 0%, rgb(0, 4, 3) 100%)",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(0, 0, 0, 0.8) 0%, transparent 70%)",
          animation: "pulse 10s infinite ease-in-out",
        },
        "@keyframes pulse": {
          "0%": { transform: "scale(0.5)" },
          "50%": { transform: "scale(1.5)" },
          "100%": { transform: "scale(0.5)" },
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: { xs: 3, sm: 4 },
          textAlign: "center",
          borderRadius: "16px",
          background: "linear-gradient(145deg, #08392D 0%, #38B68E 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: { xs: "300px", sm: "400px" },
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 182, 142, 0.2)",
          border: "1px solid rgba(56, 182, 142, 0.2)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 15px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 182, 142, 0.3)",
          },
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(56, 182, 142, 0.1), transparent)",
            animation: "shine 5s infinite",
          },
          "@keyframes shine": {
            "0%": { left: "-100%" },
            "20%": { left: "100%" },
            "100%": { left: "100%" },
          },
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "2px",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(56, 182, 142, 0.2)",
            animation: "fadeIn 1s ease-in",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          Database CRUD Operations
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: "16px",
            opacity: 0.8,
            marginBottom: 2,
            color: "#e0f7e9",
          }}
        >
          Manage database records efficiently with a modern UI.
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenDocs} // Button Click Event
          sx={{
            marginTop: 2,
            padding: "10px 30px",
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "25px",
            background: "linear-gradient(45deg, #38B68E 30%, #21CBF3 90%)",
            boxShadow: "0 5px 15px rgba(56, 182, 142, 0.4)",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              background: "linear-gradient(45deg, #2E8F70 30%, #42A5F5 90%)",
              transform: "scale(1.05)",
              boxShadow: "0 7px 20px rgba(56, 182, 142, 0.6)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
            "&:focus": {
              outline: "2px solid #38B68E",
            },
          }}
        >
          Modify Database
        </Button>
      </Paper>
    </Box>
  );
};

export default DatabaseCrud;