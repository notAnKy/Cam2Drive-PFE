import { useState } from 'react';
import { Search, Download, X, Clock } from 'lucide-react';
import Sidebar from '../../layouts/Sidebar';
import plateData from '../../assets/lpr_data.json';
import Papa from 'papaparse';
import Joyride from 'react-joyride';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const PlateDetectionSystem = () => {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [runGuide] = useState(true);
  const [showDateRange, setShowDateRange] = useState(false);

  const ROWS_PER_PAGE = 20;

  const steps = [
    {
      target: '.joy-search',
      content: 'You can search plates here.',
    },
    {
      target: '.joy-filter-date',
      content: 'Use this field to filter results by date and time range.',
    },
    {
      target: '.joy-filter-dropdowns',
      content: 'Filter by brand, model, and color here.',
    },
    {
      target: '.joy-clear-btn',
      content: 'Click here to reset all filters to default.',
    },
    {
      target: '.joy-download-btn',
      content: 'Click here to export the filtered data as a CSV file.',
    },
    {
      target: '.joy-table',
      content: 'Here is the table with the filtered plate detection results.',
    },
    {
      target: '.joy-pagination',
      content: 'Use these buttons to navigate through pages of data.',
    }
  ];

  const normalizeDateString = (input: string) => {
    const match = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{2}):(\d{2})Z$/);
    if (match) {
      const [_, year, month, day, hour, minute, second] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}:${second}Z`;
    }
    return input;
  };

  const formatDate = (isoDate: string) => {
    const normalized = normalizeDateString(isoDate);
    const date = new Date(normalized);
    if (isNaN(date.getTime())) {
      return { time: 'Invalid', date: 'Invalid Date', rawDate: null };
    }
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: date.toLocaleDateString('en-CA'),
      rawDate: date,
    };
  };

  const formatDateToLocalString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredData = plateData.filter((item: any) => {
    const { rawDate } = formatDate(item.date);
    if (!rawDate) return false;

    // Create date objects with time
    const fromDateTime = fromDate 
      ? new Date(`${fromDate}T${fromTime}:00`) 
      : null;
    const toDateTime = toDate 
      ? new Date(`${toDate}T${toTime}:59`)
      : null;

    const isInDateRange = 
      (!fromDateTime || rawDate >= fromDateTime) && 
      (!toDateTime || rawDate <= toDateTime);
    
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : true;
    const matchesModel = selectedModel ? item.model === selectedModel : true;
    const matchesColor = selectedColor ? item.color === selectedColor : true;
    const matchesPlate = item.plate.toLowerCase().includes(searchTerm.toLowerCase());

    return isInDateRange && matchesBrand && matchesModel && matchesColor && matchesPlate;
  });

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ROWS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);

  const uniqueBrands = Array.from(new Set(plateData.map(item => item.brand)));
  const uniqueModels = Array.from(new Set(plateData.map(item => item.model)));
  const uniqueColors = Array.from(new Set(plateData.map(item => item.color)));

  const handleCSVExport = () => {
    const csvData = currentData.map((item: any) => {
      const { time, date } = formatDate(item.date);
      return {
        Time: time,
        Plate: item.plate,
        BrandModelColor: `${item.brand} / ${item.model} / ${item.color}`,
        Location: item.location,
        Image: item.image,
        Date: date
      };
    });

    const csv = Papa.unparse(csvData);
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.target = '_blank';
    link.download = 'plates.csv';
    link.click();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setFromTime('00:00');
    setToTime('23:59');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedColor('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 text-white">
      <Joyride
        steps={steps}
        run={runGuide}
        continuous
        scrollToFirstStep
        showSkipButton
        showProgress
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#6366F1',
          },
        }}
      />
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 overflow-hidden p-6 sm:p-10" style={{ marginLeft: sidebarWidth }}>
        <div className="flex flex-wrap gap-4 mb-6 justify-between">
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="relative col-span-1 joy-search">
            <Search className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Plate"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md bg-gray-800 focus:outline-none"
            />
          </div>

          <div className="col-span-2 relative joy-filter-date">
            <button
              onClick={() => setShowDateRange(!showDateRange)}
              className="px-4 py-2 w-full rounded-md bg-gray-800 flex items-center justify-between"
            >
              <span>
                {fromDate && toDate 
                  ? `${fromDate} ${fromTime} → ${toDate} ${toTime}`
                  : "Select Date & Time Range"}
              </span>
              <Clock className="ml-2 w-4 h-4" />
            </button>
            {showDateRange && (
              <div className="absolute z-50 mt-2 bg-gray-800 p-4 rounded-lg shadow-xl">
                <DateRange
                  ranges={[{
                    startDate: fromDate ? new Date(fromDate) : new Date(),
                    endDate: toDate ? new Date(toDate) : new Date(),
                    key: 'selection'
                  }]}
                  onChange={({ selection }) => {
                    if (selection.startDate && selection.endDate) {
                      setFromDate(formatDateToLocalString(selection.startDate));
                      setToDate(formatDateToLocalString(selection.endDate));
                    }
                  }}
                  moveRangeOnFirstSelection={false}
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">From Time</label>
                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">To Time</label>
                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-gray-700"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowDateRange(false)}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="joy-filter-dropdowns px-4 py-2 rounded-md bg-gray-800 w-full"
          >
            <option value="">All Brands</option>
            {uniqueBrands.map((brand, i) => (
              <option key={i} value={brand}>{brand}</option>
            ))}
          </select>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="joy-filter-dropdowns px-4 py-2 rounded-md bg-gray-800 w-full"
          >
            <option value="">All Models</option>
            {uniqueModels.map((model, i) => (
              <option key={i} value={model}>{model}</option>
            ))}
          </select>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="joy-filter-dropdowns px-4 py-2 rounded-md bg-gray-800 w-full"
          >
            <option value="">All Colors</option>
            {uniqueColors.map((color, i) => (
              <option key={i} value={color}>{color}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          className="joy-clear-btn flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <X size={20} />
          Clear Filters
        </button>

        {/* Table */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400">{filteredData.length} plates found</div>
          <button
            onClick={handleCSVExport}
            className="joy-download-btn flex items-center gap-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition group relative"
            title="Download CSV"
          >
            <Download size={20} />
          </button>
        </div>
        <div className="joy-table overflow-x-auto bg-gray-900/60 rounded-xl p-4 backdrop-blur-sm">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-700 text-left text-sm text-gray-400">
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Plate</th>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Brand / Model / Color</th>
                <th className="px-6 py-4">Location</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item: any, index: number) => {
                const { time, date } = formatDate(item.date);
                return (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4">
                      <div>{time}</div>
                      <div className="text-sm text-gray-400">{date}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">{item.plate}</td>
                    <td className="px-6 py-4">
                      <img src={item.image} alt="plate" className="w-20 h-12 rounded object-cover" />
                    </td>
                    <td className="px-6 py-4">{`${item.brand} / ${item.model} / ${item.color}`}</td>
                    <td className="px-6 py-4">{item.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="joy-pagination flex justify-center mt-6 gap-4 items-center">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-300 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default PlateDetectionSystem;