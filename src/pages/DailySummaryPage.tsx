import { useState, useEffect } from "react";
import Sidebar from "../layouts/Sidebar";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import summaryData from "../assets/dayli_summry.json";
import Joyride, { CallBackProps, Step } from "react-joyride";

interface VideoData {
  date: string;
  temperature: string;
  camera: string;
  video_url: string;
  counts: {
    person: number;
    vehicle: number;
    truck: number;
    animal: number;
    bicycle: number;
  };
}

function DailySummary() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [selectedCamera, setSelectedCamera] = useState("all");
  const [selectedAnalytics, setSelectedAnalytics] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    key: "selection",
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [runTour, setRunTour] = useState(false);

  // Lance automatiquement le guide au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setRunTour(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { daily_summaries } = summaryData;

  // Steps for the user guide tour
  const steps: Step[] = [
    {
      target: ".date-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Filtre par date</h3>
          <p className="text-gray-200">
            Sélectionnez une plage de dates pour filtrer les vidéos
          </p>
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
      target: ".analytics-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Filtre par détection</h3>
          <p className="text-gray-200">Filtrez par type d'objets détectés</p>
          <div className="text-xs mt-1 text-indigo-300">Étape 3/5</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".reset-button",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Réinitialisation</h3>
          <p className="text-gray-200">Réinitialisez tous les filtres</p>
          <div className="text-xs mt-1 text-indigo-300">Étape 4/5</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".video-card",
      content: (
        <div>
          <h3 className="font-bold mb-1 text-white">Visualisation vidéo</h3>
          <p className="text-gray-200">
            Cliquez sur une carte pour voir les détails et les analyses
          </p>
          <div className="text-xs mt-1 text-indigo-300">Étape 5/5</div>
        </div>
      ),
      placement: "top",
    },
  ];

  const filteredVideos = daily_summaries.filter((video: VideoData) => {
    const cameraMatch =
      selectedCamera === "all" || video.camera === selectedCamera;
    const videoDate = new Date(video.date);
    const dateMatch =
      (!dateRange.startDate || videoDate >= new Date(dateRange.startDate)) &&
      (!dateRange.endDate || videoDate <= new Date(dateRange.endDate));
    const analyticsMatch =
      selectedAnalytics === "all" ||
      video.counts[selectedAnalytics as keyof typeof video.counts] > 0;

    return cameraMatch && dateMatch && analyticsMatch;
  });

  const cameras = [
    ...new Set(daily_summaries.map((item: VideoData) => item.camera)),
  ];
  const analyticsTypes = [
    { key: "all", label: "All Analytics" },
    { key: "person", label: "Person 👤" },
    { key: "vehicle", label: "Vehicle 🚗" },
    { key: "truck", label: "Truck 🚚" },
    { key: "animal", label: "Animal 🐾" },
    { key: "bicycle", label: "Bicycle 🚲" },
  ];

  const handleSelectDateRange = (ranges: any) => {
    setDateRange(ranges.selection);
  };

  const resetFilters = () => {
    setSelectedCamera("all");
    setSelectedAnalytics("all");
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    });
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, type } = data;
    if (type === "tour:end" || action === "skip") {
      setRunTour(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-8" style={{ marginLeft: sidebarWidth }}>
        {/* User Guide Tour avec style violet/indigo */}
        <Joyride
          steps={steps}
          run={runTour}
          continuous={true}
          scrollToFirstStep={true}
          showSkipButton={true}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              zIndex: 10000,
              arrowColor: "#8b5cf6", // Violet-500
              backgroundColor: "#1E293B", // Gray-800
              primaryColor: "#8b5cf6", // Violet-500
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

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative date-filter">
            <button
              onClick={() => setShowDateRangePicker(!showDateRangePicker)}
              className="bg-gray-800 text-white p-2 rounded border border-gray-700 hover:bg-gray-700"
            >
              {dateRange.startDate && dateRange.endDate
                ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                : "Select Date Range"}
            </button>
            {showDateRangePicker && (
              <div className="absolute z-10 mt-1 bg-gray-800 p-2 rounded border border-gray-700">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleSelectDateRange}
                  moveRangeOnFirstSelection={false}
                  ranges={[dateRange]}
                  minDate={new Date("2025-04-25")}
                  maxDate={new Date("2025-05-06")}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-700 hover:bg-gray-700 camera-filter"
          >
            <option value="all">All Cameras</option>
            {cameras.map((camera: string) => (
              <option key={camera} value={camera}>
                {camera}
              </option>
            ))}
          </select>

          <select
            value={selectedAnalytics}
            onChange={(e) => setSelectedAnalytics(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-700 hover:bg-gray-700 analytics-filter"
          >
            {analyticsTypes.map((type) => (
              <option key={type.key} value={type.key}>
                {type.label}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="bg-gray-800 text-white p-2 rounded border border-gray-700 hover:bg-gray-700 reset-button"
          >
            Reset Filters
          </button>
        </div>

        {/* Liste des vidéos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video: VideoData) => (
              <div
                key={`${video.date}-${video.camera}`}
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow hover:bg-gray-700 video-card"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-white">
                    {video.date} - {video.camera}
                  </h3>
                </div>
                <div className="bg-gray-700 h-48 flex items-center justify-center">
                  <video
                    src={video.video_url}
                    controls
                    className="h-full w-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              No videos match the selected filters
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedVideo.date} - {selectedVideo.camera}
                  </h2>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6 bg-gray-700 h-96 flex items-center justify-center">
                  <video
                    src={selectedVideo.video_url}
                    controls
                    className="h-full w-full"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-white">
                      Metadata
                    </h3>
                    <div className="space-y-2 text-gray-300">
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {selectedVideo.date}
                      </p>
                      <p>
                        <span className="font-semibold">Camera:</span>{" "}
                        {selectedVideo.camera}
                      </p>
                      <p>
                        <span className="font-semibold">Temperature:</span>{" "}
                        {selectedVideo.temperature}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 text-white">
                      Analytics
                    </h3>
                    <div className="space-y-3">
                      {analyticsTypes
                        .filter((t) => t.key !== "all")
                        .map((type) => {
                          const value =
                            selectedVideo.counts[
                              type.key as keyof typeof selectedVideo.counts
                            ];
                          const colors: Record<string, string> = {
                            person: "bg-blue-600",
                            vehicle: "bg-green-600",
                            truck: "bg-yellow-600",
                            animal: "bg-purple-600",
                            bicycle: "bg-red-600",
                          };

                          return (
                            <div key={type.key}>
                              <div className="flex justify-between mb-1 text-gray-300">
                                <span>{type.label}</span>
                                <span>{value}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className={`${
                                    colors[type.key]
                                  } h-2 rounded-full`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      type.key === "person" ||
                                        type.key === "vehicle"
                                        ? value
                                        : value * 20
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DailySummary;
