import { useState, useEffect, JSX } from 'react';
import Sidebar from '../layouts/Sidebar';
import { 
  FiFilter, FiTrash2, FiVideo, FiImage, FiCalendar, 
  FiSearch, FiChevronDown, FiChevronUp, FiX, FiCheck,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  FaCar, FaPersonWalking, FaTrain, FaPlane, 
  FaBus, FaBicycle, FaMotorcycle, FaShip 
} from 'react-icons/fa6';
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Detection {
  _id: string;
  video_id?: string;
  image_id?: string;
  uploaded_filename: string;
  video_result_url?: string;
  image_result_url?: string;
  objects_detected: Record<string, number>;
  object_images?: string[];
  timestamp: string;
}

const objectIcons: Record<string, JSX.Element> = {
  car: <FaCar className="text-blue-500" />,
  person: <FaPersonWalking className="text-green-500" />,
  train: <FaTrain className="text-red-500" />,
  aeroplane: <FaPlane className="text-indigo-500" />,
  bus: <FaBus className="text-yellow-500" />,
  bicycle: <FaBicycle className="text-teal-500" />,
  motorbike: <FaMotorcycle className="text-orange-500" />,
  boat: <FaShip className="text-purple-500" />,
};

const DEFAULT_OBJECT_TYPES = [
  "person", "car", "bicycle", "aeroplane", 
  "boat", "bus", "motorbike", "train"
];

