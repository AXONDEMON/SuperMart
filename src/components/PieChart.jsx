import React, { useState, useEffect, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const [cltvData, setCltvData] = useState([]);
  const [days, setDays] = useState(365);
  const [avgOrderValue, setAvgOrderValue] = useState(null);
  const [purchaseFreq, setPurchaseFreq] = useState(null);
  const [lifespan, setLifespan] = useState(null);
  const [profitMargin, setProfitMargin] = useState(0.35);
  const [customerId, setCustomerId] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [customerIds, setCustomerIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = {
      days,
      avg_order_value: avgOrderValue,
      purchase_freq: purchaseFreq,
      lifespan: lifespan,
      profit_margin: profitMargin,
      customer_id: showAll ? '' : customerId,
    };
    const queryParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
    ).toString();
    try {
      const response = await axios.get(`http://localhost:5000/api/future_cltv?${queryParams}`);
      if (response.data.error) {
        alert(response.data.error);
      } else {
        setCltvData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching future CLTV data:', error);
    } finally {
      setLoading(false);
    }
  }, [days, avgOrderValue, purchaseFreq, lifespan, profitMargin, customerId, showAll]);

  useEffect(() => {
    const fetchCustomerIds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/future_cltv');
        const ids = [...new Set(response.data.data.map(item => item.customer_id))];
        setCustomerIds(ids);
      } catch (error) {
        console.error('Error fetching customer IDs:', error);
      }
    };
    fetchCustomerIds();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value);
    setter(value);
  };

  const handleCustomerIdChange = (e) => {
    setCustomerId(e.target.value);
  };

  const categorizeCLTV = (data) => {
    const ranges = {
      '0-5000': 0,
      '5000-20000': 0,
      '20000+': 0,
    };
    data.forEach(item => {
      const cltv = item.cltv || 0;
      if (cltv <= 5000) ranges['0-5000']++;
      else if (cltv <= 20000) ranges['5000-20000']++;
      else ranges['20000+']++;
    });
    return ranges;
  };

  const categorizedData = categorizeCLTV(cltvData);

  const chartData = {
    labels: Object.keys(categorizedData),
    datasets: [
      {
        label: 'Future CLTV Distribution',
        data: Object.values(categorizedData),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#FFFFFF',
        },
      },
      title: {
        display: true,
        text: `Future CLTV Distribution (${days} Days)`,
        color: '#FFFFFF',
        font: {
          size: 20,
          weight: 'bold',
        },
      },
    },
    aspectRatio: 2,
    devicePixelRatio: window.devicePixelRatio > 1 ? 2 : 1,
  };

  return (
    <div style={{ width: '800px', margin: '0 auto', textAlign: 'center', color: '#FFFFFF' }}>
      <h2 style={{ color: '#FFFFFF' }}>Predicted Customer Lifetime Value</h2>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ margin: '10px 0' }}>
          <label>Days: 
            <input 
              type="number" 
              value={days} 
              onChange={handleInputChange(setDays)} 
              min="1" 
              style={{ padding: '5px', marginLeft: '10px' }} 
            />
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>Avg Order Value: 
            <input 
              type="number" 
              value={avgOrderValue || ''} 
              onChange={handleInputChange(setAvgOrderValue)} 
              step="0.01" 
              style={{ padding: '5px', marginLeft: '10px' }} 
            />
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>Purchase Freq: 
            <input 
              type="number" 
              value={purchaseFreq || ''} 
              onChange={handleInputChange(setPurchaseFreq)} 
              step="0.01" 
              style={{ padding: '5px', marginLeft: '10px' }} 
            />
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>Lifespan (years): 
            <input 
              type="number" 
              value={lifespan || ''} 
              onChange={handleInputChange(setLifespan)} 
              step="0.01" 
              style={{ padding: '5px', marginLeft: '10px' }} 
            />
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>Profit Margin: 
            <input 
              type="number" 
              value={profitMargin} 
              onChange={handleInputChange(setProfitMargin)} 
              step="0.01" 
              min="0" 
              max="1" 
              style={{ padding: '5px', marginLeft: '10px' }} 
            />
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>View: 
            <select 
              value={showAll ? 'all' : 'single'} 
              onChange={(e) => setShowAll(e.target.value === 'all')} 
              style={{ padding: '5px', marginLeft: '10px' }}
            >
              <option value="all">All Customers</option>
              <option value="single">Single Customer</option>
            </select>
          </label>
        </div>
        {!showAll && (
          <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={customerId}
              onChange={handleCustomerIdChange}
              placeholder="Enter Customer ID"
              style={{ padding: '5px', marginLeft: '10px' }}
            />
            <select value={customerId || ''} onChange={(e) => setCustomerId(e.target.value)} style={{ padding: '5px' }}>
              <option value="">Select from List</option>
              {customerIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {loading ? (
        <p>Loading future CLTV data...</p>
      ) : cltvData.length > 0 ? (
        <>
          <Pie data={chartData} options={options} />
          <h3>Individual CLTV Values</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Customer ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>CLTV</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>LTV</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {cltvData.map((item, index) => (
                <tr key={index} style={{ border: '1px solid #ddd' }}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.customer_id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.cltv.toFixed(2)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.ltv.toFixed(2)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.avg_order_value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default PieChart;