# Earthquake Visualization Application.

This is a single-page web application built with React, TypeScript, Tailwind CSS, Recharts, and Zustand. It fetches earthquake data from the USGS, displays it in a single selectable chart and a data table, with interactive filters and sorting.

## Features
- **Responsive Two-Panel Layout**: Scrollable data and Chart panel and  table side-by-side on desktop.
- **Interactive Charts**:
  - **Scatter Plot**: Customizable X/Y axes (latitude, longitude, depth, magnitude).
  - **Line Chart**: Customizable X (time, latitude, longitude, depth, magnitude) and Y axes (latitude, longitude, depth, magnitude).
  - **Bar Chart**: Customizable X axis (place, latitude, longitude, depth, magnitude), Y axis fixed to count.
  - **Chart Selection**: Dropdown to select one chart at a time.
  - **Data Point Emphasis**: Clicked table row highlights chart point red (r=8, #ff0000); hovered row highlights green (r=6, #00ff00); default points blue (r=5, #8884d8) for Scatter/Line.
  - **Tooltip**: Shows X-axis, Y-axis, and Place on hover for Scatter/Line, bin and count for Bar.
- **Data Table**: Scrollable body, fixed header, showing: Date (DD-MM-YYYY), Time (HH:MM), Latitude, Longitude, Depth, Magnitude, Place, Type.
  - Click (persistent, yellow highlight) or hover (temporary, blue-grey highlight) rows for chart emphasis (color, size, tooltip).
  - Sorting: Click column headers to sort ascending/descending with indicators (↑/↓).
- **Data Filtering**:
  - Year, month, day filters (dropdowns with unique dataset values).
  - Place filter (dropdown with unique place names, e.g., "Texas").
  - Type filter (dropdown with unique types, e.g., "earthquake", "quarry blast").
  - Minimum magnitude/depth filters (numeric inputs).
- **State Management**: Zustand for filters, selected/hovered earthquake, chart type, axes, place/bin counts.
- **Loading and Error Handling**: Shows loading indicators, error messages, empty states.
- **Styling**:
  - Centered heading "Earthquake Data" in deep slate blue.
  - Blue-grey background, white card panels with blue-grey shadows.
  - Blue-grey table header, yellow selection, teal accents for focus/hover.
  - Teal lines/bars in charts, slate grey grid/axes.
  - Fixed-height (400px) scrollable table.
  - Footer with copyright and "Developed by" in slate grey.

## Prerequisites
- Node.js (v16+)
- npm (v8+)
- Git

## Installation
1. Clone the repository, Install dependencies and run:

(Open the terminal and run the below code)

git clone https://github.com/akhilgeorge50/Earthquake-Visualization-Application.git;
cd Earthquake-Visualization-Application;

npm install;
npm run dev;

2. Open `http://localhost:5173`.




## Dependencies
- **React**: UI library.
- **TypeScript**: Static typing.
- **Tailwind CSS**: Utility-first CSS with custom colors.
- **Recharts**: Scatter, line, bar charts.
- **Zustand**: State management.
- **Papa Parse**: CSV parsing.
- **Vite**: Build tool/server.

## Additional Features
- **Data Filtering**:
  - Year, month, day dropdowns (e.g., "2025", "06", "05").
  - Place dropdown (e.g., "Texas").
  - Type dropdown (e.g., "earthquake", "quarry blast").
  - Magnitude/depth numeric inputs (e.g., ≥ 2.0, ≥ 5.0 km).
- **Chart Customization**:
  - Single chart via dropdown.
  - Custom axes (e.g., Line: magnitude vs. time).
  - Bar: place or binned data.
  - Emphasis: Blue (r=5), green (hover, r=6), red (click, r=8).

- **Row Selection and Sorting**:
  - Click rows (yellow highlight); hover rows (blue-grey highlight).
  - Sort by clicking headers (Date, Time, Latitude, Longitude, Depth, Magnitude, Place, Type) with ascending/descending toggles (↑/↓).
  - Chart points: Red (clicked, r=8), green (hovered, r=6), blue (default, r=5) with tooltips (no ID).
- **Formatted Table Columns**: Date (DD-MM-YYYY), Time (HH:MM:SS, 24-hour), Latitude, Longitude, Depth, Magnitude, Place, Type.
- **Smooth Scrolling**: Chart point/bar click scrolls to table row.
- **Footer**: Copyright and "Developed by" at page bottom.
- **Color Scheme**: Blue-grey background, teal accents, white panels, yellow selection.

## Project Structure
- `src/components/`: UI components (ChartPanel, DataTable, Layout).
- `src/store/`: Zustand store.
- `src/types/`: TypeScript types.
- `src/App.tsx`: Main app with data fetching.
- `src/index.css`: Tailwind CSS directives.
- `tailwind.config.js`: Custom Tailwind colors.

## Tailwind CSS Setup
- Configured with `tailwind.config.js`, `postcss.config.js`.
- `src/index.css` includes Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`).
- Custom colors in `tailwind.config.js` for blue-grey and teal shades.
- For issues with `npx tailwindcss init -p`, install `tailwindcss`, `postcss`, `autoprefixer` (`npm install --save-dev tailwindcss@3.4.1 postcss autoprefixer`) and clear cache (`npm cache clean --force`).

## Notes
- Fetches data from `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv`.
- Requires internet connection.
- Filters apply dynamically.
- Handles invalid inputs with empty state.

- **Use of AI Tools**: AI tools, including Grok 3 and ChatGpt , were utilized for approximately 50% of the development process. These tools assisted with code generation, debugging, and optimization, particularly in implementing the Zustand store (`useEarthquakeStore.ts`), fixing syntax errors (e.g., `setFilterDepth` and `setFilterType`), and generating initial drafts of components like `Layout.tsx`, `DataTable.tsx`, and `ChartPanel.tsx`. AI also aided in writing documentation, refining Tailwind CSS configurations, and troubleshooting build errors. The remaining development involved manual coding, design decisions, and testing to ensure functionality, such as the interactive filters, and chart interactions. This hybrid approach accelerated development while maintaining high-quality, human-overseen code.

