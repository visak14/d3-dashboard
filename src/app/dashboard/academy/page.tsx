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
}

interface FilterOptions {
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
}

// Define types for D3 pie chart data
interface PieData {
  sector: string;
  intensity: number;
}

const Academy = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<string[]>([]);

  const [selected, setSelected] = useState<Filters>({
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
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
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

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await axios.get<DataItem[]>("/api/data");
        setData(res.data);
        setFilteredData(res.data);
        const fullData = res.data;
        const uniqueCountries = [
          ...new Set(fullData.map((item) => item.country)),
        ].filter(Boolean); // Filter out empty values
        setCountries(uniqueCountries);
        
        const extractUnique = (key: keyof DataItem) => 
          [...new Set(res.data.map((item) => item[key]))].filter(Boolean);

        setFilterOptions({
          countries: extractUnique("country") as string[],
          sources: extractUnique("source") as string[],
          pestles: extractUnique("pestle") as string[],
          regions: extractUnique("region") as string[],
          sectors: extractUnique("sector") as string[],
          endYears: extractUnique("end_year") as string[],
          topics: extractUnique("topic") as string[],
          likelihoods: extractUnique("likelihood") as number[],
          intensities: extractUnique("intensity") as number[],
        });
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let updated = [...data];

    Object.entries(selected).forEach(([key, value]) => {
      if (value) {
        updated = updated.filter((item) => {
          const itemValue = item[key as keyof DataItem];
          return String(itemValue) === String(value);
        });
      }
    });

    if (startDate && endDate) {
      updated = updated.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredData(updated);
  }, [selected, startDate, endDate, data]);

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
  });

  const handleChange = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected((prev) => ({
      ...resetFilters(), // Reset all filters with proper typing
      [key]: e.target.value,
    }));
  };

  useEffect(() => {
    if (!data.length) return;
    
    const grouped = d3.rollups(
      selected.country ? data.filter((d) => d.country === selected.country) : data,
      (v) => d3.sum(v, (d) => d.intensity),
      (d) => d.sector
    ).map(([sector, intensity]) => ({ sector, intensity }));

    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;

    d3.select("#sectorChart").selectAll("*").remove();
    const svg = d3
      .select("#sectorChart")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const pie = d3.pie<PieData>().value((d) => d.intensity);
    
    // Create properly typed arc generators
    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .outerRadius(radius - 10)
      .innerRadius(0);
    
    const labelArc = d3.arc<d3.PieArcDatum<PieData>>()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    const arcs = svg
      .selectAll(".arc")
      .data(pie(grouped))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.sector));

    arcs
      .append("text")
      .attr("transform", (d) => {
        const centroid = labelArc.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .text((d) => d.data.sector);
  }, [data, selected.country]);

  useEffect(() => {
    if (!filteredData.length) return;

    const width = 600;
    const height = 500;
    const margin = { top: 20, right: 70, bottom: 60, left: 60 };

    d3.select("#relevanceChart").selectAll("*").remove();
    const svg = d3
      .select("#relevanceChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const likelihoodExtent = d3.extent(filteredData, (d) => d.likelihood) as [number, number];
    const impactExtent = d3.extent(filteredData, (d) => d.impact) as [number, number];

    const x = d3
      .scaleLinear()
      .domain(likelihoodExtent)
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain(impactExtent)
      .range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    const maxRelevance = d3.max(filteredData, (d) => d.relevance) || 1;
    const radiusScale = d3.scaleSqrt().domain([0, maxRelevance]).range([2, 20]);

    svg
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.likelihood))
      .attr("cy", (d) => y(d.impact))
      .attr("r", (d) => radiusScale(d.relevance))
      .style("fill", "skyblue")
      .style("opacity", 0.7);
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
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-4/5 space-y-6">
          <div className="bg-white shadow-md rounded-md p-4 relative">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold mb-2">Sector Chart</h2>
              <div className="w-48 mr-10">
                <label className="block mb-1 text-sm font-medium">Country</label>
                <select
                  value={selected.country}
                  onChange={handleChange("country")}
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
            </div>
            <svg id="sectorChart" className="w-full h-[500px]"></svg>
          </div>

          <div className="bg-white shadow-md rounded-md p-4 relative">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold mb-2">Relevance vs Impact</h2>
              <div className="flex gap-4">
                <div className="w-40">
                  <label className="block mb-1 text-sm font-medium">Pestle</label>
                  <select
                    value={selected.pestle}
                    onChange={handleChange("pestle")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Pestle</option>
                    {filterOptions.pestles.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-40">
                  <label className="block mb-1 text-sm font-medium">Sector</label>
                  <select
                    value={selected.sector}
                    onChange={handleChange("sector")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Sector</option>
                    {filterOptions.sectors.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <svg id="relevanceChart" className="w-full h-[550px]"></svg>
          </div>
        </div>

        <div className="w-full lg:w-[20%] flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h4 className="text-sm text-gray-600 font-medium mb-2">Sectors</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.sectors.map((r, i) => (
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
              {filterOptions.pestles.slice(0, 30).map((s, i) => (
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
};

export default Academy;