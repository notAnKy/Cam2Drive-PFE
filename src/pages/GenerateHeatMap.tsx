import { useState, useEffect } from 'react';
import Sidebar from '../layouts/Sidebar';
import { Play, RefreshCw, Zap, XCircle, Film } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiError extends Error {
  status?: number;
  statusText?: string;
}

interface VideoOption {
  video_id: string;
  uploaded_filename: string;
}

function App() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [heatMapUrl, setHeatMapUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoOptions, setVideoOptions] = useState<VideoOption[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const backendUrl = 'http://localhost:8000'; // Your backend URL

  useEffect(() => {
    fetchVideoList();
  }, []);

  const fetchVideoList = async () => {
    setLoadingVideos(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/available-videos`); // Call the new endpoint
      if (!response.ok) {
        const errorData = await response.json();
        throw {
          message: errorData?.detail || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
        } as ApiError;
      }
      const data = await response.json();
      setVideoOptions(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(`Failed to fetch video list: ${apiError.message}`);
      console.error(apiError);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleGenerateHeatMap = async () => {
    if (!selectedVideoId.trim()) {
      setError('Please select a video.');
      return;
    }

    setGenerating(true);
    setHeatMapUrl(null);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/heat-map-video/${selectedVideoId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          message: errorData?.detail || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
        } as ApiError;
      }

      const data = await response.json();
      setHeatMapUrl(data.heat_map_video_url);
    } catch (err) {
      const apiError = err as ApiError;
      setError(`Failed to generate heat map: ${apiError.message}`);
      console.error(apiError);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-8" style={{ marginLeft: sidebarWidth }}>
        <motion.div
          className="flex flex-col items-center justify-center h-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 mb-6 flex items-center">
            <Film className="mr-2" size={24} />
            Generate Heat Map Video
          </h1>

          {error && (
            <div className="mb-4 bg-red-500/20 text-red-300 px-4 py-3 rounded-lg flex items-center">
              <XCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          <div className="mb-4 flex shadow-md rounded-lg overflow-hidden">
            <select
              className="bg-slate-800/70 text-white px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              disabled={loadingVideos || videoOptions.length === 0}
            >
              <option value="">{loadingVideos ? 'Loading Videos...' : videoOptions.length === 0 ? 'No Videos Available' : 'Select a Video'}</option>
              {videoOptions.map((video) => (
                <option key={video.video_id} value={video.video_id}>
                  {video.uploaded_filename}
                </option>
              ))}
            </select>
            <button
              className={`bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-4 py-2 transition-colors ${
                generating || loadingVideos || videoOptions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleGenerateHeatMap}
              disabled={generating || !selectedVideoId.trim() || loadingVideos || videoOptions.length === 0}
            >
              {generating ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <Zap size={18} />
              )}
              <span className="ml-2">{generating ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>

          {heatMapUrl && (
            <div className="mt-8 bg-slate-800/50 rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-teal-300 mb-4 flex items-center">
                <Play className="mr-2" size={20} />
                Generated Heat Map Video
              </h2>
              <div className="rounded-md overflow-hidden border border-slate-700">
                <video
                  src={`${backendUrl}${heatMapUrl}`}
                  controls
                  className="w-full aspect-video"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Video URL: <span className="text-indigo-300">{`${backendUrl}${heatMapUrl}`}</span>
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default App;