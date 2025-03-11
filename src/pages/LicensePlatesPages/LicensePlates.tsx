import { useState } from 'react';
import { Clock, Camera, ChevronDown, Search } from 'lucide-react';
import Sidebar from '../../layouts/Sidebar';

const PlateDetectionSystem = () => {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");

  const plateData = [
    {
      time: "04:34:28 PM",
      date: "3/7/2025",
      plate: "G973PMX",
      make: "Jaguar",
      model: "I-Pace",
      color: "Silver",
      confidence: "7%",
      sightings: 13,
      location: "Rear",
      camera: "Office - LPR camera"
    },
    // Add more data as needed
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-800 via-indigo-800 to-purple-800">
      {/* Sidebar */}
      <Sidebar setSidebarWidth={setSidebarWidth} />
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden p-6 sm:p-8" style={{ marginLeft: sidebarWidth, backgroundColor: '#1A202C' }}>
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Header Controls */}
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">
            <Camera size={20} />
            Cameras (1)
            <ChevronDown size={16} />
          </button>

          <button className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition duration-300">
            <Clock size={20} />
            Last 30 days
            <ChevronDown size={16} />
          </button>

          <div className="flex-grow relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search plate"
              className="w-full bg-teal-800/30 text-white pl-10 pr-4 py-2 rounded-lg border border-teal-700/50 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* 80 Plates text */}
        <div className="text-right text-gray-400 mb-4">
          80 plates
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl bg-gray-800/50 backdrop-blur-sm p-4 max-w-full">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm text-gray-300">Time</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Plate</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Image</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">
                  Make / Model / Color
                  <span className="ml-2 px-2 py-1 text-xs bg-teal-500/20 text-teal-300 rounded">BETA</span>
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Sightings</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Plate location</th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">Camera</th>
              </tr>
            </thead>
            <tbody>
              {plateData.map((item, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="text-gray-200">{item.time}</div>
                    <div className="text-sm text-gray-400">{item.date}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-200 font-mono">{item.plate}</td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-12 bg-gray-700 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-200">{`${item.make} / ${item.model} / ${item.color}`}</div>
                    <div className="text-sm text-gray-400">{item.confidence}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full">
                      {item.sightings}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-200">{item.location}</td>
                  <td className="px-6 py-4 text-gray-200">{item.camera}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PlateDetectionSystem;
