import { useState, useRef } from 'react';
import Sidebar from '../layouts/Sidebar';

function PredictVideoCamera1() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [isRecordingCamera1, setIsRecordingCamera1] = useState(false);
  const [videoUrlCamera1, setVideoUrlCamera1] = useState<string | null>(null);
  const [detectedObjectsCamera1, setDetectedObjectsCamera1] = useState<{ [key: string]: number }>({});
  const [objectImagesCamera1, setObjectImagesCamera1] = useState<string[]>([]);
  const [loadingCamera1, setLoadingCamera1] = useState(false);
  const [ipCameraUrl, setIpCameraUrl] = useState("http://192.168.1.13:8080/video"); // Default IP
  const [liveStreamUrlCamera1, setLiveStreamUrlCamera1] = useState<string | null>(null);
  const [camera1Error, setCamera1Error] = useState<string | null>(null);

  const videoRefCamera1 = useRef<HTMLVideoElement>(null);

  const startRecordingCamera1 = async () => {
    setLoadingCamera1(true);
    setCamera1Error(null);
    try {
      const formData = new FormData();
      formData.append('ip_camera_url', ipCameraUrl);

      const response = await fetch('http://localhost:8000/start-camera1-stream', {
        method: 'POST',
        body: formData, // Send IP camera URL as form data
      });

      if (response.ok) {
        setIsRecordingCamera1(true);
        setVideoUrlCamera1(null);
        setDetectedObjectsCamera1({});
        setObjectImagesCamera1([]);
        // ALSO set the live stream URL to the browserfs.html page
        setLiveStreamUrlCamera1("http://192.168.1.13:8080/browserfs.html");
      } else {
        const errorText = await response.text();
        console.error('Failed to start recording from Camera 1:', errorText);
        setCamera1Error(errorText);
        setIsRecordingCamera1(false);
        setLiveStreamUrlCamera1(null); // Clear browserfs URL on error
      }
    } catch (error) {
      console.error('Error starting recording from Camera 1:', error);
      setCamera1Error('Failed to connect to the server.');
      setIsRecordingCamera1(false);
      setLiveStreamUrlCamera1(null); // Clear browserfs URL on error
    } finally {
      setLoadingCamera1(false);
    }
  };

  const stopRecordingCamera1 = async () => {
    setLoadingCamera1(true);
    setCamera1Error(null);
    try {
      const response = await fetch('http://localhost:8000/stop-camera1-stream', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsRecordingCamera1(false);
        setVideoUrlCamera1(data.video_result_url);
        setDetectedObjectsCamera1(data.objects_detected);
        setObjectImagesCamera1(data.object_images);
        setCamera1Error(null);
        setLiveStreamUrlCamera1(null); // Clear the browserfs URL on stop
      } else {
        const errorText = await response.text();
        console.error('Failed to stop recording from Camera 1:', errorText);
        setCamera1Error(errorText);
      }
    } catch (error) {
      console.error('Error stopping recording from Camera 1:', error);
      setCamera1Error('Failed to connect to the server while stopping.');
    } finally {
      setLoadingCamera1(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-900">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-6" style={{ marginLeft: sidebarWidth }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Camera 1 Object Detection
            </span>
          </h1>

          <div className="bg-blue-800/40 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-8 border border-blue-600/30">
            <div className="mb-4">
              <label htmlFor="ipCameraUrl" className="block text-white text-sm font-bold mb-2">
                IP Camera URL:
              </label>
              <input
                type="text"
                id="ipCameraUrl"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-blue-700/50 text-white"
                value={ipCameraUrl}
                onChange={(e) => setIpCameraUrl(e.target.value)}
              />
            </div>
            <div className="flex justify-center space-x-6 mb-8">
              <button
                onClick={startRecordingCamera1}
                disabled={isRecordingCamera1 || loadingCamera1}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg ${
                  isRecordingCamera1 || loadingCamera1
                    ? 'bg-gray-500/50 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/20'
                }`}
              >
                {loadingCamera1 ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : 'Start Camera 1 Detection'}
              </button>
              <button
                onClick={stopRecordingCamera1}
                disabled={!isRecordingCamera1 || loadingCamera1}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg ${
                  !isRecordingCamera1 || loadingCamera1
                    ? 'bg-gray-500/50 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-600 hover:shadow-rose-500/20'
                }`}
              >
                Stop Camera 1 Detection
              </button>
            </div>

            {camera1Error && (
              <div className="bg-red-200 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Error</p>
                <p>{camera1Error}</p>
              </div>
            )}

            {liveStreamUrlCamera1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Live View (Camera 1)</h2>
                <div className="rounded-lg overflow-hidden shadow-xl border-2 border-blue-500/30">
                  {/* Use an iframe to embed the browserfs.html page */}
                  <iframe src={liveStreamUrlCamera1} width="100%" height="480px" frameBorder="0" title="Camera 1 Live Feed" />
                </div>
              </div>
            )}

            {videoUrlCamera1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Processed Video (Camera 1)</h2>
                <div className="rounded-lg overflow-hidden shadow-xl border-2 border-blue-500/30">
                  <video ref={videoRefCamera1} controls className="w-full">
                    <source src={`http://localhost:8000${videoUrlCamera1}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {Object.keys(detectedObjectsCamera1).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Detected Objects (Camera 1)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(detectedObjectsCamera1).map(([object, count]) => (
                    <div key={object} className="bg-blue-700/50 p-4 rounded-lg shadow-lg border border-blue-500/30 transition-transform hover:scale-105">
                      <p className="font-semibold text-lg capitalize text-white">{object}</p>
                      <p className="text-cyan-200 font-medium">Count: {count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {objectImagesCamera1.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Captured Objects (Camera 1)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {objectImagesCamera1.map((imageUrl, index) => (
                    <div key={index} className="border-2 border-blue-500/30 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                      <img
                        src={`http://localhost:8000${imageUrl}`}
                        alt={`Detected object ${index + 1} from Camera 1`}
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

export default PredictVideoCamera1;