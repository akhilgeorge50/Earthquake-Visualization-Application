import { create } from 'zustand';
import type{ Earthquake } from '../types';

interface PlaceCount {
  place: string;
  count: number;
}

interface BinnedCount {
  bin: string;
  count: number;
}

interface EarthquakeState {
  earthquakes: Earthquake[];
  filteredEarthquakes: Earthquake[];
  placeCounts: PlaceCount[];
  binnedCounts: BinnedCount[];
  selectedEarthquake: string | null;
  hoveredEarthquake: string | null;
  selectedChart: 'scatter' | 'line' | 'bar';
  scatterXAxis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>;
  scatterYAxis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>;
  lineXAxis: keyof Pick<Earthquake, 'time' | 'latitude' | 'longitude' | 'depth' | 'mag'>;
  lineYAxis: keyof Pick<Earthquake, 'latitude' | 'longitude' | 'depth' | 'mag'>;
  barXAxis: keyof Pick<Earthquake, 'place' | 'latitude' | 'longitude' | 'depth' | 'mag'>;
  barYAxis: 'count';
  filterYear: string;
  filterMonth: string;
  filterDay: string;
  filterPlace: string;
  filterMagnitude: string;
  filterDepth: string;
  uniqueYears: string[];
  uniqueMonths: string[];
  uniqueDays: string[];
  uniquePlaces: string[];
  setEarthquakes: (data: Earthquake[]) => void;
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
}

export const useEarthquakeStore = create<EarthquakeState>((set) => ({
  earthquakes: [],
  filteredEarthquakes: [],
  placeCounts: [],
  binnedCounts: [],
  selectedEarthquake: null,
  hoveredEarthquake: null,
  selectedChart: 'scatter',
  scatterXAxis: 'longitude',
  scatterYAxis: 'latitude',
  lineXAxis: 'time',
  lineYAxis: 'mag',
  barXAxis: 'place',
  barYAxis: 'count',
  filterYear: '',
  filterMonth: '',
  filterDay: '',
  filterPlace: '',
  filterMagnitude: '',
  filterDepth: '',
  uniqueYears: [],
  uniqueMonths: [],
  uniqueDays: [],
  uniquePlaces: [],
  setEarthquakes: (data) =>
    set((state) => {
      const uniqueYears = Array.from(new Set(data.map((quake) => new Date(quake.time).getFullYear().toString()))).sort();
      const uniqueMonths = Array.from(new Set(data.map((quake) => (new Date(quake.time).getMonth() + 1).toString().padStart(2, '0')))).sort();
      const uniqueDays = Array.from(new Set(data.map((quake) => new Date(quake.time).getDate().toString().padStart(2, '0')))).sort();
      const uniquePlaces = Array.from(new Set(data.map((quake) => extractPlace(quake.place)))).sort();
      const filtered = applyFilters(data, state.filterYear, state.filterMonth, state.filterDay, state.filterPlace, state.filterMagnitude, state.filterDepth);
      const placeCounts = computePlaceCounts(filtered);
      const binnedCounts = computeBinnedCounts(filtered, state.barXAxis);
      return { 
        earthquakes: data, 
        filteredEarthquakes: filtered,
        placeCounts,
        binnedCounts,
        uniqueYears,
        uniqueMonths,
        uniqueDays,
        uniquePlaces,
      };
    }),
  setSelectedEarthquake: (id) => set({ selectedEarthquake: id }),
  setHoveredEarthquake: (id) => set({ hoveredEarthquake: id }),
  setSelectedChart: (chart) => set({ selectedChart: chart }),
  setScatterXAxis: (axis) => set({ scatterXAxis: axis }),
  setScatterYAxis: (axis) => set({ scatterYAxis: axis }),
  setLineXAxis: (axis) => set({ lineXAxis: axis }),
  setLineYAxis: (axis) => set({ lineYAxis: axis }),
  setBarXAxis: (axis) => set((state) => ({
    barXAxis: axis,
    binnedCounts: computeBinnedCounts(state.filteredEarthquakes, axis),
  })),
  setFilterYear: (year) =>
    set((state) => {
      const filtered = applyFilters(state.earthquakes, year, state.filterMonth, state.filterDay, state.filterPlace, state.filterMagnitude, state.filterDepth);
      return {
        filterYear: year,
        filteredEarthquakes: filtered,
        placeCounts: computePlaceCounts(filtered),
        binnedCounts: computeBinnedCounts(filtered, state.barXAxis),
      };
    }),
  setFilterMonth: (month) =>
    set((state) => {
      const filtered = applyFilters(state.earthquakes, state.filterYear, month, state.filterDay, state.filterPlace, state.filterMagnitude, state.filterDepth);
      return {
        filterMonth: month,
        filteredEarthquakes: filtered,
        placeCounts: computePlaceCounts(filtered),
        binnedCounts: computeBinnedCounts(filtered, state.barXAxis),
      };
    }),
  setFilterDay: (day) =>
    set((state) => {
      const filtered = applyFilters(state.earthquakes, state.filterYear, state.filterMonth, day, state.filterPlace, state.filterMagnitude, state.filterDepth);
      return {
        filterDay: day,
        filteredEarthquakes: filtered,
        placeCounts: computePlaceCounts(filtered),
        binnedCounts: computeBinnedCounts(filtered, state.barXAxis),
      };
    }),
  setFilterPlace: (place) =>
    set((state) => {
      const filtered = applyFilters(state.earthquakes, state.filterYear, state.filterMonth, state.filterDay, place, state.filterMagnitude, state.filterDepth);
      return {
        filterPlace: place,
        filteredEarthquakes: filtered,
        placeCounts: computePlaceCounts(filtered),
        binnedCounts: computeBinnedCounts(filtered, state.barXAxis),
      };
    }),
  setFilterMagnitude: (magnitude) =>
    set((state) => {
      const filtered = applyFilters(state.earthquakes, state.filterYear, state.filterMonth, state.filterDay, state.filterPlace, magnitude, state.filterDepth);
      return {
        filterMagnitude: magnitude,
        filteredEarthquakes: filtered,
        placeCounts: computePlaceCounts(filtered),
        binnedCounts: computeBinnedCounts(filtered, state.barXAxis),
      };
    }),
  setFilterDepth: (depth) =>
    set((state) => {
      const filtered = applyFilters(state.earthquakes, state.filterYear, state.filterMonth, state.filterDay, state.filterPlace, state.filterMagnitude, depth);
      return {
        filterDepth: depth,
        filteredEarthquakes: filtered,
        placeCounts: computePlaceCounts(filtered),
        binnedCounts: computeBinnedCounts(filtered, state.barXAxis),
      };
    }),
}));

