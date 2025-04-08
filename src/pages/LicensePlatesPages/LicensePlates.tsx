import { useState } from 'react';
import { Camera, ChevronDown, Search } from 'lucide-react';
import Sidebar from '../../layouts/Sidebar';
import plateData from '../../assets/lpr_data.json';
import Papa from 'papaparse';

const PlateDetectionSystem = () => {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const ROWS_PER_PAGE = 20;

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
      return { time: 'Invalid', date: 'Invalid Date' };
    }
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: date.toLocaleDateString('en-CA'),
    };
  };

  const filteredData = plateData.filter((item: any) => {
    const { time, date } = formatDate(item.date);
    const matchesDate = selectedDate ? date === selectedDate : true;
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : true;
    const matchesModel = selectedModel ? item.model === selectedModel : true;
    const matchesColor = selectedColor ? item.color === selectedColor : true;
    const matchesPlate = item.plate.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDate && matchesBrand && matchesModel && matchesColor && matchesPlate;
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

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-800 via-indigo-800 to-purple-800">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 overflow-hidden p-6 sm:p-8" style={{ marginLeft: sidebarWidth, backgroundColor: '#1A202C' }}>
        {/* Top controls */}
        <div className="flex flex-wrap gap-4 mb-6 justify-between">
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">
            <Camera size={20} />
            Cameras (1)
            <ChevronDown size={16} />
          </button>
          <button onClick={handleCSVExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300">
            Download CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative text-gray-400">
            <Search className="absolute top-2.5 left-3 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Plate"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none"
          />
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none"
          >
            <option value="">All Brands</option>
            {uniqueBrands.map((brand, i) => (
              <option key={i} value={brand}>{brand}</option>
            ))}
          </select>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none"
          >
            <option value="">All Models</option>
            {uniqueModels.map((model, i) => (
              <option key={i} value={model}>{model}</option>
            ))}
          </select>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none"
          >
            <option value="">All Colors</option>
            {uniqueColors.map((color, i) => (
              <option key={i} value={color}>{color}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="text-right text-gray-400 mb-4">{filteredData.length} plates</div>
        <div className="overflow-x-auto rounded-xl bg-gray-800/50 backdrop-blur-sm p-4 max-w-full">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm text-gray-300">Time</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Plate</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Image</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Brand / Model / Color</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Location</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item: any, index: number) => {
                const { time, date } = formatDate(item.date);
                return (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="text-gray-200">{time}</div>
                      <div className="text-sm text-gray-400">{date}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-mono">{item.plate}</td>
                    <td className="px-6 py-4">
                      <img src={item.image} alt="plate" className="w-20 h-12 rounded object-cover" />
                    </td>
                    <td className="px-6 py-4 text-gray-200">{`${item.brand} / ${item.model} / ${item.color}`}</td>
                    <td className="px-6 py-4 text-gray-200">{item.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="text-white mt-2">Page {currentPage} of {totalPages}</div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default PlateDetectionSystem;
