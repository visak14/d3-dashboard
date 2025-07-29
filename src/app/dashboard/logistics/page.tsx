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
  likelihood: number;
  impact: number;
  relevance: number;
  end_year: string;
  topic: string;
  pestle: string;
  region: string;
  source: string;
  date: string;
  swot: string;
  city: string;
}

interface Filters {
  country: string;
  endYear: string;
  topic: string;
  sector: string;
  region: string;
  pestle: string;
  source: string;
  swot: string;
  city: string;
  likelihood: string;
  intensity: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface Options {
  countries: string[];
  sources: string[];
  pestles: string[];
  regions: string[];
  sectors: string[];
  endYears: string[];
  topics: string[];
  likelihoods: number[];
  intensities: number[];
}

interface CleanDataItem {
  intensity: number;
  topic: string;
  index: number;
}

function Logistics() {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState<Filters>({
    country: "",
    endYear: "",
    topic: "",
    sector: "",
    region: "",
    pestle: "",
    source: "",
    swot: "",
    city: "",
    likelihood: "",
    intensity: "",
    startDate: null,
    endDate: null,
  });

  const [options, setOptions] = useState<Options>({
    countries: [],
    sources: [],
    pestles: [],
    regions: [],
    sectors: [],
    endYears: [],
    topics: [],
    likelihoods: [],
    intensities: [],
  });

  useEffect(() => {
    setLoading(true);
    axios.get<DataItem[]>("/api/data")
      .then((res) => {
        const fullData = res.data;
        setData(fullData);
        setFilteredData(fullData);

        setOptions({
          countries: [...new Set(fullData.map((d) => d.country))].filter(Boolean),
          sources: [...new Set(fullData.map((d) => d.source))].filter(Boolean),
          pestles: [...new Set(fullData.map((d) => d.pestle))].filter(Boolean),
          regions: [...new Set(fullData.map((d) => d.region))].filter(Boolean),
          sectors: [...new Set(fullData.map((d) => d.sector))].filter(Boolean),
          endYears: [...new Set(fullData.map((d) => d.end_year))].filter(Boolean),
          topics: [...new Set(fullData.map((d) => d.topic))].filter(Boolean),
          likelihoods: [...new Set(fullData.map((d) => d.likelihood))].filter(Boolean),
          intensities: [...new Set(fullData.map((d) => d.intensity))].filter(Boolean),
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let updated = [...data];
    for (const key in filters) {
      const value = filters[key as keyof Filters];
      if (value && key !== 'startDate' && key !== 'endDate') {
        // Type-safe filtering
        if (key === 'endYear') {
          updated = updated.filter((d) => d.end_year === value);
        } else {
          updated = updated.filter((d) => {
            const itemValue = d[key as keyof DataItem];
            return String(itemValue) === String(value);
          });
        }
        break; // Apply only one active filter
      }
    }
    setFilteredData(updated);
  }, [filters, data]);

  useEffect(() => {
    if (filteredData.length > 0) {
      renderRadarChart(filteredData);
      renderBarChart(filteredData);
    }
  }, [filteredData]);

  const resetFilters = (): Filters => ({
    country: "",
    endYear: "",
    topic: "",
    sector: "",
    region: "",
    pestle: "",
    source: "",
    swot: "",
    city: "",
    likelihood: "",
    intensity: "",
    startDate: null,
    endDate: null,
  });

  const handleFilterChange = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...resetFilters(), // Reset all filters with proper typing
      [key]: e.target.value,
    });
  };

  const renderRadarChart = (data: DataItem[]) => {
    const cleanData: CleanDataItem[] = data.map((d, i) => ({
      intensity: Number(d.intensity) || 0,
      topic: d.topic || "Unknown",
      index: i,
    }));

    const width = 600, height = 600, radius = 250;
    const angleSlice = (Math.PI * 2) / cleanData.length;
    const svg = d3.select("#topicsChart").html("")
      .attr("width", width).attr("height", height)
      .append("g").attr("transform", `translate(${width/2},${height/2})`);

    const maxVal = d3.max(cleanData, d => d.intensity) || 1;
    const radialScale = d3.scaleLinear().domain([0, maxVal]).range([0, radius]);

    // Draw radar chart grid circles
    for (let i = 0; i < 5; i++) {
      svg.append("circle")
        .attr("r", radius / 5 * (i + 1))
        .attr("fill", "none")
        .attr("stroke", "#ccc");
    }

    const radarLine = d3.lineRadial<CleanDataItem>()
      .radius(d => radialScale(d.intensity))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    svg.append("path")
      .datum(cleanData)
      .attr("d", radarLine)
      .attr("fill", "#8ab4f8aa")
      .attr("stroke", "#3366cc")
      .attr("stroke-width", 2);

    svg.selectAll(".dot")
      .data(cleanData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", (d, i) => radialScale(d.intensity) * Math.cos(angleSlice * i - Math.PI/2))
      .attr("cy", (d, i) => radialScale(d.intensity) * Math.sin(angleSlice * i - Math.PI/2))
      .attr("r", 3)
      .attr("fill", "#3366cc");
  };

  const renderBarChart = (data: DataItem[]) => {
    const svg = d3.select("#intensityChart").html("");
    const width = 600, height = 600;
    const margin = { top: 40, right: 20, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chart = svg.attr("width", width).attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.end_year))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.intensity) || 1])
      .range([innerHeight, 0]);

