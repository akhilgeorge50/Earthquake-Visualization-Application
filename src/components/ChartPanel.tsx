import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { useEarthquakeStore } from '../store/useEarthquakeStore';
import type { Earthquake } from '../types';


// ChartPanel component to display earthquake data in various chart formats
function ChartPanel() {
  const { 
    filteredEarthquakes, 
    placeCounts, 
    binnedCounts,
    selectedEarthquake, 
    hoveredEarthquake,
    setSelectedEarthquake, 
    setHoveredEarthquake,
    selectedChart,
    scatterXAxis,
    scatterYAxis,
    lineXAxis,
    lineYAxis,
    barXAxis,
    setSelectedChart,
    setScatterXAxis,
    setScatterYAxis,
    setLineXAxis,
    setLineYAxis,
    setBarXAxis,
  } = useEarthquakeStore();
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; payload: any } | null>(null);

  const numericAxisOptions: (keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>)[] = ['latitude', 'longitude', 'depth', 'mag'];
  const lineXAxisOptions: (keyof Pick<Earthquake, 'time' | 'latitude' | 'longitude' | 'depth' | 'mag'>)[] = ['time', 'latitude', 'longitude', 'depth', 'mag'];
  const barXAxisOptions: (keyof Pick<Earthquake, 'place' | 'latitude' | 'longitude' | 'depth' | 'mag'>)[] = ['place', 'latitude', 'longitude', 'depth', 'mag'];

  // Update tooltip for selected or hovered earthquake
  useEffect(() => {
    const quakeId = selectedEarthquake || hoveredEarthquake;
    if (quakeId && (selectedChart === 'scatter' || selectedChart === 'line')) {
      const quake = filteredEarthquakes.find((q) => q.id === quakeId);
      if (quake) {
        const xAxisKey = selectedChart === 'scatter' ? scatterXAxis : lineXAxis;
        const yAxisKey = selectedChart === 'scatter' ? scatterYAxis : lineYAxis;
        const xValue = xAxisKey === 'time' ? new Date(quake.time).getTime() : quake[xAxisKey];
        const yValue = quake[yAxisKey];
        setTooltipData({
          x: xValue as number,
          y: yValue,
          payload: {
            ...quake,
            [xAxisKey]: xValue,
            [yAxisKey]: yValue,
          },
        });
      }
    } else {
      setTooltipData(null);
    }
  }, [selectedEarthquake, hoveredEarthquake, filteredEarthquakes, selectedChart, scatterXAxis, scatterYAxis, lineXAxis, lineYAxis]);

  // Handle scatter point click and hover events
  const handleScatterPointClick = (data: any) => {
    setSelectedEarthquake(data.id);
    const table = document.getElementById(`row-${data.id}`);
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };


  // Handle hover events for scatter points
  const handleScatterPointHover = (data: any) => {
    console.log('Scatter Hover:', data ? data.id : null);
    setHoveredEarthquake(data ? data.id : null);
  };

  // Handle bar click to select earthquake based on bin  
  const handleBarClick = (data: any) => {
    const quake = filteredEarthquakes.find((q) => {
      if (barXAxis === 'place') {
        return extractPlace(q.place) === data.bin;
      }
      const value = q[barXAxis] as number;
      const bin = parseFloat(data.bin);
      const binSize = filteredEarthquakes.length > 0 
        ? (Math.max(...filteredEarthquakes.map((eq) => eq[barXAxis] as number)) - Math.min(...filteredEarthquakes.map((eq) => eq[barXAxis] as number))) / 10 
        : 0;
      return value >= bin && value < bin + binSize;
    });
    if (quake) {
      setSelectedEarthquake(quake.id);
      const table = document.getElementById(`row-${quake.id}`);
      if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Extract place name from full place string
  function extractPlace(fullPlace: string): string {
    const match = fullPlace.match(/,\s*([^,]+)$/);
    return match ? match[1].trim() : fullPlace;
  }

  // Sort data for Line Chart if xAxis is time
  const sortedEarthquakes = lineXAxis === 'time' 
    ? [...filteredEarthquakes].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    : filteredEarthquakes;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-blue-gray-400 p-2 rounded shadow-blue-gray-200">
          <p className="text-sm"><strong>{selectedChart === 'scatter' ? scatterXAxis : lineXAxis === 'time' ? 'Time' : lineXAxis}:</strong> 
            {lineXAxis === 'time' && selectedChart === 'line' ? new Date(data[lineXAxis]).toLocaleString('en-GB') : data[selectedChart === 'scatter' ? scatterXAxis : lineXAxis]}
          </p>
          <p className="text-sm"><strong>{selectedChart === 'scatter' ? scatterYAxis : lineYAxis}:</strong> {data[selectedChart === 'scatter' ? scatterYAxis : lineYAxis]}</p>
          <p className="text-sm"><strong>Place:</strong> {data.place}</p>
        </div>
      );
    }
    if (tooltipData && tooltipData.payload) {
      const data = tooltipData.payload;
      return (
        <div className="bg-white border border-blue-gray-400 p-2 rounded shadow-blue-gray-200">
          <p className="text-sm"><strong>{selectedChart === 'scatter' ? scatterXAxis : lineXAxis === 'time' ? 'Time' : lineXAxis}:</strong> 
            {lineXAxis === 'time' && selectedChart === 'line' ? new Date(data[lineXAxis]).toLocaleString('en-GB') : data[selectedChart === 'scatter' ? scatterXAxis : lineXAxis]}
          </p>
          <p className="text-sm"><strong>{selectedChart === 'scatter' ? scatterYAxis : lineYAxis}:</strong> {data[selectedChart === 'scatter' ? scatterYAxis : lineYAxis]}</p>
          <p className="text-sm"><strong>Place:</strong> {data.place}</p>
        </div>
      );
    }
    return null;
  };

  // Determine point color and size based on state
  const getPointColor = (entry: Earthquake): string => {
    if (entry.id === selectedEarthquake) return '#ff0000'; // Red for clicked
    if (entry.id === hoveredEarthquake) return '#00ff00'; // Green for hovered
    return '#8884d8'; // Blue for default
  };

  const getPointSize = (entry: Earthquake): number => {
    if (entry.id === selectedEarthquake) return 8; // Largest for clicked
    if (entry.id === hoveredEarthquake) return 6; // Medium for hovered
    return 5; // Smallest for default
  };

  // Custom shape for Scatter points
  const CustomScatterPoint = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={getPointSize(payload)}
        fill={getPointColor(payload)}
        onClick={() => handleScatterPointClick(payload)}
        onMouseEnter={() => handleScatterPointHover(payload)}
        onMouseLeave={() => handleScatterPointHover(null)}
      />
    );
  };

  return (
        <div className="flex flex-col h-[550px] gap-4 overflow-hidden">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Earthquake Graph</h2>
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="mr-2 text-sm font-medium text-gray-700">Select Chart:</label>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as 'scatter' | 'line' | 'bar')}
              className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
            >
              <option value="scatter">Scatter Plot</option>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
          {selectedChart === 'scatter' && (
            <>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">X-Axis:</label>
                <select
                  value={scatterXAxis}
                  onChange={(e) => setScatterXAxis(e.target.value as keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>)}
                  className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
                >
                  {numericAxisOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">Y-Axis:</label>
                <select
                  value={scatterYAxis}
                  onChange={(e) => setScatterYAxis(e.target.value as keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>)}
                  className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
                >
                  {numericAxisOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {selectedChart === 'line' && (
            <>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">X-Axis:</label>
                <select
                  value={lineXAxis}
                  onChange={(e) => setLineXAxis(e.target.value as keyof Pick<Earthquake, 'time' | 'latitude' | 'longitude' | 'depth' | 'mag'>)}
                  className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
                >
                  {lineXAxisOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">Y-Axis:</label>
                <select
                  value={lineYAxis}
                  onChange={(e) => setLineYAxis(e.target.value as keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>)}
                  className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
                >
                  {numericAxisOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {selectedChart === 'bar' && (
            <>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">X-Axis:</label>
                <select
                  value={barXAxis}
                  onChange={(e) => setBarXAxis(e.target.value as keyof Pick<Earthquake, 'place' | 'latitude' | 'longitude' | 'depth' | 'mag'>)}
                  className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
                >
                  {barXAxisOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">Y-Axis:</label>
                <select disabled className="border border-blue-gray-400 rounded-md p-2 text-sm bg-blue-gray-100 cursor-not-allowed">
                  <option value="count">Count</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {filteredEarthquakes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">No data matches the current filters.</div>
        ) : (
          <div className="h-[400px]">
            {selectedChart === 'scatter' && (
              <div className="h-full">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Scatter Plot</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart  key={`${selectedEarthquake}-${hoveredEarthquake}`}>
                    <CartesianGrid stroke="#64748B" strokeDasharray="3 3" />
                    <XAxis dataKey={scatterXAxis} name={scatterXAxis} stroke="#64748B" />
                    <YAxis dataKey={scatterYAxis} name={scatterYAxis} stroke="#64748B" />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Scatter
                      name="Earthquakes"
                      data={filteredEarthquakes}
                      shape={<CustomScatterPoint />}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
            {selectedChart === 'line' && (
              <div className="h-full">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Line Chart</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedEarthquakes} >
                    <CartesianGrid stroke="#64748B" strokeDasharray="3 3" />
                    <XAxis
                      dataKey={lineXAxis}
                      name={lineXAxis}
                      tickFormatter={(value) => lineXAxis === 'time' ? new Date(value).toLocaleDateString('en-GB') : value}
                      stroke="#64748B"
                    />
                    <YAxis dataKey={lineYAxis} name={lineYAxis} stroke="#64748B" />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Line
                      type="monotone"
                      dataKey={lineYAxis}
                      stroke="#2DD4BF"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={getPointSize(payload)}
                            fill={getPointColor(payload)}
                            onClick={() => handleScatterPointClick(payload)}
                            onMouseEnter={() => handleScatterPointHover(payload)}
                            onMouseLeave={() => handleScatterPointHover(null)}
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {selectedChart === 'bar' && (
              <div className="h-full">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Bar Chart</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barXAxis === 'place' ? placeCounts : binnedCounts}>
                    <CartesianGrid stroke="#64748B" strokeDasharray="3 3" />
                    <XAxis dataKey="bin" angle={-45} textAnchor="end" height={80} stroke="#64748B" />
                    <YAxis dataKey="count" name="Count" stroke="#64748B" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2DD4BF" onClick={handleBarClick} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartPanel;