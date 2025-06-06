import ChartPanel from './ChartPanel';
import DataTable from './DataTable';
import { useEarthquakeStore } from '../store/useEarthquakeStore';

function Layout() {
  const { 
    uniqueYears, uniqueMonths, uniqueDays, uniquePlaces, uniqueTypes,
    filterYear, filterMonth, filterDay, filterPlace, filterMagnitude, filterDepth, filterType,
    setFilterYear, setFilterMonth, setFilterDay, setFilterPlace, setFilterMagnitude, setFilterDepth, setFilterType 
  } = useEarthquakeStore();

  return (
    <div className="flex flex-col min-h-screen bg-blue-gray-50 p-6 gap-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-blue-900 text-center">Earthquake Visualization Application</h1>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 bg-blue-gray-100 p-4 rounded-lg shadow-blue-gray-200">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
          >
            <option value="">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
          >
            <option value="">All Months</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Day</label>
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
          >
            <option value="">All Days</option>
            {uniqueDays.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Place</label>
          <select
            value={filterPlace}
            onChange={(e) => setFilterPlace(e.target.value)}
            className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
          >
            <option value="">All Places</option>
            {uniquePlaces.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
          >
            <option value="">All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Min Magnitude</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={filterMagnitude}
            onChange={(e) => setFilterMagnitude(e.target.value)}
            placeholder="e.g., 2.5"
            className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Min Depth (km)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={filterDepth}
            onChange={(e) => setFilterDepth(e.target.value)}
            placeholder="e.g., 5.0"
            className="border border-blue-gray-400 rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm hover:bg-blue-gray-50"
          />
        </div>
      </div>

      {/* Chart and Table Panels */}
      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-white rounded-lg shadow-blue-gray-200 p-4">
          <ChartPanel />
        </div>
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-white rounded-lg shadow-blue-gray-200 p-4 overflow-hidden">
          <DataTable />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-gray-600">
        © 2025 Earthquake Visualization Application. Developed by Akhil George.
      </footer>
    </div>
  );
}

export default Layout;