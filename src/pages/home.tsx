import { useState } from 'react';
import { 
  Camera, 
  Car, 
  Users, 
  Map, 
  BarChart2, 
  Shield 
} from 'lucide-react';
import { motion } from 'framer-motion';

import Sidebar from '../layouts/Sidebar';

function App() {
  // Define sidebar width state
  const [sidebarWidth, setSidebarWidth] = useState("16rem");

  const features = [
    {
      title: "License Plate Recognition",
      description: "System for detecting and analyzing vehicle license plates",
      icon: Car,
      color: "bg-blue-500"
    },
    {
      title: "People Counting",
      description: "Real-time people counting and flow analysis",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Heat Map Analysis",
      description: "Visual representation of high-traffic areas and movement patterns",
      icon: Map,
      color: "bg-purple-500"
    },
    {
      title: "Daily Summary",
      description: "Comprehensive daily reports and analytics for each video channel",
      icon: BarChart2,
      color: "bg-orange-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-8 overflow-y-auto" style={{ marginLeft: sidebarWidth }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Camera className="w-16 h-16 mx-auto text-indigo-600" />
            </motion.div>
            <h1 className="text-5xl font-bold text-indigo-900 mb-4">
              Cam2Drive Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Video Analytics Platform
            </p>
          </div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 bg-white rounded-xl shadow-lg p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">Real-time</div>
                <div className="text-gray-600">Processing</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">Video</div>
                <div className="text-gray-600">Analytics</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">Advanced</div>
                <div className="text-gray-600">Reporting</div>
              </div>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center text-gray-600 flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            <span>Enterprise-grade security and reliability</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
