import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { storeCredentials } from "../big";

const LoginPage = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleLogin = () => {
        console.log("Login button clicked!");
        console.log("Username:", credentials.username);
        console.log("Password:", credentials.password);

        if (!credentials.username || !credentials.password) {
            setError("Username and password cannot be empty!");
            return;
        }

        if (credentials.username === "admin" && credentials.password === "admin123") {
            storeCredentials(credentials.username, credentials.password);
            console.log("Login successful, navigating to dashboard...");

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 500);
        } else {
            setError("Invalid username or password!");
        }
    };

    return ( <
        Box display = "flex"
        alignItems = "center"
        justifyContent = "center"
        height = "100vh"
        width = "100vw"
        bgcolor = "#000000" // ✅ Outer Background is now Black
        sx = {
            { position: "absolute", top: 0, left: 0 } } >
        <
        Paper elevation = { 10 } // ✅ Added slight shadow for depth
        sx = {
            {
                padding: 4,
                width: "400px",
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: "#08392D", // ✅ Dark Green Inner Box
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "2px solid #32C693", // ✅ Neon Green Border
                boxShadow: "0px 0px 15px #32C693", // ✅ Glow Effect
            }
        } >
        <
        Typography variant = "h4"
        gutterBottom sx = {
            { fontWeight: "bold", color: "white" } } >
        Login <
        /Typography>

        {
            error && ( <
                Typography color = "error"
                sx = {
                    { mb: 2 } } >
                { error } <
                /Typography>
            )
        }

        <
        TextField label = "Username"
        variant = "outlined"
        fullWidth InputLabelProps = {
            { shrink: true } }
        sx = {
            {
                mb: 2,
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#32C693" }, // ✅ Neon Green Border
                    "&:hover fieldset": { borderColor: "#50E6A6" }, // Hover Effect
                    "&.Mui-focused fieldset": { borderColor: "#50E6A6" }, // Focus Effect
                },
            }
        }
        value = { credentials.username }
        onChange = {
            (e) => setCredentials({...credentials, username: e.target.value }) }
        />

        <
        TextField label = "Password"
        type = "password"
        variant = "outlined"
        fullWidth InputLabelProps = {
            { shrink: true } }
        sx = {
            {
                mb: 2,
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#32C693" }, // ✅ Neon Green Border
                    "&:hover fieldset": { borderColor: "#50E6A6" }, // Hover Effect
                    "&.Mui-focused fieldset": { borderColor: "#50E6A6" }, // Focus Effect
                },
            }
        }
        value = { credentials.password }
        onChange = {
            (e) => setCredentials({...credentials, password: e.target.value }) }
        />

        <
        Button variant = "contained"
        fullWidth sx = {
            {
                backgroundColor: "#28A079", // ✅ Bright Green Button
                color: "white",
                fontWeight: "bold",
                mt: 2,
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#32C693" }, // ✅ Lighter Green on Hover
                boxShadow: "0px 4px 10px #28A079", // ✅ Soft Button Glow
            }
        }
        onClick = { handleLogin } >
        LOGIN <
        /Button> <
        /Paper> <
        /Box>
    );
};

export default LoginPage;