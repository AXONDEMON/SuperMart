import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Papa from "papaparse";

const Calendar = () => {
  const heatmapRef = useRef();
  const [salesData, setSalesData] = useState([]);
  const [maxSales, setMaxSales] = useState(0);

  useEffect(() => {
    fetch("/data/precomputed_sales_data_audi_2028.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            if (!result.data || result.data.length === 0) {
              console.error("❌ Sales Data is empty!");
              return;
            }

            const parsedData = result.data.map((d) => ({
              ...d,
              Sales: +d.Sales,
              Profit: +d.Profit,
            }));

            const calculatedMaxSales = d3.max(parsedData, (d) => d.Sales);
            setMaxSales(calculatedMaxSales);
            setSalesData(parsedData);
          },
        });
      })
      .catch((error) => console.error("❌ Error loading sales data:", error));
  }, []);

  const drawHeatmap = useCallback(() => {
    if (!salesData.length || !maxSales) return;

    const width = 2400;
    const height = 900;
    const cellSize = 20;
    const margin = { top: 100, right: 200, bottom: 120, left: 120 };

    d3.select(heatmapRef.current).select("svg").remove();

    const svg = d3
      .select(heatmapRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#1a1a1a");

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#222")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("font-size", "12px");

    const colorScale = d3
      .scaleSequential(d3.interpolatePurples)
      .domain([0, maxSales]);

    const calendarWidth = 12 * (cellSize * 9) + margin.left;
    const calendarHeight = 4 * (cellSize * 9) + margin.top;

    // Enhanced Gradient Legend
    const legendWidth = 400; // Increased width for better visibility
    const legendHeight = 20;
    const legendX = (calendarWidth - legendWidth) / 2;
    const legendY = calendarHeight + 60;

    const legend = svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    const legendScale = d3
      .scaleLinear()
      .domain([0, maxSales])
      .range([0, legendWidth]);

    // Gradient definition
    const legendGradient = legend
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    legendGradient
      .selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter()
      .append("stop")
      .attr("offset", (d) => `${d * 100}%`)
      .attr("stop-color", (d) => colorScale(d * maxSales));

    // Gradient rectangle
    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    // Axis with clear sales values
    const legendAxis = d3
      .axisBottom(legendScale)
      .tickValues([
        0,
        maxSales * 0.25,
        maxSales * 0.5,
        maxSales * 0.75,
        maxSales,
      ])
      .tickFormat((d) => `₹${Math.round(d).toLocaleString()}`);

    legend
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("fill", "#ccc")
      .style("font-size", "12px")
      .attr("dy", "10px"); // Adjust text position below ticks

    // Legend title
    legend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .attr("fill", "#ccc")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Daily Sales Range");

    const years = [2021, 2022, 2023, 2024];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    years.forEach((year, yIndex) => {
      svg
        .append("text")
        .attr("x", margin.left - 80)
        .attr("y", yIndex * (cellSize * 9) + margin.top + cellSize * 3)
        .attr("fill", "#ccc")
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .text(year);

      months.forEach((month, mIndex) => {
        const monthData = salesData.filter(
          (d) =>
            new Date(d.Date).getFullYear() === year &&
            new Date(d.Date).getMonth() === mIndex
        );
        const firstDayOfMonth = new Date(year, mIndex, 1).getDay();

        svg
          .append("text")
          .attr("x", mIndex * (cellSize * 9) + margin.left + cellSize * 3)
          .attr("y", margin.top - 10)
          .attr("fill", "#ccc")
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .text(month);

        monthData.forEach((d) => {
          const date = new Date(d.Date);
          if (!date) return;
          const day = date.getDate();
          const row = Math.floor((day + firstDayOfMonth - 1) / 7);
          const col = (day + firstDayOfMonth - 1) % 7;

          const cell = svg.append("g");

          cell
            .append("rect")
            .attr("x", mIndex * (cellSize * 9) + col * cellSize + margin.left)
            .attr("y", yIndex * (cellSize * 9) + row * cellSize + margin.top)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", colorScale(d.Sales))
            .style("stroke", "#000")
            .style("opacity", 0.9)
            .on("mouseover", function (event) {
              d3.select(this).style("stroke", "#fff").style("stroke-width", 2);
              tooltip
                .style("visibility", "visible")
                .html(
                  `<b>${date.toDateString()}</b><br/>
                   Sales: ₹${d.Sales.toLocaleString()}<br/>
                   Profit: ₹${d.Profit.toLocaleString()}`
                )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", function () {
              d3.select(this).style("stroke", "#000").style("stroke-width", 1);
              tooltip.style("visibility", "hidden");
            });

          cell
            .append("text")
            .attr(
              "x",
              mIndex * (cellSize * 9) +
                col * cellSize +
                margin.left +
                cellSize / 2
            )
            .attr(
              "y",
              yIndex * (cellSize * 9) +
                row * cellSize +
                margin.top +
                cellSize / 2
            )
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", d.Sales > maxSales / 2 ? "#fff" : "#000")
            .style("font-size", "10px")
            .text(day);
        });
      });
    });

    // Descriptive Legend (aligned with gradient)
    const descriptiveLegend = svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY + 60})`);

    const legendItems = [
      {
        color: "#9B4D97",
        text: `₹0 - ₹${Math.round(maxSales * 0.25).toLocaleString()}`,
      },
      {
        color: "#720E7E",
        text: `₹${Math.round(maxSales * 0.25).toLocaleString()} - ₹${Math.round(
          maxSales * 0.5
        ).toLocaleString()}`,
      },
      {
        color: "#4A0072",
        text: `₹${Math.round(maxSales * 0.5).toLocaleString()} - ₹${Math.round(
          maxSales * 0.75
        ).toLocaleString()}`,
      },
      {
        color: "#2C003E",
        text: `₹${Math.round(maxSales * 0.75).toLocaleString()} - ₹${Math.round(
          maxSales
        ).toLocaleString()}`,
      },
    ];

    descriptiveLegend
      .selectAll("g")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)
      .each(function (d) {
        d3.select(this)
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", d.color);

        d3.select(this)
          .append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("fill", "#ccc")
          .attr("font-size", "12px")
          .text(d.text);
      });

    descriptiveLegend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .attr("fill", "#ccc")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Daily Sales Ranges");
  }, [salesData, maxSales]);

  useEffect(() => {
    if (salesData.length > 0 && maxSales > 0) {
      drawHeatmap();
    }
  }, [salesData, maxSales, drawHeatmap]);

  return (
    <Box m="20px">
      <Header title="Sales Calendar" subtitle="Purchase Seasonality Heatmap" />
      <Box ref={heatmapRef}></Box>
    </Box>
  );
};

export default Calendar;
