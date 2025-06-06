import { create } from 'zustand';
import type { Earthquake } from '../types';

// Define the state structure
interface EarthquakeState { 
  earthquakes: Earthquake[];
  filteredEarthquakes: Earthquake[];
  selectedEarthquake: string | null;
  hoveredEarthquake: string | null;
  selectedChart: 'scatter' | 'line' | 'bar';
  scatterXAxis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>;
  scatterYAxis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>;
  lineXAxis: keyof Pick<Earthquake, 'time' | 'latitude' | 'longitude' | 'depth' | 'mag'>;
  lineYAxis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>;
  barXAxis: keyof Pick<Earthquake, 'place' | 'latitude' | 'longitude' | 'depth' | 'mag'>;
  filterYear: string;
  filterMonth: string;
  filterDay: string;
  filterPlace: string;
  filterMagnitude: string;
  filterDepth: string;
  filterType: string;
  uniqueYears: string[];
  uniqueMonths: string[];
  uniqueDays: string[];
  uniquePlaces: string[];
  uniqueTypes: string[];
  placeCounts: { bin: string; count: number }[];
  binnedCounts: { bin: string; count: number }[];

  // Actions to update the state
  setEarthquakes: (earthquakes: Earthquake[]) => void;
  setSelectedEarthquake: (id: string | null) => void;
  setHoveredEarthquake: (id: string | null) => void;
  setSelectedChart: (chart: 'scatter' | 'line' | 'bar') => void;
  setScatterXAxis: (axis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>) => void;
  setScatterYAxis: (axis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>) => void;
  setLineXAxis: (axis: keyof Pick<Earthquake, 'time' | 'latitude' | 'longitude' | 'depth' | 'mag'>) => void;
  setLineYAxis: (axis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>) => void;
  setBarXAxis: (axis: keyof Pick<Earthquake, 'place' | 'latitude' | 'longitude' | 'depth' | 'mag'>) => void;
  setFilterYear: (year: string) => void;
  setFilterMonth: (month: string) => void;
  setFilterDay: (day: string) => void;
  setFilterPlace: (place: string) => void;
  setFilterMagnitude: (magnitude: string) => void;
  setFilterDepth: (depth: string) => void;
  setFilterType: (type: string) => void;
}

// Helper function to extract the place from a full place string
function extractPlace(fullPlace: string): string {
  const match = fullPlace.match(/,\s*([^,]+)$/);
  return match ? match[1].trim() : fullPlace;
}


