import { useState, useEffect } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";
import {
  Clock,
  ChevronDown,
  Search,
  Download,
  XCircle,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import mediaData from "../../assets/lpr_data.json";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  format,
  setHours,
  setMinutes,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { saveAs } from "file-saver";

interface MediaItem {
  date: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  location: string;
  image?: string;
  video?: string;
}

interface Filters {
  brand: string;
  model: string;
  color: string;
  plate: string;
}

const PlateDetectionSystem = () => {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [filters, setFilters] = useState<Filters>({
    brand: "",
    model: "",
    color: "",
    plate: "",
  });
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null as Date | null,
      endDate: null as Date | null,
      key: "selection",
    },
  ]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [runTour, setRunTour] = useState(false);

  // Démarrer le tour automatiquement après le chargement du composant
  useEffect(() => {
    const timer = setTimeout(() => {
      setRunTour(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Joyride tour steps
  const steps: Step[] = [
    {
      target: ".date-range-button",
      content: (
        <div>
          <h3 className="font-bold mb-1">Sélection de dates</h3>
          <p>Cliquez ici pour filtrer par plage de dates</p>
          <div className="text-xs mt-1 text-gray-300">Étape 1/9</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".brand-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1">Filtre par marque</h3>
          <p>Sélectionnez une marque de véhicule</p>
          <div className="text-xs mt-1 text-gray-300">Étape 2/9</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".model-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1">Filtre par modèle</h3>
          <p>Sélectionnez un modèle spécifique</p>
          <div className="text-xs mt-1 text-gray-300">Étape 3/9</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".color-filter",
      content: (
        <div>
          <h3 className="font-bold mb-1">Filtre par couleur</h3>
          <p>Filtrez les résultats par couleur de véhicule</p>
          <div className="text-xs mt-1 text-gray-300">Étape 4/9</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".plate-search",
      content: (
        <div>
          <h3 className="font-bold mb-1">Recherche de plaque</h3>
          <p>Recherchez des plaques d'immatriculation spécifiques</p>
          <div className="text-xs mt-1 text-gray-300">Étape 5/9</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".clear-filters",
      content: (
        <div>
          <h3 className="font-bold mb-1">Réinitialisation</h3>
          <p>Cliquez pour réinitialiser tous les filtres</p>
          <div className="text-xs mt-1 text-gray-300">Étape 6/9</div>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".csv-download",
      content: (
        <div>
          <h3 className="font-bold mb-1">Export CSV</h3>
          <p>Exportez les données actuelles au format CSV</p>
          <div className="text-xs mt-1 text-gray-300">Étape 7/9</div>
        </div>
      ),
      placement: "left",
    },
    {
      target: ".pagination-controls",
      content: (
        <div>
          <h3 className="font-bold mb-1">Pagination</h3>
          <p>Naviguez entre les pages de résultats</p>
          <div className="text-xs mt-1 text-gray-300">Étape 8/9</div>
        </div>
      ),
      placement: "top",
    },
    {
      target: ".table-row",
      content: (
        <div>
          <h3 className="font-bold mb-1">Détails</h3>
          <p>Cliquez sur une ligne pour voir les détails et la vidéo</p>
          <div className="text-xs mt-1 text-gray-300">Étape 9/9</div>
        </div>
      ),
      placement: "right",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, type } = data;

    if (type === "tour:end" || action === "skip") {
      setRunTour(false);
    }
  };

  const parseDate = (dateStr: string): Date => {
    const normalizedStr = dateStr
      .replace(/(\d{4}-\d{1,2}-)(\d{1,2}T)(\d{1,2}:)/, (match, p1, p2, p3) => {
        return p1 + p2.padStart(3, "0") + p3.padStart(3, "0");
      })
      .replace(
        /(T\d{2}:)(\d{1,2}:)/,
        (match, p1, p2) => p1 + p2.padStart(3, "0")
      );

    return parseISO(normalizedStr);
  };

  const createDateTime = (date: Date | null, time: string): Date | null => {
    if (!date) return null;
    const [hours, minutes] = time.split(":").map(Number);
    return setMinutes(setHours(new Date(date), hours), minutes);
  };

  const handleRowClick = (item: MediaItem) => {
    if (item.video) {
      setSelectedItem(item);
      setShowVideoModal(true);
    }
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedItem(null);
  };

  const brands = Array.from(new Set(mediaData.map((item) => item.brand)));
  const models = Array.from(new Set(mediaData.map((item) => item.model)));
  const colors = Array.from(new Set(mediaData.map((item) => item.color)));

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleDateChange = (item: RangeKeyDict) => {
    const { selection } = item;
    setDateRange([selection]);
    setDateSelected(true);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const header = "Date,Plate,Brand,Model,Color,Location,Video\n";
    const rows = filteredData
      .map(
        (item) =>
          `${item.date},${item.plate},${item.brand},${item.model},${item.color},${item.location},${item.video}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "plate_data.csv");
  };

  const exportCurrentItemToCSV = () => {
    if (!selectedItem) return;

    const header = "Date,Plate,Brand,Model,Color,Location,Video\n";
    const row = `${selectedItem.date},${selectedItem.plate},${selectedItem.brand},${selectedItem.model},${selectedItem.color},${selectedItem.location},${selectedItem.video}`;

    const blob = new Blob([header + row], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `plate_${selectedItem.plate}_data.csv`);
  };

  const handleClearFilters = () => {
    setFilters({ brand: "", model: "", color: "", plate: "" });
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setStartTime("00:00");
    setEndTime("23:59");
    setDateSelected(false);
    setCurrentPage(1);
  };

  const filteredData = mediaData.filter((item: MediaItem) => {
    const itemDate = parseDate(item.date);

    if (isNaN(itemDate.getTime())) {
      console.error("Date invalide:", item.date);
      return false;
    }

    if (dateSelected && dateRange[0].startDate && dateRange[0].endDate) {
      const startDateTime = createDateTime(dateRange[0].startDate, startTime);
      const endDateTime = createDateTime(dateRange[0].endDate, endTime);

      if (!startDateTime || !endDateTime) return false;

      if (
        !isWithinInterval(itemDate, {
          start: startDateTime,
          end: endDateTime,
        })
      ) {
        return false;
      }
    }

    const matchBrand = filters.brand ? item.brand === filters.brand : true;
    const matchModel = filters.model ? item.model === filters.model : true;
    const matchColor = filters.color ? item.color === filters.color : true;
    const matchPlate = filters.plate
      ? item.plate.toLowerCase().includes(filters.plate.toLowerCase())
      : true;

    return matchBrand && matchModel && matchColor && matchPlate;
  });

  const sortedData = [...filteredData].sort(
    (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-800 via-indigo-800 to-purple-800">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main
        className="flex-1 overflow-hidden p-6 sm:p-8 transition-all duration-300"
        style={{ marginLeft: sidebarWidth, backgroundColor: "#1A202C" }}
      >
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
              arrowColor: "#8b5cf6",
              primaryColor: "#8b5cf6",
              backgroundColor: "#1E293B",
              textColor: "#FFFFFF",
              overlayColor: "rgba(0, 0, 0, 0.5)",
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

        {/* Video Modal */}
        {showVideoModal && selectedItem && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-600 flex flex-col h-[90vh]">
              <div className="flex justify-between items-center p-4 bg-gray-700 border-b border-gray-600">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Play className="text-indigo-400" size={20} />
                  Video Details
                </h3>
                <button
                  onClick={closeVideoModal}
                  className="text-gray-300 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-2/3 bg-black flex items-center justify-center">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    <source src={selectedItem.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="w-1/3 p-6 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-indigo-400">
                          Vehicle Information
                        </span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-gray-400 w-24 flex-shrink-0">
                            Plate:
                          </span>
                          <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">
                            {selectedItem.plate}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-400 w-24 flex-shrink-0">
                            Brand:
                          </span>
                          <span className="text-white">
                            {selectedItem.brand}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-400 w-24 flex-shrink-0">
                            Model:
                          </span>
                          <span className="text-white">
                            {selectedItem.model}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-400 w-24 flex-shrink-0">
                            Color:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-white">
                              {selectedItem.color}
                            </span>
                            <div
                              className="w-4 h-4 rounded-full border border-gray-500"
                              style={{
                                backgroundColor:
                                  selectedItem.color.toLowerCase(),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-indigo-400">
                          Detection Details
                        </span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-gray-400 w-24 flex-shrink-0">
                            Date:
                          </span>
                          <span className="text-white">
                            {format(parseDate(selectedItem.date), "yyyy-MM-dd")}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-400 w-24 flex-shrink-0">
                            Time:
                          </span>
                          <span className="text-white">
                            {format(parseDate(selectedItem.date), "HH:mm:ss")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-indigo-400">Location</span>
                      </h4>
                      <p className="text-white">{selectedItem.location}</p>
                    </div>

                    {selectedItem.image && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="text-indigo-400">Snapshot</span>
                        </h4>
                        <img
                          src={selectedItem.image}
                          alt={`Plate ${selectedItem.plate}`}
                          className="w-full rounded border border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-700 border-t border-gray-600 flex justify-end gap-2">
                <button
                  onClick={exportCurrentItemToCSV}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="flex flex-wrap gap-4 mb-6 items-center relative">
          <div className="relative flex-grow">
            <button
              onClick={() => setShowDateRange(!showDateRange)}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-all duration-300 date-range-button"
            >
              <Clock size={20} />
              {dateSelected && dateRange[0].startDate && dateRange[0].endDate
                ? `From ${format(
                    dateRange[0].startDate,
                    "yyyy-MM-dd"
                  )} ${startTime} to ${format(
                    dateRange[0].endDate,
                    "yyyy-MM-dd"
                  )} ${endTime}`
                : `All dates`}
              <ChevronDown size={16} />
            </button>

            {showDateRange && (
              <div className="absolute z-50 mt-2 bg-white p-4 rounded shadow-lg space-y-2">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleDateChange}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  className="rounded"
                />
                <div className="flex gap-4 items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Start Time:
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="ml-2 border rounded px-2 py-1"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    End Time:
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="ml-2 border rounded px-2 py-1"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <select
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
            className="bg-gray-700 text-white px-4 py-2 rounded-md border-2 border-gray-600 focus:outline-none brand-filter"
          >
            <option value="">All Brands</option>
            {brands.map((brand, idx) => (
              <option key={idx} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            name="model"
            value={filters.model}
            onChange={handleFilterChange}
            className="bg-gray-700 text-white px-4 py-2 rounded-md border-2 border-gray-600 focus:outline-none model-filter"
          >
            <option value="">All Models</option>
            {models.map((model, idx) => (
              <option key={idx} value={model}>
                {model}
              </option>
            ))}
          </select>

          <select
            name="color"
            value={filters.color}
            onChange={handleFilterChange}
            className="bg-gray-700 text-white px-4 py-2 rounded-md border-2 border-gray-600 focus:outline-none color-filter"
          >
            <option value="">All Colors</option>
            {colors.map((color, idx) => (
              <option key={idx} value={color}>
                {color}
              </option>
            ))}
          </select>

          <div className="relative flex-grow ml-auto max-w-xs plate-search">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="plate"
              placeholder="Search plate"
              value={filters.plate}
              onChange={handleFilterChange}
              className="w-full bg-teal-800/30 text-white pl-10 pr-4 py-2 rounded-lg border border-teal-700/50"
            />
          </div>

          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-all duration-300 clear-filters"
          >
            <XCircle size={20} />
            Clear Filters
          </button>
        </div>

        {/* Results Counter - Right Aligned */}
        <div className="flex justify-end mb-2">
          <div className="text-gray-400 flex items-center gap-3">
            <span>
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} plates
            </span>
            <div className="relative group csv-download">
              <button
                onClick={exportToCSV}
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                <Download size={18} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                CSV Download
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto rounded-xl bg-gray-800/50 backdrop-blur-sm p-4 max-w-full mb-4">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm text-gray-300">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">
                  Plate
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">
                  Brand / Model / Color
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-300">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-800 table-row ${
                    item.video ? "hover:bg-gray-700/30 cursor-pointer" : ""
                  }`}
                  onClick={() => item.video && handleRowClick(item)}
                >
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {format(parseDate(item.date), "yyyy-MM-dd HH:mm:ss")}
                  </td>
                  <td className="px-6 py-4 text-gray-200 font-mono">
                    {item.plate}
                  </td>
                  <td className="px-6 py-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.plate}
                        className="w-20 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-12 bg-gray-700 rounded" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-200">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.brand}</span>
                      <span className="text-sm text-gray-400">
                        {item.model} • {item.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-200">{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Centered Pagination */}
        <div className="flex justify-center pagination-controls">
          <div className="flex gap-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={i}
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlateDetectionSystem;
