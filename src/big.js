// big.js

export const storeCredentials = (username, password) => {
    const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem("authUser", JSON.stringify({ username }));
        return true;
    }
    return false;
};

export const isAuthenticated = () => {
    return Boolean(localStorage.getItem("authUser"));
};

export const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authUser"); // ✅ Remove user session data
    sessionStorage.clear(); // ✅ Clear any session storage (if used)
    window.location.reload(); // 🔥 Force UI update after logout
};