// Create the Zustand store
export const useEarthquakeStore = create<EarthquakeState>((set) => ({

  // Initial state
  earthquakes: [],
  filteredEarthquakes: [],
  selectedEarthquake: null,
  hoveredEarthquake: null,
  selectedChart: 'scatter',
  scatterXAxis: 'longitude',
  scatterYAxis: 'latitude',
  lineXAxis: 'time',
  lineYAxis: 'mag',
  barXAxis: 'place',
  filterYear: '',
  filterMonth: '',
  filterDay: '',
  filterPlace: '',
  filterMagnitude: '',
  filterDepth: '',
  filterType: '',
  uniqueYears: [],
  uniqueMonths: [],
  uniqueDays: [],
  uniquePlaces: [],
  uniqueTypes: [],
  placeCounts: [],
  binnedCounts: [],

  // Actions to update the state
  setEarthquakes: (earthquakes) => set((state) => {
    const uniqueYears = [...new Set(earthquakes.map((eq) => eq.date.split('-')[2]))].sort();
    const uniqueMonths = [...new Set(earthquakes.map((eq) => eq.date.split('-')[1]))].sort();
    const uniqueDays = [...new Set(earthquakes.map((eq) => eq.date.split('-')[0]))].sort();
    const uniquePlaces = [...new Set(earthquakes.map((eq) => extractPlace(eq.place)))].sort();
    const uniqueTypes = [...new Set(earthquakes.map((eq) => eq.type))].sort();

    // Initialize filteredEarthquakes with the full list
    const filteredEarthquakes = earthquakes.filter((eq) => {
      const [day, month, year] = eq.date.split('-');
      const place = extractPlace(eq.place);
      return (
        (!state.filterYear || year === state.filterYear) &&
        (!state.filterMonth || month === state.filterMonth) &&
        (!state.filterDay || day === state.filterDay) &&
        (!state.filterPlace || place === state.filterPlace) &&
        (!state.filterMagnitude || eq.mag >= Number(state.filterMagnitude)) &&
        (!state.filterDepth || eq.depth >= Number(state.filterDepth)) &&
        (!state.filterType || eq.type === state.filterType)
      );
    });

    const placeCounts = uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    // Function to bin data for bar charts
    const binData = (data: number[], bins: number = 10) => {
      if (data.length === 0) return [];
      const min = Math.min(...data);
      const max = Math.max(...data);
      const binSize = (max - min) / bins;
      const binned = Array.from({ length: bins }, (_, i) => ({
        bin: (min + i * binSize).toFixed(2),
        count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
      }));
      return binned;
    };

    // Create binned counts for the bar chart
    const binnedCounts = state.barXAxis !== 'place'
      ? binData(filteredEarthquakes.map((eq) => eq[state.barXAxis] as number))
      : [];

    return {
      earthquakes,
      filteredEarthquakes,
      uniqueYears,
      uniqueMonths,
      uniqueDays,
      uniquePlaces,
      uniqueTypes,
      placeCounts,
      binnedCounts,
    };
  }),
  setSelectedEarthquake: (id) => set({ selectedEarthquake: id }),
  setHoveredEarthquake: (id) => set({ hoveredEarthquake: id }),
  setSelectedChart: (chart) => set({ selectedChart: chart }),
  setScatterXAxis: (axis) => set({ scatterXAxis: axis }),
  setScatterYAxis: (axis) => set({ scatterYAxis: axis }),
  setLineXAxis: (axis) => set({ lineXAxis: axis }),
  setLineYAxis: (axis) => set({ lineYAxis: axis }),
  setBarXAxis: (axis) => set((state) => {
    const binnedCounts = axis !== 'place'
      ? state.earthquakes.length > 0
        ? (() => {
            const data = state.filteredEarthquakes.map((eq) => eq[axis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];
    return { barXAxis: axis, binnedCounts };
  }),
  setFilterYear: (year) => set((state) => {
    const filteredEarthquakes = state.earthquakes.filter((eq) => {
      const [day, month, yearEq] = eq.date.split('-');
      const place = extractPlace(eq.place);
      return (
        (!year || yearEq === year) &&
        (!state.filterMonth || month === state.filterMonth) &&
        (!state.filterDay || day === state.filterDay) &&
        (!state.filterPlace || place === state.filterPlace) &&
        (!state.filterMagnitude || eq.mag >= Number(state.filterMagnitude)) &&
        (!state.filterDepth || eq.depth >= Number(state.filterDepth)) &&
        (!state.filterType || eq.type === state.filterType)
      );
    });

    const placeCounts = state.uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    const binnedCounts = state.barXAxis !== 'place'
      ? filteredEarthquakes.length > 0
        ? (() => {
            const data = filteredEarthquakes.map((eq) => eq[state.barXAxis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];

    return { filterYear: year, filteredEarthquakes, placeCounts, binnedCounts };
  }),
  setFilterMonth: (month) => set((state) => {
    const filteredEarthquakes = state.earthquakes.filter((eq) => {
      const [day, monthEq, year] = eq.date.split('-');
      const place = extractPlace(eq.place);
      return (
        (!state.filterYear || year === state.filterYear) &&
        (!month || monthEq === month) &&
        (!state.filterDay || day === state.filterDay) &&
        (!state.filterPlace || place === state.filterPlace) &&
        (!state.filterMagnitude || eq.mag >= Number(state.filterMagnitude)) &&
        (!state.filterDepth || eq.depth >= Number(state.filterDepth)) &&
        (!state.filterType || eq.type === state.filterType)
      );
    });

    const placeCounts = state.uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    const binnedCounts = state.barXAxis !== 'place'
      ? filteredEarthquakes.length > 0
        ? (() => {
            const data = filteredEarthquakes.map((eq) => eq[state.barXAxis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];

    return { filterMonth: month, filteredEarthquakes, placeCounts, binnedCounts };
  }),
  setFilterDay: (day) => set((state) => {
    const filteredEarthquakes = state.earthquakes.filter((eq) => {
      const [dayEq, month, year] = eq.date.split('-');
      const place = extractPlace(eq.place);
      return (
        (!state.filterYear || year === state.filterYear) &&
        (!state.filterMonth || month === state.filterMonth) &&
        (!day || dayEq === day) &&
        (!state.filterPlace || place === state.filterPlace) &&
        (!state.filterMagnitude || eq.mag >= Number(state.filterMagnitude)) &&
        (!state.filterDepth || eq.depth >= Number(state.filterDepth)) &&
        (!state.filterType || eq.type === state.filterType)
      );
    });

    const placeCounts = state.uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    const binnedCounts = state.barXAxis !== 'place'
      ? filteredEarthquakes.length > 0
        ? (() => {
            const data = filteredEarthquakes.map((eq) => eq[state.barXAxis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];

    return { filterDay: day, filteredEarthquakes, placeCounts, binnedCounts };
  }),
  setFilterPlace: (place) => set((state) => {
    const filteredEarthquakes = state.earthquakes.filter((eq) => {
      const [day, month, year] = eq.date.split('-');
      const eqPlace = extractPlace(eq.place);
      return (
        (!state.filterYear || year === state.filterYear) &&
        (!state.filterMonth || month === state.filterMonth) &&
        (!state.filterDay || day === state.filterDay) &&
        (!place || eqPlace === place) &&
        (!state.filterMagnitude || eq.mag >= Number(state.filterMagnitude)) &&
        (!state.filterDepth || eq.depth >= Number(state.filterDepth)) &&
        (!state.filterType || eq.type === state.filterType)
      );
    });

    const placeCounts = state.uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    const binnedCounts = state.barXAxis !== 'place'
      ? filteredEarthquakes.length > 0
        ? (() => {
            const data = filteredEarthquakes.map((eq) => eq[state.barXAxis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];

    return { filterPlace: place, filteredEarthquakes, placeCounts, binnedCounts };
  }),
  setFilterMagnitude: (magnitude) => set((state) => {
    const filteredEarthquakes = state.earthquakes.filter((eq) => {
      const [day, month, year] = eq.date.split('-');
      const place = extractPlace(eq.place);
      return (
        (!state.filterYear || year === state.filterYear) &&
        (!state.filterMonth || month === state.filterMonth) &&
        (!state.filterDay || day === state.filterDay) &&
        (!state.filterPlace || place === state.filterPlace) &&
        (!magnitude || eq.mag >= Number(magnitude)) &&
        (!state.filterDepth || eq.depth >= Number(state.filterDepth)) &&
        (!state.filterType || eq.type === state.filterType)
      );
    });

    const placeCounts = state.uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    const binnedCounts = state.barXAxis !== 'place'
      ? filteredEarthquakes.length > 0
        ? (() => {
            const data = filteredEarthquakes.map((eq) => eq[state.barXAxis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];

    return { filterMagnitude: magnitude, filteredEarthquakes, placeCounts, binnedCounts };
  }),
  setFilterDepth: (depth) => set((state) => {
    const filteredEarthquakes = state.earthquakes.filter((eq) => {
      const [day, month, year] = eq.date.split('-');
      const place = extractPlace(eq.place);
      return (
        (!state.filterYear || year === state.filterYear) &&
        (!state.filterMonth || month === state.filterMonth) &&
        (!state.filterDay || day === state.filterDay) &&
        (!state.filterPlace || place === state.filterPlace) &&
        (!state.filterMagnitude || eq.mag >= Number(state.filterMagnitude)) &&
        (!depth || eq.depth >= Number(depth)) &&
        (!state.filterType || eq.type === state.filterType)
      );
    });

    const placeCounts = state.uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    const binnedCounts = state.barXAxis !== 'place'
      ? filteredEarthquakes.length > 0
        ? (() => {
            const data = filteredEarthquakes.map((eq) => eq[state.barXAxis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];

    return { filterDepth: depth, filteredEarthquakes, placeCounts, binnedCounts };
  }),
  setFilterType: (type) => set((state) => {
    const filteredEarthquakes = state.earthquakes.filter((eq) => {
      const [day, month, year] = eq.date.split('-');
      const place = extractPlace(eq.place);
      return (
        (!state.filterYear || year === state.filterYear) &&
        (!state.filterMonth || month === state.filterMonth) &&
        (!state.filterDay || day === state.filterDay) &&
        (!state.filterPlace || place === state.filterPlace) &&
        (!state.filterMagnitude || eq.mag >= Number(state.filterMagnitude)) &&
        (!state.filterDepth || eq.depth >= Number(state.filterDepth)) &&
        (!type || eq.type === type)
      );
    });

    const placeCounts = state.uniquePlaces.map((place) => ({
      bin: place,
      count: filteredEarthquakes.filter((eq) => extractPlace(eq.place) === place).length,
    }));

    const binnedCounts = state.barXAxis !== 'place'
      ? filteredEarthquakes.length > 0
        ? (() => {
            const data = filteredEarthquakes.map((eq) => eq[state.barXAxis] as number);
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binSize = (max - min) / 10;
            return Array.from({ length: 10 }, (_, i) => ({
              bin: (min + i * binSize).toFixed(2),
              count: data.filter((value) => value >= min + i * binSize && value < min + (i + 1) * binSize).length,
            }));
          })()
        : []
      : [];

    return { filterType: type, filteredEarthquakes, placeCounts, binnedCounts };
  }),
}));