function applyFilters(data: Earthquake[], year: string, month: string, day: string, place: string, magnitude: string, depth: string): Earthquake[] {
  let filtered = data.slice();
  if (year) {
    filtered = filtered.filter((quake) => new Date(quake.time).getFullYear().toString() === year);
  }
  if (month) {
    filtered = filtered.filter((quake) => (new Date(quake.time).getMonth() + 1).toString().padStart(2, '0') === month);
  }
  if (day) {
    filtered = filtered.filter((quake) => new Date(quake.time).getDate().toString().padStart(2, '0') === day);
  }
  if (place) {
    filtered = filtered.filter((quake) => extractPlace(quake.place) === place);
  }
  if (magnitude) {
    const magValue = parseFloat(magnitude);
    if (!isNaN(magValue)) {
      filtered = filtered.filter((quake) => quake.mag >= magValue);
    }
  }
  if (depth) {
    const depthValue = parseFloat(depth);
    if (!isNaN(depthValue)) {
      filtered = filtered.filter((quake) => quake.depth >= depthValue);
    }
  }
  return filtered;
}

function extractPlace(fullPlace: string): string {
  const match = fullPlace.match(/,\s*([^,]+)$/);
  return match ? match[1].trim() : fullPlace;
}

function computePlaceCounts(data: Earthquake[]): PlaceCount[] {
  const counts = data.reduce((acc, quake) => {
    const place = extractPlace(quake.place);
    acc[place] = (acc[place] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(counts).map(([place, count]) => ({ place, count }));
}

function computeBinnedCounts(data: Earthquake[], axis: keyof Pick<Earthquake, 'place' | 'latitude' | 'longitude' | 'depth' | 'mag'>): BinnedCount[] {
  if (axis === 'place') {
    return computePlaceCounts(data).map((item) => ({ bin: item.place, count: item.count }));
  }
  const values = data.map((quake) => quake[axis] as number);
  if (values.length === 0) return [];
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  const binSize = (max - min) / 10; // 10 bins
  const bins: Record<string, number> = {};
  values.forEach((value) => {
    const bin = Math.floor((value - min) / binSize) * binSize + min;
    const binLabel = bin.toFixed(2);
    bins[binLabel] = (bins[binLabel] || 0) + 1;
  });
  return Object.entries(bins).map(([bin, count]) => ({ bin, count }));
}