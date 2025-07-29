"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";
import axios from "axios";


interface DataItem {
  source: string;
  region: string;
  intensity: number;
}

interface RadarDataItem {
  intensity: number;
  index: number;
}

function CRM() {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [sources, setSources] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get<DataItem[]>("/api/data");
        const fullData = res.data;
        setData(fullData);
        setFilteredData(fullData);
        setSources([...new Set(fullData.map((d) => d.source))].filter(Boolean));
        setRegions([...new Set(fullData.map((d) => d.region))].filter(Boolean));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let updated = data;
    if (selectedSource) updated = updated.filter((d) => d.source === selectedSource);
    if (selectedRegion) updated = updated.filter((d) => d.region === selectedRegion);
    setFilteredData(updated);
  }, [selectedSource, selectedRegion, data]);

  useEffect(() => {
    if (!filteredData.length) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    const margin = { top: 20, right: 30, bottom: 60, left: 30 };
    const angleSlice = (Math.PI * 2) / filteredData.length;

    d3.select("#radarChart").selectAll("*").remove();
    const svg = d3
      .select("#radarChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

    const max = d3.max(filteredData, (d) => d.intensity || 0) || 1;
    const radialScale = d3.scaleLinear().domain([0, max]).range([0, radius]);

    // Transform data to match the radar chart requirements
    const radarData: RadarDataItem[] = filteredData.map((d, i) => ({
      intensity: d.intensity,
      index: i
    }));

    const radarLine = d3.lineRadial<RadarDataItem>()
      .curve(d3.curveLinearClosed)
      .radius((d) => radialScale(d.intensity))
      .angle((d, i) => i * angleSlice);

    // Draw concentric circles for the radar chart grid
    for (let i = 0; i < 5; i++) {
      svg.append("circle").attr("r", ((i + 1) * radius) / 5).attr("fill", "none").attr("stroke", "#ddd");
    }

    // Draw the radar chart path
    svg.append("path")
      .datum(radarData)
      .attr("d", radarLine)
      .attr("fill", "#93C5FD66")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2);

    // Add dots at each data point
    svg.selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("fill", "#2563EB")
      .attr("cx", (d, i) => radialScale(d.intensity) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => radialScale(d.intensity) * Math.sin(angleSlice * i - Math.PI / 2));
  }, [filteredData]);

  useEffect(() => {
    if (!filteredData.length) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.select("#regionChart").selectAll("*").remove();

    const svg = d3
      .select("#regionChart")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<DataItem>().value((d) => d.intensity || 1);
    
    // Create properly typed arc generator
    const arc = d3.arc<d3.PieArcDatum<DataItem>>()
      .innerRadius(0)
      .outerRadius(radius - 10);
    
    const pieData = pie(filteredData);

    svg.selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.region));
  }, [filteredData]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-40">
  <div className="w-10 h-10 border-4 border-[#8F85F2] border-dashed rounded-full animate-spin"></div>
</div>
    );
  }

  return (
    <div className="flex w-full h-full p-4 gap-4">
      <div className="w-full lg:w-[80%] space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <h2 className="text-lg font-semibold mb-10 text-gray-800">Radar Chart (Intensity)</h2>
          <div className="absolute top-14 right-6 space-x-2">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Sources</option>
              {sources.map((src, i) => (
                <option key={i} value={src}>{src}</option>
              ))}
            </select>
          </div>
          <svg id="radarChart" className="w-full h-[450px]" />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Region Chart</h2>
          <div className="absolute top-6 right-6 space-x-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Regions</option>
              {regions.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <svg id="regionChart" className="w-full h-[400px]" />
        </div>
      </div>

      <div className="w-full lg:w-[20%] flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h4 className="text-sm text-gray-600 font-medium mb-2">Regions</h4>
          <div className="flex flex-wrap gap-2">
            {regions.map((r, i) => (
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
          <h4 className="text-sm text-gray-600 font-medium mb-2">Sources</h4>
          <div className="flex flex-wrap gap-2">
            {sources.slice(0, 30).map((s, i) => (
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
  );
}

export default CRM;