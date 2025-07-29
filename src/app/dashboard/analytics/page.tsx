"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";
import axios from "axios";
import { Grid } from "react-loader-spinner";

// Define types for your data structure
interface DataItem {
  country: string;
  sector: string;
  intensity: number;
}

function AnalyticsPage() {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<DataItem[]>("/api/data");
        const fullData = response.data;
        setData(fullData);
        setFilteredData(fullData);

        const uniqueCountries = [
          ...new Set(fullData.map((item) => item.country)),
        ];
        setCountries(uniqueCountries);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const filtered = data.filter((item) => item.country === selectedCountry);
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [selectedCountry, data]);

  useEffect(() => {
    if (filteredData.length === 0) return;

    const svgWidth = 600;
    const svgHeight = 400;
    const margin = { top: 40, right: 40, bottom: 100, left: 60 };

    d3.select("#chart").selectAll("*").remove();
    const svg = d3
      .select("#chart")
      .attr("width", svgWidth + margin.left + margin.right)
      .attr("height", svgHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.sector))
      .range([0, svgWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.intensity) || 1])
      .range([svgHeight, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${svgHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".bar")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.sector) || 0)
      .attr("y", (d) => y(d.intensity))
      .attr("width", x.bandwidth())
      .attr("height", (d) => svgHeight - y(d.intensity))
      .attr("fill", "#60A5FA");

    svg
      .append("text")
      .attr("x", svgWidth / 2)
      .attr("y", svgHeight + 60)
      .attr("text-anchor", "middle")
      .text("Sectors");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -svgHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .text("Intensity");
  }, [filteredData]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gray-200 opacity-50"></div>
        <div className="bg-transparent p-6 rounded-md z-50 w-auto">
          <Grid
            visible={true}
            height="40"
            width="40"
            color="#8F85F2"
            ariaLabel="grid-loading"
            radius="12.5"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full lg:w-3/4">
          <div className="flex justify-end mb-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Countries</option>
              {countries.map((country, idx) => (
                <option key={idx} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Intensity by Sector
          </h2>
          <svg id="chart" className="w-full h-[600px]"></svg>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 w-full lg:w-1/4">
          <h2 className="text-lg font-bold mb-2 text-gray-700">
            Countries in Dataset
          </h2>
          <div className="flex flex-wrap gap-2">
            {countries.map((country, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
              >
                {country}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;