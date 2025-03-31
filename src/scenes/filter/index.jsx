import React, { useState, useEffect } from "react";

const Team = () => {
  const [customerId, setCustomerId] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [state, setState] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [storeType, setStoreType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loyaltyStatus, setLoyaltyStatus] = useState("");
  const [minAnnualIncome, setMinAnnualIncome] = useState("");
  const [maxAnnualIncome, setMaxAnnualIncome] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [visibleRows, setVisibleRows] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage] = useState(10);

  useEffect(() => {
    const fetchCities = async () => {
      const response = await fetch("http://127.0.0.1:5002/api/get_cities");
      const data = await response.json();
      setCities(data);
    };
    fetchCities();
  }, []);

  const fetchFilteredData = async (page = 1) => {
    setIsLoading(true);
    let url = `http://127.0.0.1:5002/api/get_filtered_data?page=${page}&per_page=${perPage}`;
    if (customerId) url += `&customer_id=${customerId}`;
    if (city) url += `&city=${city}`;
    if (state) url += `&state=${state}`;
    if (startDate && endDate) url += `&start_date=${startDate}&end_date=${endDate}`;
    if (category) url += `&category=${category}`;
    if (productName) url += `&product_name=${productName}`;
    if (storeType) url += `&store_type=${storeType}`;
    if (paymentMethod) url += `&payment_method=${paymentMethod}`;
    if (loyaltyStatus) url += `&loyalty_status=${loyaltyStatus}`;
    if (minAnnualIncome) url += `&min_annual_income=${minAnnualIncome}`;
    if (maxAnnualIncome) url += `&max_annual_income=${maxAnnualIncome}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setFilteredData(data.data);
      setTotalRecords(data.total_records);
      setCurrentPage(data.page);
      setVisibleRows(perPage);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!filteredData.length || !sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  const validateIncome = (min, max) => {
    if (min && max && parseFloat(min) > parseFloat(max)) {
      alert("Min Annual Income cannot be greater than Max Annual Income!");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (minAnnualIncome && maxAnnualIncome && !validateIncome(minAnnualIncome, maxAnnualIncome)) {
      setMinAnnualIncome("");
      setMaxAnnualIncome("");
    }
  }, [minAnnualIncome, maxAnnualIncome]);

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "1rem",
    backgroundColor: "#1a1a1a",
  };

  const cardStyle = {
    borderRadius: "1.5rem",
    width: "100%",
    maxWidth: "75rem",
  };

  const headerStyle = {
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: "2.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
  };

  const buttonToggleStyle = {
    fontWeight: "600",
    borderRadius: "0.75rem",
    border: "none",
    backgroundColor: "#444",
    color: "#fff",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  };

  const inputStyle = {
    borderRadius: "1rem",
    border: "none",
    outline: "none",
    fontSize: "1rem",
    backgroundColor: "#444",
    color: "#fff",
    padding: "0.5rem 0.75rem",
    width: "200px",
    height: "48px",
    boxSizing: "border-box",
    textAlign: "left",
    lineHeight: "1.5",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    padding: "0.5rem 0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  const buttonStyle = {
    width: "100%",
    fontWeight: "700",
    borderRadius: "1rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    backgroundColor: "#444",
    color: "#fff",
    padding: "0.75rem",
    marginTop: "1rem",
  };

  const disabledButtonStyle = {
    opacity: "0.5",
    cursor: "not-allowed",
  };

  const tableContainerStyle = {
    marginTop: "3.5rem",
    borderRadius: "1.25rem",
    border: "2px solid #222",
  };

  const filteredDataHeaderStyle = {
    fontSize: "1.75rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    paddingBottom: "0.75rem",
    borderBottom: "2px solid #222",
    color: "#fff",
  };

  const tableHeaderStyle = {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#000",
    backgroundColor: "#f0f0f0",
    padding: "1rem",
  };

  const tableCellStyle = {
    borderBottom: "none",
    cursor: "pointer",
    fontSize: "1rem",
  };

  const tableRowStyle = {
    borderTop: "none",
  };

  const noDataStyle = {
    marginTop: "3.5rem",
    textAlign: "center",
    fontSize: "1.5rem",
    color: "#fff",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span>Self Service Reports</span>
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} style={buttonToggleStyle}>
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {isFilterOpen && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
            <input
              type="text"
              placeholder="Customer ID"
              style={inputStyle}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
            <select style={selectStyle} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="" style={{ color: "#fff" }}>All Cities</option>
              {cities.map((cityOption, index) => (
                <option key={index} value={cityOption} style={{ color: "#fff" }}>
                  {cityOption}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="State"
              style={inputStyle}
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <input
              type="date"
              style={inputStyle}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              style={inputStyle}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Category"
              style={inputStyle}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <input
              type="text"
              placeholder="Product Name"
              style={inputStyle}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Store Type"
              style={inputStyle}
              value={storeType}
              onChange={(e) => setStoreType(e.target.value)}
            />
            <input
              type="text"
              placeholder="Payment Method"
              style={inputStyle}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <input
              type="text"
              placeholder="Loyalty Status"
              style={inputStyle}
              value={loyaltyStatus}
              onChange={(e) => setLoyaltyStatus(e.target.value)}
            />
            <input
              type="number"
              placeholder="Min Annual Income"
              style={inputStyle}
              value={minAnnualIncome}
              onChange={(e) => setMinAnnualIncome(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max Annual Income"
              style={inputStyle}
              value={maxAnnualIncome}
              onChange={(e) => setMaxAnnualIncome(e.target.value)}
            />
            <select style={selectStyle} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="" style={{ color: "#fff" }}>All Payments</option>
              <option value="UPI" style={{ color: "#fff" }}>UPI</option>
              <option value="Debit Card" style={{ color: "#fff" }}>Debit Card</option>
              <option value="Credit Card" style={{ color: "#fff" }}>Credit Card</option>
              <option value="Wallet" style={{ color: "#fff" }}>Wallet</option>
            </select>
          </div>
        )}

        <button
          style={{ ...buttonStyle, ...(isLoading ? disabledButtonStyle : {}) }}
          onClick={() => fetchFilteredData(currentPage)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ height: "1.25rem", width: "1.25rem", marginRight: "0.5rem", animation: "spin 1s linear infinite" }} viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25, cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }}></circle>
                <path style={{ opacity: 0.75, fill: "currentColor" }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            "Apply Filters"
          )}
        </button>

        {filteredData.length > 0 ? (
          <div style={tableContainerStyle}>
            <h3 style={filteredDataHeaderStyle}>
              Filtered Data ({totalRecords} results)
            </h3>

            <div style={{ overflowX: "auto", borderRadius: "1.25rem" }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={tableCellStyle} onClick={() => requestSort("transaction_date")}>
                      Transaction Date {sortConfig.key === "transaction_date" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th style={tableCellStyle} onClick={() => requestSort("customer_id")}>
                      Customer ID {sortConfig.key === "customer_id" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th style={tableCellStyle} onClick={() => requestSort("city")}>
                      City {sortConfig.key === "city" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th style={tableCellStyle} onClick={() => requestSort("state")}>
                      State {sortConfig.key === "state" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th style={tableCellStyle} onClick={() => requestSort("category")}>
                      Category {sortConfig.key === "category" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th style={tableCellStyle} onClick={() => requestSort("product_name")}>
                      Product Name {sortConfig.key === "product_name" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th style={tableCellStyle} onClick={() => requestSort("store_type")}>
                      Store Type {sortConfig.key === "store_type" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                    <th style={tableCellStyle} onClick={() => requestSort("payment_method")}>
                      Payment Method {sortConfig.key === "payment_method" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedData().slice(0, visibleRows).map((item, index) => (
                    <tr key={index} style={tableRowStyle}>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.transaction_date}</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.customer_id}</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.city}</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.state}</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.category}</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.product_name}</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.store_type}</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{item.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visibleRows < totalRecords && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}>
                <button
                  style={buttonStyle}
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    fetchFilteredData(currentPage + 1);
                  }}
                >
                  See More
                </button>
              </div>
            )}
          </div>
        ) : (
          <p style={noDataStyle}>No filtered data available. Apply filters to fetch results.</p>
        )}
      </div>
    </div>
  );
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  /* Ensure placeholder text is white for inputs */
  input::placeholder {
    color: #fff;
    opacity: 1; /* Override default opacity */
  }
  /* Ensure select options are white (though this is limited by browser support) */
  select option {
    color: #fff;
    background-color: #444;
  }
  select:invalid {
    color: #fff;
  }
`;
document.head.appendChild(styleSheet);

export default Team;