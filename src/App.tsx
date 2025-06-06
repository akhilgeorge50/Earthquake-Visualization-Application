import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useEarthquakeStore } from './store/useEarthquakeStore';
import type { Earthquake } from './types';
import Layout from './components/Layout';

function App() {
  const { setEarthquakes } = useEarthquakeStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv')
      .then((response) => response.text())
      .then((data) => {
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsedData: Earthquake[] = result.data.map((row: any) => {
              const date = new Date(row.time);
              return {
                id: row.id,
                time: row.time,
                date: date.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).split('/').join('-'),
                timeFormatted: date.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }),
                latitude: parseFloat(row.latitude),
                longitude: parseFloat(row.longitude),
                depth: parseFloat(row.depth),
                mag: parseFloat(row.mag),
                place: row.place,
                type: row.type,
              };
            });
            setEarthquakes(parsedData);
            setLoading(false);
          },

        });
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [setEarthquakes]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return <Layout />;
}

export default App;