export default function DetectionHistory() {
  const API_BASE = 'http://localhost:8000';
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetections, setSelectedDetections] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [objectTypes, setObjectTypes] = useState<string[]>(DEFAULT_OBJECT_TYPES);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video">("all");
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });

  useEffect(() => {
    fetchDetections();
    
  }, []);

  const fetchDetections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/detections`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setDetections(data);
      setError(null);
    } catch (err) {
      setError("Failed to load detections. Please try again later.");
      console.error("Detection fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedObjects([]);
    setDateRange({
      start: "",
      end: ""
    });
  };

  const deleteDetection = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/detections/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete detection');
      }
      
      setDetections(detections.filter(d => 
        d.video_id !== id && d.image_id !== id
      ));
      setSelectedDetections(selectedDetections.filter(d => d !== id));
      
      if (selectedDetection?.video_id === id || selectedDetection?.image_id === id) {
        setIsViewerOpen(false);
      }
    } catch (err) {
      console.error("Failed to delete detection", err);
      setError("Failed to delete detection. Please try again.");
    }
  };

  const deleteSelected = async () => {
  if (selectedDetections.length === 0) return;
  
  if (window.confirm(`Are you sure you want to delete ${selectedDetections.length} selected items (including all associated frames)?`)) {
    try {
      // Create a copy of the IDs to delete
      const idsToDelete = [...selectedDetections];
      
      // Wait for all deletions to complete
      await Promise.all(idsToDelete.map(id => 
        fetch(`${API_BASE}/detections/${id}`, { method: 'DELETE' })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to delete detection ${id}`);
            }
            return id;
          })
      ));
      
      // Update state after all deletions are complete
      setDetections(prevDetections => 
        prevDetections.filter(d => 
          !idsToDelete.includes(d.video_id || '') && 
          !idsToDelete.includes(d.image_id || '')
        )
      );
      
      // Close viewer if the current selected detection was deleted
      if (selectedDetection && 
          (idsToDelete.includes(selectedDetection.video_id || '') || 
           idsToDelete.includes(selectedDetection.image_id || ''))) {
        setIsViewerOpen(false);
        setSelectedDetection(null);
      }
      
      // Clear selection state
      setSelectedDetections([]);
      setSelectMode(false);
      
    } catch (err) {
      console.error("Error deleting selections:", err);
      setError("Failed to delete some items. Please refresh and try again.");
    }
  }
};

  const toggleSelectDetection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedDetections(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      // Clear selections when exiting select mode
      setSelectedDetections([]);
    }
  };

  const selectAll = () => {
    const allIds = filteredDetections.map(d => d.video_id || d.image_id || '').filter(id => id);
    setSelectedDetections(allIds);
  };

  const deselectAll = () => {
    setSelectedDetections([]);
  };

  const filteredDetections = detections.filter(detection => {
    // Search filter
    if (searchTerm && !detection.uploaded_filename.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (selectedType !== "all") {
      if (selectedType === "video" && !detection.video_result_url) return false;
      if (selectedType === "image" && !detection.image_result_url) return false;
    }
    
    // Object type filter
    if (selectedObjects.length > 0 && !selectedObjects.some(obj => detection.objects_detected[obj])) {
      return false;
    }
    
    // Date range filter
    if (dateRange.start && new Date(detection.timestamp) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(detection.timestamp) > new Date(dateRange.end)) return false;
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalObjects = (detection: Detection) => {
    return Object.values(detection.objects_detected).reduce((sum, count) => sum + count, 0);
  };

  // Calculate statistics
  const totalImages = detections.filter(d => d.image_result_url).length;
  const totalVideos = detections.filter(d => d.video_result_url).length;
  const totalFrames = detections.filter(d => d.video_result_url)
    .reduce((sum, video) => sum + (video.object_images?.length || 0), 0);

  // Determine if any filters are active
  const hasActiveFilters = searchTerm !== "" || 
                          selectedType !== "all" || 
                          selectedObjects.length > 0 || 
                          dateRange.start !== "" || 
                          dateRange.end !== "";
                          


// Helper functions for chart data
const getTopObjects = (detections: Detection[], limit: number) => {
  const objectCounts: Record<string, number> = {};

  detections.forEach(detection => {
    Object.entries(detection.objects_detected).forEach(([object, count]) => {
      objectCounts[object] = (objectCounts[object] || 0) + count;
    });
  });

  return Object.entries(objectCounts)
    .map(([object, count]) => ({ object, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const getTotalObjectCount = (detections: Detection[]) => {
  return detections.reduce((total, detection) => {
    return total + getTotalObjects(detection);
  }, 0);
};

const getWeeklyDetectionCounts = (detections: Detection[]) => {
  const weeklyCounts: Record<string, number> = {};
  
  detections.forEach(detection => {
    const date = new Date(detection.timestamp);
    // Get start of week (Sunday)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
    
    weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
  });

  return Object.entries(weeklyCounts)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
};




  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      
      <main className="flex-1 p-6 transition-all duration-300 bg-blue-900 " style={{ marginLeft: sidebarWidth }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Detection History</h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="text-indigo-600" />
                <span className="text-gray-700">Filters</span>
                {showFilters ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              <button 
                onClick={toggleSelectMode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-sm border transition-colors ${
                  selectMode 
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiCheck className={selectMode ? 'text-indigo-600' : 'text-gray-500'} />
                <span>{selectMode ? 'Exit Selection' : 'Select Items'}</span>
              </button>
            </div>
          </div>

          {/* Selection tools */}
          {selectMode && (
            <div className="flex items-center justify-between mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center">
                <span className="text-indigo-700 font-medium">
                  {selectedDetections.length} item{selectedDetections.length !== 1 ? 's' : ''} selected
                </span>
                <div className="mx-4 border-r border-indigo-200 h-6"></div>
                <div className="flex space-x-4">
                  <button 
                    onClick={selectAll}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={deselectAll}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              {selectedDetections.length > 0 && (
                <button 
                  onClick={deleteSelected}
                  className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg shadow-sm border border-red-100 hover:bg-red-100 transition-colors text-red-600"
                >
                  <FiTrash2 />
                  <span>Delete Selected ({selectedDetections.length})</span>
                </button>
              )}
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by filename..."
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                    <input
                      type="date"
                      className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>

                {/* Object Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Object Types</label>
                  <div className="relative">
                    <select
                      multiple
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-auto min-h-[2.5rem]"
                      value={selectedObjects}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedObjects(options);
                      }}
                    >
                      {objectTypes.map(type => (
                        <option 
                          key={type} 
                          value={type}
                          className="flex items-center px-3 py-2"
                        >
                          <span className="mr-2">
                            {React.cloneElement(objectIcons[type] || <span className="w-4" />, {
                              className: "inline-block"
                            })}
                          </span>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-sm border transition-colors ${
                    hasActiveFilters 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiRefreshCw className={hasActiveFilters ? 'text-indigo-600' : 'text-gray-400'} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
              <h3 className="text-lg font-medium mb-2">Total Detections</h3>
              <p className="text-3xl font-bold">{detections.length}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
              <h3 className="text-lg font-medium mb-2">Videos</h3>
              <p className="text-3xl font-bold">{totalVideos}</p>
            </div>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-xl text-white shadow-lg">
              <h3 className="text-lg font-medium mb-2">Video Frames</h3>
              <p className="text-3xl font-bold">{totalFrames}</p>
            </div>
          </div>
          
          

          {/* Detections Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : filteredDetections.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <h3 className="text-lg font-medium text-gray-700">No detections found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDetections.map(detection => {
                const detectionId = detection.video_id || detection.image_id || '';
                const isSelected = selectedDetections.includes(detectionId);
                
                return (
                  <div 
                    key={detection._id} 
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md ${
                      isSelected ? 
                      'ring-2 ring-indigo-500 border-indigo-300' : 'border-gray-200'
                    } ${selectMode ? '' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (!selectMode) {
                        setSelectedDetection(detection);
                        setIsViewerOpen(true);
                      } else {
                        toggleSelectDetection({ stopPropagation: () => {} } as React.MouseEvent, detectionId);
                      }
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {detection.video_result_url ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <FiVideo className="text-gray-400 text-4xl" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <FiImage className="text-gray-400 text-4xl" />
                        </div>
                      )}
                      
                      {detection.object_images?.[0] && (
                        <img 
                          src={`${API_BASE}${detection.object_images[0]}`} 
                          alt="Detection thumbnail"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      {/* Selection checkbox with improved visibility */}
                      <div className="absolute top-2 right-2 z-10">
                        <div 
                          className={`w-6 h-6 rounded ${
                            isSelected ? 'bg-indigo-600' : 'bg-white border border-gray-300'
                          } flex items-center justify-center shadow-md cursor-pointer`}
                          onClick={(e) => toggleSelectDetection(e, detectionId)}
                        >
                          {isSelected && <FiCheck className="text-white" />}
                        </div>
                      </div>

                      {/* Video indicator with frame count */}
                      {detection.video_result_url && detection.object_images?.length && (
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md flex items-center">
                          <FiVideo className="mr-1" />
                          {detection.object_images.length} frames
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 truncate" title={detection.uploaded_filename}>
                          {detection.uploaded_filename}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap ml-2">
                          {formatDate(detection.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-gray-700">
                            {getTotalObjects(detection)} objects
                          </span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${detection.uploaded_filename}${detection.video_result_url ? ' and all its frames' : ''}?`)) {
                              deleteDetection(detectionId);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      
                      {/* Object Tags */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(detection.objects_detected)
                          .sort((a, b) => b[1] - a[1]) // Sort by count (highest first)
                          .slice(0, 4) // Only show top 4
                          .map(([object, count]) => (
                          <span 
                            key={object} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {objectIcons[object] || null}
                            <span className="ml-1">
                              {count} {object}
                            </span>
                          </span>
                        ))}
                        {Object.keys(detection.objects_detected).length > 4 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{Object.keys(detection.objects_detected).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
          )}
          {/* Summary Charts Section */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-8" style={{ marginTop: '2rem' }}>
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">Detection Overview</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Object Distribution Bar Chart */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <h4 className="text-md sm:text-lg font-medium mb-3 text-center">Most Detected Objects</h4>
                  <div className="relative" style={{ paddingBottom: '75%' }}>
                    <div className="absolute inset-0">
                      <Bar
                        data={{
                          labels: getTopObjects(detections, 8).map(obj => obj.object),
                          datasets: [{
                            label: 'Total Detections',
                            data: getTopObjects(detections, 8).map(obj => obj.count),
                            backgroundColor: 'rgba(79, 70, 229, 0.7)',
                            borderColor: 'rgba(79, 70, 229, 1)',
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = getTotalObjectCount(detections);
                                  const value = context.raw as number;
                                  const percentage = Math.round((value / total) * 100);
                                  return `${context.label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Total Detections'
                              },
                              ticks: {
                                precision: 0
                              }
                            },
                            x: {
                              title: {
                                display: true,
                                text: 'Object Type'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* NEW: Object Distribution Pie Chart */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <h4 className="text-md sm:text-lg font-medium mb-3 text-center">Object Distribution</h4>
                  <div className="relative" style={{ paddingBottom: '75%' }}>
                    <div className="absolute inset-0">
                      <Pie
                        data={{
                          labels: getTopObjects(detections, 8).map(obj => obj.object),
                          datasets: [{
                            data: getTopObjects(detections, 8).map(obj => obj.count),
                            backgroundColor: [
                              'rgba(79, 70, 229, 0.7)',
                              'rgba(99, 102, 241, 0.7)',
                              'rgba(129, 140, 248, 0.7)',
                              'rgba(167, 139, 250, 0.7)',
                              'rgba(217, 70, 239, 0.7)',
                              'rgba(236, 72, 153, 0.7)',
                              'rgba(239, 68, 68, 0.7)',
                              'rgba(245, 158, 11, 0.7)'
                            ],
                            borderColor: [
                              'rgba(79, 70, 229, 1)',
                              'rgba(99, 102, 241, 1)',
                              'rgba(129, 140, 248, 1)',
                              'rgba(167, 139, 250, 1)',
                              'rgba(217, 70, 239, 1)',
                              'rgba(236, 72, 153, 1)',
                              'rgba(239, 68, 68, 1)',
                              'rgba(245, 158, 11, 1)'
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: window.innerWidth < 768 ? 'bottom' : 'right',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = getTotalObjectCount(detections);
                                  const value = context.raw as number;
                                  const percentage = Math.round((value / total) * 100);
                                  return `${context.label}: ${percentage}% (${value})`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <h4 className="text-md sm:text-lg font-medium mb-3 text-center">Detections Over Time</h4>
                <div className="relative" style={{ paddingBottom: '50%' }}>
                  <div className="absolute inset-0">
                    <Bar
                      data={{
                        labels: getWeeklyDetectionCounts(detections).map(week => {
                          const date = new Date(week.week);
                          return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
                        }),
                        datasets: [{
                          label: 'Detections',
                          data: getWeeklyDetectionCounts(detections).map(week => week.count),
                          backgroundColor: 'rgba(16, 185, 129, 0.7)',
                          borderColor: 'rgba(16, 185, 129, 1)',
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Detections: ${context.raw}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Detections'
                            },
                            ticks: {
                              precision: 0
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Week Starting'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Detection Viewer Modal */}
        {isViewerOpen && selectedDetection && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedDetection.uploaded_filename}</h2>
                  <button 
                    onClick={() => setIsViewerOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Main video/image */}
                <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden">
                  {selectedDetection.video_result_url ? (
                    <video 
                      controls 
                      className="w-full"
                      src={`${API_BASE}${selectedDetection.video_result_url}`}
                    />
                  ) : (
                    <img 
                      src={`${API_BASE}${selectedDetection.image_result_url}`} 
                      alt="Detection result"
                      className="w-full max-h-[60vh] object-contain"
                    />
                  )}
                   
                </div>

                {/* Detected objects */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">
                    Detected Objects ({getTotalObjects(selectedDetection)})
                  </h3>
                  
                  {selectedDetection.video_result_url && (
                    <span className="text-sm text-indigo-600 font-medium">
                      {selectedDetection.object_images?.length || 0} total frames
                    </span>
                  )}
                </div>
                 
                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Bar Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-md font-medium mb-3 text-center">Object Detection Distribution</h4>
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: Object.keys(selectedDetection.objects_detected),
                          datasets: [{
                            label: 'Number of Detections',
                            data: Object.values(selectedDetection.objects_detected),
                            backgroundColor: [
                              'rgba(79, 70, 229, 0.7)',  // indigo
                              'rgba(99, 102, 241, 0.7)',  // indigo lighter
                              'rgba(129, 140, 248, 0.7)', // indigo lightest
                              'rgba(167, 139, 250, 0.7)', // purple
                              'rgba(217, 70, 239, 0.7)',  // pink
                              'rgba(236, 72, 153, 0.7)',  // rose
                              'rgba(239, 68, 68, 0.7)',   // red
                              'rgba(245, 158, 11, 0.7)',  // amber
                              'rgba(16, 185, 129, 0.7)',  // emerald
                              'rgba(6, 182, 212, 0.7)',   // cyan
                            ],
                            borderColor: [
                              'rgba(79, 70, 229, 1)',
                              'rgba(99, 102, 241, 1)',
                              'rgba(129, 140, 248, 1)',
                              'rgba(167, 139, 250, 1)',
                              'rgba(217, 70, 239, 1)',
                              'rgba(236, 72, 153, 1)',
                              'rgba(239, 68, 68, 1)',
                              'rgba(245, 158, 11, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(6, 182, 212, 1)',
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = Object.values(selectedDetection.objects_detected).reduce((a, b) => a + b, 0);
                                  const value = context.raw as number;
                                  const percentage = Math.round((value / total) * 100);
                                  return `${context.label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Count'
                              }
                            },
                            x: {
                              title: {
                                display: true,
                                text: 'Object Type'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-md font-medium mb-3 text-center">Detection Percentage</h4>
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: Object.keys(selectedDetection.objects_detected),
                          datasets: [{
                            label: 'Detection Percentage',
                            data: Object.values(selectedDetection.objects_detected),
                            backgroundColor: [
                              'rgba(79, 70, 229, 0.7)',
                              'rgba(99, 102, 241, 0.7)',
                              'rgba(129, 140, 248, 0.7)',
                              'rgba(167, 139, 250, 0.7)',
                              'rgba(217, 70, 239, 0.7)',
                              'rgba(236, 72, 153, 0.7)',
                              'rgba(239, 68, 68, 0.7)',
                              'rgba(245, 158, 11, 0.7)',
                              'rgba(16, 185, 129, 0.7)',
                              'rgba(6, 182, 212, 0.7)',
                            ],
                            borderColor: [
                              'rgba(79, 70, 229, 1)',
                              'rgba(99, 102, 241, 1)',
                              'rgba(129, 140, 248, 1)',
                              'rgba(167, 139, 250, 1)',
                              'rgba(217, 70, 239, 1)',
                              'rgba(236, 72, 153, 1)',
                              'rgba(239, 68, 68, 1)',
                              'rgba(245, 158, 11, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(6, 182, 212, 1)',
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = Object.values(selectedDetection.objects_detected).reduce((a, b) => a + b, 0);
                                  const value = context.raw as number;
                                  const percentage = Math.round((value / total) * 100);
                                  return `${context.label}: ${percentage}% (${value})`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {selectedDetection.object_images?.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedDetection.object_images.map((imageUrl, index) => {
                      // Extract object type from image URL
                      const objectType = Object.keys(selectedDetection.objects_detected).find(
                        obj => imageUrl.includes(obj)
                      );
                      
                      return (
                        <div key={index} className="border rounded-lg overflow-hidden group relative">
                          <img 
                            src={`${API_BASE}${imageUrl}`} 
                            alt={`Detected object ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `${API_BASE}/results/default-object.jpg`;
                            }}
                          />
                          <div className="p-2 text-sm bg-white">
                            {objectType && (
                              <span className="flex items-center">
                                {objectIcons[objectType] || null}
                                <span className="ml-1">
                                  {objectType} ({selectedDetection.objects_detected[objectType]})
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <a 
                              href={`${API_BASE}${imageUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-white p-2 rounded-full hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiSearch className="text-gray-700" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No object images available</p>
                )}
              </div>
              
            </div>
          </div>
        )}
      </main>
      
    </div>
    
  );
}