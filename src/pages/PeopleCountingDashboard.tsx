import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../layouts/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import peopleData from "../assets/people_counting_data.json";
import { FiDownload, FiChevronDown, FiX } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Joyride, { CallBackProps, Step, STATUS } from "react-joyride";

interface CameraData {
  site: string;
  camera_name: string;
  timezone: string;
  trend: number[];
  count: number;
  peak: number;
  preview_image_url: string;
  date: string;
}

function PeopleCountingDashboard() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [data, setData] = useState<CameraData[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("All");
  const [selectedCamera, setSelectedCameraFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCameraDetails, setSelectedCameraDetails] =
    useState<CameraData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [runTour, setRunTour] = useState(false);

  // Lance automatiquement le guide au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setRunTour(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Joyride tour steps
  const steps: Step[] = [
    {
      target: ".site-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Filtre par site</h3>
          <p className="text-gray-200">Filtrez les données par emplacement</p>
          <div className="text-xs mt-1 text-indigo-300">Étape 1/5</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".camera-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Filtre par caméra</h3>
          <p className="text-gray-200">Sélectionnez une caméra spécifique</p>
          <div className="text-xs mt-1 text-indigo-300">Étape 2/5</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".date-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Filtre par date</h3>
          <p className="text-gray-200">Sélectionnez une plage de dates</p>
          <div className="text-xs mt-1 text-indigo-300">Étape 3/5</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".export-button",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Exportation</h3>
          <p className="text-gray-200">Exportez les données filtrées en CSV</p>
          <div className="text-xs mt-1 text-indigo-300">Étape 4/5</div>
        </div>
      ),
      placement: "left",
    },
    {
      target: ".table-row",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Détails</h3>
          <p className="text-gray-200">
            Cliquez pour voir les statistiques détaillées
          </p>
          <div className="text-xs mt-1 text-indigo-300">Étape 5/5</div>
        </div>
      ),
      placement: "right",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
    }
  };

  useEffect(() => {
    setData(peopleData.cameras);
    setIsLoading(false);
  }, []);

  const filteredData = data.filter((camera) => {
    const siteMatch = selectedSite === "All" || camera.site === selectedSite;
    const cameraMatch =
      selectedCamera === "All" || camera.camera_name === selectedCamera;

    // Date filtering
    const cameraDate = new Date(camera.date);
    let dateMatch = true;

    if (startDate) {
      dateMatch = dateMatch && cameraDate >= startDate;
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && cameraDate <= endOfDay;
    }

    return siteMatch && cameraMatch && dateMatch;
  });

  const siteOptions = Array.from(new Set(data.map((camera) => camera.site)));
  const cameraOptions = Array.from(
    new Set(
      data
        .filter(
          (camera) => selectedSite === "All" || camera.site === selectedSite
        )
        .map((camera) => camera.camera_name)
    )
  );

  const formatDateRange = () => {
    if (!startDate && !endDate) return "All dates";
    if (startDate && !endDate) return `From ${startDate.toLocaleDateString()}`;
    if (!startDate && endDate) return `To ${endDate.toLocaleDateString()}`;
    return `${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;
  };

  const downloadCSV = () => {
    const csvRows = [];
    csvRows.push(["Site", "Camera", "Date", "Count", "Peak"]);

    filteredData.forEach((camera) => {
      csvRows.push([
        camera.site,
        camera.camera_name,
        camera.date,
        camera.count,
        camera.peak,
      ]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "camera_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSelectedSite("All");
    setSelectedCameraFilter("All");
    setStartDate(null);
    setEndDate(null);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main
        className="flex-1 p-4 md:p-6 overflow-x-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* User Guide Tour avec style violet/indigo */}
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
              arrowColor: "#8b5cf6",
              primaryColor: "#8b5cf6",
              backgroundColor: "#1E293B",
              textColor: "#FFFFFF",
              overlayColor: "rgba(0, 0, 0, 0.7)",
            },
            tooltipContainer: {
              textAlign: "left",
            },
            buttonNext: {
              backgroundColor: "#8b5cf6",
              color: "#FFFFFF",
            },
            buttonBack: {
              color: "#FFFFFF",
            },
            buttonSkip: {
              color: "#FFFFFF",
            },
          }}
        />

        {/* Compact Filter Section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="site-filter">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Site
            </label>
            <select
              value={selectedSite}
              onChange={(e) => {
                setSelectedSite(e.target.value);
                setSelectedCameraFilter("All");
              }}
              className="w-full p-2 text-sm rounded border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Sites</option>
              {siteOptions.map((site, idx) => (
                <option key={idx} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>

          <div className="camera-filter">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Camera
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCameraFilter(e.target.value)}
              className="w-full p-2 text-sm rounded border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Cameras</option>
              {cameraOptions.map((camera, idx) => (
                <option key={idx} value={camera}>
                  {camera}
                </option>
              ))}
            </select>
          </div>

          <div className="date-filter">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Date Range
            </label>
            <div className="relative">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="w-full p-2 pl-3 pr-8 text-sm text-left rounded border border-gray-700 bg-gray-800 text-white flex items-center justify-between"
              >
                <span>{formatDateRange()}</span>
                <FiChevronDown className="ml-2" />
              </button>

              {showDateFilter && (
                <div className="absolute z-10 mt-1 bg-gray-800 shadow-lg rounded-md p-3 border border-gray-700 w-full sm:w-96">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Start Date
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        className="w-full p-2 text-sm rounded border border-gray-700 bg-gray-800 text-white"
                        placeholderText="Select start date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        End Date
                      </label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        className="w-full p-2 text-sm rounded border border-gray-700 bg-gray-800 text-white"
                        placeholderText="Select end date"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => {
                        setStartDate(null);
                        setEndDate(null);
                        setShowDateFilter(false);
                      }}
                      className="text-xs text-gray-400 hover:text-white mr-3"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowDateFilter(false)}
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-white px-3 py-2 border border-gray-700 rounded h-[42px]"
            >
              <FiX size={16} />
              <span>Clear</span>
            </button>

            {/* Bouton Export sous forme d'icône avec tooltip */}
            <div className="relative group">
              <button
                onClick={downloadCSV}
                className="flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded h-[42px] w-[42px] export-button"
                aria-label="Export CSV"
              >
                <FiDownload size={20} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                CSV Download
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Camera
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Trend
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Peak
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredData.length > 0 ? (
                    filteredData.map((camera, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-700 cursor-pointer table-row"
                        onClick={() => setSelectedCameraDetails(camera)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          {camera.site}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {camera.camera_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {camera.date}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="w-24 h-10">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={camera.trend.map((value, idx) => ({
                                  hour: idx + 1,
                                  people: value,
                                }))}
                              >
                                <Line
                                  type="monotone"
                                  dataKey="people"
                                  stroke="#6366f1"
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <XAxis dataKey="hour" hide />
                                <YAxis hide />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          <span className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs">
                            {camera.count.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          <span className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs">
                            {camera.peak.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No cameras match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {selectedCameraDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 relative border border-gray-700"
              >
                <button
                  onClick={() => setSelectedCameraDetails(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <FiX size={24} />
                </button>
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedCameraDetails.camera_name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedCameraDetails.site} •{" "}
                      {selectedCameraDetails.date}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-300 mb-3">
                        Hourly Trend
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={selectedCameraDetails.trend.map(
                              (value, idx) => ({
                                hour: idx + 1,
                                people: value,
                              })
                            )}
                          >
                            <XAxis
                              dataKey="hour"
                              label={{
                                value: "Hour",
                                position: "insideBottom",
                                offset: -5,
                                fill: "#9CA3AF",
                              }}
                              stroke="#6B7280"
                            />
                            <YAxis
                              label={{
                                value: "People",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#9CA3AF",
                              }}
                              stroke="#6B7280"
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1F2937",
                                borderColor: "#4B5563",
                                color: "#F3F4F6",
                              }}
                              formatter={(value) => [`${value} people`, "Hour"]}
                              labelFormatter={(hour) => `Hour ${hour}`}
                            />
                            <Bar
                              dataKey="people"
                              fill="#6366f1"
                              name="People Count"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-300 mb-3">
                        Statistics
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Total Count</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedCameraDetails.count.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Peak Traffic</p>
                          <p className="text-2xl font-bold text-white">
                            {selectedCameraDetails.peak.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">
                            Average per hour
                          </p>
                          <p className="text-xl font-bold text-white">
                            {Math.round(
                              selectedCameraDetails.count /
                                selectedCameraDetails.trend.length
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default PeopleCountingDashboard;
   