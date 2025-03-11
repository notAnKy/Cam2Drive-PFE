import { useState } from 'react';
import Sidebar from '../layouts/Sidebar';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [sidebarWidth, setSidebarWidth] = useState("16rem");
  const [selectedCamera, setSelectedCamera] = useState(1);

  const heatmapPoints = [
    { x: 20, y: 30, intensity: 0.8 },
    { x: 60, y: 40, intensity: 0.6 },
    { x: 40, y: 70, intensity: 0.9 },
    { x: 80, y: 50, intensity: 0.4 },
    { x: 30, y: 50, intensity: 0.7 },
    { x: 70, y: 30, intensity: 0.5 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-8" style={{ marginLeft: sidebarWidth }}>
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Surveillance Heatmap</h1>
            <p className="text-slate-400">Real-time activity monitoring dashboard</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <span className="font-medium">Export Data</span>
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center gap-2">
              <span className="font-medium">Live View</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Heatmap View */}
          <div className="col-span-12 lg:col-span-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
            <div className="relative h-[600px] bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600/30">
              {/* Simulated heatmap points */}
              {heatmapPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1]
                  }}
                  transition={{ 
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute w-24 h-24 rounded-full"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    background: `radial-gradient(circle, rgba(129,140,248,${point.intensity}) 0%, rgba(99,102,241,0) 70%)`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(2px)',
                  }}
                />
              ))}
              <div className="absolute bottom-4 right-4 bg-slate-800/90 px-4 py-2 rounded-lg text-slate-300 text-sm">
                Live Feed · Camera {selectedCamera}
              </div>
            </div>
          </div>

          {/* Camera Selection */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl h-full">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <Camera className="text-indigo-400" />
                Camera Selection
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((cam) => (
                  <motion.button
                    key={cam}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-6 rounded-xl transition-all duration-200 ${
                      selectedCamera === cam
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                    }`}
                    onClick={() => setSelectedCamera(cam)}
                  >
                    <div className="text-center">
                      <div className="font-medium mb-1">Camera {cam}</div>
                      <div className="text-xs opacity-70">Floor {Math.ceil(cam/2)}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;