    chart.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(String))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    chart.append("g").call(d3.axisLeft(y));

    chart.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.end_year) || 0)
      .attr("y", d => y(d.intensity))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d.intensity))
      .attr("fill", "#66bb6a");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gray-200 opacity-50"></div>
        <Grid visible={true} height="40" width="40" color="#8F85F2" />
      </div>
    );
  }

  return (
    <div className="p-4 w-full space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-6">
          <div className="bg-white shadow-lg rounded-lg p-4 relative">
            <div className="absolute right-4 top-4 flex gap-4">
              {[
                { label: "Intensity", key: "intensity" as keyof Filters, list: options.intensities },
                { label: "Topic", key: "topic" as keyof Filters, list: options.topics },
              ].map(({ label, key, list }) => (
                <div key={key}>
                  <label className="text-xs block">{label}</label>
                  <select
                    value={filters[key] as string}
                    onChange={handleFilterChange(key)}
                    className="border rounded p-1 text-xs"
                  >
                    <option value="">Select</option>
                    {list.map((val, idx) => (
                      <option key={idx} value={String(val)}>{String(val)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-4">Radar Chart (Topic)</h2>
            <svg id="topicsChart"></svg>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-4 relative">
            <div className="absolute right-4 top-4 flex gap-4">
              {[
                { label: "End Year", key: "endYear" as keyof Filters, list: options.endYears },
              ].map(({ label, key, list }) => (
                <div key={key}>
                  <label className="text-xs block">{label}</label>
                  <select
                    value={filters[key] as string}
                    onChange={handleFilterChange(key)}
                    className="border rounded p-1 text-xs"
                  >
                    <option value="">Select</option>
                    {list.map((val, idx) => (
                      <option key={idx} value={String(val)}>{String(val)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <h2 className="text-xl font-semibold mb-4">Bar Chart (Intensity over End Year)</h2>
            <svg id="intensityChart"></svg>
          </div>
        </div>


          <div className="w-full lg:w-[20%] flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h4 className="text-sm text-gray-600 font-medium mb-2">Sectors</h4>
            <div className="flex flex-wrap gap-2">
              {options.sources.slice(0, 35).map((r, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <h4 className="text-sm text-gray-600 font-medium mb-2">Pestles</h4>
            <div className="flex flex-wrap gap-2">
              {options.regions.slice(0, 30).map((s, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Logistics;