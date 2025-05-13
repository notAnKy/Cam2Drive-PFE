import { useState, useEffect } from 'react';
import Sidebar from '../layouts/Sidebar';
import { Camera, BarChart, Play, RefreshCw, Zap, Calendar, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Define interfaces for the API responses
interface HeatMapVideo {
  video_id: string;
  heat_map_video_url: string;
  original_video_url: string;
  heat_map_params: {
    decay_factor: number;
    intensity_scale: number;
  };
  objects_detected: {
    [key: string]: number;
  };
  timestamp: string;
  uploaded_filename: string;
}

// Custom error type for API errors
interface ApiError extends Error {
  status?: number;
  statusText?: string;
}

function HeatMapPage() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [heatMapVideos, setHeatMapVideos] = useState<HeatMapVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<HeatMapVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const backendUrl = 'http://localhost:8000'; // Define your backend URL

  // Fetch all heat map videos on component mount
  useEffect(() => {
    fetchHeatMapVideos();
  }, []);

  // Fetch selected video when selectedVideoId changes
  useEffect(() => {
    if (selectedVideoId) {
      const video = heatMapVideos.find(v => v.video_id === selectedVideoId);
      setSelectedVideo(video || null);
    } else if (heatMapVideos.length > 0) {
      // Auto-select the first video if none is selected
      setSelectedVideoId(heatMapVideos[0].video_id);
      setSelectedVideo(heatMapVideos[0]);
    }
  }, [selectedVideoId, heatMapVideos]);

  const fetchHeatMapVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${backendUrl}/heat-map-videos`);

      if (!response.ok) {
        throw {
          message: `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        } as ApiError;
      }

      const data = await response.json();
      setHeatMapVideos(data);

      // Auto-select the first video
      if (data.length > 0 && !selectedVideoId) {
        setSelectedVideoId(data[0].video_id);
        setSelectedVideo(data[0]);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(`Failed to fetch heat map videos: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateHeatMap = async (videoId: string) => {
    if (!videoId) return;

    try {
      setRegenerating(true);
      // Force regenerating the heat map with default parameters
      const response = await fetch(`${backendUrl}/heat-map-video/${videoId}?force_regenerate=true`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw {
          message: `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        } as ApiError;
      }

      const data = await response.json();

      // Refresh the video list
      fetchHeatMapVideos();

      // Update the current video with the new data
      if (data && data.heat_map_video_url) {
        setSelectedVideo(prev => {
          if (prev && prev.video_id === videoId) {
            return {
              ...prev,
              heat_map_video_url: data.heat_map_video_url
            };
          }
          return prev;
        });
      }
    } catch (err) {
      const error = err as ApiError;
      setError(`Failed to regenerate heat map: ${error.message}`);
      console.error(error);
    } finally {
      setRegenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-8" style={{ marginLeft: sidebarWidth }}>
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Surveillance Heatmap</h1>
            <p className="text-slate-400">Video activity heat map analysis</p>
          </div>
          <div className="flex space-x-4">
            <button
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              onClick={() => fetchHeatMapVideos()}
            >
              <RefreshCw size={18} />
              <span className="font-medium">Refresh</span>
            </button>
            {selectedVideoId && (
              <button
                className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center gap-2 ${regenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => selectedVideoId && regenerateHeatMap(selectedVideoId)}
                disabled={regenerating}
              >
                {regenerating ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Zap size={18} />
                )}
                <span className="font-medium">{regenerating ? 'Processing...' : 'Regenerate'}</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 text-red-300 px-4 py-3 rounded-lg flex items-center">
            <XCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Heatmap Video Display */}
          <div className="col-span-12 lg:col-span-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
            {loading ? (
              <div className="flex justify-center items-center h-[600px] bg-slate-700/50 rounded-xl">
                <div className="flex flex-col items-center">
                  <RefreshCw className="animate-spin text-indigo-400 mb-4" size={40} />
                  <p className="text-slate-300">Loading heat map videos...</p>
                </div>
              </div>
            ) : selectedVideo ? (
              <div className="relative h-[600px] bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600/30">
                <video
                  src={`${backendUrl}${selectedVideo.heat_map_video_url}`} // Construct URL with backend URL
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  poster={`${backendUrl}${selectedVideo.heat_map_video_url}?poster=true`}
                />
                <div className="absolute bottom-4 right-4 bg-slate-800/90 px-4 py-2 rounded-lg text-slate-300 text-sm">
                  Heat Map Analysis · {selectedVideo.uploaded_filename}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[600px] bg-slate-700/50 rounded-xl">
                <div className="text-center">
                  <Camera className="mx-auto text-slate-500 mb-4" size={48} />
                  <p className="text-slate-400">No heat map videos available</p>
                  <button
                    className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors"
                    onClick={fetchHeatMapVideos}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {selectedVideo && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-slate-800/70 rounded-xl p-4">
                  <h3 className="text-slate-300 text-sm font-medium mb-1">Heat Intensity</h3>
                  <p className="text-white text-xl font-semibold">
                    {selectedVideo.heat_map_params?.intensity_scale || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/70 rounded-xl p-4">
                  <h3 className="text-slate-300 text-sm font-medium mb-1">Decay Factor</h3>
                  <p className="text-white text-xl font-semibold">
                    {selectedVideo.heat_map_params?.decay_factor || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-800/70 rounded-xl p-4">
                  <h3 className="text-slate-300 text-sm font-medium mb-1">Objects Detected</h3>
                  <p className="text-white text-xl font-semibold">
                    {selectedVideo.objects_detected ?
                      Object.values(selectedVideo.objects_detected).reduce((a, b) => a + b, 0) :
                      'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Selection */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl h-full">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <BarChart className="text-indigo-400" />
                Heat Map Videos
              </h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="animate-spin text-indigo-400" size={30} />
                </div>
              ) : heatMapVideos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No heat map videos available</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {heatMapVideos.map((video) => (
                    <motion.div
                      key={video.video_id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedVideoId === video.video_id
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                      }`}
                      onClick={() => setSelectedVideoId(video.video_id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium flex items-center">
                          <Play size={16} className="mr-2 opacity-80" />
                          {video.uploaded_filename.length > 20
                            ? video.uploaded_filename.substring(0, 20) + '...'
                            : video.uploaded_filename}
                        </div>
                        <div className="text-xs opacity-70 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(video.timestamp)}
                        </div>
                      </div>

                      <div className="text-xs opacity-80 mt-2">
                        {Object.entries(video.objects_detected || {}).map(([obj, count]) => (
                          <span key={obj} className="inline-block bg-slate-800/50 rounded-full px-2 py-1 mr-1 mb-1">
                            {obj}: {count}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display metadata for selected video */}
        {selectedVideo && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Video Analysis Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <h3 className="text-slate-400 text-sm">Video ID</h3>
                <p className="text-white font-mono text-sm mt-1 break-all">{selectedVideo.video_id}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <h3 className="text-slate-400 text-sm">Upload Time</h3>
                <p className="text-white text-sm mt-1">{formatDate(selectedVideo.timestamp)}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <h3 className="text-slate-400 text-sm">Heat Map Parameters</h3>
                <p className="text-white text-sm mt-1">
                  Decay: {selectedVideo.heat_map_params?.decay_factor || 'N/A'},
                  Intensity: {selectedVideo.heat_map_params?.intensity_scale || 'N/A'}
                </p>
              </div>
              
            </div>

            <div className="mt-4 bg-slate-700/50 p-4 rounded-xl">
              <h3 className="text-slate-400 text-sm mb-2">Detected Objects</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedVideo.objects_detected || {}).map(([obj, count]) => (
                  <div key={obj} className="bg-slate-800/70 px-3 py-2 rounded-lg text-white">
                    <span className="font-medium">{obj}</span>
                    <span className="ml-2 bg-indigo-500/30 text-indigo-200 rounded-full px-2 py-0.5 text-xs">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HeatMapPage;