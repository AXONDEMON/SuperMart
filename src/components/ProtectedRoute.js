import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../user";

const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : < Navigate to = "/login"
    replace / > ;
};

export default ProtectedRoute;