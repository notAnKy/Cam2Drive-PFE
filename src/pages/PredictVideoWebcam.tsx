import { useState, useRef } from 'react';
import Sidebar from '../layouts/Sidebar';

function PredictVideoWebcam() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<{ [key: string]: number }>({});
  const [objectImages, setObjectImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLive, setShowLive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/start-webcam-stream', {
        method: 'POST',
      });

      if (response.ok) {
        setIsRecording(true);
        setVideoUrl(null);
        setDetectedObjects({});
        setObjectImages([]);
        setShowLive(true);
      } else {
        const errorText = await response.text();
        console.error('Failed to start recording:', errorText);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/stop-webcam-stream', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsRecording(false);
        setVideoUrl(data.video_result_url);
        setDetectedObjects(data.objects_detected);
        setObjectImages(data.object_images);
        setShowLive(false);
      } else {
        const errorText = await response.text();
        console.error('Failed to stop recording:', errorText);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-900">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-6" style={{ marginLeft: sidebarWidth }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Object Detection
            </span>
          </h1>

          <div className="bg-blue-800/40 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-8 border border-blue-600/30">
            <div className="flex justify-center space-x-6 mb-8">
              <button
                onClick={startRecording}
                disabled={isRecording || loading}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg ${
                  isRecording || loading 
                    ? 'bg-gray-500/50 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/20'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Start Detection'}
              </button>
              <button
                onClick={stopRecording}
                disabled={!isRecording || loading}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg ${
                  !isRecording || loading 
                    ? 'bg-gray-500/50 cursor-not-allowed' 
                    : 'bg-rose-500 hover:bg-rose-600 hover:shadow-rose-500/20'
                }`}
              >
                Stop Detection
              </button>
            </div>

            {showLive && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Live Detection</h2>
                <div className="rounded-lg overflow-hidden shadow-xl border-2 border-blue-500/30">
                  <img
                    src="http://localhost:8000/video_feed"
                    alt="Live stream"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {videoUrl && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Processed Video</h2>
                <div className="rounded-lg overflow-hidden shadow-xl border-2 border-blue-500/30">
                  <video ref={videoRef} controls className="w-full">
                    <source src={`http://localhost:8000${videoUrl}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {Object.keys(detectedObjects).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Detected Objects</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(detectedObjects).map(([object, count]) => (
                    <div key={object} className="bg-blue-700/50 p-4 rounded-lg shadow-lg border border-blue-500/30 transition-transform hover:scale-105">
                      <p className="font-semibold text-lg capitalize text-white">{object}</p>
                      <p className="text-cyan-200 font-medium">Count: {count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {objectImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Captured Objects</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {objectImages.map((imageUrl, index) => (
                    <div key={index} className="border-2 border-blue-500/30 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                      <img
                        src={`http://localhost:8000${imageUrl}`}
                        alt={`Detected object ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PredictVideoWebcam;