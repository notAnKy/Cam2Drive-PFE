import { useState, useRef } from 'react';
import Sidebar from '../layouts/Sidebar';
import axios from 'axios';

interface DetectionResult {
  video_result_url: string;
  objects_detected: Record<string, number>;
  object_images: string[];
}

function PredictVideo() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Base URL for API requests
  const API_BASE_URL = 'http://localhost:8000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid video file (MP4, AVI, MOV)');
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size too large (max 50MB)');
        return;
      }

      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict-video`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Ensure all paths are properly formatted
      const processedResult = {
        ...response.data,
        video_result_url: response.data.video_result_url.startsWith('/') 
          ? response.data.video_result_url 
          : `/${response.data.video_result_url}`,
        object_images: response.data.object_images.map((img: string) => 
          img.startsWith('/') ? img : `/${img}`
        )
      };

      setResult(processedResult);
    } catch (err) {
        console.error('Error uploading video:', err);
      
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to process video. Please try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-900">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-6 md:p-8" style={{ marginLeft: sidebarWidth }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center drop-shadow-lg">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Video Object Detection
            </span>
          </h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-4">
                  <label className="block text-white text-lg font-semibold mb-3" htmlFor="video">
                    Upload Video
                  </label>
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition duration-300">
                    <input
                      ref={fileInputRef}
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="video" 
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <svg className="w-12 h-12 text-blue-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-blue-100 font-medium">Click to select or drop video file</span>
                      <p className="mt-2 text-sm text-blue-200">
                        Supported formats: MP4, AVI, MOV (max 50MB)
                      </p>
                    </label>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-blue-800/40 rounded-xl p-4 border border-blue-700/50">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-blue-100 font-medium truncate max-w-sm">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-blue-300">
                          Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={!selectedFile || isProcessing}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-medium transition-all duration-300 shadow-lg ${
                      !selectedFile || isProcessing
                        ? 'bg-blue-500/50 cursor-not-allowed'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Detect Objects
                      </span>
                    )}
                  </button>

                  {selectedFile && !isProcessing && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto px-8 py-3 border border-blue-400 rounded-xl text-blue-100 font-medium hover:bg-blue-800/30 transition-all duration-300"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                      </span>
                    </button>
                  )}
                </div>

                {isProcessing && (
                  <div className="mt-6">
                    <div className="w-full bg-blue-800/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-center text-blue-200">
                      {progress < 100 ? `Uploading: ${progress}%` : 'Processing video...'}
                    </p>
                  </div>
                )}
              </form>
            ) : (
              <div className="text-white">
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
                    <h2 className="text-2xl font-bold text-blue-100">Detection Results</h2>
                    <span className="bg-blue-700/70 text-blue-100 px-4 py-2 rounded-full font-medium text-sm inline-flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Object.values(result.objects_detected).reduce((a, b) => a + b, 0)} objects detected
                    </span>
                  </div>
                  <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-xl border border-blue-700/50">
                    <video
                      controls
                      className="absolute top-0 left-0 w-full h-full"
                    >
                      <source src={`${API_BASE_URL}${result.video_result_url}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Detection Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(result.objects_detected).map(([object, count]) => (
                      <div
                        key={object}
                        className="bg-gradient-to-br from-blue-700/60 to-blue-800/60 rounded-xl p-4 flex flex-col items-center justify-center border border-blue-600/30 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg"
                      >
                        <span className="text-blue-100 font-bold capitalize text-lg">{object}</span>
                        <span className="text-blue-300 mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          {count} detected
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.object_images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Detected Objects
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {result.object_images.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          className="border border-blue-600/30 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 bg-blue-800/30"
                        >
                          <div className="relative pt-[100%]">
                            <img
                              src={`${API_BASE_URL}${imageUrl}`}
                              alt={`Detected object ${index + 1}`}
                              className="absolute top-0 left-0 w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                (e.target as HTMLImageElement).className = 'absolute top-0 left-0 w-full h-full object-contain p-2';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Analyze Another Video
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 text-red-100 rounded-xl flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PredictVideo;