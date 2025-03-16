import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/filter";
import Hybrid from "./scenes/hybrid";
import Contacts from "./scenes/SalesForcast";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/clv";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./big";
import "./App.css";

function App() {
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(() => {
        // ✅ Fix: Corrected optional chaining syntax
        const storedSidebarState = localStorage.getItem("isSidebar");
        return storedSidebarState !== null ? JSON.parse(storedSidebarState) : true;
    });
    const [filteredData, setFilteredData] = useState([]);

    // ✅ Ensure Sidebar State is Saved in Local Storage
    useEffect(() => {
        localStorage.setItem("isSidebar", JSON.stringify(isSidebar));
    }, [isSidebar]);

    return ( <
            ColorModeContext.Provider value = { colorMode } >
            <
            ThemeProvider theme = { theme } >
            <
            CssBaseline / >
            <
            div className = "app" > {
                isAuthenticated() ? ( <
                    >
                    <
                    Sidebar isSidebar = { isSidebar }
                    /> <
                    main className = "content" >
                    <
                    Topbar setIsSidebar = { setIsSidebar }
                    /> <
                    Routes >
                    <
                    Route path = "/dashboard"
                    element = { < ProtectedRoute > < Dashboard / > < /ProtectedRoute>} / >
                        <
                        Route path = "/filter"
                        element = { < ProtectedRoute > < Team setFilteredData = { setFilteredData }
                            filteredData = { filteredData }
                            /></ProtectedRoute >
                        }
                        /> <
                        Route path = "/SalesForcast"
                        element = { < ProtectedRoute > < Contacts filteredData = { filteredData } /></ProtectedRoute > }
                        /> <
                        Route path = "/Hybrid"
                        element = { < ProtectedRoute > < Hybrid / > < /ProtectedRoute>} / >
                            <
                            Route path = "/form"
                            element = { < ProtectedRoute > < Form / > < /ProtectedRoute>} / >
                                <
                                Route path = "/bar"
                                element = { < ProtectedRoute > < Bar / > < /ProtectedRoute>} / >
                                    <
                                    Route path = "/clv"
                                    element = { < ProtectedRoute > < Pie / > < /ProtectedRoute>} / >
                                        <
                                        Route path = "/line"
                                        element = { < ProtectedRoute > < Line / > < /ProtectedRoute>} / >
                                            <
                                            Route path = "/faq"
                                            element = { < ProtectedRoute > < FAQ / > < /ProtectedRoute>} / >
                                                <
                                                Route path = "/calendar"
                                                element = { < ProtectedRoute > < Calendar / > < /ProtectedRoute>} / >
                                                    <
                                                    Route path = "/geography"
                                                    element = { < ProtectedRoute > < Geography / > < /ProtectedRoute>} / >
                                                        <
                                                        Route path = "*"
                                                        element = { < Navigate to = "/dashboard" / > }
                                                        /> < /
                                                        Routes > <
                                                        /main> < / >
                                                    ): ( <
                                                        Routes >
                                                        <
                                                        Route path = "/login"
                                                        element = { < LoginPage / > }
                                                        /> <
                                                        Route path = "*"
                                                        element = { < Navigate to = "/login" / > }
                                                        /> < /
                                                        Routes >
                                                    )
                                                } <
                                                /div> < /
                                                ThemeProvider > <
                                                /ColorModeContext.Provider>
                                            );
                                        }

                                        export default App;