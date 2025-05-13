import { useState, useEffect } from 'react';  
import Sidebar from '../layouts/Sidebar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import peopleData from '../assets/people_counting_data.json';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

function PeopleCountingDashboard() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [data, setData] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('All');
  const [selectedCamera, setSelectedCamera] = useState<any | null>(null);
  const [runTour, setRunTour] = useState(true); // State to trigger the tour

  useEffect(() => {
    setData(peopleData.cameras);
  }, []);

  const filteredData = selectedSite === 'All'
    ? data
    : data.filter(camera => camera.site === selectedSite);

  const siteOptions = Array.from(new Set(data.map(camera => camera.site)));

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false); // Disable tour once completed or skipped
    }
  };

  const steps = [
    {
      target: '.site-filter',
      content: 'Select the site to filter the cameras.',
    },
    {
      target: '.camera-data-header',
      content: 'This is the camera data section, where you can see the list of cameras and their stats.',
    },
    {
      target: '.camera-table',
      content: 'Click on any camera to view more detailed information and trends.',
    },
    {
      target: '.camera-trend',
      content: 'This chart shows the foot traffic trend for the selected camera.',
    },
    {
      target: '.camera-count',
      content: 'The count here shows the total number of people counted by the camera.',
    },
    {
      target: '.camera-peak',
      content: 'This shows the peak foot traffic recorded by the camera.',
    },
    {
      target: '.modal-close-btn',
      content: 'Click here to close the camera details modal.',
    },
  ];

  // Function to download CSV
  const downloadCSV = () => {
    const csvRows = [];
    // Add headers
    csvRows.push(['Site', 'Camera', 'Time Zone', 'Trend', 'Count', 'Peak']);
    
    // Add rows for each camera
    filteredData.forEach((camera) => {
      csvRows.push([
        camera.site,
        camera.camera_name,
        camera.timezone,
        camera.trend.join(' | '), // Join trend values into a string for simplicity
        camera.count,
        camera.peak
      ]);
    });

    // Create CSV content
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(row => row.join(',')).join('\n');

    // Create a download link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'camera_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-purple-50">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="bg-blue-900 flex-1 p-8 overflow-x-auto" style={{ marginLeft: sidebarWidth }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            People Counting Dashboard
          </h1>
          <p className="text-slate-300 mt-2">Visualize foot traffic trends for each camera</p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex items-center space-x-4 site-filter">
          <div className="flex flex-col">
            <label 
              htmlFor="siteFilter" 
              className="text-sm font-semibold text-indigo-200 mb-1 tracking-wide"
            >
              Filter by Site
            </label>
            <select
              id="siteFilter"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="p-2 rounded-lg border border-indigo-300 bg-indigo-100 text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            >
              <option value="All">All</option>
              {siteOptions.map((site, idx) => (
                <option key={idx} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-50">
          {/* Table Header with Count */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 camera-data-header">
            <h3 className="text-white font-medium">Camera Data</h3>
            <div className="text-sm text-indigo-100">
              Total cameras: {filteredData.length}
            </div>
            {/* Download Button */}
            <button 
              onClick={downloadCSV} 
              className="text-sm text-indigo-100 bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-700 transition-all"
            >
              Download CSV
            </button>
          </div>
          
          <div className="overflow-x-auto camera-table">
            <table className="min-w-full">
              <thead>
                <tr className="bg-indigo-50 text-indigo-700">
                  <th className="px-6 py-4 text-left font-medium">Preview</th>
                  <th className="px-6 py-4 text-left font-medium">Site</th>
                  <th className="px-6 py-4 text-left font-medium">Camera</th>
                  <th className="px-6 py-4 text-left font-medium">Time Zone</th>
                  <th className="px-6 py-4 text-left font-medium">Trend</th>
                  <th className="px-6 py-4 text-left font-medium">Count</th>
                  <th className="px-6 py-4 text-left font-medium">Peak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {filteredData.length > 0 ? (
                  filteredData.map((camera, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-indigo-100 cursor-pointer transition-colors duration-150"
                      onClick={() => setSelectedCamera(camera)}
                    >
                      <td className="px-6 py-4">
                        <div className="w-32 h-20 overflow-hidden rounded-lg border-2 border-indigo-100 shadow-sm">
                          <img src={camera.preview_image_url || "/api/placeholder/120/80"} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{camera.site}</td>
                      <td className="px-6 py-4 text-gray-700">{camera.camera_name}</td>
                      <td className="px-6 py-4 text-gray-600">{camera.timezone}</td>
                      <td className="px-6 py-4 camera-trend">
                        <div className="w-40 h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={camera.trend.map((value: number, idx: number) => ({ idx, value }))}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8b5cf6" 
                                strokeWidth={2} 
                                dot={false}
                                isAnimationActive={true}
                              />
                              <XAxis dataKey="idx" hide />
                              <YAxis hide />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  borderRadius: '0.5rem',
                                  border: '1px solid #e5e7eb',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-indigo-50 text-indigo-700 rounded-full font-medium py-1 px-4 inline-block camera-count">
                          {camera.count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-violet-50 text-violet-700 rounded-full font-medium py-1 px-4 inline-block camera-peak">
                          {camera.peak}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                      No cameras match the selected site.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {selectedCamera && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 modal-close-btn"
              onClick={() => setSelectedCamera(null)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">{selectedCamera.camera_name}</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedCamera.trend.map((value: number, idx: number) => ({ idx, value }))}>
                  <XAxis dataKey="idx" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Joyride Tour */}
      <Joyride
        steps={steps}
        run={runTour}
        callback={handleJoyrideCallback}
        showSkipButton
        continuous
        scrollToFirstStep
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: '#8b5cf6',
            primaryColor: '#8b5cf6',
            textColor: 'black',  // Make sure text is black for readability
          },
        }}
      />
    </div>
  );
}

export default PeopleCountingDashboard;
