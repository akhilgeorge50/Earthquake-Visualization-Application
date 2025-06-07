import { useState } from 'react';
import { useEarthquakeStore } from '../store/useEarthquakeStore';
import type { Earthquake } from '../types';

//SortColumn and SortDirection types for orting functionality
type SortColumn = keyof Pick<Earthquake, 'date' | 'timeFormatted' | 'latitude' | 'longitude' | 'depth' | 'mag' | 'place' | 'type'>;
type SortDirection = 'ASC' | 'DESC';

// DataTable component to display earthquake data in a sortable table format
function DataTable() {
  const { filteredEarthquakes, selectedEarthquake, hoveredEarthquake, setSelectedEarthquake, setHoveredEarthquake } = useEarthquakeStore();
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC');

  // Handle row click to select an earthquake
  const handleRowClick = (id: string) => {
    setSelectedEarthquake(id);
  };

  // Handle row hover to highlight the hovered earthquake
  const handleRowHover = (id: string | null) => {
    setHoveredEarthquake(id);
  };

  // Handle sorting by changing the sort column and direction
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortColumn(column);
      setSortDirection('ASC');
    }
  };

  // Sort the filtered earthquakes based on the selected column and direction
  const sortedEarthquakes = [...filteredEarthquakes].sort((a, b) => {
    if (!sortColumn) return 0;

    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

  
    if (['latitude', 'longitude', 'depth', 'mag'].includes(sortColumn)) {
      const numA = Number(valueA);
      const numB = Number(valueB);
      return sortDirection === 'ASC' ? numA - numB : numB - numA;
    }

 
    if (['date', 'timeFormatted'].includes(sortColumn)) {
      const dateA = sortColumn === 'date' ? new Date(a.time) : new Date(`${a.date} ${valueA}`);
      const dateB = sortColumn === 'date' ? new Date(b.time) : new Date(`${b.date} ${valueB}`);
      return sortDirection === 'ASC' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }

 
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();
    return sortDirection === 'ASC' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return '';
    return sortDirection === 'ASC' ? ' ↑' : ' ↓';
  };

  return (
    <div className="h-[550px] overflow-hidden">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Earthquake Table</h2>
      <div className="h-full overflow-y-auto">
        <table className="min-w-full border-collapse border border-blue-gray-400">
          <thead className="bg-blue-gray-300 sticky top-0 z-10">
            <tr>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('date')}>
                Date{getSortIndicator('date')}
              </th>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('timeFormatted')}>
                Time{getSortIndicator('timeFormatted')}
              </th>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('latitude')}>
                Latitude{getSortIndicator('latitude')}
              </th>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('longitude')}>
                Longitude{getSortIndicator('longitude')}
              </th>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('depth')}>
                Depth{getSortIndicator('depth')}
              </th>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('mag')}>
                Magnitude{getSortIndicator('mag')}
              </th>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('place')}>
                Place{getSortIndicator('place')}
              </th>
              <th className="border border-blue-gray-400 p-2 cursor-pointer hover:bg-blue-gray-200 text-left text-sm font-medium" onClick={() => handleSort('type')}>
                Type{getSortIndicator('type')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEarthquakes.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-blue-gray-400 p-2 text-center text-gray-500">
                  No data matches the current filters.
                </td>
              </tr>
            ) : (
              sortedEarthquakes.map((quake) => (
                <tr
                  key={quake.id}
                  id={`row-${quake.id}`}
                  className={`cursor-pointer ${
                    quake.id === selectedEarthquake
                      ? 'bg-yellow-200'
                      : quake.id === hoveredEarthquake
                      ? 'bg-blue-gray-200'
                      : 'hover:bg-blue-gray-200'
                  }`}
                  onClick={() => handleRowClick(quake.id)}
                  onMouseEnter={() => handleRowHover(quake.id)}
                  onMouseLeave={() => handleRowHover(null)}
                >
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.date}</td>
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.timeFormatted}</td>
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.latitude}</td>
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.longitude}</td>
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.depth}</td>
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.mag}</td>
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.place}</td>
                  <td className="border border-blue-gray-400 p-2 text-sm">{quake.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;